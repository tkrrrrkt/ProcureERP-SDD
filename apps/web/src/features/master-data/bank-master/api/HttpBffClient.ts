/**
 * HTTP BFF Client for Bank Master Management
 * Real HTTP implementation for production use
 */

import {
  BffApiError,
  type BffClient,
  // Bank types
  type ListBanksRequest,
  type ListBanksResponse,
  type GetBankResponse,
  type CreateBankRequest,
  type CreateBankResponse,
  type UpdateBankRequest,
  type UpdateBankResponse,
  type DeactivateBankRequest,
  type DeactivateBankResponse,
  type ActivateBankRequest,
  type ActivateBankResponse,
  // Branch types
  type ListBranchesRequest,
  type ListBranchesResponse,
  type GetBranchResponse,
  type CreateBranchRequest,
  type CreateBranchResponse,
  type UpdateBranchRequest,
  type UpdateBranchResponse,
  type DeactivateBranchRequest,
  type DeactivateBranchResponse,
  type ActivateBranchRequest,
  type ActivateBranchResponse,
} from './BffClient';

interface ApiErrorResponse {
  code?: string;
  message?: string;
  error?: string;
}

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
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorBody: ApiErrorResponse = await response.json().catch(() => ({}));
      const code = errorBody.code || 'UNKNOWN_ERROR';
      const message =
        errorBody.message ||
        errorBody.error ||
        BffApiError.getMessageForCode(code) ||
        `HTTP ${response.status}: ${response.statusText}`;
      throw new BffApiError(code, message, response.status);
    }
    return response.json();
  }

  // =============================================================================
  // Bank APIs
  // =============================================================================

  /**
   * List banks
   */
  async listBanks(request: ListBanksRequest): Promise<ListBanksResponse> {
    const queryString = this.buildQueryString(request as Record<string, unknown>);
    const url = `${this.baseUrl}/master-data/bank-master?${queryString}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.buildHeaders(),
    });

    return this.handleResponse<ListBanksResponse>(response);
  }

  /**
   * Get bank by ID
   */
  async getBank(id: string): Promise<GetBankResponse> {
    const url = `${this.baseUrl}/master-data/bank-master/${id}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.buildHeaders(),
    });

    return this.handleResponse<GetBankResponse>(response);
  }

  /**
   * Create new bank
   */
  async createBank(request: CreateBankRequest): Promise<CreateBankResponse> {
    const url = `${this.baseUrl}/master-data/bank-master`;

    const response = await fetch(url, {
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify(request),
    });

    return this.handleResponse<CreateBankResponse>(response);
  }

  /**
   * Update bank
   */
  async updateBank(id: string, request: UpdateBankRequest): Promise<UpdateBankResponse> {
    const url = `${this.baseUrl}/master-data/bank-master/${id}`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: this.buildHeaders(),
      body: JSON.stringify(request),
    });

    return this.handleResponse<UpdateBankResponse>(response);
  }

  /**
   * Deactivate bank
   */
  async deactivateBank(id: string, request: DeactivateBankRequest): Promise<DeactivateBankResponse> {
    const url = `${this.baseUrl}/master-data/bank-master/${id}/deactivate`;

    const response = await fetch(url, {
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify(request),
    });

    return this.handleResponse<DeactivateBankResponse>(response);
  }

  /**
   * Activate bank
   */
  async activateBank(id: string, request: ActivateBankRequest): Promise<ActivateBankResponse> {
    const url = `${this.baseUrl}/master-data/bank-master/${id}/activate`;

    const response = await fetch(url, {
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify(request),
    });

    return this.handleResponse<ActivateBankResponse>(response);
  }

  // =============================================================================
  // Branch APIs
  // =============================================================================

  /**
   * List branches for a bank
   */
  async listBranches(bankId: string, request: ListBranchesRequest): Promise<ListBranchesResponse> {
    const queryString = this.buildQueryString(request as Record<string, unknown>);
    const url = `${this.baseUrl}/master-data/bank-master/${bankId}/branches?${queryString}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.buildHeaders(),
    });

    return this.handleResponse<ListBranchesResponse>(response);
  }

  /**
   * Get branch by ID
   */
  async getBranch(bankId: string, branchId: string): Promise<GetBranchResponse> {
    const url = `${this.baseUrl}/master-data/bank-master/${bankId}/branches/${branchId}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.buildHeaders(),
    });

    return this.handleResponse<GetBranchResponse>(response);
  }

  /**
   * Create new branch
   */
  async createBranch(bankId: string, request: CreateBranchRequest): Promise<CreateBranchResponse> {
    const url = `${this.baseUrl}/master-data/bank-master/${bankId}/branches`;

    const response = await fetch(url, {
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify(request),
    });

    return this.handleResponse<CreateBranchResponse>(response);
  }

  /**
   * Update branch
   */
  async updateBranch(
    bankId: string,
    branchId: string,
    request: UpdateBranchRequest,
  ): Promise<UpdateBranchResponse> {
    const url = `${this.baseUrl}/master-data/bank-master/${bankId}/branches/${branchId}`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: this.buildHeaders(),
      body: JSON.stringify(request),
    });

    return this.handleResponse<UpdateBranchResponse>(response);
  }

  /**
   * Deactivate branch
   */
  async deactivateBranch(
    bankId: string,
    branchId: string,
    request: DeactivateBranchRequest,
  ): Promise<DeactivateBranchResponse> {
    const url = `${this.baseUrl}/master-data/bank-master/${bankId}/branches/${branchId}/deactivate`;

    const response = await fetch(url, {
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify(request),
    });

    return this.handleResponse<DeactivateBranchResponse>(response);
  }

  /**
   * Activate branch
   */
  async activateBranch(
    bankId: string,
    branchId: string,
    request: ActivateBranchRequest,
  ): Promise<ActivateBranchResponse> {
    const url = `${this.baseUrl}/master-data/bank-master/${bankId}/branches/${branchId}/activate`;

    const response = await fetch(url, {
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify(request),
    });

    return this.handleResponse<ActivateBranchResponse>(response);
  }
}
