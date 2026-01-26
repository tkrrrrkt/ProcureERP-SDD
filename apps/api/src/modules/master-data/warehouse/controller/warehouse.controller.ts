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
import { WarehouseService } from '../service/warehouse.service';
import {
  ListWarehousesApiRequest,
  ListWarehousesApiResponse,
  GetWarehouseApiResponse,
  CreateWarehouseApiRequest,
  CreateWarehouseApiResponse,
  UpdateWarehouseApiRequest,
  UpdateWarehouseApiResponse,
  DeactivateWarehouseApiRequest,
  DeactivateWarehouseApiResponse,
  ActivateWarehouseApiRequest,
  ActivateWarehouseApiResponse,
  SetDefaultReceivingWarehouseApiRequest,
  SetDefaultReceivingWarehouseApiResponse,
  WarehouseSortBy,
  SortOrder,
} from '@procure/contracts/api/warehouse';

/**
 * Warehouse Controller
 *
 * Domain API エンドポイント
 * - BFF から呼び出される
 * - tenant_id / user_id はヘッダーから取得
 * - 権限チェックは Guard で実施（TODO: 実装）
 */
@Controller('master-data/warehouse')
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  /**
   * GET /api/master-data/warehouse
   * 倉庫一覧取得
   *
   * 権限: procure.warehouse.read
   */
  @Get()
  async listWarehouses(
    @Headers('x-tenant-id') tenantId: string,
    @Query('offset') offset?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: WarehouseSortBy,
    @Query('sortOrder') sortOrder?: SortOrder,
    @Query('keyword') keyword?: string,
    @Query('isActive') isActive?: string,
  ): Promise<ListWarehousesApiResponse> {
    const request: ListWarehousesApiRequest = {
      offset: offset ? parseInt(offset, 10) : 0,
      limit: limit ? parseInt(limit, 10) : 50,
      sortBy,
      sortOrder,
      keyword: keyword?.trim() || undefined,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
    };

    return this.warehouseService.listWarehouses(tenantId, request);
  }

  /**
   * GET /api/master-data/warehouse/:id
   * 倉庫詳細取得
   *
   * 権限: procure.warehouse.read
   */
  @Get(':id')
  async getWarehouse(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') warehouseId: string,
  ): Promise<GetWarehouseApiResponse> {
    return this.warehouseService.getWarehouse(tenantId, warehouseId);
  }

  /**
   * POST /api/master-data/warehouse
   * 倉庫新規登録
   *
   * 権限: procure.warehouse.create
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createWarehouse(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Body() request: CreateWarehouseApiRequest,
  ): Promise<CreateWarehouseApiResponse> {
    return this.warehouseService.createWarehouse(tenantId, userId, request);
  }

  /**
   * PUT /api/master-data/warehouse/:id
   * 倉庫更新
   *
   * 権限: procure.warehouse.update
   */
  @Put(':id')
  async updateWarehouse(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') warehouseId: string,
    @Body() request: UpdateWarehouseApiRequest,
  ): Promise<UpdateWarehouseApiResponse> {
    return this.warehouseService.updateWarehouse(
      tenantId,
      userId,
      warehouseId,
      request,
    );
  }

  /**
   * POST /api/master-data/warehouse/:id/deactivate
   * 倉庫無効化
   *
   * 権限: procure.warehouse.update
   */
  @Post(':id/deactivate')
  async deactivateWarehouse(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') warehouseId: string,
    @Body() request: DeactivateWarehouseApiRequest,
  ): Promise<DeactivateWarehouseApiResponse> {
    return this.warehouseService.deactivateWarehouse(
      tenantId,
      userId,
      warehouseId,
      request,
    );
  }

  /**
   * POST /api/master-data/warehouse/:id/activate
   * 倉庫再有効化
   *
   * 権限: procure.warehouse.update
   */
  @Post(':id/activate')
  async activateWarehouse(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') warehouseId: string,
    @Body() request: ActivateWarehouseApiRequest,
  ): Promise<ActivateWarehouseApiResponse> {
    return this.warehouseService.activateWarehouse(
      tenantId,
      userId,
      warehouseId,
      request,
    );
  }

  /**
   * POST /api/master-data/warehouse/:id/set-default-receiving
   * 既定受入倉庫設定
   *
   * 権限: procure.warehouse.update
   */
  @Post(':id/set-default-receiving')
  async setDefaultReceivingWarehouse(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') warehouseId: string,
    @Body() request: SetDefaultReceivingWarehouseApiRequest,
  ): Promise<SetDefaultReceivingWarehouseApiResponse> {
    return this.warehouseService.setDefaultReceivingWarehouse(
      tenantId,
      userId,
      warehouseId,
      request,
    );
  }
}
