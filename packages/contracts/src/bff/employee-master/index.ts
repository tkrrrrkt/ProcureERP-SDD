/**
 * BFF Contracts: Employee Master
 *
 * UI ↔ BFF の契約定義
 * SSoT: packages/contracts/src/bff/employee-master
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
// EmployeeDto
// =============================================================================

export interface EmployeeDto {
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

export interface ListEmployeesRequest {
  page?: number; // 1-based, default: 1
  pageSize?: number; // default: 50, max: 200
  sortBy?: EmployeeSortBy; // default: 'employeeCode'
  sortOrder?: SortOrder; // default: 'asc'
  keyword?: string; // partial match on employeeCode, employeeName, employeeKanaName
}

export interface ListEmployeesResponse {
  items: EmployeeDto[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// =============================================================================
// Get Employee
// =============================================================================

export interface GetEmployeeResponse {
  employee: EmployeeDto;
}

// =============================================================================
// Create Employee
// =============================================================================

export interface CreateEmployeeRequest {
  employeeCode: string;
  employeeName: string;
  employeeKanaName: string;
  email?: string;
  joinDate: string; // ISO 8601
  retireDate?: string; // ISO 8601
  remarks?: string;
  isActive?: boolean; // default: true
}

export interface CreateEmployeeResponse {
  employee: EmployeeDto;
}

// =============================================================================
// Update Employee
// =============================================================================

export interface UpdateEmployeeRequest {
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

export interface UpdateEmployeeResponse {
  employee: EmployeeDto;
}
