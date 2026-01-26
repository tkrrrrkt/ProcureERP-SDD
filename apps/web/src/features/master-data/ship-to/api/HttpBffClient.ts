/**
 * HTTP BFF Client for Ship-To Master
 *
 * Phase UI-BFF: 本番用 HTTP 実装
 * MockBffClient から差し替えて使用
 */

import type {
  BffClient,
  BffError,
  ListShipTosRequest,
  ListShipTosResponse,
  GetShipToResponse,
  CreateShipToRequest,
  CreateShipToResponse,
  UpdateShipToRequest,
  UpdateShipToResponse,
  DeactivateShipToRequest,
  DeactivateShipToResponse,
  ActivateShipToRequest,
  ActivateShipToResponse,
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
   * 納入先一覧取得
   * GET /api/bff/master-data/ship-to
   */
  async listShipTos(request: ListShipTosRequest): Promise<ListShipTosResponse> {
    const queryString = this.buildQueryString(request as Record<string, unknown>);
    const url = `${this.baseUrl}/master-data/ship-to?${queryString}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.buildHeaders(),
    });

    return this.handleResponse<ListShipTosResponse>(response);
  }

  /**
   * 納入先詳細取得
   * GET /api/bff/master-data/ship-to/:id
   */
  async getShipTo(id: string): Promise<GetShipToResponse> {
    const url = `${this.baseUrl}/master-data/ship-to/${id}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.buildHeaders(),
    });

    return this.handleResponse<GetShipToResponse>(response);
  }

  /**
   * 納入先新規登録
   * POST /api/bff/master-data/ship-to
   */
  async createShipTo(request: CreateShipToRequest): Promise<CreateShipToResponse> {
    const url = `${this.baseUrl}/master-data/ship-to`;

    const response = await fetch(url, {
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify(request),
    });

    return this.handleResponse<CreateShipToResponse>(response);
  }

  /**
   * 納入先更新
   * PUT /api/bff/master-data/ship-to/:id
   */
  async updateShipTo(id: string, request: UpdateShipToRequest): Promise<UpdateShipToResponse> {
    const url = `${this.baseUrl}/master-data/ship-to/${id}`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: this.buildHeaders(),
      body: JSON.stringify(request),
    });

    return this.handleResponse<UpdateShipToResponse>(response);
  }

  /**
   * 納入先無効化
   * PATCH /api/bff/master-data/ship-to/:id/deactivate
   */
  async deactivateShipTo(id: string, request: DeactivateShipToRequest): Promise<DeactivateShipToResponse> {
    const url = `${this.baseUrl}/master-data/ship-to/${id}/deactivate`;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: this.buildHeaders(),
      body: JSON.stringify(request),
    });

    return this.handleResponse<DeactivateShipToResponse>(response);
  }

  /**
   * 納入先再有効化
   * PATCH /api/bff/master-data/ship-to/:id/activate
   */
  async activateShipTo(id: string, request: ActivateShipToRequest): Promise<ActivateShipToResponse> {
    const url = `${this.baseUrl}/master-data/ship-to/${id}/activate`;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: this.buildHeaders(),
      body: JSON.stringify(request),
    });

    return this.handleResponse<ActivateShipToResponse>(response);
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
