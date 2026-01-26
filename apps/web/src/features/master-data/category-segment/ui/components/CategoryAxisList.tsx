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
import { Checkbox } from '@/shared/ui/components/checkbox';
import { Badge } from '@/shared/ui/components/badge';
import { Alert, AlertDescription } from '@/shared/ui/components/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/components/alert-dialog';
import { Search, Plus, Pencil, XCircle, AlertTriangle, Check } from 'lucide-react';
import type { CategoryAxisDto, TargetEntityKind, BffClient } from '../../api/BffClient';
import { CategoryAxisCreateDialog } from './CategoryAxisCreateDialog';
import { CategoryAxisEditDialog } from './CategoryAxisEditDialog';

interface CategoryAxisListProps {
  bffClient: BffClient;
}

const TARGET_ENTITY_KIND_LABELS: Record<TargetEntityKind, string> = {
  ITEM: '品目',
  PARTY: '取引先法人',
  SUPPLIER_SITE: '仕入先拠点',
};

export function CategoryAxisList({ bffClient }: CategoryAxisListProps) {
  // State
  const [axes, setAxes] = useState<CategoryAxisDto[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [keyword, setKeyword] = useState('');
  const [targetEntityKind, setTargetEntityKind] = useState<TargetEntityKind | 'ALL'>('ALL');
  const [activeOnly, setActiveOnly] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Dialogs
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
  const [selectedAxis, setSelectedAxis] = useState<CategoryAxisDto | null>(null);

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await bffClient.listCategoryAxes({
        keyword: keyword || undefined,
        targetEntityKind: targetEntityKind === 'ALL' ? undefined : targetEntityKind,
        isActive: activeOnly ? true : undefined,
        page,
        pageSize,
      });
      setAxes(response.items);
      setTotal(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : '読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  }, [bffClient, keyword, targetEntityKind, activeOnly, page, pageSize]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handlers
  const handleSearch = () => {
    setPage(1);
    fetchData();
  };

  const handleEdit = (axis: CategoryAxisDto) => {
    setSelectedAxis(axis);
    setEditDialogOpen(true);
  };

  const handleDeactivate = (axis: CategoryAxisDto) => {
    setSelectedAxis(axis);
    setDeactivateDialogOpen(true);
  };

  const confirmDeactivate = async () => {
    if (!selectedAxis) return;
    try {
      await bffClient.updateCategoryAxis(selectedAxis.id, {
        isActive: false,
        version: selectedAxis.version,
      });
      setDeactivateDialogOpen(false);
      setSelectedAxis(null);
      fetchData();
    } catch (err) {
      if (err instanceof Error && err.message === 'CONCURRENT_UPDATE') {
        setError('他のユーザーによって更新されました。再読み込みしてください。');
      } else {
        setError('無効化に失敗しました');
      }
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">カテゴリ軸管理</h1>
        <Button onClick={() => setCreateDialogOpen(true)}>
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
        <Select
          value={targetEntityKind}
          onValueChange={(v) => setTargetEntityKind(v as TargetEntityKind | 'ALL')}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="対象種別" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">すべて</SelectItem>
            <SelectItem value="ITEM">品目</SelectItem>
            <SelectItem value="PARTY">取引先法人</SelectItem>
            <SelectItem value="SUPPLIER_SITE">仕入先拠点</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <Checkbox
            id="activeOnly"
            checked={activeOnly}
            onCheckedChange={(checked) => setActiveOnly(checked === true)}
          />
          <label htmlFor="activeOnly" className="text-sm text-foreground cursor-pointer">
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
              <TableHead>軸名称</TableHead>
              <TableHead className="w-28">対象</TableHead>
              <TableHead className="w-16 text-center">階層</TableHead>
              <TableHead className="w-20 text-center">表示順</TableHead>
              <TableHead className="w-20 text-center">状態</TableHead>
              <TableHead className="w-32 text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  読み込み中...
                </TableCell>
              </TableRow>
            ) : axes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  データがありません
                </TableCell>
              </TableRow>
            ) : (
              axes.map((axis) => (
                <TableRow key={axis.id}>
                  <TableCell className="font-mono text-sm">{axis.axisCode}</TableCell>
                  <TableCell className="font-medium">{axis.axisName}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {TARGET_ENTITY_KIND_LABELS[axis.targetEntityKind]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {axis.supportsHierarchy ? (
                      <Check className="h-4 w-4 text-primary mx-auto" />
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">{axis.displayOrder}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={axis.isActive ? 'default' : 'outline'}>
                      {axis.isActive ? '有効' : '無効'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(axis)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {axis.isActive && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeactivate(axis)}
                        >
                          <XCircle className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
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

      {/* Dialogs */}
      <CategoryAxisCreateDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        bffClient={bffClient}
        onSuccess={fetchData}
      />

      {selectedAxis && (
        <CategoryAxisEditDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          bffClient={bffClient}
          axis={selectedAxis}
          onSuccess={fetchData}
        />
      )}

      <AlertDialog open={deactivateDialogOpen} onOpenChange={setDeactivateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>カテゴリ軸を無効化</AlertDialogTitle>
            <AlertDialogDescription>
              「{selectedAxis?.axisName}」を無効化しますか？
              この操作は取り消せますが、関連するセグメント割当に影響する可能性があります。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeactivate}>無効化</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
