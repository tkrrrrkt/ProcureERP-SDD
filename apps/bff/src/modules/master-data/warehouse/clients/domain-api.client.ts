import { Injectable, HttpException } from '@nestjs/common';
import {
  ListWarehousesApiRequest,
  ListWarehousesApiResponse,
  GetWarehouseApiResponse,
  CreateWarehouseApiRequest,
  CreateWarehouseApiResponse,
  UpdateWarehouseApiRequest,
  UpdateWarehouseApiResponse,
  DeactivateWarehouseApiRequest,
  DeactivateWarehouseApiResponse,
  ActivateWarehouseApiRequest,
  ActivateWarehouseApiResponse,
  SetDefaultReceivingWarehouseApiRequest,
  SetDefaultReceivingWarehouseApiResponse,
} from '@procure/contracts/api/warehouse';

/**
 * Warehouse Domain API Client
 *
 * BFF → Domain API の HTTP クライアント
 * - tenant_id / user_id をヘッダーに含めて伝搬
 */
@Injectable()
export class WarehouseDomainApiClient {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.DOMAIN_API_URL || 'http://localhost:3002';
  }

  /**
   * 倉庫一覧取得
   */
  async listWarehouses(
    tenantId: string,
    userId: string,
    request: ListWarehousesApiRequest,
  ): Promise<ListWarehousesApiResponse> {
    const params = new URLSearchParams();
    params.append('offset', String(request.offset));
    params.append('limit', String(request.limit));
    if (request.sortBy) params.append('sortBy', request.sortBy);
    if (request.sortOrder) params.append('sortOrder', request.sortOrder);
    if (request.keyword) params.append('keyword', request.keyword);
    if (request.isActive !== undefined)
      params.append('isActive', String(request.isActive));

    const url = `${this.baseUrl}/api/master-data/warehouse?${params.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.buildHeaders(tenantId, userId),
    });

    return this.handleResponse<ListWarehousesApiResponse>(response);
  }

  /**
   * 倉庫詳細取得
   */
  async getWarehouse(
    tenantId: string,
    userId: string,
    warehouseId: string,
  ): Promise<GetWarehouseApiResponse> {
    const url = `${this.baseUrl}/api/master-data/warehouse/${warehouseId}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.buildHeaders(tenantId, userId),
    });

    return this.handleResponse<GetWarehouseApiResponse>(response);
  }

  /**
   * 倉庫新規登録
   */
  async createWarehouse(
    tenantId: string,
    userId: string,
    request: CreateWarehouseApiRequest,
  ): Promise<CreateWarehouseApiResponse> {
    const url = `${this.baseUrl}/api/master-data/warehouse`;

    const response = await fetch(url, {
      method: 'POST',
      headers: this.buildHeaders(tenantId, userId),
      body: JSON.stringify(request),
    });

    return this.handleResponse<CreateWarehouseApiResponse>(response);
  }

  /**
   * 倉庫更新
   */
  async updateWarehouse(
    tenantId: string,
    userId: string,
    warehouseId: string,
    request: UpdateWarehouseApiRequest,
  ): Promise<UpdateWarehouseApiResponse> {
    const url = `${this.baseUrl}/api/master-data/warehouse/${warehouseId}`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: this.buildHeaders(tenantId, userId),
      body: JSON.stringify(request),
    });

    return this.handleResponse<UpdateWarehouseApiResponse>(response);
  }

  /**
   * 倉庫無効化
   */
  async deactivateWarehouse(
    tenantId: string,
    userId: string,
    warehouseId: string,
    request: DeactivateWarehouseApiRequest,
  ): Promise<DeactivateWarehouseApiResponse> {
    const url = `${this.baseUrl}/api/master-data/warehouse/${warehouseId}/deactivate`;

    const response = await fetch(url, {
      method: 'POST',
      headers: this.buildHeaders(tenantId, userId),
      body: JSON.stringify(request),
    });

    return this.handleResponse<DeactivateWarehouseApiResponse>(response);
  }

  /**
   * 倉庫再有効化
   */
  async activateWarehouse(
    tenantId: string,
    userId: string,
    warehouseId: string,
    request: ActivateWarehouseApiRequest,
  ): Promise<ActivateWarehouseApiResponse> {
    const url = `${this.baseUrl}/api/master-data/warehouse/${warehouseId}/activate`;

    const response = await fetch(url, {
      method: 'POST',
      headers: this.buildHeaders(tenantId, userId),
      body: JSON.stringify(request),
    });

    return this.handleResponse<ActivateWarehouseApiResponse>(response);
  }

  /**
   * 既定受入倉庫設定
   */
  async setDefaultReceivingWarehouse(
    tenantId: string,
    userId: string,
    warehouseId: string,
    request: SetDefaultReceivingWarehouseApiRequest,
  ): Promise<SetDefaultReceivingWarehouseApiResponse> {
    const url = `${this.baseUrl}/api/master-data/warehouse/${warehouseId}/set-default-receiving`;

    const response = await fetch(url, {
      method: 'POST',
      headers: this.buildHeaders(tenantId, userId),
      body: JSON.stringify(request),
    });

    return this.handleResponse<SetDefaultReceivingWarehouseApiResponse>(
      response,
    );
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
