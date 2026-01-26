/**
 * Party Domain API Client
 *
 * BFF → Domain API の HTTP クライアント
 */

import { Injectable, HttpException } from '@nestjs/common';
import {
  ListPartiesApiRequest,
  ListPartiesApiResponse,
  GetPartyApiResponse,
  CreatePartyApiRequest,
  CreatePartyApiResponse,
  UpdatePartyApiRequest,
  UpdatePartyApiResponse,
} from '@procure/contracts/api/business-partner';

@Injectable()
export class PartyDomainApiClient {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.DOMAIN_API_URL || 'http://localhost:3002';
  }

  /**
   * 取引先一覧取得
   */
  async listParties(
    tenantId: string,
    userId: string,
    request: ListPartiesApiRequest,
  ): Promise<ListPartiesApiResponse> {
    const params = new URLSearchParams();
    params.append('offset', String(request.offset));
    params.append('limit', String(request.limit));
    if (request.sortBy) params.append('sortBy', request.sortBy);
    if (request.sortOrder) params.append('sortOrder', request.sortOrder);
    if (request.keyword) params.append('keyword', request.keyword);
    if (request.isSupplier !== undefined) params.append('isSupplier', String(request.isSupplier));
    if (request.isCustomer !== undefined) params.append('isCustomer', String(request.isCustomer));

    const url = `${this.baseUrl}/api/domain/master-data/business-partner/parties?${params.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.buildHeaders(tenantId, userId),
    });

    return this.handleResponse<ListPartiesApiResponse>(response);
  }

  /**
   * 取引先詳細取得
   */
  async getParty(
    tenantId: string,
    userId: string,
    partyId: string,
  ): Promise<GetPartyApiResponse> {
    const url = `${this.baseUrl}/api/domain/master-data/business-partner/parties/${partyId}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.buildHeaders(tenantId, userId),
    });

    return this.handleResponse<GetPartyApiResponse>(response);
  }

  /**
   * 取引先新規登録
   */
  async createParty(
    tenantId: string,
    userId: string,
    request: CreatePartyApiRequest,
  ): Promise<CreatePartyApiResponse> {
    const url = `${this.baseUrl}/api/domain/master-data/business-partner/parties`;

    const response = await fetch(url, {
      method: 'POST',
      headers: this.buildHeaders(tenantId, userId),
      body: JSON.stringify(request),
    });

    return this.handleResponse<CreatePartyApiResponse>(response);
  }

  /**
   * 取引先更新
   */
  async updateParty(
    tenantId: string,
    userId: string,
    partyId: string,
    request: UpdatePartyApiRequest,
  ): Promise<UpdatePartyApiResponse> {
    const url = `${this.baseUrl}/api/domain/master-data/business-partner/parties/${partyId}`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: this.buildHeaders(tenantId, userId),
      body: JSON.stringify(request),
    });

    return this.handleResponse<UpdatePartyApiResponse>(response);
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
