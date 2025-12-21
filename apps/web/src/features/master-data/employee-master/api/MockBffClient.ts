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
  },
];

// =============================================================================
// Mock BFF Client Implementation
// =============================================================================

export class MockBffClient implements BffClient {
  private employees: EmployeeDto[] = [...initialMockEmployees];

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
    };

    this.employees[index] = employee;

    return { employee };
  }
}
