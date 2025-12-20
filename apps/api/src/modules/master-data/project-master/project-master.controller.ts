// master-data/project-master Domain API controller
// FR-LIST-01 ~ FR-LIST-06: プロジェクトマスタCRUD + 無効化/再有効化
//
// エンドポイント:
// - GET /api/master-data/project-master: 一覧検索
// - GET /api/master-data/project-master/:id: 詳細取得
// - POST /api/master-data/project-master: 作成
// - PATCH /api/master-data/project-master/:id: 更新
// - POST /api/master-data/project-master/:id/deactivate: 無効化
// - POST /api/master-data/project-master/:id/reactivate: 再有効化

import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  HttpException,
  HttpStatus,
  Headers,
} from '@nestjs/common'
import {
  ListProjectMasterRequest,
  CreateProjectMasterRequest,
  UpdateProjectMasterRequest,
  ProjectMasterEntity,
  ListProjectMasterResponse,
} from '@epm/contracts/api/project-master'
import {
  ProjectMasterErrorCode,
  ProjectMasterErrorStatusMap,
} from '@epm/contracts/api/errors'
import { ProjectMasterService, ServiceError } from './project-master.service'
import { PrismaService } from '../../../prisma/prisma.service'

// リクエストコンテキスト（認証情報から解決される）
export interface RequestContext {
  tenantId: string
  userId: string
}

// Valid sortBy values
type SortByField = 'projectCode' | 'projectName' | 'projectShortName' | 'plannedPeriodFrom' | 'budgetAmount'
const VALID_SORT_BY: SortByField[] = ['projectCode', 'projectName', 'projectShortName', 'plannedPeriodFrom', 'budgetAmount']

// Query DTOs for validation
interface ListQueryDto {
  offset?: string
  limit?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  projectCode?: string
  projectName?: string
  projectShortName?: string
  departmentCode?: string
  responsibleEmployeeCode?: string
  includeInactive?: string
}

interface DeactivateDto {
  ifMatchVersion: number
}

@Controller('master-data/project-master')
export class ProjectMasterController {
  constructor(
    private readonly service: ProjectMasterService,
    private readonly prisma: PrismaService
  ) {}

  /**
   * 一覧検索
   * GET /api/master-data/project-master
   */
  @Get()
  async list(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Query() query: ListQueryDto
  ): Promise<ListProjectMasterResponse> {
    try {
      await this.prisma.setTenantContext(tenantId)

      const sortBy: SortByField = VALID_SORT_BY.includes(query.sortBy as SortByField)
        ? (query.sortBy as SortByField)
        : 'projectCode'

      const request: ListProjectMasterRequest = {
        offset: query.offset ? parseInt(query.offset, 10) : 0,
        limit: query.limit ? parseInt(query.limit, 10) : 50,
        sortBy,
        sortOrder: query.sortOrder || 'asc',
        projectCode: query.projectCode,
        projectName: query.projectName,
        projectShortName: query.projectShortName,
        departmentCode: query.departmentCode,
        responsibleEmployeeCode: query.responsibleEmployeeCode,
        includeInactive: query.includeInactive === 'true',
      }

      return await this.service.list(tenantId, request)
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * 詳細取得
   * GET /api/master-data/project-master/:id
   */
  @Get(':id')
  async findById(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string
  ): Promise<ProjectMasterEntity> {
    try {
      await this.prisma.setTenantContext(tenantId)
      return await this.service.findById(tenantId, id)
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * 作成
   * POST /api/master-data/project-master
   */
  @Post()
  async create(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Body() body: CreateProjectMasterRequest
  ): Promise<ProjectMasterEntity> {
    try {
      await this.prisma.setTenantContext(tenantId)
      return await this.service.create(tenantId, userId, body)
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * 更新
   * PATCH /api/master-data/project-master/:id
   */
  @Patch(':id')
  async update(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') id: string,
    @Body() body: UpdateProjectMasterRequest
  ): Promise<ProjectMasterEntity> {
    try {
      await this.prisma.setTenantContext(tenantId)
      return await this.service.update(tenantId, userId, id, body)
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * 無効化
   * POST /api/master-data/project-master/:id/deactivate
   */
  @Post(':id/deactivate')
  async deactivate(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') id: string,
    @Body() body: DeactivateDto
  ): Promise<ProjectMasterEntity> {
    try {
      await this.prisma.setTenantContext(tenantId)
      return await this.service.deactivate(tenantId, userId, id, body.ifMatchVersion)
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * 再有効化
   * POST /api/master-data/project-master/:id/reactivate
   */
  @Post(':id/reactivate')
  async reactivate(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') id: string,
    @Body() body: DeactivateDto
  ): Promise<ProjectMasterEntity> {
    try {
      await this.prisma.setTenantContext(tenantId)
      return await this.service.reactivate(tenantId, userId, id, body.ifMatchVersion)
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * エラーハンドリング
   */
  private handleError(error: unknown): HttpException {
    if (error instanceof ServiceError) {
      const statusCode = ProjectMasterErrorStatusMap[error.error.code as ProjectMasterErrorCode] ?? 500
      return new HttpException(
        {
          code: error.error.code,
          message: error.error.message,
          details: error.error.details,
        },
        statusCode
      )
    }

    // 予期しないエラー
    console.error('Unexpected error:', error)
    return new HttpException(
      {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
      HttpStatus.INTERNAL_SERVER_ERROR
    )
  }
}
