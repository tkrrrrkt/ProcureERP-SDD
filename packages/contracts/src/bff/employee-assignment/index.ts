/**
 * BFF Contracts: Employee Assignment
 *
 * UI ↔ BFF の契約定義
 * SSoT: packages/contracts/src/bff/employee-assignment
 */

// =============================================================================
// Assignment Type
// =============================================================================

export type AssignmentType = 'primary' | 'secondary';

// =============================================================================
// EmployeeAssignmentDto (UI向け、部門名解決済み)
// =============================================================================

export interface EmployeeAssignmentDto {
  id: string;
  employeeId: string;
  departmentStableId: string;
  departmentCode: string; // 解決済み
  departmentName: string; // 解決済み
  assignmentType: AssignmentType;
  assignmentTypeLabel: string; // '主務' | '兼務'
  allocationRatio: number | null; // 0.00-100.00
  title: string | null;
  effectiveDate: string; // ISO 8601 (date only: YYYY-MM-DD)
  expiryDate: string | null; // ISO 8601 (date only: YYYY-MM-DD)
  isCurrent: boolean; // 現在有効かどうか
  isActive: boolean;
  version: number;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

// =============================================================================
// List Assignments
// =============================================================================

export interface ListAssignmentsResponse {
  items: EmployeeAssignmentDto[];
}

// =============================================================================
// Create Assignment
// =============================================================================

export interface CreateAssignmentRequest {
  departmentStableId: string;
  assignmentType: AssignmentType;
  allocationRatio?: number; // 0.00-100.00
  title?: string;
  effectiveDate: string; // ISO 8601 (date only: YYYY-MM-DD)
  expiryDate?: string; // ISO 8601 (date only: YYYY-MM-DD)
}

export interface CreateAssignmentResponse {
  assignment: EmployeeAssignmentDto;
}

// =============================================================================
// Update Assignment
// =============================================================================

export interface UpdateAssignmentRequest {
  departmentStableId: string;
  assignmentType: AssignmentType;
  allocationRatio?: number | null; // 0.00-100.00
  title?: string | null;
  effectiveDate: string; // ISO 8601 (date only: YYYY-MM-DD)
  expiryDate?: string | null; // ISO 8601 (date only: YYYY-MM-DD)
  version: number; // optimistic lock
}

export interface UpdateAssignmentResponse {
  assignment: EmployeeAssignmentDto;
}

// =============================================================================
// Delete Assignment
// =============================================================================

export interface DeleteAssignmentResponse {
  success: boolean;
}

// =============================================================================
// Active Departments (部門選択用)
// =============================================================================

export interface DepartmentOptionDto {
  stableId: string;
  departmentCode: string;
  departmentName: string;
  hierarchyPath: string | null;
  hierarchyLevel: number;
  parentStableId: string | null;
}

export interface ListActiveDepartmentsResponse {
  items: DepartmentOptionDto[];
}
