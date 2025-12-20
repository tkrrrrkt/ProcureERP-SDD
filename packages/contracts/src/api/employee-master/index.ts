// Employee Master API Contracts

// ========== Request DTOs ==========

export interface ListEmployeeMasterRequest {
  offset: number
  limit: number
  sortBy: 'employeeCode' | 'employeeName'
  sortOrder: 'asc' | 'desc'
  employeeCode?: string
  employeeName?: string
  includeInactive?: boolean
}

export interface CreateEmployeeMasterRequest {
  employeeCode: string
  employeeName: string
  organizationKey?: string | null
}

export interface UpdateEmployeeMasterRequest {
  employeeName?: string
  organizationKey?: string | null
  // Note: employeeCode is NOT included (cannot be changed after creation per Requirement 4)
}

// ========== Response DTOs ==========

export interface EmployeeMasterEntity {
  id: string
  tenantId: string
  employeeCode: string
  employeeName: string
  organizationKey?: string | null
  isActive: boolean
  createdAt: string // ISO 8601, wire-format
  updatedAt: string // ISO 8601, wire-format
  createdBy: string
  updatedBy: string
}

export interface ListEmployeeMasterResponse {
  items: EmployeeMasterEntity[]
  totalCount: number
}
