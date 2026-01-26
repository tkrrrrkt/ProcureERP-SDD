'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/shared/ui/components/card';
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/components/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/components/alert-dialog';
import { AlertCircle } from 'lucide-react';
import { CompanyBankAccountList } from './CompanyBankAccountList';
import { CompanyBankAccountSearchBar } from './CompanyBankAccountSearchBar';
import { CompanyBankAccountFormDialog } from './CompanyBankAccountFormDialog';
import { getSharedBffClient } from '../api/client';
import type {
  CompanyBankAccountBffClient,
  CompanyBankAccountDto,
  CompanyBankAccountSortBy,
  SortOrder,
} from '../api/BffClient';

/**
 * Company Bank Account List Page
 */
export function CompanyBankAccountListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // BFF Client
  const bffClient: CompanyBankAccountBffClient = getSharedBffClient();

  // State from URL
  const page = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('pageSize')) || 50;
  const sortBy = (searchParams.get('sortBy') as CompanyBankAccountSortBy) || 'accountCode';
  const sortOrder = (searchParams.get('sortOrder') as SortOrder) || 'asc';
  const activeOnly = searchParams.get('activeOnly') !== 'false';

  // Local state
  const [accounts, setAccounts] = useState<CompanyBankAccountDto[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<CompanyBankAccountDto | null>(null);
  const [setDefaultDialogOpen, setSetDefaultDialogOpen] = useState(false);
  const [accountToSetDefault, setAccountToSetDefault] = useState<CompanyBankAccountDto | null>(
    null,
  );

  // Update URL params
  const updateParams = useCallback(
    (updates: Record<string, string | number | boolean | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === '' || value === true) {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });

      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  // Fetch accounts
  const fetchAccounts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await bffClient.listAccounts({
        page,
        pageSize,
        sortBy,
        sortOrder,
        isActive: activeOnly ? true : undefined,
      });

      setAccounts(response.items);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (err) {
      const apiError = err as { message?: string };
      setError(apiError.message || 'データの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, [bffClient, page, pageSize, sortBy, sortOrder, activeOnly]);

  // Initial fetch
  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  // Event handlers
  const handlePageChange = (newPage: number) => {
    updateParams({ page: newPage });
  };

  const handlePageSizeChange = (newPageSize: number) => {
    updateParams({ pageSize: newPageSize, page: 1 });
  };

  const handleSortChange = (newSortBy: CompanyBankAccountSortBy) => {
    const newSortOrder = sortBy === newSortBy && sortOrder === 'asc' ? 'desc' : 'asc';
    updateParams({ sortBy: newSortBy, sortOrder: newSortOrder, page: 1 });
  };

  const handleActiveOnlyChange = (value: boolean) => {
    updateParams({ activeOnly: value ? undefined : false, page: 1 });
  };

  const handleEdit = (account: CompanyBankAccountDto) => {
    setSelectedAccount(account);
    setEditDialogOpen(true);
  };

  const handleSetDefault = (account: CompanyBankAccountDto) => {
    setAccountToSetDefault(account);
    setSetDefaultDialogOpen(true);
  };

  const handleConfirmSetDefault = async () => {
    if (!accountToSetDefault) return;

    try {
      await bffClient.setDefaultAccount(accountToSetDefault.id, {
        version: accountToSetDefault.version,
      });
      await fetchAccounts();
    } catch (err) {
      const apiError = err as { message?: string };
      setError(apiError.message || '既定口座の設定に失敗しました');
    } finally {
      setSetDefaultDialogOpen(false);
      setAccountToSetDefault(null);
    }
  };

  const handleSuccess = () => {
    fetchAccounts();
  };

  return (
    <main className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">自社口座マスタ</h1>
        <p className="text-sm text-muted-foreground">
          支払処理で使用する自社の出金口座を管理します
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>エラー</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Card */}
      <Card className="p-6">
        <CompanyBankAccountSearchBar
          activeOnly={activeOnly}
          onActiveOnlyChange={handleActiveOnlyChange}
          onCreateClick={() => setCreateDialogOpen(true)}
        />

        <CompanyBankAccountList
          accounts={accounts}
          isLoading={isLoading}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
          page={page}
          pageSize={pageSize}
          totalPages={totalPages}
          total={total}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onEdit={handleEdit}
          onSetDefault={handleSetDefault}
        />
      </Card>

      {/* Create Dialog */}
      <CompanyBankAccountFormDialog
        mode="create"
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleSuccess}
        bffClient={bffClient}
      />

      {/* Edit Dialog */}
      <CompanyBankAccountFormDialog
        mode="edit"
        account={selectedAccount || undefined}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={handleSuccess}
        bffClient={bffClient}
      />

      {/* Set Default Confirmation Dialog */}
      <AlertDialog open={setDefaultDialogOpen} onOpenChange={setSetDefaultDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>既定口座の変更</AlertDialogTitle>
            <AlertDialogDescription>
              「{accountToSetDefault?.accountName}」を既定の出金口座に設定しますか？
              <br />
              現在の既定口座は解除されます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSetDefault}>
              変更する
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
