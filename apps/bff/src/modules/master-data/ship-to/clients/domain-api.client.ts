import { Injectable, HttpException } from '@nestjs/common';
import {
  ListShipTosApiRequest,
  ListShipTosApiResponse,
  GetShipToApiResponse,
  CreateShipToApiRequest,
  CreateShipToApiResponse,
  UpdateShipToApiRequest,
  UpdateShipToApiResponse,
  DeactivateShipToApiRequest,
  DeactivateShipToApiResponse,
  ActivateShipToApiRequest,
  ActivateShipToApiResponse,
} from '@procure/contracts/api/ship-to';

/**
 * ShipTo Domain API Client
 *
 * BFF → Domain API の HTTP クライアント
 * - tenant_id / user_id をヘッダーに含めて伝搬
 */
@Injectable()
export class ShipToDomainApiClient {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.DOMAIN_API_URL || 'http://localhost:3002';
  }

  /**
   * 納入先一覧取得
   */
  async listShipTos(
    tenantId: string,
    userId: string,
    request: ListShipTosApiRequest,
  ): Promise<ListShipTosApiResponse> {
    const params = new URLSearchParams();
    params.append('offset', String(request.offset));
    params.append('limit', String(request.limit));
    if (request.sortBy) params.append('sortBy', request.sortBy);
    if (request.sortOrder) params.append('sortOrder', request.sortOrder);
    if (request.keyword) params.append('keyword', request.keyword);
    if (request.isActive !== undefined)
      params.append('isActive', String(request.isActive));

    const url = `${this.baseUrl}/api/master-data/ship-to?${params.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.buildHeaders(tenantId, userId),
    });

    return this.handleResponse<ListShipTosApiResponse>(response);
  }

  /**
   * 納入先詳細取得
   */
  async getShipTo(
    tenantId: string,
    userId: string,
    shipToId: string,
  ): Promise<GetShipToApiResponse> {
    const url = `${this.baseUrl}/api/master-data/ship-to/${shipToId}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.buildHeaders(tenantId, userId),
    });

    return this.handleResponse<GetShipToApiResponse>(response);
  }

  /**
   * 納入先新規登録
   */
  async createShipTo(
    tenantId: string,
    userId: string,
    request: CreateShipToApiRequest,
  ): Promise<CreateShipToApiResponse> {
    const url = `${this.baseUrl}/api/master-data/ship-to`;

    const response = await fetch(url, {
      method: 'POST',
      headers: this.buildHeaders(tenantId, userId),
      body: JSON.stringify(request),
    });

    return this.handleResponse<CreateShipToApiResponse>(response);
  }

  /**
   * 納入先更新
   */
  async updateShipTo(
    tenantId: string,
    userId: string,
    shipToId: string,
    request: UpdateShipToApiRequest,
  ): Promise<UpdateShipToApiResponse> {
    const url = `${this.baseUrl}/api/master-data/ship-to/${shipToId}`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: this.buildHeaders(tenantId, userId),
      body: JSON.stringify(request),
    });

    return this.handleResponse<UpdateShipToApiResponse>(response);
  }

  /**
   * 納入先無効化
   */
  async deactivateShipTo(
    tenantId: string,
    userId: string,
    shipToId: string,
    request: DeactivateShipToApiRequest,
  ): Promise<DeactivateShipToApiResponse> {
    const url = `${this.baseUrl}/api/master-data/ship-to/${shipToId}/deactivate`;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: this.buildHeaders(tenantId, userId),
      body: JSON.stringify(request),
    });

    return this.handleResponse<DeactivateShipToApiResponse>(response);
  }

  /**
   * 納入先再有効化
   */
  async activateShipTo(
    tenantId: string,
    userId: string,
    shipToId: string,
    request: ActivateShipToApiRequest,
  ): Promise<ActivateShipToApiResponse> {
    const url = `${this.baseUrl}/api/master-data/ship-to/${shipToId}/activate`;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: this.buildHeaders(tenantId, userId),
      body: JSON.stringify(request),
    });

    return this.handleResponse<ActivateShipToApiResponse>(response);
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
