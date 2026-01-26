import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { CategorySegmentBffService } from '../service/category-segment.service';
import {
  ListCategoryAxesRequest,
  ListCategoryAxesResponse,
  GetCategoryAxisResponse,
  CreateCategoryAxisRequest,
  CreateCategoryAxisResponse,
  UpdateCategoryAxisRequest,
  UpdateCategoryAxisResponse,
  ListSegmentsRequest,
  ListSegmentsResponse,
  ListSegmentsTreeResponse,
  GetSegmentResponse,
  CreateSegmentRequest,
  CreateSegmentResponse,
  UpdateSegmentRequest,
  UpdateSegmentResponse,
  ListSegmentAssignmentsResponse,
  UpsertSegmentAssignmentRequest,
  UpsertSegmentAssignmentResponse,
  GetEntitySegmentsResponse,
  CategoryAxisSortBy,
  SegmentSortBy,
  SortOrder,
  TargetEntityKind,
  SegmentViewMode,
} from '@procure/contracts/bff/category-segment';

/**
 * Category-Segment BFF Controller
 *
 * UI からの API エンドポイント
 * - tenant_id / user_id を認証情報（Clerk）から解決
 * - Global prefix: /api/bff が main.ts で設定済み
 * - Pass-through Error Policy（Domain API エラーをそのまま返す）
 */
@Controller('master-data/category-segment')
export class CategorySegmentBffController {
  constructor(private readonly service: CategorySegmentBffService) {}

  // =============================================================================
  // CategoryAxis Endpoints
  // =============================================================================

