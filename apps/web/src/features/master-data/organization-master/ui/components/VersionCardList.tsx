/**
 * バージョンカードリストコンポーネント
 * バージョン一覧の表示
 */

'use client';

import { Button } from '@/shared/ui';
import { ScrollArea } from '@/shared/ui';
import { Skeleton } from '@/shared/ui';
import { Plus } from 'lucide-react';
import { VersionCard } from './VersionCard';
import { useVersionList } from '../../hooks/use-versions';

interface VersionCardListProps {
  selectedVersionId: string | null;
  onVersionSelect: (versionId: string) => void;
  onVersionCopy: (versionId: string) => void;
  onCreateNew: () => void;
}

export function VersionCardList({
  selectedVersionId,
  onVersionSelect,
  onVersionCopy,
  onCreateNew,
}: VersionCardListProps) {
  const { data, isLoading, error } = useVersionList({
    sortBy: 'effectiveDate',
    sortOrder: 'desc',
  });

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold text-sm">バージョン一覧</h2>
          <Skeleton className="h-8 w-8" />
        </div>
        <div className="p-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold text-sm">バージョン一覧</h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-sm text-destructive">
            データの取得に失敗しました
          </p>
        </div>
      </div>
    );
  }

  const versions = data?.items ?? [];

  return (
    <div className="flex flex-col h-full">
      {/* ヘッダー */}
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="font-semibold text-sm">バージョン一覧</h2>
        <Button size="icon" variant="ghost" onClick={onCreateNew} title="新規バージョン作成">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* リスト */}
      <ScrollArea className="flex-1">
        <div className="flex flex-col items-center px-2 py-2 space-y-2">
          {versions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              バージョンがありません
            </p>
          ) : (
            versions.map((version) => (
              <VersionCard
                key={version.id}
                version={version}
                isSelected={selectedVersionId === version.id}
                onSelect={onVersionSelect}
                onCopy={onVersionCopy}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
