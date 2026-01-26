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
import { Textarea } from '@/shared/ui/components/textarea';
import { Switch } from '@/shared/ui/components/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/components/select';
import { Alert, AlertDescription } from '@/shared/ui/components/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import type {
  CompanyBankAccountBffClient,
  CompanyBankAccountDto,
  CompanyAccountCategory,
  CompanyAccountType,
} from '../api/BffClient';

interface FormData {
  accountCode: string;
  accountName: string;
  accountCategory: CompanyAccountCategory;
  bankId: string;
  bankBranchId: string;
  postOfficeSymbol: string;
  postOfficeNumber: string;
  accountType: CompanyAccountType;
  accountNo: string;
  accountHolderName: string;
  accountHolderNameKana: string;
  consignorCode: string;
  isDefault: boolean;
  isActive: boolean;
  notes: string;
}

const initialFormData: FormData = {
  accountCode: '',
  accountName: '',
  accountCategory: 'bank',
  bankId: '',
  bankBranchId: '',
  postOfficeSymbol: '',
  postOfficeNumber: '',
  accountType: 'ordinary',
  accountNo: '',
  accountHolderName: '',
  accountHolderNameKana: '',
  consignorCode: '',
  isDefault: false,
  isActive: true,
  notes: '',
};

interface CompanyBankAccountFormDialogProps {
  mode: 'create' | 'edit';
  account?: CompanyBankAccountDto;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  bffClient: CompanyBankAccountBffClient;
}

/**
 * Company Bank Account Form Dialog
 */
