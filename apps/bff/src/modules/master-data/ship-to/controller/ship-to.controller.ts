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
import { ShipToBffService } from '../service/ship-to.service';
import {
  ListShipTosRequest,
  ListShipTosResponse,
  GetShipToResponse,
  CreateShipToRequest,
  CreateShipToResponse,
  UpdateShipToRequest,
  UpdateShipToResponse,
  DeactivateShipToRequest,
  DeactivateShipToResponse,
  ActivateShipToRequest,
  ActivateShipToResponse,
  ShipToSortBy,
  SortOrder,
} from '@procure/contracts/bff/ship-to';

/**
 * ShipTo BFF Controller
 *
 * UI からの API エンドポイント
 * - tenant_id / user_id を認証情報（Clerk）から解決
 * - Global prefix: /api/bff が main.ts で設定済み
 */
@Controller('master-data/ship-to')
export class ShipToBffController {
  constructor(private readonly shipToService: ShipToBffService) {}

  /**
   * GET /api/bff/master-data/ship-to
   * 納入先一覧取得
   */
  @Get()
  async listShipTos(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('sortBy') sortBy?: ShipToSortBy,
    @Query('sortOrder') sortOrder?: SortOrder,
    @Query('keyword') keyword?: string,
    @Query('isActive') isActive?: string,
  ): Promise<ListShipTosResponse> {
    this.validateAuth(tenantId, userId);

    const request: ListShipTosRequest = {
      page: page ? parseInt(page, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
      sortBy,
      sortOrder,
      keyword,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
    };

    return this.shipToService.listShipTos(tenantId, userId, request);
  }

  /**
   * GET /api/bff/master-data/ship-to/:id
   * 納入先詳細取得
   */
  @Get(':id')
  async getShipTo(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') shipToId: string,
  ): Promise<GetShipToResponse> {
    this.validateAuth(tenantId, userId);

    return this.shipToService.getShipTo(tenantId, userId, shipToId);
  }

  /**
   * POST /api/bff/master-data/ship-to
   * 納入先新規登録
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createShipTo(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Body() request: CreateShipToRequest,
  ): Promise<CreateShipToResponse> {
    this.validateAuth(tenantId, userId);

    return this.shipToService.createShipTo(tenantId, userId, request);
  }

  /**
   * PUT /api/bff/master-data/ship-to/:id
   * 納入先更新
   */
  @Put(':id')
  async updateShipTo(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') shipToId: string,
    @Body() request: UpdateShipToRequest,
  ): Promise<UpdateShipToResponse> {
    this.validateAuth(tenantId, userId);

    return this.shipToService.updateShipTo(tenantId, userId, shipToId, request);
  }

  /**
   * PATCH /api/bff/master-data/ship-to/:id/deactivate
   * 納入先無効化
   */
  @Patch(':id/deactivate')
  async deactivateShipTo(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') shipToId: string,
    @Body() request: DeactivateShipToRequest,
  ): Promise<DeactivateShipToResponse> {
    this.validateAuth(tenantId, userId);

    return this.shipToService.deactivateShipTo(
      tenantId,
      userId,
      shipToId,
      request,
    );
  }

  /**
   * PATCH /api/bff/master-data/ship-to/:id/activate
   * 納入先再有効化
   */
  @Patch(':id/activate')
  async activateShipTo(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') shipToId: string,
    @Body() request: ActivateShipToRequest,
  ): Promise<ActivateShipToResponse> {
    this.validateAuth(tenantId, userId);

    return this.shipToService.activateShipTo(
      tenantId,
      userId,
      shipToId,
      request,
    );
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
