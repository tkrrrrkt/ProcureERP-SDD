/**
 * SegmentAssignment Controller
 *
 * Domain API エンドポイント
 * - GET    /api/domain/master-data/category-segment/assignments
 * - POST   /api/domain/master-data/category-segment/assignments
 * - DELETE /api/domain/master-data/category-segment/assignments/:id
 * - GET    /api/domain/master-data/category-segment/entities/:entityKind/:entityId/segments
 */

import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SegmentAssignmentService } from '../services/segment-assignment.service';
import { TargetEntityKind } from '@prisma/client';
import {
  ListSegmentAssignmentsByEntityApiResponse,
  ListSegmentAssignmentsBySegmentApiResponse,
  UpsertSegmentAssignmentApiRequest,
  UpsertSegmentAssignmentApiResponse,
  GetEntitySegmentsApiResponse,
} from '@procure/contracts/api/category-segment';

const DEFAULT_TENANT_ID = 'default-tenant';
const DEFAULT_USER_ID = 'default-user';

@Controller('api/domain/master-data/category-segment')
export class SegmentAssignmentController {
  constructor(private readonly segmentAssignmentService: SegmentAssignmentService) {}

  /**
   * エンティティ別割当一覧取得
   */
  @Get('assignments')
  async listAssignmentsByEntity(
    @Query('entityKind') entityKind: TargetEntityKind,
    @Query('entityId') entityId: string,
    @Headers('x-tenant-id') tenantId?: string,
  ): Promise<ListSegmentAssignmentsByEntityApiResponse> {
    return this.segmentAssignmentService.listByEntity(
      tenantId || DEFAULT_TENANT_ID,
      entityKind,
      entityId,
    );
  }

  /**
   * セグメント別割当一覧取得
   */
  @Get('assignments/by-segment')
  async listAssignmentsBySegment(
    @Query('segmentId') segmentId: string,
    @Query('offset') offset?: string,
    @Query('limit') limit?: string,
    @Query('includeDescendants') includeDescendants?: string,
    @Headers('x-tenant-id') tenantId?: string,
  ): Promise<ListSegmentAssignmentsBySegmentApiResponse> {
    return this.segmentAssignmentService.listBySegment(
      tenantId || DEFAULT_TENANT_ID,
      segmentId,
      offset ? parseInt(offset, 10) : 0,
      limit ? parseInt(limit, 10) : 50,
      includeDescendants === 'true',
    );
  }

  /**
   * セグメント割当 Upsert（1軸1値）
   */
  @Post('assignments')
  async upsertAssignment(
    @Body() request: UpsertSegmentAssignmentApiRequest,
    @Headers('x-tenant-id') tenantId?: string,
    @Headers('x-user-id') userId?: string,
  ): Promise<UpsertSegmentAssignmentApiResponse> {
    return this.segmentAssignmentService.upsert(
      tenantId || DEFAULT_TENANT_ID,
      request,
      userId || DEFAULT_USER_ID,
    );
  }

  /**
   * セグメント割当解除（論理削除）
   */
  @Delete('assignments/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAssignment(
    @Param('id') assignmentId: string,
    @Query('version') version: string,
    @Headers('x-tenant-id') tenantId?: string,
    @Headers('x-user-id') userId?: string,
  ): Promise<void> {
    await this.segmentAssignmentService.delete(
      tenantId || DEFAULT_TENANT_ID,
      assignmentId,
      parseInt(version, 10),
      userId || DEFAULT_USER_ID,
    );
  }

  /**
   * エンティティ別セグメント情報取得（エンティティ詳細画面用）
   */
  @Get('entities/:entityKind/:entityId/segments')
  async getEntitySegments(
    @Param('entityKind') entityKind: TargetEntityKind,
    @Param('entityId') entityId: string,
    @Headers('x-tenant-id') tenantId?: string,
  ): Promise<GetEntitySegmentsApiResponse> {
    return this.segmentAssignmentService.getEntitySegments(
      tenantId || DEFAULT_TENANT_ID,
      entityKind,
      entityId,
    );
  }
}
