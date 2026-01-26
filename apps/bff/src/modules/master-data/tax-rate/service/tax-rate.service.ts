import { Injectable } from '@nestjs/common';
import { TaxRateDomainApiClient } from '../clients/domain-api.client';
import { TaxRateMapper } from '../mappers/tax-rate.mapper';
import {
  ListTaxRatesRequest,
  ListTaxRatesResponse,
  GetTaxRateResponse,
  CreateTaxRateRequest,
  CreateTaxRateResponse,
  UpdateTaxRateRequest,
  UpdateTaxRateResponse,
  DeactivateTaxRateRequest,
  DeactivateTaxRateResponse,
  ActivateTaxRateRequest,
  ActivateTaxRateResponse,
  TaxRateSortBy,
} from '@procure/contracts/bff/tax-rate';
import { ListTaxRatesApiRequest } from '@procure/contracts/api/tax-rate';

/**
 * Tax Rate BFF Service
 *
 * UI入力の正規化、Domain API呼び出し、DTO変換
 * - エラーは Pass-through（Domain API のエラーをそのまま返す）
 */
@Injectable()
export class TaxRateBffService {
  // Paging / Sorting Normalization
  private readonly DEFAULT_PAGE = 1;
  private readonly DEFAULT_PAGE_SIZE = 20;
  private readonly MAX_PAGE_SIZE = 200;
  private readonly DEFAULT_SORT_BY: TaxRateSortBy = 'taxRateCode';
  private readonly DEFAULT_SORT_ORDER = 'asc' as const;

  // sortBy whitelist
  private readonly SORT_BY_WHITELIST: TaxRateSortBy[] = [
    'taxRateCode',
    'ratePercent',
    'validFrom',
    'isActive',
  ];

  constructor(
    private readonly domainApiClient: TaxRateDomainApiClient,
    private readonly mapper: TaxRateMapper,
  ) {}

  /**
   * 税率一覧取得
   */
  async listTaxRates(
    tenantId: string,
    userId: string,
    request: ListTaxRatesRequest,
  ): Promise<ListTaxRatesResponse> {
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
    const apiRequest: ListTaxRatesApiRequest = {
      offset,
      limit,
      sortBy,
      sortOrder,
      keyword,
      isActive: request.isActive,
    };

    const apiResponse = await this.domainApiClient.listTaxRates(
      tenantId,
      userId,
      apiRequest,
    );

    // BFF DTO に変換（page/pageSize を追加）
    return this.mapper.toListResponse(apiResponse, page, pageSize);
  }

  /**
   * 税率詳細取得
   */
  async getTaxRate(
    tenantId: string,
    userId: string,
    taxRateId: string,
  ): Promise<GetTaxRateResponse> {
    const apiResponse = await this.domainApiClient.getTaxRate(
      tenantId,
      userId,
      taxRateId,
    );

    return {
      taxRate: this.mapper.toDto(apiResponse.taxRate),
    };
  }

  /**
   * 税率新規登録
   */
  async createTaxRate(
    tenantId: string,
    userId: string,
    request: CreateTaxRateRequest,
  ): Promise<CreateTaxRateResponse> {
    const apiRequest = this.mapper.toCreateApiRequest(request);

    const apiResponse = await this.domainApiClient.createTaxRate(
      tenantId,
      userId,
      apiRequest,
    );

    return {
      taxRate: this.mapper.toDto(apiResponse.taxRate),
    };
  }

  /**
   * 税率更新
   */
  async updateTaxRate(
    tenantId: string,
    userId: string,
    taxRateId: string,
    request: UpdateTaxRateRequest,
  ): Promise<UpdateTaxRateResponse> {
    const apiRequest = this.mapper.toUpdateApiRequest(request);

    const apiResponse = await this.domainApiClient.updateTaxRate(
      tenantId,
      userId,
      taxRateId,
      apiRequest,
    );

    return {
      taxRate: this.mapper.toDto(apiResponse.taxRate),
    };
  }

  /**
   * 税率無効化
   */
  async deactivateTaxRate(
    tenantId: string,
    userId: string,
    taxRateId: string,
    request: DeactivateTaxRateRequest,
  ): Promise<DeactivateTaxRateResponse> {
    const apiResponse = await this.domainApiClient.deactivateTaxRate(
      tenantId,
      userId,
      taxRateId,
      { version: request.version },
    );

    return {
      taxRate: this.mapper.toDto(apiResponse.taxRate),
    };
  }

  /**
   * 税率有効化
   */
  async activateTaxRate(
    tenantId: string,
    userId: string,
    taxRateId: string,
    request: ActivateTaxRateRequest,
  ): Promise<ActivateTaxRateResponse> {
    const apiResponse = await this.domainApiClient.activateTaxRate(
      tenantId,
      userId,
      taxRateId,
      { version: request.version },
    );

    return {
      taxRate: this.mapper.toDto(apiResponse.taxRate),
    };
  }

  /**
   * sortBy バリデーション（whitelist）
   */
  private validateSortBy(sortBy?: TaxRateSortBy): TaxRateSortBy {
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
