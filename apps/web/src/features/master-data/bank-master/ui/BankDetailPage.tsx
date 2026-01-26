'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/components/card';
import { Button } from '@/shared/ui/components/button';
import { Badge } from '@/shared/ui/components/badge';
import { Input } from '@/shared/ui/components/input';
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/components/alert';
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
import { Skeleton } from '@/shared/ui/components/skeleton';
import {
  AlertCircle,
  ArrowLeft,
  Pencil,
  Power,
  PowerOff,
  Plus,
  Search,
  AlertTriangle,
} from 'lucide-react';
import { BranchList } from './BranchList';
import { BankFormDialog } from './BankFormDialog';
import { BranchFormDialog } from './BranchFormDialog';
import type {
  BankDto,
  BranchDto,
  BranchSortBy,
  SortOrder,
  BffClient,
  WarningInfo,
} from '../api/BffClient';

interface BankDetailPageProps {
  bankId: string;
  onBack: () => void;
  bffClient: BffClient;
}

export function BankDetailPage({ bankId, onBack, bffClient }: BankDetailPageProps) {
  // Bank state
  const [bank, setBank] = useState<BankDto | null>(null);
  const [isBankLoading, setIsBankLoading] = useState(true);
  const [bankError, setBankError] = useState<string | null>(null);

  // Branch state
  const [branches, setBranches] = useState<BranchDto[]>([]);
  const [isBranchesLoading, setIsBranchesLoading] = useState(true);
  const [branchSortBy, setBranchSortBy] = useState<BranchSortBy>('displayOrder');
  const [branchSortOrder, setBranchSortOrder] = useState<SortOrder>('asc');
  const [branchKeyword, setBranchKeyword] = useState('');

  // Dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateBranchDialogOpen, setIsCreateBranchDialogOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<BranchDto | null>(null);

  // Deactivate confirmation state
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false);
  const [deactivateWarnings, setDeactivateWarnings] = useState<WarningInfo[]>([]);
  const [isDeactivating, setIsDeactivating] = useState(false);

  // Fetch bank detail
  const fetchBank = useCallback(async () => {
    try {
      setIsBankLoading(true);
      setBankError(null);
      const response = await bffClient.getBank(bankId);
      setBank(response.bank);
    } catch (err) {
      setBankError(err instanceof Error ? err.message : '銀行データの取得に失敗しました');
    } finally {
      setIsBankLoading(false);
    }
  }, [bankId, bffClient]);

  // Fetch branches
  const fetchBranches = useCallback(async () => {
    try {
      setIsBranchesLoading(true);
      const response = await bffClient.listBranches(bankId, {
        sortBy: branchSortBy,
        sortOrder: branchSortOrder,
        keyword: branchKeyword.trim() || undefined,
      });
      setBranches(response.items);
    } catch (err) {
      console.error('Failed to fetch branches:', err);
    } finally {
      setIsBranchesLoading(false);
    }
  }, [bankId, branchSortBy, branchSortOrder, branchKeyword, bffClient]);

  // Fetch on mount
  useEffect(() => {
    fetchBank();
    fetchBranches();
  }, [fetchBank, fetchBranches]);

  // Handle branch sort
  const handleBranchSort = (column: string) => {
    if (branchSortBy === column) {
      setBranchSortOrder(branchSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setBranchSortBy(column as BranchSortBy);
      setBranchSortOrder('asc');
    }
  };

  // Handle edit success
  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    fetchBank();
  };

  // Handle branch create/edit success
  const handleBranchSuccess = () => {
    setIsCreateBranchDialogOpen(false);
    setEditingBranch(null);
    fetchBranches();
  };

  // Handle deactivate/activate
  const handleToggleActive = async () => {
    if (!bank) return;

    if (bank.isActive) {
      // Check for warnings before deactivating
      setIsDeactivating(true);
      try {
        const response = await bffClient.deactivateBank(bank.id, { version: bank.version });
        if (response.warnings && response.warnings.length > 0) {
          // Show warning dialog
          setDeactivateWarnings(response.warnings);
          setIsDeactivateDialogOpen(true);
          // Revert the change (it was already applied in mock)
          await bffClient.activateBank(bank.id, { version: response.bank.version });
        } else {
          fetchBank();
        }
      } catch (err) {
        setBankError(err instanceof Error ? err.message : '無効化に失敗しました');
      } finally {
        setIsDeactivating(false);
      }
    } else {
      // Activate
      try {
        await bffClient.activateBank(bank.id, { version: bank.version });
        fetchBank();
      } catch (err) {
        setBankError(err instanceof Error ? err.message : '有効化に失敗しました');
      }
    }
  };

  // Confirm deactivate with warnings
  const handleConfirmDeactivate = async () => {
    if (!bank) return;
    setIsDeactivating(true);
    try {
      await bffClient.deactivateBank(bank.id, { version: bank.version });
      setIsDeactivateDialogOpen(false);
      fetchBank();
    } catch (err) {
      setBankError(err instanceof Error ? err.message : '無効化に失敗しました');
    } finally {
      setIsDeactivating(false);
    }
  };

  // Loading state
  if (isBankLoading) {
    return (
      <main className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  // Error state
  if (bankError || !bank) {
    return (
      <main className="container mx-auto p-6 space-y-6">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          戻る
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>エラー</AlertTitle>
          <AlertDescription>{bankError || '銀行が見つかりません'}</AlertDescription>
        </Alert>
      </main>
    );
  }

  return (
    <main className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{bank.bankName}</h1>
              <Badge variant={bank.isActive ? 'default' : 'secondary'} className="text-sm">
                {bank.isActive ? '有効' : '無効'}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">銀行コード: {bank.bankCode}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
            <Pencil className="h-4 w-4 mr-2" />
            編集
          </Button>
          <Button
            variant={bank.isActive ? 'outline' : 'default'}
            onClick={handleToggleActive}
            disabled={isDeactivating}
          >
            {bank.isActive ? (
              <>
                <PowerOff className="h-4 w-4 mr-2" />
                無効化
              </>
            ) : (
              <>
                <Power className="h-4 w-4 mr-2" />
                有効化
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Bank Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">基本情報</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-muted-foreground">銀行コード</dt>
              <dd className="font-mono mt-1">{bank.bankCode}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">SWIFTコード</dt>
              <dd className="font-mono mt-1">{bank.swiftCode || '-'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">銀行名</dt>
              <dd className="mt-1">{bank.bankName}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">銀行名カナ</dt>
              <dd className="mt-1">{bank.bankNameKana || '-'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">表示順</dt>
              <dd className="mt-1">{bank.displayOrder}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">状態</dt>
              <dd className="mt-1">
                <Badge variant={bank.isActive ? 'default' : 'secondary'}>
                  {bank.isActive ? '有効' : '無効'}
                </Badge>
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Branches Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">支店一覧</CardTitle>
            <Button size="sm" onClick={() => setIsCreateBranchDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              支店追加
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Branch Search */}
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="支店名で検索..."
              value={branchKeyword}
              onChange={(e) => setBranchKeyword(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Branch List */}
          <BranchList
            branches={branches}
            isLoading={isBranchesLoading}
            sortBy={branchSortBy}
            sortOrder={branchSortOrder}
            onSort={handleBranchSort}
            onEditClick={(branch) => setEditingBranch(branch)}
          />
        </CardContent>
      </Card>

      {/* Edit Bank Dialog */}
      <BankFormDialog
        mode="edit"
        bank={bank}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSuccess={handleEditSuccess}
        bffClient={bffClient}
      />

      {/* Create Branch Dialog */}
      <BranchFormDialog
        mode="create"
        bankId={bankId}
        open={isCreateBranchDialogOpen}
        onOpenChange={setIsCreateBranchDialogOpen}
        onSuccess={handleBranchSuccess}
        bffClient={bffClient}
      />

      {/* Edit Branch Dialog */}
      {editingBranch && (
        <BranchFormDialog
          mode="edit"
          bankId={bankId}
          branch={editingBranch}
          open={!!editingBranch}
          onOpenChange={(open) => !open && setEditingBranch(null)}
          onSuccess={handleBranchSuccess}
          bffClient={bffClient}
        />
      )}

      {/* Deactivate Warning Dialog */}
      <AlertDialog open={isDeactivateDialogOpen} onOpenChange={setIsDeactivateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              確認
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>この銀行を無効化しますか？</p>
              {deactivateWarnings.map((warning, idx) => (
                <Alert key={idx} variant="default" className="mt-2">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{warning.message}</AlertDescription>
                </Alert>
              ))}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDeactivate}>無効化する</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
