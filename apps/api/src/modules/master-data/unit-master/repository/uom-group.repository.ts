import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { Prisma, UomGroup, Uom } from '@prisma/client';
import {
  UomGroupSortBy,
  SortOrder,
} from '@procure/contracts/api/unit-master';

/**
 * UomGroup Repository
 *
 * DBアクセス層（tenant_id double-guard）
 * - すべてのメソッドは tenant_id を必須パラメータとして受け取る
 * - WHERE句に必ず tenant_id を含める
 * - RLS + アプリケーション層の二重ガード
 */
@Injectable()
export class UomGroupRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 単位グループ一覧取得
   */
  async findMany(params: {
    tenantId: string;
    offset: number;
    limit: number;
    sortBy?: UomGroupSortBy;
    sortOrder?: SortOrder;
    keyword?: string;
    isActive?: boolean;
  }): Promise<{ items: UomGroup[]; total: number }> {
    const { tenantId, offset, limit, sortBy, sortOrder, keyword, isActive } = params;

    // tenant_id double-guard: WHERE句に必ず含める
    const where: Prisma.UomGroupWhereInput = {
      tenantId, // tenant_id guard
    };

    // 有効/無効フィルタ
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // キーワード検索: 部分一致（Case-insensitive）
    if (keyword) {
      where.OR = [
        { uomGroupCode: { contains: keyword, mode: 'insensitive' } },
        { uomGroupName: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    // ソートフィールドのマッピング（DTO → DB column）
    const sortFieldMap: Record<UomGroupSortBy, keyof Prisma.UomGroupOrderByWithRelationInput> = {
      groupCode: 'uomGroupCode',
      groupName: 'uomGroupName',
      isActive: 'isActive',
    };
    const sortField = sortFieldMap[sortBy || 'groupCode'];
    const sortDirection = sortOrder || 'asc';

    const orderBy: Prisma.UomGroupOrderByWithRelationInput = {
      [sortField]: sortDirection,
    };

    // 並列実行: データ取得と総件数取得
    const [items, total] = await Promise.all([
      this.prisma.uomGroup.findMany({
        where,
        orderBy,
        skip: offset,
        take: limit,
      }),
      this.prisma.uomGroup.count({ where }),
    ]);

    return { items, total };
  }

  /**
   * 単位グループ詳細取得
   */
  async findOne(params: {
    tenantId: string;
    groupId: string;
  }): Promise<UomGroup | null> {
    const { tenantId, groupId } = params;

    // tenant_id double-guard: WHERE句に必ず含める
    return this.prisma.uomGroup.findFirst({
      where: {
        id: groupId,
        tenantId, // tenant_id guard
      },
    });
  }

  /**
   * 単位グループ新規登録（トランザクション内で呼び出す）
   * 注意：基準単位の同時作成が必要なため、通常はServiceからトランザクション経由で呼び出す
   */
  async createInTransaction(
    tx: Prisma.TransactionClient,
    params: {
      tenantId: string;
      createdBy: string;
      data: {
        groupCode: string;
        groupName: string;
        description?: string;
        baseUomId: string;
      };
    },
  ): Promise<UomGroup> {
    const { tenantId, createdBy, data } = params;

    return tx.uomGroup.create({
      data: {
        tenantId, // tenant_id設定
        uomGroupCode: data.groupCode,
        uomGroupName: data.groupName,
        description: data.description ?? null,
        baseUomId: data.baseUomId,
        isActive: true,
        version: 1, // 初期バージョン
        createdByLoginAccountId: createdBy, // 監査列
        updatedByLoginAccountId: createdBy, // 監査列（作成時は同じ）
      },
    });
  }

  /**
   * 単位グループ更新（楽観ロック）
   */
  async update(params: {
    tenantId: string;
    groupId: string;
    version: number;
    updatedBy: string;
    data: {
      groupName: string;
      description?: string;
      baseUomId?: string;
    };
  }): Promise<UomGroup | null> {
    const { tenantId, groupId, version, updatedBy, data } = params;

    try {
      // 楽観ロック: WHERE句に version を含める
      // tenant_id double-guard: WHERE句に tenantId を含める
      const updated = await this.prisma.uomGroup.updateMany({
        where: {
          id: groupId,
          tenantId, // tenant_id guard
          version, // optimistic lock
        },
        data: {
          uomGroupName: data.groupName,
          description: data.description ?? null,
          ...(data.baseUomId && { baseUomId: data.baseUomId }),
          version: version + 1, // version increment
          updatedByLoginAccountId: updatedBy, // 監査列
        },
      });

      // 更新件数が0の場合は競合（または存在しない）
      if (updated.count === 0) {
        return null;
      }

      // 更新後のデータを取得
      return this.findOne({ tenantId, groupId });
    } catch (error) {
      throw error;
    }
  }

  /**
   * 単位グループ有効化/無効化（楽観ロック）
   */
  async setActive(params: {
    tenantId: string;
    groupId: string;
    version: number;
    updatedBy: string;
    isActive: boolean;
  }): Promise<UomGroup | null> {
    const { tenantId, groupId, version, updatedBy, isActive } = params;

    try {
      const updated = await this.prisma.uomGroup.updateMany({
        where: {
          id: groupId,
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

      return this.findOne({ tenantId, groupId });
    } catch (error) {
      throw error;
    }
  }

  /**
   * 単位グループコード重複チェック
   */
  async checkGroupCodeDuplicate(params: {
    tenantId: string;
    groupCode: string;
    excludeGroupId?: string; // 更新時は自分自身を除外
  }): Promise<boolean> {
    const { tenantId, groupCode, excludeGroupId } = params;

    const where: Prisma.UomGroupWhereInput = {
      tenantId, // tenant_id guard
      uomGroupCode: groupCode,
    };

    // 更新時は自分自身を除外
    if (excludeGroupId) {
      where.id = { not: excludeGroupId };
    }

    const count = await this.prisma.uomGroup.count({ where });
    return count > 0;
  }

  /**
   * グループ内の有効な単位が存在するかチェック
   */
  async hasActiveUoms(params: {
    tenantId: string;
    groupId: string;
  }): Promise<boolean> {
    const { tenantId, groupId } = params;

    const count = await this.prisma.uom.count({
      where: {
        tenantId,
        uomGroupId: groupId,
        isActive: true,
      },
    });

    return count > 0;
  }

  /**
   * Prisma instance getter（トランザクション用）
   */
  getPrisma(): PrismaService {
    return this.prisma;
  }
}
