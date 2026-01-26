import { Injectable, HttpException } from '@nestjs/common';
import {
  ListPayeeBankAccountsApiRequest,
  ListPayeeBankAccountsApiResponse,
  GetPayeeBankAccountApiResponse,
  CreatePayeeBankAccountApiRequest,
  CreatePayeeBankAccountApiResponse,
  UpdatePayeeBankAccountApiRequest,
  UpdatePayeeBankAccountApiResponse,
  DeactivatePayeeBankAccountApiRequest,
  DeactivatePayeeBankAccountApiResponse,
  ActivatePayeeBankAccountApiRequest,
  ActivatePayeeBankAccountApiResponse,
  SetDefaultPayeeBankAccountApiRequest,
  SetDefaultPayeeBankAccountApiResponse,
} from '@procure/contracts/api/payee-bank-account';

/**
 * Payee Bank Account Domain API Client
 *
 * BFF → Domain API の HTTP クライアント
 */
@Injectable()
export class PayeeBankAccountDomainApiClient {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.DOMAIN_API_URL || 'http://localhost:3002';
  }

  /**
   * 支払先口座一覧取得
   */
  async listAccounts(
    tenantId: string,
    userId: string,
    payeeId: string,
    request: ListPayeeBankAccountsApiRequest,
  ): Promise<ListPayeeBankAccountsApiResponse> {
    const params = new URLSearchParams();
    params.append('offset', String(request.offset));
    params.append('limit', String(request.limit));
    if (request.sortBy) params.append('sortBy', request.sortBy);
    if (request.sortOrder) params.append('sortOrder', request.sortOrder);
    if (request.isActive !== undefined)
      params.append('isActive', String(request.isActive));

    const url = `${this.baseUrl}/api/master-data/payees/${payeeId}/bank-accounts?${params.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.buildHeaders(tenantId, userId),
    });

    return this.handleResponse<ListPayeeBankAccountsApiResponse>(response);
  }

  /**
   * 支払先口座詳細取得
   */
  async getAccount(
    tenantId: string,
    userId: string,
    payeeId: string,
    accountId: string,
  ): Promise<GetPayeeBankAccountApiResponse> {
    const url = `${this.baseUrl}/api/master-data/payees/${payeeId}/bank-accounts/${accountId}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.buildHeaders(tenantId, userId),
    });

    return this.handleResponse<GetPayeeBankAccountApiResponse>(response);
  }

  /**
   * 支払先口座新規登録
   */
  async createAccount(
    tenantId: string,
    userId: string,
    payeeId: string,
    request: CreatePayeeBankAccountApiRequest,
  ): Promise<CreatePayeeBankAccountApiResponse> {
    const url = `${this.baseUrl}/api/master-data/payees/${payeeId}/bank-accounts`;

    const response = await fetch(url, {
      method: 'POST',
      headers: this.buildHeaders(tenantId, userId),
      body: JSON.stringify(request),
    });

    return this.handleResponse<CreatePayeeBankAccountApiResponse>(response);
  }

  /**
   * 支払先口座更新
   */
  async updateAccount(
    tenantId: string,
    userId: string,
    payeeId: string,
    accountId: string,
    request: UpdatePayeeBankAccountApiRequest,
  ): Promise<UpdatePayeeBankAccountApiResponse> {
    const url = `${this.baseUrl}/api/master-data/payees/${payeeId}/bank-accounts/${accountId}`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: this.buildHeaders(tenantId, userId),
      body: JSON.stringify(request),
    });

    return this.handleResponse<UpdatePayeeBankAccountApiResponse>(response);
  }

  /**
   * 支払先口座無効化
   */
  async deactivateAccount(
    tenantId: string,
    userId: string,
    payeeId: string,
    accountId: string,
    request: DeactivatePayeeBankAccountApiRequest,
  ): Promise<DeactivatePayeeBankAccountApiResponse> {
    const url = `${this.baseUrl}/api/master-data/payees/${payeeId}/bank-accounts/${accountId}/deactivate`;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: this.buildHeaders(tenantId, userId),
      body: JSON.stringify(request),
    });

    return this.handleResponse<DeactivatePayeeBankAccountApiResponse>(response);
  }

  /**
   * 支払先口座再有効化
   */
  async activateAccount(
    tenantId: string,
    userId: string,
    payeeId: string,
    accountId: string,
    request: ActivatePayeeBankAccountApiRequest,
  ): Promise<ActivatePayeeBankAccountApiResponse> {
    const url = `${this.baseUrl}/api/master-data/payees/${payeeId}/bank-accounts/${accountId}/activate`;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: this.buildHeaders(tenantId, userId),
      body: JSON.stringify(request),
    });

    return this.handleResponse<ActivatePayeeBankAccountApiResponse>(response);
  }

  /**
   * デフォルト口座設定
   */
  async setDefaultAccount(
    tenantId: string,
    userId: string,
    payeeId: string,
    accountId: string,
    request: SetDefaultPayeeBankAccountApiRequest,
  ): Promise<SetDefaultPayeeBankAccountApiResponse> {
    const url = `${this.baseUrl}/api/master-data/payees/${payeeId}/bank-accounts/${accountId}/set-default`;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: this.buildHeaders(tenantId, userId),
      body: JSON.stringify(request),
    });

    return this.handleResponse<SetDefaultPayeeBankAccountApiResponse>(response);
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