export function CompanyBankAccountFormDialog({
  mode,
  account,
  open,
  onOpenChange,
  onSuccess,
  bffClient,
}: CompanyBankAccountFormDialogProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Reset form when dialog opens/closes or account changes
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && account) {
        setFormData({
          accountCode: account.accountCode,
          accountName: account.accountName,
          accountCategory: account.accountCategory,
          bankId: account.bankId || '',
          bankBranchId: account.bankBranchId || '',
          postOfficeSymbol: account.postOfficeSymbol || '',
          postOfficeNumber: account.postOfficeNumber || '',
          accountType: account.accountType,
          accountNo: account.accountNo || '',
          accountHolderName: account.accountHolderName,
          accountHolderNameKana: account.accountHolderNameKana || '',
          consignorCode: account.consignorCode || '',
          isDefault: account.isDefault,
          isActive: account.isActive,
          notes: account.notes || '',
        });
      } else {
        setFormData(initialFormData);
      }
      setErrors({});
      setSubmitError(null);
    }
  }, [open, mode, account]);

  const handleChange = (
    field: keyof FormData,
    value: string | boolean,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear field error on change
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    // Account code (required for create, max 10 chars, alphanumeric)
    if (mode === 'create') {
      if (!formData.accountCode.trim()) {
        newErrors.accountCode = '口座コードは必須です';
      } else if (!/^[A-Za-z0-9]{1,10}$/.test(formData.accountCode.trim())) {
        newErrors.accountCode = '口座コードは10文字以内の英数字で入力してください';
      }
    }

    // Account name (required)
    if (!formData.accountName.trim()) {
      newErrors.accountName = '口座名は必須です';
    }

    // Account holder name (required)
    if (!formData.accountHolderName.trim()) {
      newErrors.accountHolderName = '口座名義人は必須です';
    }

    // Conditional validation based on account category
    if (formData.accountCategory === 'bank') {
      // Bank account requires bank, branch, and account number
      if (!formData.bankId) {
        newErrors.bankId = '銀行を選択してください';
      }
      if (!formData.bankBranchId) {
        newErrors.bankBranchId = '支店を選択してください';
      }
      if (!formData.accountNo.trim()) {
        newErrors.accountNo = '口座番号は必須です';
      } else if (!/^\d{1,7}$/.test(formData.accountNo.trim())) {
        newErrors.accountNo = '口座番号は7桁以内の数字で入力してください';
      }
    } else if (formData.accountCategory === 'post_office') {
      // Post office requires symbol and number
      if (!formData.postOfficeSymbol.trim()) {
        newErrors.postOfficeSymbol = 'ゆうちょ記号は必須です';
      } else if (!/^\d{5}$/.test(formData.postOfficeSymbol.trim())) {
        newErrors.postOfficeSymbol = 'ゆうちょ記号は5桁の数字で入力してください';
      }
      if (!formData.postOfficeNumber.trim()) {
        newErrors.postOfficeNumber = 'ゆうちょ番号は必須です';
      } else if (!/^\d{1,8}$/.test(formData.postOfficeNumber.trim())) {
        newErrors.postOfficeNumber = 'ゆうちょ番号は8桁以内の数字で入力してください';
      }
    }

    // Consignor code (optional, 10 digits if provided)
    if (formData.consignorCode.trim() && !/^\d{10}$/.test(formData.consignorCode.trim())) {
      newErrors.consignorCode = '委託者コードは10桁の数字で入力してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      if (mode === 'create') {
        await bffClient.createAccount({
          accountCode: formData.accountCode.trim().toUpperCase(),
          accountName: formData.accountName.trim(),
          accountCategory: formData.accountCategory,
          bankId: formData.accountCategory === 'bank' ? formData.bankId : undefined,
          bankBranchId: formData.accountCategory === 'bank' ? formData.bankBranchId : undefined,
          postOfficeSymbol:
            formData.accountCategory === 'post_office'
              ? formData.postOfficeSymbol.trim()
              : undefined,
          postOfficeNumber:
            formData.accountCategory === 'post_office'
              ? formData.postOfficeNumber.trim()
              : undefined,
          accountType: formData.accountType,
          accountNo:
            formData.accountCategory === 'bank' ? formData.accountNo.trim() : undefined,
          accountHolderName: formData.accountHolderName.trim(),
          accountHolderNameKana: formData.accountHolderNameKana.trim() || undefined,
          consignorCode: formData.consignorCode.trim() || undefined,
          isDefault: formData.isDefault,
          notes: formData.notes.trim() || undefined,
        });
      } else if (account) {
        await bffClient.updateAccount(account.id, {
          accountName: formData.accountName.trim(),
          accountCategory: formData.accountCategory,
          bankId: formData.accountCategory === 'bank' ? formData.bankId : undefined,
          bankBranchId: formData.accountCategory === 'bank' ? formData.bankBranchId : undefined,
          postOfficeSymbol:
            formData.accountCategory === 'post_office'
              ? formData.postOfficeSymbol.trim()
              : undefined,
          postOfficeNumber:
            formData.accountCategory === 'post_office'
              ? formData.postOfficeNumber.trim()
              : undefined,
          accountType: formData.accountType,
          accountNo:
            formData.accountCategory === 'bank' ? formData.accountNo.trim() : undefined,
          accountHolderName: formData.accountHolderName.trim(),
          accountHolderNameKana: formData.accountHolderNameKana.trim() || undefined,
          consignorCode: formData.consignorCode.trim() || undefined,
          isDefault: formData.isDefault,
          isActive: formData.isActive,
          notes: formData.notes.trim() || undefined,
          version: account.version,
        });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      const apiError = error as { code?: string; message?: string };
      setSubmitError(apiError.message || '保存に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? '自社口座の新規登録' : '自社口座の編集'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? '新しい自社口座（出金口座）を登録します'
              : '自社口座の情報を編集します'}
          </DialogDescription>
        </DialogHeader>

        {submitError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 py-4">
          {/* Account Code */}
          <div className="grid gap-2">
            <Label htmlFor="accountCode">
              口座コード <span className="text-destructive">*</span>
            </Label>
            <Input
              id="accountCode"
              value={formData.accountCode}
              onChange={(e) => handleChange('accountCode', e.target.value)}
              placeholder="例: ACC001"
              maxLength={10}
              disabled={mode === 'edit'}
              className={mode === 'edit' ? 'bg-muted' : ''}
            />
            {errors.accountCode && (
              <p className="text-sm text-destructive">{errors.accountCode}</p>
            )}
          </div>

          {/* Account Name */}
          <div className="grid gap-2">
            <Label htmlFor="accountName">
              口座名 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="accountName"
              value={formData.accountName}
              onChange={(e) => handleChange('accountName', e.target.value)}
              placeholder="例: メイン出金口座"
            />
            {errors.accountName && (
              <p className="text-sm text-destructive">{errors.accountName}</p>
            )}
          </div>

          {/* Account Category */}
          <div className="grid gap-2">
            <Label htmlFor="accountCategory">
              口座区分 <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.accountCategory}
              onValueChange={(value) =>
                handleChange('accountCategory', value as CompanyAccountCategory)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bank">銀行</SelectItem>
                <SelectItem value="post_office">ゆうちょ銀行</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bank fields (shown when category is bank) */}
          {formData.accountCategory === 'bank' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="bankId">
                    銀行 <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.bankId}
                    onValueChange={(value) => handleChange('bankId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="銀行を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* TODO: Fetch from bank master */}
                      <SelectItem value="bank-1">みずほ銀行</SelectItem>
                      <SelectItem value="bank-2">三菱UFJ銀行</SelectItem>
                      <SelectItem value="bank-3">三井住友銀行</SelectItem>
                      <SelectItem value="bank-4">りそな銀行</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.bankId && (
                    <p className="text-sm text-destructive">{errors.bankId}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="bankBranchId">
                    支店 <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.bankBranchId}
                    onValueChange={(value) => handleChange('bankBranchId', value)}
                    disabled={!formData.bankId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="支店を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* TODO: Fetch from branch master based on selected bank */}
                      <SelectItem value="branch-1">東京営業部</SelectItem>
                      <SelectItem value="branch-2">本店</SelectItem>
                      <SelectItem value="branch-3">新宿支店</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.bankBranchId && (
                    <p className="text-sm text-destructive">{errors.bankBranchId}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="accountType">
                    口座種別 <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.accountType}
                    onValueChange={(value) =>
                      handleChange('accountType', value as CompanyAccountType)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ordinary">普通</SelectItem>
                      <SelectItem value="current">当座</SelectItem>
                      <SelectItem value="savings">貯蓄</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="accountNo">
                    口座番号 <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="accountNo"
                    value={formData.accountNo}
                    onChange={(e) => handleChange('accountNo', e.target.value)}
                    placeholder="7桁の数字"
                    maxLength={7}
                  />
                  {errors.accountNo && (
                    <p className="text-sm text-destructive">{errors.accountNo}</p>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Post office fields (shown when category is post_office) */}
          {formData.accountCategory === 'post_office' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="postOfficeSymbol">
                  ゆうちょ記号 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="postOfficeSymbol"
                  value={formData.postOfficeSymbol}
                  onChange={(e) => handleChange('postOfficeSymbol', e.target.value)}
                  placeholder="5桁の数字"
                  maxLength={5}
                />
                {errors.postOfficeSymbol && (
                  <p className="text-sm text-destructive">{errors.postOfficeSymbol}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="postOfficeNumber">
                  ゆうちょ番号 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="postOfficeNumber"
                  value={formData.postOfficeNumber}
                  onChange={(e) => handleChange('postOfficeNumber', e.target.value)}
                  placeholder="8桁以内の数字"
                  maxLength={8}
                />
                {errors.postOfficeNumber && (
                  <p className="text-sm text-destructive">{errors.postOfficeNumber}</p>
                )}
              </div>
            </div>
          )}

          {/* Account Holder Name */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="accountHolderName">
                口座名義人 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="accountHolderName"
                value={formData.accountHolderName}
                onChange={(e) => handleChange('accountHolderName', e.target.value)}
                placeholder="例: 株式会社サンプル"
              />
              {errors.accountHolderName && (
                <p className="text-sm text-destructive">{errors.accountHolderName}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="accountHolderNameKana">口座名義人（カナ）</Label>
              <Input
                id="accountHolderNameKana"
                value={formData.accountHolderNameKana}
                onChange={(e) => handleChange('accountHolderNameKana', e.target.value)}
                placeholder="例: ｶﾌﾞｼｷｶﾞｲｼﾔｻﾝﾌﾟﾙ"
              />
            </div>
          </div>

          {/* Consignor Code (for Zengin FB) */}
          <div className="grid gap-2">
            <Label htmlFor="consignorCode">委託者コード（全銀FB用）</Label>
            <Input
              id="consignorCode"
              value={formData.consignorCode}
              onChange={(e) => handleChange('consignorCode', e.target.value)}
              placeholder="10桁の数字"
              maxLength={10}
            />
            {errors.consignorCode && (
              <p className="text-sm text-destructive">{errors.consignorCode}</p>
            )}
            <p className="text-xs text-muted-foreground">
              総合振込データ作成時に使用する委託者コードです
            </p>
          </div>

          {/* Default & Active switches */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch
                id="isDefault"
                checked={formData.isDefault}
                onCheckedChange={(checked) => handleChange('isDefault', checked)}
              />
              <Label htmlFor="isDefault">既定の口座にする</Label>
            </div>
            {mode === 'edit' && (
              <div className="flex items-center gap-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleChange('isActive', checked)}
                />
                <Label htmlFor="isActive">有効</Label>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="grid gap-2">
            <Label htmlFor="notes">備考</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="メモや補足情報を入力"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            キャンセル
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === 'create' ? '登録' : '保存'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
