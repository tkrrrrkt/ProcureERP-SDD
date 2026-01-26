/**
 * SegmentAssignment Service
 *
 * セグメント割当のビジネスロジック
 * - entity_kind と CategoryAxis.target_entity_kind の一致検証
 * - segment.category_axis_id と categoryAxisId の一致検証
 * - EntityValidatorService によるエンティティ存在検証
 * - 1軸1値 Upsert
 */

import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { SegmentAssignmentRepository } from '../repositories/segment-assignment.repository';
import { CategoryAxisRepository } from '../repositories/category-axis.repository';
import { SegmentRepository } from '../repositories/segment.repository';
import { EntityValidatorService } from '../../../../common/validators/entity-validator.service';
import { SegmentAssignment, TargetEntityKind } from '@prisma/client';
import {
  ListSegmentAssignmentsByEntityApiResponse,
  ListSegmentAssignmentsBySegmentApiResponse,
  UpsertSegmentAssignmentApiRequest,
  UpsertSegmentAssignmentApiResponse,
  GetEntitySegmentsApiResponse,
  SegmentAssignmentApiDto,
  EntitySegmentInfo,
} from '@procure/contracts/api/category-segment';
import {
  CategorySegmentErrorCode,
  CategorySegmentErrorHttpStatus,
  CategorySegmentErrorMessage,
} from '@procure/contracts/api/errors';

@Injectable()
export class SegmentAssignmentService {
  constructor(
    private readonly segmentAssignmentRepository: SegmentAssignmentRepository,
    private readonly categoryAxisRepository: CategoryAxisRepository,
    private readonly segmentRepository: SegmentRepository,
    private readonly entityValidatorService: EntityValidatorService,
  ) {}

  /**
   * エンティティ別割当一覧取得
   */
  async listByEntity(
    tenantId: string,
    entityKind: TargetEntityKind,
    entityId: string,
  ): Promise<ListSegmentAssignmentsByEntityApiResponse> {
    const assignments = await this.segmentAssignmentRepository.listByEntity({
      tenantId,
      entityKind,
      entityId,
    });

    return {
      items: assignments.map(this.toApiDto),
    };
  }

  /**
   * セグメント別割当一覧取得
   */
  async listBySegment(
    tenantId: string,
    segmentId: string,
    offset: number,
    limit: number,
    includeDescendants: boolean = false,
  ): Promise<ListSegmentAssignmentsBySegmentApiResponse> {
    if (includeDescendants) {
      const segmentIds = await this.segmentRepository.findDescendantIds(tenantId, segmentId);
      const { items, total } = await this.segmentAssignmentRepository.listBySegmentWithDescendants({
        tenantId,
        segmentIds,
        offset,
        limit,
      });
      return { items: items.map(this.toApiDto), total };
    }

    const { items, total } = await this.segmentAssignmentRepository.listBySegment({
      tenantId,
      segmentId,
      offset,
      limit,
    });

    return { items: items.map(this.toApiDto), total };
  }

  /**
   * エンティティ別セグメント情報取得（エンティティ詳細画面用）
   */
  async getEntitySegments(
    tenantId: string,
    entityKind: TargetEntityKind,
    entityId: string,
  ): Promise<GetEntitySegmentsApiResponse> {
    const assignments = await this.segmentAssignmentRepository.listByEntity({
      tenantId,
      entityKind,
      entityId,
    });

    const segments: EntitySegmentInfo[] = assignments
      .filter((a) => a.categoryAxis && a.segment)
      .map((a) => ({
        categoryAxisId: a.categoryAxis!.id,
        categoryAxisName: a.categoryAxis!.axisName,
        segmentId: a.segment!.id,
        segmentCode: a.segment!.segmentCode,
        segmentName: a.segment!.segmentName,
      }));

    return { segments };
  }

