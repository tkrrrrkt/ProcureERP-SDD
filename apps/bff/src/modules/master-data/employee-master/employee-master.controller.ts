// master-data/employee-master BFF controller
// FR-LIST-01 ~ FR-LIST-06, FR-LIST-10, FR-LIST-11
//
// エンドポイント:
// - GET /api/bff/master-data/employee-master: 一覧検索
// - GET /api/bff/master-data/employee-master/:id: 詳細取得
// - POST /api/bff/master-data/employee-master: 作成
// - PATCH /api/bff/master-data/employee-master/:id: 更新
// - POST /api/bff/master-data/employee-master/:id/deactivate: 無効化
// - POST /api/bff/master-data/employee-master/:id/reactivate: 再有効化
//
// 実装要件:
// - contracts/bff DTOを使用
// - 認証情報からtenant_id/user_idを解決
// - エラーのPass-through

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
  ListEmployeeMasterResponse,
  EmployeeMasterDetailResponse,
  CreateEmployeeMasterRequest,
  UpdateEmployeeMasterRequest,
} from '@epm/contracts/bff/employee-master'

import { EmployeeMasterBffService } from './employee-master.service'

// Query DTOs
interface ListQueryDto {
  page?: string
  pageSize?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  employeeCode?: string
  employeeName?: string
  includeInactive?: string
}

@Controller('master-data/employee-master')
export class EmployeeMasterBffController {
  constructor(private readonly service: EmployeeMasterBffService) {}

  /**
   * 一覧検索
   * GET /api/bff/master-data/employee-master
   */
  @Get()
  async list(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Query() query: ListQueryDto
  ): Promise<ListEmployeeMasterResponse> {
    try {
      const request: ListEmployeeMasterRequest = {
        page: query.page ? parseInt(query.page, 10) : undefined,
        pageSize: query.pageSize ? parseInt(query.pageSize, 10) : undefined,
        sortBy: query.sortBy as ListEmployeeMasterRequest['sortBy'],
        sortOrder: query.sortOrder,
        employeeCode: query.employeeCode,
        employeeName: query.employeeName,
        includeInactive: query.includeInactive === 'true',
      }

      return await this.service.list(tenantId, userId, request)
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * 詳細取得
   * GET /api/bff/master-data/employee-master/:id
   */
  @Get(':id')
  async findById(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') id: string
  ): Promise<EmployeeMasterDetailResponse> {
    try {
      return await this.service.findById(tenantId, userId, id)
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * 作成
   * POST /api/bff/master-data/employee-master
   */
  @Post()
  async create(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Body() body: CreateEmployeeMasterRequest
  ): Promise<EmployeeMasterDetailResponse> {
    try {
      return await this.service.create(tenantId, userId, body)
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * 更新
   * PATCH /api/bff/master-data/employee-master/:id
   */
  @Patch(':id')
  async update(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') id: string,
    @Body() body: UpdateEmployeeMasterRequest
  ): Promise<EmployeeMasterDetailResponse> {
    try {
      return await this.service.update(tenantId, userId, id, body)
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * 無効化
   * POST /api/bff/master-data/employee-master/:id/deactivate
   */
  @Post(':id/deactivate')
  async deactivate(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') id: string
  ): Promise<EmployeeMasterDetailResponse> {
    try {
      return await this.service.deactivate(tenantId, userId, id)
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * 再有効化
   * POST /api/bff/master-data/employee-master/:id/reactivate
   */
  @Post(':id/reactivate')
  async reactivate(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') id: string
  ): Promise<EmployeeMasterDetailResponse> {
    try {
      return await this.service.reactivate(tenantId, userId, id)
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * エラーハンドリング
   * FR-LIST-11: エラーのPass-through（Domain APIからのエラーをそのまま返す）
   */
  private handleError(error: unknown): HttpException {
    // Domain APIからのエラーをPass-through
    if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
      const apiError = error as { code: string; message: string; details?: Record<string, unknown>; status?: number }
      const statusCode = apiError.status || HttpStatus.INTERNAL_SERVER_ERROR
      return new HttpException(
        {
          code: apiError.code,
          message: apiError.message,
          details: apiError.details,
        },
        statusCode
      )
    }

    // 予期しないエラー
    console.error('Unexpected BFF error:', error)
    return new HttpException(
      {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
      HttpStatus.INTERNAL_SERVER_ERROR
    )
  }
}
