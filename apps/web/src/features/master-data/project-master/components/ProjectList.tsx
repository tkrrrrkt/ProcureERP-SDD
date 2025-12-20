"use client"

import { Button } from "@/shared/ui/index"
import { Input } from "@/shared/ui/index"
import { Label } from "@/shared/ui/index"
import { Card } from "@/shared/ui/index"
import { Table } from "@/shared/ui/index"
import { Badge } from "@/shared/ui/index"
import { Checkbox } from "@/shared/ui/index"
import { Spinner } from "@/shared/ui/index"
import { Separator } from "@/shared/ui/index"
import type { ListProjectMasterRequest, ProjectMasterListItem } from "@contracts/bff/project-master"
import { ChevronUp, ChevronDown, Plus } from "lucide-react"

interface ProjectListProps {
  projects: ProjectMasterListItem[]
  totalCount: number
  page: number
  pageSize: number
  filters: ListProjectMasterRequest
  isLoading: boolean
  onFilterChange: (filters: Partial<ListProjectMasterRequest>) => void
  onPageChange: (page: number) => void
  onCreateClick: () => void
  onRowClick: (projectId: string) => void
}

export function ProjectList({
  projects,
  totalCount,
  page,
  pageSize,
  filters,
  isLoading,
  onFilterChange,
  onPageChange,
  onCreateClick,
  onRowClick,
}: ProjectListProps) {
  const totalPages = Math.ceil(totalCount / pageSize)

  const handleSort = (column: ListProjectMasterRequest["sortBy"]) => {
    if (filters.sortBy === column) {
      onFilterChange({
        sortOrder: filters.sortOrder === "asc" ? "desc" : "asc",
      })
    } else {
      onFilterChange({ sortBy: column, sortOrder: "asc" })
    }
  }

  const SortIcon = ({ column }: { column: string }) => {
    if (filters.sortBy !== column) return null
    return filters.sortOrder === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">検索条件</h2>
            <Button onClick={onCreateClick} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              新規登録
            </Button>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="projectCode">プロジェクトコード</Label>
              <Input
                id="projectCode"
                placeholder="PRJ001"
                value={filters.projectCode || ""}
                onChange={(e) => onFilterChange({ projectCode: e.target.value || undefined })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="projectName">プロジェクト正式名</Label>
              <Input
                id="projectName"
                placeholder="部分一致検索"
                value={filters.projectName || ""}
                onChange={(e) => onFilterChange({ projectName: e.target.value || undefined })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="projectShortName">プロジェクト略名</Label>
              <Input
                id="projectShortName"
                placeholder="部分一致検索"
                value={filters.projectShortName || ""}
                onChange={(e) =>
                  onFilterChange({
                    projectShortName: e.target.value || undefined,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="departmentCode">部門コード</Label>
              <Input
                id="departmentCode"
                placeholder="SALES"
                value={filters.departmentCode || ""}
                onChange={(e) =>
                  onFilterChange({
                    departmentCode: e.target.value || undefined,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsibleEmployeeCode">担当者コード</Label>
              <Input
                id="responsibleEmployeeCode"
                placeholder="EMP001"
                value={filters.responsibleEmployeeCode || ""}
                onChange={(e) =>
                  onFilterChange({
                    responsibleEmployeeCode: e.target.value || undefined,
                  })
                }
              />
            </div>

            <div className="flex items-end space-x-2">
              <Checkbox
                id="includeInactive"
                checked={filters.includeInactive}
                onCheckedChange={(checked) => onFilterChange({ includeInactive: checked as boolean })}
              />
              <Label htmlFor="includeInactive" className="text-sm font-normal cursor-pointer">
                無効なプロジェクトを含む
              </Label>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner className="h-8 w-8" />
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">プロジェクトが見つかりませんでした</p>
          </div>
        ) : (
          <>
            <div className="rounded-lg border">
              <Table>
                <thead className="bg-muted/50">
                  <tr>
                    <th
                      className="px-4 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-muted"
                      onClick={() => handleSort("projectCode")}
                    >
                      <div className="flex items-center gap-2">
                        プロジェクトコード
                        <SortIcon column="projectCode" />
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-muted"
                      onClick={() => handleSort("projectName")}
                    >
                      <div className="flex items-center gap-2">
                        プロジェクト正式名
                        <SortIcon column="projectName" />
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-muted"
                      onClick={() => handleSort("projectShortName")}
                    >
                      <div className="flex items-center gap-2">
                        略名
                        <SortIcon column="projectShortName" />
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">部門</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">担当者</th>
                    <th
                      className="px-4 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-muted"
                      onClick={() => handleSort("plannedPeriodFrom")}
                    >
                      <div className="flex items-center gap-2">
                        予定期間
                        <SortIcon column="plannedPeriodFrom" />
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-right text-sm font-semibold cursor-pointer hover:bg-muted"
                      onClick={() => handleSort("budgetAmount")}
                    >
                      <div className="flex items-center justify-end gap-2">
                        予算金額
                        <SortIcon column="budgetAmount" />
                      </div>
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">ステータス</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => (
                    <tr
                      key={project.id}
                      className="border-t hover:bg-muted/30 cursor-pointer transition-colors"
                      onClick={() => onRowClick(project.id)}
                    >
                      <td className="px-4 py-3 text-sm font-mono">{project.projectCode}</td>
                      <td className="px-4 py-3 text-sm">{project.projectName}</td>
                      <td className="px-4 py-3 text-sm">{project.projectShortName || "-"}</td>
                      <td className="px-4 py-3 text-sm">{project.departmentCode || "-"}</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="space-y-1">
                          {project.responsibleEmployeeCode && (
                            <div className="font-mono text-xs text-muted-foreground">
                              {project.responsibleEmployeeCode}
                            </div>
                          )}
                          {project.responsibleEmployeeName && <div>{project.responsibleEmployeeName}</div>}
                          {!project.responsibleEmployeeCode && !project.responsibleEmployeeName && "-"}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="space-y-1">
                          <div>{new Date(project.plannedPeriodFrom).toLocaleDateString("ja-JP")}</div>
                          <div className="text-muted-foreground">〜</div>
                          <div>{new Date(project.plannedPeriodTo).toLocaleDateString("ja-JP")}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-mono">
                        ¥{Number(project.budgetAmount).toLocaleString("ja-JP")}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={project.isActive ? "default" : "secondary"}>
                          {project.isActive ? "有効" : "無効"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                全 {totalCount} 件中 {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, totalCount)} 件を表示
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => onPageChange(page - 1)} disabled={page === 1}>
                  前へ
                </Button>
                <div className="text-sm">
                  {page} / {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(page + 1)}
                  disabled={page === totalPages}
                >
                  次へ
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}
