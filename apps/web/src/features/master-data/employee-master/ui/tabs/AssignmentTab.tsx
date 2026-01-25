'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/shared/ui/components/button';
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
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/components/alert';
import { Plus, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import type {
  BffClient,
  EmployeeAssignmentDto,
  DepartmentOptionDto,
} from '../../api/BffClient';
import { AssignmentList } from '../assignment/AssignmentList';
import { AssignmentFormDialog } from '../assignment/AssignmentFormDialog';

interface AssignmentTabProps {
  employeeId: string;
  bffClient: BffClient;
}

/**
 * AssignmentTab Component
 *
 * 社員所属情報タブ
 * - 所属一覧表示
 * - 所属登録・編集・削除
 * - 削除確認ダイアログ
 */
export function AssignmentTab({ employeeId, bffClient }: AssignmentTabProps) {
  // Data states
  const [assignments, setAssignments] = useState<EmployeeAssignmentDto[]>([]);
  const [departments, setDepartments] = useState<DepartmentOptionDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog states
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [formDialogMode, setFormDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedAssignment, setSelectedAssignment] = useState<EmployeeAssignmentDto | undefined>(
    undefined,
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState<EmployeeAssignmentDto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load assignments
  const loadAssignments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await bffClient.listAssignments(employeeId);
      setAssignments(response.items);
    } catch (err) {
      const message = err instanceof Error ? err.message : '所属情報の取得に失敗しました';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [bffClient, employeeId]);

  // Load departments
  const loadDepartments = useCallback(async () => {
    try {
      const response = await bffClient.listActiveDepartments();
      setDepartments(response.items);
    } catch {
      // Silently fail - departments will be empty
      setDepartments([]);
    }
  }, [bffClient]);

  // Initial load
  useEffect(() => {
    loadAssignments();
    loadDepartments();
  }, [loadAssignments, loadDepartments]);

  // Handle create
  const handleCreate = () => {
    setSelectedAssignment(undefined);
    setFormDialogMode('create');
    setFormDialogOpen(true);
  };

  // Handle edit
  const handleEdit = (assignment: EmployeeAssignmentDto) => {
    setSelectedAssignment(assignment);
    setFormDialogMode('edit');
    setFormDialogOpen(true);
  };

  // Handle delete request
  const handleDeleteRequest = (assignment: EmployeeAssignmentDto) => {
    setAssignmentToDelete(assignment);
    setDeleteDialogOpen(true);
  };

  // Handle delete confirm
  const handleDeleteConfirm = async () => {
    if (!assignmentToDelete) return;

    setIsDeleting(true);
    try {
      await bffClient.deleteAssignment(
        employeeId,
        assignmentToDelete.id,
        assignmentToDelete.version,
      );
      toast.success('所属情報を削除しました');
      setDeleteDialogOpen(false);
      setAssignmentToDelete(null);
      loadAssignments();
    } catch (err) {
      const message = err instanceof Error ? err.message : '削除に失敗しました';
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle form success
  const handleFormSuccess = () => {
    setFormDialogOpen(false);
    loadAssignments();
  };

  return (
    <div className="space-y-4 h-full overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">所属情報</h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadAssignments} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            更新
          </Button>
          <Button size="sm" onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            所属を追加
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>エラー</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Assignment List */}
      <AssignmentList
        assignments={assignments}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDeleteRequest}
      />

      {/* Form Dialog */}
      <AssignmentFormDialog
        mode={formDialogMode}
        employeeId={employeeId}
        assignment={selectedAssignment}
        departments={departments}
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        onSuccess={handleFormSuccess}
        bffClient={bffClient}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>所属情報を削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              {assignmentToDelete && (
                <>
                  以下の所属情報を削除します。この操作は取り消せません。
                  <div className="mt-2 p-3 bg-muted rounded-md text-sm">
                    <div>
                      <strong>部門:</strong> {assignmentToDelete.departmentName}
                    </div>
                    <div>
                      <strong>種別:</strong> {assignmentToDelete.assignmentTypeLabel}
                    </div>
                    <div>
                      <strong>期間:</strong> {assignmentToDelete.effectiveDate} 〜{' '}
                      {assignmentToDelete.expiryDate || '無期限'}
                    </div>
                  </div>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? '削除中...' : '削除'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
