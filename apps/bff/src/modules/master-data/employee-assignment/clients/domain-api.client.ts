import { Injectable, HttpException } from '@nestjs/common';
import {
  ListAssignmentsApiRequest,
  ListAssignmentsApiResponse,
  GetAssignmentApiResponse,
  CreateAssignmentApiRequest,
  CreateAssignmentApiResponse,
  UpdateAssignmentApiRequest,
  UpdateAssignmentApiResponse,
  DeleteAssignmentApiRequest,
  DeleteAssignmentApiResponse,
} from '@procure/contracts/api/employee-assignment';

/**
 * Employee Assignment Domain API Client
 *
 * BFF → Domain API の HTTP クライアント
 * - tenant_id / user_id をヘッダーに含めて伝搬
 */
@Injectable()
export class EmployeeAssignmentDomainApiClient {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.DOMAIN_API_URL || 'http://localhost:3002';
  }

  /**
   * 所属一覧取得
   */
  async listAssignments(
    tenantId: string,
    userId: string,
    employeeId: string,
    request: ListAssignmentsApiRequest,
  ): Promise<ListAssignmentsApiResponse> {
    const params = new URLSearchParams();
    if (request.sortBy) params.append('sortBy', request.sortBy);
    if (request.sortOrder) params.append('sortOrder', request.sortOrder);

    const queryString = params.toString();
    const url = `${this.baseUrl}/api/master-data/employees/${employeeId}/assignments${queryString ? '?' + queryString : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.buildHeaders(tenantId, userId),
    });

    return this.handleResponse<ListAssignmentsApiResponse>(response);
  }

  /**
   * 所属情報取得
   */
  async getAssignment(
    tenantId: string,
    userId: string,
    employeeId: string,
    assignmentId: string,
  ): Promise<GetAssignmentApiResponse> {
    const url = `${this.baseUrl}/api/master-data/employees/${employeeId}/assignments/${assignmentId}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.buildHeaders(tenantId, userId),
    });

    return this.handleResponse<GetAssignmentApiResponse>(response);
  }

  /**
   * 所属登録
   */
  async createAssignment(
    tenantId: string,
    userId: string,
    employeeId: string,
    request: CreateAssignmentApiRequest,
  ): Promise<CreateAssignmentApiResponse> {
    const url = `${this.baseUrl}/api/master-data/employees/${employeeId}/assignments`;

    const response = await fetch(url, {
      method: 'POST',
      headers: this.buildHeaders(tenantId, userId),
      body: JSON.stringify(request),
    });

    return this.handleResponse<CreateAssignmentApiResponse>(response);
  }

  /**
   * 所属更新
   */
  async updateAssignment(
    tenantId: string,
    userId: string,
    employeeId: string,
    assignmentId: string,
    request: UpdateAssignmentApiRequest,
  ): Promise<UpdateAssignmentApiResponse> {
    const url = `${this.baseUrl}/api/master-data/employees/${employeeId}/assignments/${assignmentId}`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: this.buildHeaders(tenantId, userId),
      body: JSON.stringify(request),
    });

    return this.handleResponse<UpdateAssignmentApiResponse>(response);
  }

  /**
   * 所属削除
   */
  async deleteAssignment(
    tenantId: string,
    userId: string,
    employeeId: string,
    assignmentId: string,
    request: DeleteAssignmentApiRequest,
  ): Promise<DeleteAssignmentApiResponse> {
    const url = `${this.baseUrl}/api/master-data/employees/${employeeId}/assignments/${assignmentId}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.buildHeaders(tenantId, userId),
      body: JSON.stringify(request),
    });

    return this.handleResponse<DeleteAssignmentApiResponse>(response);
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
      throw new HttpException(errorBody, response.status);
    }

    return response.json();
  }
}
