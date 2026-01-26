/**
 * 部門ツリーノードコンポーネント
 * 階層構造の各ノードを表示・操作
 */

'use client';

import React from 'react';
import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { Badge } from '@/shared/ui';
import { ChevronRight, ChevronDown, GripVertical, Building2 } from 'lucide-react';
import { DepartmentContextMenu } from './DepartmentContextMenu';
import type { DepartmentTreeNodeDto } from '@contracts/bff/organization-master';

interface DepartmentTreeNodeProps {
  node: DepartmentTreeNodeDto;
  selectedId: string | null;
  onSelect: (departmentId: string) => void;
  onAddChild: (parentId: string) => void;
  onEdit: (departmentId: string) => void;
  onDeactivate: (departmentId: string) => void;
  onReactivate: (departmentId: string) => void;
  level?: number;
  isDragging?: boolean;
}

export function DepartmentTreeNode({
  node,
  selectedId,
  onSelect,
  onAddChild,
  onEdit,
  onDeactivate,
  onReactivate,
  level = 0,
  isDragging = false,
}: DepartmentTreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children.length > 0;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isCurrentlyDragging,
  } = useSortable({
    id: node.id,
    data: {
      type: 'department',
      node,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isSelected = selectedId === node.id;
  const isInactive = !node.isActive;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleClick = () => {
    onSelect(node.id);
  };

  return (
    <div ref={setNodeRef} style={style}>
      <DepartmentContextMenu
        node={node}
        onAddChild={onAddChild}
        onEdit={onEdit}
        onDeactivate={onDeactivate}
        onReactivate={onReactivate}
      >
        <div
          className={cn(
            'flex items-center gap-1 py-1.5 px-2 rounded-md cursor-pointer transition-colors',
            'hover:bg-muted/50',
            isSelected && 'bg-primary/10 ring-1 ring-primary',
            isCurrentlyDragging && 'opacity-50',
            isDragging && 'pointer-events-none'
          )}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={handleClick}
        >
          {/* ドラッグハンドル */}
          <button
            type="button"
            className="p-0.5 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>

          {/* 展開/折りたたみボタン */}
          <button
            type="button"
            className={cn(
              'p-0.5 rounded hover:bg-muted',
              !hasChildren && 'invisible'
            )}
            onClick={handleToggle}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>

          {/* アイコン */}
          <Building2
            className={cn(
              'h-4 w-4 shrink-0',
              isInactive ? 'text-muted-foreground' : 'text-primary'
            )}
          />

          {/* 部門情報 */}
          <div
            className={cn(
              'flex-1 min-w-0 flex items-center gap-2',
              isInactive && 'opacity-50'
            )}
          >
            <span className="text-xs font-mono text-muted-foreground">
              {node.departmentCode}
            </span>
            <span className="text-sm truncate">{node.departmentName}</span>
            {isInactive && (
              <Badge variant="secondary" className="text-xs">
                無効
              </Badge>
            )}
          </div>
        </div>
      </DepartmentContextMenu>

      {/* 子ノード */}
      {hasChildren && isExpanded && (
        <div className="ml-2">
          {node.children.map((child) => (
            <DepartmentTreeNode
              key={child.id}
              node={child}
              selectedId={selectedId}
              onSelect={onSelect}
              onAddChild={onAddChild}
              onEdit={onEdit}
              onDeactivate={onDeactivate}
              onReactivate={onReactivate}
              level={level + 1}
              isDragging={isDragging}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * ドラッグ中のプレビュー表示用コンポーネント
 */
export function DepartmentTreeNodeDragOverlay({
  node,
}: {
  node: DepartmentTreeNodeDto;
}) {
  return (
    <div className="flex items-center gap-2 py-1.5 px-3 bg-background border rounded-md shadow-lg">
      <GripVertical className="h-4 w-4 text-muted-foreground" />
      <Building2 className="h-4 w-4 text-primary" />
      <span className="text-xs font-mono text-muted-foreground">
        {node.departmentCode}
      </span>
      <span className="text-sm">{node.departmentName}</span>
    </div>
  );
}
