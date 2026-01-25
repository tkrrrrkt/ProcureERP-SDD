/**
 * Mock BFF Client for Employee Master Management
 * Provides realistic mock data and simulates API behavior
 */

import type {
  BffClient,
  EmployeeDto,
  ListEmployeesRequest,
  ListEmployeesResponse,
  GetEmployeeResponse,
  CreateEmployeeRequest,
  CreateEmployeeResponse,
  UpdateEmployeeRequest,
  UpdateEmployeeResponse,
  EmployeeAssignmentDto,
  ListAssignmentsResponse,
  CreateAssignmentRequest,
  CreateAssignmentResponse,
  UpdateAssignmentRequest,
  UpdateAssignmentResponse,
  DeleteAssignmentResponse,
  DepartmentOptionDto,
  ListActiveDepartmentsResponse,
} from './BffClient';

// =============================================================================
// Mock Data
// =============================================================================

const initialMockEmployees: EmployeeDto[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    employeeCode: 'EMP001',
    employeeName: '山田太郎',
    employeeKanaName: 'ヤマダタロウ',
    email: 'yamada.taro@example.com',
    joinDate: '2020-04-01T00:00:00.000Z',
    retireDate: null,
    remarks: '購買部門リーダー',
    isActive: true,
    version: 1,
    createdAt: '2020-03-15T10:00:00.000Z',
    updatedAt: '2024-01-10T14:30:00.000Z',
    createdBy: 'system',
    updatedBy: 'admin',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    employeeCode: 'EMP002',
    employeeName: '佐藤花子',
    employeeKanaName: 'サトウハナコ',
    email: 'sato.hanako@example.com',
    joinDate: '2019-07-01T00:00:00.000Z',
    retireDate: null,
    remarks: null,
    isActive: true,
    version: 2,
    createdAt: '2019-06-15T10:00:00.000Z',
    updatedAt: '2024-02-20T09:15:00.000Z',
    createdBy: 'system',
    updatedBy: 'admin',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    employeeCode: 'EMP003',
    employeeName: '鈴木一郎',
    employeeKanaName: 'スズキイチロウ',
    email: 'suzuki.ichiro@example.com',
    joinDate: '2021-10-01T00:00:00.000Z',
    retireDate: null,
    remarks: '経理部門',
    isActive: true,
    version: 1,
    createdAt: '2021-09-15T10:00:00.000Z',
    updatedAt: '2021-09-15T10:00:00.000Z',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    employeeCode: 'EMP004',
    employeeName: '田中次郎',
    employeeKanaName: 'タナカジロウ',
    email: null,
    joinDate: '2018-04-01T00:00:00.000Z',
    retireDate: '2023-12-31T00:00:00.000Z',
    remarks: '退職済み',
    isActive: false,
    version: 3,
    createdAt: '2018-03-15T10:00:00.000Z',
    updatedAt: '2023-12-31T16:00:00.000Z',
    createdBy: 'system',
    updatedBy: 'admin',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    employeeCode: 'EMP005',
    employeeName: '伊藤三郎',
    employeeKanaName: 'イトウサブロウ',
    email: 'ito.saburo@example.com',
    joinDate: '2022-01-10T00:00:00.000Z',
    retireDate: null,
    remarks: '新入社員',
    isActive: true,
    version: 1,
    createdAt: '2022-01-05T10:00:00.000Z',
    updatedAt: '2022-01-05T10:00:00.000Z',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440006',
    employeeCode: 'EMP006',
    employeeName: '渡辺四郎',
    employeeKanaName: 'ワタナベシロウ',
    email: 'watanabe.shiro@example.com',
    joinDate: '2023-06-01T00:00:00.000Z',
    retireDate: null,
    remarks: null,
    isActive: true,
    version: 1,
    createdAt: '2023-05-20T10:00:00.000Z',
    updatedAt: '2023-05-20T10:00:00.000Z',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440007',
    employeeCode: 'EMP007',
    employeeName: '中村五郎',
    employeeKanaName: 'ナカムラゴロウ',
    email: 'nakamura.goro@example.com',
    joinDate: '2020-09-15T00:00:00.000Z',
    retireDate: null,
    remarks: '調達部門マネージャー',
    isActive: true,
    version: 2,
    createdAt: '2020-09-01T10:00:00.000Z',
    updatedAt: '2024-03-01T11:20:00.000Z',
    createdBy: 'system',
    updatedBy: 'admin',
  },
];

