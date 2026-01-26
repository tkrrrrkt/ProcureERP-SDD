/**
 * Segment Service
 *
 * セグメントのビジネスロジック
 * - セグメントコード正規化、重複チェック
 * - 階層制約検証（循環参照検出、深度チェック、親セグメント検証）
 * - hierarchy_level / hierarchy_path 自動計算
 */

import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { SegmentRepository } from '../repositories/segment.repository';
import { CategoryAxisRepository } from '../repositories/category-axis.repository';
import { Segment } from '@prisma/client';
import { normalizeCategoryCode } from '../../../../common/utils/normalize-business-code';
import {
  ListSegmentsApiRequest,
  ListSegmentsApiResponse,
  ListSegmentsTreeApiResponse,
  GetSegmentApiResponse,
  CreateSegmentApiRequest,
  CreateSegmentApiResponse,
  UpdateSegmentApiRequest,
  UpdateSegmentApiResponse,
  SegmentApiDto,
  SegmentTreeNode,
} from '@procure/contracts/api/category-segment';
import {
  CategorySegmentErrorCode,
  CategorySegmentErrorHttpStatus,
  CategorySegmentErrorMessage,
} from '@procure/contracts/api/errors';

const MAX_HIERARCHY_DEPTH = 5;

@Injectable()
export class SegmentService {
  constructor(
    private readonly segmentRepository: SegmentRepository,
    private readonly categoryAxisRepository: CategoryAxisRepository,
  ) {}

  /**
   * セグメント一覧取得（フラット形式）
   */
  async list(tenantId: string, request: ListSegmentsApiRequest): Promise<ListSegmentsApiResponse> {
    const { items, total } = await this.segmentRepository.findMany({
      tenantId,
      categoryAxisId: request.categoryAxisId,
      offset: request.offset,
      limit: request.limit,
      sortBy: request.sortBy,
      sortOrder: request.sortOrder,
      keyword: request.keyword,
      isActive: request.isActive,
    });

    return {
      items: items.map(this.toApiDto),
      total,
    };
  }

  /**
   * セグメント一覧取得（階層ツリー形式）
   */
  async listTree(tenantId: string, categoryAxisId: string): Promise<ListSegmentsTreeApiResponse> {
    const tree = await this.segmentRepository.listTree(tenantId, categoryAxisId);
    const total = this.countTreeNodes(tree);

    return { tree, total };
  }

  /**
   * セグメント詳細取得
   */
  async getById(tenantId: string, segmentId: string): Promise<GetSegmentApiResponse> {
    const segment = await this.segmentRepository.findById({ tenantId, segmentId });

    if (!segment) {
      throw new HttpException(
        {
          code: CategorySegmentErrorCode.SEGMENT_NOT_FOUND,
          message: CategorySegmentErrorMessage.SEGMENT_NOT_FOUND,
        },
        CategorySegmentErrorHttpStatus.SEGMENT_NOT_FOUND,
      );
    }

    return { segment: this.toApiDto(segment) };
  }

