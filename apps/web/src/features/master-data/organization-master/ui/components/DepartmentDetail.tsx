/**
 * 部門詳細コンポーネント
 * 右ペインで部門の詳細情報を表示・編集
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
import { useDepartmentDetail, useUpdateDepartment } from '../../hooks/use-departments';
import { formatDateTime } from '../../lib/date-utils';
import type { UpdateDepartmentRequest } from '@contracts/bff/organization-master';

interface DepartmentDetailProps {
  departmentId: string;
  isEditing: boolean;
  onEditingChange: (editing: boolean) => void;
}

export function DepartmentDetail({
  departmentId,
  isEditing,
  onEditingChange,
}: DepartmentDetailProps) {
  const { data, isLoading } = useDepartmentDetail(departmentId);
  const updateDepartment = useUpdateDepartment();

  const [formData, setFormData] = useState({
    departmentCode: '',
    departmentName: '',
    departmentNameShort: '',
    sortOrder: 0,
    postalCode: '',
    addressLine1: '',
    addressLine2: '',
    phoneNumber: '',
    description: '',
  });

  // データ取得後にフォームを初期化
  useEffect(() => {
    if (data?.department) {
      setFormData({
        departmentCode: data.department.departmentCode,
        departmentName: data.department.departmentName,
        departmentNameShort: data.department.departmentNameShort ?? '',
        sortOrder: data.department.sortOrder,
        postalCode: data.department.postalCode ?? '',
        addressLine1: data.department.addressLine1 ?? '',
        addressLine2: data.department.addressLine2 ?? '',
        phoneNumber: data.department.phoneNumber ?? '',
        description: data.department.description ?? '',
      });
    }
  }, [data]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleSave = async () => {
    if (!data?.department) return;

    const request: UpdateDepartmentRequest = {};
    const dept = data.department;

    if (formData.departmentCode !== dept.departmentCode) {
      request.departmentCode = formData.departmentCode;
    }
    if (formData.departmentName !== dept.departmentName) {
      request.departmentName = formData.departmentName;
    }
    if (formData.departmentNameShort !== (dept.departmentNameShort ?? '')) {
      request.departmentNameShort = formData.departmentNameShort || null;
    }
    if (formData.sortOrder !== dept.sortOrder) {
      request.sortOrder = formData.sortOrder;
    }
    if (formData.postalCode !== (dept.postalCode ?? '')) {
      request.postalCode = formData.postalCode || null;
    }
    if (formData.addressLine1 !== (dept.addressLine1 ?? '')) {
      request.addressLine1 = formData.addressLine1 || null;
    }
    if (formData.addressLine2 !== (dept.addressLine2 ?? '')) {
      request.addressLine2 = formData.addressLine2 || null;
    }
    if (formData.phoneNumber !== (dept.phoneNumber ?? '')) {
      request.phoneNumber = formData.phoneNumber || null;
    }
    if (formData.description !== (dept.description ?? '')) {
      request.description = formData.description || null;
    }

    if (Object.keys(request).length > 0) {
      await updateDepartment.mutateAsync({ departmentId, request });
    }

    onEditingChange(false);
  };

  const handleCancel = () => {
    if (data?.department) {
      setFormData({
        departmentCode: data.department.departmentCode,
        departmentName: data.department.departmentName,
        departmentNameShort: data.department.departmentNameShort ?? '',
        sortOrder: data.department.sortOrder,
        postalCode: data.department.postalCode ?? '',
        addressLine1: data.department.addressLine1 ?? '',
        addressLine2: data.department.addressLine2 ?? '',
        phoneNumber: data.department.phoneNumber ?? '',
        description: data.department.description ?? '',
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

  if (!data?.department) {
    return (
      <p className="text-sm text-muted-foreground">
        部門情報の取得に失敗しました
      </p>
    );
  }

  const department = data.department;

  return (
    <div className="space-y-3">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm">部門詳細</h3>
          <Badge variant={department.isActive ? 'default' : 'secondary'}>
            {department.isActive ? '有効' : '無効'}
          </Badge>
        </div>
        {isEditing ? (
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancel}
              disabled={updateDepartment.isPending}
              className="h-7 text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              キャンセル
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={updateDepartment.isPending}
              className="h-7 text-xs"
            >
              <Save className="h-3 w-3 mr-1" />
              {updateDepartment.isPending ? '保存中...' : '保存'}
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEditingChange(true)}
            className="h-7 text-xs"
          >
            <Pencil className="h-3 w-3 mr-1" />
            編集
          </Button>
        )}
      </div>

      <Separator />

      {/* 基本情報 - 2列グリッド */}
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-muted-foreground">基本情報</h4>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          {/* 部門コード */}
          <div className="space-y-0.5">
            <Label htmlFor="departmentCode" className="text-xs">
              部門コード
            </Label>
            {isEditing ? (
              <Input
                id="departmentCode"
                name="departmentCode"
                value={formData.departmentCode}
                onChange={handleChange}
                className="h-7 text-xs"
              />
            ) : (
              <p className="text-xs font-mono">{department.departmentCode}</p>
            )}
          </div>

          {/* 部門名 */}
          <div className="space-y-0.5">
            <Label htmlFor="departmentName" className="text-xs">
              部門名
            </Label>
            {isEditing ? (
              <Input
                id="departmentName"
                name="departmentName"
                value={formData.departmentName}
                onChange={handleChange}
                className="h-7 text-xs"
              />
            ) : (
              <p className="text-xs">{department.departmentName}</p>
            )}
          </div>

          {/* 略称 */}
          <div className="space-y-0.5">
            <Label htmlFor="departmentNameShort" className="text-xs">
              略称
            </Label>
            {isEditing ? (
              <Input
                id="departmentNameShort"
                name="departmentNameShort"
                value={formData.departmentNameShort}
                onChange={handleChange}
                className="h-7 text-xs"
              />
            ) : (
              <p className="text-xs">
                {department.departmentNameShort ?? '（未設定）'}
              </p>
            )}
          </div>

          {/* 表示順 */}
          <div className="space-y-0.5">
            <Label htmlFor="sortOrder" className="text-xs">
              表示順
            </Label>
            {isEditing ? (
              <Input
                id="sortOrder"
                name="sortOrder"
                type="number"
                value={formData.sortOrder}
                onChange={handleChange}
                min={0}
                className="h-7 text-xs"
              />
            ) : (
              <p className="text-xs">{department.sortOrder}</p>
            )}
          </div>

          {/* 親部門（読み取り専用） */}
          <div className="space-y-0.5">
            <Label className="text-muted-foreground text-xs">親部門</Label>
            <p className="text-xs">
              {department.parentDepartmentName ?? '（なし - ルート）'}
            </p>
          </div>

          {/* 階層パス（読み取り専用） */}
          <div className="space-y-0.5">
            <Label className="text-muted-foreground text-xs">階層パス</Label>
            <p className="text-xs font-mono">
              {department.hierarchyPath ?? '（未設定）'}
            </p>
          </div>
        </div>
      </div>

      <Separator />

      {/* 連絡先情報 - 2列グリッド */}
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-muted-foreground">連絡先情報</h4>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          {/* 郵便番号 */}
          <div className="space-y-0.5">
            <Label htmlFor="postalCode" className="text-xs">
              郵便番号
            </Label>
            {isEditing ? (
              <Input
                id="postalCode"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                placeholder="000-0000"
                className="h-7 text-xs"
              />
            ) : (
              <p className="text-xs">
                {department.postalCode ?? '（未設定）'}
              </p>
            )}
          </div>

          {/* 電話番号 */}
          <div className="space-y-0.5">
            <Label htmlFor="phoneNumber" className="text-xs">
              電話番号
            </Label>
            {isEditing ? (
              <Input
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="00-0000-0000"
                className="h-7 text-xs"
              />
            ) : (
              <p className="text-xs">
                {department.phoneNumber ?? '（未設定）'}
              </p>
            )}
          </div>

          {/* 住所1 - 2列幅 */}
          <div className="col-span-2 space-y-0.5">
            <Label htmlFor="addressLine1" className="text-xs">
              住所1
            </Label>
            {isEditing ? (
              <Input
                id="addressLine1"
                name="addressLine1"
                value={formData.addressLine1}
                onChange={handleChange}
                className="h-7 text-xs"
              />
            ) : (
              <p className="text-xs">
                {department.addressLine1 ?? '（未設定）'}
              </p>
            )}
          </div>

          {/* 住所2 - 2列幅 */}
          <div className="col-span-2 space-y-0.5">
            <Label htmlFor="addressLine2" className="text-xs">
              住所2
            </Label>
            {isEditing ? (
              <Input
                id="addressLine2"
                name="addressLine2"
                value={formData.addressLine2}
                onChange={handleChange}
                className="h-7 text-xs"
              />
            ) : (
              <p className="text-xs">
                {department.addressLine2 ?? '（未設定）'}
              </p>
            )}
          </div>
        </div>
      </div>

      <Separator />

      {/* 説明 */}
      <div className="space-y-0.5">
        <Label htmlFor="description" className="text-xs">
          説明
        </Label>
        {isEditing ? (
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={2}
            className="text-xs"
          />
        ) : (
          <p className="text-xs text-muted-foreground">
            {department.description ?? '（説明なし）'}
          </p>
        )}
      </div>

      <Separator />

      {/* メタ情報（読み取り専用） */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-0.5">
          <Label className="text-muted-foreground text-xs">作成日時</Label>
          <p className="text-xs">{formatDateTime(department.createdAt)}</p>
        </div>
        <div className="space-y-0.5">
          <Label className="text-muted-foreground text-xs">更新日時</Label>
          <p className="text-xs">{formatDateTime(department.updatedAt)}</p>
        </div>
      </div>
    </div>
  );
}
