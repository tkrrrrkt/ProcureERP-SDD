/**
 * Company Bank Account HTTP BFF Client
 *
 * 本番用の HTTP クライアント
 */

import type {
  CompanyBankAccountBffClient,
  BffApiError,
  ListCompanyBankAccountsRequest,
  ListCompanyBankAccountsResponse,
  GetCompanyBankAccountResponse,
  CreateCompanyBankAccountRequest,
  CreateCompanyBankAccountResponse,
  UpdateCompanyBankAccountRequest,
  UpdateCompanyBankAccountResponse,
  DeactivateCompanyBankAccountRequest,
  DeactivateCompanyBankAccountResponse,
  ActivateCompanyBankAccountRequest,
  ActivateCompanyBankAccountResponse,
  SetDefaultCompanyBankAccountRequest,
  SetDefaultCompanyBankAccountResponse,
} from './BffClient';

/**
 * HTTP BFF Client Implementation
 */
export class HttpBffClient implements CompanyBankAccountBffClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string = '/api/bff') {
    this.baseUrl = baseUrl;
  }

  private buildHeaders(): HeadersInit {
    // TODO: Get from auth context (Clerk)
    return {
      'Content-Type': 'application/json',
      'x-tenant-id': 'tenant-1',
      'x-user-id': 'user-1',
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({
        code: 'UNKNOWN_ERROR',
        message: 'An unknown error occurred',
      }));
      throw errorBody as BffApiError;
    }
    return response.json();
  }

  async listAccounts(
    request: ListCompanyBankAccountsRequest,
  ): Promise<ListCompanyBankAccountsResponse> {
    const params = new URLSearchParams();
    if (request.page) params.append('page', String(request.page));
    if (request.pageSize) params.append('pageSize', String(request.pageSize));
    if (request.sortBy) params.append('sortBy', request.sortBy);
    if (request.sortOrder) params.append('sortOrder', request.sortOrder);
    if (request.isActive !== undefined)
      params.append('isActive', String(request.isActive));

    const url = `${this.baseUrl}/master-data/company-bank-accounts?${params.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.buildHeaders(),
    });

    return this.handleResponse<ListCompanyBankAccountsResponse>(response);
  }

  async getAccount(id: string): Promise<GetCompanyBankAccountResponse> {
    const url = `${this.baseUrl}/master-data/company-bank-accounts/${id}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.buildHeaders(),
    });

    return this.handleResponse<GetCompanyBankAccountResponse>(response);
  }

  async createAccount(
    request: CreateCompanyBankAccountRequest,
  ): Promise<CreateCompanyBankAccountResponse> {
    const url = `${this.baseUrl}/master-data/company-bank-accounts`;

    const response = await fetch(url, {
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify(request),
    });

    return this.handleResponse<CreateCompanyBankAccountResponse>(response);
  }

  async updateAccount(
    id: string,
    request: UpdateCompanyBankAccountRequest,
  ): Promise<UpdateCompanyBankAccountResponse> {
    const url = `${this.baseUrl}/master-data/company-bank-accounts/${id}`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: this.buildHeaders(),
      body: JSON.stringify(request),
    });

    return this.handleResponse<UpdateCompanyBankAccountResponse>(response);
  }

  async deactivateAccount(
    id: string,
    request: DeactivateCompanyBankAccountRequest,
  ): Promise<DeactivateCompanyBankAccountResponse> {
    const url = `${this.baseUrl}/master-data/company-bank-accounts/${id}/deactivate`;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: this.buildHeaders(),
      body: JSON.stringify(request),
    });

    return this.handleResponse<DeactivateCompanyBankAccountResponse>(response);
  }

  async activateAccount(
    id: string,
    request: ActivateCompanyBankAccountRequest,
  ): Promise<ActivateCompanyBankAccountResponse> {
    const url = `${this.baseUrl}/master-data/company-bank-accounts/${id}/activate`;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: this.buildHeaders(),
      body: JSON.stringify(request),
    });

    return this.handleResponse<ActivateCompanyBankAccountResponse>(response);
  }

  async setDefaultAccount(
    id: string,
    request: SetDefaultCompanyBankAccountRequest,
  ): Promise<SetDefaultCompanyBankAccountResponse> {
    const url = `${this.baseUrl}/master-data/company-bank-accounts/${id}/set-default`;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: this.buildHeaders(),
      body: JSON.stringify(request),
    });

    return this.handleResponse<SetDefaultCompanyBankAccountResponse>(response);
  }
}
