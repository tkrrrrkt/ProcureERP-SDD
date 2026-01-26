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
import { BankBffService } from '../service/bank.service';
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
  SortOrder,
} from '@procure/contracts/bff/bank-master';

/**
 * Bank BFF Controller
 *
 * UI からの API エンドポイント
 * - tenant_id / user_id を認証情報（Clerk）から解決
 * - Global prefix: /api/bff が main.ts で設定済み
 */
@Controller('master-data/bank-master')
export class BankBffController {
  constructor(private readonly bankService: BankBffService) {}

  /**
   * GET /api/bff/master-data/bank-master
   * 銀行一覧取得
   */
  @Get()
  async listBanks(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('sortBy') sortBy?: BankSortBy,
    @Query('sortOrder') sortOrder?: SortOrder,
    @Query('keyword') keyword?: string,
    @Query('isActive') isActive?: string,
  ): Promise<ListBanksResponse> {
    this.validateAuth(tenantId, userId);

    const request: ListBanksRequest = {
      page: page ? parseInt(page, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
      sortBy,
      sortOrder,
      keyword,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
    };

    return this.bankService.listBanks(tenantId, userId, request);
  }

  /**
   * GET /api/bff/master-data/bank-master/:id
   * 銀行詳細取得
   */
  @Get(':id')
  async getBank(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') bankId: string,
  ): Promise<GetBankResponse> {
    this.validateAuth(tenantId, userId);

    return this.bankService.getBank(tenantId, userId, bankId);
  }

  /**
   * POST /api/bff/master-data/bank-master
   * 銀行新規登録
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createBank(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Body() request: CreateBankRequest,
  ): Promise<CreateBankResponse> {
    this.validateAuth(tenantId, userId);

    return this.bankService.createBank(tenantId, userId, request);
  }

  /**
   * PUT /api/bff/master-data/bank-master/:id
   * 銀行更新
   */
  @Put(':id')
  async updateBank(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') bankId: string,
    @Body() request: UpdateBankRequest,
  ): Promise<UpdateBankResponse> {
    this.validateAuth(tenantId, userId);

    return this.bankService.updateBank(tenantId, userId, bankId, request);
  }

  /**
   * PATCH /api/bff/master-data/bank-master/:id/deactivate
   * 銀行無効化
   */
  @Patch(':id/deactivate')
  async deactivateBank(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') bankId: string,
    @Body() request: DeactivateBankRequest,
  ): Promise<DeactivateBankResponse> {
    this.validateAuth(tenantId, userId);

    return this.bankService.deactivateBank(tenantId, userId, bankId, request);
  }

  /**
   * PATCH /api/bff/master-data/bank-master/:id/activate
   * 銀行再有効化
   */
  @Patch(':id/activate')
  async activateBank(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') bankId: string,
    @Body() request: ActivateBankRequest,
  ): Promise<ActivateBankResponse> {
    this.validateAuth(tenantId, userId);

    return this.bankService.activateBank(tenantId, userId, bankId, request);
  }

  /**
   * 認証情報バリデーション
   * tenant_id / user_id が存在しない場合は 401 Unauthorized
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
