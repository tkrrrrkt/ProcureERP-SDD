/**
 * Party BFF Service
 *
 * UI入力の正規化、Domain API呼び出し、DTO変換
 * - エラーは Pass-through（Domain API のエラーをそのまま返す）
 */

import { Injectable } from '@nestjs/common';
import { PartyDomainApiClient } from '../clients/party-domain-api.client';
import { PartyMapper } from '../mappers/party.mapper';
import {
  ListPartiesRequest,
  ListPartiesResponse,
  GetPartyResponse,
  CreatePartyRequest,
  CreatePartyResponse,
  UpdatePartyRequest,
  UpdatePartyResponse,
  PartySortBy,
} from '@procure/contracts/bff/business-partner';
import { ListPartiesApiRequest } from '@procure/contracts/api/business-partner';

@Injectable()
export class PartyBffService {
  // Paging / Sorting Normalization
  private readonly DEFAULT_PAGE = 1;
  private readonly DEFAULT_PAGE_SIZE = 50;
  private readonly MAX_PAGE_SIZE = 200;
  private readonly DEFAULT_SORT_BY: PartySortBy = 'partyCode';
  private readonly DEFAULT_SORT_ORDER = 'asc' as const;

  // sortBy whitelist
  private readonly SORT_BY_WHITELIST: PartySortBy[] = [
    'partyCode',
    'partyName',
    'partyNameKana',
    'isSupplier',
    'isCustomer',
    'isActive',
  ];

  constructor(
    private readonly domainApiClient: PartyDomainApiClient,
    private readonly mapper: PartyMapper,
  ) {}

  /**
   * 取引先一覧取得
   */
  async listParties(
    tenantId: string,
    userId: string,
    request: ListPartiesRequest,
  ): Promise<ListPartiesResponse> {
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
    const apiRequest: ListPartiesApiRequest = {
      offset,
      limit,
      sortBy,
      sortOrder,
      keyword,
      isSupplier: request.isSupplier,
      isCustomer: request.isCustomer,
    };

    const apiResponse = await this.domainApiClient.listParties(
      tenantId,
      userId,
      apiRequest,
    );

    // BFF DTO に変換（page/pageSize を追加）
    return this.mapper.toListResponse(apiResponse, page, pageSize);
  }

  /**
   * 取引先詳細取得
   */
  async getParty(
    tenantId: string,
    userId: string,
    partyId: string,
  ): Promise<GetPartyResponse> {
    const apiResponse = await this.domainApiClient.getParty(
      tenantId,
      userId,
      partyId,
    );

    return {
      party: this.mapper.toDto(apiResponse.party),
    };
  }

  /**
   * 取引先新規登録
   */
  async createParty(
    tenantId: string,
    userId: string,
    request: CreatePartyRequest,
  ): Promise<CreatePartyResponse> {
    const apiRequest = this.mapper.toCreateApiRequest(request);

    const apiResponse = await this.domainApiClient.createParty(
      tenantId,
      userId,
      apiRequest,
    );

    return {
      party: this.mapper.toDto(apiResponse.party),
    };
  }

  /**
   * 取引先更新
   */
  async updateParty(
    tenantId: string,
    userId: string,
    partyId: string,
    request: UpdatePartyRequest,
  ): Promise<UpdatePartyResponse> {
    const apiRequest = this.mapper.toUpdateApiRequest(request);

    const apiResponse = await this.domainApiClient.updateParty(
      tenantId,
      userId,
      partyId,
      apiRequest,
    );

    return {
      party: this.mapper.toDto(apiResponse.party),
    };
  }

  /**
   * sortBy バリデーション（whitelist）
   */
  private validateSortBy(sortBy?: PartySortBy): PartySortBy {
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