  /**
   * セグメント新規登録
   */
  async create(
    tenantId: string,
    request: CreateSegmentApiRequest,
    userId: string,
  ): Promise<CreateSegmentApiResponse> {
    // カテゴリ軸の存在チェック
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

    // セグメントコード正規化
    const normalizedSegmentCode = normalizeCategoryCode(request.segmentCode, {
      fieldName: 'セグメントコード',
      errorCode: CategorySegmentErrorCode.INVALID_CODE_LENGTH,
    });

    // 重複チェック
    const existing = await this.segmentRepository.findByCode({
      tenantId,
      categoryAxisId: request.categoryAxisId,
      segmentCode: normalizedSegmentCode,
    });

    if (existing) {
      throw new HttpException(
        {
          code: CategorySegmentErrorCode.SEGMENT_CODE_DUPLICATE,
          message: CategorySegmentErrorMessage.SEGMENT_CODE_DUPLICATE,
          details: { segmentCode: normalizedSegmentCode },
        },
        CategorySegmentErrorHttpStatus.SEGMENT_CODE_DUPLICATE,
      );
    }

    // 階層パスと階層レベルの計算
    let hierarchyLevel = 1;
    let hierarchyPath: string;

    if (request.parentSegmentId) {
      // 階層サポートチェック
      if (!categoryAxis.supportsHierarchy) {
        throw new HttpException(
          {
            code: CategorySegmentErrorCode.HIERARCHY_NOT_ALLOWED,
            message: CategorySegmentErrorMessage.HIERARCHY_NOT_ALLOWED,
          },
          CategorySegmentErrorHttpStatus.HIERARCHY_NOT_ALLOWED,
        );
      }

      // 親セグメントの検証
      const parent = await this.segmentRepository.findById({
        tenantId,
        segmentId: request.parentSegmentId,
      });

      if (!parent) {
        throw new HttpException(
          {
            code: CategorySegmentErrorCode.PARENT_SEGMENT_NOT_FOUND,
            message: CategorySegmentErrorMessage.PARENT_SEGMENT_NOT_FOUND,
          },
          CategorySegmentErrorHttpStatus.PARENT_SEGMENT_NOT_FOUND,
        );
      }

      // 親が同一軸に属しているかチェック
      if (parent.categoryAxisId !== request.categoryAxisId) {
        throw new HttpException(
          {
            code: CategorySegmentErrorCode.PARENT_SEGMENT_WRONG_AXIS,
            message: CategorySegmentErrorMessage.PARENT_SEGMENT_WRONG_AXIS,
          },
          CategorySegmentErrorHttpStatus.PARENT_SEGMENT_WRONG_AXIS,
        );
      }

      // 階層深度チェック
      hierarchyLevel = parent.hierarchyLevel + 1;
      if (hierarchyLevel > MAX_HIERARCHY_DEPTH) {
        throw new HttpException(
          {
            code: CategorySegmentErrorCode.HIERARCHY_DEPTH_EXCEEDED,
            message: CategorySegmentErrorMessage.HIERARCHY_DEPTH_EXCEEDED,
            details: { maxDepth: MAX_HIERARCHY_DEPTH, requestedDepth: hierarchyLevel },
          },
          CategorySegmentErrorHttpStatus.HIERARCHY_DEPTH_EXCEEDED,
        );
      }

      // 階層パスは作成後に設定するため、一時的なプレースホルダ
      hierarchyPath = parent.hierarchyPath || `/${parent.id}/`;
    } else {
      // ルートセグメント
      hierarchyPath = '/'; // 作成後に更新
    }

    // セグメント作成
    const segment = await this.segmentRepository.create({
      tenantId,
      categoryAxisId: request.categoryAxisId,
      segmentCode: normalizedSegmentCode,
      segmentName: request.segmentName,
      parentSegmentId: request.parentSegmentId,
      hierarchyLevel,
      hierarchyPath: hierarchyPath, // 一時的な値
      displayOrder: request.displayOrder,
      description: request.description,
      createdByLoginAccountId: userId,
    });

    // 階層パスを正しく設定（自身のIDを含める）
    const finalHierarchyPath = request.parentSegmentId
      ? `${hierarchyPath}${segment.id}/`
      : `/${segment.id}/`;

    const updatedSegment = await this.segmentRepository.update({
      tenantId,
      segmentId: segment.id,
      version: segment.version,
      hierarchyPath: finalHierarchyPath,
      updatedByLoginAccountId: userId,
    });

    return { segment: this.toApiDto(updatedSegment || segment) };
  }

