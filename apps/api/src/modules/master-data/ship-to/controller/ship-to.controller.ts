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
import { ShipToService } from '../service/ship-to.service';
import {
  ListShipTosApiRequest,
  ListShipTosApiResponse,
  GetShipToApiResponse,
  CreateShipToApiRequest,
  CreateShipToApiResponse,
  UpdateShipToApiRequest,
  UpdateShipToApiResponse,
  DeactivateShipToApiRequest,
  DeactivateShipToApiResponse,
  ActivateShipToApiRequest,
  ActivateShipToApiResponse,
  ShipToSortBy,
  SortOrder,
} from '@procure/contracts/api/ship-to';

/**
 * ShipTo Controller
 *
 * Domain API エンドポイント
 * - BFF から呼び出される
 * - tenant_id / user_id はヘッダーから取得
 * - 権限チェックは Guard で実施（TODO: 実装）
 */
@Controller('master-data/ship-to')
export class ShipToController {
  constructor(private readonly shipToService: ShipToService) {}

  /**
   * GET /api/master-data/ship-to
   * 納入先一覧取得
   *
   * 権限: procure.ship-to.read
   */
  @Get()
  async listShipTos(
    @Headers('x-tenant-id') tenantId: string,
    @Query('offset') offset?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: ShipToSortBy,
    @Query('sortOrder') sortOrder?: SortOrder,
    @Query('keyword') keyword?: string,
    @Query('isActive') isActive?: string,
  ): Promise<ListShipTosApiResponse> {
    const request: ListShipTosApiRequest = {
      offset: offset ? parseInt(offset, 10) : 0,
      limit: limit ? parseInt(limit, 10) : 20,
      sortBy,
      sortOrder,
      keyword: keyword?.trim() || undefined,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
    };

    return this.shipToService.listShipTos(tenantId, request);
  }

  /**
   * GET /api/master-data/ship-to/:id
   * 納入先詳細取得
   *
   * 権限: procure.ship-to.read
   */
  @Get(':id')
  async getShipTo(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') shipToId: string,
  ): Promise<GetShipToApiResponse> {
    return this.shipToService.getShipTo(tenantId, shipToId);
  }

  /**
   * POST /api/master-data/ship-to
   * 納入先新規登録
   *
   * 権限: procure.ship-to.create
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createShipTo(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Body() request: CreateShipToApiRequest,
  ): Promise<CreateShipToApiResponse> {
    return this.shipToService.createShipTo(tenantId, userId, request);
  }

  /**
   * PUT /api/master-data/ship-to/:id
   * 納入先更新
   *
   * 権限: procure.ship-to.update
   */
  @Put(':id')
  async updateShipTo(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') shipToId: string,
    @Body() request: UpdateShipToApiRequest,
  ): Promise<UpdateShipToApiResponse> {
    return this.shipToService.updateShipTo(tenantId, userId, shipToId, request);
  }

  /**
   * PATCH /api/master-data/ship-to/:id/deactivate
   * 納入先無効化
   *
   * 権限: procure.ship-to.update
   */
  @Patch(':id/deactivate')
  async deactivateShipTo(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') shipToId: string,
    @Body() request: DeactivateShipToApiRequest,
  ): Promise<DeactivateShipToApiResponse> {
    return this.shipToService.deactivateShipTo(
      tenantId,
      userId,
      shipToId,
      request,
    );
  }

  /**
   * PATCH /api/master-data/ship-to/:id/activate
   * 納入先再有効化
   *
   * 権限: procure.ship-to.update
   */
  @Patch(':id/activate')
  async activateShipTo(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') shipToId: string,
    @Body() request: ActivateShipToApiRequest,
  ): Promise<ActivateShipToApiResponse> {
    return this.shipToService.activateShipTo(
      tenantId,
      userId,
      shipToId,
      request,
    );
  }
}
