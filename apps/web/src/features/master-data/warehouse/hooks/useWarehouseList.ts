'use client';

import { useState, useEffect, useCallback } from 'react';
import { getMockBffClient } from '../api/MockBffClient';
// Phase UI-BFF: HttpBffClient に切り替え時はコメント解除
// import { getHttpBffClient } from '../api/HttpBffClient';
import type { ListWarehousesRequest, WarehouseDto } from '../types';

const bffClient = getMockBffClient();
// Phase UI-BFF: const bffClient = getHttpBffClient();

interface UseWarehouseListResult {
  items: WarehouseDto[];
  total: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * 倉庫一覧取得フック
 *
 * - ページネーション、ソート、検索対応
 * - useState/useEffectによるシンプルな実装
 */
export function useWarehouseList(request: ListWarehousesRequest): UseWarehouseListResult {
  const [items, setItems] = useState<WarehouseDto[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWarehouses = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await bffClient.listWarehouses(request);
      setItems(response.items);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : '倉庫データの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, [request.page, request.pageSize, request.sortBy, request.sortOrder, request.keyword, request.isActive]);

  useEffect(() => {
    fetchWarehouses();
  }, [fetchWarehouses]);

  return {
    items,
    total,
    totalPages,
    isLoading,
    error,
    refetch: fetchWarehouses,
  };
}

interface UseWarehouseResult {
  warehouse: WarehouseDto | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * 倉庫詳細取得フック
 *
 * - IDがnullの場合はフェッチしない
 * - 編集ダイアログで使用
 */
export function useWarehouse(id: string | null): UseWarehouseResult {
  const [warehouse, setWarehouse] = useState<WarehouseDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWarehouse = useCallback(async () => {
    if (!id) {
      setWarehouse(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await bffClient.getWarehouse(id);
      setWarehouse(response.warehouse);
    } catch (err) {
      setError(err instanceof Error ? err.message : '倉庫データの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchWarehouse();
  }, [fetchWarehouse]);

  return {
    warehouse,
    isLoading,
    error,
    refetch: fetchWarehouse,
  };
}