  /**
   * GET /api/bff/master-data/category-segment/category-axes
   * カテゴリ軸一覧取得
   */
  @Get('category-axes')
  async listCategoryAxes(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('sortBy') sortBy?: CategoryAxisSortBy,
    @Query('sortOrder') sortOrder?: SortOrder,
    @Query('keyword') keyword?: string,
    @Query('targetEntityKind') targetEntityKind?: TargetEntityKind,
    @Query('isActive') isActive?: string,
  ): Promise<ListCategoryAxesResponse> {
    this.validateAuth(tenantId, userId);

    const request: ListCategoryAxesRequest = {
      page: page ? parseInt(page, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
      sortBy,
      sortOrder,
      keyword,
      targetEntityKind,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
    };

    return this.service.listCategoryAxes(tenantId, userId, request);
  }

  /**
   * GET /api/bff/master-data/category-segment/category-axes/:id
   * カテゴリ軸詳細取得
   */
  @Get('category-axes/:id')
  async getCategoryAxis(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') axisId: string,
  ): Promise<GetCategoryAxisResponse> {
    this.validateAuth(tenantId, userId);

    return this.service.getCategoryAxis(tenantId, userId, axisId);
  }

  /**
   * POST /api/bff/master-data/category-segment/category-axes
   * カテゴリ軸新規登録
   */
  @Post('category-axes')
  @HttpCode(HttpStatus.CREATED)
  async createCategoryAxis(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Body() request: CreateCategoryAxisRequest,
  ): Promise<CreateCategoryAxisResponse> {
    this.validateAuth(tenantId, userId);

    return this.service.createCategoryAxis(tenantId, userId, request);
  }

  /**
   * PUT /api/bff/master-data/category-segment/category-axes/:id
   * カテゴリ軸更新
   */
  @Put('category-axes/:id')
  async updateCategoryAxis(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') axisId: string,
    @Body() request: UpdateCategoryAxisRequest,
  ): Promise<UpdateCategoryAxisResponse> {
    this.validateAuth(tenantId, userId);

    return this.service.updateCategoryAxis(tenantId, userId, axisId, request);
  }

  // =============================================================================
  // Segment Endpoints
  // =============================================================================

  /**
   * GET /api/bff/master-data/category-segment/segments
   * セグメント一覧取得（フラット形式）
   */
  @Get('segments')
  async listSegments(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Query('categoryAxisId') categoryAxisId: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('sortBy') sortBy?: SegmentSortBy,
    @Query('sortOrder') sortOrder?: SortOrder,
    @Query('keyword') keyword?: string,
    @Query('isActive') isActive?: string,
    @Query('viewMode') viewMode?: SegmentViewMode,
  ): Promise<ListSegmentsResponse | ListSegmentsTreeResponse> {
    this.validateAuth(tenantId, userId);

    if (!categoryAxisId) {
      throw new HttpException(
        { message: 'Bad Request: categoryAxisId is required' },
        HttpStatus.BAD_REQUEST,
      );
    }

    // viewMode=tree の場合はツリー形式で返却
    if (viewMode === 'tree') {
      return this.service.listSegmentsTree(tenantId, userId, categoryAxisId);
    }

    // デフォルトはフラット形式
    const request: ListSegmentsRequest = {
      categoryAxisId,
      page: page ? parseInt(page, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
      sortBy,
      sortOrder,
      keyword,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
      viewMode,
    };

    return this.service.listSegments(tenantId, userId, request);
  }

  /**
   * GET /api/bff/master-data/category-segment/segments/tree
   * セグメントツリー取得（階層ツリー形式）
   */
  @Get('segments/tree')
  async listSegmentsTree(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Query('categoryAxisId') categoryAxisId: string,
  ): Promise<ListSegmentsTreeResponse> {
    this.validateAuth(tenantId, userId);

    if (!categoryAxisId) {
      throw new HttpException(
        { message: 'Bad Request: categoryAxisId is required' },
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.service.listSegmentsTree(tenantId, userId, categoryAxisId);
  }

  /**
   * GET /api/bff/master-data/category-segment/segments/:id
   * セグメント詳細取得
   */
  @Get('segments/:id')
  async getSegment(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') segmentId: string,
  ): Promise<GetSegmentResponse> {
    this.validateAuth(tenantId, userId);

    return this.service.getSegment(tenantId, userId, segmentId);
  }

  /**
   * POST /api/bff/master-data/category-segment/segments
   * セグメント新規登録
   */
  @Post('segments')
  @HttpCode(HttpStatus.CREATED)
  async createSegment(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Body() request: CreateSegmentRequest,
  ): Promise<CreateSegmentResponse> {
    this.validateAuth(tenantId, userId);

    return this.service.createSegment(tenantId, userId, request);
  }

  /**
   * PUT /api/bff/master-data/category-segment/segments/:id
   * セグメント更新
   */
  @Put('segments/:id')
  async updateSegment(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') segmentId: string,
    @Body() request: UpdateSegmentRequest,
  ): Promise<UpdateSegmentResponse> {
    this.validateAuth(tenantId, userId);

    return this.service.updateSegment(tenantId, userId, segmentId, request);
  }

  // =============================================================================
  // SegmentAssignment Endpoints
  // =============================================================================

  /**
   * GET /api/bff/master-data/category-segment/assignments
   * エンティティ別セグメント割当一覧取得
   */
  @Get('assignments')
  async listSegmentAssignments(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Query('entityKind') entityKind: TargetEntityKind,
    @Query('entityId') entityId: string,
  ): Promise<ListSegmentAssignmentsResponse> {
    this.validateAuth(tenantId, userId);

    if (!entityKind || !entityId) {
      throw new HttpException(
        { message: 'Bad Request: entityKind and entityId are required' },
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.service.listSegmentAssignments(tenantId, userId, {
      entityKind,
      entityId,
    });
  }

  /**
   * POST /api/bff/master-data/category-segment/assignments
   * セグメント割当 Upsert（1軸1値）
   */
  @Post('assignments')
  @HttpCode(HttpStatus.CREATED)
  async upsertSegmentAssignment(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Body() request: UpsertSegmentAssignmentRequest,
  ): Promise<UpsertSegmentAssignmentResponse> {
    this.validateAuth(tenantId, userId);

    return this.service.upsertSegmentAssignment(tenantId, userId, request);
  }

  /**
   * DELETE /api/bff/master-data/category-segment/assignments/:id
   * セグメント割当解除（論理削除）
   */
  @Delete('assignments/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSegmentAssignment(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') assignmentId: string,
  ): Promise<void> {
    this.validateAuth(tenantId, userId);

    await this.service.deleteSegmentAssignment(tenantId, userId, assignmentId);
  }

  // =============================================================================
  // Entity Segments Endpoints
  // =============================================================================

  /**
   * GET /api/bff/master-data/category-segment/entities/:entityKind/:entityId/segments
   * エンティティ別セグメント情報取得（詳細画面用）
   */
  @Get('entities/:entityKind/:entityId/segments')
  async getEntitySegments(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('entityKind') entityKind: TargetEntityKind,
    @Param('entityId') entityId: string,
  ): Promise<GetEntitySegmentsResponse> {
    this.validateAuth(tenantId, userId);

    return this.service.getEntitySegments(tenantId, userId, entityKind, entityId);
  }

  // =============================================================================
  // Private Helper Methods
  // =============================================================================

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
