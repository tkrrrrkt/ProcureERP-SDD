/**
 * Segment Controller
 *
 * Domain API エンドポイント
 * - GET  /api/domain/master-data/category-segment/segments
 * - GET  /api/domain/master-data/category-segment/segments/tree
 * - GET  /api/domain/master-data/category-segment/segments/:id
 * - POST /api/domain/master-data/category-segment/segments
 * - PUT  /api/domain/master-data/category-segment/segments/:id
 */

import { Controller, Get, Post, Put, Body, Param, Query, Headers } from '@nestjs/common';
import { SegmentService } from '../services/segment.service';
import {
  ListSegmentsApiRequest,
  ListSegmentsApiResponse,
  ListSegmentsTreeApiResponse,
  GetSegmentApiResponse,
  CreateSegmentApiRequest,
  CreateSegmentApiResponse,
  UpdateSegmentApiRequest,
  UpdateSegmentApiResponse,
  SegmentSortBy,
  SortOrder,
} from '@procure/contracts/api/category-segment';

const DEFAULT_TENANT_ID = 'default-tenant';
const DEFAULT_USER_ID = 'default-user';

@Controller('api/domain/master-data/category-segment/segments')
export class SegmentController {
  constructor(private readonly segmentService: SegmentService) {}

  /**
   * セグメント一覧取得（フラット形式）
   */
  @Get()
  async listSegments(
    @Query('categoryAxisId') categoryAxisId: string,
    @Query('offset') offset?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: SegmentSortBy,
    @Query('sortOrder') sortOrder?: SortOrder,
    @Query('keyword') keyword?: string,
    @Query('isActive') isActive?: string,
    @Headers('x-tenant-id') tenantId?: string,
  ): Promise<ListSegmentsApiResponse> {
    const request: ListSegmentsApiRequest = {
      categoryAxisId,
      offset: offset ? parseInt(offset, 10) : 0,
      limit: limit ? parseInt(limit, 10) : 50,
      sortBy,
      sortOrder,
      keyword,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
    };

    return this.segmentService.list(tenantId || DEFAULT_TENANT_ID, request);
  }

  /**
   * セグメント一覧取得（階層ツリー形式）
   */
  @Get('tree')
  async listSegmentsTree(
    @Query('categoryAxisId') categoryAxisId: string,
    @Headers('x-tenant-id') tenantId?: string,
  ): Promise<ListSegmentsTreeApiResponse> {
    return this.segmentService.listTree(tenantId || DEFAULT_TENANT_ID, categoryAxisId);
  }

  /**
   * セグメント詳細取得
   */
  @Get(':id')
  async getSegment(
    @Param('id') segmentId: string,
    @Headers('x-tenant-id') tenantId?: string,
  ): Promise<GetSegmentApiResponse> {
    return this.segmentService.getById(tenantId || DEFAULT_TENANT_ID, segmentId);
  }

  /**
   * セグメント新規登録
   */
  @Post()
  async createSegment(
    @Body() request: CreateSegmentApiRequest,
    @Headers('x-tenant-id') tenantId?: string,
    @Headers('x-user-id') userId?: string,
  ): Promise<CreateSegmentApiResponse> {
    return this.segmentService.create(
      tenantId || DEFAULT_TENANT_ID,
      request,
      userId || DEFAULT_USER_ID,
    );
  }

  /**
   * セグメント更新
   */
  @Put(':id')
  async updateSegment(
    @Param('id') segmentId: string,
    @Body() request: UpdateSegmentApiRequest,
    @Headers('x-tenant-id') tenantId?: string,
    @Headers('x-user-id') userId?: string,
  ): Promise<UpdateSegmentApiResponse> {
    return this.segmentService.update(
      tenantId || DEFAULT_TENANT_ID,
      segmentId,
      request,
      userId || DEFAULT_USER_ID,
    );
  }
}
