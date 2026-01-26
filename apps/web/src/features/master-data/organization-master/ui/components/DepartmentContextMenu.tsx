/**
 * 部門コンテキストメニューコンポーネント
 * ツリーノードの右クリックメニューを提供
 */

'use client';

import React from 'react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/shared/ui';
import { Plus, Pencil, Ban, CheckCircle } from 'lucide-react';
import type { DepartmentTreeNodeDto } from '@contracts/bff/organization-master';

interface DepartmentContextMenuProps {
  children: React.ReactNode;
  node: DepartmentTreeNodeDto;
  onAddChild: (parentId: string) => void;
  onEdit: (departmentId: string) => void;
  onDeactivate: (departmentId: string) => void;
  onReactivate: (departmentId: string) => void;
}

export function DepartmentContextMenu({
  children,
  node,
  onAddChild,
  onEdit,
  onDeactivate,
  onReactivate,
}: DepartmentContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={() => onAddChild(node.id)}>
          <Plus className="mr-2 h-4 w-4" />
          子部門を追加
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onEdit(node.id)}>
          <Pencil className="mr-2 h-4 w-4" />
          編集
        </ContextMenuItem>
        <ContextMenuSeparator />
        {node.isActive ? (
          <ContextMenuItem
            onClick={() => onDeactivate(node.id)}
            className="text-destructive focus:text-destructive"
          >
            <Ban className="mr-2 h-4 w-4" />
            無効化
          </ContextMenuItem>
        ) : (
          <ContextMenuItem
            onClick={() => onReactivate(node.id)}
            className="text-green-600 focus:text-green-600"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            再有効化
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}
