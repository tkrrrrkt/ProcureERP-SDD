import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Param,
  Query,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CompanyBankAccountService } from '../service/company-bank-account.service';
import {
  ListCompanyBankAccountsApiRequest,
  ListCompanyBankAccountsApiResponse,
  GetCompanyBankAccountApiResponse,
  CreateCompanyBankAccountApiRequest,
  CreateCompanyBankAccountApiResponse,
  UpdateCompanyBankAccountApiRequest,
  UpdateCompanyBankAccountApiResponse,
  DeactivateCompanyBankAccountApiRequest,
  DeactivateCompanyBankAccountApiResponse,
  ActivateCompanyBankAccountApiRequest,
  ActivateCompanyBankAccountApiResponse,
  SetDefaultCompanyBankAccountApiRequest,
  SetDefaultCompanyBankAccountApiResponse,
  CompanyBankAccountSortBy,
  SortOrder,
} from '@procure/contracts/api/company-bank-account';

/**
 * Company Bank Account Controller
 *
 * Domain API エンドポイント
 * - BFF から呼び出される
 * - tenant_id / user_id はヘッダーから取得
 */
@Controller('master-data/company-bank-accounts')
export class CompanyBankAccountController {
  constructor(
    private readonly companyBankAccountService: CompanyBankAccountService,
  ) {}

  /**
   * GET /api/master-data/company-bank-accounts
   * 自社口座一覧取得
   *
   * 権限: procure.company-account.read
   */
  @Get()
  async listAccounts(
    @Headers('x-tenant-id') tenantId: string,
    @Query('offset') offset?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: CompanyBankAccountSortBy,
    @Query('sortOrder') sortOrder?: SortOrder,
    @Query('isActive') isActive?: string,
  ): Promise<ListCompanyBankAccountsApiResponse> {
    const request: ListCompanyBankAccountsApiRequest = {
      offset: offset ? parseInt(offset, 10) : 0,
      limit: limit ? parseInt(limit, 10) : 50,
      sortBy,
      sortOrder,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
    };

    return this.companyBankAccountService.listAccounts(tenantId, request);
  }

  /**
   * GET /api/master-data/company-bank-accounts/:id
   * 自社口座詳細取得
   *
   * 権限: procure.company-account.read
   */
  @Get(':id')
  async getAccount(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') accountId: string,
  ): Promise<GetCompanyBankAccountApiResponse> {
    return this.companyBankAccountService.getAccount(tenantId, accountId);
  }

  /**
   * POST /api/master-data/company-bank-accounts
   * 自社口座新規登録
   *
   * 権限: procure.company-account.create
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createAccount(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Body() request: CreateCompanyBankAccountApiRequest,
  ): Promise<CreateCompanyBankAccountApiResponse> {
    return this.companyBankAccountService.createAccount(
      tenantId,
      userId,
      request,
    );
  }

  /**
   * PUT /api/master-data/company-bank-accounts/:id
   * 自社口座更新
   *
   * 権限: procure.company-account.update
   */
  @Put(':id')
  async updateAccount(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') accountId: string,
    @Body() request: UpdateCompanyBankAccountApiRequest,
  ): Promise<UpdateCompanyBankAccountApiResponse> {
    return this.companyBankAccountService.updateAccount(
      tenantId,
      userId,
      accountId,
      request,
    );
  }

  /**
   * PATCH /api/master-data/company-bank-accounts/:id/deactivate
   * 自社口座無効化
   *
   * 権限: procure.company-account.update
   */
  @Patch(':id/deactivate')
  async deactivateAccount(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') accountId: string,
    @Body() request: DeactivateCompanyBankAccountApiRequest,
  ): Promise<DeactivateCompanyBankAccountApiResponse> {
    return this.companyBankAccountService.deactivateAccount(
      tenantId,
      userId,
      accountId,
      request,
    );
  }

  /**
   * PATCH /api/master-data/company-bank-accounts/:id/activate
   * 自社口座再有効化
   *
   * 権限: procure.company-account.update
   */
  @Patch(':id/activate')
  async activateAccount(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') accountId: string,
    @Body() request: ActivateCompanyBankAccountApiRequest,
  ): Promise<ActivateCompanyBankAccountApiResponse> {
    return this.companyBankAccountService.activateAccount(
      tenantId,
      userId,
      accountId,
      request,
    );
  }

  /**
   * PATCH /api/master-data/company-bank-accounts/:id/set-default
   * デフォルト口座設定
   *
   * 権限: procure.company-account.update
   */
  @Patch(':id/set-default')
  async setDefaultAccount(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') accountId: string,
    @Body() request: SetDefaultCompanyBankAccountApiRequest,
  ): Promise<SetDefaultCompanyBankAccountApiResponse> {
    return this.companyBankAccountService.setDefaultAccount(
      tenantId,
      userId,
      accountId,
      request,
    );
  }
}
