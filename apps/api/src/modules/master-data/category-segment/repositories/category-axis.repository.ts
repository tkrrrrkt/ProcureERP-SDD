/**
 * CategoryAxis Repository
 *
 * DBアクセス層（tenant_id double-guard）
 * - すべてのメソッドは tenant_id を必須パラメータとして受け取る
 * - WHERE句に必ず tenant_id を含める
 * - RLS + アプリケーション層の二重ガード
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { Prisma, CategoryAxis, TargetEntityKind } from '@prisma/client';
import { CategoryAxisSortBy, SortOrder } from '@procure/contracts/api/category-segment';

@Injectable()
export class CategoryAxisRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * カテゴリ軸一覧取得
   */
  async findMany(params: {
    tenantId: string;
    offset: number;
    limit: number;
    sortBy?: CategoryAxisSortBy;
    sortOrder?: SortOrder;
    keyword?: string;
    targetEntityKind?: TargetEntityKind;
    isActive?: boolean;
  }): Promise<{ items: CategoryAxis[]; total: number }> {
    const { tenantId, offset, limit, sortBy, sortOrder, keyword, targetEntityKind, isActive } =
      params;

    // tenant_id double-guard: WHERE句に必ず含める
    const where: Prisma.CategoryAxisWhereInput = {
      tenantId,
    };

    // キーワード検索: 部分一致（Case-insensitive）
    if (keyword) {
      where.OR = [
        { axisCode: { contains: keyword, mode: 'insensitive' } },
        { axisName: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    // 対象エンティティ種別フィルタ
    if (targetEntityKind) {
      where.targetEntityKind = targetEntityKind;
    }

    // 有効フラグフィルタ
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // ソートフィールドのマッピング
    const sortField = sortBy || 'displayOrder';
    const sortDirection = sortOrder || 'asc';

    const orderBy: Prisma.CategoryAxisOrderByWithRelationInput = {
      [sortField]: sortDirection,
    };

    const [items, total] = await Promise.all([
      this.prisma.categoryAxis.findMany({
        where,
        orderBy,
        skip: offset,
        take: limit,
      }),
      this.prisma.categoryAxis.count({ where }),
    ]);

    return { items, total };
  }

  /**
   * IDによるカテゴリ軸取得
   */
  async findById(params: {
    tenantId: string;
    categoryAxisId: string;
  }): Promise<CategoryAxis | null> {
    const { tenantId, categoryAxisId } = params;

    return this.prisma.categoryAxis.findFirst({
      where: {
        tenantId,
        id: categoryAxisId,
      },
    });
  }

  /**
   * 軸コードによるカテゴリ軸取得（重複チェック用）
   */
  async findByCode(params: {
    tenantId: string;
    axisCode: string;
  }): Promise<CategoryAxis | null> {
    const { tenantId, axisCode } = params;

    return this.prisma.categoryAxis.findFirst({
      where: {
        tenantId,
        axisCode,
      },
    });
  }

  /**
   * カテゴリ軸作成
   */
  async create(params: {
    tenantId: string;
    axisCode: string;
    axisName: string;
    targetEntityKind: TargetEntityKind;
    supportsHierarchy?: boolean;
    displayOrder?: number;
    description?: string;
    createdByLoginAccountId?: string;
  }): Promise<CategoryAxis> {
    const {
      tenantId,
      axisCode,
      axisName,
      targetEntityKind,
      supportsHierarchy = false,
      displayOrder = 1000,
      description,
      createdByLoginAccountId,
    } = params;

    return this.prisma.categoryAxis.create({
      data: {
        tenantId,
        axisCode,
        axisName,
        targetEntityKind,
        supportsHierarchy,
        displayOrder,
        description,
        createdByLoginAccountId,
        updatedByLoginAccountId: createdByLoginAccountId,
      },
    });
  }

  /**
   * カテゴリ軸更新（楽観ロック対応）
   */
  async update(params: {
    tenantId: string;
    categoryAxisId: string;
    version: number;
    axisName?: string;
    displayOrder?: number;
    description?: string;
    isActive?: boolean;
    updatedByLoginAccountId?: string;
  }): Promise<CategoryAxis | null> {
    const {
      tenantId,
      categoryAxisId,
      version,
      axisName,
      displayOrder,
      description,
      isActive,
      updatedByLoginAccountId,
    } = params;

    try {
      return await this.prisma.categoryAxis.update({
        where: {
          id: categoryAxisId,
          tenantId,
          version, // 楽観ロック
        },
        data: {
          ...(axisName !== undefined && { axisName }),
          ...(displayOrder !== undefined && { displayOrder }),
          ...(description !== undefined && { description }),
          ...(isActive !== undefined && { isActive }),
          ...(updatedByLoginAccountId && { updatedByLoginAccountId }),
          version: { increment: 1 },
        },
      });
    } catch (error) {
      // レコードが見つからない場合（version不一致含む）
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return null;
      }
      throw error;
    }
  }
}
