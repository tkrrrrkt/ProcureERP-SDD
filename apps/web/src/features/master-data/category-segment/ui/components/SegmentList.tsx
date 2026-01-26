'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/components/table';
import { Button } from '@/shared/ui/components/button';
import { Input } from '@/shared/ui/components/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/components/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/components/tabs';
import { Badge } from '@/shared/ui/components/badge';
import { Alert, AlertDescription } from '@/shared/ui/components/alert';
import { Checkbox } from '@/shared/ui/components/checkbox';
import { Search, Plus, Pencil, AlertTriangle, List, GitBranch } from 'lucide-react';
import type { CategoryAxisDto, SegmentDto, SegmentViewMode, BffClient } from '../../api/BffClient';
import { SegmentTreeView } from './SegmentTreeView';
import { SegmentCreateDialog } from './SegmentCreateDialog';
import { SegmentEditDialog } from './SegmentEditDialog';

interface SegmentListProps {
  bffClient: BffClient;
}

export function SegmentList({ bffClient }: SegmentListProps) {
  // State
  const [axes, setAxes] = useState<CategoryAxisDto[]>([]);
  const [selectedAxisId, setSelectedAxisId] = useState<string>('');
  const [selectedAxis, setSelectedAxis] = useState<CategoryAxisDto | null>(null);
  const [segments, setSegments] = useState<SegmentDto[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // View mode
  const [viewMode, setViewMode] = useState<SegmentViewMode>('flat');

  // Filters (flat mode)
  const [keyword, setKeyword] = useState('');
  const [activeOnly, setActiveOnly] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Dialogs
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState<SegmentDto | null>(null);

  // Fetch axes
  useEffect(() => {
    const fetchAxes = async () => {
      try {
        const response = await bffClient.listCategoryAxes({ isActive: true, pageSize: 100 });
        setAxes(response.items);
        if (response.items.length > 0 && !selectedAxisId) {
          setSelectedAxisId(response.items[0].id);
        }
      } catch (err) {
        setError('カテゴリ軸の取得に失敗しました');
      }
    };
    fetchAxes();
  }, [bffClient, selectedAxisId]);

  // Update selected axis object
  useEffect(() => {
    const axis = axes.find((a) => a.id === selectedAxisId) || null;
    setSelectedAxis(axis);
  }, [axes, selectedAxisId]);

  // Fetch segments (flat mode)
  const fetchSegments = useCallback(async () => {
    if (!selectedAxisId) return;

    setLoading(true);
    setError(null);
    try {
      const response = await bffClient.listSegments({
        categoryAxisId: selectedAxisId,
        keyword: keyword || undefined,
        isActive: activeOnly ? true : undefined,
        page,
        pageSize,
      });
      setSegments(response.items);
      setTotal(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'セグメントの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [bffClient, selectedAxisId, keyword, activeOnly, page, pageSize]);

  useEffect(() => {
    if (viewMode === 'flat') {
      fetchSegments();
    }
  }, [fetchSegments, viewMode]);

  // Handlers
  const handleAxisChange = (axisId: string) => {
    setSelectedAxisId(axisId);
    setPage(1);
  };

  const handleSearch = () => {
    setPage(1);
    fetchSegments();
  };

  const handleEdit = (segment: SegmentDto) => {
    setSelectedSegment(segment);
    setEditDialogOpen(true);
  };

  // Handle edit from tree view (receives only segment ID)
  const handleEditFromTree = async (segmentId: string) => {
    try {
      const response = await bffClient.getSegment(segmentId);
      setSelectedSegment(response.segment);
      setEditDialogOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'セグメントの取得に失敗しました');
    }
  };

  const handleRefresh = () => {
    if (viewMode === 'flat') {
      fetchSegments();
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">セグメント管理</h1>
          <Select value={selectedAxisId} onValueChange={handleAxisChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="軸を選択" />
            </SelectTrigger>
            <SelectContent>
              {axes.map((axis) => (
                <SelectItem key={axis.id} value={axis.id}>
                  {axis.axisName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} disabled={!selectedAxisId}>
          <Plus className="mr-2 h-4 w-4" />
          新規登録
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* View Mode Tabs */}
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as SegmentViewMode)}>
        <TabsList>
          <TabsTrigger value="flat">
            <List className="mr-2 h-4 w-4" />
            フラット表示
          </TabsTrigger>
          <TabsTrigger value="tree" disabled={!selectedAxis?.supportsHierarchy}>
            <GitBranch className="mr-2 h-4 w-4" />
            階層表示
          </TabsTrigger>
        </TabsList>

        {/* Flat View */}
        <TabsContent value="flat" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="コード・名称で検索..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="segActiveOnly"
                checked={activeOnly}
                onCheckedChange={(checked) => setActiveOnly(checked === true)}
              />
              <label htmlFor="segActiveOnly" className="text-sm text-foreground cursor-pointer">
                有効のみ
              </label>
            </div>
            <Button variant="outline" onClick={handleSearch}>
              検索
            </Button>
          </div>

          {/* Table */}
          <div className="rounded-lg border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-28">コード</TableHead>
                  <TableHead>セグメント名称</TableHead>
                  <TableHead className="w-20 text-center">階層</TableHead>
                  <TableHead className="w-20 text-center">表示順</TableHead>
                  <TableHead className="w-20 text-center">状態</TableHead>
                  <TableHead className="w-24 text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                      読み込み中...
                    </TableCell>
                  </TableRow>
                ) : segments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                      データがありません
                    </TableCell>
                  </TableRow>
                ) : (
                  segments.map((segment) => (
                    <TableRow key={segment.id}>
                      <TableCell className="font-mono text-sm">{segment.segmentCode}</TableCell>
                      <TableCell className="font-medium">{segment.segmentName}</TableCell>
                      <TableCell className="text-center">{segment.hierarchyLevel}</TableCell>
                      <TableCell className="text-center">{segment.displayOrder}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={segment.isActive ? 'default' : 'outline'}>
                          {segment.isActive ? '有効' : '無効'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(segment)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                前へ
              </Button>
              <span className="text-sm text-muted-foreground">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                次へ
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Tree View */}
        <TabsContent value="tree">
          {selectedAxis?.supportsHierarchy && (
            <SegmentTreeView
              bffClient={bffClient}
              categoryAxisId={selectedAxisId}
              onEdit={handleEditFromTree}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      {selectedAxis && (
        <SegmentCreateDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          bffClient={bffClient}
          axis={selectedAxis}
          onSuccess={handleRefresh}
        />
      )}

      {selectedSegment && selectedAxis && (
        <SegmentEditDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          bffClient={bffClient}
          segment={selectedSegment}
          axis={selectedAxis}
          onSuccess={handleRefresh}
        />
      )}
    </div>
  );
}
