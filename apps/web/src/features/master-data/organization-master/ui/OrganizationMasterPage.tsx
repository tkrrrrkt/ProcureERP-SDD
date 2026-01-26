/**
 * 組織マスタ管理ページ
 *
 * 3ペインレイアウト:
 * - 左: バージョン一覧 (280px固定)
 * - 中央: 部門ツリー (flex-1)
 * - 右: 詳細パネル (400px固定、トグル可能)
 */

'use client';

import { useState, useCallback } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/shared/ui';
import { Building2, PanelRightOpen, PanelRightClose } from 'lucide-react';
import { VersionCardList } from './components/VersionCardList';
import { VersionFormDialog } from './components/VersionFormDialog';
import { DepartmentTree } from './components/DepartmentTree';
import { DepartmentFormDialog } from './components/DepartmentFormDialog';
import { DetailPanel } from './components/DetailPanel';
import type { DetailPanelState, VersionDialogState } from '../lib/types';

// TanStack Query クライアント
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5分
      retry: 1,
    },
  },
});

function OrganizationMasterContent() {
  // 選択状態
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(
    null
  );
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<
    string | null
  >(null);

  // 詳細パネル状態
  const [detailPanel, setDetailPanel] = useState<DetailPanelState>({
    type: null,
    id: null,
    isEditing: false,
  });
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(true);

  // バージョンダイアログ状態
  const [versionDialog, setVersionDialog] = useState<VersionDialogState>({
    isOpen: false,
    mode: 'create',
  });

  // 部門ダイアログ状態
  const [departmentDialog, setDepartmentDialog] = useState<{
    isOpen: boolean;
    parentId: string | null;
    parentName: string | null;
  }>({
    isOpen: false,
    parentId: null,
    parentName: null,
  });

  // バージョン選択
  const handleVersionSelect = useCallback((versionId: string) => {
    setSelectedVersionId(versionId);
    setSelectedDepartmentId(null);
    setDetailPanel({
      type: 'version',
      id: versionId,
      isEditing: false,
    });
  }, []);

  // バージョンコピー
  const handleVersionCopy = useCallback((versionId: string) => {
    setVersionDialog({
      isOpen: true,
      mode: 'copy',
      sourceId: versionId,
    });
  }, []);

  // 新規バージョン作成
  const handleCreateVersion = useCallback(() => {
    setVersionDialog({
      isOpen: true,
      mode: 'create',
    });
  }, []);

  // バージョンダイアログ成功時
  const handleVersionDialogSuccess = useCallback((versionId: string) => {
    setSelectedVersionId(versionId);
    setDetailPanel({
      type: 'version',
      id: versionId,
      isEditing: false,
    });
  }, []);

  // 部門選択
  const handleDepartmentSelect = useCallback((departmentId: string) => {
    setSelectedDepartmentId(departmentId);
    setDetailPanel({
      type: 'department',
      id: departmentId,
      isEditing: false,
    });
  }, []);

  // 部門追加
  const handleAddDepartment = useCallback(
    (parentId: string | null) => {
      // 親部門名を取得する処理は省略（実際にはクエリから取得）
      setDepartmentDialog({
        isOpen: true,
        parentId,
        parentName: parentId ? '（親部門）' : null,
      });
    },
    []
  );

  // 部門編集
  const handleEditDepartment = useCallback((departmentId: string) => {
    setSelectedDepartmentId(departmentId);
    setDetailPanel({
      type: 'department',
      id: departmentId,
      isEditing: true,
    });
  }, []);

  // 部門ダイアログ成功時
  const handleDepartmentDialogSuccess = useCallback((departmentId: string) => {
    setSelectedDepartmentId(departmentId);
    setDetailPanel({
      type: 'department',
      id: departmentId,
      isEditing: false,
    });
  }, []);

  // 詳細パネルを閉じる
  const handleCloseDetailPanel = useCallback(() => {
    setDetailPanel({
      type: null,
      id: null,
      isEditing: false,
    });
  }, []);

  // 編集モード切替
  const handleEditingChange = useCallback((editing: boolean) => {
    setDetailPanel((prev) => ({
      ...prev,
      isEditing: editing,
    }));
  }, []);

  return (
    <div className="-m-6 flex h-[calc(100vh-3.5rem)] flex-col bg-background">
      {/* ヘッダー */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b px-4">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-semibold">組織マスタ管理</h1>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsDetailPanelOpen(!isDetailPanelOpen)}
          aria-label={isDetailPanelOpen ? '詳細パネルを閉じる' : '詳細パネルを開く'}
        >
          {isDetailPanelOpen ? (
            <PanelRightClose className="h-4 w-4" />
          ) : (
            <PanelRightOpen className="h-4 w-4" />
          )}
        </Button>
      </header>

      {/* メインコンテンツ - 3ペインレイアウト */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左ペイン: バージョン一覧 */}
        <aside className="flex w-[240px] shrink-0 flex-col overflow-hidden border-r">
          <VersionCardList
            selectedVersionId={selectedVersionId}
            onVersionSelect={handleVersionSelect}
            onVersionCopy={handleVersionCopy}
            onCreateNew={handleCreateVersion}
          />
        </aside>

        {/* 中央ペイン: 部門ツリー */}
        <main className="flex flex-1 flex-col overflow-hidden">
          {selectedVersionId ? (
            <DepartmentTree
              versionId={selectedVersionId}
              selectedDepartmentId={selectedDepartmentId}
              onDepartmentSelect={handleDepartmentSelect}
              onAddDepartment={handleAddDepartment}
              onEditDepartment={handleEditDepartment}
            />
          ) : (
            <div className="flex h-full items-center justify-center p-4">
              <p className="text-center text-sm text-muted-foreground">
                バージョンを選択すると
                <br />
                部門ツリーが表示されます
              </p>
            </div>
          )}
        </main>

        {/* 右ペイン: 詳細パネル */}
        <aside
          className={cn(
            'w-[560px] shrink-0 overflow-hidden border-l transition-all duration-300',
            isDetailPanelOpen ? 'translate-x-0' : 'w-0 translate-x-full border-l-0'
          )}
        >
          <DetailPanel
            state={detailPanel}
            onClose={handleCloseDetailPanel}
            onEditingChange={handleEditingChange}
          />
        </aside>
      </div>

      {/* ダイアログ */}
      <VersionFormDialog
        open={versionDialog.isOpen}
        onOpenChange={(open) =>
          setVersionDialog((prev) => ({ ...prev, isOpen: open }))
        }
        mode={versionDialog.mode}
        sourceVersionId={versionDialog.sourceId}
        onSuccess={handleVersionDialogSuccess}
      />

      {selectedVersionId && (
        <DepartmentFormDialog
          open={departmentDialog.isOpen}
          onOpenChange={(open) =>
            setDepartmentDialog((prev) => ({ ...prev, isOpen: open }))
          }
          versionId={selectedVersionId}
          parentId={departmentDialog.parentId}
          parentName={departmentDialog.parentName}
          onSuccess={handleDepartmentDialogSuccess}
        />
      )}
    </div>
  );
}

/**
 * 組織マスタ管理ページ
 * QueryClientProviderでラップ
 */
export function OrganizationMasterPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <OrganizationMasterContent />
      <Toaster position="bottom-right" />
    </QueryClientProvider>
  );
}
