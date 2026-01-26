import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { Prisma, ShipTo } from '@prisma/client';
import { ShipToSortBy, SortOrder } from '@procure/contracts/api/ship-to';

/**
 * ShipTo Repository
 *
 * DBアクセス層（tenant_id double-guard）
 * - すべてのメソッドは tenant_id を必須パラメータとして受け取る
 * - WHERE句に必ず tenant_id を含める
 * - RLS + アプリケーション層の二重ガード
 */
@Injectable()
export class ShipToRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 納入先一覧取得
   */
  async findMany(params: {
    tenantId: string;
    offset: number;
    limit: number;
    sortBy?: ShipToSortBy;
    sortOrder?: SortOrder;
    keyword?: string;
    isActive?: boolean;
  }): Promise<{ items: ShipTo[]; total: number }> {
    const { tenantId, offset, limit, sortBy, sortOrder, keyword, isActive } =
      params;

    // tenant_id double-guard: WHERE句に必ず含める
    const where: Prisma.ShipToWhereInput = {
      tenantId, // tenant_id guard
    };

    // isActive フィルタ
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // キーワード検索: 部分一致（Case-insensitive）
    // 対象: shipToCode, shipToName, shipToNameKana
    if (keyword) {
      where.OR = [
        { shipToCode: { contains: keyword, mode: 'insensitive' } },
        { shipToName: { contains: keyword, mode: 'insensitive' } },
        { shipToNameKana: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    // ソートフィールドのマッピング
    const sortField = sortBy || 'shipToCode';
    const sortDirection = sortOrder || 'asc';

    const orderBy: Prisma.ShipToOrderByWithRelationInput = {
      [sortField]: sortDirection,
    };

    // 並列実行: データ取得と総件数取得
    const [items, total] = await Promise.all([
      this.prisma.shipTo.findMany({
        where,
        orderBy,
        skip: offset,
        take: limit,
      }),
      this.prisma.shipTo.count({ where }),
    ]);

    return { items, total };
  }

  /**
   * 納入先詳細取得
   */
  async findOne(params: {
    tenantId: string;
    shipToId: string;
  }): Promise<ShipTo | null> {
    const { tenantId, shipToId } = params;

    // tenant_id double-guard: WHERE句に必ず含める
    return this.prisma.shipTo.findFirst({
      where: {
        id: shipToId,
        tenantId, // tenant_id guard
      },
    });
  }

  /**
   * 納入先コード検索
   */
  async findByCode(params: {
    tenantId: string;
    shipToCode: string;
  }): Promise<ShipTo | null> {
    const { tenantId, shipToCode } = params;

    // tenant_id double-guard: WHERE句に必ず含める
    return this.prisma.shipTo.findFirst({
      where: {
        tenantId, // tenant_id guard
        shipToCode,
      },
    });
  }

  /**
   * 納入先新規登録
   */
  async create(params: {
    tenantId: string;
    createdBy: string;
    data: {
      shipToCode: string;
      shipToName: string;
      shipToNameKana?: string;
      customerSiteId?: string;
      postalCode?: string;
      prefecture?: string;
      city?: string;
      address1?: string;
      address2?: string;
      phoneNumber?: string;
      faxNumber?: string;
      email?: string;
      contactPerson?: string;
      remarks?: string;
      isActive?: boolean;
    };
  }): Promise<ShipTo> {
    const { tenantId, createdBy, data } = params;

    return this.prisma.shipTo.create({
      data: {
        tenantId, // tenant_id設定
        shipToCode: data.shipToCode,
        shipToName: data.shipToName,
        shipToNameKana: data.shipToNameKana ?? null,
        customerSiteId: data.customerSiteId ?? null,
        postalCode: data.postalCode ?? null,
        prefecture: data.prefecture ?? null,
        city: data.city ?? null,
        address1: data.address1 ?? null,
        address2: data.address2 ?? null,
        phoneNumber: data.phoneNumber ?? null,
        faxNumber: data.faxNumber ?? null,
        email: data.email ?? null,
        contactPerson: data.contactPerson ?? null,
        remarks: data.remarks ?? null,
        isActive: data.isActive ?? true,
        version: 1, // 初期バージョン
        createdByLoginAccountId: createdBy, // 監査列
        updatedByLoginAccountId: createdBy, // 監査列（作成時は同じ）
      },
    });
  }

  /**
   * 納入先更新（楽観ロック）
   */
  async update(params: {
    tenantId: string;
    shipToId: string;
    version: number;
    updatedBy: string;
    data: {
      shipToName: string;
      shipToNameKana?: string;
      customerSiteId?: string | null;
      postalCode?: string;
      prefecture?: string;
      city?: string;
      address1?: string;
      address2?: string;
      phoneNumber?: string;
      faxNumber?: string;
      email?: string;
      contactPerson?: string;
      remarks?: string;
      isActive: boolean;
    };
  }): Promise<ShipTo | null> {
    const { tenantId, shipToId, version, updatedBy, data } = params;

    // 楽観ロック: WHERE句に version を含める
    // tenant_id double-guard: WHERE句に tenantId を含める
    const updated = await this.prisma.shipTo.updateMany({
      where: {
        id: shipToId,
        tenantId, // tenant_id guard
        version, // optimistic lock
      },
      data: {
        shipToName: data.shipToName,
        shipToNameKana: data.shipToNameKana ?? null,
        customerSiteId: data.customerSiteId,
        postalCode: data.postalCode ?? null,
        prefecture: data.prefecture ?? null,
        city: data.city ?? null,
        address1: data.address1 ?? null,
        address2: data.address2 ?? null,
        phoneNumber: data.phoneNumber ?? null,
        faxNumber: data.faxNumber ?? null,
        email: data.email ?? null,
        contactPerson: data.contactPerson ?? null,
        remarks: data.remarks ?? null,
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
    return this.findOne({ tenantId, shipToId });
  }

  /**
   * 納入先コード重複チェック
   */
  async checkShipToCodeDuplicate(params: {
    tenantId: string;
    shipToCode: string;
    excludeShipToId?: string; // 更新時は自分自身を除外
  }): Promise<boolean> {
    const { tenantId, shipToCode, excludeShipToId } = params;

    const where: Prisma.ShipToWhereInput = {
      tenantId, // tenant_id guard
      shipToCode,
    };

    // 更新時は自分自身を除外
    if (excludeShipToId) {
      where.id = { not: excludeShipToId };
    }

    const count = await this.prisma.shipTo.count({ where });
    return count > 0;
  }
}
