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
import { OrganizationVersionService } from '../service/organization-version.service';
import { DepartmentService } from '../service/department.service';
import { VersionCopyService } from '../service/version-copy.service';
import {
  // Version types
  ListVersionsApiRequest,
  ListVersionsApiResponse,
  GetVersionApiResponse,
  CreateVersionApiRequest,
  CreateVersionApiResponse,
  CopyVersionApiRequest,
  CopyVersionApiResponse,
  UpdateVersionApiRequest,
  UpdateVersionApiResponse,
  AsOfSearchApiRequest,
  AsOfSearchApiResponse,
  // Department types
  ListDepartmentsApiRequest,
  ListDepartmentsApiResponse,
  GetDepartmentApiResponse,
  CreateDepartmentApiRequest,
  CreateDepartmentApiResponse,
  UpdateDepartmentApiRequest,
  UpdateDepartmentApiResponse,
  MoveDepartmentApiRequest,
  MoveDepartmentApiResponse,
  DeactivateDepartmentApiResponse,
  ReactivateDepartmentApiResponse,
  // Sort types
  VersionSortBy,
  DepartmentSortBy,
  SortOrder,
} from '@procure/contracts/api/organization-master';

/**
 * Organization Master Controller
 *
 * REST API エンドポイント
 * - tenant_id: x-tenant-id ヘッダーから取得
 * - user_id: x-user-id ヘッダーから取得（監査用）
 */
@Controller('organization-master')
export class OrganizationMasterController {
  constructor(
    private readonly versionService: OrganizationVersionService,
    private readonly departmentService: DepartmentService,
    private readonly versionCopyService: VersionCopyService,
  ) {}

  // ===========================================================================
  // Version Endpoints
  // ===========================================================================

  /**
   * バージョン一覧取得
   * GET /organization-master/versions
   */
  @Get('versions')
  async listVersions(
    @Headers('x-tenant-id') tenantId: string,
    @Query('sortBy') sortBy?: VersionSortBy,
    @Query('sortOrder') sortOrder?: SortOrder,
  ): Promise<ListVersionsApiResponse> {
    const request: ListVersionsApiRequest = { sortBy, sortOrder };
    return this.versionService.listVersions(tenantId, request);
  }

  /**
   * バージョン詳細取得
   * GET /organization-master/versions/:versionId
   */
  @Get('versions/:versionId')
  async getVersion(
    @Headers('x-tenant-id') tenantId: string,
    @Param('versionId') versionId: string,
  ): Promise<GetVersionApiResponse> {
    return this.versionService.getVersion(tenantId, versionId);
  }

  /**
   * バージョン新規作成
   * POST /organization-master/versions
   */
  @Post('versions')
  async createVersion(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Body() request: CreateVersionApiRequest,
  ): Promise<CreateVersionApiResponse> {
    return this.versionService.createVersion(tenantId, userId, request);
  }

  /**
   * バージョンコピー
   * POST /organization-master/versions/:versionId/copy
   */
  @Post('versions/:versionId/copy')
  async copyVersion(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('versionId') sourceVersionId: string,
    @Body() request: CopyVersionApiRequest,
  ): Promise<CopyVersionApiResponse> {
    return this.versionCopyService.copyVersion(tenantId, userId, sourceVersionId, request);
  }

  /**
   * バージョン更新
   * PUT /organization-master/versions/:versionId
   */
  @Put('versions/:versionId')
  async updateVersion(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('versionId') versionId: string,
    @Body() request: UpdateVersionApiRequest,
  ): Promise<UpdateVersionApiResponse> {
    return this.versionService.updateVersion(tenantId, userId, versionId, request);
  }

  /**
   * as-of検索
   * GET /organization-master/versions/as-of
   */
  @Get('versions/as-of')
  async findEffectiveAsOf(
    @Headers('x-tenant-id') tenantId: string,
    @Query('asOfDate') asOfDate: string,
  ): Promise<AsOfSearchApiResponse> {
    const request: AsOfSearchApiRequest = { asOfDate };
    return this.versionService.findEffectiveAsOf(tenantId, request);
  }

  // ===========================================================================
  // Department Endpoints
  // ===========================================================================

  /**
   * 部門一覧取得
   * GET /organization-master/versions/:versionId/departments
   */
  @Get('versions/:versionId/departments')
  async listDepartments(
    @Headers('x-tenant-id') tenantId: string,
    @Param('versionId') versionId: string,
    @Query('keyword') keyword?: string,
    @Query('isActive') isActiveStr?: string,
    @Query('sortBy') sortBy?: DepartmentSortBy,
    @Query('sortOrder') sortOrder?: SortOrder,
  ): Promise<ListDepartmentsApiResponse> {
    // isActive のパース（'true'/'false' 文字列 → boolean）
    let isActive: boolean | undefined;
    if (isActiveStr !== undefined) {
      isActive = isActiveStr === 'true';
    }

    const request: ListDepartmentsApiRequest = { keyword, isActive, sortBy, sortOrder };
    return this.departmentService.listDepartments(tenantId, versionId, request);
  }

  /**
   * 部門詳細取得
   * GET /organization-master/departments/:departmentId
   */
  @Get('departments/:departmentId')
  async getDepartment(
    @Headers('x-tenant-id') tenantId: string,
    @Param('departmentId') departmentId: string,
  ): Promise<GetDepartmentApiResponse> {
    return this.departmentService.getDepartment(tenantId, departmentId);
  }

  /**
   * 部門新規作成
   * POST /organization-master/versions/:versionId/departments
   */
  @Post('versions/:versionId/departments')
  async createDepartment(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('versionId') versionId: string,
    @Body() request: CreateDepartmentApiRequest,
  ): Promise<CreateDepartmentApiResponse> {
    return this.departmentService.createDepartment(tenantId, versionId, userId, request);
  }

  /**
   * 部門更新
   * PUT /organization-master/departments/:departmentId
   */
  @Put('departments/:departmentId')
  async updateDepartment(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('departmentId') departmentId: string,
    @Body() request: UpdateDepartmentApiRequest,
  ): Promise<UpdateDepartmentApiResponse> {
    return this.departmentService.updateDepartment(tenantId, userId, departmentId, request);
  }

  /**
   * 部門移動（ドラッグ＆ドロップ）
   * POST /organization-master/departments/:departmentId/move
   */
  @Post('departments/:departmentId/move')
  async moveDepartment(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('departmentId') departmentId: string,
    @Body() request: MoveDepartmentApiRequest,
  ): Promise<MoveDepartmentApiResponse> {
    return this.departmentService.moveDepartment(tenantId, userId, departmentId, request);
  }

  /**
   * 部門無効化
   * POST /organization-master/departments/:departmentId/deactivate
   */
  @Post('departments/:departmentId/deactivate')
  async deactivateDepartment(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('departmentId') departmentId: string,
  ): Promise<DeactivateDepartmentApiResponse> {
    return this.departmentService.deactivateDepartment(tenantId, userId, departmentId);
  }

  /**
   * 部門有効化
   * POST /organization-master/departments/:departmentId/reactivate
   */
  @Post('departments/:departmentId/reactivate')
  async reactivateDepartment(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('departmentId') departmentId: string,
  ): Promise<ReactivateDepartmentApiResponse> {
    return this.departmentService.reactivateDepartment(tenantId, userId, departmentId);
  }
}
