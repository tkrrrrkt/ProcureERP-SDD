'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/shared/ui/components/button';
import { Alert, AlertDescription } from '@/shared/ui/components/alert';
import { ChevronRight, ChevronDown, Pencil, AlertTriangle, Folder, FolderOpen } from 'lucide-react';
import type { SegmentTreeNode, BffClient } from '../../api/BffClient';
import { cn } from '@/lib/utils';

interface SegmentTreeViewProps {
  bffClient: BffClient;
  categoryAxisId: string;
  onEdit: (segmentId: string) => void;
}

interface TreeNodeProps {
  node: SegmentTreeNode;
  level: number;
  onEdit: (segmentId: string) => void;
}

function TreeNode({ node, level, onEdit }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children.length > 0;

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-2 py-2 px-3 rounded-md hover:bg-accent/50 group',
          'transition-colors duration-150'
        )}
        style={{ paddingLeft: `${level * 24 + 12}px` }}
      >
        {/* Expand/Collapse Button */}
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className={cn(
            'h-5 w-5 flex items-center justify-center rounded text-muted-foreground hover:text-foreground',
            !hasChildren && 'invisible'
          )}
        >
          {expanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>

        {/* Folder Icon */}
        {hasChildren ? (
          expanded ? (
            <FolderOpen className="h-4 w-4 text-primary" />
          ) : (
            <Folder className="h-4 w-4 text-primary" />
          )
        ) : (
          <div className="h-4 w-4" />
        )}

        {/* Segment Info */}
        <div className="flex-1 flex items-center gap-3 min-w-0">
          <span className="font-medium text-foreground truncate">
            {node.segmentName}
          </span>
          <code className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
            {node.segmentCode}
          </code>
        </div>

        {/* Edit Button */}
        <Button
          variant="ghost"
          size="sm"
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => onEdit(node.id)}
        >
          <Pencil className="h-3 w-3" />
        </Button>
      </div>

      {/* Children */}
      {expanded && hasChildren && (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              onEdit={onEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function SegmentTreeView({ bffClient, categoryAxisId, onEdit }: SegmentTreeViewProps) {
  const [tree, setTree] = useState<SegmentTreeNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTree = async () => {
      if (!categoryAxisId) return;

      setLoading(true);
      setError(null);
      try {
        const response = await bffClient.listSegmentsTree(categoryAxisId);
        setTree(response.tree);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'ツリーの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchTree();
  }, [bffClient, categoryAxisId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        読み込み中...
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (tree.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        セグメントがありません
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-2">
      {tree.map((node) => (
        <TreeNode key={node.id} node={node} level={0} onEdit={onEdit} />
      ))}
    </div>
  );
}
