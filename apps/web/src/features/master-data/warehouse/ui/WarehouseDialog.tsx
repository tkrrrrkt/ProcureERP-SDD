'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/components/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/components/alert-dialog';
import { Button } from '@/shared/ui/components/button';
import { Input } from '@/shared/ui/components/input';
import { Label } from '@/shared/ui/components/label';
import { Textarea } from '@/shared/ui/components/textarea';
import { Switch } from '@/shared/ui/components/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/components/select';
import { Loader2, Star } from 'lucide-react';
import { useWarehouse } from '../hooks/useWarehouseList';
import { useWarehouseForm } from '../hooks/useWarehouseForm';
import type { CreateWarehouseRequest, UpdateWarehouseRequest } from '../types';
import { prefectureOptions } from '../types';

interface FormData {
  warehouseCode: string;
  warehouseName: string;
  warehouseNameKana: string;
  postalCode: string;
  prefecture: string;
  city: string;
  address1: string;
  address2: string;
  phoneNumber: string;
  displayOrder: number;
  notes: string;
  isActive: boolean;
}

interface WarehouseDialogProps {
  mode: 'create' | 'edit';
  warehouseId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

/**
 * 倉庫登録/編集ダイアログ
 *
 * - 新規登録モード: 全フィールド入力可能
 * - 編集モード: コードは編集不可、無効化/再有効化/既定設定ボタン表示
 * - 競合エラー時は再読み込みダイアログ表示
 * - 既定受入倉庫の無効化防止
 */
export function WarehouseDialog({
  mode,
  warehouseId,
  open,
  onOpenChange,
  onSuccess,
}: WarehouseDialogProps) {
  const { warehouse, isLoading: isLoadingWarehouse, refetch: refetchWarehouse } = useWarehouse(
    mode === 'edit' ? warehouseId : null
  );
  const {
    isSubmitting,
    error,
    createWarehouse,
    updateWarehouse,
    deactivateWarehouse,
    activateWarehouse,
    setDefaultReceivingWarehouse,
    getErrorMessage,
    clearError,
  } = useWarehouseForm();

  const [showConcurrentDialog, setShowConcurrentDialog] = useState(false);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [showSetDefaultDialog, setShowSetDefaultDialog] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      warehouseCode: '',
      warehouseName: '',
      warehouseNameKana: '',
      postalCode: '',
      prefecture: '',
      city: '',
      address1: '',
      address2: '',
      phoneNumber: '',
      displayOrder: 1000,
      notes: '',
      isActive: true,
    },
  });

  const isActive = watch('isActive');
  const prefecture = watch('prefecture');

  // 編集時にデータをフォームに反映
  useEffect(() => {
    if (mode === 'edit' && warehouse) {
      reset({
        warehouseCode: warehouse.warehouseCode,
        warehouseName: warehouse.warehouseName,
        warehouseNameKana: warehouse.warehouseNameKana ?? '',
        postalCode: warehouse.postalCode ?? '',
        prefecture: warehouse.prefecture ?? '',
        city: warehouse.city ?? '',
        address1: warehouse.address1 ?? '',
        address2: warehouse.address2 ?? '',
        phoneNumber: warehouse.phoneNumber ?? '',
        displayOrder: warehouse.displayOrder,
        notes: warehouse.notes ?? '',
        isActive: warehouse.isActive,
      });
    } else if (mode === 'create') {
      reset({
        warehouseCode: '',
        warehouseName: '',
        warehouseNameKana: '',
        postalCode: '',
        prefecture: '',
        city: '',
        address1: '',
        address2: '',
        phoneNumber: '',
        displayOrder: 1000,
        notes: '',
        isActive: true,
      });
    }
  }, [mode, warehouse, reset]);

  // エラーコードの監視
  useEffect(() => {
    if (error?.code === 'CONCURRENT_UPDATE') {
      setShowConcurrentDialog(true);
    }
  }, [error]);

  const onSubmit = async (data: FormData) => {
    clearError();

    try {
      if (mode === 'create') {
        const request: CreateWarehouseRequest = {
          warehouseCode: data.warehouseCode.toUpperCase(),
          warehouseName: data.warehouseName,
          warehouseNameKana: data.warehouseNameKana || undefined,
          postalCode: data.postalCode || undefined,
          prefecture: data.prefecture || undefined,
          city: data.city || undefined,
          address1: data.address1 || undefined,
          address2: data.address2 || undefined,
          phoneNumber: data.phoneNumber || undefined,
          displayOrder: data.displayOrder,
          notes: data.notes || undefined,
          isActive: data.isActive,
        };
        await createWarehouse(request);
      } else if (warehouse) {
        const request: UpdateWarehouseRequest = {
          warehouseName: data.warehouseName,
          warehouseNameKana: data.warehouseNameKana || undefined,
          postalCode: data.postalCode || undefined,
          prefecture: data.prefecture || undefined,
          city: data.city || undefined,
          address1: data.address1 || undefined,
          address2: data.address2 || undefined,
          phoneNumber: data.phoneNumber || undefined,
          isDefaultReceiving: warehouse.isDefaultReceiving, // Keep current value
          displayOrder: data.displayOrder,
          notes: data.notes || undefined,
          isActive: data.isActive,
          version: warehouse.version,
        };
        await updateWarehouse(warehouse.id, request);
      }
      onSuccess();
      onOpenChange(false);
    } catch {
      // エラーは useWarehouseForm で処理される
    }
  };

  const handleStatusToggle = async () => {
    if (!warehouse) return;

    if (warehouse.isActive) {
      setShowDeactivateDialog(true);
    } else {
      try {
        await activateWarehouse(warehouse);
        onSuccess();
        await refetchWarehouse();
      } catch {
        // エラーは useWarehouseForm で処理される
      }
    }
  };

  const handleDeactivateConfirm = async () => {
    if (!warehouse) return;
    setShowDeactivateDialog(false);
    try {
      await deactivateWarehouse(warehouse);
      onSuccess();
      await refetchWarehouse();
    } catch {
      // エラーは useWarehouseForm で処理される
    }
  };

  const handleSetDefaultReceiving = async () => {
    if (!warehouse) return;
    setShowSetDefaultDialog(true);
  };

  const handleSetDefaultConfirm = async () => {
    if (!warehouse) return;
    setShowSetDefaultDialog(false);
    try {
      await setDefaultReceivingWarehouse(warehouse);
      onSuccess();
      await refetchWarehouse();
    } catch {
      // エラーは useWarehouseForm で処理される
    }
  };

  const handleConcurrentReload = async () => {
    setShowConcurrentDialog(false);
    clearError();
    await refetchWarehouse();
  };

  const isEditing = mode === 'edit';
  const title = isEditing ? '倉庫の編集' : '新規倉庫の登録';
  const description = isEditing
    ? '倉庫情報を編集できます。コードは変更できません。'
    : '新しい倉庫を登録します。';

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          {isEditing && isLoadingWarehouse ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* 基本情報 */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground">基本情報</h3>

                <div className="grid gap-4 grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="warehouseCode">
                      倉庫コード <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="warehouseCode"
                      {...register('warehouseCode', {
                        required: '倉庫コードは必須です',
                        pattern: {
                          value: /^[A-Za-z0-9]{1,10}$/,
                          message: '10文字以内の英数字で入力してください',
                        },
                      })}
                      placeholder="WH001"
                      disabled={isEditing}
                      className={`font-mono uppercase ${errors.warehouseCode ? 'border-destructive' : ''}`}
                    />
                    {errors.warehouseCode && (
                      <p className="text-sm text-destructive">{errors.warehouseCode.message}</p>
                    )}
                  </div>

                  <div className="flex items-center space-x-4 pt-8">
                    <Switch
                      id="isActive"
                      checked={isActive}
                      onCheckedChange={(checked) => setValue('isActive', checked)}
                    />
                    <Label htmlFor="isActive">有効</Label>
                    {isEditing && warehouse?.isDefaultReceiving && (
                      <span className="text-sm text-primary font-medium flex items-center gap-1">
                        <Star className="h-4 w-4" />
                        既定受入倉庫
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="warehouseName">
                      名称 <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="warehouseName"
                      {...register('warehouseName', {
                        required: '名称は必須です',
                        maxLength: { value: 100, message: '100文字以内で入力してください' },
                      })}
                      placeholder="東京本社倉庫"
                      className={errors.warehouseName ? 'border-destructive' : ''}
                    />
                    {errors.warehouseName && (
                      <p className="text-sm text-destructive">{errors.warehouseName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="warehouseNameKana">名称カナ</Label>
                    <Input
                      id="warehouseNameKana"
                      {...register('warehouseNameKana', {
                        maxLength: { value: 200, message: '200文字以内で入力してください' },
                      })}
                      placeholder="トウキョウホンシャソウコ"
                      className={errors.warehouseNameKana ? 'border-destructive' : ''}
                    />
                    {errors.warehouseNameKana && (
                      <p className="text-sm text-destructive">{errors.warehouseNameKana.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2 max-w-[calc(50%-0.5rem)]">
                  <Label htmlFor="displayOrder">表示順</Label>
                  <Input
                    id="displayOrder"
                    type="number"
                    {...register('displayOrder', {
                      valueAsNumber: true,
                      min: { value: 0, message: '0以上の数値を入力してください' },
                    })}
                    placeholder="1000"
                  />
                </div>
              </div>

              {/* 住所・連絡先 */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground">住所・連絡先</h3>

                <div className="grid gap-4 grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">郵便番号</Label>
                    <Input
                      id="postalCode"
                      {...register('postalCode')}
                      placeholder="100-0001"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prefecture">都道府県</Label>
                    <Select
                      value={prefecture}
                      onValueChange={(value) => setValue('prefecture', value === '__none__' ? '' : value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="選択してください" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">未選択</SelectItem>
                        {prefectureOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="city">市区町村</Label>
                    <Input
                      id="city"
                      {...register('city', {
                        maxLength: { value: 50, message: '50文字以内で入力してください' },
                      })}
                      placeholder="千代田区"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address1">住所1</Label>
                    <Input
                      id="address1"
                      {...register('address1', {
                        maxLength: { value: 100, message: '100文字以内で入力してください' },
                      })}
                      placeholder="丸の内1-1-1"
                    />
                  </div>
                </div>

                <div className="grid gap-4 grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="address2">住所2</Label>
                    <Input
                      id="address2"
                      {...register('address2', {
                        maxLength: { value: 100, message: '100文字以内で入力してください' },
                      })}
                      placeholder="丸の内ビル B1F"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">電話番号</Label>
                    <Input
                      id="phoneNumber"
                      {...register('phoneNumber')}
                      placeholder="03-1234-5678"
                    />
                  </div>
                </div>
              </div>

              {/* 備考 */}
              <div className="space-y-2">
                <Label htmlFor="notes">備考</Label>
                <Textarea
                  id="notes"
                  {...register('notes')}
                  placeholder="備考を入力..."
                  rows={3}
                />
              </div>

              {/* エラー表示 */}
              {error && error.code !== 'CONCURRENT_UPDATE' && (
                <div className="rounded-md border border-destructive bg-destructive/10 p-3">
                  <p className="text-sm text-destructive">{getErrorMessage(error.code)}</p>
                </div>
              )}

              <DialogFooter className="flex-col gap-2 sm:flex-row">
                {isEditing && warehouse && (
                  <div className="flex gap-2 sm:mr-auto">
                    <Button
                      type="button"
                      variant={warehouse.isActive ? 'destructive' : 'outline'}
                      onClick={handleStatusToggle}
                      disabled={isSubmitting}
                    >
                      {warehouse.isActive ? '無効化' : '再有効化'}
                    </Button>
                    {warehouse.isActive && !warehouse.isDefaultReceiving && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleSetDefaultReceiving}
                        disabled={isSubmitting}
                      >
                        <Star className="mr-2 h-4 w-4" />
                        既定に設定
                      </Button>
                    )}
                  </div>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  キャンセル
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEditing ? '更新' : '登録'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* 無効化確認ダイアログ */}
      <AlertDialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>倉庫を無効化しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              {warehouse?.isDefaultReceiving
                ? 'この倉庫は既定受入倉庫です。無効化するには、先に別の倉庫を既定に設定してください。'
                : 'この倉庫を無効化すると、発注時に選択できなくなります。後で再有効化することができます。'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            {!warehouse?.isDefaultReceiving && (
              <AlertDialogAction
                onClick={handleDeactivateConfirm}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                無効化
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 既定受入倉庫設定確認ダイアログ */}
      <AlertDialog open={showSetDefaultDialog} onOpenChange={setShowSetDefaultDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>既定受入倉庫に設定しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              この倉庫を既定受入倉庫に設定すると、現在の既定倉庫は自動的に解除されます。
              既定受入倉庫は発注時のデフォルト納入先として使用されます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleSetDefaultConfirm}>
              設定する
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 競合エラーダイアログ */}
      <AlertDialog open={showConcurrentDialog} onOpenChange={setShowConcurrentDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>更新の競合</AlertDialogTitle>
            <AlertDialogDescription>
              他のユーザーによってこのデータが更新されました。
              最新のデータを読み込み直しますか？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowConcurrentDialog(false)}>
              キャンセル
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConcurrentReload}>
              再読み込み
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
