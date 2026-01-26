'use client';

/**
 * 採番ルール一覧コンポーネント（インライン編集対応）
 */

import { useState, useCallback } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/shared/ui';
import { Table, TableHeader, TableBody, TableRow, TableHead } from '@/shared/ui';
import { Button } from '@/shared/ui';
import { Alert, AlertTitle, AlertDescription } from '@/shared/ui';

import type {
  NumberingRuleBffDto,
  BffError,
  PeriodKind,
  SequenceScopeKind,
} from '../types';
import { DocumentTypeErrorCode, DocumentTypeErrorMessage } from '../types';
import { NumberingRuleRow } from './NumberingRuleRow';

interface NumberingRuleListProps {
  rules: NumberingRuleBffDto[];
  isLoading: boolean;
  error: BffError | null;
  canEdit: boolean;
  onUpdate: (
    id: string,
    data: {
      prefix: string;
      includeDepartmentSymbol: boolean;
      periodKind: PeriodKind;
      sequenceScopeKind: SequenceScopeKind;
      version: number;
    }
  ) => Promise<void>;
  isUpdating: boolean;
  updateError: BffError | null;
  onClearUpdateError: () => void;
  onReload: () => void;
}

export function NumberingRuleList({
  rules,
  isLoading,
  error,
  canEdit,
  onUpdate,
  isUpdating,
  updateError,
  onClearUpdateError,
  onReload,
}: NumberingRuleListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleStartEdit = useCallback(
    (id: string) => {
      onClearUpdateError();
      setEditingId(id);
    },
    [onClearUpdateError]
  );

  const handleCancelEdit = useCallback(() => {
    onClearUpdateError();
    setEditingId(null);
  }, [onClearUpdateError]);

  const handleSave = useCallback(
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
        await onUpdate(id, data);
        setEditingId(null);
      } catch {
        // Error is displayed via updateError prop
      }
    },
    [onUpdate]
  );

  // Error message for list loading
  const errorMessage = error?.code
    ? DocumentTypeErrorMessage[error.code] || error.message
    : error?.message;

  // Error message for update
  const updateErrorMessage = updateError?.code
    ? DocumentTypeErrorMessage[updateError.code] || updateError.message
    : updateError?.message;

  const isConcurrentError =
    updateError?.code === DocumentTypeErrorCode.CONCURRENT_UPDATE;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">採番ルール設定</CardTitle>
        <CardDescription>
          各伝票種類の採番ルール（番号体系）を管理します。行をクリックして編集できます。
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-muted-foreground">読み込み中...</div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>エラー</AlertTitle>
            <AlertDescription className="flex flex-col gap-2">
              <span>{errorMessage}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={onReload}
                className="w-fit bg-transparent"
              >
                再読み込み
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Update Error Alert */}
        {updateError && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>保存エラー</AlertTitle>
            <AlertDescription className="flex flex-col gap-2">
              <span>{updateErrorMessage}</span>
              {isConcurrentError && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onClearUpdateError();
                    setEditingId(null);
                    onReload();
                  }}
                  className="w-fit bg-transparent"
                >
                  画面を再読み込み
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Empty State */}
        {!isLoading && !error && rules.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground">
              採番ルールが設定されていません。
            </p>
          </div>
        )}

        {/* Table */}
        {!isLoading && !error && rules.length > 0 && (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-28">伝票種類</TableHead>
                  <TableHead className="w-20">Prefix</TableHead>
                  <TableHead className="w-20">部門記号</TableHead>
                  <TableHead className="w-32">期間種別</TableHead>
                  <TableHead className="w-32">系列分割</TableHead>
                  <TableHead>プレビュー</TableHead>
                  {canEdit && <TableHead className="w-20"></TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map((rule) => (
                  <NumberingRuleRow
                    key={rule.id}
                    rule={rule}
                    canEdit={canEdit}
                    isUpdating={isUpdating}
                    editingId={editingId}
                    onStartEdit={handleStartEdit}
                    onCancelEdit={handleCancelEdit}
                    onSave={handleSave}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
