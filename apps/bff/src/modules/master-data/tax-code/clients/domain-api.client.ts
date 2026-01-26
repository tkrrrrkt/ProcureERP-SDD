import { Injectable, HttpException } from '@nestjs/common';
import {
  ListTaxCodesApiRequest,
  ListTaxCodesApiResponse,
  GetTaxCodeApiResponse,
  CreateTaxCodeApiRequest,
  CreateTaxCodeApiResponse,
  UpdateTaxCodeApiRequest,
  UpdateTaxCodeApiResponse,
  DeactivateTaxCodeApiRequest,
  DeactivateTaxCodeApiResponse,
  ActivateTaxCodeApiRequest,
  ActivateTaxCodeApiResponse,
  ListTaxBusinessCategoriesApiResponse,
  ListTaxRatesForDropdownApiResponse,
} from '@procure/contracts/api/tax-code';

/**
 * Domain API Client
 *
 * BFF → Domain API の HTTP クライアント
 * - tenant_id / user_id をヘッダーに含めて伝搬
 */
@Injectable()
export class TaxCodeDomainApiClient {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.DOMAIN_API_URL || 'http://localhost:3002';
  }

  /**
   * 税コード一覧取得
   */
  async listTaxCodes(
    tenantId: string,
    userId: string,
    request: ListTaxCodesApiRequest,
  ): Promise<ListTaxCodesApiResponse> {
    const params = new URLSearchParams();
    params.append('offset', String(request.offset));
    params.append('limit', String(request.limit));
    if (request.sortBy) params.append('sortBy', request.sortBy);
    if (request.sortOrder) params.append('sortOrder', request.sortOrder);
    if (request.keyword) params.append('keyword', request.keyword);
    if (request.taxBusinessCategoryId) params.append('taxBusinessCategoryId', request.taxBusinessCategoryId);
    if (request.isActive !== undefined) params.append('isActive', String(request.isActive));

    const url = `${this.baseUrl}/api/master-data/tax-code?${params.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.buildHeaders(tenantId, userId),
    });

    return this.handleResponse<ListTaxCodesApiResponse>(response);
  }

  /**
   * 税コード詳細取得
   */
  async getTaxCode(
    tenantId: string,
    userId: string,
    taxCodeId: string,
  ): Promise<GetTaxCodeApiResponse> {
    const url = `${this.baseUrl}/api/master-data/tax-code/${taxCodeId}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.buildHeaders(tenantId, userId),
    });

    return this.handleResponse<GetTaxCodeApiResponse>(response);
  }

  /**
   * 税コード新規登録
   */
  async createTaxCode(
    tenantId: string,
    userId: string,
    request: CreateTaxCodeApiRequest,
  ): Promise<CreateTaxCodeApiResponse> {
    const url = `${this.baseUrl}/api/master-data/tax-code`;

    const response = await fetch(url, {
      method: 'POST',
      headers: this.buildHeaders(tenantId, userId),
      body: JSON.stringify(request),
    });

    return this.handleResponse<CreateTaxCodeApiResponse>(response);
  }

  /**
   * 税コード更新
   */
  async updateTaxCode(
    tenantId: string,
    userId: string,
    taxCodeId: string,
    request: UpdateTaxCodeApiRequest,
  ): Promise<UpdateTaxCodeApiResponse> {
    const url = `${this.baseUrl}/api/master-data/tax-code/${taxCodeId}`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: this.buildHeaders(tenantId, userId),
      body: JSON.stringify(request),
    });

    return this.handleResponse<UpdateTaxCodeApiResponse>(response);
  }

  /**
   * 税コード無効化
   */
  async deactivateTaxCode(
    tenantId: string,
    userId: string,
    taxCodeId: string,
    request: DeactivateTaxCodeApiRequest,
  ): Promise<DeactivateTaxCodeApiResponse> {
    const url = `${this.baseUrl}/api/master-data/tax-code/${taxCodeId}/deactivate`;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: this.buildHeaders(tenantId, userId),
      body: JSON.stringify(request),
    });

    return this.handleResponse<DeactivateTaxCodeApiResponse>(response);
  }

  /**
   * 税コード有効化
   */
  async activateTaxCode(
    tenantId: string,
    userId: string,
    taxCodeId: string,
    request: ActivateTaxCodeApiRequest,
  ): Promise<ActivateTaxCodeApiResponse> {
    const url = `${this.baseUrl}/api/master-data/tax-code/${taxCodeId}/activate`;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: this.buildHeaders(tenantId, userId),
      body: JSON.stringify(request),
    });

    return this.handleResponse<ActivateTaxCodeApiResponse>(response);
  }

  /**
   * 税区分一覧取得（ドロップダウン用）
   */
  async listTaxBusinessCategories(
    tenantId: string,
    userId: string,
  ): Promise<ListTaxBusinessCategoriesApiResponse> {
    const url = `${this.baseUrl}/api/master-data/tax-code/tax-business-categories`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.buildHeaders(tenantId, userId),
    });

    return this.handleResponse<ListTaxBusinessCategoriesApiResponse>(response);
  }

  /**
   * 税率一覧取得（ドロップダウン用）
   */
  async listTaxRatesForDropdown(
    tenantId: string,
    userId: string,
  ): Promise<ListTaxRatesForDropdownApiResponse> {
    const url = `${this.baseUrl}/api/master-data/tax-code/tax-rates`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.buildHeaders(tenantId, userId),
    });

    return this.handleResponse<ListTaxRatesForDropdownApiResponse>(response);
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
