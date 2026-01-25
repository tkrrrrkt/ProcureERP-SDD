'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/components/table';
import { Badge } from '@/shared/ui/components/badge';
import { Skeleton } from '@/shared/ui/components/skeleton';
import { Button } from '@/shared/ui/components/button';
import { FileX2, Pencil, Trash2 } from 'lucide-react';
import type { EmployeeAssignmentDto } from '../../api/BffClient';
import { formatDate } from '../../lib/date-utils';

interface AssignmentListProps {
  assignments: EmployeeAssignmentDto[];
  isLoading: boolean;
  onEdit: (assignment: EmployeeAssignmentDto) => void;
  onDelete: (assignment: EmployeeAssignmentDto) => void;
  disabled?: boolean;
}

/**
 * AssignmentList Component
 *
 * 所属一覧をテーブル形式で表示
 * - 部門名・所属種別・期間・按分率を表示
 * - 「現在有効」バッジの表示
 * - 編集・削除アクションボタン
 */
export function AssignmentList({
  assignments,
  isLoading,
  onEdit,
  onDelete,
  disabled = false,
}: AssignmentListProps) {
  // Empty state
  if (!isLoading && assignments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileX2 className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground">所属情報がありません</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg w-full overflow-hidden">
      <Table className="w-full table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[60px]">種別</TableHead>
            <TableHead className="overflow-hidden">部門</TableHead>
            <TableHead className="w-[60px] overflow-hidden">役職</TableHead>
            <TableHead className="w-[120px]">有効期間</TableHead>
            <TableHead className="w-[50px] text-right">按分</TableHead>
            <TableHead className="w-[50px] text-center">状態</TableHead>
            <TableHead className="w-[70px] text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-8 ml-auto" /></TableCell>
                  <TableCell className="text-center"><Skeleton className="h-5 w-10 mx-auto" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                </TableRow>
              ))
            : assignments.map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell className="overflow-hidden">
                    <Badge
                      variant={assignment.assignmentType === 'primary' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {assignment.assignmentTypeLabel}
                    </Badge>
                  </TableCell>
                  <TableCell className="overflow-hidden">
                    <div className="truncate font-medium text-sm" title={assignment.departmentName}>
                      {assignment.departmentName}
                    </div>
                    <div className="truncate font-mono text-xs text-muted-foreground">
                      {assignment.departmentCode}
                    </div>
                  </TableCell>
                  <TableCell className="overflow-hidden text-sm truncate">
                    {assignment.title || '-'}
                  </TableCell>
                  <TableCell className="text-xs overflow-hidden">
                    <div className="truncate">{formatDate(assignment.effectiveDate)}</div>
                    <div className="truncate text-muted-foreground">
                      〜{assignment.expiryDate ? formatDate(assignment.expiryDate) : '無期限'}
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-sm font-mono overflow-hidden">
                    {assignment.allocationRatio != null ? `${assignment.allocationRatio}%` : '-'}
                  </TableCell>
                  <TableCell className="text-center overflow-hidden">
                    {assignment.isCurrent ? (
                      <Badge className="bg-success text-success-foreground text-xs">有効</Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground text-xs">
                        期間外
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right overflow-hidden">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => onEdit(assignment)}
                        disabled={disabled}
                        title="編集"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => onDelete(assignment)}
                        disabled={disabled}
                        title="削除"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
        </TableBody>
      </Table>
    </div>
  );
}
