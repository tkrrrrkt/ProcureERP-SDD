/**
 * Payee Domain API Client
 *
 * BFF → Domain API の HTTP クライアント
 */

import { Injectable, HttpException } from '@nestjs/common';
import {
  ListPayeesApiRequest,
  ListPayeesApiResponse,
  GetPayeeApiResponse,
  CreatePayeeApiRequest,
  CreatePayeeApiResponse,
  UpdatePayeeApiRequest,
  UpdatePayeeApiResponse,
} from '@procure/contracts/api/business-partner';

@Injectable()
export class PayeeDomainApiClient {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.DOMAIN_API_URL || 'http://localhost:3002';
  }

  /**
   * 支払先一覧取得
   */
  async listPayees(
    tenantId: string,
    userId: string,
    request: ListPayeesApiRequest,
  ): Promise<ListPayeesApiResponse> {
    const params = new URLSearchParams();
    params.append('partyId', request.partyId);
    params.append('offset', String(request.offset));
    params.append('limit', String(request.limit));
    if (request.sortBy) params.append('sortBy', request.sortBy);
    if (request.sortOrder) params.append('sortOrder', request.sortOrder);
    if (request.keyword) params.append('keyword', request.keyword);

    const url = `${this.baseUrl}/api/domain/master-data/business-partner/payees?${params.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.buildHeaders(tenantId, userId),
    });

    return this.handleResponse<ListPayeesApiResponse>(response);
  }

  /**
   * 支払先詳細取得
   */
  async getPayee(
    tenantId: string,
    userId: string,
    payeeId: string,
  ): Promise<GetPayeeApiResponse> {
    const url = `${this.baseUrl}/api/domain/master-data/business-partner/payees/${payeeId}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.buildHeaders(tenantId, userId),
    });

    return this.handleResponse<GetPayeeApiResponse>(response);
  }

  /**
   * 支払先新規登録
   */
  async createPayee(
    tenantId: string,
    userId: string,
    request: CreatePayeeApiRequest,
  ): Promise<CreatePayeeApiResponse> {
    const url = `${this.baseUrl}/api/domain/master-data/business-partner/payees`;

    const response = await fetch(url, {
      method: 'POST',
      headers: this.buildHeaders(tenantId, userId),
      body: JSON.stringify(request),
    });

    return this.handleResponse<CreatePayeeApiResponse>(response);
  }

  /**
   * 支払先更新
   */
  async updatePayee(
    tenantId: string,
    userId: string,
    payeeId: string,
    request: UpdatePayeeApiRequest,
  ): Promise<UpdatePayeeApiResponse> {
    const url = `${this.baseUrl}/api/domain/master-data/business-partner/payees/${payeeId}`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: this.buildHeaders(tenantId, userId),
      body: JSON.stringify(request),
    });

    return this.handleResponse<UpdatePayeeApiResponse>(response);
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
