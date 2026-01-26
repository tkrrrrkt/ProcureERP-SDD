'use client';

/**
 * 採番ルール更新 Hook
 */

import { useState, useCallback } from 'react';
import type { BffClient } from '../api/BffClient';
import type {
  UpdateNumberingRuleRequest,
  UpdateNumberingRuleResponse,
  BffError,
} from '../types';

interface UseUpdateNumberingRuleResult {
  updateRule: (
    id: string,
    request: UpdateNumberingRuleRequest
  ) => Promise<UpdateNumberingRuleResponse>;
  isUpdating: boolean;
  error: BffError | null;
  clearError: () => void;
}

export function useUpdateNumberingRule(
  client: BffClient
): UseUpdateNumberingRuleResult {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<BffError | null>(null);

  const updateRule = useCallback(
    async (
      id: string,
      request: UpdateNumberingRuleRequest
    ): Promise<UpdateNumberingRuleResponse> => {
      setIsUpdating(true);
      setError(null);

      try {
        const response = await client.updateNumberingRule(id, request);
        return response;
      } catch (err) {
        const bffError = err as BffError;
        setError(bffError);
        throw bffError;
      } finally {
        setIsUpdating(false);
      }
    },
    [client]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    updateRule,
    isUpdating,
    error,
    clearError,
  };
}
