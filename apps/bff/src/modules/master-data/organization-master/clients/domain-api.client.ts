import { Injectable, HttpException } from '@nestjs/common';
import {
  // Version types
  ListVersionsApiRequest,
  ListVersionsApiResponse,
  GetVersionApiResponse,
  CreateVersionApiRequest,
  CreateVersionApiResponse,
  CopyVersionApiRequest,
  CopyVersionApiResponse,
  UpdateVersionApiRequest,
  UpdateVersionApiResponse,
  AsOfSearchApiRequest,
  AsOfSearchApiResponse,
  // Department types
  ListDepartmentsApiRequest,
  ListDepartmentsApiResponse,
  GetDepartmentApiResponse,
  CreateDepartmentApiRequest,
  CreateDepartmentApiResponse,
  UpdateDepartmentApiRequest,
  UpdateDepartmentApiResponse,
  MoveDepartmentApiRequest,
  MoveDepartmentApiResponse,
  DeactivateDepartmentApiResponse,
  ReactivateDepartmentApiResponse,
} from '@procure/contracts/api/organization-master';

/**
 * Organization Master Domain API Client
 *
 * BFF → Domain API の HTTP クライアント
 * - tenant_id / user_id をヘッダーに含めて伝搬
 */
@Injectable()
export class OrganizationMasterDomainApiClient {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.DOMAIN_API_URL || 'http://localhost:3002';
  }

  // ===========================================================================
  // Version Endpoints
  // ===========================================================================

  /**
   * バージョン一覧取得
   */
  async listVersions(
    tenantId: string,
    userId: string,
    request: ListVersionsApiRequest,
  ): Promise<ListVersionsApiResponse> {
    const params = new URLSearchParams();
    if (request.sortBy) params.append('sortBy', request.sortBy);
    if (request.sortOrder) params.append('sortOrder', request.sortOrder);

    const url = `${this.baseUrl}/organization-master/versions?${params.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.buildHeaders(tenantId, userId),
    });

    return this.handleResponse<ListVersionsApiResponse>(response);
  }

  /**
   * バージョン詳細取得
   */
  async getVersion(
    tenantId: string,
    userId: string,
    versionId: string,
  ): Promise<GetVersionApiResponse> {
    const url = `${this.baseUrl}/organization-master/versions/${versionId}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.buildHeaders(tenantId, userId),
    });

    return this.handleResponse<GetVersionApiResponse>(response);
  }

  /**
   * バージョン新規作成
   */
  async createVersion(
    tenantId: string,
    userId: string,
    request: CreateVersionApiRequest,
  ): Promise<CreateVersionApiResponse> {
    const url = `${this.baseUrl}/organization-master/versions`;

    const response = await fetch(url, {
      method: 'POST',
      headers: this.buildHeaders(tenantId, userId),
      body: JSON.stringify(request),
    });

    return this.handleResponse<CreateVersionApiResponse>(response);
  }

  /**
   * バージョンコピー
   */
  async copyVersion(
    tenantId: string,
    userId: string,
    sourceVersionId: string,
    request: CopyVersionApiRequest,
  ): Promise<CopyVersionApiResponse> {
    const url = `${this.baseUrl}/organization-master/versions/${sourceVersionId}/copy`;

    const response = await fetch(url, {
      method: 'POST',
      headers: this.buildHeaders(tenantId, userId),
      body: JSON.stringify(request),
    });

    return this.handleResponse<CopyVersionApiResponse>(response);
  }

  /**
   * バージョン更新
   */
  async updateVersion(
    tenantId: string,
    userId: string,
    versionId: string,
    request: UpdateVersionApiRequest,
  ): Promise<UpdateVersionApiResponse> {
    const url = `${this.baseUrl}/organization-master/versions/${versionId}`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: this.buildHeaders(tenantId, userId),
      body: JSON.stringify(request),
    });

    return this.handleResponse<UpdateVersionApiResponse>(response);
  }

  /**
   * as-of検索
   */
  async findEffectiveAsOf(
    tenantId: string,
    userId: string,
    request: AsOfSearchApiRequest,
  ): Promise<AsOfSearchApiResponse> {
    const params = new URLSearchParams();
    params.append('asOfDate', request.asOfDate);

    const url = `${this.baseUrl}/organization-master/versions/as-of?${params.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.buildHeaders(tenantId, userId),
    });

    return this.handleResponse<AsOfSearchApiResponse>(response);
  }

  // ===========================================================================
  // Department Endpoints
  // ===========================================================================

  /**
   * 部門一覧取得
   */
  async listDepartments(
    tenantId: string,
    userId: string,
    versionId: string,
    request: ListDepartmentsApiRequest,
  ): Promise<ListDepartmentsApiResponse> {
    const params = new URLSearchParams();
    if (request.keyword) params.append('keyword', request.keyword);
    if (request.isActive !== undefined) params.append('isActive', String(request.isActive));
    if (request.sortBy) params.append('sortBy', request.sortBy);
    if (request.sortOrder) params.append('sortOrder', request.sortOrder);

    const url = `${this.baseUrl}/organization-master/versions/${versionId}/departments?${params.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.buildHeaders(tenantId, userId),
    });

    return this.handleResponse<ListDepartmentsApiResponse>(response);
  }

  /**
   * 部門詳細取得
   */
  async getDepartment(
    tenantId: string,
    userId: string,
    departmentId: string,
  ): Promise<GetDepartmentApiResponse> {
    const url = `${this.baseUrl}/organization-master/departments/${departmentId}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.buildHeaders(tenantId, userId),
    });

    return this.handleResponse<GetDepartmentApiResponse>(response);
  }

  /**
   * 部門新規作成
   */
  async createDepartment(
    tenantId: string,
    userId: string,
    versionId: string,
    request: CreateDepartmentApiRequest,
  ): Promise<CreateDepartmentApiResponse> {
    const url = `${this.baseUrl}/organization-master/versions/${versionId}/departments`;

    const response = await fetch(url, {
      method: 'POST',
      headers: this.buildHeaders(tenantId, userId),
      body: JSON.stringify(request),
    });

    return this.handleResponse<CreateDepartmentApiResponse>(response);
  }

  /**
   * 部門更新
   */
  async updateDepartment(
    tenantId: string,
    userId: string,
    departmentId: string,
    request: UpdateDepartmentApiRequest,
  ): Promise<UpdateDepartmentApiResponse> {
    const url = `${this.baseUrl}/organization-master/departments/${departmentId}`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: this.buildHeaders(tenantId, userId),
      body: JSON.stringify(request),
    });

    return this.handleResponse<UpdateDepartmentApiResponse>(response);
  }

  /**
   * 部門移動（ドラッグ＆ドロップ）
   */
  async moveDepartment(
    tenantId: string,
    userId: string,
    departmentId: string,
    request: MoveDepartmentApiRequest,
  ): Promise<MoveDepartmentApiResponse> {
    const url = `${this.baseUrl}/organization-master/departments/${departmentId}/move`;

    const response = await fetch(url, {
      method: 'POST',
      headers: this.buildHeaders(tenantId, userId),
      body: JSON.stringify(request),
    });

    return this.handleResponse<MoveDepartmentApiResponse>(response);
  }

  /**
   * 部門無効化
   */
  async deactivateDepartment(
    tenantId: string,
    userId: string,
    departmentId: string,
  ): Promise<DeactivateDepartmentApiResponse> {
    const url = `${this.baseUrl}/organization-master/departments/${departmentId}/deactivate`;

    const response = await fetch(url, {
      method: 'POST',
      headers: this.buildHeaders(tenantId, userId),
    });

    return this.handleResponse<DeactivateDepartmentApiResponse>(response);
  }

  /**
   * 部門有効化
   */
  async reactivateDepartment(
    tenantId: string,
    userId: string,
    departmentId: string,
  ): Promise<ReactivateDepartmentApiResponse> {
    const url = `${this.baseUrl}/organization-master/departments/${departmentId}/reactivate`;

    const response = await fetch(url, {
      method: 'POST',
      headers: this.buildHeaders(tenantId, userId),
    });

    return this.handleResponse<ReactivateDepartmentApiResponse>(response);
  }

  // ===========================================================================
  // Helper Methods
  // ===========================================================================

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
