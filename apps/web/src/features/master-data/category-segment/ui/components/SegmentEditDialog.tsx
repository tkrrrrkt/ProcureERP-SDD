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

interface SegmentEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bffClient: BffClient;
  segment: SegmentDto;
  axis: CategoryAxisDto;
  onSuccess: () => void;
}

interface FormErrors {
  segmentName?: string;
  parentSegmentId?: string;
  displayOrder?: string;
  general?: string;
}

export function SegmentEditDialog({
  open,
  onOpenChange,
  bffClient,
  segment,
  axis,
  onSuccess,
}: SegmentEditDialogProps) {
  // Form state
  const [segmentName, setSegmentName] = useState(segment.segmentName);
  const [parentSegmentId, setParentSegmentId] = useState(segment.parentSegmentId || '');
  const [displayOrder, setDisplayOrder] = useState(String(segment.displayOrder));
  const [description, setDescription] = useState(segment.description || '');
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  // Parent segment options
  const [parentOptions, setParentOptions] = useState<SegmentDto[]>([]);

  // Sync form when segment changes
  useEffect(() => {
    setSegmentName(segment.segmentName);
    setParentSegmentId(segment.parentSegmentId || '');
    setDisplayOrder(String(segment.displayOrder));
    setDescription(segment.description || '');
    setErrors({});
  }, [segment]);

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
        // Exclude self and descendants
        const getDescendantIds = (parentId: string, segs: SegmentDto[]): string[] => {
          const children = segs.filter((s) => s.parentSegmentId === parentId);
          const ids = children.map((c) => c.id);
          children.forEach((c) => {
            ids.push(...getDescendantIds(c.id, segs));
          });
          return ids;
        };
        const descendantIds = getDescendantIds(segment.id, response.items);
        const filtered = response.items.filter(
          (s) => s.id !== segment.id && !descendantIds.includes(s.id) && s.hierarchyLevel < 5
        );
        setParentOptions(filtered);
      } catch {
        // Ignore errors
      }
    };

    fetchParents();
  }, [bffClient, axis, segment, open]);

  // Validation
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!segmentName.trim()) {
      newErrors.segmentName = 'セグメント名称は必須です';
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
      await bffClient.updateSegment(segment.id, {
        segmentName: segmentName.trim(),
        parentSegmentId: parentSegmentId || null,
        displayOrder: parseInt(displayOrder, 10),
        description: description.trim() || undefined,
        version: segment.version,
      });
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      if (err instanceof Error) {
        switch (err.message) {
          case 'CONCURRENT_UPDATE':
            setErrors({ general: '他のユーザーによって更新されました。画面を閉じて再読み込みしてください。' });
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
          <DialogTitle>セグメントの編集</DialogTitle>
          <DialogDescription>
            セグメント名称、親セグメント、表示順、説明を変更できます。コードは変更できません。
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

          {/* Segment Code (Read-only) */}
          <div className="space-y-2">
            <Label>セグメントコード</Label>
            <code className="block rounded bg-muted px-3 py-2 text-sm font-mono">
              {segment.segmentCode}
            </code>
          </div>

          {/* Segment Name */}
          <div className="space-y-2">
            <Label htmlFor="editSegmentName">
              セグメント名称 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="editSegmentName"
              value={segmentName}
              onChange={(e) => setSegmentName(e.target.value)}
              maxLength={100}
            />
            {errors.segmentName && (
              <p className="text-sm text-destructive">{errors.segmentName}</p>
            )}
          </div>

          {/* Parent Segment (only for hierarchical axes) */}
          {axis.supportsHierarchy && (
            <div className="space-y-2">
              <Label htmlFor="editParentSegment">親セグメント</Label>
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

          {/* Display Order */}
          <div className="space-y-2">
            <Label htmlFor="editSegDisplayOrder">
              表示順 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="editSegDisplayOrder"
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
            <Label htmlFor="editSegDescription">説明</Label>
            <Textarea
              id="editSegDescription"
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
