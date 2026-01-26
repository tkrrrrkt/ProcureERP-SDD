/**
 * Payee BFF Controller
 *
 * UI からの API エンドポイント
 * - tenant_id / user_id を認証情報（Clerk）から解決
 * - Global prefix: /api/bff が main.ts で設定済み
 */

import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Query,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { PayeeBffService } from '../services/payee.service';
import {
  ListPayeesRequest,
  ListPayeesResponse,
  GetPayeeResponse,
  CreatePayeeRequest,
  CreatePayeeResponse,
  UpdatePayeeRequest,
  UpdatePayeeResponse,
  PayeeSortBy,
  SortOrder,
} from '@procure/contracts/bff/business-partner';

@Controller('master-data/business-partner/payees')
export class PayeeBffController {
  constructor(private readonly payeeService: PayeeBffService) {}

  /**
   * GET /api/bff/master-data/business-partner/payees
   * 支払先一覧取得
   */
  @Get()
  async listPayees(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Query('partyId') partyId: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('sortBy') sortBy?: PayeeSortBy,
    @Query('sortOrder') sortOrder?: SortOrder,
    @Query('keyword') keyword?: string,
  ): Promise<ListPayeesResponse> {
    this.validateAuth(tenantId, userId);

    const request: ListPayeesRequest = {
      partyId,
      page: page ? parseInt(page, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
      sortBy,
      sortOrder,
      keyword,
    };

    return this.payeeService.listPayees(tenantId, userId, request);
  }

  /**
   * GET /api/bff/master-data/business-partner/payees/:id
   * 支払先詳細取得
   */
  @Get(':id')
  async getPayee(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') payeeId: string,
  ): Promise<GetPayeeResponse> {
    this.validateAuth(tenantId, userId);

    return this.payeeService.getPayee(tenantId, userId, payeeId);
  }

  /**
   * POST /api/bff/master-data/business-partner/payees
   * 支払先新規登録
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createPayee(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Body() request: CreatePayeeRequest,
  ): Promise<CreatePayeeResponse> {
    this.validateAuth(tenantId, userId);

    return this.payeeService.createPayee(tenantId, userId, request);
  }

  /**
   * PUT /api/bff/master-data/business-partner/payees/:id
   * 支払先更新
   */
  @Put(':id')
  async updatePayee(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') payeeId: string,
    @Body() request: UpdatePayeeRequest,
  ): Promise<UpdatePayeeResponse> {
    this.validateAuth(tenantId, userId);

    return this.payeeService.updatePayee(tenantId, userId, payeeId, request);
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
