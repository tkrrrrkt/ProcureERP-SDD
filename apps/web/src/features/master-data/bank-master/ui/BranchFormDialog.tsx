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
import type { BranchDto, BffClient } from '../api/BffClient';

interface BranchFormDialogProps {
  mode: 'create' | 'edit';
  bankId: string;
  branch?: BranchDto;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  bffClient: BffClient;
}

interface FormData {
  branchCode: string;
  branchName: string;
  branchNameKana: string;
  displayOrder: string;
  isActive: boolean;
}

const initialFormData: FormData = {
  branchCode: '',
  branchName: '',
  branchNameKana: '',
  displayOrder: '1000',
  isActive: true,
};

export function BranchFormDialog({
  mode,
  bankId,
  branch,
  open,
  onOpenChange,
  onSuccess,
  bffClient,
}: BranchFormDialogProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Initialize form data when dialog opens or branch changes
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && branch) {
        setFormData({
          branchCode: branch.branchCode,
          branchName: branch.branchName,
          branchNameKana: branch.branchNameKana || '',
          displayOrder: branch.displayOrder.toString(),
          isActive: branch.isActive,
        });
      } else {
        setFormData(initialFormData);
      }
      setErrors({});
      setSubmitError(null);
    }
  }, [open, mode, branch]);

  // Validate form
  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    // Branch code validation (3 digits)
    if (mode === 'create') {
      if (!formData.branchCode) {
        newErrors.branchCode = '支店コードは必須です';
      } else if (!/^\d{3}$/.test(formData.branchCode)) {
        newErrors.branchCode = '支店コードは3桁の数字で入力してください';
      }
    }

    // Branch name validation
    if (!formData.branchName.trim()) {
      newErrors.branchName = '支店名は必須です';
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
        await bffClient.createBranch(bankId, {
          branchCode: formData.branchCode,
          branchName: formData.branchName.trim(),
          branchNameKana: formData.branchNameKana.trim() || undefined,
          displayOrder: parseInt(formData.displayOrder, 10),
          isActive: formData.isActive,
        });
      } else if (branch) {
        await bffClient.updateBranch(bankId, branch.id, {
          branchName: formData.branchName.trim(),
          branchNameKana: formData.branchNameKana.trim() || undefined,
          displayOrder: parseInt(formData.displayOrder, 10),
          isActive: formData.isActive,
          version: branch.version,
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
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? '支店の新規登録' : '支店の編集'}</DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? '新しい支店を登録します。支店コードは登録後変更できません。'
              : '支店情報を編集します。'}
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
          {/* Branch Code */}
          <div className="grid gap-2">
            <Label htmlFor="branchCode">
              支店コード <span className="text-destructive">*</span>
            </Label>
            <Input
              id="branchCode"
              value={formData.branchCode}
              onChange={(e) => setFormData({ ...formData, branchCode: e.target.value })}
              placeholder="001"
              maxLength={3}
              disabled={mode === 'edit'}
              className={mode === 'edit' ? 'bg-muted' : ''}
            />
            {errors.branchCode && (
              <p className="text-sm text-destructive">{errors.branchCode}</p>
            )}
            {mode === 'create' && (
              <p className="text-xs text-muted-foreground">
                全銀協コード（3桁数字）を入力してください
              </p>
            )}
          </div>

          {/* Branch Name */}
          <div className="grid gap-2">
            <Label htmlFor="branchName">
              支店名 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="branchName"
              value={formData.branchName}
              onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
              placeholder="本店"
            />
            {errors.branchName && (
              <p className="text-sm text-destructive">{errors.branchName}</p>
            )}
          </div>

          {/* Branch Name Kana */}
          <div className="grid gap-2">
            <Label htmlFor="branchNameKana">支店名カナ</Label>
            <Input
              id="branchNameKana"
              value={formData.branchNameKana}
              onChange={(e) => setFormData({ ...formData, branchNameKana: e.target.value })}
              placeholder="ﾎﾝﾃﾝ"
            />
            <p className="text-xs text-muted-foreground">
              半角カナで入力してください（自動変換されます）
            </p>
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
