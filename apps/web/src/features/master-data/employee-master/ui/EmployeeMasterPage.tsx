'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/shared/ui/components/card';
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/components/alert';
import { AlertCircle } from 'lucide-react';
import { EmployeeList } from './EmployeeList';
import { EmployeeSearchBar } from './EmployeeSearchBar';
import { EmployeeFormDialog } from './EmployeeFormDialog';
import { EmployeeDetailDialog } from './EmployeeDetailDialog';
import { HttpBffClient } from '../api/HttpBffClient';
import { MockBffClient } from '../api/MockBffClient';
import type { EmployeeDto, EmployeeSortBy, SortOrder, BffClient } from '../api/BffClient';

// Toggle between Mock and Http client for development/production
// Set to true to use MockBffClient (no backend required)
const USE_MOCK_CLIENT = true;
const bffClient: BffClient = USE_MOCK_CLIENT ? new MockBffClient() : new HttpBffClient();

export function EmployeeMasterPage() {
  const [employees, setEmployees] = useState<EmployeeDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Sorting state
  const [sortBy, setSortBy] = useState<EmployeeSortBy>('employeeCode');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Search state
  const [keyword, setKeyword] = useState<string>('');

  // Dialog state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeDto | null>(null);

  // Fetch employees
  const fetchEmployees = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await bffClient.listEmployees({
        page,
        pageSize,
        sortBy,
        sortOrder,
        keyword: keyword.trim() || undefined,
      });

      setEmployees(response.items);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : '社員データの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, sortBy, sortOrder, keyword]);

  // Fetch on mount and when filters change
  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Handle sort
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column as EmployeeSortBy);
      setSortOrder('asc');
    }
    setPage(1); // Reset to first page on sort change
  };

  // Handle search
  const handleSearch = useCallback((value: string) => {
    setKeyword(value);
    setPage(1); // Reset to first page on search
  }, []);

  // Handle page size change
  const handlePageSizeChange = (value: number) => {
    setPageSize(value);
    setPage(1); // Reset to first page on page size change
  };

  // Handle row click (open detail dialog)
  const handleRowClick = (employee: EmployeeDto) => {
    setSelectedEmployee(employee);
  };

  // Handle create success
  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false);
    fetchEmployees();
  };

  // Handle detail dialog update (employee was edited)
  const handleDetailUpdate = () => {
    // Refresh the list and the selected employee
    fetchEmployees();
    // Also refresh the selected employee data
    if (selectedEmployee) {
      bffClient.getEmployee(selectedEmployee.id).then((response) => {
        setSelectedEmployee(response.employee);
      }).catch(() => {
        // If employee no longer exists, close the dialog
        setSelectedEmployee(null);
      });
    }
  };

  return (
    <main className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">社員マスタ</h1>
        <p className="text-sm text-muted-foreground">社員情報の登録・照会・編集を行います</p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>エラー</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Content Card */}
      <Card className="p-6">
        <div className="space-y-4">
          {/* Search Bar and Actions */}
          <EmployeeSearchBar
            onSearch={handleSearch}
            onCreateClick={() => setIsCreateDialogOpen(true)}
          />

          {/* Employee List Table */}
          <EmployeeList
            employees={employees}
            isLoading={isLoading}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            onRowClick={handleRowClick}
            // Pagination props
            page={page}
            pageSize={pageSize}
            total={total}
            totalPages={totalPages}
            onPageChange={setPage}
            onPageSizeChange={handlePageSizeChange}
          />
        </div>
      </Card>

      {/* Create Dialog */}
      <EmployeeFormDialog
        mode="create"
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleCreateSuccess}
        bffClient={bffClient}
      />

      {/* Detail Dialog (with tabs: Basic Info, Assignments) */}
      {selectedEmployee && (
        <EmployeeDetailDialog
          employee={selectedEmployee}
          open={!!selectedEmployee}
          onOpenChange={(open) => !open && setSelectedEmployee(null)}
          onUpdate={handleDetailUpdate}
          bffClient={bffClient}
        />
      )}
    </main>
  );
}
