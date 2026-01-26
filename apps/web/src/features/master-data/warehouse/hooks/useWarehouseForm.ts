'use client';

import { useState, useCallback } from 'react';
import { getMockBffClient } from '../api/MockBffClient';
// Phase UI-BFF: HttpBffClient に切り替え時はコメント解除
// import { getHttpBffClient } from '../api/HttpBffClient';
import type {
  CreateWarehouseRequest,
  UpdateWarehouseRequest,
  WarehouseDto,
  BffError,
} from '../types';
import { WarehouseErrorMessage } from '../types';

const bffClient = getMockBffClient();
// Phase UI-BFF: const bffClient = getHttpBffClient();

/**
 * 倉庫フォーム管理フック
 *
 * - 登録・更新・無効化・再有効化・既定受入倉庫設定
 * - エラー状態管理
 * - エラーメッセージ取得
 */
export function useWarehouseForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<BffError | null>(null);

  const createWarehouse = useCallback(async (request: CreateWarehouseRequest) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await bffClient.createWarehouse(request);
      return response.warehouse;
    } catch (e) {
      const bffError = e as BffError;
      setError(bffError);
      throw bffError;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const updateWarehouse = useCallback(async (id: string, request: UpdateWarehouseRequest) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await bffClient.updateWarehouse(id, request);
      return response.warehouse;
    } catch (e) {
      const bffError = e as BffError;
      setError(bffError);
      throw bffError;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const deactivateWarehouse = useCallback(async (warehouse: WarehouseDto) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await bffClient.deactivateWarehouse(warehouse.id, {
        version: warehouse.version,
      });
      return response.warehouse;
    } catch (e) {
      const bffError = e as BffError;
      setError(bffError);
      throw bffError;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const activateWarehouse = useCallback(async (warehouse: WarehouseDto) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await bffClient.activateWarehouse(warehouse.id, {
        version: warehouse.version,
      });
      return response.warehouse;
    } catch (e) {
      const bffError = e as BffError;
      setError(bffError);
      throw bffError;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const setDefaultReceivingWarehouse = useCallback(async (warehouse: WarehouseDto) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await bffClient.setDefaultReceivingWarehouse(warehouse.id, {
        version: warehouse.version,
      });
      return response;
    } catch (e) {
      const bffError = e as BffError;
      setError(bffError);
      throw bffError;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const getErrorMessage = useCallback((code?: string) => {
    if (!code) return 'エラーが発生しました';
    return WarehouseErrorMessage[code as keyof typeof WarehouseErrorMessage] ?? 'エラーが発生しました';
  }, []);

  return {
    isSubmitting,
    error,
    createWarehouse,
    updateWarehouse,
    deactivateWarehouse,
    activateWarehouse,
    setDefaultReceivingWarehouse,
    getErrorMessage,
    clearError: () => setError(null),
  };
}
