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
import { Badge } from '@/shared/ui/components/badge';
import type { CategoryAxisDto, TargetEntityKind, BffClient } from '../../api/BffClient';

interface CategoryAxisEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bffClient: BffClient;
  axis: CategoryAxisDto;
  onSuccess: () => void;
}

interface FormErrors {
  axisName?: string;
  displayOrder?: string;
  general?: string;
}

const TARGET_ENTITY_KIND_LABELS: Record<TargetEntityKind, string> = {
  ITEM: '品目',
  PARTY: '取引先法人',
  SUPPLIER_SITE: '仕入先拠点',
};

export function CategoryAxisEditDialog({
  open,
  onOpenChange,
  bffClient,
  axis,
  onSuccess,
}: CategoryAxisEditDialogProps) {
  // Form state
  const [axisName, setAxisName] = useState(axis.axisName);
  const [displayOrder, setDisplayOrder] = useState(String(axis.displayOrder));
  const [description, setDescription] = useState(axis.description || '');
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  // Sync form when axis changes
  useEffect(() => {
    setAxisName(axis.axisName);
    setDisplayOrder(String(axis.displayOrder));
    setDescription(axis.description || '');
    setErrors({});
  }, [axis]);

  // Validation
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!axisName.trim()) {
      newErrors.axisName = '軸名称は必須です';
    }

    const order = parseInt(displayOrder, 10);
    if (isNaN(order) || order < 1) {
      newErrors.displayOrder = '表示順は1以上の数値を入力してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit
  const handleSubmit = async () => {
    if (!validate()) return;

    setSubmitting(true);
    try {
      await bffClient.updateCategoryAxis(axis.id, {
        axisName: axisName.trim(),
        displayOrder: parseInt(displayOrder, 10),
        description: description.trim() || undefined,
        version: axis.version,
      });
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      if (err instanceof Error) {
        if (err.message === 'CONCURRENT_UPDATE') {
          setErrors({ general: '他のユーザーによって更新されました。画面を閉じて再読み込みしてください。' });
        } else {
          setErrors({ general: '更新に失敗しました' });
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>カテゴリ軸の編集</DialogTitle>
          <DialogDescription>
            軸名称、表示順、説明を変更できます。軸コードと対象マスタ種別は変更できません。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* General Error */}
          {errors.general && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {errors.general}
            </div>
          )}

          {/* Axis Code (Read-only) */}
          <div className="space-y-2">
            <Label>軸コード</Label>
            <div className="flex items-center gap-2">
              <code className="rounded bg-muted px-2 py-1 text-sm font-mono">
                {axis.axisCode}
              </code>
              <Badge variant="secondary">
                {TARGET_ENTITY_KIND_LABELS[axis.targetEntityKind]}
              </Badge>
              {axis.supportsHierarchy && (
                <Badge variant="outline">階層対応</Badge>
              )}
            </div>
          </div>

          {/* Axis Name */}
          <div className="space-y-2">
            <Label htmlFor="editAxisName">
              軸名称 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="editAxisName"
              value={axisName}
              onChange={(e) => setAxisName(e.target.value)}
              maxLength={100}
            />
            {errors.axisName && (
              <p className="text-sm text-destructive">{errors.axisName}</p>
            )}
          </div>

          {/* Display Order */}
          <div className="space-y-2">
            <Label htmlFor="editDisplayOrder">
              表示順 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="editDisplayOrder"
              type="number"
              min="1"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(e.target.value)}
            />
            {errors.displayOrder && (
              <p className="text-sm text-destructive">{errors.displayOrder}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="editDescription">説明</Label>
            <Textarea
              id="editDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={500}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? '更新中...' : '更新'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
