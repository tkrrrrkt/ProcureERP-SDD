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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/components/select';
import { Alert, AlertDescription } from '@/shared/ui/components/alert';
import { AlertTriangle } from 'lucide-react';
import type { CategoryAxisDto, SegmentDto, BffClient } from '../../api/BffClient';

interface SegmentCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bffClient: BffClient;
  axis: CategoryAxisDto;
  onSuccess: () => void;
}

interface FormErrors {
  segmentCode?: string;
  segmentName?: string;
  parentSegmentId?: string;
  general?: string;
}

export function SegmentCreateDialog({
  open,
  onOpenChange,
  bffClient,
  axis,
  onSuccess,
}: SegmentCreateDialogProps) {
  // Form state
  const [segmentCode, setSegmentCode] = useState('');
  const [segmentName, setSegmentName] = useState('');
  const [parentSegmentId, setParentSegmentId] = useState<string>('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  // Parent segment options
  const [parentOptions, setParentOptions] = useState<SegmentDto[]>([]);

  // Fetch parent segment options
  useEffect(() => {
    if (!open || !axis.supportsHierarchy) {
      setParentOptions([]);
      return;
    }

    const fetchParents = async () => {
      try {
        const response = await bffClient.listSegments({
          categoryAxisId: axis.id,
          isActive: true,
          pageSize: 100,
        });
        // Filter to only show segments at level < 5 (max depth)
        setParentOptions(response.items.filter((s) => s.hierarchyLevel < 5));
      } catch {
        // Ignore errors
      }
    };

    fetchParents();
  }, [bffClient, axis, open]);

  // Reset form
  const resetForm = () => {
    setSegmentCode('');
    setSegmentName('');
    setParentSegmentId('');
    setDescription('');
    setErrors({});
  };

  // Validation
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!segmentCode.trim()) {
      newErrors.segmentCode = 'セグメントコードは必須です';
    } else if (!/^[A-Z0-9_-]+$/.test(segmentCode)) {
      newErrors.segmentCode = 'セグメントコードは英大文字・数字・ハイフン・アンダースコアのみ使用可能です';
    }

    if (!segmentName.trim()) {
      newErrors.segmentName = 'セグメント名称は必須です';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit
  const handleSubmit = async () => {
    if (!validate()) return;

    setSubmitting(true);
    try {
      await bffClient.createSegment({
        categoryAxisId: axis.id,
        segmentCode: segmentCode.trim(),
        segmentName: segmentName.trim(),
        parentSegmentId: parentSegmentId || undefined,
        description: description.trim() || undefined,
      });
      resetForm();
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      if (err instanceof Error) {
        switch (err.message) {
          case 'SEGMENT_CODE_DUPLICATE':
            setErrors({ segmentCode: 'このセグメントコードは既に使用されています' });
            break;
          case 'PARENT_SEGMENT_NOT_FOUND':
            setErrors({ parentSegmentId: '親セグメントが見つかりません' });
            break;
          case 'HIERARCHY_DEPTH_EXCEEDED':
            setErrors({ general: '階層の深さが上限（5階層）を超えています' });
            break;
          case 'CIRCULAR_REFERENCE':
            setErrors({ general: '循環参照が検出されました' });
            break;
          default:
            setErrors({ general: '登録に失敗しました' });
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
          <DialogTitle>セグメントの新規登録</DialogTitle>
          <DialogDescription>
            「{axis.axisName}」に新しいセグメントを追加します。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* General Error */}
          {errors.general && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{errors.general}</AlertDescription>
            </Alert>
          )}

          {/* Segment Code */}
          <div className="space-y-2">
            <Label htmlFor="segmentCode">
              セグメントコード <span className="text-destructive">*</span>
            </Label>
            <Input
              id="segmentCode"
              value={segmentCode}
              onChange={(e) => setSegmentCode(e.target.value.toUpperCase())}
              placeholder="例: ELEC-IC"
              maxLength={30}
            />
            {errors.segmentCode && (
              <p className="text-sm text-destructive">{errors.segmentCode}</p>
            )}
          </div>

          {/* Segment Name */}
          <div className="space-y-2">
            <Label htmlFor="segmentName">
              セグメント名称 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="segmentName"
              value={segmentName}
              onChange={(e) => setSegmentName(e.target.value)}
              placeholder="例: IC・半導体"
              maxLength={100}
            />
            {errors.segmentName && (
              <p className="text-sm text-destructive">{errors.segmentName}</p>
            )}
          </div>

          {/* Parent Segment (only for hierarchical axes) */}
          {axis.supportsHierarchy && (
            <div className="space-y-2">
              <Label htmlFor="parentSegment">親セグメント</Label>
              <Select value={parentSegmentId} onValueChange={setParentSegmentId}>
                <SelectTrigger>
                  <SelectValue placeholder="なし（ルートレベル）" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">なし（ルートレベル）</SelectItem>
                  {parentOptions.map((seg) => (
                    <SelectItem key={seg.id} value={seg.id}>
                      {'　'.repeat(seg.hierarchyLevel - 1)}
                      {seg.segmentName} ({seg.segmentCode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.parentSegmentId && (
                <p className="text-sm text-destructive">{errors.parentSegmentId}</p>
              )}
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="segDescription">説明</Label>
            <Textarea
              id="segDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="このセグメントの用途や説明を入力"
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
