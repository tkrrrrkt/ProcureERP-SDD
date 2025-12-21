/**
 * BFF Client Interface for Employee Master
 *
 * contracts/bff の型を使用し、BFFエンドポイントへのアクセスを抽象化
 */

// contracts/bff から型を再エクスポート
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

// contracts/bff/errors からエラー型を再エクスポート
export {
  EmployeeMasterErrorCode,
  EmployeeMasterErrorHttpStatus,
  EmployeeMasterErrorMessage,
} from '@contracts/bff/errors';

import type {
  ListEmployeesRequest,
  ListEmployeesResponse,
  GetEmployeeResponse,
  CreateEmployeeRequest,
  CreateEmployeeResponse,
  UpdateEmployeeRequest,
  UpdateEmployeeResponse,
} from '@contracts/bff/employee-master';

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
}
