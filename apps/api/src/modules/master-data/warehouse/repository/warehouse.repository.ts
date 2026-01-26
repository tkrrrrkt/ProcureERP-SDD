import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { Prisma, Warehouse } from '@prisma/client';
import { WarehouseSortBy, SortOrder } from '@procure/contracts/api/warehouse';

/**
 * Warehouse Repository
 *
 * DBアクセス層（tenant_id double-guard）
 * - すべてのメソッドは tenant_id を必須パラメータとして受け取る
 * - WHERE句に必ず tenant_id を含める
 * - RLS + アプリケーション層の二重ガード
 */
@Injectable()
export class WarehouseRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 倉庫一覧取得
   */
  async findMany(params: {
    tenantId: string;
    offset: number;
    limit: number;
    sortBy?: WarehouseSortBy;
    sortOrder?: SortOrder;
    keyword?: string;
    isActive?: boolean;
  }): Promise<{ items: Warehouse[]; total: number }> {
    const { tenantId, offset, limit, sortBy, sortOrder, keyword, isActive } =
      params;

    // tenant_id double-guard: WHERE句に必ず含める
    const where: Prisma.WarehouseWhereInput = {
      tenantId, // tenant_id guard
    };

    // isActive フィルタ
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // キーワード検索: 部分一致（Case-insensitive）
    if (keyword) {
      where.OR = [
        { warehouseCode: { contains: keyword, mode: 'insensitive' } },
        { warehouseName: { contains: keyword, mode: 'insensitive' } },
        { warehouseNameKana: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    // ソートフィールドのマッピング
    const sortField = sortBy || 'displayOrder';
    const sortDirection = sortOrder || 'asc';

    const orderBy: Prisma.WarehouseOrderByWithRelationInput = {
      [sortField]: sortDirection,
    };

    // 並列実行: データ取得と総件数取得
    const [items, total] = await Promise.all([
      this.prisma.warehouse.findMany({
        where,
        orderBy,
        skip: offset,
        take: limit,
      }),
      this.prisma.warehouse.count({ where }),
    ]);

    return { items, total };
  }

  /**
   * 倉庫詳細取得
   */
  async findOne(params: {
    tenantId: string;
    warehouseId: string;
  }): Promise<Warehouse | null> {
    const { tenantId, warehouseId } = params;

    // tenant_id double-guard: WHERE句に必ず含める
    return this.prisma.warehouse.findFirst({
      where: {
        id: warehouseId,
        tenantId, // tenant_id guard
      },
    });
  }

  /**
   * 倉庫コード検索
   */
  async findByCode(params: {
    tenantId: string;
    warehouseCode: string;
  }): Promise<Warehouse | null> {
    const { tenantId, warehouseCode } = params;

    // tenant_id double-guard: WHERE句に必ず含める
    return this.prisma.warehouse.findFirst({
      where: {
        tenantId, // tenant_id guard
        warehouseCode,
      },
    });
  }

  /**
   * 既定受入倉庫取得
   */
  async findDefaultReceiving(params: {
    tenantId: string;
  }): Promise<Warehouse | null> {
    const { tenantId } = params;

    return this.prisma.warehouse.findFirst({
      where: {
        tenantId, // tenant_id guard
        isDefaultReceiving: true,
        isActive: true,
      },
    });
  }

  /**
   * 倉庫新規登録
   */
  async create(params: {
    tenantId: string;
    createdBy: string;
    data: {
      warehouseCode: string;
      warehouseName: string;
      warehouseNameKana?: string;
      warehouseGroupId?: string;
      postalCode?: string;
      prefecture?: string;
      city?: string;
      address1?: string;
      address2?: string;
      phoneNumber?: string;
      isDefaultReceiving?: boolean;
      displayOrder?: number;
      notes?: string;
      isActive?: boolean;
    };
  }): Promise<Warehouse> {
    const { tenantId, createdBy, data } = params;

    return this.prisma.warehouse.create({
      data: {
        tenantId, // tenant_id設定
        warehouseCode: data.warehouseCode,
        warehouseName: data.warehouseName,
        warehouseNameKana: data.warehouseNameKana ?? null,
        warehouseGroupId: data.warehouseGroupId ?? null,
        postalCode: data.postalCode ?? null,
        prefecture: data.prefecture ?? null,
        city: data.city ?? null,
        address1: data.address1 ?? null,
        address2: data.address2 ?? null,
        phoneNumber: data.phoneNumber ?? null,
        isDefaultReceiving: data.isDefaultReceiving ?? false,
        displayOrder: data.displayOrder ?? 1000,
        notes: data.notes ?? null,
        isActive: data.isActive ?? true,
        version: 1, // 初期バージョン
        createdByLoginAccountId: createdBy, // 監査列
        updatedByLoginAccountId: createdBy, // 監査列（作成時は同じ）
      },
    });
  }

  /**
   * 倉庫更新（楽観ロック）
   */
  async update(params: {
    tenantId: string;
    warehouseId: string;
    version: number;
    updatedBy: string;
    data: {
      warehouseName: string;
      warehouseNameKana?: string;
      warehouseGroupId?: string | null;
      postalCode?: string;
      prefecture?: string;
      city?: string;
      address1?: string;
      address2?: string;
      phoneNumber?: string;
      isDefaultReceiving: boolean;
      displayOrder: number;
      notes?: string;
      isActive: boolean;
    };
  }): Promise<Warehouse | null> {
    const { tenantId, warehouseId, version, updatedBy, data } = params;

    // 楽観ロック: WHERE句に version を含める
    // tenant_id double-guard: WHERE句に tenantId を含める
    const updated = await this.prisma.warehouse.updateMany({
      where: {
        id: warehouseId,
        tenantId, // tenant_id guard
        version, // optimistic lock
      },
      data: {
        warehouseName: data.warehouseName,
        warehouseNameKana: data.warehouseNameKana ?? null,
        warehouseGroupId: data.warehouseGroupId,
        postalCode: data.postalCode ?? null,
        prefecture: data.prefecture ?? null,
        city: data.city ?? null,
        address1: data.address1 ?? null,
        address2: data.address2 ?? null,
        phoneNumber: data.phoneNumber ?? null,
        isDefaultReceiving: data.isDefaultReceiving,
        displayOrder: data.displayOrder,
        notes: data.notes ?? null,
        isActive: data.isActive,
        version: version + 1, // version increment
        updatedByLoginAccountId: updatedBy, // 監査列
      },
    });

    // 更新件数が0の場合は競合（または存在しない）
    if (updated.count === 0) {
      return null;
    }

    // 更新後のデータを取得
    return this.findOne({ tenantId, warehouseId });
  }

  /**
   * 既定受入倉庫設定（トランザクション）
   */
  async setDefaultReceiving(params: {
    tenantId: string;
    warehouseId: string;
    version: number;
    updatedBy: string;
  }): Promise<{
    updated: Warehouse | null;
    previousDefault: Warehouse | null;
  }> {
    const { tenantId, warehouseId, version, updatedBy } = params;

    return this.prisma.$transaction(async (tx) => {
      // 既存の既定受入倉庫を取得
      const previousDefault = await tx.warehouse.findFirst({
        where: {
          tenantId,
          isDefaultReceiving: true,
          isActive: true,
        },
      });

      // 既存の既定を解除
      if (previousDefault && previousDefault.id !== warehouseId) {
        await tx.warehouse.update({
          where: { id: previousDefault.id },
          data: {
            isDefaultReceiving: false,
            updatedByLoginAccountId: updatedBy,
          },
        });
      }

      // 新しい既定を設定（楽観ロック）
      const result = await tx.warehouse.updateMany({
        where: {
          id: warehouseId,
          tenantId,
          version,
        },
        data: {
          isDefaultReceiving: true,
          version: version + 1,
          updatedByLoginAccountId: updatedBy,
        },
      });

      if (result.count === 0) {
        return { updated: null, previousDefault };
      }

      const updated = await tx.warehouse.findUnique({
        where: { id: warehouseId },
      });

      return { updated, previousDefault };
    });
  }

  /**
   * 倉庫コード重複チェック
   */
  async checkCodeDuplicate(params: {
    tenantId: string;
    warehouseCode: string;
    excludeWarehouseId?: string; // 更新時は自分自身を除外
  }): Promise<boolean> {
    const { tenantId, warehouseCode, excludeWarehouseId } = params;

    const where: Prisma.WarehouseWhereInput = {
      tenantId, // tenant_id guard
      warehouseCode,
    };

    // 更新時は自分自身を除外
    if (excludeWarehouseId) {
      where.id = { not: excludeWarehouseId };
    }

    const count = await this.prisma.warehouse.count({ where });
    return count > 0;
  }

  /**
   * 倉庫グループ存在チェック
   */
  async checkWarehouseGroupExists(params: {
    tenantId: string;
    warehouseGroupId: string;
  }): Promise<boolean> {
    const { tenantId, warehouseGroupId } = params;

    const count = await this.prisma.warehouseGroup.count({
      where: {
        id: warehouseGroupId,
        tenantId,
        isActive: true,
      },
    });

    return count > 0;
  }
}
