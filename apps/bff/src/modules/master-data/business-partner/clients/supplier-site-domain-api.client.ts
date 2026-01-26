/**
 * SupplierSite Domain API Client
 *
 * BFF → Domain API の HTTP クライアント
 */

import { Injectable, HttpException } from '@nestjs/common';
import {
  ListSupplierSitesApiRequest,
  ListSupplierSitesApiResponse,
  GetSupplierSiteApiResponse,
  CreateSupplierSiteApiRequest,
  CreateSupplierSiteApiResponse,
  UpdateSupplierSiteApiRequest,
  UpdateSupplierSiteApiResponse,
} from '@procure/contracts/api/business-partner';

@Injectable()
export class SupplierSiteDomainApiClient {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.DOMAIN_API_URL || 'http://localhost:3002';
  }

  /**
   * 仕入先拠点一覧取得
   */
  async listSupplierSites(
    tenantId: string,
    userId: string,
    request: ListSupplierSitesApiRequest,
  ): Promise<ListSupplierSitesApiResponse> {
    const params = new URLSearchParams();
    params.append('partyId', request.partyId);
    params.append('offset', String(request.offset));
    params.append('limit', String(request.limit));
    if (request.sortBy) params.append('sortBy', request.sortBy);
    if (request.sortOrder) params.append('sortOrder', request.sortOrder);
    if (request.keyword) params.append('keyword', request.keyword);

    const url = `${this.baseUrl}/api/domain/master-data/business-partner/supplier-sites?${params.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.buildHeaders(tenantId, userId),
    });

    return this.handleResponse<ListSupplierSitesApiResponse>(response);
  }

  /**
   * 仕入先拠点詳細取得
   */
  async getSupplierSite(
    tenantId: string,
    userId: string,
    supplierSiteId: string,
  ): Promise<GetSupplierSiteApiResponse> {
    const url = `${this.baseUrl}/api/domain/master-data/business-partner/supplier-sites/${supplierSiteId}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.buildHeaders(tenantId, userId),
    });

    return this.handleResponse<GetSupplierSiteApiResponse>(response);
  }

  /**
   * 仕入先拠点新規登録
   */
  async createSupplierSite(
    tenantId: string,
    userId: string,
    request: CreateSupplierSiteApiRequest,
  ): Promise<CreateSupplierSiteApiResponse> {
    const url = `${this.baseUrl}/api/domain/master-data/business-partner/supplier-sites`;

    const response = await fetch(url, {
      method: 'POST',
      headers: this.buildHeaders(tenantId, userId),
      body: JSON.stringify(request),
    });

    return this.handleResponse<CreateSupplierSiteApiResponse>(response);
  }

  /**
   * 仕入先拠点更新
   */
  async updateSupplierSite(
    tenantId: string,
    userId: string,
    supplierSiteId: string,
    request: UpdateSupplierSiteApiRequest,
  ): Promise<UpdateSupplierSiteApiResponse> {
    const url = `${this.baseUrl}/api/domain/master-data/business-partner/supplier-sites/${supplierSiteId}`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: this.buildHeaders(tenantId, userId),
      body: JSON.stringify(request),
    });

    return this.handleResponse<UpdateSupplierSiteApiResponse>(response);
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
