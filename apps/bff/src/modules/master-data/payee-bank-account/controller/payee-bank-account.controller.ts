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
import { PayeeBankAccountBffService } from '../service/payee-bank-account.service';
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
  SortOrder,
} from '@procure/contracts/bff/payee-bank-account';

/**
 * Payee Bank Account BFF Controller
 *
 * UI からの API エンドポイント
 * Global prefix: /api/bff
 */
@Controller('master-data/payees/:payeeId/bank-accounts')
export class PayeeBankAccountBffController {
  constructor(
    private readonly payeeBankAccountService: PayeeBankAccountBffService,
  ) {}

  /**
   * GET /api/bff/master-data/payees/:payeeId/bank-accounts
   * 支払先口座一覧取得
   */
  @Get()
  async listAccounts(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('payeeId') payeeId: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('sortBy') sortBy?: PayeeBankAccountSortBy,
    @Query('sortOrder') sortOrder?: SortOrder,
    @Query('isActive') isActive?: string,
  ): Promise<ListPayeeBankAccountsResponse> {
    this.validateAuth(tenantId, userId);

    const request: ListPayeeBankAccountsRequest = {
      page: page ? parseInt(page, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
      sortBy,
      sortOrder,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
    };

    return this.payeeBankAccountService.listAccounts(
      tenantId,
      userId,
      payeeId,
      request,
    );
  }

  /**
   * GET /api/bff/master-data/payees/:payeeId/bank-accounts/:id
   * 支払先口座詳細取得
   */
  @Get(':id')
  async getAccount(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('payeeId') payeeId: string,
    @Param('id') accountId: string,
  ): Promise<GetPayeeBankAccountResponse> {
    this.validateAuth(tenantId, userId);

    return this.payeeBankAccountService.getAccount(
      tenantId,
      userId,
      payeeId,
      accountId,
    );
  }

  /**
   * POST /api/bff/master-data/payees/:payeeId/bank-accounts
   * 支払先口座新規登録
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createAccount(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('payeeId') payeeId: string,
    @Body() request: CreatePayeeBankAccountRequest,
  ): Promise<CreatePayeeBankAccountResponse> {
    this.validateAuth(tenantId, userId);

    return this.payeeBankAccountService.createAccount(
      tenantId,
      userId,
      payeeId,
      request,
    );
  }

  /**
   * PUT /api/bff/master-data/payees/:payeeId/bank-accounts/:id
   * 支払先口座更新
   */
  @Put(':id')
  async updateAccount(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('payeeId') payeeId: string,
    @Param('id') accountId: string,
    @Body() request: UpdatePayeeBankAccountRequest,
  ): Promise<UpdatePayeeBankAccountResponse> {
    this.validateAuth(tenantId, userId);

    return this.payeeBankAccountService.updateAccount(
      tenantId,
      userId,
      payeeId,
      accountId,
      request,
    );
  }

  /**
   * PATCH /api/bff/master-data/payees/:payeeId/bank-accounts/:id/deactivate
   * 支払先口座無効化
   */
  @Patch(':id/deactivate')
  async deactivateAccount(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('payeeId') payeeId: string,
    @Param('id') accountId: string,
    @Body() request: DeactivatePayeeBankAccountRequest,
  ): Promise<DeactivatePayeeBankAccountResponse> {
    this.validateAuth(tenantId, userId);

    return this.payeeBankAccountService.deactivateAccount(
      tenantId,
      userId,
      payeeId,
      accountId,
      request,
    );
  }

  /**
   * PATCH /api/bff/master-data/payees/:payeeId/bank-accounts/:id/activate
   * 支払先口座再有効化
   */
  @Patch(':id/activate')
  async activateAccount(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('payeeId') payeeId: string,
    @Param('id') accountId: string,
    @Body() request: ActivatePayeeBankAccountRequest,
  ): Promise<ActivatePayeeBankAccountResponse> {
    this.validateAuth(tenantId, userId);

    return this.payeeBankAccountService.activateAccount(
      tenantId,
      userId,
      payeeId,
      accountId,
      request,
    );
  }

  /**
   * PATCH /api/bff/master-data/payees/:payeeId/bank-accounts/:id/set-default
   * デフォルト口座設定
   */
  @Patch(':id/set-default')
  async setDefaultAccount(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('payeeId') payeeId: string,
    @Param('id') accountId: string,
    @Body() request: SetDefaultPayeeBankAccountRequest,
  ): Promise<SetDefaultPayeeBankAccountResponse> {
    this.validateAuth(tenantId, userId);

    return this.payeeBankAccountService.setDefaultAccount(
      tenantId,
      userId,
      payeeId,
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
