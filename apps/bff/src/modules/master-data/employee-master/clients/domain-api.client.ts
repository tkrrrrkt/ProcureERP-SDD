import { Injectable, HttpException } from '@nestjs/common';
import {
  ListEmployeesApiRequest,
  ListEmployeesApiResponse,
  GetEmployeeApiResponse,
  CreateEmployeeApiRequest,
  CreateEmployeeApiResponse,
  UpdateEmployeeApiRequest,
  UpdateEmployeeApiResponse,
} from '@procure/contracts/api/employee-master';

/**
 * Domain API Client
 *
 * BFF → Domain API の HTTP クライアント
 * - tenant_id / user_id をヘッダーに含めて伝搬
 */
@Injectable()
export class EmployeeDomainApiClient {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.DOMAIN_API_URL || 'http://localhost:3002';
  }

  /**
   * 社員一覧取得
   */
  async listEmployees(
    tenantId: string,
    userId: string,
    request: ListEmployeesApiRequest,
  ): Promise<ListEmployeesApiResponse> {
    const params = new URLSearchParams();
    params.append('offset', String(request.offset));
    params.append('limit', String(request.limit));
    if (request.sortBy) params.append('sortBy', request.sortBy);
    if (request.sortOrder) params.append('sortOrder', request.sortOrder);
    if (request.keyword) params.append('keyword', request.keyword);

    const url = `${this.baseUrl}/api/master-data/employee-master?${params.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.buildHeaders(tenantId, userId),
    });

    return this.handleResponse<ListEmployeesApiResponse>(response);
  }

  /**
   * 社員詳細取得
   */
  async getEmployee(
    tenantId: string,
    userId: string,
    employeeId: string,
  ): Promise<GetEmployeeApiResponse> {
    const url = `${this.baseUrl}/api/master-data/employee-master/${employeeId}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.buildHeaders(tenantId, userId),
    });

    return this.handleResponse<GetEmployeeApiResponse>(response);
  }

  /**
   * 社員新規登録
   */
  async createEmployee(
    tenantId: string,
    userId: string,
    request: CreateEmployeeApiRequest,
  ): Promise<CreateEmployeeApiResponse> {
    const url = `${this.baseUrl}/api/master-data/employee-master`;

    const response = await fetch(url, {
      method: 'POST',
      headers: this.buildHeaders(tenantId, userId),
      body: JSON.stringify(request),
    });

    return this.handleResponse<CreateEmployeeApiResponse>(response);
  }

  /**
   * 社員更新
   */
  async updateEmployee(
    tenantId: string,
    userId: string,
    employeeId: string,
    request: UpdateEmployeeApiRequest,
  ): Promise<UpdateEmployeeApiResponse> {
    const url = `${this.baseUrl}/api/master-data/employee-master/${employeeId}`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: this.buildHeaders(tenantId, userId),
      body: JSON.stringify(request),
    });

    return this.handleResponse<UpdateEmployeeApiResponse>(response);
  }

  /**
   * HTTP ヘッダー構築
   */
  private buildHeaders(tenantId: string, userId: string): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'x-tenant-id': tenantId,
      'x-user-id': userId,
    };
  }

  /**
   * レスポンス処理
   * エラーは Pass-through（Domain API のエラーをそのまま返す）
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new HttpException(
        errorBody,
        response.status,
      );
    }

    return response.json();
  }
}
