'use client';

import { useState, useEffect, useCallback } from 'react';
import { getMockBffClient } from '../api/MockBffClient';
// Phase UI-BFF: HttpBffClient に切り替え時はコメント解除
// import { getHttpBffClient } from '../api/HttpBffClient';
import type { ListShipTosRequest, ShipToDto } from '../types';

const bffClient = getMockBffClient();
// Phase UI-BFF: const bffClient = getHttpBffClient();

interface UseShipToListResult {
  items: ShipToDto[];
  total: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * 納入先一覧取得フック
 *
 * - ページネーション、ソート、検索対応
 * - useState/useEffectによるシンプルな実装
 */
export function useShipToList(request: ListShipTosRequest): UseShipToListResult {
  const [items, setItems] = useState<ShipToDto[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchShipTos = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await bffClient.listShipTos(request);
      setItems(response.items);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : '納入先データの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, [request.page, request.pageSize, request.sortBy, request.sortOrder, request.keyword, request.isActive]);

  useEffect(() => {
    fetchShipTos();
  }, [fetchShipTos]);

  return {
    items,
    total,
    totalPages,
    isLoading,
    error,
    refetch: fetchShipTos,
  };
}

interface UseShipToResult {
  shipTo: ShipToDto | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * 納入先詳細取得フック
 *
 * - IDがnullの場合はフェッチしない
 * - 編集ダイアログで使用
 */
export function useShipTo(id: string | null): UseShipToResult {
  const [shipTo, setShipTo] = useState<ShipToDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchShipTo = useCallback(async () => {
    if (!id) {
      setShipTo(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await bffClient.getShipTo(id);
      setShipTo(response.shipTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : '納入先データの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchShipTo();
  }, [fetchShipTo]);

  return {
    shipTo,
    isLoading,
    error,
    refetch: fetchShipTo,
  };
}
