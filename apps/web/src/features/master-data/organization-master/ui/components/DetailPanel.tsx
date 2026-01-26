/**
 * 詳細パネルコンポーネント
 * 右ペインでバージョン/部門の詳細を表示
 */

'use client';

import { ScrollArea } from '@/shared/ui';
import { Button } from '@/shared/ui';
import { X } from 'lucide-react';
import { VersionDetail } from './VersionDetail';
import { DepartmentDetail } from './DepartmentDetail';
import type { DetailPanelState } from '../../lib/types';

interface DetailPanelProps {
  state: DetailPanelState;
  onClose: () => void;
  onEditingChange: (editing: boolean) => void;
}

export function DetailPanel({
  state,
  onClose,
  onEditingChange,
}: DetailPanelProps) {
  if (!state.type || !state.id) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <p className="text-sm text-muted-foreground text-center">
          バージョンまたは部門を選択すると
          <br />
          詳細がここに表示されます
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* ヘッダー */}
      <div className="flex items-center justify-between border-b p-4">
        <h2 className="text-sm font-semibold">
          {state.type === 'version' ? 'バージョン情報' : '部門情報'}
        </h2>
        <Button
          size="icon"
          variant="ghost"
          onClick={onClose}
          aria-label="パネルを閉じる"
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* コンテンツ */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {state.type === 'version' ? (
            <VersionDetail
              versionId={state.id}
              isEditing={state.isEditing}
              onEditingChange={onEditingChange}
            />
          ) : (
            <DepartmentDetail
              departmentId={state.id}
              isEditing={state.isEditing}
              onEditingChange={onEditingChange}
            />
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
