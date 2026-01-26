import { Injectable, HttpException } from '@nestjs/common';
import {
  ListTaxRatesApiRequest,
  ListTaxRatesApiResponse,
  GetTaxRateApiResponse,
  CreateTaxRateApiRequest,
  CreateTaxRateApiResponse,
  UpdateTaxRateApiRequest,
  UpdateTaxRateApiResponse,
  DeactivateTaxRateApiRequest,
  DeactivateTaxRateApiResponse,
  ActivateTaxRateApiRequest,
  ActivateTaxRateApiResponse,
} from '@procure/contracts/api/tax-rate';

/**
 * Domain API Client
 *
 * BFF → Domain API の HTTP クライアント
 * - tenant_id / user_id をヘッダーに含めて伝搬
 */
@Injectable()
export class TaxRateDomainApiClient {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.DOMAIN_API_URL || 'http://localhost:3002';
  }

  /**
   * 税率一覧取得
   */
  async listTaxRates(
    tenantId: string,
    userId: string,
    request: ListTaxRatesApiRequest,
  ): Promise<ListTaxRatesApiResponse> {
    const params = new URLSearchParams();
    params.append('offset', String(request.offset));
    params.append('limit', String(request.limit));
    if (request.sortBy) params.append('sortBy', request.sortBy);
    if (request.sortOrder) params.append('sortOrder', request.sortOrder);
    if (request.keyword) params.append('keyword', request.keyword);
    if (request.isActive !== undefined) params.append('isActive', String(request.isActive));

    const url = `${this.baseUrl}/api/master-data/tax-rate?${params.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.buildHeaders(tenantId, userId),
    });

    return this.handleResponse<ListTaxRatesApiResponse>(response);
  }

  /**
   * 税率詳細取得
   */
  async getTaxRate(
    tenantId: string,
    userId: string,
    taxRateId: string,
  ): Promise<GetTaxRateApiResponse> {
    const url = `${this.baseUrl}/api/master-data/tax-rate/${taxRateId}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.buildHeaders(tenantId, userId),
    });

    return this.handleResponse<GetTaxRateApiResponse>(response);
  }

  /**
   * 税率新規登録
   */
  async createTaxRate(
    tenantId: string,
    userId: string,
    request: CreateTaxRateApiRequest,
  ): Promise<CreateTaxRateApiResponse> {
    const url = `${this.baseUrl}/api/master-data/tax-rate`;

    const response = await fetch(url, {
      method: 'POST',
      headers: this.buildHeaders(tenantId, userId),
      body: JSON.stringify(request),
    });

    return this.handleResponse<CreateTaxRateApiResponse>(response);
  }

  /**
   * 税率更新
   */
  async updateTaxRate(
    tenantId: string,
    userId: string,
    taxRateId: string,
    request: UpdateTaxRateApiRequest,
  ): Promise<UpdateTaxRateApiResponse> {
    const url = `${this.baseUrl}/api/master-data/tax-rate/${taxRateId}`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: this.buildHeaders(tenantId, userId),
      body: JSON.stringify(request),
    });

    return this.handleResponse<UpdateTaxRateApiResponse>(response);
  }

  /**
   * 税率無効化
   */
  async deactivateTaxRate(
    tenantId: string,
    userId: string,
    taxRateId: string,
    request: DeactivateTaxRateApiRequest,
  ): Promise<DeactivateTaxRateApiResponse> {
    const url = `${this.baseUrl}/api/master-data/tax-rate/${taxRateId}/deactivate`;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: this.buildHeaders(tenantId, userId),
      body: JSON.stringify(request),
    });

    return this.handleResponse<DeactivateTaxRateApiResponse>(response);
  }

  /**
   * 税率有効化
   */
  async activateTaxRate(
    tenantId: string,
    userId: string,
    taxRateId: string,
    request: ActivateTaxRateApiRequest,
  ): Promise<ActivateTaxRateApiResponse> {
    const url = `${this.baseUrl}/api/master-data/tax-rate/${taxRateId}/activate`;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: this.buildHeaders(tenantId, userId),
      body: JSON.stringify(request),
    });

    return this.handleResponse<ActivateTaxRateApiResponse>(response);
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
