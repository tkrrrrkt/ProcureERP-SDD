'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/shared/ui/components/card';
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/components/alert';
import { AlertCircle } from 'lucide-react';
import { BankList } from './BankList';
import { BankSearchBar } from './BankSearchBar';
import { BankFormDialog } from './BankFormDialog';
import type { BankDto, BankSortBy, SortOrder, BffClient } from '../api/BffClient';

interface BankListPageProps {
  onBankClick: (bankId: string) => void;
  bffClient: BffClient;
}

export function BankListPage({ onBankClick, bffClient }: BankListPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [banks, setBanks] = useState<BankDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize state from URL params
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [pageSize, setPageSize] = useState(Number(searchParams.get('pageSize')) || 50);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [sortBy, setSortBy] = useState<BankSortBy>(
    (searchParams.get('sortBy') as BankSortBy) || 'displayOrder',
  );
  const [sortOrder, setSortOrder] = useState<SortOrder>(
    (searchParams.get('sortOrder') as SortOrder) || 'asc',
  );

  const [keyword, setKeyword] = useState<string>(searchParams.get('keyword') || '');
  const [activeOnly, setActiveOnly] = useState<boolean>(
    searchParams.get('activeOnly') !== 'false',
  );

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Update URL when state changes
  useEffect(() => {
    const params = new URLSearchParams();

    // Preserve bankId if present
    const bankId = searchParams.get('bankId');
    if (bankId) {
      params.set('bankId', bankId);
    }

    if (page !== 1) params.set('page', String(page));
    if (pageSize !== 50) params.set('pageSize', String(pageSize));
    if (keyword) params.set('keyword', keyword);
    if (!activeOnly) params.set('activeOnly', 'false');
    if (sortBy !== 'displayOrder') params.set('sortBy', sortBy);
    if (sortOrder !== 'asc') params.set('sortOrder', sortOrder);

    const queryString = params.toString();
    router.replace(queryString ? `?${queryString}` : '', { scroll: false });
  }, [page, pageSize, keyword, activeOnly, sortBy, sortOrder, searchParams, router]);

  // Fetch banks
  const fetchBanks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await bffClient.listBanks({
        page,
        pageSize,
        sortBy,
        sortOrder,
        keyword: keyword.trim() || undefined,
        isActive: activeOnly ? true : undefined,
      });

      setBanks(response.items);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : '銀行データの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, sortBy, sortOrder, keyword, activeOnly, bffClient]);

  // Fetch on mount and when filters change
  useEffect(() => {
    fetchBanks();
  }, [fetchBanks]);

  // Handle sort
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column as BankSortBy);
      setSortOrder('asc');
    }
    setPage(1);
  };

  // Handle search
  const handleSearch = useCallback((value: string) => {
    setKeyword(value);
    setPage(1);
  }, []);

  // Handle active filter change
  const handleActiveFilterChange = useCallback((value: boolean) => {
    setActiveOnly(value);
    setPage(1);
  }, []);

  // Handle page size change
  const handlePageSizeChange = (value: number) => {
    setPageSize(value);
    setPage(1);
  };

  // Handle row click
  const handleRowClick = (bank: BankDto) => {
    onBankClick(bank.id);
  };

  // Handle create success
  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false);
    fetchBanks();
  };

  return (
    <main className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">銀行マスタ</h1>
        <p className="text-sm text-muted-foreground">銀行・支店情報の登録・照会・編集を行います</p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>エラー</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Content Card */}
      <Card className="p-6">
        <div className="space-y-4">
          {/* Search Bar and Actions */}
          <BankSearchBar
            onSearch={handleSearch}
            onActiveFilterChange={handleActiveFilterChange}
            onCreateClick={() => setIsCreateDialogOpen(true)}
            activeOnly={activeOnly}
          />

          {/* Bank List Table */}
          <BankList
            banks={banks}
            isLoading={isLoading}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            onRowClick={handleRowClick}
            page={page}
            pageSize={pageSize}
            total={total}
            totalPages={totalPages}
            onPageChange={setPage}
            onPageSizeChange={handlePageSizeChange}
          />
        </div>
      </Card>

      {/* Create Dialog */}
      <BankFormDialog
        mode="create"
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleCreateSuccess}
        bffClient={bffClient}
      />
    </main>
  );
}
