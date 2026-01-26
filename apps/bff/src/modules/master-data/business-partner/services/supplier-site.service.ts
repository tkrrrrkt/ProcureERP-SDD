/**
 * SupplierSite BFF Service
 *
 * UI入力の正規化、Domain API呼び出し、DTO変換
 * - エラーは Pass-through（Domain API のエラーをそのまま返す）
 */

import { Injectable } from '@nestjs/common';
import { SupplierSiteDomainApiClient } from '../clients/supplier-site-domain-api.client';
import { PayeeDomainApiClient } from '../clients/payee-domain-api.client';
import { SupplierSiteMapper } from '../mappers/supplier-site.mapper';
import {
  ListSupplierSitesRequest,
  ListSupplierSitesResponse,
  GetSupplierSiteResponse,
  CreateSupplierSiteRequest,
  CreateSupplierSiteResponse,
  UpdateSupplierSiteRequest,
  UpdateSupplierSiteResponse,
  SupplierSiteSortBy,
} from '@procure/contracts/bff/business-partner';
import { ListSupplierSitesApiRequest } from '@procure/contracts/api/business-partner';

@Injectable()
export class SupplierSiteBffService {
  // Paging / Sorting Normalization
  private readonly DEFAULT_PAGE = 1;
  private readonly DEFAULT_PAGE_SIZE = 50;
  private readonly MAX_PAGE_SIZE = 200;
  private readonly DEFAULT_SORT_BY: SupplierSiteSortBy = 'supplierCode';
  private readonly DEFAULT_SORT_ORDER = 'asc' as const;

  // sortBy whitelist
  private readonly SORT_BY_WHITELIST: SupplierSiteSortBy[] = [
    'supplierCode',
    'supplierName',
    'supplierNameKana',
    'isActive',
  ];

  constructor(
    private readonly domainApiClient: SupplierSiteDomainApiClient,
    private readonly payeeDomainApiClient: PayeeDomainApiClient,
    private readonly mapper: SupplierSiteMapper,
  ) {}

  /**
   * 仕入先拠点一覧取得
   */
  async listSupplierSites(
    tenantId: string,
    userId: string,
    request: ListSupplierSitesRequest,
  ): Promise<ListSupplierSitesResponse> {
    // Paging / Sorting Normalization
    const page = request.page ?? this.DEFAULT_PAGE;
    const pageSize = Math.min(request.pageSize ?? this.DEFAULT_PAGE_SIZE, this.MAX_PAGE_SIZE);
    const sortBy = this.validateSortBy(request.sortBy);
    const sortOrder = request.sortOrder ?? this.DEFAULT_SORT_ORDER;
    const keyword = this.normalizeKeyword(request.keyword);

    // page/pageSize → offset/limit 変換
    const offset = (page - 1) * pageSize;
    const limit = pageSize;

    // Domain API 呼び出し
    const apiRequest: ListSupplierSitesApiRequest = {
      partyId: request.partyId,
      offset,
      limit,
      sortBy,
      sortOrder,
      keyword,
    };

    const apiResponse = await this.domainApiClient.listSupplierSites(
      tenantId,
      userId,
      apiRequest,
    );

    // Payee情報をバッチ取得（参照表示用）
    const payeeMap = await this.fetchPayeeInfo(
      tenantId,
      userId,
      apiResponse.items.map((item) => item.payeeId),
    );

    // BFF DTO に変換（page/pageSize を追加）
    return this.mapper.toListResponse(apiResponse, page, pageSize, payeeMap);
  }

  /**
   * 仕入先拠点詳細取得
   */
  async getSupplierSite(
    tenantId: string,
    userId: string,
    supplierSiteId: string,
  ): Promise<GetSupplierSiteResponse> {
    const apiResponse = await this.domainApiClient.getSupplierSite(
      tenantId,
      userId,
      supplierSiteId,
    );

    // Payee情報を取得（参照表示用）
    let payeeCode = '';
    let payeeName = '';

    if (apiResponse.supplierSite.payeeId) {
      try {
        const payeeResponse = await this.payeeDomainApiClient.getPayee(
          tenantId,
          userId,
          apiResponse.supplierSite.payeeId,
        );
        payeeCode = payeeResponse.payee.payeeCode;
        payeeName = payeeResponse.payee.payeeName;
      } catch {
        // Payee取得失敗時は空のまま
      }
    }

    return {
      supplierSite: this.mapper.toDto(apiResponse.supplierSite, payeeCode, payeeName),
    };
  }