// =============================================================================
// Mock Assignment Data
// =============================================================================

const initialMockAssignments: EmployeeAssignmentDto[] = [
  {
    id: 'asgn-001',
    employeeId: '550e8400-e29b-41d4-a716-446655440001',
    departmentStableId: 'dept-stable-001',
    departmentCode: 'PUR',
    departmentName: '購買部',
    assignmentType: 'primary',
    assignmentTypeLabel: '主務',
    allocationRatio: 100,
    title: '部長',
    effectiveDate: '2023-04-01',
    expiryDate: null,
    isCurrent: true,
    isActive: true,
    version: 1,
    createdAt: '2023-04-01T00:00:00.000Z',
    updatedAt: '2023-04-01T00:00:00.000Z',
  },
  {
    id: 'asgn-002',
    employeeId: '550e8400-e29b-41d4-a716-446655440001',
    departmentStableId: 'dept-stable-002',
    departmentCode: 'ADM',
    departmentName: '総務部',
    assignmentType: 'secondary',
    assignmentTypeLabel: '兼務',
    allocationRatio: 20,
    title: null,
    effectiveDate: '2024-01-01',
    expiryDate: '2024-12-31',
    isCurrent: true,
    isActive: true,
    version: 1,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'asgn-003',
    employeeId: '550e8400-e29b-41d4-a716-446655440002',
    departmentStableId: 'dept-stable-003',
    departmentCode: 'ACC',
    departmentName: '経理部',
    assignmentType: 'primary',
    assignmentTypeLabel: '主務',
    allocationRatio: 100,
    title: '課長',
    effectiveDate: '2022-04-01',
    expiryDate: null,
    isCurrent: true,
    isActive: true,
    version: 1,
    createdAt: '2022-04-01T00:00:00.000Z',
    updatedAt: '2022-04-01T00:00:00.000Z',
  },
];

// =============================================================================
// Mock Department Data
// =============================================================================

const mockDepartments: DepartmentOptionDto[] = [
  {
    stableId: 'dept-stable-001',
    departmentCode: 'PUR',
    departmentName: '購買部',
    hierarchyPath: '/PUR',
    hierarchyLevel: 1,
    parentStableId: null,
  },
  {
    stableId: 'dept-stable-002',
    departmentCode: 'ADM',
    departmentName: '総務部',
    hierarchyPath: '/ADM',
    hierarchyLevel: 1,
    parentStableId: null,
  },
  {
    stableId: 'dept-stable-003',
    departmentCode: 'ACC',
    departmentName: '経理部',
    hierarchyPath: '/ACC',
    hierarchyLevel: 1,
    parentStableId: null,
  },
  {
    stableId: 'dept-stable-004',
    departmentCode: 'DEV',
    departmentName: '開発部',
    hierarchyPath: '/DEV',
    hierarchyLevel: 1,
    parentStableId: null,
  },
  {
    stableId: 'dept-stable-005',
    departmentCode: 'DEV-1',
    departmentName: '開発１課',
    hierarchyPath: '/DEV/DEV-1',
    hierarchyLevel: 2,
    parentStableId: 'dept-stable-004',
  },
  {
    stableId: 'dept-stable-006',
    departmentCode: 'DEV-2',
    departmentName: '開発２課',
    hierarchyPath: '/DEV/DEV-2',
    hierarchyLevel: 2,
    parentStableId: 'dept-stable-004',
  },
];

// =============================================================================
// Mock BFF Client Implementation
// =============================================================================

export class MockBffClient implements BffClient {
  private employees: EmployeeDto[] = [...initialMockEmployees];
  private assignments: EmployeeAssignmentDto[] = [...initialMockAssignments];

  /**
   * Simulate API delay
   */
  private async delay(ms = 500): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Generate new UUID
   */
  private generateId(): string {
    return `550e8400-e29b-41d4-a716-${Date.now()}`;
  }

