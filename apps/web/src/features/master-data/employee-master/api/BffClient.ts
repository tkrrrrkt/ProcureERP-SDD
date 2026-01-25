/**
 * BFF Client Interface for Employee Master
 *
 * contracts/bff の型を使用し、BFFエンドポイントへのアクセスを抽象化
 */

// contracts/bff から型を再エクスポート (Employee)
export type {
  EmployeeDto,
  EmployeeSortBy,
  SortOrder,
  ListEmployeesRequest,
  ListEmployeesResponse,
  GetEmployeeResponse,
  CreateEmployeeRequest,
  CreateEmployeeResponse,
  UpdateEmployeeRequest,
  UpdateEmployeeResponse,
} from '@contracts/bff/employee-master';

// contracts/bff から型を再エクスポート (Assignment)
export type {
  EmployeeAssignmentDto,
  AssignmentType,
  ListAssignmentsResponse,
  CreateAssignmentRequest,
  CreateAssignmentResponse,
  UpdateAssignmentRequest,
  UpdateAssignmentResponse,
  DeleteAssignmentResponse,
  DepartmentOptionDto,
  ListActiveDepartmentsResponse,
} from '@contracts/bff/employee-assignment';

// contracts/bff/errors からエラー型を再エクスポート
export {
  EmployeeMasterErrorCode,
  EmployeeMasterErrorHttpStatus,
  EmployeeMasterErrorMessage,
} from '@contracts/bff/errors';

export {
  EmployeeAssignmentErrorCode,
  EmployeeAssignmentErrorHttpStatus,
  EmployeeAssignmentErrorMessage,
} from '@contracts/bff/errors/employee-assignment-error';

import type {
  ListEmployeesRequest,
  ListEmployeesResponse,
  GetEmployeeResponse,
  CreateEmployeeRequest,
  CreateEmployeeResponse,
  UpdateEmployeeRequest,
  UpdateEmployeeResponse,
} from '@contracts/bff/employee-master';

import type {
  ListAssignmentsResponse,
  CreateAssignmentRequest,
  CreateAssignmentResponse,
  UpdateAssignmentRequest,
  UpdateAssignmentResponse,
  DeleteAssignmentResponse,
  ListActiveDepartmentsResponse,
} from '@contracts/bff/employee-assignment';

/**
 * BFF Client Interface
 */
export interface BffClient {
  /**
   * Get employee list with pagination, sort, and search
   * GET /api/bff/master-data/employee-master
   */
  listEmployees(request: ListEmployeesRequest): Promise<ListEmployeesResponse>;

  /**
   * Get employee detail by ID
   * GET /api/bff/master-data/employee-master/:id
   */
  getEmployee(id: string): Promise<GetEmployeeResponse>;

  /**
   * Create new employee
   * POST /api/bff/master-data/employee-master
   */
  createEmployee(request: CreateEmployeeRequest): Promise<CreateEmployeeResponse>;

  /**
   * Update employee (with optimistic locking)
   * PUT /api/bff/master-data/employee-master/:id
   */
  updateEmployee(id: string, request: UpdateEmployeeRequest): Promise<UpdateEmployeeResponse>;

  // ===========================================================================
  // Assignment API
  // ===========================================================================

  /**
   * Get assignment list for an employee
   * GET /api/bff/employees/:employeeId/assignments
   */
  listAssignments(employeeId: string): Promise<ListAssignmentsResponse>;

  /**
   * Create new assignment
   * POST /api/bff/employees/:employeeId/assignments
   */
  createAssignment(
    employeeId: string,
    request: CreateAssignmentRequest,
  ): Promise<CreateAssignmentResponse>;

  /**
   * Update assignment (with optimistic locking)
   * PUT /api/bff/employees/:employeeId/assignments/:id
   */
  updateAssignment(
    employeeId: string,
    assignmentId: string,
    request: UpdateAssignmentRequest,
  ): Promise<UpdateAssignmentResponse>;

  /**
   * Delete assignment (soft delete with optimistic locking)
   * DELETE /api/bff/employees/:employeeId/assignments/:id
   */
  deleteAssignment(
    employeeId: string,
    assignmentId: string,
    version: number,
  ): Promise<DeleteAssignmentResponse>;

  /**
   * Get active departments for assignment form
   * GET /api/bff/departments/active
   */
  listActiveDepartments(): Promise<ListActiveDepartmentsResponse>;
}