  /**
   * 仕入先拠点新規登録
   */
  async createSupplierSite(
    tenantId: string,
    userId: string,
    request: CreateSupplierSiteRequest,
  ): Promise<CreateSupplierSiteResponse> {
    const apiRequest = this.mapper.toCreateApiRequest(request);

    const apiResponse = await this.domainApiClient.createSupplierSite(
      tenantId,
      userId,
      apiRequest,
    );

    // Payee情報を取得（参照表示用）
    let payeeCode = '';
    let payeeName = '';

    if (apiResponse.supplierSite.payeeId) {
      try {
        const payeeResponse = await this.payeeDomainApiClient.getPayee(
          tenantId,
          userId,
          apiResponse.supplierSite.payeeId,
        );
        payeeCode = payeeResponse.payee.payeeCode;
        payeeName = payeeResponse.payee.payeeName;
      } catch {
        // Payee取得失敗時は空のまま
      }
    }

    return {
      supplierSite: this.mapper.toDto(apiResponse.supplierSite, payeeCode, payeeName),
    };
  }

  /**
   * 仕入先拠点更新
   */
  async updateSupplierSite(
    tenantId: string,
    userId: string,
    supplierSiteId: string,
    request: UpdateSupplierSiteRequest,
  ): Promise<UpdateSupplierSiteResponse> {
    const apiRequest = this.mapper.toUpdateApiRequest(request);

    const apiResponse = await this.domainApiClient.updateSupplierSite(
      tenantId,
      userId,
      supplierSiteId,
      apiRequest,
    );

    // Payee情報を取得（参照表示用）
    let payeeCode = '';
    let payeeName = '';

    if (apiResponse.supplierSite.payeeId) {
      try {
        const payeeResponse = await this.payeeDomainApiClient.getPayee(
          tenantId,
          userId,
          apiResponse.supplierSite.payeeId,
        );
        payeeCode = payeeResponse.payee.payeeCode;
        payeeName = payeeResponse.payee.payeeName;
      } catch {
        // Payee取得失敗時は空のまま
      }
    }

    return {
      supplierSite: this.mapper.toDto(apiResponse.supplierSite, payeeCode, payeeName),
    };
  }

  /**
   * Payee情報のバッチ取得（一覧表示用）
   */
  private async fetchPayeeInfo(
    tenantId: string,
    userId: string,
    payeeIds: string[],
  ): Promise<Map<string, { code: string; name: string }>> {
    const payeeMap = new Map<string, { code: string; name: string }>();
    const uniqueIds = [...new Set(payeeIds.filter((id) => id))];

    // 並列でPayee情報を取得
    const results = await Promise.allSettled(
      uniqueIds.map((id) =>
        this.payeeDomainApiClient.getPayee(tenantId, userId, id),
      ),
    );

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const payee = result.value.payee;
        payeeMap.set(uniqueIds[index], {
          code: payee.payeeCode,
          name: payee.payeeName,
        });
      }
    });

    return payeeMap;
  }

  /**
   * sortBy バリデーション（whitelist）
   */
  private validateSortBy(sortBy?: SupplierSiteSortBy): SupplierSiteSortBy {
    if (!sortBy) {
      return this.DEFAULT_SORT_BY;
    }
    if (this.SORT_BY_WHITELIST.includes(sortBy)) {
      return sortBy;
    }
    return this.DEFAULT_SORT_BY;
  }

  /**
   * keyword 正規化（trim、空→undefined）
   */
  private normalizeKeyword(keyword?: string): string | undefined {
    if (!keyword) {
      return undefined;
    }
    const trimmed = keyword.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
}