  /**
   * セグメント割当 Upsert（1軸1値）
   */
  async upsert(
    tenantId: string,
    request: UpsertSegmentAssignmentApiRequest,
    userId: string,
  ): Promise<UpsertSegmentAssignmentApiResponse> {
    const entityKind = request.entityKind as TargetEntityKind;

    // カテゴリ軸の検証
    const categoryAxis = await this.categoryAxisRepository.findById({
      tenantId,
      categoryAxisId: request.categoryAxisId,
    });

    if (!categoryAxis) {
      throw new HttpException(
        {
          code: CategorySegmentErrorCode.CATEGORY_AXIS_NOT_FOUND,
          message: CategorySegmentErrorMessage.CATEGORY_AXIS_NOT_FOUND,
        },
        CategorySegmentErrorHttpStatus.CATEGORY_AXIS_NOT_FOUND,
      );
    }

    // entity_kind と target_entity_kind の一致検証
    if (categoryAxis.targetEntityKind !== entityKind) {
      throw new HttpException(
        {
          code: CategorySegmentErrorCode.INVALID_ENTITY_KIND,
          message: CategorySegmentErrorMessage.INVALID_ENTITY_KIND,
          details: {
            expected: categoryAxis.targetEntityKind,
            actual: entityKind,
          },
        },
        CategorySegmentErrorHttpStatus.INVALID_ENTITY_KIND,
      );
    }

    // セグメントの検証
    const segment = await this.segmentRepository.findById({
      tenantId,
      segmentId: request.segmentId,
    });

    if (!segment) {
      throw new HttpException(
        {
          code: CategorySegmentErrorCode.SEGMENT_NOT_FOUND,
          message: CategorySegmentErrorMessage.SEGMENT_NOT_FOUND,
        },
        CategorySegmentErrorHttpStatus.SEGMENT_NOT_FOUND,
      );
    }

    // segment.category_axis_id と categoryAxisId の一致検証
    if (segment.categoryAxisId !== request.categoryAxisId) {
      throw new HttpException(
        {
          code: CategorySegmentErrorCode.SEGMENT_NOT_IN_AXIS,
          message: CategorySegmentErrorMessage.SEGMENT_NOT_IN_AXIS,
          details: {
            segmentCategoryAxisId: segment.categoryAxisId,
            requestCategoryAxisId: request.categoryAxisId,
          },
        },
        CategorySegmentErrorHttpStatus.SEGMENT_NOT_IN_AXIS,
      );
    }

    // エンティティ存在検証
    await this.entityValidatorService.validateEntityExists(tenantId, entityKind, request.entityId);

    // 既存割当の検索（1軸1値）
    const existing = await this.segmentAssignmentRepository.findByEntityAndAxis({
      tenantId,
      entityKind,
      entityId: request.entityId,
      categoryAxisId: request.categoryAxisId,
    });

    let assignment: SegmentAssignment;

    if (existing) {
      // 更新
      const updated = await this.segmentAssignmentRepository.update({
        tenantId,
        assignmentId: existing.id,
        version: existing.version,
        segmentId: request.segmentId,
        updatedByLoginAccountId: userId,
      });

      if (!updated) {
        throw new HttpException(
          {
            code: CategorySegmentErrorCode.CONCURRENT_UPDATE,
            message: CategorySegmentErrorMessage.CONCURRENT_UPDATE,
          },
          CategorySegmentErrorHttpStatus.CONCURRENT_UPDATE,
        );
      }

      assignment = updated;
    } else {
      // 新規作成
      assignment = await this.segmentAssignmentRepository.create({
        tenantId,
        entityKind,
        entityId: request.entityId,
        categoryAxisId: request.categoryAxisId,
        segmentId: request.segmentId,
        createdByLoginAccountId: userId,
      });
    }

    return { assignment: this.toApiDto(assignment) };
  }

  /**
   * セグメント割当解除（論理削除）
   */
  async delete(
    tenantId: string,
    assignmentId: string,
    version: number,
    userId: string,
  ): Promise<void> {
    const existing = await this.segmentAssignmentRepository.findById({
      tenantId,
      assignmentId,
    });

    if (!existing) {
      throw new HttpException(
        {
          code: CategorySegmentErrorCode.ASSIGNMENT_NOT_FOUND,
          message: CategorySegmentErrorMessage.ASSIGNMENT_NOT_FOUND,
        },
        CategorySegmentErrorHttpStatus.ASSIGNMENT_NOT_FOUND,
      );
    }

    const deleted = await this.segmentAssignmentRepository.softDelete({
      tenantId,
      assignmentId,
      version,
      updatedByLoginAccountId: userId,
    });

    if (!deleted) {
      throw new HttpException(
        {
          code: CategorySegmentErrorCode.CONCURRENT_UPDATE,
          message: CategorySegmentErrorMessage.CONCURRENT_UPDATE,
        },
        CategorySegmentErrorHttpStatus.CONCURRENT_UPDATE,
      );
    }
  }

  /**
   * SegmentAssignment → SegmentAssignmentApiDto 変換
   */
  private toApiDto(entity: SegmentAssignment): SegmentAssignmentApiDto {
    return {
      id: entity.id,
      entityKind: entity.entityKind,
      entityId: entity.entityId,
      categoryAxisId: entity.categoryAxisId,
      segmentId: entity.segmentId,
      isActive: entity.isActive,
      version: entity.version,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
      createdBy: entity.createdByLoginAccountId,
      updatedBy: entity.updatedByLoginAccountId,
    };
  }
}
