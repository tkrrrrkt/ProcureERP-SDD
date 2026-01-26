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
import { UomService } from '../service/uom.service';
import {
  ListUomsApiRequest,
  ListUomsApiResponse,
  GetUomApiResponse,
  CreateUomApiRequest,
  CreateUomApiResponse,
  UpdateUomApiRequest,
  UpdateUomApiResponse,
  ActivateUomApiRequest,
  ActivateUomApiResponse,
  DeactivateUomApiRequest,
  DeactivateUomApiResponse,
  SuggestUomsApiRequest,
  SuggestUomsApiResponse,
  UomSortBy,
  SortOrder,
} from '@procure/contracts/api/unit-master';

/**
 * Uom Controller
 *
 * Domain API エンドポイント（単位）
 * - BFF から呼び出される
 * - tenant_id / user_id はヘッダーから取得
 */
@Controller('master-data/unit-master/uoms')
export class UomController {
  constructor(private readonly uomService: UomService) {}

  /**
   * GET /api/master-data/unit-master/uoms
   * 単位一覧取得
   */
  @Get()
  async listUoms(
    @Headers('x-tenant-id') tenantId: string,
    @Query('offset') offset?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: UomSortBy,
    @Query('sortOrder') sortOrder?: SortOrder,
    @Query('keyword') keyword?: string,
    @Query('groupId') groupId?: string,
    @Query('isActive') isActive?: string,
  ): Promise<ListUomsApiResponse> {
    const request: ListUomsApiRequest = {
      offset: offset ? parseInt(offset, 10) : 0,
      limit: limit ? parseInt(limit, 10) : 50,
      sortBy,
      sortOrder,
      keyword: keyword?.trim() || undefined,
      groupId: groupId || undefined,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
    };

    return this.uomService.listUoms(tenantId, request);
  }

  /**
   * GET /api/master-data/unit-master/uoms/suggest
   * 単位サジェスト（一覧取得より先にマッチさせる）
   */
  @Get('suggest')
  async suggestUoms(
    @Headers('x-tenant-id') tenantId: string,
    @Query('keyword') keyword: string,
    @Query('groupId') groupId?: string,
    @Query('limit') limit?: string,
  ): Promise<SuggestUomsApiResponse> {
    const request: SuggestUomsApiRequest = {
      keyword: keyword?.trim() || '',
      groupId: groupId || undefined,
      limit: limit ? parseInt(limit, 10) : 20,
    };

    return this.uomService.suggestUoms(tenantId, request);
  }

  /**
   * GET /api/master-data/unit-master/uoms/:id
   * 単位詳細取得
   */
  @Get(':id')
  async getUom(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') uomId: string,
  ): Promise<GetUomApiResponse> {
    return this.uomService.getUom(tenantId, uomId);
  }

  /**
   * POST /api/master-data/unit-master/uoms
   * 単位新規登録
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUom(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Body() request: CreateUomApiRequest,
  ): Promise<CreateUomApiResponse> {
    return this.uomService.createUom(tenantId, userId, request);
  }

  /**
   * PUT /api/master-data/unit-master/uoms/:id
   * 単位更新
   */
  @Put(':id')
  async updateUom(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') uomId: string,
    @Body() request: UpdateUomApiRequest,
  ): Promise<UpdateUomApiResponse> {
    return this.uomService.updateUom(tenantId, userId, uomId, request);
  }

  /**
   * PATCH /api/master-data/unit-master/uoms/:id/activate
   * 単位有効化
   */
  @Patch(':id/activate')
  async activateUom(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') uomId: string,
    @Body() request: ActivateUomApiRequest,
  ): Promise<ActivateUomApiResponse> {
    return this.uomService.activateUom(tenantId, userId, uomId, request);
  }

  /**
   * PATCH /api/master-data/unit-master/uoms/:id/deactivate
   * 単位無効化
   */
  @Patch(':id/deactivate')
  async deactivateUom(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') uomId: string,
    @Body() request: DeactivateUomApiRequest,
  ): Promise<DeactivateUomApiResponse> {
    return this.uomService.deactivateUom(tenantId, userId, uomId, request);
  }
}
