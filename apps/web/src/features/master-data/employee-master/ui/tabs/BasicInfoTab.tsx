'use client';

import { Badge } from '@/shared/ui/components/badge';
import type { EmployeeDto } from '../../api/BffClient';
import { formatDate } from '../../lib/date-utils';

interface BasicInfoTabProps {
  employee: EmployeeDto;
}

/**
 * BasicInfoTab Component
 *
 * 社員基本情報の表示（読み取り専用）
 */
export function BasicInfoTab({ employee }: BasicInfoTabProps) {
  return (
    <div className="space-y-6 h-full">
      {/* Header with status */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">基本情報</h3>
        <Badge variant={employee.isActive ? 'default' : 'secondary'}>
          {employee.isActive ? '有効' : '無効'}
        </Badge>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Employee Code */}
        <div className="space-y-1">
          <dt className="text-sm font-medium text-muted-foreground">社員コード</dt>
          <dd className="font-mono">{employee.employeeCode}</dd>
        </div>

        {/* Employee Name */}
        <div className="space-y-1">
          <dt className="text-sm font-medium text-muted-foreground">社員氏名</dt>
          <dd className="font-medium">{employee.employeeName}</dd>
        </div>

        {/* Employee Kana Name */}
        <div className="space-y-1">
          <dt className="text-sm font-medium text-muted-foreground">社員カナ名</dt>
          <dd>{employee.employeeKanaName}</dd>
        </div>

        {/* Email */}
        <div className="space-y-1">
          <dt className="text-sm font-medium text-muted-foreground">メールアドレス</dt>
          <dd>{employee.email || '-'}</dd>
        </div>

        {/* Join Date */}
        <div className="space-y-1">
          <dt className="text-sm font-medium text-muted-foreground">入社日</dt>
          <dd>{formatDate(employee.joinDate)}</dd>
        </div>

        {/* Retire Date */}
        <div className="space-y-1">
          <dt className="text-sm font-medium text-muted-foreground">退社日</dt>
          <dd>{employee.retireDate ? formatDate(employee.retireDate) : '-'}</dd>
        </div>
      </div>

      {/* Remarks (full width) */}
      {employee.remarks && (
        <div className="space-y-1">
          <dt className="text-sm font-medium text-muted-foreground">備考</dt>
          <dd className="whitespace-pre-wrap text-sm">{employee.remarks}</dd>
        </div>
      )}

      {/* Audit info */}
      <div className="pt-4 border-t">
        <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
          <div>
            <span>作成日時: </span>
            <span>{new Date(employee.createdAt).toLocaleString('ja-JP')}</span>
          </div>
          <div>
            <span>更新日時: </span>
            <span>{new Date(employee.updatedAt).toLocaleString('ja-JP')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
