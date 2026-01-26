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
  Edit,
  Star,
  FileX2,
} from 'lucide-react';
import type {
  CompanyBankAccountDto,
  CompanyBankAccountSortBy,
  SortOrder,
} from '../api/BffClient';

interface CompanyBankAccountListProps {
  accounts: CompanyBankAccountDto[];
  isLoading: boolean;
  sortBy: CompanyBankAccountSortBy;
  sortOrder: SortOrder;
  onSortChange: (sortBy: CompanyBankAccountSortBy) => void;
  page: number;
  pageSize: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onEdit: (account: CompanyBankAccountDto) => void;
  onSetDefault: (account: CompanyBankAccountDto) => void;
}

/**
 * 口座区分の表示ラベル
 */
function getAccountCategoryLabel(category: string): string {
  switch (category) {
    case 'bank':
      return '銀行';
    case 'post_office':
      return 'ゆうちょ';
    default:
      return category;
  }
}

/**
 * 口座種別の表示ラベル
 */
function getAccountTypeLabel(type: string): string {
  switch (type) {
    case 'ordinary':
      return '普通';
    case 'current':
      return '当座';
    case 'savings':
      return '貯蓄';
    default:
      return type;
  }
}

/**
 * Company Bank Account List Component
 */
export function CompanyBankAccountList({
  accounts,
  isLoading,
  sortBy,
  sortOrder,
  onSortChange,
  page,
  pageSize,
  totalPages,
  total,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onSetDefault,
}: CompanyBankAccountListProps) {
  const handleSort = (column: CompanyBankAccountSortBy) => {
    onSortChange(column);
  };

  const SortIcon = ({ column }: { column: CompanyBankAccountSortBy }) => {
    if (sortBy !== column) return null;
    return sortOrder === 'asc' ? (
      <ArrowUp className="ml-1 h-4 w-4 inline" />
    ) : (
      <ArrowDown className="ml-1 h-4 w-4 inline" />
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">口座コード</TableHead>
                <TableHead>口座名</TableHead>
                <TableHead className="w-[100px]">口座区分</TableHead>
                <TableHead>銀行/ゆうちょ</TableHead>
                <TableHead className="w-[80px]">種別</TableHead>
                <TableHead className="w-[100px]">口座番号</TableHead>
                <TableHead className="w-[80px]">既定</TableHead>
                <TableHead className="w-[80px]">状態</TableHead>
                <TableHead className="w-[100px]">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <FileX2 className="h-12 w-12 mb-4" />
        <p className="text-lg font-medium">自社口座が登録されていません</p>
        <p className="text-sm">「新規登録」ボタンから口座を追加してください</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="w-[120px] cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('accountCode')}
              >
                口座コード
                <SortIcon column="accountCode" />
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('accountName')}
              >
                口座名
                <SortIcon column="accountName" />
              </TableHead>
              <TableHead className="w-[100px]">口座区分</TableHead>
              <TableHead>銀行/ゆうちょ</TableHead>
              <TableHead className="w-[80px]">種別</TableHead>
              <TableHead className="w-[100px]">口座番号</TableHead>
              <TableHead
                className="w-[80px] cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('isDefault')}
              >
                既定
                <SortIcon column="isDefault" />
              </TableHead>
              <TableHead
                className="w-[80px] cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('isActive')}
              >
                状態
                <SortIcon column="isActive" />
              </TableHead>
              <TableHead className="w-[100px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.map((account) => (
              <TableRow key={account.id}>
                <TableCell className="font-mono">{account.accountCode}</TableCell>
                <TableCell className="font-medium">{account.accountName}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {getAccountCategoryLabel(account.accountCategory)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {account.accountCategory === 'bank' ? (
                    <span>
                      {account.bankName} {account.branchName}
                    </span>
                  ) : (
                    <span className="font-mono">
                      記号: {account.postOfficeSymbol} / 番号: {account.postOfficeNumber}
                    </span>
                  )}
                </TableCell>
                <TableCell>{getAccountTypeLabel(account.accountType)}</TableCell>
                <TableCell className="font-mono">
                  {account.accountNo || '-'}
                </TableCell>
                <TableCell>
                  {account.isDefault ? (
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => onSetDefault(account)}
                    >
                      既定に
                    </Button>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={account.isActive ? 'default' : 'secondary'}>
                    {account.isActive ? '有効' : '無効'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(account)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>表示件数:</span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger className="w-[80px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          <span>/ {total}件中</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
            前へ
          </Button>
          <span className="text-sm text-muted-foreground">
            {page} / {totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
          >
            次へ
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
