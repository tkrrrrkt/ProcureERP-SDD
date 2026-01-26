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
import { Button } from '@/shared/ui/components/button';
import { Skeleton } from '@/shared/ui/components/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/components/select';
import {
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  FileX2,
} from 'lucide-react';
import type { BankDto, BankSortBy, SortOrder } from '../api/BffClient';

interface BankListProps {
  banks: BankDto[];
  isLoading: boolean;
  sortBy?: BankSortBy;
  sortOrder?: SortOrder;
  onSort: (column: string) => void;
  onRowClick: (bank: BankDto) => void;
  // Pagination
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export function BankList({
  banks,
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
}: BankListProps) {
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
  if (!isLoading && banks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileX2 className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-1">銀行データがありません</h3>
        <p className="text-sm text-muted-foreground">
          検索条件を変更するか、新しい銀行を登録してください
        </p>
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
                className="cursor-pointer select-none hover:bg-muted/50 w-28"
                onClick={() => onSort('bankCode')}
              >
                <div className="flex items-center gap-2">
                  銀行コード
                  <SortIcon column="bankCode" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none hover:bg-muted/50"
                onClick={() => onSort('bankName')}
              >
                <div className="flex items-center gap-2">
                  銀行名
                  <SortIcon column="bankName" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none hover:bg-muted/50"
                onClick={() => onSort('bankNameKana')}
              >
                <div className="flex items-center gap-2">
                  銀行名カナ
                  <SortIcon column="bankNameKana" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none hover:bg-muted/50 w-32"
                onClick={() => onSort('swiftCode')}
              >
                <div className="flex items-center gap-2">
                  SWIFTコード
                  <SortIcon column="swiftCode" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none hover:bg-muted/50 w-24"
                onClick={() => onSort('displayOrder')}
              >
                <div className="flex items-center gap-2">
                  表示順
                  <SortIcon column="displayOrder" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none hover:bg-muted/50 w-20"
                onClick={() => onSort('isActive')}
              >
                <div className="flex items-center gap-2">
                  状態
                  <SortIcon column="isActive" />
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? // Loading skeleton
                Array.from({ length: pageSize > 10 ? 10 : pageSize }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-12" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-28" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-36" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-12" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-16" />
                    </TableCell>
                  </TableRow>
                ))
              : // Bank rows
                banks.map((bank) => (
                  <TableRow
                    key={bank.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => onRowClick(bank)}
                  >
                    <TableCell className="font-mono text-sm">{bank.bankCode}</TableCell>
                    <TableCell className="font-medium">{bank.bankName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {bank.bankNameKana || '-'}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {bank.swiftCode || '-'}
                    </TableCell>
                    <TableCell className="text-sm text-right">{bank.displayOrder}</TableCell>
                    <TableCell>
                      <Badge variant={bank.isActive ? 'default' : 'secondary'}>
                        {bank.isActive ? '有効' : '無効'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          全{total}件中 {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, total)}件を表示
        </div>
        <div className="flex items-center gap-4">
          {/* Page size selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">表示件数:</span>
            <Select
              value={pageSize.toString()}
              onValueChange={(v) => onPageSizeChange(parseInt(v, 10))}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Page navigation */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(1)}
              disabled={page <= 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-3 text-sm">
              {page} / {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(totalPages)}
              disabled={page >= totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
