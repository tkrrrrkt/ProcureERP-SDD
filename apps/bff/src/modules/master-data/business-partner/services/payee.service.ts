/**
 * Payee BFF Service
 *
 * UI入力の正規化、Domain API呼び出し、DTO変換
 * - エラーは Pass-through（Domain API のエラーをそのまま返す）
 */

import { Injectable } from '@nestjs/common';
import { PayeeDomainApiClient } from '../clients/payee-domain-api.client';
import { PayeeMapper } from '../mappers/payee.mapper';
import {
  ListPayeesRequest,
  ListPayeesResponse,
  GetPayeeResponse,
  CreatePayeeRequest,
  CreatePayeeResponse,
  UpdatePayeeRequest,
  UpdatePayeeResponse,
  PayeeSortBy,
} from '@procure/contracts/bff/business-partner';
import { ListPayeesApiRequest } from '@procure/contracts/api/business-partner';

@Injectable()
export class PayeeBffService {
  // Paging / Sorting Normalization
  private readonly DEFAULT_PAGE = 1;
  private readonly DEFAULT_PAGE_SIZE = 50;
  private readonly MAX_PAGE_SIZE = 200;
  private readonly DEFAULT_SORT_BY: PayeeSortBy = 'payeeCode';
  private readonly DEFAULT_SORT_ORDER = 'asc' as const;

  // sortBy whitelist
  private readonly SORT_BY_WHITELIST: PayeeSortBy[] = [
    'payeeCode',
    'payeeName',
    'payeeNameKana',
    'isActive',
  ];

  constructor(
    private readonly domainApiClient: PayeeDomainApiClient,
    private readonly mapper: PayeeMapper,
  ) {}

  /**
   * 支払先一覧取得
   */
  async listPayees(
    tenantId: string,
    userId: string,
    request: ListPayeesRequest,
  ): Promise<ListPayeesResponse> {
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
    const apiRequest: ListPayeesApiRequest = {
      partyId: request.partyId,
      offset,
      limit,
      sortBy,
      sortOrder,
      keyword,
    };

    const apiResponse = await this.domainApiClient.listPayees(
      tenantId,
      userId,
      apiRequest,
    );

    // BFF DTO に変換（page/pageSize を追加）
    return this.mapper.toListResponse(apiResponse, page, pageSize);
  }

  /**
   * 支払先詳細取得
   */
  async getPayee(
    tenantId: string,
    userId: string,
    payeeId: string,
  ): Promise<GetPayeeResponse> {
    const apiResponse = await this.domainApiClient.getPayee(
      tenantId,
      userId,
      payeeId,
    );

    return {
      payee: this.mapper.toDto(apiResponse.payee),
    };
  }

  /**
   * 支払先新規登録
   */
  async createPayee(
    tenantId: string,
    userId: string,
    request: CreatePayeeRequest,
  ): Promise<CreatePayeeResponse> {
    const apiRequest = this.mapper.toCreateApiRequest(request);

    const apiResponse = await this.domainApiClient.createPayee(
      tenantId,
      userId,
      apiRequest,
    );

    return {
      payee: this.mapper.toDto(apiResponse.payee),
    };
  }

  /**
   * 支払先更新
   */
  async updatePayee(
    tenantId: string,
    userId: string,
    payeeId: string,
    request: UpdatePayeeRequest,
  ): Promise<UpdatePayeeResponse> {
    const apiRequest = this.mapper.toUpdateApiRequest(request);

    const apiResponse = await this.domainApiClient.updatePayee(
      tenantId,
      userId,
      payeeId,
      apiRequest,
    );

    return {
      payee: this.mapper.toDto(apiResponse.payee),
    };
  }

  /**
   * sortBy バリデーション（whitelist）
   */
  private validateSortBy(sortBy?: PayeeSortBy): PayeeSortBy {
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
