/**
 * 部門ツリーコンポーネント
 * dnd-kitによるドラッグ＆ドロップ対応のツリー表示
 */

'use client';

import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { ScrollArea } from '@/shared/ui';
import { Skeleton } from '@/shared/ui';
import { Button } from '@/shared/ui';
import { Plus } from 'lucide-react';
import { TreeFilter } from './TreeFilter';
import {
  DepartmentTreeNode,
  DepartmentTreeNodeDragOverlay,
} from './DepartmentTreeNode';
import {
  useDepartmentTree,
  useMoveDepartment,
  useDeactivateDepartment,
  useReactivateDepartment,
} from '../../hooks/use-departments';
import { useDepartmentTreeDnd } from '../../hooks/use-department-tree-dnd';
import type { DepartmentTreeNodeDto } from '@contracts/bff/organization-master';

interface DepartmentTreeProps {
  versionId: string;
  selectedDepartmentId: string | null;
  onDepartmentSelect: (departmentId: string) => void;
  onAddDepartment: (parentId: string | null) => void;
  onEditDepartment: (departmentId: string) => void;
}

/**
 * ツリーからすべてのノードIDをフラット化
 */
function flattenNodeIds(nodes: DepartmentTreeNodeDto[]): string[] {
  const ids: string[] = [];
  const traverse = (nodeList: DepartmentTreeNodeDto[]) => {
    for (const node of nodeList) {
      ids.push(node.id);
      traverse(node.children);
    }
  };
  traverse(nodes);
  return ids;
}

export function DepartmentTree({
  versionId,
  selectedDepartmentId,
  onDepartmentSelect,
  onAddDepartment,
  onEditDepartment,
}: DepartmentTreeProps) {
  const [keyword, setKeyword] = useState('');
  const [showInactive, setShowInactive] = useState(false);

  const { data, isLoading, error } = useDepartmentTree(versionId, {
    keyword: keyword || undefined,
    isActive: showInactive ? undefined : true,
  });

  const moveDepartment = useMoveDepartment();
  const deactivateDepartment = useDeactivateDepartment();
  const reactivateDepartment = useReactivateDepartment();

  const handleMove = (departmentId: string, newParentId: string | null) => {
    moveDepartment.mutate({
      departmentId,
      request: { newParentId },
    });
  };

  const nodes = data?.nodes ?? [];

  const { dndState, activeNode, handleDragStart, handleDragOver, handleDragEnd, handleDragCancel } =
    useDepartmentTreeDnd(nodes, handleMove);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const allNodeIds = flattenNodeIds(nodes);

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <TreeFilter
          keyword={keyword}
          onKeywordChange={setKeyword}
          showInactive={showInactive}
          onShowInactiveChange={setShowInactive}
        />
        <div className="p-4 space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full">
        <TreeFilter
          keyword={keyword}
          onKeywordChange={setKeyword}
          showInactive={showInactive}
          onShowInactiveChange={setShowInactive}
        />
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-sm text-destructive">
            データの取得に失敗しました
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* フィルター */}
      <TreeFilter
        keyword={keyword}
        onKeywordChange={setKeyword}
        showInactive={showInactive}
        onShowInactiveChange={setShowInactive}
      />

      {/* ヘッダー */}
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="font-semibold text-sm">
          部門ツリー
          {data?.versionCode && (
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              ({data.versionCode})
            </span>
          )}
        </h2>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onAddDepartment(null)}
          title="ルート部門を追加"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* ツリー */}
      <ScrollArea className="flex-1">
        <div className="p-4 max-w-[80%]">
          {nodes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              部門がありません
            </p>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
              onDragCancel={handleDragCancel}
            >
              <SortableContext
                items={allNodeIds}
                strategy={verticalListSortingStrategy}
              >
                {nodes.map((node) => (
                  <DepartmentTreeNode
                    key={node.id}
                    node={node}
                    selectedId={selectedDepartmentId}
                    onSelect={onDepartmentSelect}
                    onAddChild={(parentId) => onAddDepartment(parentId)}
                    onEdit={onEditDepartment}
                    onDeactivate={(id) => deactivateDepartment.mutate(id)}
                    onReactivate={(id) => reactivateDepartment.mutate(id)}
                    isDragging={dndState.activeId !== null}
                  />
                ))}
              </SortableContext>

              <DragOverlay>
                {activeNode && (
                  <DepartmentTreeNodeDragOverlay node={activeNode} />
                )}
              </DragOverlay>
            </DndContext>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
