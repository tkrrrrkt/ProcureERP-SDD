import { Injectable, HttpException } from '@nestjs/common';
import {
  ListCompanyBankAccountsApiRequest,
  ListCompanyBankAccountsApiResponse,
  GetCompanyBankAccountApiResponse,
  CreateCompanyBankAccountApiRequest,
  CreateCompanyBankAccountApiResponse,
  UpdateCompanyBankAccountApiRequest,
  UpdateCompanyBankAccountApiResponse,
  DeactivateCompanyBankAccountApiRequest,
  DeactivateCompanyBankAccountApiResponse,
  ActivateCompanyBankAccountApiRequest,
  ActivateCompanyBankAccountApiResponse,
  SetDefaultCompanyBankAccountApiRequest,
  SetDefaultCompanyBankAccountApiResponse,
} from '@procure/contracts/api/company-bank-account';

/**
 * Company Bank Account Domain API Client
 *
 * BFF → Domain API の HTTP クライアント
 */
@Injectable()
export class CompanyBankAccountDomainApiClient {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.DOMAIN_API_URL || 'http://localhost:3002';
  }

  /**
   * 自社口座一覧取得
   */
  async listAccounts(
    tenantId: string,
    userId: string,
    request: ListCompanyBankAccountsApiRequest,
  ): Promise<ListCompanyBankAccountsApiResponse> {
    const params = new URLSearchParams();
    params.append('offset', String(request.offset));
    params.append('limit', String(request.limit));
    if (request.sortBy) params.append('sortBy', request.sortBy);
    if (request.sortOrder) params.append('sortOrder', request.sortOrder);
    if (request.isActive !== undefined)
      params.append('isActive', String(request.isActive));

    const url = `${this.baseUrl}/api/master-data/company-bank-accounts?${params.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.buildHeaders(tenantId, userId),
    });

    return this.handleResponse<ListCompanyBankAccountsApiResponse>(response);
  }

  /**
   * 自社口座詳細取得
   */
  async getAccount(
    tenantId: string,
    userId: string,
    accountId: string,
  ): Promise<GetCompanyBankAccountApiResponse> {
    const url = `${this.baseUrl}/api/master-data/company-bank-accounts/${accountId}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.buildHeaders(tenantId, userId),
    });

    return this.handleResponse<GetCompanyBankAccountApiResponse>(response);
  }

  /**
   * 自社口座新規登録
   */
  async createAccount(
    tenantId: string,
    userId: string,
    request: CreateCompanyBankAccountApiRequest,
  ): Promise<CreateCompanyBankAccountApiResponse> {
    const url = `${this.baseUrl}/api/master-data/company-bank-accounts`;

    const response = await fetch(url, {
      method: 'POST',
      headers: this.buildHeaders(tenantId, userId),
      body: JSON.stringify(request),
    });

    return this.handleResponse<CreateCompanyBankAccountApiResponse>(response);
  }

  /**
   * 自社口座更新
   */
  async updateAccount(
    tenantId: string,
    userId: string,
    accountId: string,
    request: UpdateCompanyBankAccountApiRequest,
  ): Promise<UpdateCompanyBankAccountApiResponse> {
    const url = `${this.baseUrl}/api/master-data/company-bank-accounts/${accountId}`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: this.buildHeaders(tenantId, userId),
      body: JSON.stringify(request),
    });

    return this.handleResponse<UpdateCompanyBankAccountApiResponse>(response);
  }

  /**
   * 自社口座無効化
   */
  async deactivateAccount(
    tenantId: string,
    userId: string,
    accountId: string,
    request: DeactivateCompanyBankAccountApiRequest,
  ): Promise<DeactivateCompanyBankAccountApiResponse> {
    const url = `${this.baseUrl}/api/master-data/company-bank-accounts/${accountId}/deactivate`;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: this.buildHeaders(tenantId, userId),
      body: JSON.stringify(request),
    });

    return this.handleResponse<DeactivateCompanyBankAccountApiResponse>(response);
  }

  /**
   * 自社口座再有効化
   */
  async activateAccount(
    tenantId: string,
    userId: string,
    accountId: string,
    request: ActivateCompanyBankAccountApiRequest,
  ): Promise<ActivateCompanyBankAccountApiResponse> {
    const url = `${this.baseUrl}/api/master-data/company-bank-accounts/${accountId}/activate`;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: this.buildHeaders(tenantId, userId),
      body: JSON.stringify(request),
    });

    return this.handleResponse<ActivateCompanyBankAccountApiResponse>(response);
  }

  /**
   * デフォルト口座設定
   */
  async setDefaultAccount(
    tenantId: string,
    userId: string,
    accountId: string,
    request: SetDefaultCompanyBankAccountApiRequest,
  ): Promise<SetDefaultCompanyBankAccountApiResponse> {
    const url = `${this.baseUrl}/api/master-data/company-bank-accounts/${accountId}/set-default`;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: this.buildHeaders(tenantId, userId),
      body: JSON.stringify(request),
    });

    return this.handleResponse<SetDefaultCompanyBankAccountApiResponse>(response);
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
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new HttpException(errorBody, response.status);
    }

    return response.json();
  }
}
