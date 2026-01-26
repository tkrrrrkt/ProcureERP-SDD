'use client';

/**
 * 採番ルール一覧取得 Hook
 */

import { useState, useEffect, useCallback } from 'react';
import type { BffClient } from '../api/BffClient';
import type {
  ListNumberingRulesRequest,
  ListNumberingRulesResponse,
  NumberingRuleBffDto,
  BffError,
} from '../types';

interface UseNumberingRulesResult {
  data: ListNumberingRulesResponse | undefined;
  error: BffError | null;
  isLoading: boolean;
  mutate: () => Promise<void>;
  rules: NumberingRuleBffDto[];
}

export function useNumberingRules(
  client: BffClient,
  request?: ListNumberingRulesRequest
): UseNumberingRulesResult {
  const [data, setData] = useState<ListNumberingRulesResponse | undefined>(
    undefined
  );
  const [error, setError] = useState<BffError | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRules = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await client.listNumberingRules(request);
      setData(response);
    } catch (err) {
      setError(err as BffError);
    } finally {
      setIsLoading(false);
    }
  }, [client, request]);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const mutate = useCallback(async () => {
    await fetchRules();
  }, [fetchRules]);

  return {
    data,
    error,
    isLoading,
    mutate,
    rules: data?.rules ?? [],
  };
}