  /**
   * List employees with pagination, sort, and search
   */
  async listEmployees(request: ListEmployeesRequest): Promise<ListEmployeesResponse> {
    await this.delay(500);

    let filteredEmployees = [...this.employees];

    // Apply keyword search
    if (request.keyword) {
      const keyword = request.keyword.toLowerCase();
      filteredEmployees = filteredEmployees.filter(
        (emp) =>
          emp.employeeCode.toLowerCase().includes(keyword) ||
          emp.employeeName.toLowerCase().includes(keyword) ||
          emp.employeeKanaName.toLowerCase().includes(keyword)
      );
    }

    // Apply sorting
    const sortBy = request.sortBy || 'employeeCode';
    const sortOrder = request.sortOrder || 'asc';

    filteredEmployees.sort((a, b) => {
      const aValue = a[sortBy as keyof EmployeeDto];
      const bValue = b[sortBy as keyof EmployeeDto];

      // Handle null values
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      // Compare values
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    // Apply pagination
    const page = request.page ?? 1;
    const pageSize = request.pageSize ?? 50;
    const total = filteredEmployees.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const items = filteredEmployees.slice(start, end);

    return {
      items,
      page,
      pageSize,
      total,
      totalPages,
    };
  }

  /**
   * Get employee by ID
   */
  async getEmployee(id: string): Promise<GetEmployeeResponse> {
    await this.delay(300);

    const employee = this.employees.find((emp) => emp.id === id);
    if (!employee) {
      throw new Error('社員が見つかりません (EMPLOYEE_NOT_FOUND)');
    }

    return { employee };
  }

  /**
   * Create new employee
   */
  async createEmployee(request: CreateEmployeeRequest): Promise<CreateEmployeeResponse> {
    await this.delay(800);

    // Validate employee code uniqueness
    const duplicate = this.employees.find((emp) => emp.employeeCode === request.employeeCode);
    if (duplicate) {
      throw new Error('社員コードが重複しています (EMPLOYEE_CODE_DUPLICATE)');
    }

    // Validate email format
    if (request.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(request.email)) {
      throw new Error('メールアドレスの形式が正しくありません (INVALID_EMAIL_FORMAT)');
    }

    // Validate date range
    if (request.retireDate) {
      const joinDate = new Date(request.joinDate);
      const retireDate = new Date(request.retireDate);
      if (retireDate <= joinDate) {
        throw new Error('退社日は入社日より後の日付を指定してください (INVALID_DATE_RANGE)');
      }
    }

    // Create employee
    const now = new Date().toISOString();
    const employee: EmployeeDto = {
      id: this.generateId(),
      employeeCode: request.employeeCode,
      employeeName: request.employeeName,
      employeeKanaName: request.employeeKanaName,
      email: request.email ?? null,
      joinDate: request.joinDate,
      retireDate: request.retireDate ?? null,
      remarks: request.remarks ?? null,
      isActive: request.isActive ?? true,
      version: 1,
      createdAt: now,
      updatedAt: now,
      createdBy: 'demo-user',
      updatedBy: 'demo-user',
    };

    this.employees.push(employee);

    return { employee };
  }

  /**
   * Update employee
   */
  async updateEmployee(id: string, request: UpdateEmployeeRequest): Promise<UpdateEmployeeResponse> {
    await this.delay(800);

    const index = this.employees.findIndex((emp) => emp.id === id);
    if (index === -1) {
      throw new Error('社員が見つかりません (EMPLOYEE_NOT_FOUND)');
    }

    const existingEmployee = this.employees[index];

    // Validate optimistic locking
    if (existingEmployee.version !== request.version) {
      throw new Error('他のユーザーによって更新されています。再読み込みしてください (CONCURRENT_UPDATE)');
    }

    // Validate employee code uniqueness (excluding current employee)
    const duplicate = this.employees.find(
      (emp) => emp.employeeCode === request.employeeCode && emp.id !== id
    );
    if (duplicate) {
      throw new Error('社員コードが重複しています (EMPLOYEE_CODE_DUPLICATE)');
    }

    // Validate email format
    if (request.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(request.email)) {
      throw new Error('メールアドレスの形式が正しくありません (INVALID_EMAIL_FORMAT)');
    }

    // Validate date range
    if (request.retireDate) {
      const joinDate = new Date(request.joinDate);
      const retireDate = new Date(request.retireDate);
      if (retireDate <= joinDate) {
        throw new Error('退社日は入社日より後の日付を指定してください (INVALID_DATE_RANGE)');
      }
    }

    // Update employee
    const employee: EmployeeDto = {
      ...existingEmployee,
      employeeCode: request.employeeCode,
      employeeName: request.employeeName,
      employeeKanaName: request.employeeKanaName,
      email: request.email ?? null,
      joinDate: request.joinDate,
      retireDate: request.retireDate ?? null,
      remarks: request.remarks ?? null,
      isActive: request.isActive,
      version: request.version + 1,
      updatedAt: new Date().toISOString(),
      updatedBy: 'demo-user',
    };

    this.employees[index] = employee;

    return { employee };
  }

  // ===========================================================================
  // Assignment Methods
  // ===========================================================================

  /**
   * List assignments for an employee
   */
  async listAssignments(employeeId: string): Promise<ListAssignmentsResponse> {
    await this.delay(400);

    const items = this.assignments
      .filter((a) => a.employeeId === employeeId && a.isActive)
      .sort((a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime());

    return { items };
  }

  /**
   * Create new assignment
   */
  async createAssignment(
    employeeId: string,
    request: CreateAssignmentRequest,
  ): Promise<CreateAssignmentResponse> {
    await this.delay(600);

    // Check employee exists
    const employee = this.employees.find((e) => e.id === employeeId);
    if (!employee) {
      throw new Error('社員が見つかりません (EMPLOYEE_NOT_FOUND)');
    }

    // Validate date range
    if (request.expiryDate) {
      const effectiveDate = new Date(request.effectiveDate);
      const expiryDate = new Date(request.expiryDate);
      if (expiryDate <= effectiveDate) {
        throw new Error('有効終了日は有効開始日より後の日付を指定してください (INVALID_DATE_RANGE)');
      }
    }

    // Check primary overlap
    if (request.assignmentType === 'primary') {
      const overlap = this.checkPrimaryOverlap(
        employeeId,
        request.effectiveDate,
        request.expiryDate,
      );
      if (overlap) {
        throw new Error('同時期に既に主務が設定されています (DUPLICATE_PRIMARY_ASSIGNMENT)');
      }
    }

    // Find department
    const dept = mockDepartments.find((d) => d.stableId === request.departmentStableId);
    if (!dept) {
      throw new Error('部門が見つかりません (DEPARTMENT_NOT_FOUND)');
    }

    const now = new Date().toISOString();
    const assignment: EmployeeAssignmentDto = {
      id: this.generateId(),
      employeeId,
      departmentStableId: request.departmentStableId,
      departmentCode: dept.departmentCode,
      departmentName: dept.departmentName,
      assignmentType: request.assignmentType,
      assignmentTypeLabel: request.assignmentType === 'primary' ? '主務' : '兼務',
      allocationRatio: request.allocationRatio ?? null,
      title: request.title ?? null,
      effectiveDate: request.effectiveDate,
      expiryDate: request.expiryDate ?? null,
      isCurrent: this.calculateIsCurrent(request.effectiveDate, request.expiryDate ?? null),
      isActive: true,
      version: 1,
      createdAt: now,
      updatedAt: now,
    };

    this.assignments.push(assignment);
    return { assignment };
  }

  /**
   * Update assignment
   */
  async updateAssignment(
    employeeId: string,
    assignmentId: string,
    request: UpdateAssignmentRequest,
  ): Promise<UpdateAssignmentResponse> {
    await this.delay(600);

    const index = this.assignments.findIndex(
      (a) => a.id === assignmentId && a.employeeId === employeeId && a.isActive,
    );
    if (index === -1) {
      throw new Error('所属情報が見つかりません (ASSIGNMENT_NOT_FOUND)');
    }

    const existing = this.assignments[index];

    // Optimistic locking
    if (existing.version !== request.version) {
      throw new Error('他のユーザーによって更新されています (OPTIMISTIC_LOCK_ERROR)');
    }

    // Validate date range
    if (request.expiryDate) {
      const effectiveDate = new Date(request.effectiveDate);
      const expiryDate = new Date(request.expiryDate);
      if (expiryDate <= effectiveDate) {
        throw new Error('有効終了日は有効開始日より後の日付を指定してください (INVALID_DATE_RANGE)');
      }
    }

    // Check primary overlap (excluding self)
    if (request.assignmentType === 'primary') {
      const overlap = this.checkPrimaryOverlap(
        employeeId,
        request.effectiveDate,
        request.expiryDate,
        assignmentId,
      );
      if (overlap) {
        throw new Error('同時期に既に主務が設定されています (DUPLICATE_PRIMARY_ASSIGNMENT)');
      }
    }

    // Find department
    const dept = mockDepartments.find((d) => d.stableId === request.departmentStableId);
    if (!dept) {
      throw new Error('部門が見つかりません (DEPARTMENT_NOT_FOUND)');
    }

    const assignment: EmployeeAssignmentDto = {
      ...existing,
      departmentStableId: request.departmentStableId,
      departmentCode: dept.departmentCode,
      departmentName: dept.departmentName,
      assignmentType: request.assignmentType,
      assignmentTypeLabel: request.assignmentType === 'primary' ? '主務' : '兼務',
      allocationRatio: request.allocationRatio ?? null,
      title: request.title ?? null,
      effectiveDate: request.effectiveDate,
      expiryDate: request.expiryDate ?? null,
      isCurrent: this.calculateIsCurrent(request.effectiveDate, request.expiryDate ?? null),
      version: request.version + 1,
      updatedAt: new Date().toISOString(),
    };

    this.assignments[index] = assignment;
    return { assignment };
  }

  /**
   * Delete assignment (soft delete)
   */
  async deleteAssignment(
    employeeId: string,
    assignmentId: string,
    version: number,
  ): Promise<DeleteAssignmentResponse> {
    await this.delay(400);

    const index = this.assignments.findIndex(
      (a) => a.id === assignmentId && a.employeeId === employeeId && a.isActive,
    );
    if (index === -1) {
      throw new Error('所属情報が見つかりません (ASSIGNMENT_NOT_FOUND)');
    }

    const existing = this.assignments[index];

    // Optimistic locking
    if (existing.version !== version) {
      throw new Error('他のユーザーによって更新されています (OPTIMISTIC_LOCK_ERROR)');
    }

    // Soft delete
    this.assignments[index] = {
      ...existing,
      isActive: false,
      version: version + 1,
      updatedAt: new Date().toISOString(),
    };

    return { success: true };
  }

  /**
   * List active departments
   */
  async listActiveDepartments(): Promise<ListActiveDepartmentsResponse> {
    await this.delay(300);
    return { items: [...mockDepartments] };
  }

  // ===========================================================================
  // Helper Methods for Assignments
  // ===========================================================================

  /**
   * Check if date range overlaps with existing primary assignment
   */
  private checkPrimaryOverlap(
    employeeId: string,
    effectiveDate: string,
    expiryDate?: string | null,
    excludeId?: string,
  ): boolean {
    const newStart = new Date(effectiveDate);
    const newEnd = expiryDate ? new Date(expiryDate) : null;

    return this.assignments.some((a) => {
      if (a.employeeId !== employeeId) return false;
      if (!a.isActive) return false;
      if (a.assignmentType !== 'primary') return false;
      if (excludeId && a.id === excludeId) return false;

      const existingStart = new Date(a.effectiveDate);
      const existingEnd = a.expiryDate ? new Date(a.expiryDate) : null;

      // Check overlap
      const startOk = existingEnd === null || newStart <= existingEnd;
      const endOk = newEnd === null || existingStart <= newEnd;

      return startOk && endOk;
    });
  }

  /**
   * Calculate if assignment is currently effective
   */
  private calculateIsCurrent(effectiveDate: string, expiryDate: string | null): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = new Date(effectiveDate);
    start.setHours(0, 0, 0, 0);

    if (start > today) return false;
    if (expiryDate === null) return true;

    const end = new Date(expiryDate);
    end.setHours(0, 0, 0, 0);

    return today <= end;
  }
}
