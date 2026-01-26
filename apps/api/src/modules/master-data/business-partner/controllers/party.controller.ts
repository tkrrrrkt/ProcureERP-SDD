/**
 * Party Controller
 *
 * Domain API エンドポイント
 * - GET  /api/domain/master-data/business-partner/parties
 * - GET  /api/domain/master-data/business-partner/parties/:id
 * - POST /api/domain/master-data/business-partner/parties
 * - PUT  /api/domain/master-data/business-partner/parties/:id
 */

import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  Headers,
} from '@nestjs/common';
import { PartyService } from '../services/party.service';
import {
  ListPartiesApiRequest,
  ListPartiesApiResponse,
  GetPartyApiResponse,
  CreatePartyApiRequest,
  CreatePartyApiResponse,
  UpdatePartyApiRequest,
  UpdatePartyApiResponse,
  PartySortBy,
  SortOrder,
} from '@procure/contracts/api/business-partner';

// TODO: JWT/Session認証からtenant_id/user_idを取得する
// MVP-1ではHeaderから取得（開発用）
const DEFAULT_TENANT_ID = 'default-tenant';
const DEFAULT_USER_ID = 'default-user';

@Controller('api/domain/master-data/business-partner/parties')
export class PartyController {
  constructor(private readonly partyService: PartyService) {}

  /**
   * 取引先一覧取得
   */
  @Get()
  async listParties(
    @Query('offset') offset?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: PartySortBy,
    @Query('sortOrder') sortOrder?: SortOrder,
    @Query('keyword') keyword?: string,
    @Query('isSupplier') isSupplier?: string,
    @Query('isCustomer') isCustomer?: string,
    @Headers('x-tenant-id') tenantId?: string,
  ): Promise<ListPartiesApiResponse> {
    const request: ListPartiesApiRequest = {
      offset: offset ? parseInt(offset, 10) : 0,
      limit: limit ? parseInt(limit, 10) : 50,
      sortBy,
      sortOrder,
      keyword,
      isSupplier: isSupplier ? isSupplier === 'true' : undefined,
      isCustomer: isCustomer ? isCustomer === 'true' : undefined,
    };

    return this.partyService.listParties(
      tenantId || DEFAULT_TENANT_ID,
      request,
    );
  }

  /**
   * 取引先詳細取得
   */
  @Get(':id')
  async getParty(
    @Param('id') partyId: string,
    @Headers('x-tenant-id') tenantId?: string,
  ): Promise<GetPartyApiResponse> {
    return this.partyService.getParty(
      tenantId || DEFAULT_TENANT_ID,
      partyId,
    );
  }

  /**
   * 取引先新規登録
   */
  @Post()
  async createParty(
    @Body() request: CreatePartyApiRequest,
    @Headers('x-tenant-id') tenantId?: string,
    @Headers('x-user-id') userId?: string,
  ): Promise<CreatePartyApiResponse> {
    return this.partyService.createParty(
      tenantId || DEFAULT_TENANT_ID,
      userId || DEFAULT_USER_ID,
      request,
    );
  }

  /**
   * 取引先更新
   */
  @Put(':id')
  async updateParty(
    @Param('id') partyId: string,
    @Body() request: UpdatePartyApiRequest,
    @Headers('x-tenant-id') tenantId?: string,
    @Headers('x-user-id') userId?: string,
  ): Promise<UpdatePartyApiResponse> {
    return this.partyService.updateParty(
      tenantId || DEFAULT_TENANT_ID,
      userId || DEFAULT_USER_ID,
      partyId,
      request,
    );
  }
}
