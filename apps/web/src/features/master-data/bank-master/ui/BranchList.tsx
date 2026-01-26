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
import { FileX2, Pencil, ArrowUp, ArrowDown } from 'lucide-react';
import type { BranchDto, BranchSortBy, SortOrder } from '../api/BffClient';

interface BranchListProps {
  branches: BranchDto[];
  isLoading: boolean;
  sortBy?: BranchSortBy;
  sortOrder?: SortOrder;
  onSort: (column: string) => void;
  onEditClick: (branch: BranchDto) => void;
}

export function BranchList({
  branches,
  isLoading,
  sortBy,
  sortOrder,
  onSort,
  onEditClick,
}: BranchListProps) {
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
  if (!isLoading && branches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <FileX2 className="h-10 w-10 text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground">支店データがありません</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              className="cursor-pointer select-none hover:bg-muted/50 w-28"
              onClick={() => onSort('branchCode')}
            >
              <div className="flex items-center gap-2">
                支店コード
                <SortIcon column="branchCode" />
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer select-none hover:bg-muted/50"
              onClick={() => onSort('branchName')}
            >
              <div className="flex items-center gap-2">
                支店名
                <SortIcon column="branchName" />
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer select-none hover:bg-muted/50"
              onClick={() => onSort('branchNameKana')}
            >
              <div className="flex items-center gap-2">
                支店名カナ
                <SortIcon column="branchNameKana" />
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
            <TableHead className="w-20" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading
            ? // Loading skeleton
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-10" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-12" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-16" />
                  </TableCell>
                </TableRow>
              ))
            : // Branch rows
              branches.map((branch) => (
                <TableRow key={branch.id}>
                  <TableCell className="font-mono text-sm">{branch.branchCode}</TableCell>
                  <TableCell className="font-medium">{branch.branchName}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {branch.branchNameKana || '-'}
                  </TableCell>
                  <TableCell className="text-sm text-right">{branch.displayOrder}</TableCell>
                  <TableCell>
                    <Badge variant={branch.isActive ? 'default' : 'secondary'}>
                      {branch.isActive ? '有効' : '無効'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditClick(branch)}
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      編集
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
        </TableBody>
      </Table>
    </div>
  );
}
