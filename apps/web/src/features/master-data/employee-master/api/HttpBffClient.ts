/**
 * HTTP BFF Client for Employee Master Management
 * Real HTTP implementation for production use
 */

import type {
  BffClient,
  ListEmployeesRequest,
  ListEmployeesResponse,
  GetEmployeeResponse,
  CreateEmployeeRequest,
  CreateEmployeeResponse,
  UpdateEmployeeRequest,
  UpdateEmployeeResponse,
  ListAssignmentsResponse,
  CreateAssignmentRequest,
  CreateAssignmentResponse,
  UpdateAssignmentRequest,
  UpdateAssignmentResponse,
  DeleteAssignmentResponse,
  ListActiveDepartmentsResponse,
} from './BffClient';

export class HttpBffClient implements BffClient {
  private baseUrl: string;
  private tenantId: string;
  private userId: string;

  constructor(baseUrl = '/api/bff', tenantId = 'demo-tenant', userId = 'demo-user') {
    this.baseUrl = baseUrl;
    this.tenantId = tenantId;
    this.userId = userId;
  }

  /**
   * Build common headers including auth
   */
  private buildHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'x-tenant-id': this.tenantId,
      'x-user-id': this.userId,
    };
  }

  /**
   * Build query string from params
   */
  private buildQueryString(params: Record<string, unknown>): string {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    return searchParams.toString();
  }

  /**
   * Handle fetch response
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'リクエストに失敗しました' }));
      throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * List employees
   */
  async listEmployees(request: ListEmployeesRequest): Promise<ListEmployeesResponse> {
    const queryString = this.buildQueryString(request as Record<string, unknown>);
    const url = `${this.baseUrl}/master-data/employee-master?${queryString}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.buildHeaders(),
    });

    return this.handleResponse<ListEmployeesResponse>(response);
  }

  /**
   * Get employee by ID
   */
  async getEmployee(id: string): Promise<GetEmployeeResponse> {
    const url = `${this.baseUrl}/master-data/employee-master/${id}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.buildHeaders(),
    });

    return this.handleResponse<GetEmployeeResponse>(response);
  }

  /**
   * Create new employee
   */
  async createEmployee(request: CreateEmployeeRequest): Promise<CreateEmployeeResponse> {
    const url = `${this.baseUrl}/master-data/employee-master`;

    const response = await fetch(url, {
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify(request),
    });

    return this.handleResponse<CreateEmployeeResponse>(response);
  }

  /**
   * Update employee
   */
  async updateEmployee(id: string, request: UpdateEmployeeRequest): Promise<UpdateEmployeeResponse> {
    const url = `${this.baseUrl}/master-data/employee-master/${id}`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: this.buildHeaders(),
      body: JSON.stringify(request),
    });

    return this.handleResponse<UpdateEmployeeResponse>(response);
  }

  // ===========================================================================
  // Assignment Methods
  // ===========================================================================

  /**
   * List assignments for an employee
   */
  async listAssignments(employeeId: string): Promise<ListAssignmentsResponse> {
    const url = `${this.baseUrl}/employees/${employeeId}/assignments`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.buildHeaders(),
    });

    return this.handleResponse<ListAssignmentsResponse>(response);
  }

  /**
   * Create new assignment
   */
  async createAssignment(
    employeeId: string,
    request: CreateAssignmentRequest,
  ): Promise<CreateAssignmentResponse> {
    const url = `${this.baseUrl}/employees/${employeeId}/assignments`;

    const response = await fetch(url, {
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify(request),
    });

    return this.handleResponse<CreateAssignmentResponse>(response);
  }

  /**
   * Update assignment
   */
  async updateAssignment(
    employeeId: string,
    assignmentId: string,
    request: UpdateAssignmentRequest,
  ): Promise<UpdateAssignmentResponse> {
    const url = `${this.baseUrl}/employees/${employeeId}/assignments/${assignmentId}`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: this.buildHeaders(),
      body: JSON.stringify(request),
    });

    return this.handleResponse<UpdateAssignmentResponse>(response);
  }

  /**
   * Delete assignment (soft delete)
   */
  async deleteAssignment(
    employeeId: string,
    assignmentId: string,
    version: number,
  ): Promise<DeleteAssignmentResponse> {
    const url = `${this.baseUrl}/employees/${employeeId}/assignments/${assignmentId}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.buildHeaders(),
      body: JSON.stringify({ version }),
    });

    return this.handleResponse<DeleteAssignmentResponse>(response);
  }

  /**
   * List active departments
   */
  async listActiveDepartments(): Promise<ListActiveDepartmentsResponse> {
    const url = `${this.baseUrl}/departments/active`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.buildHeaders(),
    });

    return this.handleResponse<ListActiveDepartmentsResponse>(response);
  }
}
