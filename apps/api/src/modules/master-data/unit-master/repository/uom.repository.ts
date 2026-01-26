import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { Prisma, Uom } from '@prisma/client';
import {
  UomSortBy,
  SortOrder,
} from '@procure/contracts/api/unit-master';

/**
 * Uom Repository
 *
 * DBアクセス層（tenant_id double-guard）
 * - すべてのメソッドは tenant_id を必須パラメータとして受け取る
 * - WHERE句に必ず tenant_id を含める
 * - RLS + アプリケーション層の二重ガード
 */
@Injectable()
export class UomRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 単位一覧取得
   */
  async findMany(params: {
    tenantId: string;
    offset: number;
    limit: number;
    sortBy?: UomSortBy;
    sortOrder?: SortOrder;
    keyword?: string;
    groupId?: string;
    isActive?: boolean;
  }): Promise<{ items: (Uom & { uomGroup: { uomGroupCode: string } })[]; total: number }> {
    const { tenantId, offset, limit, sortBy, sortOrder, keyword, groupId, isActive } = params;

    // tenant_id double-guard: WHERE句に必ず含める
    const where: Prisma.UomWhereInput = {
      tenantId, // tenant_id guard
    };

    // グループフィルタ
    if (groupId) {
      where.uomGroupId = groupId;
    }

    // 有効/無効フィルタ
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // キーワード検索: 部分一致（Case-insensitive）
    if (keyword) {
      where.OR = [
        { uomCode: { contains: keyword, mode: 'insensitive' } },
        { uomName: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    // ソートフィールドのマッピング（DTO → DB column）
    let orderBy: Prisma.UomOrderByWithRelationInput;
    const sortDirection = sortOrder || 'asc';

    switch (sortBy) {
      case 'groupCode':
        orderBy = { uomGroup: { uomGroupCode: sortDirection } };
        break;
      case 'uomName':
        orderBy = { uomName: sortDirection };
        break;
      case 'isActive':
        orderBy = { isActive: sortDirection };
        break;
      case 'uomCode':
      default:
        orderBy = { uomCode: sortDirection };
        break;
    }

    // 並列実行: データ取得と総件数取得
    const [items, total] = await Promise.all([
      this.prisma.uom.findMany({
        where,
        orderBy,
        skip: offset,
        take: limit,
        include: {
          uomGroup: {
            select: { uomGroupCode: true },
          },
        },
      }),
      this.prisma.uom.count({ where }),
    ]);

    return { items, total };
  }

  /**
   * 単位詳細取得
   */
  async findOne(params: {
    tenantId: string;
    uomId: string;
  }): Promise<(Uom & { uomGroup: { uomGroupCode: string; uomGroupName: string; baseUomId: string } }) | null> {
    const { tenantId, uomId } = params;

    // tenant_id double-guard: WHERE句に必ず含める
    return this.prisma.uom.findFirst({
      where: {
        id: uomId,
        tenantId, // tenant_id guard
      },
      include: {
        uomGroup: {
          select: {
            uomGroupCode: true,
            uomGroupName: true,
            baseUomId: true,
          },
        },
      },
    });
  }

  /**
   * 単位新規登録（トランザクション内で呼び出す）
   */
  async createInTransaction(
    tx: Prisma.TransactionClient,
    params: {
      tenantId: string;
      createdBy: string;
      data: {
        uomCode: string;
        uomName: string;
        uomSymbol?: string;
        groupId: string;
      };
    },
  ): Promise<Uom> {
    const { tenantId, createdBy, data } = params;

    return tx.uom.create({
      data: {
        tenantId, // tenant_id設定
        uomCode: data.uomCode,
        uomName: data.uomName,
        uomSymbol: data.uomSymbol ?? null,
        uomGroupId: data.groupId,
        isActive: true,
        version: 1, // 初期バージョン
        createdByLoginAccountId: createdBy, // 監査列
        updatedByLoginAccountId: createdBy, // 監査列（作成時は同じ）
      },
    });
  }

  /**
   * 単位新規登録（通常）
   */
  async create(params: {
    tenantId: string;
    createdBy: string;
    data: {
      uomCode: string;
      uomName: string;
      uomSymbol?: string;
      groupId: string;
    };
  }): Promise<Uom> {
    const { tenantId, createdBy, data } = params;

    return this.prisma.uom.create({
      data: {
        tenantId, // tenant_id設定
        uomCode: data.uomCode,
        uomName: data.uomName,
        uomSymbol: data.uomSymbol ?? null,
        uomGroupId: data.groupId,
        isActive: true,
        version: 1, // 初期バージョン
        createdByLoginAccountId: createdBy, // 監査列
        updatedByLoginAccountId: createdBy, // 監査列（作成時は同じ）
      },
    });
  }

  /**
   * 単位更新（楽観ロック）
   */
  async update(params: {
    tenantId: string;
    uomId: string;
    version: number;
    updatedBy: string;
    data: {
      uomName: string;
      uomSymbol?: string;
    };
  }): Promise<Uom | null> {
    const { tenantId, uomId, version, updatedBy, data } = params;

    try {
      const updated = await this.prisma.uom.updateMany({
        where: {
          id: uomId,
          tenantId, // tenant_id guard
          version, // optimistic lock
        },
        data: {
          uomName: data.uomName,
          uomSymbol: data.uomSymbol ?? null,
          version: version + 1, // version increment
          updatedByLoginAccountId: updatedBy, // 監査列
        },
      });

      if (updated.count === 0) {
        return null;
      }

      // 更新後のデータを取得（include無しで返す）
      return this.prisma.uom.findFirst({
        where: {
          id: uomId,
          tenantId,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * 単位有効化/無効化（楽観ロック）
   */
  async setActive(params: {
    tenantId: string;
    uomId: string;
    version: number;
    updatedBy: string;
    isActive: boolean;
  }): Promise<Uom | null> {
    const { tenantId, uomId, version, updatedBy, isActive } = params;

    try {
      const updated = await this.prisma.uom.updateMany({
        where: {
          id: uomId,
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

      return this.prisma.uom.findFirst({
        where: {
          id: uomId,
          tenantId,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * 単位コード重複チェック
   */
  async checkUomCodeDuplicate(params: {
    tenantId: string;
    uomCode: string;
    excludeUomId?: string; // 更新時は自分自身を除外
  }): Promise<boolean> {
    const { tenantId, uomCode, excludeUomId } = params;

    const where: Prisma.UomWhereInput = {
      tenantId, // tenant_id guard
      uomCode,
    };

    // 更新時は自分自身を除外
    if (excludeUomId) {
      where.id = { not: excludeUomId };
    }

    const count = await this.prisma.uom.count({ where });
    return count > 0;
  }

  /**
   * グループ内の単位を取得
   */
  async findByGroupId(params: {
    tenantId: string;
    groupId: string;
  }): Promise<Uom[]> {
    const { tenantId, groupId } = params;

    return this.prisma.uom.findMany({
      where: {
        tenantId,
        uomGroupId: groupId,
      },
    });
  }

  /**
   * 単位サジェスト（前方一致検索）
   */
  async suggest(params: {
    tenantId: string;
    keyword: string;
    groupId?: string;
    limit: number;
  }): Promise<(Uom & { uomGroup: { uomGroupCode: string } })[]> {
    const { tenantId, keyword, groupId, limit } = params;

    const where: Prisma.UomWhereInput = {
      tenantId,
      isActive: true, // 有効なもののみ
      OR: [
        { uomCode: { startsWith: keyword, mode: 'insensitive' } },
        { uomName: { startsWith: keyword, mode: 'insensitive' } },
      ],
    };

    if (groupId) {
      where.uomGroupId = groupId;
    }

    return this.prisma.uom.findMany({
      where,
      take: limit,
      orderBy: { uomCode: 'asc' },
      include: {
        uomGroup: {
          select: { uomGroupCode: true },
        },
      },
    });
  }

  /**
   * 品目で使用中かチェック（将来の拡張用）
   * TODO: 品目マスタ実装後に実装
   */
  async isUsedByItems(params: {
    tenantId: string;
    uomId: string;
  }): Promise<boolean> {
    // 将来: 品目マスタのuomIdを参照してチェック
    // const { tenantId, uomId } = params;
    // const count = await this.prisma.item.count({
    //   where: { tenantId, uomId },
    // });
    // return count > 0;
    return false; // 現時点では常にfalse（未使用）
  }

  /**
   * Prisma instance getter（トランザクション用）
   */
  getPrisma(): PrismaService {
    return this.prisma;
  }
}
