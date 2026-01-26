'use client';

import { useState, useCallback } from 'react';
import { getMockBffClient } from '../api/MockBffClient';
// Phase UI-BFF: HttpBffClient に切り替え時はコメント解除
// import { getHttpBffClient } from '../api/HttpBffClient';
import type {
  CreateShipToRequest,
  UpdateShipToRequest,
  ShipToDto,
  BffError,
} from '../types';
import { ShipToErrorMessage } from '../types';

const bffClient = getMockBffClient();
// Phase UI-BFF: const bffClient = getHttpBffClient();

/**
 * 納入先フォーム管理フック
 *
 * - 登録・更新・無効化・再有効化
 * - エラー状態管理
 * - エラーメッセージ取得
 */
export function useShipToForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<BffError | null>(null);

  const createShipTo = useCallback(async (request: CreateShipToRequest) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await bffClient.createShipTo(request);
      return response.shipTo;
    } catch (e) {
      const bffError = e as BffError;
      setError(bffError);
      throw bffError;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const updateShipTo = useCallback(async (id: string, request: UpdateShipToRequest) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await bffClient.updateShipTo(id, request);
      return response.shipTo;
    } catch (e) {
      const bffError = e as BffError;
      setError(bffError);
      throw bffError;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const deactivateShipTo = useCallback(async (shipTo: ShipToDto) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await bffClient.deactivateShipTo(shipTo.id, {
        version: shipTo.version,
      });
      return response.shipTo;
    } catch (e) {
      const bffError = e as BffError;
      setError(bffError);
      throw bffError;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const activateShipTo = useCallback(async (shipTo: ShipToDto) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await bffClient.activateShipTo(shipTo.id, {
        version: shipTo.version,
      });
      return response.shipTo;
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
    return ShipToErrorMessage[code as keyof typeof ShipToErrorMessage] ?? 'エラーが発生しました';
  }, []);

  return {
    isSubmitting,
    error,
    createShipTo,
    updateShipTo,
    deactivateShipTo,
    activateShipTo,
    getErrorMessage,
    clearError: () => setError(null),
  };
}
