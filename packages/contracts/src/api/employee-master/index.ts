/**
 * API Contracts: Employee Master
 *
 * BFF ↔ Domain API の契約定義
 * SSoT: packages/contracts/src/api/employee-master
 */

// =============================================================================
// Sort Options
// =============================================================================

export type EmployeeSortBy =
  | 'employeeCode'
  | 'employeeName'
  | 'employeeKanaName'
  | 'email'
  | 'joinDate'
  | 'retireDate'
  | 'isActive';

export type SortOrder = 'asc' | 'desc';

// =============================================================================
// EmployeeApiDto
// =============================================================================

export interface EmployeeApiDto {
  id: string;
  employeeCode: string;
  employeeName: string;
  employeeKanaName: string;
  email: string | null;
  joinDate: string; // ISO 8601
  retireDate: string | null; // ISO 8601
  remarks: string | null;
  isActive: boolean;
  version: number;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

// =============================================================================
// List Employees
// =============================================================================

export interface ListEmployeesApiRequest {
  offset: number; // 0-based
  limit: number;
  sortBy?: EmployeeSortBy; // default: 'employeeCode'
  sortOrder?: SortOrder; // default: 'asc'
  keyword?: string; // partial match on employeeCode, employeeName, employeeKanaName
}

export interface ListEmployeesApiResponse {
  items: EmployeeApiDto[];
  total: number;
}

// =============================================================================
// Get Employee
// =============================================================================

export interface GetEmployeeApiResponse {
  employee: EmployeeApiDto;
}

// =============================================================================
// Create Employee
// =============================================================================

export interface CreateEmployeeApiRequest {
  employeeCode: string;
  employeeName: string;
  employeeKanaName: string;
  email?: string;
  joinDate: string; // ISO 8601
  retireDate?: string; // ISO 8601
  remarks?: string;
  isActive?: boolean; // default: true
}

export interface CreateEmployeeApiResponse {
  employee: EmployeeApiDto;
}

// =============================================================================
// Update Employee
// =============================================================================

export interface UpdateEmployeeApiRequest {
  employeeCode: string;
  employeeName: string;
  employeeKanaName: string;
  email?: string;
  joinDate: string; // ISO 8601
  retireDate?: string; // ISO 8601
  remarks?: string;
  isActive: boolean;
  version: number; // optimistic lock
}

export interface UpdateEmployeeApiResponse {
  employee: EmployeeApiDto;
}
