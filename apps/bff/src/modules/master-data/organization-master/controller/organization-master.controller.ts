import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Query,
  Body,
  Headers,
} from '@nestjs/common';
import { OrganizationMasterBffService } from '../service/organization-master.service';
import {
  // Version types
  ListVersionsRequest,
  ListVersionsResponse,
  GetVersionResponse,
  CreateVersionRequest,
  CreateVersionResponse,
  CopyVersionRequest,
  CopyVersionResponse,
  UpdateVersionRequest,
  UpdateVersionResponse,
  AsOfSearchRequest,
  AsOfSearchResponse,
  VersionSortBy,
  SortOrder,
  // Department types
  ListDepartmentsTreeRequest,
  ListDepartmentsTreeResponse,
  GetDepartmentResponse,
  CreateDepartmentRequest,
  CreateDepartmentResponse,
  UpdateDepartmentRequest,
  UpdateDepartmentResponse,
  MoveDepartmentRequest,
  MoveDepartmentResponse,
  DeactivateDepartmentResponse,
  ReactivateDepartmentResponse,
} from '@procure/contracts/bff/organization-master';

/**
 * Organization Master BFF Controller
 *
 * UI ↔ BFF のエンドポイント
 * - tenant_id: x-tenant-id ヘッダーから取得
 * - user_id: x-user-id ヘッダーから取得
 */
@Controller('api/organization-master')
export class OrganizationMasterBffController {
  constructor(private readonly service: OrganizationMasterBffService) {}

  // ===========================================================================
  // Version Endpoints
  // ===========================================================================

  /**
   * バージョン一覧取得
   * GET /api/organization-master/versions
   */
  @Get('versions')
  async listVersions(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Query('sortBy') sortBy?: VersionSortBy,
    @Query('sortOrder') sortOrder?: SortOrder,
  ): Promise<ListVersionsResponse> {
    const request: ListVersionsRequest = { sortBy, sortOrder };
    return this.service.listVersions(tenantId, userId, request);
  }

  /**
   * バージョン詳細取得
   * GET /api/organization-master/versions/:versionId
   */
  @Get('versions/:versionId')
  async getVersion(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('versionId') versionId: string,
  ): Promise<GetVersionResponse> {
    return this.service.getVersion(tenantId, userId, versionId);
  }

  /**
   * バージョン新規作成
   * POST /api/organization-master/versions
   */
  @Post('versions')
  async createVersion(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Body() request: CreateVersionRequest,
  ): Promise<CreateVersionResponse> {
    return this.service.createVersion(tenantId, userId, request);
  }

  /**
   * バージョンコピー
   * POST /api/organization-master/versions/:versionId/copy
   */
  @Post('versions/:versionId/copy')
  async copyVersion(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('versionId') sourceVersionId: string,
    @Body() request: CopyVersionRequest,
  ): Promise<CopyVersionResponse> {
    return this.service.copyVersion(tenantId, userId, sourceVersionId, request);
  }

  /**
   * バージョン更新
   * PUT /api/organization-master/versions/:versionId
   */
  @Put('versions/:versionId')
  async updateVersion(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('versionId') versionId: string,
    @Body() request: UpdateVersionRequest,
  ): Promise<UpdateVersionResponse> {
    return this.service.updateVersion(tenantId, userId, versionId, request);
  }

  /**
   * as-of検索
   * GET /api/organization-master/versions/as-of
   */
  @Get('versions/as-of')
  async findEffectiveAsOf(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Query('asOfDate') asOfDate: string,
  ): Promise<AsOfSearchResponse> {
    const request: AsOfSearchRequest = { asOfDate };
    return this.service.findEffectiveAsOf(tenantId, userId, request);
  }

  // ===========================================================================
  // Department Endpoints
  // ===========================================================================

  /**
   * 部門一覧取得（ツリー）
   * GET /api/organization-master/versions/:versionId/departments
   */
  @Get('versions/:versionId/departments')
  async listDepartmentsTree(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('versionId') versionId: string,
    @Query('keyword') keyword?: string,
    @Query('isActive') isActiveStr?: string,
  ): Promise<ListDepartmentsTreeResponse> {
    // isActive のパース（'true'/'false' 文字列 → boolean）
    let isActive: boolean | undefined;
    if (isActiveStr !== undefined) {
      isActive = isActiveStr === 'true';
    }

    const request: ListDepartmentsTreeRequest = { keyword, isActive };
    return this.service.listDepartmentsTree(tenantId, userId, versionId, request);
  }

  /**
   * 部門詳細取得
   * GET /api/organization-master/departments/:departmentId
   */
  @Get('departments/:departmentId')
  async getDepartment(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('departmentId') departmentId: string,
  ): Promise<GetDepartmentResponse> {
    return this.service.getDepartment(tenantId, userId, departmentId);
  }

  /**
   * 部門新規作成
   * POST /api/organization-master/versions/:versionId/departments
   */
  @Post('versions/:versionId/departments')
  async createDepartment(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('versionId') versionId: string,
    @Body() request: CreateDepartmentRequest,
  ): Promise<CreateDepartmentResponse> {
    return this.service.createDepartment(tenantId, userId, versionId, request);
  }

  /**
   * 部門更新
   * PUT /api/organization-master/departments/:departmentId
   */
  @Put('departments/:departmentId')
  async updateDepartment(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('departmentId') departmentId: string,
    @Body() request: UpdateDepartmentRequest,
  ): Promise<UpdateDepartmentResponse> {
    return this.service.updateDepartment(tenantId, userId, departmentId, request);
  }

  /**
   * 部門移動（ドラッグ＆ドロップ）
   * POST /api/organization-master/departments/:departmentId/move
   */
  @Post('departments/:departmentId/move')
  async moveDepartment(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('departmentId') departmentId: string,
    @Body() request: MoveDepartmentRequest,
  ): Promise<MoveDepartmentResponse> {
    return this.service.moveDepartment(tenantId, userId, departmentId, request);
  }

  /**
   * 部門無効化
   * POST /api/organization-master/departments/:departmentId/deactivate
   */
  @Post('departments/:departmentId/deactivate')
  async deactivateDepartment(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('departmentId') departmentId: string,
  ): Promise<DeactivateDepartmentResponse> {
    return this.service.deactivateDepartment(tenantId, userId, departmentId);
  }

  /**
   * 部門有効化
   * POST /api/organization-master/departments/:departmentId/reactivate
   */
  @Post('departments/:departmentId/reactivate')
  async reactivateDepartment(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('departmentId') departmentId: string,
  ): Promise<ReactivateDepartmentResponse> {
    return this.service.reactivateDepartment(tenantId, userId, departmentId);
  }
}
