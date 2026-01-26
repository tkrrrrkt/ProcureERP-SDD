import { Injectable, HttpException } from '@nestjs/common';
import {
  ListUomGroupsApiRequest,
  ListUomGroupsApiResponse,
  GetUomGroupApiResponse,
  CreateUomGroupApiRequest,
  CreateUomGroupApiResponse,
  UpdateUomGroupApiRequest,
  UpdateUomGroupApiResponse,
  ActivateUomGroupApiRequest,
  ActivateUomGroupApiResponse,
  DeactivateUomGroupApiRequest,
  DeactivateUomGroupApiResponse,
  ListUomsApiRequest,
  ListUomsApiResponse,
  GetUomApiResponse,
  CreateUomApiRequest,
  CreateUomApiResponse,
  UpdateUomApiRequest,
  UpdateUomApiResponse,
  ActivateUomApiRequest,
  ActivateUomApiResponse,
  DeactivateUomApiRequest,
  DeactivateUomApiResponse,
  SuggestUomsApiRequest,
  SuggestUomsApiResponse,
} from '@procure/contracts/api/unit-master';

/**
 * Unit Master Domain API Client
 *
 * BFF → Domain API の HTTP クライアント
 * - tenant_id / user_id をヘッダーに含めて伝搬
 * - エラーは Pass-through（Domain API のエラーをそのまま返す）
 */
