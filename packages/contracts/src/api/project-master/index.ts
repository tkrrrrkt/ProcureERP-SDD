// Project Master API Contracts

// ========== Request DTOs ==========

export interface ListProjectMasterRequest {
  offset: number
  limit: number
  sortBy: 'projectCode' | 'projectName' | 'projectShortName' | 'plannedPeriodFrom' | 'budgetAmount'
  sortOrder: 'asc' | 'desc'
  projectCode?: string
  projectName?: string
  projectShortName?: string
  departmentCode?: string
  responsibleEmployeeCode?: string
  includeInactive?: boolean
}

export interface CreateProjectMasterRequest {
  projectCode: string
  projectName: string
  projectShortName?: string | null
  projectKanaName?: string | null
  departmentCode?: string | null
  responsibleEmployeeCode?: string | null
  responsibleEmployeeName?: string | null
  plannedPeriodFrom: string // ISO 8601, wire-format
  plannedPeriodTo: string // ISO 8601, wire-format
  actualPeriodFrom?: string | null // ISO 8601, wire-format
  actualPeriodTo?: string | null // ISO 8601, wire-format
  budgetAmount: string // decimal string, wire-format
}

export interface UpdateProjectMasterRequest {
  ifMatchVersion: number
  projectName?: string
  projectShortName?: string | null
  projectKanaName?: string | null
  departmentCode?: string | null
  responsibleEmployeeCode?: string | null
  responsibleEmployeeName?: string | null
  plannedPeriodFrom?: string // ISO 8601, wire-format
  plannedPeriodTo?: string // ISO 8601, wire-format
  actualPeriodFrom?: string | null // ISO 8601, wire-format
  actualPeriodTo?: string | null // ISO 8601, wire-format
  budgetAmount?: string // decimal string, wire-format
}

// ========== Response DTOs ==========

export interface ProjectMasterEntity {
  id: string
  tenantId: string
  projectCode: string
  projectName: string
  projectShortName?: string | null
  projectKanaName?: string | null
  departmentCode?: string | null
  responsibleEmployeeCode?: string | null
  responsibleEmployeeName?: string | null
  plannedPeriodFrom: string // ISO 8601, wire-format
  plannedPeriodTo: string // ISO 8601, wire-format
  actualPeriodFrom?: string | null // ISO 8601, wire-format
  actualPeriodTo?: string | null // ISO 8601, wire-format
  budgetAmount: string // decimal string, wire-format
  version: number
  isActive: boolean
  createdAt: string // ISO 8601, wire-format
  updatedAt: string // ISO 8601, wire-format
  createdBy: string
  updatedBy: string
}

export interface ListProjectMasterResponse {
  items: ProjectMasterEntity[]
  totalCount: number
}

