import { Injectable, HttpException } from '@nestjs/common';
import {
  ListBanksApiRequest,
  ListBanksApiResponse,
  GetBankApiResponse,
  CreateBankApiRequest,
  CreateBankApiResponse,
  UpdateBankApiRequest,
  UpdateBankApiResponse,
  DeactivateBankApiRequest,
  DeactivateBankApiResponse,
  ActivateBankApiRequest,
  ActivateBankApiResponse,
  ListBranchesApiRequest,
  ListBranchesApiResponse,
  GetBranchApiResponse,
  CreateBranchApiRequest,
  CreateBranchApiResponse,
  UpdateBranchApiRequest,
  UpdateBranchApiResponse,
  DeactivateBranchApiRequest,
  DeactivateBranchApiResponse,
  ActivateBranchApiRequest,
  ActivateBranchApiResponse,
} from '@procure/contracts/api/bank-master';

/**
 * Bank Domain API Client
 *
 * BFF → Domain API の HTTP クライアント
 * - tenant_id / user_id をヘッダーに含めて伝搬
 */
@Injectable()
export class BankDomainApiClient {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.DOMAIN_API_URL || 'http://localhost:3002';
  }

  // =============================================================================
  // Bank APIs
  // =============================================================================

  /**
   * 銀行一覧取得
   */
  async listBanks(
    tenantId: string,
    userId: string,
    request: ListBanksApiRequest,
  ): Promise<ListBanksApiResponse> {
    const params = new URLSearchParams();
    params.append('offset', String(request.offset));
    params.append('limit', String(request.limit));
    if (request.sortBy) params.append('sortBy', request.sortBy);
    if (request.sortOrder) params.append('sortOrder', request.sortOrder);
    if (request.keyword) params.append('keyword', request.keyword);
    if (request.isActive !== undefined)
      params.append('isActive', String(request.isActive));

    const url = `${this.baseUrl}/api/master-data/bank-master?${params.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.buildHeaders(tenantId, userId),
    });

    return this.handleResponse<ListBanksApiResponse>(response);
  }

  /**
   * 銀行詳細取得
   */
  async getBank(
    tenantId: string,
    userId: string,
    bankId: string,
  ): Promise<GetBankApiResponse> {
    const url = `${this.baseUrl}/api/master-data/bank-master/${bankId}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.buildHeaders(tenantId, userId),
    });

    return this.handleResponse<GetBankApiResponse>(response);
  }

  /**
   * 銀行新規登録
   */
  async createBank(
    tenantId: string,
    userId: string,
    request: CreateBankApiRequest,
  ): Promise<CreateBankApiResponse> {
    const url = `${this.baseUrl}/api/master-data/bank-master`;

    const response = await fetch(url, {
      method: 'POST',
      headers: this.buildHeaders(tenantId, userId),
      body: JSON.stringify(request),
    });

    return this.handleResponse<CreateBankApiResponse>(response);
  }

  /**
   * 銀行更新
   */
  async updateBank(
    tenantId: string,
    userId: string,
    bankId: string,
    request: UpdateBankApiRequest,
  ): Promise<UpdateBankApiResponse> {
    const url = `${this.baseUrl}/api/master-data/bank-master/${bankId}`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: this.buildHeaders(tenantId, userId),
      body: JSON.stringify(request),
    });

    return this.handleResponse<UpdateBankApiResponse>(response);
  }

  /**
   * 銀行無効化
   */
  async deactivateBank(
    tenantId: string,
    userId: string,
    bankId: string,
    request: DeactivateBankApiRequest,
  ): Promise<DeactivateBankApiResponse> {
    const url = `${this.baseUrl}/api/master-data/bank-master/${bankId}/deactivate`;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: this.buildHeaders(tenantId, userId),
      body: JSON.stringify(request),
    });

    return this.handleResponse<DeactivateBankApiResponse>(response);
  }

  /**
   * 銀行再有効化
   */
  async activateBank(
    tenantId: string,
    userId: string,
    bankId: string,
    request: ActivateBankApiRequest,
  ): Promise<ActivateBankApiResponse> {
    const url = `${this.baseUrl}/api/master-data/bank-master/${bankId}/activate`;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: this.buildHeaders(tenantId, userId),
      body: JSON.stringify(request),
    });

    return this.handleResponse<ActivateBankApiResponse>(response);
  }

  // =============================================================================
  // Branch APIs
  // =============================================================================

  /**
   * 支店一覧取得
   */
  async listBranches(
    tenantId: string,
    userId: string,
    bankId: string,
    request: ListBranchesApiRequest,
  ): Promise<ListBranchesApiResponse> {
    const params = new URLSearchParams();
    params.append('offset', String(request.offset));
    params.append('limit', String(request.limit));
    if (request.sortBy) params.append('sortBy', request.sortBy);
    if (request.sortOrder) params.append('sortOrder', request.sortOrder);
    if (request.keyword) params.append('keyword', request.keyword);
    if (request.isActive !== undefined)
      params.append('isActive', String(request.isActive));

    const url = `${this.baseUrl}/api/master-data/bank-master/${bankId}/branches?${params.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.buildHeaders(tenantId, userId),
    });

    return this.handleResponse<ListBranchesApiResponse>(response);
  }

  /**
   * 支店詳細取得
   */
  async getBranch(
    tenantId: string,
    userId: string,
    bankId: string,
    branchId: string,
  ): Promise<GetBranchApiResponse> {
    const url = `${this.baseUrl}/api/master-data/bank-master/${bankId}/branches/${branchId}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.buildHeaders(tenantId, userId),
    });

    return this.handleResponse<GetBranchApiResponse>(response);
  }

  /**
   * 支店新規登録
   */
  async createBranch(
    tenantId: string,
    userId: string,
    bankId: string,
    request: CreateBranchApiRequest,
  ): Promise<CreateBranchApiResponse> {
    const url = `${this.baseUrl}/api/master-data/bank-master/${bankId}/branches`;

    const response = await fetch(url, {
      method: 'POST',
      headers: this.buildHeaders(tenantId, userId),
      body: JSON.stringify(request),
    });

    return this.handleResponse<CreateBranchApiResponse>(response);
  }

  /**
   * 支店更新
   */
  async updateBranch(
    tenantId: string,
    userId: string,
    bankId: string,
    branchId: string,
    request: UpdateBranchApiRequest,
  ): Promise<UpdateBranchApiResponse> {
    const url = `${this.baseUrl}/api/master-data/bank-master/${bankId}/branches/${branchId}`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: this.buildHeaders(tenantId, userId),
      body: JSON.stringify(request),
    });

    return this.handleResponse<UpdateBranchApiResponse>(response);
  }

  /**
   * 支店無効化
   */
  async deactivateBranch(
    tenantId: string,
    userId: string,
    bankId: string,
    branchId: string,
    request: DeactivateBranchApiRequest,
  ): Promise<DeactivateBranchApiResponse> {
    const url = `${this.baseUrl}/api/master-data/bank-master/${bankId}/branches/${branchId}/deactivate`;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: this.buildHeaders(tenantId, userId),
      body: JSON.stringify(request),
    });

    return this.handleResponse<DeactivateBranchApiResponse>(response);
  }

  /**
   * 支店再有効化
   */
  async activateBranch(
    tenantId: string,
    userId: string,
    bankId: string,
    branchId: string,
    request: ActivateBranchApiRequest,
  ): Promise<ActivateBranchApiResponse> {
    const url = `${this.baseUrl}/api/master-data/bank-master/${bankId}/branches/${branchId}/activate`;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: this.buildHeaders(tenantId, userId),
      body: JSON.stringify(request),
    });

    return this.handleResponse<ActivateBranchApiResponse>(response);
  }

  // =============================================================================
  // Private Methods
  // =============================================================================

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
