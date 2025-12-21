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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/shared/ui/components/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/components/select';
import { ArrowUp, ArrowDown, FileX2 } from 'lucide-react';
import type { EmployeeDto, EmployeeSortBy, SortOrder } from '../api/BffClient';
import { formatDate } from '../lib/date-utils';

interface EmployeeListProps {
  employees: EmployeeDto[];
  isLoading: boolean;
  sortBy?: EmployeeSortBy;
  sortOrder?: SortOrder;
  onSort: (column: string) => void;
  onRowClick: (employee: EmployeeDto) => void;
  // Pagination
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export function EmployeeList({
  employees,
  isLoading,
  sortBy,
  sortOrder,
  onSort,
  onRowClick,
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: EmployeeListProps) {
  // Sort indicator
  const SortIcon = ({ column }: { column: string }) => {
    if (sortBy !== column) return null;
    return sortOrder === 'asc' ? (
      <ArrowUp className="h-4 w-4" />
    ) : (
      <ArrowDown className="h-4 w-4" />
    );
  };

  // Empty state
  if (!isLoading && employees.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileX2 className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground">社員データがありません</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer select-none hover:bg-muted/50"
                onClick={() => onSort('employeeCode')}
              >
                <div className="flex items-center gap-2">
                  社員コード
                  <SortIcon column="employeeCode" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none hover:bg-muted/50"
                onClick={() => onSort('employeeName')}
              >
                <div className="flex items-center gap-2">
                  社員氏名
                  <SortIcon column="employeeName" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none hover:bg-muted/50"
                onClick={() => onSort('employeeKanaName')}
              >
                <div className="flex items-center gap-2">
                  社員カナ名
                  <SortIcon column="employeeKanaName" />
                </div>
              </TableHead>
              <TableHead>メールアドレス</TableHead>
              <TableHead
                className="cursor-pointer select-none hover:bg-muted/50"
                onClick={() => onSort('joinDate')}
              >
                <div className="flex items-center gap-2">
                  入社日
                  <SortIcon column="joinDate" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none hover:bg-muted/50"
                onClick={() => onSort('retireDate')}
              >
                <div className="flex items-center gap-2">
                  退社日
                  <SortIcon column="retireDate" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none hover:bg-muted/50"
                onClick={() => onSort('isActive')}
              >
                <div className="flex items-center gap-2">
                  有効フラグ
                  <SortIcon column="isActive" />
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? // Loading skeleton
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-40" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-16" />
                    </TableCell>
                  </TableRow>
                ))
              : // Employee rows
                employees.map((employee) => (
                  <TableRow
                    key={employee.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => onRowClick(employee)}
                  >
                    <TableCell className="font-mono text-sm">{employee.employeeCode}</TableCell>
                    <TableCell className="font-medium">{employee.employeeName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {employee.employeeKanaName}
                    </TableCell>
                    <TableCell className="text-sm">{employee.email || '-'}</TableCell>
                    <TableCell className="text-sm">{formatDate(employee.joinDate)}</TableCell>
                    <TableCell className="text-sm">
                      {employee.retireDate ? formatDate(employee.retireDate) : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={employee.isActive ? 'default' : 'secondary'}>
                        {employee.isActive ? '有効' : '無効'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {!isLoading && employees.length > 0 && (
        <div className="flex items-center justify-between">
          {/* Page Size Selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">表示件数:</span>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => onPageSizeChange(Number(value))}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
                <SelectItem value="200">200</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Item Count */}
          <div className="text-sm text-muted-foreground">
            全 {total} 件中 {Math.min((page - 1) * pageSize + 1, total)}-
            {Math.min(page * pageSize, total)} 件を表示
          </div>

          {/* Pagination */}
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => page > 1 && onPageChange(page - 1)}
                  className={page <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>

              {/* Page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }

                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      onClick={() => onPageChange(pageNum)}
                      isActive={page === pageNum}
                      className="cursor-pointer"
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              {totalPages > 5 && page < totalPages - 2 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              <PaginationItem>
                <PaginationNext
                  onClick={() => page < totalPages && onPageChange(page + 1)}
                  className={page >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
