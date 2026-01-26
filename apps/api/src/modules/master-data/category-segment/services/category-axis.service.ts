/**
 * CategoryAxis Service
 *
 * カテゴリ軸のビジネスロジック
 * - 軸コード正規化、重複チェック
 * - supports_hierarchy と target_entity_kind の整合性検証
 * - 監査列（created_by/updated_by）への user_id 設定
 * - 楽観ロック（version）による競合検出
 */

import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CategoryAxisRepository } from '../repositories/category-axis.repository';
import { CategoryAxis, TargetEntityKind } from '@prisma/client';
import { normalizeCategoryCode } from '../../../../common/utils/normalize-business-code';
import {
  CategoryAxisSortBy,
  SortOrder,
  ListCategoryAxesApiRequest,
  ListCategoryAxesApiResponse,
  CreateCategoryAxisApiRequest,
  CreateCategoryAxisApiResponse,
  UpdateCategoryAxisApiRequest,
  UpdateCategoryAxisApiResponse,
  GetCategoryAxisApiResponse,
  CategoryAxisApiDto,
} from '@procure/contracts/api/category-segment';
import {
  CategorySegmentErrorCode,
  CategorySegmentErrorHttpStatus,
  CategorySegmentErrorMessage,
} from '@procure/contracts/api/errors';

@Injectable()
export class CategoryAxisService {
  constructor(private readonly categoryAxisRepository: CategoryAxisRepository) {}

  /**
   * カテゴリ軸一覧取得
   */
  async list(
    tenantId: string,
    request: ListCategoryAxesApiRequest,
  ): Promise<ListCategoryAxesApiResponse> {
    const { items, total } = await this.categoryAxisRepository.findMany({
      tenantId,
      offset: request.offset,
      limit: request.limit,
      sortBy: request.sortBy,
      sortOrder: request.sortOrder,
      keyword: request.keyword,
      targetEntityKind: request.targetEntityKind as TargetEntityKind | undefined,
      isActive: request.isActive,
    });

    return {
      items: items.map(this.toApiDto),
      total,
    };
  }

  /**
   * カテゴリ軸詳細取得
   */
  async getById(tenantId: string, categoryAxisId: string): Promise<GetCategoryAxisApiResponse> {
    const categoryAxis = await this.categoryAxisRepository.findById({
      tenantId,
      categoryAxisId,
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

    return {
      categoryAxis: this.toApiDto(categoryAxis),
    };
  }

  /**
   * カテゴリ軸新規登録
   */
  async create(
    tenantId: string,
    request: CreateCategoryAxisApiRequest,
    userId: string,
  ): Promise<CreateCategoryAxisApiResponse> {
    // 軸コード正規化
    const normalizedAxisCode = normalizeCategoryCode(request.axisCode, {
      fieldName: '軸コード',
      errorCode: CategorySegmentErrorCode.INVALID_CODE_LENGTH,
    });

    // 重複チェック
    const existing = await this.categoryAxisRepository.findByCode({
      tenantId,
      axisCode: normalizedAxisCode,
    });

    if (existing) {
      throw new HttpException(
        {
          code: CategorySegmentErrorCode.AXIS_CODE_DUPLICATE,
          message: CategorySegmentErrorMessage.AXIS_CODE_DUPLICATE,
          details: { axisCode: normalizedAxisCode },
        },
        CategorySegmentErrorHttpStatus.AXIS_CODE_DUPLICATE,
      );
    }

    // supports_hierarchy と target_entity_kind の整合性検証
    // 階層サポートは ITEM の場合のみ有効
    const targetEntityKind = request.targetEntityKind as TargetEntityKind;
    if (request.supportsHierarchy && targetEntityKind !== 'ITEM') {
      throw new HttpException(
        {
          code: CategorySegmentErrorCode.HIERARCHY_NOT_SUPPORTED,
          message: CategorySegmentErrorMessage.HIERARCHY_NOT_SUPPORTED,
          details: { targetEntityKind },
        },
        CategorySegmentErrorHttpStatus.HIERARCHY_NOT_SUPPORTED,
      );
    }

    const categoryAxis = await this.categoryAxisRepository.create({
      tenantId,
      axisCode: normalizedAxisCode,
      axisName: request.axisName,
      targetEntityKind,
      supportsHierarchy: request.supportsHierarchy ?? false,
      displayOrder: request.displayOrder,
      description: request.description,
      createdByLoginAccountId: userId,
    });

    return {
      categoryAxis: this.toApiDto(categoryAxis),
    };
  }

  /**
   * カテゴリ軸更新
   */
  async update(
    tenantId: string,
    categoryAxisId: string,
    request: UpdateCategoryAxisApiRequest,
    userId: string,
  ): Promise<UpdateCategoryAxisApiResponse> {
    // 存在チェック
    const existing = await this.categoryAxisRepository.findById({
      tenantId,
      categoryAxisId,
    });

    if (!existing) {
      throw new HttpException(
        {
          code: CategorySegmentErrorCode.CATEGORY_AXIS_NOT_FOUND,
          message: CategorySegmentErrorMessage.CATEGORY_AXIS_NOT_FOUND,
        },
        CategorySegmentErrorHttpStatus.CATEGORY_AXIS_NOT_FOUND,
      );
    }

    // 更新（楽観ロック）
    const updated = await this.categoryAxisRepository.update({
      tenantId,
      categoryAxisId,
      version: request.version,
      axisName: request.axisName,
      displayOrder: request.displayOrder,
      description: request.description,
      isActive: request.isActive,
      updatedByLoginAccountId: userId,
    });

    if (!updated) {
      // version 不一致による競合
      throw new HttpException(
        {
          code: CategorySegmentErrorCode.CONCURRENT_UPDATE,
          message: CategorySegmentErrorMessage.CONCURRENT_UPDATE,
        },
        CategorySegmentErrorHttpStatus.CONCURRENT_UPDATE,
      );
    }

    return {
      categoryAxis: this.toApiDto(updated),
    };
  }

  /**
   * CategoryAxis → CategoryAxisApiDto 変換
   */
  private toApiDto(entity: CategoryAxis): CategoryAxisApiDto {
    return {
      id: entity.id,
      axisCode: entity.axisCode,
      axisName: entity.axisName,
      targetEntityKind: entity.targetEntityKind,
      supportsHierarchy: entity.supportsHierarchy,
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
