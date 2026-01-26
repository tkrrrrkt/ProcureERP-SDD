/**
 * CategoryAxis Controller
 *
 * Domain API エンドポイント
 * - GET  /api/domain/master-data/category-segment/category-axes
 * - GET  /api/domain/master-data/category-segment/category-axes/:id
 * - POST /api/domain/master-data/category-segment/category-axes
 * - PUT  /api/domain/master-data/category-segment/category-axes/:id
 */

import { Controller, Get, Post, Put, Body, Param, Query, Headers } from '@nestjs/common';
import { CategoryAxisService } from '../services/category-axis.service';
import {
  ListCategoryAxesApiRequest,
  ListCategoryAxesApiResponse,
  GetCategoryAxisApiResponse,
  CreateCategoryAxisApiRequest,
  CreateCategoryAxisApiResponse,
  UpdateCategoryAxisApiRequest,
  UpdateCategoryAxisApiResponse,
  CategoryAxisSortBy,
  SortOrder,
  TargetEntityKind,
} from '@procure/contracts/api/category-segment';

// TODO: JWT/Session認証からtenant_id/user_idを取得する
// MVP-1ではHeaderから取得（開発用）
const DEFAULT_TENANT_ID = 'default-tenant';
const DEFAULT_USER_ID = 'default-user';

@Controller('api/domain/master-data/category-segment/category-axes')
export class CategoryAxisController {
  constructor(private readonly categoryAxisService: CategoryAxisService) {}

  /**
   * カテゴリ軸一覧取得
   */
  @Get()
  async listCategoryAxes(
    @Query('offset') offset?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: CategoryAxisSortBy,
    @Query('sortOrder') sortOrder?: SortOrder,
    @Query('keyword') keyword?: string,
    @Query('targetEntityKind') targetEntityKind?: TargetEntityKind,
    @Query('isActive') isActive?: string,
    @Headers('x-tenant-id') tenantId?: string,
  ): Promise<ListCategoryAxesApiResponse> {
    const request: ListCategoryAxesApiRequest = {
      offset: offset ? parseInt(offset, 10) : 0,
      limit: limit ? parseInt(limit, 10) : 50,
      sortBy,
      sortOrder,
      keyword,
      targetEntityKind,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
    };

    return this.categoryAxisService.list(tenantId || DEFAULT_TENANT_ID, request);
  }

  /**
   * カテゴリ軸詳細取得
   */
  @Get(':id')
  async getCategoryAxis(
    @Param('id') categoryAxisId: string,
    @Headers('x-tenant-id') tenantId?: string,
  ): Promise<GetCategoryAxisApiResponse> {
    return this.categoryAxisService.getById(tenantId || DEFAULT_TENANT_ID, categoryAxisId);
  }

  /**
   * カテゴリ軸新規登録
   */
  @Post()
  async createCategoryAxis(
    @Body() request: CreateCategoryAxisApiRequest,
    @Headers('x-tenant-id') tenantId?: string,
    @Headers('x-user-id') userId?: string,
  ): Promise<CreateCategoryAxisApiResponse> {
    return this.categoryAxisService.create(
      tenantId || DEFAULT_TENANT_ID,
      request,
      userId || DEFAULT_USER_ID,
    );
  }

  /**
   * カテゴリ軸更新
   */
  @Put(':id')
  async updateCategoryAxis(
    @Param('id') categoryAxisId: string,
    @Body() request: UpdateCategoryAxisApiRequest,
    @Headers('x-tenant-id') tenantId?: string,
    @Headers('x-user-id') userId?: string,
  ): Promise<UpdateCategoryAxisApiResponse> {
    return this.categoryAxisService.update(
      tenantId || DEFAULT_TENANT_ID,
      categoryAxisId,
      request,
      userId || DEFAULT_USER_ID,
    );
  }
}
