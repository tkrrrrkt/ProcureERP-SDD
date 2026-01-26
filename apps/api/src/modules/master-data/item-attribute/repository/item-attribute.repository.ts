import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { Prisma, ItemAttribute } from '@prisma/client';
import {
  ItemAttributeSortBy,
  SortOrder,
} from '@procure/contracts/api/item-attribute';

/**
 * ItemAttribute Repository
 *
 * DBアクセス層（tenant_id double-guard）
 * - すべてのメソッドは tenant_id を必須パラメータとして受け取る
 * - WHERE句に必ず tenant_id を含める
 * - RLS + アプリケーション層の二重ガード
 */
@Injectable()
export class ItemAttributeRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 仕様属性一覧取得
   */
  async findMany(params: {
    tenantId: string;
    offset: number;
    limit: number;
    sortBy?: ItemAttributeSortBy;
    sortOrder?: SortOrder;
    keyword?: string;
    isActive?: boolean;
  }): Promise<{ items: ItemAttribute[]; total: number }> {
    const { tenantId, offset, limit, sortBy, sortOrder, keyword, isActive } = params;

    // tenant_id double-guard: WHERE句に必ず含める
    const where: Prisma.ItemAttributeWhereInput = {
      tenantId, // tenant_id guard
    };

    // 有効/無効フィルタ
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // キーワード検索: 部分一致（Case-insensitive）
    if (keyword) {
      where.OR = [
        { itemAttributeCode: { contains: keyword, mode: 'insensitive' } },
        { itemAttributeName: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    // ソートフィールドのマッピング（DTO → DB column）
    let orderBy: Prisma.ItemAttributeOrderByWithRelationInput;
    const sortDirection = sortOrder || 'asc';

    switch (sortBy) {
      case 'attributeCode':
        orderBy = { itemAttributeCode: sortDirection };
        break;
      case 'attributeName':
        orderBy = { itemAttributeName: sortDirection };
        break;
      case 'isActive':
        orderBy = { isActive: sortDirection };
        break;
      case 'sortOrder':
      default:
        orderBy = { sortOrder: sortDirection };
        break;
    }

    // 並列実行: データ取得と総件数取得
    const [items, total] = await Promise.all([
      this.prisma.itemAttribute.findMany({
        where,
        orderBy,
        skip: offset,
        take: limit,
      }),
      this.prisma.itemAttribute.count({ where }),
    ]);

    return { items, total };
  }

  /**
   * 仕様属性詳細取得
   */
  async findOne(params: {
    tenantId: string;
    attributeId: string;
  }): Promise<ItemAttribute | null> {
    const { tenantId, attributeId } = params;

    // tenant_id double-guard: WHERE句に必ず含める
    return this.prisma.itemAttribute.findFirst({
      where: {
        id: attributeId,
        tenantId, // tenant_id guard
      },
    });
  }

  /**
   * 仕様属性新規登録
   */
  async create(params: {
    tenantId: string;
    createdBy: string;
    data: {
      attributeCode: string;
      attributeName: string;
      sortOrder?: number;
    };
  }): Promise<ItemAttribute> {
    const { tenantId, createdBy, data } = params;

    return this.prisma.itemAttribute.create({
      data: {
        tenantId, // tenant_id設定
        itemAttributeCode: data.attributeCode,
        itemAttributeName: data.attributeName,
        valueType: 'SELECT', // MVP: 固定値
        sortOrder: data.sortOrder ?? 0,
        isActive: true,
        version: 1, // 初期バージョン
        createdByLoginAccountId: createdBy, // 監査列
        updatedByLoginAccountId: createdBy, // 監査列（作成時は同じ）
      },
    });
  }

  /**
   * 仕様属性更新（楽観ロック）
   */
  async update(params: {
    tenantId: string;
    attributeId: string;
    version: number;
    updatedBy: string;
    data: {
      attributeName: string;
      sortOrder?: number;
    };
  }): Promise<ItemAttribute | null> {
    const { tenantId, attributeId, version, updatedBy, data } = params;

    try {
      const updated = await this.prisma.itemAttribute.updateMany({
        where: {
          id: attributeId,
          tenantId, // tenant_id guard
          version, // optimistic lock
        },
        data: {
          itemAttributeName: data.attributeName,
          sortOrder: data.sortOrder,
          version: version + 1, // version increment
          updatedByLoginAccountId: updatedBy, // 監査列
        },
      });

      if (updated.count === 0) {
        return null;
      }

      // 更新後のデータを取得
      return this.prisma.itemAttribute.findFirst({
        where: {
          id: attributeId,
          tenantId,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * 仕様属性有効化/無効化（楽観ロック）
   */
  async setActive(params: {
    tenantId: string;
    attributeId: string;
    version: number;
    updatedBy: string;
    isActive: boolean;
  }): Promise<ItemAttribute | null> {
    const { tenantId, attributeId, version, updatedBy, isActive } = params;

    try {
      const updated = await this.prisma.itemAttribute.updateMany({
        where: {
          id: attributeId,
          tenantId, // tenant_id guard
          version, // optimistic lock
        },
        data: {
          isActive,
          version: version + 1,
          updatedByLoginAccountId: updatedBy,
        },
      });

      if (updated.count === 0) {
        return null;
      }

      return this.prisma.itemAttribute.findFirst({
        where: {
          id: attributeId,
          tenantId,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * 仕様属性コード重複チェック
   */
  async checkCodeDuplicate(params: {
    tenantId: string;
    attributeCode: string;
    excludeId?: string; // 更新時は自分自身を除外
  }): Promise<boolean> {
    const { tenantId, attributeCode, excludeId } = params;

    const where: Prisma.ItemAttributeWhereInput = {
      tenantId, // tenant_id guard
      itemAttributeCode: attributeCode,
    };

    // 更新時は自分自身を除外
    if (excludeId) {
      where.id = { not: excludeId };
    }

    const count = await this.prisma.itemAttribute.count({ where });
    return count > 0;
  }

  /**
   * 属性値件数取得
   */
  async countValues(params: {
    tenantId: string;
    attributeId: string;
  }): Promise<number> {
    const { tenantId, attributeId } = params;

    return this.prisma.itemAttributeValue.count({
      where: {
        tenantId,
        itemAttributeId: attributeId,
      },
    });
  }

  /**
   * 仕様属性サジェスト（前方一致検索）
   */
  async suggest(params: {
    tenantId: string;
    keyword: string;
    limit: number;
  }): Promise<ItemAttribute[]> {
    const { tenantId, keyword, limit } = params;

    const where: Prisma.ItemAttributeWhereInput = {
      tenantId,
      isActive: true, // 有効なもののみ
      OR: [
        { itemAttributeCode: { startsWith: keyword, mode: 'insensitive' } },
        { itemAttributeName: { startsWith: keyword, mode: 'insensitive' } },
      ],
    };

    return this.prisma.itemAttribute.findMany({
      where,
      take: limit,
      orderBy: { sortOrder: 'asc' },
    });
  }

  /**
   * SKU仕様で使用中かチェック（将来の拡張用）
   * TODO: SKU仕様テーブル実装後に実装
   */
  async isUsedByVariants(params: {
    tenantId: string;
    attributeId: string;
  }): Promise<{ isUsed: boolean; usageCount: number }> {
    // 将来: SKU仕様のattributeIdを参照してチェック
    // const { tenantId, attributeId } = params;
    // const count = await this.prisma.skuSpecification.count({
    //   where: { tenantId, itemAttributeId: attributeId },
    // });
    // return { isUsed: count > 0, usageCount: count };
    return { isUsed: false, usageCount: 0 }; // 現時点では常にfalse（未使用）
  }

  /**
   * Prisma instance getter（トランザクション用）
   */
  getPrisma(): PrismaService {
    return this.prisma;
  }
}
