"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui"
import { EmployeeList } from "./components/EmployeeList"
import { EmployeeSearchPanel } from "./components/EmployeeSearchPanel"
import { CreateEmployeeDialog } from "./components/CreateEmployeeDialog"
import { EmployeeDetailDialog } from "./components/EmployeeDetailDialog"
import { HttpBffClient } from "./api/HttpBffClient"
import type {
  ListEmployeeMasterRequest,
  EmployeeMasterListItem,
  EmployeeMasterDetailResponse,
} from "@contracts/bff/employee-master"

// BFF Client instance
const bffClient = new HttpBffClient()

export default function EmployeeMasterPage() {
  // State
  const [employees, setEmployees] = useState<EmployeeMasterListItem[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Search & Filter state
  const [searchParams, setSearchParams] = useState<ListEmployeeMasterRequest>({
    page: 1,
    pageSize: 50,
    sortBy: "employeeCode",
    sortOrder: "asc",
    includeInactive: false,
  })

  // Dialog state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)

  // Fetch employees from BFF
  const fetchEmployees = async (params: ListEmployeeMasterRequest) => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await bffClient.list(params)
      setEmployees(response.items)
      setTotalCount(response.totalCount)
    } catch (err) {
      setError(err instanceof Error ? err.message : "社員一覧の取得に失敗しました")
    } finally {
      setIsLoading(false)
    }
  }

  // Load on mount and when search params change
  useEffect(() => {
    fetchEmployees(searchParams)
  }, [searchParams])

  // Event handlers
  const handleSearch = (params: Partial<ListEmployeeMasterRequest>) => {
    setSearchParams((prev) => ({
      ...prev,
      ...params,
      page: 1, // Reset to first page on new search
    }))
  }

  const handlePageChange = (page: number) => {
    setSearchParams((prev) => ({ ...prev, page }))
  }

  const handlePageSizeChange = (pageSize: number) => {
    setSearchParams((prev) => ({ ...prev, pageSize, page: 1 }))
  }

  const handleSort = (sortBy: "employeeCode" | "employeeName", sortOrder: "asc" | "desc") => {
    setSearchParams((prev) => ({ ...prev, sortBy, sortOrder }))
  }

  const handleCreateSuccess = (newEmployee: EmployeeMasterDetailResponse) => {
    setIsCreateDialogOpen(false)
    // Refresh list
    fetchEmployees(searchParams)
  }

  const handleRowClick = (employeeId: string) => {
    setSelectedEmployeeId(employeeId)
    setIsDetailDialogOpen(true)
  }

  const handleDetailClose = () => {
    setIsDetailDialogOpen(false)
    setSelectedEmployeeId(null)
  }

  const handleUpdateSuccess = () => {
    // Refresh list
    fetchEmployees(searchParams)
  }

  return (
    <main className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">社員マスタ</h1>
          <p className="text-muted-foreground mt-2">社員情報の登録・管理</p>
        </div>
      </div>

      <EmployeeSearchPanel
        onSearch={handleSearch}
        onCreateClick={() => setIsCreateDialogOpen(true)}
        includeInactive={searchParams.includeInactive || false}
      />

      <Card>
        <CardHeader>
          <CardTitle>社員一覧</CardTitle>
          <CardDescription>全{totalCount}件の社員が登録されています</CardDescription>
        </CardHeader>
        <CardContent>
          <EmployeeList
            employees={employees}
            isLoading={isLoading}
            error={error}
            pagination={{
              page: searchParams.page || 1,
              pageSize: searchParams.pageSize || 50,
              totalCount,
            }}
            sorting={{
              sortBy: searchParams.sortBy || "employeeCode",
              sortOrder: searchParams.sortOrder || "asc",
            }}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            onSort={handleSort}
            onRowClick={handleRowClick}
          />
        </CardContent>
      </Card>

      <CreateEmployeeDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleCreateSuccess}
        bffClient={bffClient}
      />

      {selectedEmployeeId && (
        <EmployeeDetailDialog
          open={isDetailDialogOpen}
          onOpenChange={setIsDetailDialogOpen}
          employeeId={selectedEmployeeId}
          onClose={handleDetailClose}
          onUpdateSuccess={handleUpdateSuccess}
          bffClient={bffClient}
        />
      )}
    </main>
  )
}
