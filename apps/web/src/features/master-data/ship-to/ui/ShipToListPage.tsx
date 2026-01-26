'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/shared/ui/components/button';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/shared/ui/components/pagination';
import { useToast } from '@/shared/ui/components/use-toast';
import { ShipToSearchBar } from './ShipToSearchBar';
import { ShipToList } from './ShipToList';
import { ShipToDialog } from './ShipToDialog';
import { useShipToList } from '../hooks/useShipToList';
import type { ShipToSortBy, SortOrder, ShipToDto, ListShipTosRequest } from '../types';

/**
 * 納入先マスタ一覧ページ
 *
 * - 検索・フィルタ・ソート・ページネーション
 * - URL状態でダイアログ管理（ブラウザバック対応）
 * - Design System準拠
 */
export function ShipToListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  // URL状態から取得
  const dialog = searchParams.get('dialog');
  const editId = searchParams.get('id');

  // 検索・フィルタ状態
  const [keyword, setKeyword] = useState('');
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(undefined);
  const [sortBy, setSortBy] = useState<ShipToSortBy>('shipToCode');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // リクエストパラメータ
  const request: ListShipTosRequest = {
    page,
    pageSize,
    sortBy,
    sortOrder,
    keyword: keyword || undefined,
    isActive: isActiveFilter,
  };

  const { items, total, totalPages, isLoading, refetch } = useShipToList(request);

  // ダイアログ状態
  const isDialogOpen = dialog === 'create' || dialog === 'edit';
  const dialogMode = dialog === 'create' ? 'create' : 'edit';

  // ダイアログを閉じる
  const closeDialog = useCallback(() => {
    router.push('/master-data/ship-to', { scroll: false });
  }, [router]);

  // 新規登録ダイアログを開く
  const openCreateDialog = useCallback(() => {
    router.push('/master-data/ship-to?dialog=create', { scroll: false });
  }, [router]);

  // 編集ダイアログを開く
  const openEditDialog = useCallback(
    (shipTo: ShipToDto) => {
      router.push(`/master-data/ship-to?dialog=edit&id=${shipTo.id}`, { scroll: false });
    },
    [router]
  );

  // 成功時の処理（Design System準拠: success color）
  const handleSuccess = useCallback(() => {
    refetch();
    toast({
      title: '保存しました',
      description: dialogMode === 'create' ? '納入先を登録しました' : '納入先を更新しました',
      className: 'border-success bg-success/10',
    });
  }, [refetch, toast, dialogMode]);

  // キーワード変更時にページをリセット
  useEffect(() => {
    setPage(1);
  }, [keyword, isActiveFilter]);

  // ページネーション (totalPages, total は useShipToList から取得済み)

  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => setPage(i)}
              isActive={page === i}
              className="cursor-pointer"
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      // 最初のページ
      items.push(
        <PaginationItem key={1}>
          <PaginationLink
            onClick={() => setPage(1)}
            isActive={page === 1}
            className="cursor-pointer"
          >
            1
          </PaginationLink>
        </PaginationItem>
      );

      // 省略記号（前）
      if (page > 3) {
        items.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      // 中間のページ
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => setPage(i)}
              isActive={page === i}
              className="cursor-pointer"
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }

      // 省略記号（後）
      if (page < totalPages - 2) {
        items.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      // 最後のページ
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            onClick={() => setPage(totalPages)}
            isActive={page === totalPages}
            className="cursor-pointer"
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  return (
    <div className="container mx-auto py-6">
      <div className="space-y-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">納入先マスタ</h1>
            <p className="text-sm text-muted-foreground">
              発注時に納入先として選択できる場所を管理します
            </p>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            新規登録
          </Button>
        </div>

        {/* 検索バー */}
        <ShipToSearchBar
          keyword={keyword}
          onKeywordChange={setKeyword}
          isActiveFilter={isActiveFilter}
          onIsActiveFilterChange={setIsActiveFilter}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
        />

        {/* 件数表示 */}
        <div className="text-sm text-muted-foreground">
          {isLoading ? '読み込み中...' : `${total}件中 ${Math.min((page - 1) * pageSize + 1, total)}-${Math.min(page * pageSize, total)}件を表示`}
        </div>

        {/* テーブル */}
        <ShipToList
          items={items}
          isLoading={isLoading}
          onRowClick={openEditDialog}
        />

        {/* ページネーション */}
        {totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              {renderPaginationItems()}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className={page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>

      {/* ダイアログ */}
      <ShipToDialog
        mode={dialogMode}
        shipToId={editId}
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
