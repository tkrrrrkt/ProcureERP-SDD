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
import { BankService } from '../service/bank.service';
import {
  ListBanksApiRequest,
  ListBanksApiResponse,
  GetBankApiResponse,
  CreateBankApiRequest,
  CreateBankApiResponse,
  UpdateBankApiRequest,
  UpdateBankApiResponse,
  DeactivateBankApiRequest,
  DeactivateBankApiResponse,
  ActivateBankApiRequest,
  ActivateBankApiResponse,
  BankSortBy,
  SortOrder,
} from '@procure/contracts/api/bank-master';

/**
 * Bank Controller
 *
 * Domain API エンドポイント
 * - BFF から呼び出される
 * - tenant_id / user_id はヘッダーから取得
 * - 権限チェックは Guard で実施（TODO: 実装）
 */
@Controller('master-data/bank-master')
export class BankController {
  constructor(private readonly bankService: BankService) {}

  /**
   * GET /api/master-data/bank-master
   * 銀行一覧取得
   *
   * 権限: procure.bank.read
   */
  @Get()
  async listBanks(
    @Headers('x-tenant-id') tenantId: string,
    @Query('offset') offset?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: BankSortBy,
    @Query('sortOrder') sortOrder?: SortOrder,
    @Query('keyword') keyword?: string,
    @Query('isActive') isActive?: string,
  ): Promise<ListBanksApiResponse> {
    const request: ListBanksApiRequest = {
      offset: offset ? parseInt(offset, 10) : 0,
      limit: limit ? parseInt(limit, 10) : 50,
      sortBy,
      sortOrder,
      keyword: keyword?.trim() || undefined,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
    };

    return this.bankService.listBanks(tenantId, request);
  }

  /**
   * GET /api/master-data/bank-master/:id
   * 銀行詳細取得
   *
   * 権限: procure.bank.read
   */
  @Get(':id')
  async getBank(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') bankId: string,
  ): Promise<GetBankApiResponse> {
    return this.bankService.getBank(tenantId, bankId);
  }

  /**
   * POST /api/master-data/bank-master
   * 銀行新規登録
   *
   * 権限: procure.bank.create
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createBank(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Body() request: CreateBankApiRequest,
  ): Promise<CreateBankApiResponse> {
    return this.bankService.createBank(tenantId, userId, request);
  }

  /**
   * PUT /api/master-data/bank-master/:id
   * 銀行更新
   *
   * 権限: procure.bank.update
   */
  @Put(':id')
  async updateBank(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') bankId: string,
    @Body() request: UpdateBankApiRequest,
  ): Promise<UpdateBankApiResponse> {
    return this.bankService.updateBank(tenantId, userId, bankId, request);
  }

  /**
   * PATCH /api/master-data/bank-master/:id/deactivate
   * 銀行無効化
   *
   * 権限: procure.bank.update
   */
  @Patch(':id/deactivate')
  async deactivateBank(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') bankId: string,
    @Body() request: DeactivateBankApiRequest,
  ): Promise<DeactivateBankApiResponse> {
    return this.bankService.deactivateBank(tenantId, userId, bankId, request);
  }

  /**
   * PATCH /api/master-data/bank-master/:id/activate
   * 銀行再有効化
   *
   * 権限: procure.bank.update
   */
  @Patch(':id/activate')
  async activateBank(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') bankId: string,
    @Body() request: ActivateBankApiRequest,
  ): Promise<ActivateBankApiResponse> {
    return this.bankService.activateBank(tenantId, userId, bankId, request);
  }
}