  /**
   * セグメント更新
   */
  async update(
    tenantId: string,
    segmentId: string,
    request: UpdateSegmentApiRequest,
    userId: string,
  ): Promise<UpdateSegmentApiResponse> {
    const existing = await this.segmentRepository.findById({ tenantId, segmentId });

    if (!existing) {
      throw new HttpException(
        {
          code: CategorySegmentErrorCode.SEGMENT_NOT_FOUND,
          message: CategorySegmentErrorMessage.SEGMENT_NOT_FOUND,
        },
        CategorySegmentErrorHttpStatus.SEGMENT_NOT_FOUND,
      );
    }

    let hierarchyLevel = existing.hierarchyLevel;
    let hierarchyPath = existing.hierarchyPath;

    // 親セグメント変更の場合
    if (request.parentSegmentId !== undefined) {
      const categoryAxis = await this.categoryAxisRepository.findById({
        tenantId,
        categoryAxisId: existing.categoryAxisId,
      });

      if (request.parentSegmentId === null) {
        // 親を解除（ルートに変更）
        hierarchyLevel = 1;
        hierarchyPath = `/${segmentId}/`;
      } else if (request.parentSegmentId !== existing.parentSegmentId) {
        // 新しい親に変更
        if (!categoryAxis?.supportsHierarchy) {
          throw new HttpException(
            {
              code: CategorySegmentErrorCode.HIERARCHY_NOT_ALLOWED,
              message: CategorySegmentErrorMessage.HIERARCHY_NOT_ALLOWED,
            },
            CategorySegmentErrorHttpStatus.HIERARCHY_NOT_ALLOWED,
          );
        }

        const newParent = await this.segmentRepository.findById({
          tenantId,
          segmentId: request.parentSegmentId,
        });

        if (!newParent) {
          throw new HttpException(
            {
              code: CategorySegmentErrorCode.PARENT_SEGMENT_NOT_FOUND,
              message: CategorySegmentErrorMessage.PARENT_SEGMENT_NOT_FOUND,
            },
            CategorySegmentErrorHttpStatus.PARENT_SEGMENT_NOT_FOUND,
          );
        }

        if (newParent.categoryAxisId !== existing.categoryAxisId) {
          throw new HttpException(
            {
              code: CategorySegmentErrorCode.PARENT_SEGMENT_WRONG_AXIS,
              message: CategorySegmentErrorMessage.PARENT_SEGMENT_WRONG_AXIS,
            },
            CategorySegmentErrorHttpStatus.PARENT_SEGMENT_WRONG_AXIS,
          );
        }

        // 循環参照チェック
        const ancestors = await this.segmentRepository.findAncestors(
          tenantId,
          request.parentSegmentId,
        );
        if (ancestors.some((a) => a.id === segmentId)) {
          throw new HttpException(
            {
              code: CategorySegmentErrorCode.CIRCULAR_REFERENCE,
              message: CategorySegmentErrorMessage.CIRCULAR_REFERENCE,
            },
            CategorySegmentErrorHttpStatus.CIRCULAR_REFERENCE,
          );
        }

        // 階層深度チェック
        hierarchyLevel = newParent.hierarchyLevel + 1;
        if (hierarchyLevel > MAX_HIERARCHY_DEPTH) {
          throw new HttpException(
            {
              code: CategorySegmentErrorCode.HIERARCHY_DEPTH_EXCEEDED,
              message: CategorySegmentErrorMessage.HIERARCHY_DEPTH_EXCEEDED,
            },
            CategorySegmentErrorHttpStatus.HIERARCHY_DEPTH_EXCEEDED,
          );
        }

        hierarchyPath = `${newParent.hierarchyPath}${segmentId}/`;
      }
    }

    const updated = await this.segmentRepository.update({
      tenantId,
      segmentId,
      version: request.version,
      segmentName: request.segmentName,
      parentSegmentId: request.parentSegmentId,
      hierarchyLevel,
      hierarchyPath: hierarchyPath ?? undefined, // null → undefined 変換
      displayOrder: request.displayOrder,
      description: request.description,
      isActive: request.isActive,
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

    return { segment: this.toApiDto(updated) };
  }

  /**
   * ツリーノード数をカウント
   */
  private countTreeNodes(nodes: SegmentTreeNode[]): number {
    let count = nodes.length;
    for (const node of nodes) {
      count += this.countTreeNodes(node.children);
    }
    return count;
  }

  /**
   * Segment → SegmentApiDto 変換
   */
  private toApiDto(entity: Segment): SegmentApiDto {
    return {
      id: entity.id,
      categoryAxisId: entity.categoryAxisId,
      segmentCode: entity.segmentCode,
      segmentName: entity.segmentName,
      parentSegmentId: entity.parentSegmentId,
      hierarchyLevel: entity.hierarchyLevel,
      hierarchyPath: entity.hierarchyPath,
      displayOrder: entity.displayOrder,
      description: entity.description,
      isActive: entity.isActive,
      version: entity.version,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
      createdBy: entity.createdByLoginAccountId,
      updatedBy: entity.updatedByLoginAccountId,
    };
  }
}
