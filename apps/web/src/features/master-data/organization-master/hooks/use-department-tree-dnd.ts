/**
 * Organization Master - Department Tree DnD Hook
 *
 * dnd-kit によるドラッグ＆ドロップの状態管理
 */

'use client';

import { useState, useCallback } from 'react';
import type { UniqueIdentifier, DragStartEvent, DragOverEvent, DragEndEvent } from '@dnd-kit/core';
import type { DepartmentTreeNodeDto } from '@contracts/bff/organization-master';

// =============================================================================
// Types
// =============================================================================

export interface DndState {
  activeId: UniqueIdentifier | null;
  overId: UniqueIdentifier | null;
}

export interface UseDepartmentTreeDndResult {
  dndState: DndState;
  activeNode: DepartmentTreeNodeDto | null;
  handleDragStart: (event: DragStartEvent) => void;
  handleDragOver: (event: DragOverEvent) => void;
  handleDragEnd: (event: DragEndEvent) => void;
  handleDragCancel: () => void;
  canDrop: (activeId: UniqueIdentifier, overId: UniqueIdentifier) => boolean;
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * ツリーからノードを検索
 */
function findNodeById(
  nodes: DepartmentTreeNodeDto[],
  id: string
): DepartmentTreeNodeDto | null {
  for (const node of nodes) {
    if (node.id === id) {
      return node;
    }
    const found = findNodeById(node.children, id);
    if (found) {
      return found;
    }
  }
  return null;
}

/**
 * 循環参照チェック
 * activeIdがoverIdの子孫かどうかを判定
 */
function isDescendant(
  nodes: DepartmentTreeNodeDto[],
  activeId: string,
  overId: string
): boolean {
  const activeNode = findNodeById(nodes, activeId);
  if (!activeNode) return false;

  // activeNodeの子孫にoverIdがあるかチェック
  function checkDescendant(node: DepartmentTreeNodeDto): boolean {
    if (node.id === overId) return true;
    return node.children.some(checkDescendant);
  }

  return activeNode.children.some(checkDescendant);
}

// =============================================================================
// Hook Implementation
// =============================================================================

export function useDepartmentTreeDnd(
  nodes: DepartmentTreeNodeDto[],
  onMove: (departmentId: string, newParentId: string | null) => void
): UseDepartmentTreeDndResult {
  const [dndState, setDndState] = useState<DndState>({
    activeId: null,
    overId: null,
  });

  const [activeNode, setActiveNode] = useState<DepartmentTreeNodeDto | null>(
    null
  );

  const canDrop = useCallback(
    (activeId: UniqueIdentifier, overId: UniqueIdentifier): boolean => {
      // 同じノードへのドロップは不可
      if (activeId === overId) return false;

      // 循環参照チェック
      const activeIdStr = String(activeId);
      const overIdStr = String(overId);

      if (isDescendant(nodes, activeIdStr, overIdStr)) {
        return false;
      }

      return true;
    },
    [nodes]
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;

      setDndState({
        activeId: active.id,
        overId: null,
      });

      const node = findNodeById(nodes, String(active.id));
      setActiveNode(node);
    },
    [nodes]
  );

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { over } = event;

    setDndState((prev) => ({
      ...prev,
      overId: over?.id ?? null,
    }));
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        // 循環参照チェック
        if (canDrop(active.id, over.id)) {
          // ドロップ先の部門IDを新しい親IDとして使用
          // over.id がノードIDの場合、そのノードの子として移動
          onMove(String(active.id), String(over.id));
        }
      }

      // 状態リセット
      setDndState({
        activeId: null,
        overId: null,
      });
      setActiveNode(null);
    },
    [canDrop, onMove]
  );

  const handleDragCancel = useCallback(() => {
    setDndState({
      activeId: null,
      overId: null,
    });
    setActiveNode(null);
  }, []);

  return {
    dndState,
    activeNode,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
    canDrop,
  };
}
