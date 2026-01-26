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
import { PayeeBankAccountService } from '../service/payee-bank-account.service';
import {
  ListPayeeBankAccountsApiRequest,
  ListPayeeBankAccountsApiResponse,
  GetPayeeBankAccountApiResponse,
  CreatePayeeBankAccountApiRequest,
  CreatePayeeBankAccountApiResponse,
  UpdatePayeeBankAccountApiRequest,
  UpdatePayeeBankAccountApiResponse,
  DeactivatePayeeBankAccountApiRequest,
  DeactivatePayeeBankAccountApiResponse,
  ActivatePayeeBankAccountApiRequest,
  ActivatePayeeBankAccountApiResponse,
  SetDefaultPayeeBankAccountApiRequest,
  SetDefaultPayeeBankAccountApiResponse,
  PayeeBankAccountSortBy,
  SortOrder,
} from '@procure/contracts/api/payee-bank-account';

/**
 * Payee Bank Account Controller
 *
 * Domain API エンドポイント
 * - BFF から呼び出される
 * - tenant_id / user_id はヘッダーから取得
 * - payee_id はパスパラメータから取得
 */
@Controller('master-data/payees/:payeeId/bank-accounts')
export class PayeeBankAccountController {
  constructor(
    private readonly payeeBankAccountService: PayeeBankAccountService,
  ) {}

  /**
   * GET /api/master-data/payees/:payeeId/bank-accounts
   * 支払先口座一覧取得
   *
   * 権限: procure.payee.read
   */
  @Get()
  async listAccounts(
    @Headers('x-tenant-id') tenantId: string,
    @Param('payeeId') payeeId: string,
    @Query('offset') offset?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: PayeeBankAccountSortBy,
    @Query('sortOrder') sortOrder?: SortOrder,
    @Query('isActive') isActive?: string,
  ): Promise<ListPayeeBankAccountsApiResponse> {
    const request: ListPayeeBankAccountsApiRequest = {
      offset: offset ? parseInt(offset, 10) : 0,
      limit: limit ? parseInt(limit, 10) : 50,
      sortBy,
      sortOrder,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
    };

    return this.payeeBankAccountService.listAccounts(tenantId, payeeId, request);
  }

  /**
   * GET /api/master-data/payees/:payeeId/bank-accounts/:id
   * 支払先口座詳細取得
   *
   * 権限: procure.payee.read
   */
  @Get(':id')
  async getAccount(
    @Headers('x-tenant-id') tenantId: string,
    @Param('payeeId') _payeeId: string,
    @Param('id') accountId: string,
  ): Promise<GetPayeeBankAccountApiResponse> {
    // payeeId is part of URL but lookup is by accountId (account has payeeId internally)
    return this.payeeBankAccountService.getAccount(tenantId, accountId);
  }

  /**
   * POST /api/master-data/payees/:payeeId/bank-accounts
   * 支払先口座新規登録
   *
   * 権限: procure.payee.create
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createAccount(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('payeeId') payeeId: string,
    @Body() request: CreatePayeeBankAccountApiRequest,
  ): Promise<CreatePayeeBankAccountApiResponse> {
    return this.payeeBankAccountService.createAccount(
      tenantId,
      userId,
      payeeId,
      request,
    );
  }

  /**
   * PUT /api/master-data/payees/:payeeId/bank-accounts/:id
   * 支払先口座更新
   *
   * 権限: procure.payee.update
   */
  @Put(':id')
  async updateAccount(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('payeeId') _payeeId: string,
    @Param('id') accountId: string,
    @Body() request: UpdatePayeeBankAccountApiRequest,
  ): Promise<UpdatePayeeBankAccountApiResponse> {
    return this.payeeBankAccountService.updateAccount(
      tenantId,
      userId,
      accountId,
      request,
    );
  }

  /**
   * PATCH /api/master-data/payees/:payeeId/bank-accounts/:id/deactivate
   * 支払先口座無効化
   *
   * 権限: procure.payee.update
   */
  @Patch(':id/deactivate')
  async deactivateAccount(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('payeeId') _payeeId: string,
    @Param('id') accountId: string,
    @Body() request: DeactivatePayeeBankAccountApiRequest,
  ): Promise<DeactivatePayeeBankAccountApiResponse> {
    return this.payeeBankAccountService.deactivateAccount(
      tenantId,
      userId,
      accountId,
      request,
    );
  }

  /**
   * PATCH /api/master-data/payees/:payeeId/bank-accounts/:id/activate
   * 支払先口座再有効化
   *
   * 権限: procure.payee.update
   */
  @Patch(':id/activate')
  async activateAccount(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('payeeId') _payeeId: string,
    @Param('id') accountId: string,
    @Body() request: ActivatePayeeBankAccountApiRequest,
  ): Promise<ActivatePayeeBankAccountApiResponse> {
    return this.payeeBankAccountService.activateAccount(
      tenantId,
      userId,
      accountId,
      request,
    );
  }

  /**
   * PATCH /api/master-data/payees/:payeeId/bank-accounts/:id/set-default
   * デフォルト口座設定
   *
   * 権限: procure.payee.update
   */
  @Patch(':id/set-default')
  async setDefaultAccount(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('payeeId') _payeeId: string,
    @Param('id') accountId: string,
    @Body() request: SetDefaultPayeeBankAccountApiRequest,
  ): Promise<SetDefaultPayeeBankAccountApiResponse> {
    return this.payeeBankAccountService.setDefaultAccount(
      tenantId,
      userId,
      accountId,
      request,
    );
  }
}
