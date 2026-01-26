/**
 * HTTP BFF Client for Warehouse Master
 *
 * Phase UI-BFF: 本番用 HTTP 実装
 * MockBffClient から差し替えて使用
 */

import type {
  BffClient,
  BffError,
  ListWarehousesRequest,
  ListWarehousesResponse,
  GetWarehouseResponse,
  CreateWarehouseRequest,
  CreateWarehouseResponse,
  UpdateWarehouseRequest,
  UpdateWarehouseResponse,
  DeactivateWarehouseRequest,
  DeactivateWarehouseResponse,
  ActivateWarehouseRequest,
  ActivateWarehouseResponse,
  SetDefaultReceivingWarehouseRequest,
  SetDefaultReceivingWarehouseResponse,
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
   * Pass-through error handling (BFF → UI)
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({
        code: 'UNKNOWN_ERROR',
        message: 'リクエストに失敗しました',
      }));
      const bffError: BffError = {
        code: error.code ?? 'UNKNOWN_ERROR',
        message: error.message ?? `HTTP ${response.status}: ${response.statusText}`,
        status: response.status,
      };
      throw bffError;
    }
    return response.json();
  }

  /**
   * 倉庫一覧取得
   * GET /api/bff/master-data/warehouses
   */
  async listWarehouses(request: ListWarehousesRequest): Promise<ListWarehousesResponse> {
    const queryString = this.buildQueryString(request as Record<string, unknown>);
    const url = `${this.baseUrl}/master-data/warehouses?${queryString}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.buildHeaders(),
    });

    return this.handleResponse<ListWarehousesResponse>(response);
  }

  /**
   * 倉庫詳細取得
   * GET /api/bff/master-data/warehouses/:id
   */
  async getWarehouse(id: string): Promise<GetWarehouseResponse> {
    const url = `${this.baseUrl}/master-data/warehouses/${id}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.buildHeaders(),
    });

    return this.handleResponse<GetWarehouseResponse>(response);
  }

  /**
   * 倉庫新規登録
   * POST /api/bff/master-data/warehouses
   */
  async createWarehouse(request: CreateWarehouseRequest): Promise<CreateWarehouseResponse> {
    const url = `${this.baseUrl}/master-data/warehouses`;

    const response = await fetch(url, {
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify(request),
    });

    return this.handleResponse<CreateWarehouseResponse>(response);
  }

  /**
   * 倉庫更新
   * PUT /api/bff/master-data/warehouses/:id
   */
  async updateWarehouse(id: string, request: UpdateWarehouseRequest): Promise<UpdateWarehouseResponse> {
    const url = `${this.baseUrl}/master-data/warehouses/${id}`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: this.buildHeaders(),
      body: JSON.stringify(request),
    });

    return this.handleResponse<UpdateWarehouseResponse>(response);
  }

  /**
   * 倉庫無効化
   * POST /api/bff/master-data/warehouses/:id/deactivate
   */
  async deactivateWarehouse(id: string, request: DeactivateWarehouseRequest): Promise<DeactivateWarehouseResponse> {
    const url = `${this.baseUrl}/master-data/warehouses/${id}/deactivate`;

    const response = await fetch(url, {
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify(request),
    });

    return this.handleResponse<DeactivateWarehouseResponse>(response);
  }

  /**
   * 倉庫再有効化
   * POST /api/bff/master-data/warehouses/:id/activate
   */
  async activateWarehouse(id: string, request: ActivateWarehouseRequest): Promise<ActivateWarehouseResponse> {
    const url = `${this.baseUrl}/master-data/warehouses/${id}/activate`;

    const response = await fetch(url, {
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify(request),
    });

    return this.handleResponse<ActivateWarehouseResponse>(response);
  }

  /**
   * 既定受入倉庫設定
   * POST /api/bff/master-data/warehouses/:id/set-default-receiving
   */
  async setDefaultReceivingWarehouse(
    id: string,
    request: SetDefaultReceivingWarehouseRequest
  ): Promise<SetDefaultReceivingWarehouseResponse> {
    const url = `${this.baseUrl}/master-data/warehouses/${id}/set-default-receiving`;

    const response = await fetch(url, {
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify(request),
    });

    return this.handleResponse<SetDefaultReceivingWarehouseResponse>(response);
  }
}

// シングルトンインスタンス
let httpBffClientInstance: HttpBffClient | null = null;

export function getHttpBffClient(): HttpBffClient {
  if (!httpBffClientInstance) {
    httpBffClientInstance = new HttpBffClient();
  }
  return httpBffClientInstance;
}
