/**
 * 部門作成ダイアログコンポーネント
 * 新規部門作成に使用
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
import { useCreateDepartment } from '../../hooks/use-departments';
import type { CreateDepartmentRequest } from '@contracts/bff/organization-master';

interface DepartmentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  versionId: string;
  parentId?: string | null;
  parentName?: string | null;
  onSuccess?: (departmentId: string) => void;
}

interface FormData {
  departmentCode: string;
  departmentName: string;
  departmentNameShort: string;
  sortOrder: string;
  postalCode: string;
  addressLine1: string;
  addressLine2: string;
  phoneNumber: string;
  description: string;
}

const initialFormData: FormData = {
  departmentCode: '',
  departmentName: '',
  departmentNameShort: '',
  sortOrder: '',
  postalCode: '',
  addressLine1: '',
  addressLine2: '',
  phoneNumber: '',
  description: '',
};

export function DepartmentFormDialog({
  open,
  onOpenChange,
  versionId,
  parentId,
  parentName,
  onSuccess,
}: DepartmentFormDialogProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const createDepartment = useCreateDepartment();

  // ダイアログが開かれた時にフォームをリセット
  useEffect(() => {
    if (open) {
      setFormData(initialFormData);
    }
  }, [open]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const request: CreateDepartmentRequest = {
      departmentCode: formData.departmentCode,
      departmentName: formData.departmentName,
      departmentNameShort: formData.departmentNameShort || undefined,
      parentId: parentId || undefined,
      sortOrder: formData.sortOrder ? Number(formData.sortOrder) : undefined,
      postalCode: formData.postalCode || undefined,
      addressLine1: formData.addressLine1 || undefined,
      addressLine2: formData.addressLine2 || undefined,
      phoneNumber: formData.phoneNumber || undefined,
      description: formData.description || undefined,
    };

    try {
      const result = await createDepartment.mutateAsync({
        versionId,
        request,
      });
      onSuccess?.(result.department.id);
      onOpenChange(false);
    } catch {
      // エラーはフック内でToast表示される
    }
  };

  const isValid =
    formData.departmentCode.trim() !== '' &&
    formData.departmentName.trim() !== '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[750px]">
        <DialogHeader>
          <DialogTitle>
            {parentId ? '子部門を追加' : '新規部門作成'}
          </DialogTitle>
          <DialogDescription>
            {parentId && parentName
              ? `「${parentName}」の配下に新しい部門を作成します。`
              : '新しい部門を作成します。'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 py-4">
            {/* 部門コード */}
            <div className="grid gap-1.5">
              <Label htmlFor="departmentCode">
                部門コード <span className="text-destructive">*</span>
              </Label>
              <Input
                id="departmentCode"
                name="departmentCode"
                value={formData.departmentCode}
                onChange={handleChange}
                placeholder="例: SALES-3"
                required
              />
            </div>

            {/* 部門名 */}
            <div className="grid gap-1.5">
              <Label htmlFor="departmentName">
                部門名 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="departmentName"
                name="departmentName"
                value={formData.departmentName}
                onChange={handleChange}
                placeholder="例: 第三営業部"
                required
              />
            </div>

            {/* 略称 */}
            <div className="grid gap-1.5">
              <Label htmlFor="departmentNameShort">略称</Label>
              <Input
                id="departmentNameShort"
                name="departmentNameShort"
                value={formData.departmentNameShort}
                onChange={handleChange}
                placeholder="例: 三営"
              />
            </div>

            {/* 表示順 */}
            <div className="grid gap-1.5">
              <Label htmlFor="sortOrder">表示順</Label>
              <Input
                id="sortOrder"
                name="sortOrder"
                type="number"
                value={formData.sortOrder}
                onChange={handleChange}
                placeholder="例: 1"
                min={0}
              />
            </div>

            {/* 郵便番号 */}
            <div className="grid gap-1.5">
              <Label htmlFor="postalCode">郵便番号</Label>
              <Input
                id="postalCode"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                placeholder="例: 100-0001"
              />
            </div>

            {/* 電話番号 */}
            <div className="grid gap-1.5">
              <Label htmlFor="phoneNumber">電話番号</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="例: 03-1234-5678"
              />
            </div>

            {/* 住所1 */}
            <div className="col-span-2 grid gap-1.5">
              <Label htmlFor="addressLine1">住所1</Label>
              <Input
                id="addressLine1"
                name="addressLine1"
                value={formData.addressLine1}
                onChange={handleChange}
                placeholder="例: 東京都千代田区丸の内1-1-1"
              />
            </div>

            {/* 住所2 */}
            <div className="col-span-2 grid gap-1.5">
              <Label htmlFor="addressLine2">住所2</Label>
              <Input
                id="addressLine2"
                name="addressLine2"
                value={formData.addressLine2}
                onChange={handleChange}
                placeholder="例: 本社ビル5F"
              />
            </div>

            {/* 説明 */}
            <div className="col-span-2 grid gap-1.5">
              <Label htmlFor="description">説明</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="この部門の説明を入力..."
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createDepartment.isPending}
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              disabled={!isValid || createDepartment.isPending}
            >
              {createDepartment.isPending ? '作成中...' : '作成'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
