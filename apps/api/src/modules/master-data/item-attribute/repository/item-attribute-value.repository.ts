import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { Prisma, ItemAttributeValue, ItemAttribute } from '@prisma/client';
import {
  ItemAttributeValueSortBy,
  SortOrder,
} from '@procure/contracts/api/item-attribute';

/**
 * ItemAttributeValue Repository
 *
 * DBアクセス層（tenant_id double-guard）
 * - すべてのメソッドは tenant_id を必須パラメータとして受け取る
 * - WHERE句に必ず tenant_id を含める
 * - RLS + アプリケーション層の二重ガード
 */
@Injectable()
export class ItemAttributeValueRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 属性値一覧取得
   */
  async findMany(params: {
    tenantId: string;
    attributeId: string;
    offset: number;
    limit: number;
    sortBy?: ItemAttributeValueSortBy;
    sortOrder?: SortOrder;
    keyword?: string;
    isActive?: boolean;
  }): Promise<{ items: ItemAttributeValue[]; total: number }> {
    const { tenantId, attributeId, offset, limit, sortBy, sortOrder, keyword, isActive } = params;

    // tenant_id double-guard: WHERE句に必ず含める
    const where: Prisma.ItemAttributeValueWhereInput = {
      tenantId, // tenant_id guard
      itemAttributeId: attributeId, // 親属性フィルタ
    };

    // 有効/無効フィルタ
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // キーワード検索: 部分一致（Case-insensitive）
    if (keyword) {
      where.OR = [
        { valueCode: { contains: keyword, mode: 'insensitive' } },
        { valueName: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    // ソートフィールドのマッピング（DTO → DB column）
    let orderBy: Prisma.ItemAttributeValueOrderByWithRelationInput;
    const sortDirection = sortOrder || 'asc';

    switch (sortBy) {
      case 'valueCode':
        orderBy = { valueCode: sortDirection };
        break;
      case 'valueName':
        orderBy = { valueName: sortDirection };
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
      this.prisma.itemAttributeValue.findMany({
        where,
        orderBy,
        skip: offset,
        take: limit,
      }),
      this.prisma.itemAttributeValue.count({ where }),
    ]);

    return { items, total };
  }

  /**
   * 属性値詳細取得
   */
  async findOne(params: {
    tenantId: string;
    valueId: string;
  }): Promise<(ItemAttributeValue & { itemAttribute: ItemAttribute }) | null> {
    const { tenantId, valueId } = params;

    // tenant_id double-guard: WHERE句に必ず含める
    return this.prisma.itemAttributeValue.findFirst({
      where: {
        id: valueId,
        tenantId, // tenant_id guard
      },
      include: {
        itemAttribute: true,
      },
    });
  }

  /**
   * 属性値新規登録
   */
  async create(params: {
    tenantId: string;
    createdBy: string;
    data: {
      attributeId: string;
      valueCode: string;
      valueName: string;
      sortOrder?: number;
    };
  }): Promise<ItemAttributeValue> {
    const { tenantId, createdBy, data } = params;

    return this.prisma.itemAttributeValue.create({
      data: {
        tenantId, // tenant_id設定
        itemAttributeId: data.attributeId,
        valueCode: data.valueCode,
        valueName: data.valueName,
        sortOrder: data.sortOrder ?? 0,
        isActive: true,
        version: 1, // 初期バージョン
        createdByLoginAccountId: createdBy, // 監査列
        updatedByLoginAccountId: createdBy, // 監査列（作成時は同じ）
      },
    });
  }

  /**
   * 属性値更新（楽観ロック）
   */
  async update(params: {
    tenantId: string;
    valueId: string;
    version: number;
    updatedBy: string;
    data: {
      valueName: string;
      sortOrder?: number;
    };
  }): Promise<ItemAttributeValue | null> {
    const { tenantId, valueId, version, updatedBy, data } = params;

    try {
      const updated = await this.prisma.itemAttributeValue.updateMany({
        where: {
          id: valueId,
          tenantId, // tenant_id guard
          version, // optimistic lock
        },
        data: {
          valueName: data.valueName,
          sortOrder: data.sortOrder,
          version: version + 1, // version increment
          updatedByLoginAccountId: updatedBy, // 監査列
        },
      });

      if (updated.count === 0) {
        return null;
      }

      // 更新後のデータを取得
      return this.prisma.itemAttributeValue.findFirst({
        where: {
          id: valueId,
          tenantId,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * 属性値有効化/無効化（楽観ロック）
   */
  async setActive(params: {
    tenantId: string;
    valueId: string;
    version: number;
    updatedBy: string;
    isActive: boolean;
  }): Promise<ItemAttributeValue | null> {
    const { tenantId, valueId, version, updatedBy, isActive } = params;

    try {
      const updated = await this.prisma.itemAttributeValue.updateMany({
        where: {
          id: valueId,
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

      return this.prisma.itemAttributeValue.findFirst({
        where: {
          id: valueId,
          tenantId,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * 属性値コード重複チェック（同一属性内）
   */
  async checkCodeDuplicate(params: {
    tenantId: string;
    attributeId: string;
    valueCode: string;
    excludeId?: string; // 更新時は自分自身を除外
  }): Promise<boolean> {
    const { tenantId, attributeId, valueCode, excludeId } = params;

    const where: Prisma.ItemAttributeValueWhereInput = {
      tenantId, // tenant_id guard
      itemAttributeId: attributeId,
      valueCode,
    };

    // 更新時は自分自身を除外
    if (excludeId) {
      where.id = { not: excludeId };
    }

    const count = await this.prisma.itemAttributeValue.count({ where });
    return count > 0;
  }

  /**
   * 属性値サジェスト（前方一致検索）
   */
  async suggest(params: {
    tenantId: string;
    attributeId?: string;
    keyword: string;
    limit: number;
  }): Promise<(ItemAttributeValue & { itemAttribute: ItemAttribute })[]> {
    const { tenantId, attributeId, keyword, limit } = params;

    const where: Prisma.ItemAttributeValueWhereInput = {
      tenantId,
      isActive: true, // 有効なもののみ
      OR: [
        { valueCode: { startsWith: keyword, mode: 'insensitive' } },
        { valueName: { startsWith: keyword, mode: 'insensitive' } },
      ],
    };

    if (attributeId) {
      where.itemAttributeId = attributeId;
    }

    return this.prisma.itemAttributeValue.findMany({
      where,
      take: limit,
      orderBy: { sortOrder: 'asc' },
      include: {
        itemAttribute: true,
      },
    });
  }

  /**
   * SKU仕様で使用中かチェック（将来の拡張用）
   * TODO: SKU仕様テーブル実装後に実装
   */
  async isUsedByVariants(params: {
    tenantId: string;
    valueId: string;
  }): Promise<{ isUsed: boolean; usageCount: number }> {
    // 将来: SKU仕様のvalueIdを参照してチェック
    // const { tenantId, valueId } = params;
    // const count = await this.prisma.skuSpecificationValue.count({
    //   where: { tenantId, itemAttributeValueId: valueId },
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
