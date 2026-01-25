/**
 * API Contracts: Employee Assignment
 *
 * BFF ↔ Domain API の契約定義
 * SSoT: packages/contracts/src/api/employee-assignment
 */

// =============================================================================
// Assignment Type
// =============================================================================

export type AssignmentType = 'primary' | 'secondary';

// =============================================================================
// Sort Options
// =============================================================================

export type AssignmentSortBy = 'effectiveDate' | 'assignmentType';
export type SortOrder = 'asc' | 'desc';

// =============================================================================
// EmployeeAssignmentApiDto
// =============================================================================

export interface EmployeeAssignmentApiDto {
  id: string;
  employeeId: string;
  departmentStableId: string;
  assignmentType: AssignmentType;
  allocationRatio: number | null; // 0.00-100.00
  title: string | null;
  effectiveDate: string; // ISO 8601 (date only: YYYY-MM-DD)
  expiryDate: string | null; // ISO 8601 (date only: YYYY-MM-DD)
  isActive: boolean;
  version: number;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  createdBy: string | null; // login_account_id
  updatedBy: string | null; // login_account_id
}

// =============================================================================
// List Assignments
// =============================================================================

export interface ListAssignmentsApiRequest {
  sortBy?: AssignmentSortBy; // default: 'effectiveDate'
  sortOrder?: SortOrder; // default: 'desc'
}

export interface ListAssignmentsApiResponse {
  items: EmployeeAssignmentApiDto[];
}

// =============================================================================
// Get Assignment
// =============================================================================

export interface GetAssignmentApiResponse {
  assignment: EmployeeAssignmentApiDto;
}

// =============================================================================
// Create Assignment
// =============================================================================

export interface CreateAssignmentApiRequest {
  departmentStableId: string;
  assignmentType: AssignmentType;
  allocationRatio?: number; // 0.00-100.00
  title?: string;
  effectiveDate: string; // ISO 8601 (date only: YYYY-MM-DD)
  expiryDate?: string; // ISO 8601 (date only: YYYY-MM-DD)
}

export interface CreateAssignmentApiResponse {
  assignment: EmployeeAssignmentApiDto;
}

// =============================================================================
// Update Assignment
// =============================================================================

export interface UpdateAssignmentApiRequest {
  departmentStableId: string;
  assignmentType: AssignmentType;
  allocationRatio?: number | null; // 0.00-100.00
  title?: string | null;
  effectiveDate: string; // ISO 8601 (date only: YYYY-MM-DD)
  expiryDate?: string | null; // ISO 8601 (date only: YYYY-MM-DD)
  version: number; // optimistic lock
}

export interface UpdateAssignmentApiResponse {
  assignment: EmployeeAssignmentApiDto;
}

// =============================================================================
// Delete Assignment
// =============================================================================

export interface DeleteAssignmentApiRequest {
  version: number; // optimistic lock
}

export interface DeleteAssignmentApiResponse {
  success: boolean;
}
