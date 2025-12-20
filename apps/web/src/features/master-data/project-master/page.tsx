"use client"

import { useState, useEffect } from "react"
import { ProjectList } from "./components/ProjectList"
import { CreateProjectDialog } from "./components/CreateProjectDialog"
import { ProjectDetailDialog } from "./components/ProjectDetailDialog"
import { HttpBffClient } from "./api/HttpBffClient"
import type { ListProjectMasterRequest, ProjectMasterListItem } from "@contracts/bff/project-master"

export default function ProjectMasterPage() {
  const [projects, setProjects] = useState<ProjectMasterListItem[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [filters, setFilters] = useState<ListProjectMasterRequest>({
    page: 1,
    pageSize: 50,
    sortBy: "projectCode",
    sortOrder: "asc",
    includeInactive: false,
  })

  const bffClient = new HttpBffClient()

  const loadProjects = async () => {
    setIsLoading(true)
    try {
      const response = await bffClient.list(filters)
      setProjects(response.items)
      setTotalCount(response.totalCount)
      setPage(response.page)
      setPageSize(response.pageSize)
    } catch (error) {
      console.error("[v0] Failed to load projects:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadProjects()
  }, [filters])

  const handleFilterChange = (newFilters: Partial<ListProjectMasterRequest>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }))
  }

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }))
  }

  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false)
    loadProjects()
  }

  const handleDetailClose = () => {
    setSelectedProjectId(null)
    loadProjects()
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">プロジェクトマスタ</h1>
          <p className="text-sm text-muted-foreground mt-1">プロジェクト情報の登録・管理</p>
        </div>
      </div>

      <ProjectList
        projects={projects}
        totalCount={totalCount}
        page={page}
        pageSize={pageSize}
        filters={filters}
        isLoading={isLoading}
        onFilterChange={handleFilterChange}
        onPageChange={handlePageChange}
        onCreateClick={() => setIsCreateDialogOpen(true)}
        onRowClick={(projectId) => setSelectedProjectId(projectId)}
      />

      <CreateProjectDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleCreateSuccess}
        bffClient={bffClient}
      />

      {selectedProjectId && (
        <ProjectDetailDialog
          projectId={selectedProjectId}
          open={!!selectedProjectId}
          onOpenChange={(open) => !open && handleDetailClose()}
          bffClient={bffClient}
        />
      )}
    </div>
  )
}
