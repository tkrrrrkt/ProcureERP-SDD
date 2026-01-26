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
import { WarehouseBffService } from '../service/warehouse.service';
import {
  ListWarehousesRequest,
  ListWarehousesResponse,
  GetWarehouseResponse,
  CreateWarehouseRequest,
  CreateWarehouseResponse,
  UpdateWarehouseRequest,
  UpdateWarehouseResponse,
  DeactivateWarehouseRequest,
  DeactivateWarehouseResponse,
  ActivateWarehouseRequest,
  ActivateWarehouseResponse,
  SetDefaultReceivingWarehouseRequest,
  SetDefaultReceivingWarehouseResponse,
  WarehouseSortBy,
  SortOrder,
} from '@procure/contracts/bff/warehouse';

/**
 * Warehouse BFF Controller
 *
 * UI からの API エンドポイント
 * - tenant_id / user_id を認証情報（Clerk）から解決
 * - Global prefix: /api/bff が main.ts で設定済み
 */
@Controller('master-data/warehouses')
export class WarehouseBffController {
  constructor(private readonly warehouseService: WarehouseBffService) {}

  /**
   * GET /api/bff/master-data/warehouses
   * 倉庫一覧取得
   */
  @Get()
  async listWarehouses(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('sortBy') sortBy?: WarehouseSortBy,
    @Query('sortOrder') sortOrder?: SortOrder,
    @Query('keyword') keyword?: string,
    @Query('isActive') isActive?: string,
  ): Promise<ListWarehousesResponse> {
    this.validateAuth(tenantId, userId);

    const request: ListWarehousesRequest = {
      page: page ? parseInt(page, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
      sortBy,
      sortOrder,
      keyword,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
    };

    return this.warehouseService.listWarehouses(tenantId, userId, request);
  }

  /**
   * GET /api/bff/master-data/warehouses/:id
   * 倉庫詳細取得
   */
  @Get(':id')
  async getWarehouse(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') warehouseId: string,
  ): Promise<GetWarehouseResponse> {
    this.validateAuth(tenantId, userId);

    return this.warehouseService.getWarehouse(tenantId, userId, warehouseId);
  }

  /**
   * POST /api/bff/master-data/warehouses
   * 倉庫新規登録
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createWarehouse(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Body() request: CreateWarehouseRequest,
  ): Promise<CreateWarehouseResponse> {
    this.validateAuth(tenantId, userId);

    return this.warehouseService.createWarehouse(tenantId, userId, request);
  }

  /**
   * PUT /api/bff/master-data/warehouses/:id
   * 倉庫更新
   */
  @Put(':id')
  async updateWarehouse(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') warehouseId: string,
    @Body() request: UpdateWarehouseRequest,
  ): Promise<UpdateWarehouseResponse> {
    this.validateAuth(tenantId, userId);

    return this.warehouseService.updateWarehouse(
      tenantId,
      userId,
      warehouseId,
      request,
    );
  }

  /**
   * POST /api/bff/master-data/warehouses/:id/deactivate
   * 倉庫無効化
   */
  @Post(':id/deactivate')
  async deactivateWarehouse(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') warehouseId: string,
    @Body() request: DeactivateWarehouseRequest,
  ): Promise<DeactivateWarehouseResponse> {
    this.validateAuth(tenantId, userId);

    return this.warehouseService.deactivateWarehouse(
      tenantId,
      userId,
      warehouseId,
      request,
    );
  }

  /**
   * POST /api/bff/master-data/warehouses/:id/activate
   * 倉庫再有効化
   */
  @Post(':id/activate')
  async activateWarehouse(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') warehouseId: string,
    @Body() request: ActivateWarehouseRequest,
  ): Promise<ActivateWarehouseResponse> {
    this.validateAuth(tenantId, userId);

    return this.warehouseService.activateWarehouse(
      tenantId,
      userId,
      warehouseId,
      request,
    );
  }

  /**
   * POST /api/bff/master-data/warehouses/:id/set-default-receiving
   * 既定受入倉庫設定
   */
  @Post(':id/set-default-receiving')
  async setDefaultReceivingWarehouse(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') warehouseId: string,
    @Body() request: SetDefaultReceivingWarehouseRequest,
  ): Promise<SetDefaultReceivingWarehouseResponse> {
    this.validateAuth(tenantId, userId);

    return this.warehouseService.setDefaultReceivingWarehouse(
      tenantId,
      userId,
      warehouseId,
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
