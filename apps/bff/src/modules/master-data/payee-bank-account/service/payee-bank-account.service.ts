import { Injectable } from '@nestjs/common';
import { PayeeBankAccountDomainApiClient } from '../clients/domain-api.client';
import { PayeeBankAccountMapper } from '../mappers/payee-bank-account.mapper';
import {
  ListPayeeBankAccountsRequest,
  ListPayeeBankAccountsResponse,
  GetPayeeBankAccountResponse,
  CreatePayeeBankAccountRequest,
  CreatePayeeBankAccountResponse,
  UpdatePayeeBankAccountRequest,
  UpdatePayeeBankAccountResponse,
  DeactivatePayeeBankAccountRequest,
  DeactivatePayeeBankAccountResponse,
  ActivatePayeeBankAccountRequest,
  ActivatePayeeBankAccountResponse,
  SetDefaultPayeeBankAccountRequest,
  SetDefaultPayeeBankAccountResponse,
  PayeeBankAccountSortBy,
} from '@procure/contracts/bff/payee-bank-account';
import { ListPayeeBankAccountsApiRequest } from '@procure/contracts/api/payee-bank-account';

/**
 * Payee Bank Account BFF Service
 *
 * UI入力の正規化、Domain API呼び出し、DTO変換
 */
@Injectable()
export class PayeeBankAccountBffService {
  private readonly DEFAULT_PAGE = 1;
  private readonly DEFAULT_PAGE_SIZE = 50;
  private readonly MAX_PAGE_SIZE = 200;
  private readonly DEFAULT_SORT_BY: PayeeBankAccountSortBy = 'createdAt';
  private readonly DEFAULT_SORT_ORDER = 'desc' as const;

  private readonly SORT_BY_WHITELIST: PayeeBankAccountSortBy[] = [
    'accountHolderName',
    'isDefault',
    'isActive',
    'createdAt',
  ];

  constructor(
    private readonly domainApiClient: PayeeBankAccountDomainApiClient,
    private readonly mapper: PayeeBankAccountMapper,
  ) {}

  /**
   * 支払先口座一覧取得
   */
  async listAccounts(
    tenantId: string,
    userId: string,
    payeeId: string,
    request: ListPayeeBankAccountsRequest,
  ): Promise<ListPayeeBankAccountsResponse> {
    const page = request.page ?? this.DEFAULT_PAGE;
    const pageSize = Math.min(
      request.pageSize ?? this.DEFAULT_PAGE_SIZE,
      this.MAX_PAGE_SIZE,
    );
    const sortBy = this.validateSortBy(request.sortBy);
    const sortOrder = request.sortOrder ?? this.DEFAULT_SORT_ORDER;

    const offset = (page - 1) * pageSize;
    const limit = pageSize;

    const apiRequest: ListPayeeBankAccountsApiRequest = {
      offset,
      limit,
      sortBy,
      sortOrder,
      isActive: request.isActive,
    };

    const apiResponse = await this.domainApiClient.listAccounts(
      tenantId,
      userId,
      payeeId,
      apiRequest,
    );

    return this.mapper.toListResponse(apiResponse, page, pageSize);
  }

  /**
   * 支払先口座詳細取得
   */
  async getAccount(
    tenantId: string,
    userId: string,
    payeeId: string,
    accountId: string,
  ): Promise<GetPayeeBankAccountResponse> {
    const apiResponse = await this.domainApiClient.getAccount(
      tenantId,
      userId,
      payeeId,
      accountId,
    );

    return {
      account: this.mapper.toDto(apiResponse.account),
    };
  }

  /**
   * 支払先口座新規登録
   */
  async createAccount(
    tenantId: string,
    userId: string,
    payeeId: string,
    request: CreatePayeeBankAccountRequest,
  ): Promise<CreatePayeeBankAccountResponse> {
    const apiRequest = this.mapper.toCreateApiRequest(request);

    const apiResponse = await this.domainApiClient.createAccount(
      tenantId,
      userId,
      payeeId,
      apiRequest,
    );

    return {
      account: this.mapper.toDto(apiResponse.account),
    };
  }

  /**
   * 支払先口座更新
   */
  async updateAccount(
    tenantId: string,
    userId: string,
    payeeId: string,
    accountId: string,
    request: UpdatePayeeBankAccountRequest,
  ): Promise<UpdatePayeeBankAccountResponse> {
    const apiRequest = this.mapper.toUpdateApiRequest(request);

    const apiResponse = await this.domainApiClient.updateAccount(
      tenantId,
      userId,
      payeeId,
      accountId,
      apiRequest,
    );

    return {
      account: this.mapper.toDto(apiResponse.account),
    };
  }

  /**
   * 支払先口座無効化
   */
  async deactivateAccount(
    tenantId: string,
    userId: string,
    payeeId: string,
    accountId: string,
    request: DeactivatePayeeBankAccountRequest,
  ): Promise<DeactivatePayeeBankAccountResponse> {
    const apiResponse = await this.domainApiClient.deactivateAccount(
      tenantId,
      userId,
      payeeId,
      accountId,
      { version: request.version },
    );

    return {
      account: this.mapper.toDto(apiResponse.account),
    };
  }

  /**
   * 支払先口座再有効化
   */
  async activateAccount(
    tenantId: string,
    userId: string,
    payeeId: string,
    accountId: string,
    request: ActivatePayeeBankAccountRequest,
  ): Promise<ActivatePayeeBankAccountResponse> {
    const apiResponse = await this.domainApiClient.activateAccount(
      tenantId,
      userId,
      payeeId,
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
    payeeId: string,
    accountId: string,
    request: SetDefaultPayeeBankAccountRequest,
  ): Promise<SetDefaultPayeeBankAccountResponse> {
    const apiResponse = await this.domainApiClient.setDefaultAccount(
      tenantId,
      userId,
      payeeId,
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
  private validateSortBy(sortBy?: PayeeBankAccountSortBy): PayeeBankAccountSortBy {
    if (!sortBy) {
      return this.DEFAULT_SORT_BY;
    }
    if (this.SORT_BY_WHITELIST.includes(sortBy)) {
      return sortBy;
    }
    return this.DEFAULT_SORT_BY;
  }
}
