import { Injectable } from '@nestjs/common';
import { BankDomainApiClient } from '../clients/domain-api.client';
import { BankMasterMapper } from '../mappers/bank-master.mapper';
import {
  ListBanksRequest,
  ListBanksResponse,
  GetBankResponse,
  CreateBankRequest,
  CreateBankResponse,
  UpdateBankRequest,
  UpdateBankResponse,
  DeactivateBankRequest,
  DeactivateBankResponse,
  ActivateBankRequest,
  ActivateBankResponse,
  BankSortBy,
} from '@procure/contracts/bff/bank-master';
import { ListBanksApiRequest } from '@procure/contracts/api/bank-master';

/**
 * Bank BFF Service
 *
 * UI入力の正規化、Domain API呼び出し、DTO変換
 * - エラーは Pass-through（Domain API のエラーをそのまま返す）
 */
@Injectable()
export class BankBffService {
  // Paging / Sorting Normalization
  private readonly DEFAULT_PAGE = 1;
  private readonly DEFAULT_PAGE_SIZE = 50;
  private readonly MAX_PAGE_SIZE = 200;
  private readonly DEFAULT_SORT_BY: BankSortBy = 'displayOrder';
  private readonly DEFAULT_SORT_ORDER = 'asc' as const;

  // sortBy whitelist
  private readonly SORT_BY_WHITELIST: BankSortBy[] = [
    'bankCode',
    'bankName',
    'bankNameKana',
    'displayOrder',
    'isActive',
  ];

  constructor(
    private readonly domainApiClient: BankDomainApiClient,
    private readonly mapper: BankMasterMapper,
  ) {}

  /**
   * 銀行一覧取得
   */
  async listBanks(
    tenantId: string,
    userId: string,
    request: ListBanksRequest,
  ): Promise<ListBanksResponse> {
    // Paging / Sorting Normalization
    const page = request.page ?? this.DEFAULT_PAGE;
    const pageSize = Math.min(
      request.pageSize ?? this.DEFAULT_PAGE_SIZE,
      this.MAX_PAGE_SIZE,
    );
    const sortBy = this.validateSortBy(request.sortBy);
    const sortOrder = request.sortOrder ?? this.DEFAULT_SORT_ORDER;
    const keyword = this.normalizeKeyword(request.keyword);

    // page/pageSize → offset/limit 変換
    const offset = (page - 1) * pageSize;
    const limit = pageSize;

    // Domain API 呼び出し
    const apiRequest: ListBanksApiRequest = {
      offset,
      limit,
      sortBy,
      sortOrder,
      keyword,
      isActive: request.isActive,
    };

    const apiResponse = await this.domainApiClient.listBanks(
      tenantId,
      userId,
      apiRequest,
    );

    // BFF DTO に変換（page/pageSize を追加）
    return this.mapper.toBankListResponse(apiResponse, page, pageSize);
  }

  /**
   * 銀行詳細取得
   */
  async getBank(
    tenantId: string,
    userId: string,
    bankId: string,
  ): Promise<GetBankResponse> {
    const apiResponse = await this.domainApiClient.getBank(
      tenantId,
      userId,
      bankId,
    );

    return {
      bank: this.mapper.toBankDto(apiResponse.bank),
    };
  }

  /**
   * 銀行新規登録
   */
  async createBank(
    tenantId: string,
    userId: string,
    request: CreateBankRequest,
  ): Promise<CreateBankResponse> {
    const apiRequest = this.mapper.toCreateBankApiRequest(request);

    const apiResponse = await this.domainApiClient.createBank(
      tenantId,
      userId,
      apiRequest,
    );

    return {
      bank: this.mapper.toBankDto(apiResponse.bank),
    };
  }

  /**
   * 銀行更新
   */
  async updateBank(
    tenantId: string,
    userId: string,
    bankId: string,
    request: UpdateBankRequest,
  ): Promise<UpdateBankResponse> {
    const apiRequest = this.mapper.toUpdateBankApiRequest(request);

    const apiResponse = await this.domainApiClient.updateBank(
      tenantId,
      userId,
      bankId,
      apiRequest,
    );

    return {
      bank: this.mapper.toBankDto(apiResponse.bank),
    };
  }

  /**
   * 銀行無効化
   */
  async deactivateBank(
    tenantId: string,
    userId: string,
    bankId: string,
    request: DeactivateBankRequest,
  ): Promise<DeactivateBankResponse> {
    const apiResponse = await this.domainApiClient.deactivateBank(
      tenantId,
      userId,
      bankId,
      { version: request.version },
    );

    return {
      bank: this.mapper.toBankDto(apiResponse.bank),
      warnings: apiResponse.warnings,
    };
  }

  /**
   * 銀行再有効化
   */
  async activateBank(
    tenantId: string,
    userId: string,
    bankId: string,
    request: ActivateBankRequest,
  ): Promise<ActivateBankResponse> {
    const apiResponse = await this.domainApiClient.activateBank(
      tenantId,
      userId,
      bankId,
      { version: request.version },
    );

    return {
      bank: this.mapper.toBankDto(apiResponse.bank),
    };
  }

  /**
   * sortBy バリデーション（whitelist）
   */
  private validateSortBy(sortBy?: BankSortBy): BankSortBy {
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
