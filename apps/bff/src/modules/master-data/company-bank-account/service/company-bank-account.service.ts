import { Injectable } from '@nestjs/common';
import { CompanyBankAccountDomainApiClient } from '../clients/domain-api.client';
import { CompanyBankAccountMapper } from '../mappers/company-bank-account.mapper';
import {
  ListCompanyBankAccountsRequest,
  ListCompanyBankAccountsResponse,
  GetCompanyBankAccountResponse,
  CreateCompanyBankAccountRequest,
  CreateCompanyBankAccountResponse,
  UpdateCompanyBankAccountRequest,
  UpdateCompanyBankAccountResponse,
  DeactivateCompanyBankAccountRequest,
  DeactivateCompanyBankAccountResponse,
  ActivateCompanyBankAccountRequest,
  ActivateCompanyBankAccountResponse,
  SetDefaultCompanyBankAccountRequest,
  SetDefaultCompanyBankAccountResponse,
  CompanyBankAccountSortBy,
} from '@procure/contracts/bff/company-bank-account';
import { ListCompanyBankAccountsApiRequest } from '@procure/contracts/api/company-bank-account';

/**
 * Company Bank Account BFF Service
 *
 * UI入力の正規化、Domain API呼び出し、DTO変換
 */
@Injectable()
export class CompanyBankAccountBffService {
  private readonly DEFAULT_PAGE = 1;
  private readonly DEFAULT_PAGE_SIZE = 50;
  private readonly MAX_PAGE_SIZE = 200;
  private readonly DEFAULT_SORT_BY: CompanyBankAccountSortBy = 'accountCode';
  private readonly DEFAULT_SORT_ORDER = 'asc' as const;

  private readonly SORT_BY_WHITELIST: CompanyBankAccountSortBy[] = [
    'accountCode',
    'accountName',
    'isDefault',
    'isActive',
    'createdAt',
  ];

  constructor(
    private readonly domainApiClient: CompanyBankAccountDomainApiClient,
    private readonly mapper: CompanyBankAccountMapper,
  ) {}

  /**
   * 自社口座一覧取得
   */
  async listAccounts(
    tenantId: string,
    userId: string,
    request: ListCompanyBankAccountsRequest,
  ): Promise<ListCompanyBankAccountsResponse> {
    const page = request.page ?? this.DEFAULT_PAGE;
    const pageSize = Math.min(
      request.pageSize ?? this.DEFAULT_PAGE_SIZE,
      this.MAX_PAGE_SIZE,
    );
    const sortBy = this.validateSortBy(request.sortBy);
    const sortOrder = request.sortOrder ?? this.DEFAULT_SORT_ORDER;

    const offset = (page - 1) * pageSize;
    const limit = pageSize;

    const apiRequest: ListCompanyBankAccountsApiRequest = {
      offset,
      limit,
      sortBy,
      sortOrder,
      isActive: request.isActive,
    };

    const apiResponse = await this.domainApiClient.listAccounts(
      tenantId,
      userId,
      apiRequest,
    );

    return this.mapper.toListResponse(apiResponse, page, pageSize);
  }

  /**
   * 自社口座詳細取得
   */
  async getAccount(
    tenantId: string,
    userId: string,
    accountId: string,
  ): Promise<GetCompanyBankAccountResponse> {
    const apiResponse = await this.domainApiClient.getAccount(
      tenantId,
      userId,
      accountId,
    );

    return {
      account: this.mapper.toDto(apiResponse.account),
    };
  }

  /**
   * 自社口座新規登録
   */
  async createAccount(
    tenantId: string,
    userId: string,
    request: CreateCompanyBankAccountRequest,
  ): Promise<CreateCompanyBankAccountResponse> {
    const apiRequest = this.mapper.toCreateApiRequest(request);

    const apiResponse = await this.domainApiClient.createAccount(
      tenantId,
      userId,
      apiRequest,
    );

    return {
      account: this.mapper.toDto(apiResponse.account),
    };
  }

  /**
   * 自社口座更新
   */
  async updateAccount(
    tenantId: string,
    userId: string,
    accountId: string,
    request: UpdateCompanyBankAccountRequest,
  ): Promise<UpdateCompanyBankAccountResponse> {
    const apiRequest = this.mapper.toUpdateApiRequest(request);

    const apiResponse = await this.domainApiClient.updateAccount(
      tenantId,
      userId,
      accountId,
      apiRequest,
    );

    return {
      account: this.mapper.toDto(apiResponse.account),
    };
  }

  /**
   * 自社口座無効化
   */
  async deactivateAccount(
    tenantId: string,
    userId: string,
    accountId: string,
    request: DeactivateCompanyBankAccountRequest,
  ): Promise<DeactivateCompanyBankAccountResponse> {
    const apiResponse = await this.domainApiClient.deactivateAccount(
      tenantId,
      userId,
      accountId,
      { version: request.version },
    );

    return {
      account: this.mapper.toDto(apiResponse.account),
    };
  }

  /**
   * 自社口座再有効化
   */
  async activateAccount(
    tenantId: string,
    userId: string,
    accountId: string,
    request: ActivateCompanyBankAccountRequest,
  ): Promise<ActivateCompanyBankAccountResponse> {
    const apiResponse = await this.domainApiClient.activateAccount(
      tenantId,
      userId,
      accountId,
      { version: request.version },
    );

    return {
      account: this.mapper.toDto(apiResponse.account),
    };
  }

  /**
   * デフォルト口座設定
   */
  async setDefaultAccount(
    tenantId: string,
    userId: string,
    accountId: string,
    request: SetDefaultCompanyBankAccountRequest,
  ): Promise<SetDefaultCompanyBankAccountResponse> {
    const apiResponse = await this.domainApiClient.setDefaultAccount(
      tenantId,
      userId,
      accountId,
      { version: request.version },
    );

    return {
      account: this.mapper.toDto(apiResponse.account),
      previousDefault: apiResponse.previousDefault
        ? this.mapper.toDto(apiResponse.previousDefault)
        : null,
    };
  }

  /**
   * sortBy バリデーション
   */
  private validateSortBy(sortBy?: CompanyBankAccountSortBy): CompanyBankAccountSortBy {
    if (!sortBy) {
      return this.DEFAULT_SORT_BY;
    }
    if (this.SORT_BY_WHITELIST.includes(sortBy)) {
      return sortBy;
    }
    return this.DEFAULT_SORT_BY;
  }
}
