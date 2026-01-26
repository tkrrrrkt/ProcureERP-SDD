'use client';

/**
 * 採番ルール設定ページ
 *
 * このコンポーネントは AppShell 内でレンダリングされることを前提としています。
 * layout.tsx は生成しません（既存の AppShell を使用）。
 */

import { useCallback } from 'react';
import { NumberingRuleList } from './components/NumberingRuleList';
import { useNumberingRules } from './hooks/useNumberingRules';
import { useUpdateNumberingRule } from './hooks/useUpdateNumberingRule';
import { mockBffClient } from './api/MockBffClient';
import type { PeriodKind, SequenceScopeKind } from './types';

// Toast notification (仮実装 - 実際には shared/ui の Toaster を使用)
function showToast(message: string, type: 'success' | 'error' = 'success') {
  // TODO: Replace with actual toast implementation from @/shared/ui
  if (typeof window !== 'undefined') {
    // Temporary console log for development
    console.log(`[Toast ${type}]: ${message}`);
  }
}

interface NumberingRulePageProps {
  /** 編集権限の有無 */
  canEdit?: boolean;
}

export function NumberingRulePage({ canEdit = true }: NumberingRulePageProps) {
  // BFF Client (現在はモッククライアントを使用)
  const client = mockBffClient;

  // Fetch numbering rules
  const { rules, isLoading, error, mutate } = useNumberingRules(client);

  // Update numbering rule
  const {
    updateRule,
    isUpdating,
    error: updateError,
    clearError: clearUpdateError,
  } = useUpdateNumberingRule(client);

  // Handle update
  const handleUpdate = useCallback(
    async (
      id: string,
      data: {
        prefix: string;
        includeDepartmentSymbol: boolean;
        periodKind: PeriodKind;
        sequenceScopeKind: SequenceScopeKind;
        version: number;
      }
    ) => {
      try {
        await updateRule(id, data);
        // Refresh list after successful update
        await mutate();
        showToast('採番ルールを保存しました', 'success');
      } catch {
        // Error is handled by useUpdateNumberingRule hook
        showToast('保存に失敗しました', 'error');
        throw new Error('Update failed');
      }
    },
    [updateRule, mutate]
  );

  // Handle reload
  const handleReload = useCallback(() => {
    mutate();
  }, [mutate]);

  return (
    <div className="container mx-auto py-6">
      <NumberingRuleList
        rules={rules}
        isLoading={isLoading}
        error={error}
        canEdit={canEdit}
        onUpdate={handleUpdate}
        isUpdating={isUpdating}
        updateError={updateError}
        onClearUpdateError={clearUpdateError}
        onReload={handleReload}
      />
    </div>
  );
}
