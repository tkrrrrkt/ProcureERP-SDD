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
  HttpException,
} from '@nestjs/common';
import { CompanyBankAccountBffService } from '../service/company-bank-account.service';
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
  SortOrder,
} from '@procure/contracts/bff/company-bank-account';

/**
 * Company Bank Account BFF Controller
 *
 * UI からの API エンドポイント
 * Global prefix: /api/bff
 */
@Controller('master-data/company-bank-accounts')
export class CompanyBankAccountBffController {
  constructor(
    private readonly companyBankAccountService: CompanyBankAccountBffService,
  ) {}

  /**
   * GET /api/bff/master-data/company-bank-accounts
   * 自社口座一覧取得
   */
  @Get()
  async listAccounts(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('sortBy') sortBy?: CompanyBankAccountSortBy,
    @Query('sortOrder') sortOrder?: SortOrder,
    @Query('isActive') isActive?: string,
  ): Promise<ListCompanyBankAccountsResponse> {
    this.validateAuth(tenantId, userId);

    const request: ListCompanyBankAccountsRequest = {
      page: page ? parseInt(page, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
      sortBy,
      sortOrder,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
    };

    return this.companyBankAccountService.listAccounts(tenantId, userId, request);
  }

  /**
   * GET /api/bff/master-data/company-bank-accounts/:id
   * 自社口座詳細取得
   */
  @Get(':id')
  async getAccount(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') accountId: string,
  ): Promise<GetCompanyBankAccountResponse> {
    this.validateAuth(tenantId, userId);

    return this.companyBankAccountService.getAccount(tenantId, userId, accountId);
  }

  /**
   * POST /api/bff/master-data/company-bank-accounts
   * 自社口座新規登録
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createAccount(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Body() request: CreateCompanyBankAccountRequest,
  ): Promise<CreateCompanyBankAccountResponse> {
    this.validateAuth(tenantId, userId);

    return this.companyBankAccountService.createAccount(tenantId, userId, request);
  }

  /**
   * PUT /api/bff/master-data/company-bank-accounts/:id
   * 自社口座更新
   */
  @Put(':id')
  async updateAccount(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') accountId: string,
    @Body() request: UpdateCompanyBankAccountRequest,
  ): Promise<UpdateCompanyBankAccountResponse> {
    this.validateAuth(tenantId, userId);

    return this.companyBankAccountService.updateAccount(
      tenantId,
      userId,
      accountId,
      request,
    );
  }

  /**
   * PATCH /api/bff/master-data/company-bank-accounts/:id/deactivate
   * 自社口座無効化
   */
  @Patch(':id/deactivate')
  async deactivateAccount(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') accountId: string,
    @Body() request: DeactivateCompanyBankAccountRequest,
  ): Promise<DeactivateCompanyBankAccountResponse> {
    this.validateAuth(tenantId, userId);

    return this.companyBankAccountService.deactivateAccount(
      tenantId,
      userId,
      accountId,
      request,
    );
  }

  /**
   * PATCH /api/bff/master-data/company-bank-accounts/:id/activate
   * 自社口座再有効化
   */
  @Patch(':id/activate')
  async activateAccount(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') accountId: string,
    @Body() request: ActivateCompanyBankAccountRequest,
  ): Promise<ActivateCompanyBankAccountResponse> {
    this.validateAuth(tenantId, userId);

    return this.companyBankAccountService.activateAccount(
      tenantId,
      userId,
      accountId,
      request,
    );
  }

  /**
   * PATCH /api/bff/master-data/company-bank-accounts/:id/set-default
   * デフォルト口座設定
   */
  @Patch(':id/set-default')
  async setDefaultAccount(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') accountId: string,
    @Body() request: SetDefaultCompanyBankAccountRequest,
  ): Promise<SetDefaultCompanyBankAccountResponse> {
    this.validateAuth(tenantId, userId);

    return this.companyBankAccountService.setDefaultAccount(
      tenantId,
      userId,
      accountId,
      request,
    );
  }

  /**
   * 認証情報バリデーション
   */
  private validateAuth(tenantId: string, userId: string): void {
    if (!tenantId || !userId) {
      throw new HttpException(
        { message: 'Unauthorized: Missing tenant_id or user_id' },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
