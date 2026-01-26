'use client';

import { useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/components/select';
import { Checkbox } from '@/shared/ui/components/checkbox';
import type { TargetEntityKind, BffClient } from '../../api/BffClient';

interface CategoryAxisCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bffClient: BffClient;
  onSuccess: () => void;
}

interface FormErrors {
  axisCode?: string;
  axisName?: string;
  targetEntityKind?: string;
  supportsHierarchy?: string;
}

export function CategoryAxisCreateDialog({
  open,
  onOpenChange,
  bffClient,
  onSuccess,
}: CategoryAxisCreateDialogProps) {
  // Form state
  const [axisCode, setAxisCode] = useState('');
  const [axisName, setAxisName] = useState('');
  const [targetEntityKind, setTargetEntityKind] = useState<TargetEntityKind | ''>('');
  const [supportsHierarchy, setSupportsHierarchy] = useState(false);
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  // Reset form
  const resetForm = () => {
    setAxisCode('');
    setAxisName('');
    setTargetEntityKind('');
    setSupportsHierarchy(false);
    setDescription('');
    setErrors({});
  };

  // Validation
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!axisCode.trim()) {
      newErrors.axisCode = '軸コードは必須です';
    } else if (!/^[A-Z0-9_-]+$/.test(axisCode)) {
      newErrors.axisCode = '軸コードは英大文字・数字・ハイフン・アンダースコアのみ使用可能です';
    }

    if (!axisName.trim()) {
      newErrors.axisName = '軸名称は必須です';
    }

    if (!targetEntityKind) {
      newErrors.targetEntityKind = '対象マスタ種別は必須です';
    }

    if (supportsHierarchy && targetEntityKind !== 'ITEM') {
      newErrors.supportsHierarchy = '階層構造は品目（ITEM）のみサポートしています';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit
  const handleSubmit = async () => {
    if (!validate()) return;
    if (!targetEntityKind) return;

    setSubmitting(true);
    try {
      await bffClient.createCategoryAxis({
        axisCode: axisCode.trim(),
        axisName: axisName.trim(),
        targetEntityKind,
        supportsHierarchy,
        description: description.trim() || undefined,
      });
      resetForm();
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      if (err instanceof Error) {
        if (err.message === 'AXIS_CODE_DUPLICATE') {
          setErrors({ axisCode: 'この軸コードは既に使用されています' });
        } else if (err.message === 'HIERARCHY_NOT_SUPPORTED') {
          setErrors({ supportsHierarchy: '階層構造は品目（ITEM）のみサポートしています' });
        } else {
          setErrors({ axisCode: '登録に失敗しました' });
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Handle dialog close
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>カテゴリ軸の新規登録</DialogTitle>
          <DialogDescription>
            新しいカテゴリ軸を作成します。軸コードと対象マスタ種別は後から変更できません。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Axis Code */}
          <div className="space-y-2">
            <Label htmlFor="axisCode">
              軸コード <span className="text-destructive">*</span>
            </Label>
            <Input
              id="axisCode"
              value={axisCode}
              onChange={(e) => setAxisCode(e.target.value.toUpperCase())}
              placeholder="例: PROD-CAT"
              maxLength={20}
            />
            {errors.axisCode && (
              <p className="text-sm text-destructive">{errors.axisCode}</p>
            )}
          </div>

          {/* Axis Name */}
          <div className="space-y-2">
            <Label htmlFor="axisName">
              軸名称 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="axisName"
              value={axisName}
              onChange={(e) => setAxisName(e.target.value)}
              placeholder="例: 商品カテゴリ"
              maxLength={100}
            />
            {errors.axisName && (
              <p className="text-sm text-destructive">{errors.axisName}</p>
            )}
          </div>

          {/* Target Entity Kind */}
          <div className="space-y-2">
            <Label htmlFor="targetEntityKind">
              対象マスタ種別 <span className="text-destructive">*</span>
            </Label>
            <Select
              value={targetEntityKind}
              onValueChange={(v) => {
                setTargetEntityKind(v as TargetEntityKind);
                if (v !== 'ITEM') {
                  setSupportsHierarchy(false);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="選択してください" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ITEM">品目</SelectItem>
                <SelectItem value="PARTY">取引先法人</SelectItem>
                <SelectItem value="SUPPLIER_SITE">仕入先拠点</SelectItem>
              </SelectContent>
            </Select>
            {errors.targetEntityKind && (
              <p className="text-sm text-destructive">{errors.targetEntityKind}</p>
            )}
          </div>

          {/* Supports Hierarchy */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id="supportsHierarchy"
                checked={supportsHierarchy}
                onCheckedChange={(checked) => setSupportsHierarchy(checked === true)}
                disabled={targetEntityKind !== 'ITEM'}
              />
              <Label
                htmlFor="supportsHierarchy"
                className={targetEntityKind !== 'ITEM' ? 'text-muted-foreground' : ''}
              >
                階層構造を有効にする（品目のみ）
              </Label>
            </div>
            {errors.supportsHierarchy && (
              <p className="text-sm text-destructive">{errors.supportsHierarchy}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">説明</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="この軸の用途や説明を入力"
              rows={3}
              maxLength={500}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            キャンセル
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? '登録中...' : '登録'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
