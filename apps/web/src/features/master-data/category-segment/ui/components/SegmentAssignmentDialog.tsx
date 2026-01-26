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
import { Label } from '@/shared/ui/components/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/components/select';
import { Alert, AlertDescription } from '@/shared/ui/components/alert';
import { AlertTriangle } from 'lucide-react';
import type {
  CategoryAxisDto,
  SegmentDto,
  EntitySegmentInfo,
  TargetEntityKind,
  BffClient,
} from '../../api/BffClient';

interface SegmentAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bffClient: BffClient;
  entityKind: TargetEntityKind;
  entityId: string;
  currentAssignments: EntitySegmentInfo[];
  onSuccess: () => void;
}

interface FormErrors {
  categoryAxisId?: string;
  segmentId?: string;
  general?: string;
}

export function SegmentAssignmentDialog({
  open,
  onOpenChange,
  bffClient,
  entityKind,
  entityId,
  currentAssignments,
  onSuccess,
}: SegmentAssignmentDialogProps) {
  // Form state
  const [categoryAxisId, setCategoryAxisId] = useState('');
  const [segmentId, setSegmentId] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  // Options
  const [axes, setAxes] = useState<CategoryAxisDto[]>([]);
  const [segments, setSegments] = useState<SegmentDto[]>([]);
  const [loadingAxes, setLoadingAxes] = useState(false);
  const [loadingSegments, setLoadingSegments] = useState(false);

  // Fetch axes for the entity kind
  useEffect(() => {
    if (!open) return;

    const fetchAxes = async () => {
      setLoadingAxes(true);
      try {
        const response = await bffClient.listCategoryAxes({
          targetEntityKind: entityKind,
          isActive: true,
          pageSize: 100,
        });
        setAxes(response.items);
      } catch {
        setErrors({ general: 'カテゴリ軸の取得に失敗しました' });
      } finally {
        setLoadingAxes(false);
      }
    };

    fetchAxes();
  }, [bffClient, entityKind, open]);

  // Fetch segments when axis changes
  useEffect(() => {
    if (!categoryAxisId) {
      setSegments([]);
      setSegmentId('');
      return;
    }

    const fetchSegments = async () => {
      setLoadingSegments(true);
      try {
        const response = await bffClient.listSegments({
          categoryAxisId,
          isActive: true,
          pageSize: 100,
        });
        setSegments(response.items);

        // Pre-select current segment if exists
        const current = currentAssignments.find((a) => a.categoryAxisId === categoryAxisId);
        if (current) {
          setSegmentId(current.segmentId);
        } else {
          setSegmentId('');
        }
      } catch {
        setErrors({ general: 'セグメントの取得に失敗しました' });
      } finally {
        setLoadingSegments(false);
      }
    };

    fetchSegments();
  }, [bffClient, categoryAxisId, currentAssignments]);

  // Reset form
  const resetForm = () => {
    setCategoryAxisId('');
    setSegmentId('');
    setErrors({});
  };

  // Validation
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!categoryAxisId) {
      newErrors.categoryAxisId = 'カテゴリ軸を選択してください';
    }

    if (!segmentId) {
      newErrors.segmentId = 'セグメントを選択してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit
  const handleSubmit = async () => {
    if (!validate()) return;

    setSubmitting(true);
    try {
      await bffClient.upsertSegmentAssignment({
        entityKind,
        entityId,
        categoryAxisId,
        segmentId,
      });
      resetForm();
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      if (err instanceof Error) {
        if (err.message === 'INVALID_ENTITY_KIND') {
          setErrors({ general: 'この軸はこのエンティティ種別に対応していません' });
        } else {
          setErrors({ general: '割当に失敗しました' });
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

  // Get current segment info for selected axis
  const currentForAxis = currentAssignments.find((a) => a.categoryAxisId === categoryAxisId);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>セグメントの追加・変更</DialogTitle>
          <DialogDescription>
            カテゴリ軸を選択し、セグメントを割り当てます。
            同一軸に既存の割当がある場合は上書きされます。
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

          {/* Category Axis */}
          <div className="space-y-2">
            <Label htmlFor="assignAxis">
              カテゴリ軸 <span className="text-destructive">*</span>
            </Label>
            <Select
              value={categoryAxisId}
              onValueChange={setCategoryAxisId}
              disabled={loadingAxes}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingAxes ? '読み込み中...' : '選択してください'} />
              </SelectTrigger>
              <SelectContent>
                {axes.map((axis) => (
                  <SelectItem key={axis.id} value={axis.id}>
                    {axis.axisName}
                    {currentAssignments.some((a) => a.categoryAxisId === axis.id) && ' (設定済)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categoryAxisId && (
              <p className="text-sm text-destructive">{errors.categoryAxisId}</p>
            )}
          </div>

          {/* Current Assignment Info */}
          {currentForAxis && (
            <div className="rounded-md bg-muted/50 px-3 py-2 text-sm">
              <span className="text-muted-foreground">現在の設定: </span>
              <span className="font-medium">{currentForAxis.segmentName}</span>
            </div>
          )}

          {/* Segment */}
          <div className="space-y-2">
            <Label htmlFor="assignSegment">
              セグメント <span className="text-destructive">*</span>
            </Label>
            <Select
              value={segmentId}
              onValueChange={setSegmentId}
              disabled={!categoryAxisId || loadingSegments}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    !categoryAxisId
                      ? '先に軸を選択してください'
                      : loadingSegments
                        ? '読み込み中...'
                        : '選択してください'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {segments.map((seg) => (
                  <SelectItem key={seg.id} value={seg.id}>
                    {'　'.repeat(seg.hierarchyLevel - 1)}
                    {seg.segmentName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.segmentId && (
              <p className="text-sm text-destructive">{errors.segmentId}</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            キャンセル
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? '保存中...' : currentForAxis ? '変更' : '追加'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
