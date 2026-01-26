/**
 * バージョン作成/コピーダイアログコンポーネント
 */

'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui';
import { Button } from '@/shared/ui';
import { Input } from '@/shared/ui';
import { Label } from '@/shared/ui';
import { Textarea } from '@/shared/ui';
import {
  useCreateVersion,
  useCopyVersion,
  useVersionDetail,
} from '../../hooks/use-versions';
import type {
  CreateVersionRequest,
  CopyVersionRequest,
} from '@contracts/bff/organization-master';

interface VersionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'copy';
  sourceVersionId?: string;
  onSuccess?: (versionId: string) => void;
}

interface FormData {
  versionCode: string;
  versionName: string;
  effectiveDate: string;
  expiryDate: string;
  description: string;
}

const initialFormData: FormData = {
  versionCode: '',
  versionName: '',
  effectiveDate: '',
  expiryDate: '',
  description: '',
};

export function VersionFormDialog({
  open,
  onOpenChange,
  mode,
  sourceVersionId,
  onSuccess,
}: VersionFormDialogProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const { data: sourceVersion } = useVersionDetail(sourceVersionId ?? '');
  const createVersion = useCreateVersion();
  const copyVersion = useCopyVersion();

  const isPending = createVersion.isPending || copyVersion.isPending;

  // ダイアログが開かれた時にフォームをリセット
  useEffect(() => {
    if (open) {
      if (mode === 'copy' && sourceVersion?.version) {
        // コピーモード: 元のバージョン情報をベースに新しいコードと名前を設定
        const source = sourceVersion.version;
        setFormData({
          versionCode: `${source.versionCode}-copy`,
          versionName: `${source.versionName}（コピー）`,
          effectiveDate: source.effectiveDate,
          expiryDate: source.expiryDate ?? '',
          description: source.description ?? '',
        });
      } else {
        setFormData(initialFormData);
      }
    }
  }, [open, mode, sourceVersion]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (mode === 'create') {
        const request: CreateVersionRequest = {
          versionCode: formData.versionCode,
          versionName: formData.versionName,
          effectiveDate: formData.effectiveDate,
          expiryDate: formData.expiryDate || undefined,
          description: formData.description || undefined,
        };
        const result = await createVersion.mutateAsync(request);
        onSuccess?.(result.version.id);
      } else if (mode === 'copy' && sourceVersionId) {
        const request: CopyVersionRequest = {
          versionCode: formData.versionCode,
          versionName: formData.versionName,
          effectiveDate: formData.effectiveDate,
          expiryDate: formData.expiryDate || undefined,
          description: formData.description || undefined,
        };
        const result = await copyVersion.mutateAsync({
          sourceVersionId,
          request,
        });
        onSuccess?.(result.version.id);
      }
      onOpenChange(false);
    } catch {
      // エラーはフック内でToast表示される
    }
  };

  const isValid =
    formData.versionCode.trim() !== '' &&
    formData.versionName.trim() !== '' &&
    formData.effectiveDate.trim() !== '';

  const dialogTitle = mode === 'create' ? '新規バージョン作成' : 'バージョンをコピー';
  const dialogDescription =
    mode === 'create'
      ? '新しい組織マスタバージョンを作成します。'
      : `「${sourceVersion?.version.versionName ?? ''}」をベースに新しいバージョンを作成します。`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* バージョンコード */}
            <div className="grid gap-2">
              <Label htmlFor="versionCode">
                バージョンコード <span className="text-destructive">*</span>
              </Label>
              <Input
                id="versionCode"
                name="versionCode"
                value={formData.versionCode}
                onChange={handleChange}
                placeholder="例: 2025-Q2"
                required
              />
            </div>

            {/* バージョン名 */}
            <div className="grid gap-2">
              <Label htmlFor="versionName">
                バージョン名 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="versionName"
                name="versionName"
                value={formData.versionName}
                onChange={handleChange}
                placeholder="例: 2025年度第2四半期版"
                required
              />
            </div>

            {/* 開始日 */}
            <div className="grid gap-2">
              <Label htmlFor="effectiveDate">
                開始日 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="effectiveDate"
                name="effectiveDate"
                type="date"
                value={formData.effectiveDate}
                onChange={handleChange}
                required
              />
            </div>

            {/* 終了日 */}
            <div className="grid gap-2">
              <Label htmlFor="expiryDate">終了日（任意）</Label>
              <Input
                id="expiryDate"
                name="expiryDate"
                type="date"
                value={formData.expiryDate}
                onChange={handleChange}
              />
            </div>

            {/* 説明 */}
            <div className="grid gap-2">
              <Label htmlFor="description">説明（任意）</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="このバージョンの説明を入力..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              キャンセル
            </Button>
            <Button type="submit" disabled={!isValid || isPending}>
              {isPending ? '処理中...' : mode === 'create' ? '作成' : 'コピー'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
