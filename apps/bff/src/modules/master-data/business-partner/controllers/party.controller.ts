/**
 * Party BFF Controller
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
import { PartyBffService } from '../services/party.service';
import {
  ListPartiesRequest,
  ListPartiesResponse,
  GetPartyResponse,
  CreatePartyRequest,
  CreatePartyResponse,
  UpdatePartyRequest,
  UpdatePartyResponse,
  PartySortBy,
  SortOrder,
} from '@procure/contracts/bff/business-partner';

@Controller('master-data/business-partner/parties')
export class PartyBffController {
  constructor(private readonly partyService: PartyBffService) {}

  /**
   * GET /api/bff/master-data/business-partner/parties
   * 取引先一覧取得
   */
  @Get()
  async listParties(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('sortBy') sortBy?: PartySortBy,
    @Query('sortOrder') sortOrder?: SortOrder,
    @Query('keyword') keyword?: string,
    @Query('isSupplier') isSupplier?: string,
    @Query('isCustomer') isCustomer?: string,
  ): Promise<ListPartiesResponse> {
    this.validateAuth(tenantId, userId);

    const request: ListPartiesRequest = {
      page: page ? parseInt(page, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
      sortBy,
      sortOrder,
      keyword,
      isSupplier: isSupplier === 'true' ? true : isSupplier === 'false' ? false : undefined,
      isCustomer: isCustomer === 'true' ? true : isCustomer === 'false' ? false : undefined,
    };

    return this.partyService.listParties(tenantId, userId, request);
  }

  /**
   * GET /api/bff/master-data/business-partner/parties/:id
   * 取引先詳細取得
   */
  @Get(':id')
  async getParty(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') partyId: string,
  ): Promise<GetPartyResponse> {
    this.validateAuth(tenantId, userId);

    return this.partyService.getParty(tenantId, userId, partyId);
  }

  /**
   * POST /api/bff/master-data/business-partner/parties
   * 取引先新規登録
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createParty(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Body() request: CreatePartyRequest,
  ): Promise<CreatePartyResponse> {
    this.validateAuth(tenantId, userId);

    return this.partyService.createParty(tenantId, userId, request);
  }

  /**
   * PUT /api/bff/master-data/business-partner/parties/:id
   * 取引先更新
   */
  @Put(':id')
  async updateParty(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') partyId: string,
    @Body() request: UpdatePartyRequest,
  ): Promise<UpdatePartyResponse> {
    this.validateAuth(tenantId, userId);

    return this.partyService.updateParty(tenantId, userId, partyId, request);
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
