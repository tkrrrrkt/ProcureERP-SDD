// Project Master BFF Contracts

// ========== Request DTOs ==========

export interface ListProjectMasterRequest {
  page?: number
  pageSize?: number
  sortBy?: 'projectCode' | 'projectName' | 'projectShortName' | 'plannedPeriodFrom' | 'budgetAmount'
  sortOrder?: 'asc' | 'desc'
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
  plannedPeriodFrom: string // ISO 8601
  plannedPeriodTo: string // ISO 8601
  actualPeriodFrom?: string | null // ISO 8601
  actualPeriodTo?: string | null // ISO 8601
  budgetAmount: string // decimal string
}

export interface UpdateProjectMasterRequest {
  ifMatchVersion: number
  projectName?: string
  projectShortName?: string | null
  projectKanaName?: string | null
  departmentCode?: string | null
  responsibleEmployeeCode?: string | null
  responsibleEmployeeName?: string | null
  plannedPeriodFrom?: string // ISO 8601
  plannedPeriodTo?: string // ISO 8601
  actualPeriodFrom?: string | null // ISO 8601
  actualPeriodTo?: string | null // ISO 8601
  budgetAmount?: string // decimal string
}

// ========== Response DTOs ==========

export interface ProjectMasterListItem {
  id: string
  projectCode: string
  projectName: string
  projectShortName?: string | null
  projectKanaName?: string | null
  departmentCode?: string | null
  responsibleEmployeeCode?: string | null
  responsibleEmployeeName?: string | null
  plannedPeriodFrom: string // ISO 8601
  plannedPeriodTo: string // ISO 8601
  budgetAmount: string // decimal string
  isActive: boolean
}

export interface ListProjectMasterResponse {
  items: ProjectMasterListItem[]
  page: number
  pageSize: number
  totalCount: number
}

export interface ProjectMasterDetailResponse {
  id: string
  projectCode: string
  projectName: string
  projectShortName?: string | null
  projectKanaName?: string | null
  departmentCode?: string | null
  responsibleEmployeeCode?: string | null
  responsibleEmployeeName?: string | null
  plannedPeriodFrom: string // ISO 8601
  plannedPeriodTo: string // ISO 8601
  actualPeriodFrom?: string | null // ISO 8601
  actualPeriodTo?: string | null // ISO 8601
  budgetAmount: string // decimal string
  version: number
  isActive: boolean
  createdAt: string // ISO 8601
  updatedAt: string // ISO 8601
  createdBy: string
  updatedBy: string
}