@Injectable()
export class UnitMasterDomainApiClient {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.DOMAIN_API_URL || 'http://localhost:3002';
  }

  // ==========================================================================
  // UomGroup Endpoints
  // ==========================================================================

  /**
   * 単位グループ一覧取得
   */
  async listUomGroups(
    tenantId: string,
    userId: string,
    request: ListUomGroupsApiRequest,
  ): Promise<ListUomGroupsApiResponse> {
    const params = new URLSearchParams();
    params.append('offset', String(request.offset));
    params.append('limit', String(request.limit));
    if (request.sortBy) params.append('sortBy', request.sortBy);
    if (request.sortOrder) params.append('sortOrder', request.sortOrder);
    if (request.keyword) params.append('keyword', request.keyword);
    if (request.isActive !== undefined) params.append('isActive', String(request.isActive));

    const url = `${this.baseUrl}/api/master-data/unit-master/groups?${params.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.buildHeaders(tenantId, userId),
    });

    return this.handleResponse<ListUomGroupsApiResponse>(response);
  }

  /**
   * 単位グループ詳細取得
   */
  async getUomGroup(
    tenantId: string,
    userId: string,
    groupId: string,
  ): Promise<GetUomGroupApiResponse> {
    const url = `${this.baseUrl}/api/master-data/unit-master/groups/${groupId}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.buildHeaders(tenantId, userId),
    });

    return this.handleResponse<GetUomGroupApiResponse>(response);
  }

  /**
   * 単位グループ新規登録
   */
  async createUomGroup(
    tenantId: string,
    userId: string,
    request: CreateUomGroupApiRequest,
  ): Promise<CreateUomGroupApiResponse> {
    const url = `${this.baseUrl}/api/master-data/unit-master/groups`;

    const response = await fetch(url, {
      method: 'POST',
      headers: this.buildHeaders(tenantId, userId),
      body: JSON.stringify(request),
    });

    return this.handleResponse<CreateUomGroupApiResponse>(response);
  }

  /**
   * 単位グループ更新
   */
  async updateUomGroup(
    tenantId: string,
    userId: string,
    groupId: string,
    request: UpdateUomGroupApiRequest,
  ): Promise<UpdateUomGroupApiResponse> {
    const url = `${this.baseUrl}/api/master-data/unit-master/groups/${groupId}`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: this.buildHeaders(tenantId, userId),
      body: JSON.stringify(request),
    });

    return this.handleResponse<UpdateUomGroupApiResponse>(response);
  }

  /**
   * 単位グループ有効化
   */
  async activateUomGroup(
    tenantId: string,
    userId: string,
    groupId: string,
    request: ActivateUomGroupApiRequest,
  ): Promise<ActivateUomGroupApiResponse> {
    const url = `${this.baseUrl}/api/master-data/unit-master/groups/${groupId}/activate`;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: this.buildHeaders(tenantId, userId),
      body: JSON.stringify(request),
    });

    return this.handleResponse<ActivateUomGroupApiResponse>(response);
  }

  /**
   * 単位グループ無効化
   */
  async deactivateUomGroup(
    tenantId: string,
    userId: string,
    groupId: string,
    request: DeactivateUomGroupApiRequest,
  ): Promise<DeactivateUomGroupApiResponse> {
    const url = `${this.baseUrl}/api/master-data/unit-master/groups/${groupId}/deactivate`;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: this.buildHeaders(tenantId, userId),
      body: JSON.stringify(request),
    });

    return this.handleResponse<DeactivateUomGroupApiResponse>(response);
  }

  // ==========================================================================
  // Uom Endpoints
  // ==========================================================================

  /**
   * 単位一覧取得
   */
  async listUoms(
    tenantId: string,
    userId: string,
    request: ListUomsApiRequest,
  ): Promise<ListUomsApiResponse> {
    const params = new URLSearchParams();
    params.append('offset', String(request.offset));
    params.append('limit', String(request.limit));
    if (request.sortBy) params.append('sortBy', request.sortBy);
    if (request.sortOrder) params.append('sortOrder', request.sortOrder);
    if (request.keyword) params.append('keyword', request.keyword);
    if (request.groupId) params.append('groupId', request.groupId);
    if (request.isActive !== undefined) params.append('isActive', String(request.isActive));

    const url = `${this.baseUrl}/api/master-data/unit-master/uoms?${params.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.buildHeaders(tenantId, userId),
    });

    return this.handleResponse<ListUomsApiResponse>(response);
  }

  /**
   * 単位詳細取得
   */
  async getUom(
    tenantId: string,
    userId: string,
    uomId: string,
  ): Promise<GetUomApiResponse> {
    const url = `${this.baseUrl}/api/master-data/unit-master/uoms/${uomId}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.buildHeaders(tenantId, userId),
    });

    return this.handleResponse<GetUomApiResponse>(response);
  }

  /**
   * 単位新規登録
   */
  async createUom(
    tenantId: string,
    userId: string,
    request: CreateUomApiRequest,
  ): Promise<CreateUomApiResponse> {
    const url = `${this.baseUrl}/api/master-data/unit-master/uoms`;

    const response = await fetch(url, {
      method: 'POST',
      headers: this.buildHeaders(tenantId, userId),
      body: JSON.stringify(request),
    });

    return this.handleResponse<CreateUomApiResponse>(response);
  }

  /**
   * 単位更新
   */
  async updateUom(
    tenantId: string,
    userId: string,
    uomId: string,
    request: UpdateUomApiRequest,
  ): Promise<UpdateUomApiResponse> {
    const url = `${this.baseUrl}/api/master-data/unit-master/uoms/${uomId}`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: this.buildHeaders(tenantId, userId),
      body: JSON.stringify(request),
    });

    return this.handleResponse<UpdateUomApiResponse>(response);
  }

  /**
   * 単位有効化
   */
  async activateUom(
    tenantId: string,
    userId: string,
    uomId: string,
    request: ActivateUomApiRequest,
  ): Promise<ActivateUomApiResponse> {
    const url = `${this.baseUrl}/api/master-data/unit-master/uoms/${uomId}/activate`;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: this.buildHeaders(tenantId, userId),
      body: JSON.stringify(request),
    });

    return this.handleResponse<ActivateUomApiResponse>(response);
  }

  /**
   * 単位無効化
   */
  async deactivateUom(
    tenantId: string,
    userId: string,
    uomId: string,
    request: DeactivateUomApiRequest,
  ): Promise<DeactivateUomApiResponse> {
    const url = `${this.baseUrl}/api/master-data/unit-master/uoms/${uomId}/deactivate`;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: this.buildHeaders(tenantId, userId),
      body: JSON.stringify(request),
    });

    return this.handleResponse<DeactivateUomApiResponse>(response);
  }

  /**
   * 単位サジェスト
   */
  async suggestUoms(
    tenantId: string,
    userId: string,
    request: SuggestUomsApiRequest,
  ): Promise<SuggestUomsApiResponse> {
    const params = new URLSearchParams();
    params.append('keyword', request.keyword);
    params.append('limit', String(request.limit));
    if (request.groupId) params.append('groupId', request.groupId);

    const url = `${this.baseUrl}/api/master-data/unit-master/uoms/suggest?${params.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.buildHeaders(tenantId, userId),
    });

    return this.handleResponse<SuggestUomsApiResponse>(response);
  }

  // ==========================================================================
  // Helper Methods
  // ==========================================================================

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
