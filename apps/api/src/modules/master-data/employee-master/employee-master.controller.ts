// master-data/employee-master Domain API controller
// FR-LIST-01 ~ FR-LIST-06: 社員マスタCRUD + 無効化/再有効化
//
// エンドポイント:
// - GET /api/master-data/employee-master: 一覧検索
// - GET /api/master-data/employee-master/:id: 詳細取得
// - POST /api/master-data/employee-master: 作成
// - PATCH /api/master-data/employee-master/:id: 更新
// - POST /api/master-data/employee-master/:id/deactivate: 無効化
// - POST /api/master-data/employee-master/:id/reactivate: 再有効化

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
  ListEmployeeMasterRequest,
  CreateEmployeeMasterRequest,
  UpdateEmployeeMasterRequest,
  EmployeeMasterEntity,
  ListEmployeeMasterResponse,
} from '@epm/contracts/api/employee-master'
import {
  EmployeeMasterErrorCode,
  EmployeeMasterErrorStatusMap,
} from '@epm/contracts/api/errors'
import { EmployeeMasterService, ServiceError } from './employee-master.service'
import { PrismaService } from '../../../prisma/prisma.service'

// Valid sortBy values
type SortByField = 'employeeCode' | 'employeeName'
const VALID_SORT_BY: SortByField[] = ['employeeCode', 'employeeName']

// Query DTOs for validation
interface ListQueryDto {
  offset?: string
  limit?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  employeeCode?: string
  employeeName?: string
  includeInactive?: string
}

@Controller('master-data/employee-master')
export class EmployeeMasterController {
  constructor(
    private readonly service: EmployeeMasterService,
    private readonly prisma: PrismaService
  ) {}

  /**
   * 一覧検索
   * GET /api/master-data/employee-master
   */
  @Get()
  async list(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Query() query: ListQueryDto
  ): Promise<ListEmployeeMasterResponse> {
    try {
      await this.prisma.setTenantContext(tenantId)

      const sortBy: SortByField = VALID_SORT_BY.includes(query.sortBy as SortByField)
        ? (query.sortBy as SortByField)
        : 'employeeCode'

      const request: ListEmployeeMasterRequest = {
        offset: query.offset ? parseInt(query.offset, 10) : 0,
        limit: query.limit ? parseInt(query.limit, 10) : 50,
        sortBy,
        sortOrder: query.sortOrder || 'asc',
        employeeCode: query.employeeCode,
        employeeName: query.employeeName,
        includeInactive: query.includeInactive === 'true',
      }

      return await this.service.list(tenantId, request)
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * 詳細取得
   * GET /api/master-data/employee-master/:id
   */
  @Get(':id')
  async findById(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string
  ): Promise<EmployeeMasterEntity> {
    try {
      await this.prisma.setTenantContext(tenantId)
      return await this.service.findById(tenantId, id)
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * 作成
   * POST /api/master-data/employee-master
   */
  @Post()
  async create(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Body() body: CreateEmployeeMasterRequest
  ): Promise<EmployeeMasterEntity> {
    try {
      await this.prisma.setTenantContext(tenantId)
      return await this.service.create(tenantId, userId, body)
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * 更新
   * PATCH /api/master-data/employee-master/:id
   */
  @Patch(':id')
  async update(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') id: string,
    @Body() body: UpdateEmployeeMasterRequest
  ): Promise<EmployeeMasterEntity> {
    try {
      await this.prisma.setTenantContext(tenantId)
      return await this.service.update(tenantId, userId, id, body)
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * 無効化
   * POST /api/master-data/employee-master/:id/deactivate
   */
  @Post(':id/deactivate')
  async deactivate(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') id: string
  ): Promise<EmployeeMasterEntity> {
    try {
      await this.prisma.setTenantContext(tenantId)
      return await this.service.deactivate(tenantId, userId, id)
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * 再有効化
   * POST /api/master-data/employee-master/:id/reactivate
   */
  @Post(':id/reactivate')
  async reactivate(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') id: string
  ): Promise<EmployeeMasterEntity> {
    try {
      await this.prisma.setTenantContext(tenantId)
      return await this.service.reactivate(tenantId, userId, id)
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * エラーハンドリング
   */
  private handleError(error: unknown): HttpException {
    if (error instanceof ServiceError) {
      const statusCode = EmployeeMasterErrorStatusMap[error.error.code as EmployeeMasterErrorCode] ?? 500
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
