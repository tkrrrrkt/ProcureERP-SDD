'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/components/dialog';
import { Button } from '@/shared/ui/components/button';
import { Input } from '@/shared/ui/components/input';
import { Label } from '@/shared/ui/components/label';
import { Switch } from '@/shared/ui/components/switch';
import { Alert, AlertDescription } from '@/shared/ui/components/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import type { BankDto, BffClient } from '../api/BffClient';

interface BankFormDialogProps {
  mode: 'create' | 'edit';
  bank?: BankDto;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  bffClient: BffClient;
}

interface FormData {
  bankCode: string;
  bankName: string;
  bankNameKana: string;
  swiftCode: string;
  displayOrder: string;
  isActive: boolean;
}

const initialFormData: FormData = {
  bankCode: '',
  bankName: '',
  bankNameKana: '',
  swiftCode: '',
  displayOrder: '1000',
  isActive: true,
};

export function BankFormDialog({
  mode,
  bank,
  open,
  onOpenChange,
  onSuccess,
  bffClient,
}: BankFormDialogProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Initialize form data when dialog opens or bank changes
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && bank) {
        setFormData({
          bankCode: bank.bankCode,
          bankName: bank.bankName,
          bankNameKana: bank.bankNameKana || '',
          swiftCode: bank.swiftCode || '',
          displayOrder: bank.displayOrder.toString(),
          isActive: bank.isActive,
        });
      } else {
        setFormData(initialFormData);
      }
      setErrors({});
      setSubmitError(null);
    }
  }, [open, mode, bank]);

  // Validate form
  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    // Bank code validation (4 digits)
    if (mode === 'create') {
      if (!formData.bankCode) {
        newErrors.bankCode = '銀行コードは必須です';
      } else if (!/^\d{4}$/.test(formData.bankCode)) {
        newErrors.bankCode = '銀行コードは4桁の数字で入力してください';
      }
    }

    // Bank name validation
    if (!formData.bankName.trim()) {
      newErrors.bankName = '銀行名は必須です';
    }

    // Display order validation
    const displayOrder = parseInt(formData.displayOrder, 10);
    if (isNaN(displayOrder) || displayOrder < 0) {
      newErrors.displayOrder = '表示順は0以上の数値で入力してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      if (mode === 'create') {
        await bffClient.createBank({
          bankCode: formData.bankCode,
          bankName: formData.bankName.trim(),
          bankNameKana: formData.bankNameKana.trim() || undefined,
          swiftCode: formData.swiftCode.trim() || undefined,
          displayOrder: parseInt(formData.displayOrder, 10),
          isActive: formData.isActive,
        });
      } else if (bank) {
        await bffClient.updateBank(bank.id, {
          bankName: formData.bankName.trim(),
          bankNameKana: formData.bankNameKana.trim() || undefined,
          swiftCode: formData.swiftCode.trim() || undefined,
          displayOrder: parseInt(formData.displayOrder, 10),
          isActive: formData.isActive,
          version: bank.version,
        });
      }
      onSuccess();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : '保存に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? '銀行の新規登録' : '銀行の編集'}</DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? '新しい銀行を登録します。銀行コードは登録後変更できません。'
              : '銀行情報を編集します。'}
          </DialogDescription>
        </DialogHeader>

        {/* Error Alert */}
        {submitError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        {/* Form */}
        <div className="grid gap-4 py-4">
          {/* Bank Code */}
          <div className="grid gap-2">
            <Label htmlFor="bankCode">
              銀行コード <span className="text-destructive">*</span>
            </Label>
            <Input
              id="bankCode"
              value={formData.bankCode}
              onChange={(e) => setFormData({ ...formData, bankCode: e.target.value })}
              placeholder="0001"
              maxLength={4}
              disabled={mode === 'edit'}
              className={mode === 'edit' ? 'bg-muted' : ''}
            />
            {errors.bankCode && (
              <p className="text-sm text-destructive">{errors.bankCode}</p>
            )}
            {mode === 'create' && (
              <p className="text-xs text-muted-foreground">
                全銀協コード（4桁数字）を入力してください
              </p>
            )}
          </div>

          {/* Bank Name */}
          <div className="grid gap-2">
            <Label htmlFor="bankName">
              銀行名 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="bankName"
              value={formData.bankName}
              onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
              placeholder="みずほ銀行"
            />
            {errors.bankName && (
              <p className="text-sm text-destructive">{errors.bankName}</p>
            )}
          </div>

          {/* Bank Name Kana */}
          <div className="grid gap-2">
            <Label htmlFor="bankNameKana">銀行名カナ</Label>
            <Input
              id="bankNameKana"
              value={formData.bankNameKana}
              onChange={(e) => setFormData({ ...formData, bankNameKana: e.target.value })}
              placeholder="ﾐｽﾞﾎｷﾞﾝｺｳ"
            />
            <p className="text-xs text-muted-foreground">
              半角カナで入力してください（自動変換されます）
            </p>
          </div>

          {/* SWIFT Code */}
          <div className="grid gap-2">
            <Label htmlFor="swiftCode">SWIFTコード</Label>
            <Input
              id="swiftCode"
              value={formData.swiftCode}
              onChange={(e) => setFormData({ ...formData, swiftCode: e.target.value.toUpperCase() })}
              placeholder="MHCBJPJT"
              maxLength={11}
            />
          </div>

          {/* Display Order */}
          <div className="grid gap-2">
            <Label htmlFor="displayOrder">表示順</Label>
            <Input
              id="displayOrder"
              type="number"
              value={formData.displayOrder}
              onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
              min={0}
            />
            {errors.displayOrder && (
              <p className="text-sm text-destructive">{errors.displayOrder}</p>
            )}
          </div>

          {/* Is Active */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="isActive">有効</Label>
              <p className="text-xs text-muted-foreground">
                無効にすると選択リストに表示されなくなります
              </p>
            </div>
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            キャンセル
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {mode === 'create' ? '登録' : '保存'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
