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
import { Loader2 } from 'lucide-react';
import { useShipTo } from '../hooks/useShipToList';
import { useShipToForm } from '../hooks/useShipToForm';
import type { CreateShipToRequest, UpdateShipToRequest } from '../types';
import { prefectureOptions } from '../types';

interface FormData {
  shipToCode: string;
  shipToName: string;
  shipToNameKana: string;
  postalCode: string;
  prefecture: string;
  city: string;
  address1: string;
  address2: string;
  phoneNumber: string;
  faxNumber: string;
  email: string;
  contactPerson: string;
  remarks: string;
  isActive: boolean;
}

interface ShipToDialogProps {
  mode: 'create' | 'edit';
  shipToId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

/**
 * 納入先登録/編集ダイアログ
 *
 * - 新規登録モード: 全フィールド入力可能
 * - 編集モード: コードは編集不可、無効化/再有効化ボタン表示
 * - 競合エラー時は再読み込みダイアログ表示
 */
export function ShipToDialog({
  mode,
  shipToId,
  open,
  onOpenChange,
  onSuccess,
}: ShipToDialogProps) {
  const { shipTo, isLoading: isLoadingShipTo, refetch: refetchShipTo } = useShipTo(
    mode === 'edit' ? shipToId : null
  );
  const {
    isSubmitting,
    error,
    createShipTo,
    updateShipTo,
    deactivateShipTo,
    activateShipTo,
    getErrorMessage,
    clearError,
  } = useShipToForm();

  const [showConcurrentDialog, setShowConcurrentDialog] = useState(false);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      shipToCode: '',
      shipToName: '',
      shipToNameKana: '',
      postalCode: '',
      prefecture: '',
      city: '',
      address1: '',
      address2: '',
      phoneNumber: '',
      faxNumber: '',
      email: '',
      contactPerson: '',
      remarks: '',
      isActive: true,
    },
  });

  const isActive = watch('isActive');
  const prefecture = watch('prefecture');

  // 編集時にデータをフォームに反映
  useEffect(() => {
    if (mode === 'edit' && shipTo) {
      reset({
        shipToCode: shipTo.shipToCode,
        shipToName: shipTo.shipToName,
        shipToNameKana: shipTo.shipToNameKana ?? '',
        postalCode: shipTo.postalCode ?? '',
        prefecture: shipTo.prefecture ?? '',
        city: shipTo.city ?? '',
        address1: shipTo.address1 ?? '',
        address2: shipTo.address2 ?? '',
        phoneNumber: shipTo.phoneNumber ?? '',
        faxNumber: shipTo.faxNumber ?? '',
        email: shipTo.email ?? '',
        contactPerson: shipTo.contactPerson ?? '',
        remarks: shipTo.remarks ?? '',
        isActive: shipTo.isActive,
      });
    } else if (mode === 'create') {
      reset({
        shipToCode: '',
        shipToName: '',
        shipToNameKana: '',
        postalCode: '',
        prefecture: '',
        city: '',
        address1: '',
        address2: '',
        phoneNumber: '',
        faxNumber: '',
        email: '',
        contactPerson: '',
        remarks: '',
        isActive: true,
      });
    }
  }, [mode, shipTo, reset]);

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
        const request: CreateShipToRequest = {
          shipToCode: data.shipToCode.toUpperCase(),
          shipToName: data.shipToName,
          shipToNameKana: data.shipToNameKana || undefined,
          postalCode: data.postalCode || undefined,
          prefecture: data.prefecture || undefined,
          city: data.city || undefined,
          address1: data.address1 || undefined,
          address2: data.address2 || undefined,
          phoneNumber: data.phoneNumber || undefined,
          faxNumber: data.faxNumber || undefined,
          email: data.email || undefined,
          contactPerson: data.contactPerson || undefined,
          remarks: data.remarks || undefined,
          isActive: data.isActive,
        };
        await createShipTo(request);
      } else if (shipTo) {
        const request: UpdateShipToRequest = {
          shipToName: data.shipToName,
          shipToNameKana: data.shipToNameKana || undefined,
          postalCode: data.postalCode || undefined,
          prefecture: data.prefecture || undefined,
          city: data.city || undefined,
          address1: data.address1 || undefined,
          address2: data.address2 || undefined,
          phoneNumber: data.phoneNumber || undefined,
          faxNumber: data.faxNumber || undefined,
          email: data.email || undefined,
          contactPerson: data.contactPerson || undefined,
          remarks: data.remarks || undefined,
          isActive: data.isActive,
          version: shipTo.version,
        };
        await updateShipTo(shipTo.id, request);
      }
      onSuccess();
      onOpenChange(false);
    } catch {
      // エラーは useShipToForm で処理される
    }
  };

  const handleStatusToggle = async () => {
    if (!shipTo) return;

    if (shipTo.isActive) {
      setShowDeactivateDialog(true);
    } else {
      try {
        await activateShipTo(shipTo);
        onSuccess();
        await refetchShipTo();
      } catch {
        // エラーは useShipToForm で処理される
      }
    }
  };

  const handleDeactivateConfirm = async () => {
    if (!shipTo) return;
    setShowDeactivateDialog(false);
    try {
      await deactivateShipTo(shipTo);
      onSuccess();
      await refetchShipTo();
    } catch {
      // エラーは useShipToForm で処理される
    }
  };

  const handleConcurrentReload = async () => {
    setShowConcurrentDialog(false);
    clearError();
    await refetchShipTo();
  };

  const isEditing = mode === 'edit';
  const title = isEditing ? '納入先の編集' : '新規納入先の登録';
  const description = isEditing
    ? '納入先情報を編集できます。コードは変更できません。'
    : '新しい納入先を登録します。';

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          {isEditing && isLoadingShipTo ? (
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
                    <Label htmlFor="shipToCode">
                      納入先コード <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="shipToCode"
                      {...register('shipToCode', {
                        required: '納入先コードは必須です',
                        pattern: {
                          value: /^[A-Za-z0-9]{10}$/,
                          message: '10桁の英数字で入力してください',
                        },
                      })}
                      placeholder="SHIPTO0001"
                      disabled={isEditing}
                      className={`font-mono uppercase ${errors.shipToCode ? 'border-destructive' : ''}`}
                    />
                    {errors.shipToCode && (
                      <p className="text-sm text-destructive">{errors.shipToCode.message}</p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 pt-8">
                    <Switch
                      id="isActive"
                      checked={isActive}
                      onCheckedChange={(checked) => setValue('isActive', checked)}
                    />
                    <Label htmlFor="isActive">有効</Label>
                  </div>
                </div>

                <div className="grid gap-4 grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="shipToName">
                      名称 <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="shipToName"
                      {...register('shipToName', {
                        required: '名称は必須です',
                        maxLength: { value: 100, message: '100文字以内で入力してください' },
                      })}
                      placeholder="東京本社倉庫"
                      className={errors.shipToName ? 'border-destructive' : ''}
                    />
                    {errors.shipToName && (
                      <p className="text-sm text-destructive">{errors.shipToName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shipToNameKana">名称カナ</Label>
                    <Input
                      id="shipToNameKana"
                      {...register('shipToNameKana', {
                        maxLength: { value: 200, message: '200文字以内で入力してください' },
                      })}
                      placeholder="トウキョウホンシャソウコ"
                      className={errors.shipToNameKana ? 'border-destructive' : ''}
                    />
                    {errors.shipToNameKana && (
                      <p className="text-sm text-destructive">{errors.shipToNameKana.message}</p>
                    )}
                  </div>
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
                      placeholder="丸の内ビル10F"
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

                <div className="grid gap-4 grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="faxNumber">FAX番号</Label>
                    <Input
                      id="faxNumber"
                      {...register('faxNumber')}
                      placeholder="03-1234-5679"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">メールアドレス</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register('email', {
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: 'メールアドレスの形式が不正です',
                        },
                      })}
                      placeholder="example@company.com"
                      className={errors.email ? 'border-destructive' : ''}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2 max-w-[calc(50%-0.5rem)]">
                  <Label htmlFor="contactPerson">担当者名</Label>
                  <Input
                    id="contactPerson"
                    {...register('contactPerson', {
                      maxLength: { value: 50, message: '50文字以内で入力してください' },
                    })}
                    placeholder="山田太郎"
                  />
                </div>
              </div>

              {/* エラー表示 */}
              {error && error.code !== 'CONCURRENT_UPDATE' && (
                <div className="rounded-md border border-destructive bg-destructive/10 p-3">
                  <p className="text-sm text-destructive">{getErrorMessage(error.code)}</p>
                </div>
              )}

              <DialogFooter className="flex-col gap-2 sm:flex-row">
                {isEditing && shipTo && (
                  <Button
                    type="button"
                    variant={shipTo.isActive ? 'destructive' : 'outline'}
                    onClick={handleStatusToggle}
                    disabled={isSubmitting}
                    className="sm:mr-auto"
                  >
                    {shipTo.isActive ? '無効化' : '再有効化'}
                  </Button>
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
            <AlertDialogTitle>納入先を無効化しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              この納入先を無効化すると、発注時に選択できなくなります。
              後で再有効化することができます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeactivateConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              無効化
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
