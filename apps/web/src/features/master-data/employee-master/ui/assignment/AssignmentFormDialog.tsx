'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/ui/components/dialog';
import { Button } from '@/shared/ui/components/button';
import { Input } from '@/shared/ui/components/input';
import { Label } from '@/shared/ui/components/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/components/select';
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/components/alert';
import { Spinner } from '@/shared/ui/components/spinner';
import { AlertCircle, Check } from 'lucide-react';
import { toast } from 'sonner';
import type {
  EmployeeAssignmentDto,
  DepartmentOptionDto,
  BffClient,
  CreateAssignmentRequest,
  UpdateAssignmentRequest,
  AssignmentType,
} from '../../api/BffClient';
import { DepartmentSelector } from './DepartmentSelector';

interface AssignmentFormDialogProps {
  mode: 'create' | 'edit';
  employeeId: string;
  assignment?: EmployeeAssignmentDto;
  departments: DepartmentOptionDto[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  bffClient: BffClient;
}

interface FormErrors {
  departmentStableId?: string;
  assignmentType?: string;
  allocationRatio?: string;
  effectiveDate?: string;
  expiryDate?: string;
}

interface FormData {
  departmentStableId: string;
  assignmentType: AssignmentType;
  allocationRatio: string;
  title: string;
  effectiveDate: string;
  expiryDate: string;
}

/**
 * AssignmentFormDialog Component
 *
 * 所属情報の登録・編集ダイアログ
 * - 部門選択（DepartmentSelector）
 * - 所属種別（主務/兼務）選択
 * - 期間・役職・按分率入力
 * - バリデーションとエラー表示
 */
export function AssignmentFormDialog({
  mode,
  employeeId,
  assignment,
  departments,
  open,
  onOpenChange,
  onSuccess,
  bffClient,
}: AssignmentFormDialogProps) {
  // Form state
  const [formData, setFormData] = useState<FormData>({
    departmentStableId: '',
    assignmentType: 'primary',
    allocationRatio: '',
    title: '',
    effectiveDate: '',
    expiryDate: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data
  useEffect(() => {
    if (mode === 'edit' && assignment) {
      setFormData({
        departmentStableId: assignment.departmentStableId,
        assignmentType: assignment.assignmentType,
        allocationRatio:
          assignment.allocationRatio != null ? String(assignment.allocationRatio) : '',
        title: assignment.title || '',
        effectiveDate: assignment.effectiveDate.split('T')[0],
        expiryDate: assignment.expiryDate ? assignment.expiryDate.split('T')[0] : '',
      });
    } else if (mode === 'create') {
      // Reset form for create
      setFormData({
        departmentStableId: '',
        assignmentType: 'primary',
        allocationRatio: '',
        title: '',
        effectiveDate: '',
        expiryDate: '',
      });
    }
    setErrors({});
    setApiError(null);
  }, [mode, assignment, open]);

  // Validate form
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    // Required fields
    if (!formData.departmentStableId) {
      newErrors.departmentStableId = '部門を選択してください';
    }
    if (!formData.effectiveDate) {
      newErrors.effectiveDate = '有効開始日は必須です';
    }

    // Allocation ratio validation (if provided)
    if (formData.allocationRatio) {
      const ratio = parseFloat(formData.allocationRatio);
      if (isNaN(ratio) || ratio < 0 || ratio > 100) {
        newErrors.allocationRatio = '按分率は0〜100の範囲で指定してください';
      }
    }

    // Date range validation
    if (formData.effectiveDate && formData.expiryDate) {
      const effective = new Date(formData.effectiveDate);
      const expiry = new Date(formData.expiryDate);
      if (expiry <= effective) {
        newErrors.expiryDate = '有効終了日は有効開始日より後の日付を指定してください';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === 'create') {
        // Create new assignment
        const request: CreateAssignmentRequest = {
          departmentStableId: formData.departmentStableId,
          assignmentType: formData.assignmentType,
          allocationRatio: formData.allocationRatio
            ? parseFloat(formData.allocationRatio)
            : undefined,
          title: formData.title?.trim() || undefined,
          effectiveDate: formData.effectiveDate,
          expiryDate: formData.expiryDate || undefined,
        };
        await bffClient.createAssignment(employeeId, request);
        toast.success('所属情報を登録しました');
      } else if (assignment) {
        // Update existing assignment
        const request: UpdateAssignmentRequest = {
          departmentStableId: formData.departmentStableId,
          assignmentType: formData.assignmentType,
          allocationRatio: formData.allocationRatio
            ? parseFloat(formData.allocationRatio)
            : null,
          title: formData.title?.trim() || null,
          effectiveDate: formData.effectiveDate,
          expiryDate: formData.expiryDate || null,
          version: assignment.version,
        };
        await bffClient.updateAssignment(employeeId, assignment.id, request);
        toast.success('所属情報を更新しました');
      }

      onSuccess();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '保存に失敗しました';
      setApiError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (!isSubmitting) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {mode === 'create' ? '所属登録' : '所属編集'}
          </DialogTitle>
        </DialogHeader>

        {/* API Error Alert */}
        {apiError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>エラー</AlertTitle>
            <AlertDescription>{apiError}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Department Selector */}
          <div className="space-y-2">
            <Label htmlFor="department" className="required">
              部門
            </Label>
            <DepartmentSelector
              departments={departments}
              value={formData.departmentStableId}
              onValueChange={(value) => setFormData({ ...formData, departmentStableId: value })}
              disabled={isSubmitting}
              error={errors.departmentStableId}
            />
            {errors.departmentStableId && (
              <p className="text-sm text-destructive">{errors.departmentStableId}</p>
            )}
          </div>

          {/* Assignment Type */}
          <div className="space-y-2">
            <Label htmlFor="assignmentType" className="required">
              所属種別
            </Label>
            <Select
              value={formData.assignmentType}
              onValueChange={(value) =>
                setFormData({ ...formData, assignmentType: value as AssignmentType })
              }
              disabled={isSubmitting}
            >
              <SelectTrigger className={errors.assignmentType ? 'border-destructive' : ''}>
                <SelectValue placeholder="所属種別を選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="primary">主務</SelectItem>
                <SelectItem value="secondary">兼務</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">役職</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="例: 部長、課長、主任"
              disabled={isSubmitting}
            />
          </div>

          {/* Effective Date */}
          <div className="space-y-2">
            <Label htmlFor="effectiveDate" className="required">
              有効開始日
            </Label>
            <Input
              id="effectiveDate"
              type="date"
              value={formData.effectiveDate}
              onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
              className={errors.effectiveDate ? 'border-destructive' : ''}
              disabled={isSubmitting}
            />
            {errors.effectiveDate && (
              <p className="text-sm text-destructive">{errors.effectiveDate}</p>
            )}
          </div>

          {/* Expiry Date */}
          <div className="space-y-2">
            <Label htmlFor="expiryDate">有効終了日</Label>
            <Input
              id="expiryDate"
              type="date"
              value={formData.expiryDate}
              onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              className={errors.expiryDate ? 'border-destructive' : ''}
              disabled={isSubmitting}
            />
            {errors.expiryDate && (
              <p className="text-sm text-destructive">{errors.expiryDate}</p>
            )}
            <p className="text-xs text-muted-foreground">
              空欄の場合は無期限として扱います
            </p>
          </div>

          {/* Allocation Ratio */}
          <div className="space-y-2">
            <Label htmlFor="allocationRatio">按分率</Label>
            <div className="flex items-center gap-2">
              <Input
                id="allocationRatio"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.allocationRatio}
                onChange={(e) => setFormData({ ...formData, allocationRatio: e.target.value })}
                className={`w-24 ${errors.allocationRatio ? 'border-destructive' : ''}`}
                disabled={isSubmitting}
              />
              <span className="text-sm text-muted-foreground">%</span>
            </div>
            {errors.allocationRatio && (
              <p className="text-sm text-destructive">{errors.allocationRatio}</p>
            )}
            <p className="text-xs text-muted-foreground">0〜100の範囲で指定（任意）</p>
          </div>

          {/* Dialog Footer */}
          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              キャンセル
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  保存中...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  保存
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
