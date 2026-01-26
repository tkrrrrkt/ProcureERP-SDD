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
import { UomGroupService } from '../service/uom-group.service';
import {
  ListUomGroupsApiRequest,
  ListUomGroupsApiResponse,
  GetUomGroupApiResponse,
  CreateUomGroupApiRequest,
  CreateUomGroupApiResponse,
  UpdateUomGroupApiRequest,
  UpdateUomGroupApiResponse,
  ActivateUomGroupApiRequest,
  ActivateUomGroupApiResponse,
  DeactivateUomGroupApiRequest,
  DeactivateUomGroupApiResponse,
  UomGroupSortBy,
  SortOrder,
} from '@procure/contracts/api/unit-master';

/**
 * UomGroup Controller
 *
 * Domain API エンドポイント（単位グループ）
 * - BFF から呼び出される
 * - tenant_id / user_id はヘッダーから取得
 */
@Controller('master-data/unit-master/groups')
export class UomGroupController {
  constructor(private readonly uomGroupService: UomGroupService) {}

  /**
   * GET /api/master-data/unit-master/groups
   * 単位グループ一覧取得
   */
  @Get()
  async listUomGroups(
    @Headers('x-tenant-id') tenantId: string,
    @Query('offset') offset?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: UomGroupSortBy,
    @Query('sortOrder') sortOrder?: SortOrder,
    @Query('keyword') keyword?: string,
    @Query('isActive') isActive?: string,
  ): Promise<ListUomGroupsApiResponse> {
    const request: ListUomGroupsApiRequest = {
      offset: offset ? parseInt(offset, 10) : 0,
      limit: limit ? parseInt(limit, 10) : 50,
      sortBy,
      sortOrder,
      keyword: keyword?.trim() || undefined,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
    };

    return this.uomGroupService.listUomGroups(tenantId, request);
  }

  /**
   * GET /api/master-data/unit-master/groups/:id
   * 単位グループ詳細取得
   */
  @Get(':id')
  async getUomGroup(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') groupId: string,
  ): Promise<GetUomGroupApiResponse> {
    return this.uomGroupService.getUomGroup(tenantId, groupId);
  }

  /**
   * POST /api/master-data/unit-master/groups
   * 単位グループ新規登録（基準単位も同時作成）
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUomGroup(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Body() request: CreateUomGroupApiRequest,
  ): Promise<CreateUomGroupApiResponse> {
    return this.uomGroupService.createUomGroup(tenantId, userId, request);
  }

  /**
   * PUT /api/master-data/unit-master/groups/:id
   * 単位グループ更新
   */
  @Put(':id')
  async updateUomGroup(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') groupId: string,
    @Body() request: UpdateUomGroupApiRequest,
  ): Promise<UpdateUomGroupApiResponse> {
    return this.uomGroupService.updateUomGroup(tenantId, userId, groupId, request);
  }

  /**
   * PATCH /api/master-data/unit-master/groups/:id/activate
   * 単位グループ有効化
   */
  @Patch(':id/activate')
  async activateUomGroup(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') groupId: string,
    @Body() request: ActivateUomGroupApiRequest,
  ): Promise<ActivateUomGroupApiResponse> {
    return this.uomGroupService.activateUomGroup(tenantId, userId, groupId, request);
  }

  /**
   * PATCH /api/master-data/unit-master/groups/:id/deactivate
   * 単位グループ無効化
   */
  @Patch(':id/deactivate')
  async deactivateUomGroup(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') groupId: string,
    @Body() request: DeactivateUomGroupApiRequest,
  ): Promise<DeactivateUomGroupApiResponse> {
    return this.uomGroupService.deactivateUomGroup(tenantId, userId, groupId, request);
  }
}
