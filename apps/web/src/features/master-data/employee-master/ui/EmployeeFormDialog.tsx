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
import { Textarea } from '@/shared/ui/components/textarea';
import { Label } from '@/shared/ui/components/label';
import { Switch } from '@/shared/ui/components/switch';
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/components/alert';
import { Spinner } from '@/shared/ui/components/spinner';
import { AlertCircle, Check } from 'lucide-react';
import { toast } from 'sonner';
import type {
  EmployeeDto,
  BffClient,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
} from '../api/BffClient';

interface EmployeeFormDialogProps {
  mode: 'create' | 'edit';
  employee?: EmployeeDto;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  bffClient: BffClient;
}

interface FormErrors {
  employeeCode?: string;
  employeeName?: string;
  employeeKanaName?: string;
  email?: string;
  joinDate?: string;
  retireDate?: string;
}

// Local form state type (with required isActive)
interface FormData {
  employeeCode: string;
  employeeName: string;
  employeeKanaName: string;
  email: string;
  joinDate: string;
  retireDate: string;
  remarks: string;
  isActive: boolean;
}

export function EmployeeFormDialog({
  mode,
  employee,
  open,
  onOpenChange,
  onSuccess,
  bffClient,
}: EmployeeFormDialogProps) {
  // Form state
  const [formData, setFormData] = useState<FormData>({
    employeeCode: '',
    employeeName: '',
    employeeKanaName: '',
    email: '',
    joinDate: '',
    retireDate: '',
    remarks: '',
    isActive: true,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when editing
  useEffect(() => {
    if (mode === 'edit' && employee) {
      setFormData({
        employeeCode: employee.employeeCode,
        employeeName: employee.employeeName,
        employeeKanaName: employee.employeeKanaName,
        email: employee.email || '',
        joinDate: employee.joinDate.split('T')[0], // ISO to YYYY-MM-DD
        retireDate: employee.retireDate ? employee.retireDate.split('T')[0] : '',
        remarks: employee.remarks || '',
        isActive: employee.isActive,
      });
    } else if (mode === 'create') {
      // Reset form for create
      setFormData({
        employeeCode: '',
        employeeName: '',
        employeeKanaName: '',
        email: '',
        joinDate: '',
        retireDate: '',
        remarks: '',
        isActive: true,
      });
    }
    setErrors({});
    setApiError(null);
  }, [mode, employee, open]);

  // Validate form
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    // Required fields
    if (!formData.employeeCode.trim()) {
      newErrors.employeeCode = '社員コードは必須です';
    }
    if (!formData.employeeName.trim()) {
      newErrors.employeeName = '社員氏名は必須です';
    }
    if (!formData.employeeKanaName.trim()) {
      newErrors.employeeKanaName = '社員カナ名は必須です';
    }
    if (!formData.joinDate) {
      newErrors.joinDate = '入社日は必須です';
    }

    // Email format (if provided)
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'メールアドレスの形式が正しくありません';
    }

    // Date range validation
    if (formData.joinDate && formData.retireDate) {
      const joinDate = new Date(formData.joinDate);
      const retireDate = new Date(formData.retireDate);
      if (retireDate <= joinDate) {
        newErrors.retireDate = '退社日は入社日より後の日付を指定してください';
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
        // Create new employee
        const request: CreateEmployeeRequest = {
          employeeCode: formData.employeeCode.trim(),
          employeeName: formData.employeeName.trim(),
          employeeKanaName: formData.employeeKanaName.trim(),
          email: formData.email?.trim() || undefined,
          joinDate: new Date(formData.joinDate).toISOString(),
          retireDate: formData.retireDate
            ? new Date(formData.retireDate).toISOString()
            : undefined,
          remarks: formData.remarks?.trim() || undefined,
          isActive: formData.isActive,
        };
        await bffClient.createEmployee(request);
        toast.success('社員を登録しました');
      } else if (employee) {
        // Update existing employee
        const request: UpdateEmployeeRequest = {
          employeeCode: formData.employeeCode.trim(),
          employeeName: formData.employeeName.trim(),
          employeeKanaName: formData.employeeKanaName.trim(),
          email: formData.email?.trim() || undefined,
          joinDate: new Date(formData.joinDate).toISOString(),
          retireDate: formData.retireDate
            ? new Date(formData.retireDate).toISOString()
            : undefined,
          remarks: formData.remarks?.trim() || undefined,
          isActive: formData.isActive,
          version: employee.version,
        };
        await bffClient.updateEmployee(employee.id, request);
        toast.success('社員情報を更新しました');
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">
            {mode === 'create' ? '社員登録' : '社員編集'}
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Employee Code */}
          <div className="space-y-2">
            <Label htmlFor="employeeCode" className="required">
              社員コード
            </Label>
            <Input
              id="employeeCode"
              value={formData.employeeCode}
              onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value })}
              className={errors.employeeCode ? 'border-destructive' : ''}
              disabled={isSubmitting}
            />
            {errors.employeeCode && (
              <p className="text-sm text-destructive">{errors.employeeCode}</p>
            )}
          </div>

          {/* Employee Name */}
          <div className="space-y-2">
            <Label htmlFor="employeeName" className="required">
              社員氏名
            </Label>
            <Input
              id="employeeName"
              value={formData.employeeName}
              onChange={(e) => setFormData({ ...formData, employeeName: e.target.value })}
              className={errors.employeeName ? 'border-destructive' : ''}
              disabled={isSubmitting}
            />
            {errors.employeeName && (
              <p className="text-sm text-destructive">{errors.employeeName}</p>
            )}
          </div>

          {/* Employee Kana Name */}
          <div className="space-y-2">
            <Label htmlFor="employeeKanaName" className="required">
              社員カナ名
            </Label>
            <Input
              id="employeeKanaName"
              value={formData.employeeKanaName}
              onChange={(e) => setFormData({ ...formData, employeeKanaName: e.target.value })}
              className={errors.employeeKanaName ? 'border-destructive' : ''}
              disabled={isSubmitting}
            />
            {errors.employeeKanaName && (
              <p className="text-sm text-destructive">{errors.employeeKanaName}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">メールアドレス</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={errors.email ? 'border-destructive' : ''}
              disabled={isSubmitting}
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
          </div>

          {/* Join Date */}
          <div className="space-y-2">
            <Label htmlFor="joinDate" className="required">
              入社日
            </Label>
            <Input
              id="joinDate"
              type="date"
              value={formData.joinDate}
              onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
              className={errors.joinDate ? 'border-destructive' : ''}
              disabled={isSubmitting}
            />
            {errors.joinDate && <p className="text-sm text-destructive">{errors.joinDate}</p>}
          </div>

          {/* Retire Date */}
          <div className="space-y-2">
            <Label htmlFor="retireDate">退社日</Label>
            <Input
              id="retireDate"
              type="date"
              value={formData.retireDate}
              onChange={(e) => setFormData({ ...formData, retireDate: e.target.value })}
              className={errors.retireDate ? 'border-destructive' : ''}
              disabled={isSubmitting}
            />
            {errors.retireDate && <p className="text-sm text-destructive">{errors.retireDate}</p>}
          </div>

          {/* Remarks */}
          <div className="space-y-2">
            <Label htmlFor="remarks">備考</Label>
            <Textarea
              id="remarks"
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          {/* Active Flag */}
          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              disabled={isSubmitting}
            />
            <Label htmlFor="isActive" className="cursor-pointer">
              有効フラグ
            </Label>
          </div>

          {/* Dialog Footer */}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
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
