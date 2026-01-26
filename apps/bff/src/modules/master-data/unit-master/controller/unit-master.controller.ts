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
import { UnitMasterBffService } from '../service/unit-master.service';
import {
  ListUomGroupsRequest,
  ListUomGroupsResponse,
  GetUomGroupResponse,
  CreateUomGroupRequest,
  CreateUomGroupResponse,
  UpdateUomGroupRequest,
  UpdateUomGroupResponse,
  ActivateUomGroupRequest,
  ActivateUomGroupResponse,
  DeactivateUomGroupRequest,
  DeactivateUomGroupResponse,
  ListUomsRequest,
  ListUomsResponse,
  GetUomResponse,
  CreateUomRequest,
  CreateUomResponse,
  UpdateUomRequest,
  UpdateUomResponse,
  ActivateUomRequest,
  ActivateUomResponse,
  DeactivateUomRequest,
  DeactivateUomResponse,
  SuggestUomsRequest,
  SuggestUomsResponse,
  UomGroupSortBy,
  UomSortBy,
  SortOrder,
} from '@procure/contracts/bff/unit-master';

/**
 * Unit Master BFF Controller
 *
 * UI からの API エンドポイント（13エンドポイント）
 * - tenant_id / user_id を認証情報（Clerk）から解決
 * - Global prefix: /api/bff が main.ts で設定済み
 */
@Controller('master-data/unit-master')
export class UnitMasterBffController {
  constructor(private readonly unitMasterService: UnitMasterBffService) {}

  // ==========================================================================
  // UomGroup Endpoints
  // ==========================================================================

