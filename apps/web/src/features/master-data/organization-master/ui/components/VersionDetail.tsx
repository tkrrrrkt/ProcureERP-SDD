/**
 * バージョン詳細コンポーネント
 * 右ペインでバージョンの詳細情報を表示・編集
 */

'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/shared/ui';
import { Input } from '@/shared/ui';
import { Label } from '@/shared/ui';
import { Textarea } from '@/shared/ui';
import { Badge } from '@/shared/ui';
import { Separator } from '@/shared/ui';
import { Skeleton } from '@/shared/ui';
import { Pencil, X, Save } from 'lucide-react';
import { useVersionDetail, useUpdateVersion } from '../../hooks/use-versions';
import { formatDate, formatDateTime } from '../../lib/date-utils';
import type { UpdateVersionRequest } from '@contracts/bff/organization-master';

interface VersionDetailProps {
  versionId: string;
  isEditing: boolean;
  onEditingChange: (editing: boolean) => void;
}

export function VersionDetail({
  versionId,
  isEditing,
  onEditingChange,
}: VersionDetailProps) {
  const { data, isLoading } = useVersionDetail(versionId);
  const updateVersion = useUpdateVersion();

  const [formData, setFormData] = useState({
    versionName: '',
    effectiveDate: '',
    expiryDate: '',
    description: '',
  });

  // データ取得後にフォームを初期化
  useEffect(() => {
    if (data?.version) {
      setFormData({
        versionName: data.version.versionName,
        effectiveDate: data.version.effectiveDate,
        expiryDate: data.version.expiryDate ?? '',
        description: data.version.description ?? '',
      });
    }
  }, [data]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!data?.version) return;

    const request: UpdateVersionRequest = {};

    if (formData.versionName !== data.version.versionName) {
      request.versionName = formData.versionName;
    }
    if (formData.effectiveDate !== data.version.effectiveDate) {
      request.effectiveDate = formData.effectiveDate;
    }
    if (formData.expiryDate !== (data.version.expiryDate ?? '')) {
      request.expiryDate = formData.expiryDate || null;
    }
    if (formData.description !== (data.version.description ?? '')) {
      request.description = formData.description || null;
    }

    if (Object.keys(request).length > 0) {
      await updateVersion.mutateAsync({ versionId, request });
    }

    onEditingChange(false);
  };

  const handleCancel = () => {
    if (data?.version) {
      setFormData({
        versionName: data.version.versionName,
        effectiveDate: data.version.effectiveDate,
        expiryDate: data.version.expiryDate ?? '',
        description: data.version.description ?? '',
      });
    }
    onEditingChange(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (!data?.version) {
    return (
      <p className="text-sm text-muted-foreground">
        バージョン情報の取得に失敗しました
      </p>
    );
  }

  const version = data.version;

  return (
    <div className="space-y-4">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">バージョン詳細</h3>
          {version.isCurrentlyEffective && (
            <Badge className="bg-success text-success-foreground">有効</Badge>
          )}
        </div>
        {isEditing ? (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancel}
              disabled={updateVersion.isPending}
            >
              <X className="h-4 w-4 mr-1" />
              キャンセル
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={updateVersion.isPending}
            >
              <Save className="h-4 w-4 mr-1" />
              {updateVersion.isPending ? '保存中...' : '保存'}
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEditingChange(true)}
          >
            <Pencil className="h-4 w-4 mr-1" />
            編集
          </Button>
        )}
      </div>

      <Separator />

      {/* フォーム */}
      <div className="space-y-4">
        {/* バージョンコード（読み取り専用） */}
        <div className="space-y-1.5">
          <Label className="text-muted-foreground text-xs">
            バージョンコード
          </Label>
          <p className="text-sm font-mono">{version.versionCode}</p>
        </div>

        {/* バージョン名 */}
        <div className="space-y-1.5">
          <Label htmlFor="versionName" className="text-xs">
            バージョン名
          </Label>
          {isEditing ? (
            <Input
              id="versionName"
              name="versionName"
              value={formData.versionName}
              onChange={handleChange}
            />
          ) : (
            <p className="text-sm">{version.versionName}</p>
          )}
        </div>

        {/* 開始日 */}
        <div className="space-y-1.5">
          <Label htmlFor="effectiveDate" className="text-xs">
            開始日
          </Label>
          {isEditing ? (
            <Input
              id="effectiveDate"
              name="effectiveDate"
              type="date"
              value={formData.effectiveDate}
              onChange={handleChange}
            />
          ) : (
            <p className="text-sm">{formatDate(version.effectiveDate)}</p>
          )}
        </div>

        {/* 終了日 */}
        <div className="space-y-1.5">
          <Label htmlFor="expiryDate" className="text-xs">
            終了日
          </Label>
          {isEditing ? (
            <Input
              id="expiryDate"
              name="expiryDate"
              type="date"
              value={formData.expiryDate}
              onChange={handleChange}
            />
          ) : (
            <p className="text-sm">
              {version.expiryDate ? formatDate(version.expiryDate) : '無期限'}
            </p>
          )}
        </div>

        {/* 説明 */}
        <div className="space-y-1.5">
          <Label htmlFor="description" className="text-xs">
            説明
          </Label>
          {isEditing ? (
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              {version.description ?? '（説明なし）'}
            </p>
          )}
        </div>

        <Separator />

        {/* メタ情報（読み取り専用） */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">作成日時</Label>
            <p className="text-sm">{formatDateTime(version.createdAt)}</p>
          </div>
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">更新日時</Label>
            <p className="text-sm">{formatDateTime(version.updatedAt)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
