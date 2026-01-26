import { Injectable } from '@nestjs/common';
import { TaxCodeDomainApiClient } from '../clients/domain-api.client';
import { TaxCodeMapper } from '../mappers/tax-code.mapper';
import {
  ListTaxCodesRequest,
  ListTaxCodesResponse,
  GetTaxCodeResponse,
  CreateTaxCodeRequest,
  CreateTaxCodeResponse,
  UpdateTaxCodeRequest,
  UpdateTaxCodeResponse,
  DeactivateTaxCodeRequest,
  DeactivateTaxCodeResponse,
  ActivateTaxCodeRequest,
  ActivateTaxCodeResponse,
  ListTaxBusinessCategoriesResponse,
  ListTaxRatesForDropdownResponse,
  TaxCodeSortBy,
} from '@procure/contracts/bff/tax-code';
import { ListTaxCodesApiRequest } from '@procure/contracts/api/tax-code';

/**
 * Tax Code BFF Service
 *
 * UI入力の正規化、Domain API呼び出し、DTO変換
 * - エラーは Pass-through（Domain API のエラーをそのまま返す）
 */
@Injectable()
export class TaxCodeBffService {
  // Paging / Sorting Normalization
  private readonly DEFAULT_PAGE = 1;
  private readonly DEFAULT_PAGE_SIZE = 20;
  private readonly MAX_PAGE_SIZE = 200;
  private readonly DEFAULT_SORT_BY: TaxCodeSortBy = 'taxCode';
  private readonly DEFAULT_SORT_ORDER = 'asc' as const;

  // sortBy whitelist
  private readonly SORT_BY_WHITELIST: TaxCodeSortBy[] = [
    'taxCode',
    'taxBusinessCategoryName',
    'ratePercent',
    'taxInOut',
    'isActive',
  ];

  constructor(
    private readonly domainApiClient: TaxCodeDomainApiClient,
    private readonly mapper: TaxCodeMapper,
  ) {}

  /**
   * 税コード一覧取得
   */
  async listTaxCodes(
    tenantId: string,
    userId: string,
    request: ListTaxCodesRequest,
  ): Promise<ListTaxCodesResponse> {
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
    const apiRequest: ListTaxCodesApiRequest = {
      offset,
      limit,
      sortBy,
      sortOrder,
      keyword,
      taxBusinessCategoryId: request.taxBusinessCategoryId,
      isActive: request.isActive,
    };

    const apiResponse = await this.domainApiClient.listTaxCodes(
      tenantId,
      userId,
      apiRequest,
    );

    // BFF DTO に変換（page/pageSize を追加）
    return this.mapper.toListResponse(apiResponse, page, pageSize);
  }

  /**
   * 税コード詳細取得
   */
  async getTaxCode(
    tenantId: string,
    userId: string,
    taxCodeId: string,
  ): Promise<GetTaxCodeResponse> {
    const apiResponse = await this.domainApiClient.getTaxCode(
      tenantId,
      userId,
      taxCodeId,
    );

    return {
      taxCode: this.mapper.toDto(apiResponse.taxCode),
    };
  }

  /**
   * 税コード新規登録
   */
  async createTaxCode(
    tenantId: string,
    userId: string,
    request: CreateTaxCodeRequest,
  ): Promise<CreateTaxCodeResponse> {
    const apiRequest = this.mapper.toCreateApiRequest(request);

    const apiResponse = await this.domainApiClient.createTaxCode(
      tenantId,
      userId,
      apiRequest,
    );

    return {
      taxCode: this.mapper.toDto(apiResponse.taxCode),
    };
  }

  /**
   * 税コード更新
   */
  async updateTaxCode(
    tenantId: string,
    userId: string,
    taxCodeId: string,
    request: UpdateTaxCodeRequest,
  ): Promise<UpdateTaxCodeResponse> {
    const apiRequest = this.mapper.toUpdateApiRequest(request);

    const apiResponse = await this.domainApiClient.updateTaxCode(
      tenantId,
      userId,
      taxCodeId,
      apiRequest,
    );

    return {
      taxCode: this.mapper.toDto(apiResponse.taxCode),
    };
  }

  /**
   * 税コード無効化
   */
  async deactivateTaxCode(
    tenantId: string,
    userId: string,
    taxCodeId: string,
    request: DeactivateTaxCodeRequest,
  ): Promise<DeactivateTaxCodeResponse> {
    const apiResponse = await this.domainApiClient.deactivateTaxCode(
      tenantId,
      userId,
      taxCodeId,
      { version: request.version },
    );

    return {
      taxCode: this.mapper.toDto(apiResponse.taxCode),
    };
  }

  /**
   * 税コード有効化
   */
  async activateTaxCode(
    tenantId: string,
    userId: string,
    taxCodeId: string,
    request: ActivateTaxCodeRequest,
  ): Promise<ActivateTaxCodeResponse> {
    const apiResponse = await this.domainApiClient.activateTaxCode(
      tenantId,
      userId,
      taxCodeId,
      { version: request.version },
    );

    return {
      taxCode: this.mapper.toDto(apiResponse.taxCode),
    };
  }

  /**
   * 税区分一覧取得（ドロップダウン用）
   */
  async listTaxBusinessCategories(
    tenantId: string,
    userId: string,
  ): Promise<ListTaxBusinessCategoriesResponse> {
    const apiResponse = await this.domainApiClient.listTaxBusinessCategories(
      tenantId,
      userId,
    );

    return this.mapper.toTaxBusinessCategoriesResponse(apiResponse);
  }

  /**
   * 税率一覧取得（ドロップダウン用）
   */
  async listTaxRatesForDropdown(
    tenantId: string,
    userId: string,
  ): Promise<ListTaxRatesForDropdownResponse> {
    const apiResponse = await this.domainApiClient.listTaxRatesForDropdown(
      tenantId,
      userId,
    );

    return this.mapper.toTaxRatesForDropdownResponse(apiResponse);
  }

  /**
   * sortBy バリデーション（whitelist）
   */
  private validateSortBy(sortBy?: TaxCodeSortBy): TaxCodeSortBy {
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