  /**
   * GET /api/bff/master-data/unit-master/groups
   * 単位グループ一覧取得
   */
  @Get('groups')
  async listUomGroups(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('sortBy') sortBy?: UomGroupSortBy,
    @Query('sortOrder') sortOrder?: SortOrder,
    @Query('keyword') keyword?: string,
    @Query('isActive') isActive?: string,
  ): Promise<ListUomGroupsResponse> {
    this.validateAuth(tenantId, userId);

    const request: ListUomGroupsRequest = {
      page: page ? parseInt(page, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
      sortBy,
      sortOrder,
      keyword,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
    };

    return this.unitMasterService.listUomGroups(tenantId, userId, request);
  }

  /**
   * GET /api/bff/master-data/unit-master/groups/:id
   * 単位グループ詳細取得
   */
  @Get('groups/:id')
  async getUomGroup(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') groupId: string,
  ): Promise<GetUomGroupResponse> {
    this.validateAuth(tenantId, userId);

    return this.unitMasterService.getUomGroup(tenantId, userId, groupId);
  }

  /**
   * POST /api/bff/master-data/unit-master/groups
   * 単位グループ新規登録（基準単位も同時作成）
   */
  @Post('groups')
  @HttpCode(HttpStatus.CREATED)
  async createUomGroup(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Body() request: CreateUomGroupRequest,
  ): Promise<CreateUomGroupResponse> {
    this.validateAuth(tenantId, userId);

    return this.unitMasterService.createUomGroup(tenantId, userId, request);
  }

  /**
   * PUT /api/bff/master-data/unit-master/groups/:id
   * 単位グループ更新
   */
  @Put('groups/:id')
  async updateUomGroup(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') groupId: string,
    @Body() request: UpdateUomGroupRequest,
  ): Promise<UpdateUomGroupResponse> {
    this.validateAuth(tenantId, userId);

    return this.unitMasterService.updateUomGroup(tenantId, userId, groupId, request);
  }

  /**
   * PATCH /api/bff/master-data/unit-master/groups/:id/activate
   * 単位グループ有効化
   */
  @Patch('groups/:id/activate')
  async activateUomGroup(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') groupId: string,
    @Body() request: ActivateUomGroupRequest,
  ): Promise<ActivateUomGroupResponse> {
    this.validateAuth(tenantId, userId);

    return this.unitMasterService.activateUomGroup(tenantId, userId, groupId, request);
  }

  /**
   * PATCH /api/bff/master-data/unit-master/groups/:id/deactivate
   * 単位グループ無効化
   */
  @Patch('groups/:id/deactivate')
  async deactivateUomGroup(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') groupId: string,
    @Body() request: DeactivateUomGroupRequest,
  ): Promise<DeactivateUomGroupResponse> {
    this.validateAuth(tenantId, userId);

    return this.unitMasterService.deactivateUomGroup(tenantId, userId, groupId, request);
  }

  // ==========================================================================
  // Uom Endpoints
  // ==========================================================================

  /**
   * GET /api/bff/master-data/unit-master/uoms
   * 単位一覧取得
   */
  @Get('uoms')
  async listUoms(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('sortBy') sortBy?: UomSortBy,
    @Query('sortOrder') sortOrder?: SortOrder,
    @Query('keyword') keyword?: string,
    @Query('groupId') groupId?: string,
    @Query('isActive') isActive?: string,
  ): Promise<ListUomsResponse> {
    this.validateAuth(tenantId, userId);

    const request: ListUomsRequest = {
      page: page ? parseInt(page, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
      sortBy,
      sortOrder,
      keyword,
      groupId,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
    };

    return this.unitMasterService.listUoms(tenantId, userId, request);
  }

  /**
   * GET /api/bff/master-data/unit-master/uoms/suggest
   * 単位サジェスト（一覧取得より先にマッチさせる）
   */
  @Get('uoms/suggest')
  async suggestUoms(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Query('keyword') keyword: string,
    @Query('groupId') groupId?: string,
    @Query('limit') limit?: string,
  ): Promise<SuggestUomsResponse> {
    this.validateAuth(tenantId, userId);

    const request: SuggestUomsRequest = {
      keyword: keyword || '',
      groupId,
      limit: limit ? parseInt(limit, 10) : undefined,
    };

    return this.unitMasterService.suggestUoms(tenantId, userId, request);
  }

  /**
   * GET /api/bff/master-data/unit-master/uoms/:id
   * 単位詳細取得
   */
  @Get('uoms/:id')
  async getUom(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') uomId: string,
  ): Promise<GetUomResponse> {
    this.validateAuth(tenantId, userId);

    return this.unitMasterService.getUom(tenantId, userId, uomId);
  }

  /**
   * POST /api/bff/master-data/unit-master/uoms
   * 単位新規登録
   */
  @Post('uoms')
  @HttpCode(HttpStatus.CREATED)
  async createUom(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Body() request: CreateUomRequest,
  ): Promise<CreateUomResponse> {
    this.validateAuth(tenantId, userId);

    return this.unitMasterService.createUom(tenantId, userId, request);
  }

  /**
   * PUT /api/bff/master-data/unit-master/uoms/:id
   * 単位更新
   */
  @Put('uoms/:id')
  async updateUom(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') uomId: string,
    @Body() request: UpdateUomRequest,
  ): Promise<UpdateUomResponse> {
    this.validateAuth(tenantId, userId);

    return this.unitMasterService.updateUom(tenantId, userId, uomId, request);
  }

  /**
   * PATCH /api/bff/master-data/unit-master/uoms/:id/activate
   * 単位有効化
   */
  @Patch('uoms/:id/activate')
  async activateUom(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') uomId: string,
    @Body() request: ActivateUomRequest,
  ): Promise<ActivateUomResponse> {
    this.validateAuth(tenantId, userId);

    return this.unitMasterService.activateUom(tenantId, userId, uomId, request);
  }

  /**
   * PATCH /api/bff/master-data/unit-master/uoms/:id/deactivate
   * 単位無効化
   */
  @Patch('uoms/:id/deactivate')
  async deactivateUom(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') uomId: string,
    @Body() request: DeactivateUomRequest,
  ): Promise<DeactivateUomResponse> {
    this.validateAuth(tenantId, userId);

    return this.unitMasterService.deactivateUom(tenantId, userId, uomId, request);
  }

  // ==========================================================================
  // Helper Methods
  // ==========================================================================

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
