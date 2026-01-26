import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { Prisma, TaxCode, TaxRate, TaxBusinessCategory } from '@prisma/client';
import { TaxCodeSortBy, SortOrder, TaxInOut } from '@procure/contracts/api/tax-code';

/**
 * TaxCode with relations type
 */
export type TaxCodeWithRelations = TaxCode & {
  taxBusinessCategory: TaxBusinessCategory;
  taxRate: TaxRate;
};

/**
 * Tax Code Repository
 *
 * DBアクセス層（tenant_id double-guard）
 * - すべてのメソッドは tenant_id を必須パラメータとして受け取る
 * - WHERE句に必ず tenant_id を含める
 * - RLS + アプリケーション層の二重ガード
 */
@Injectable()
export class TaxCodeRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 税コード一覧取得
   */
  async findMany(params: {
    tenantId: string;
    offset: number;
    limit: number;
    sortBy?: TaxCodeSortBy;
    sortOrder?: SortOrder;
    keyword?: string;
    taxBusinessCategoryId?: string;
    isActive?: boolean;
  }): Promise<{ items: TaxCodeWithRelations[]; total: number }> {
    const {
      tenantId,
      offset,
      limit,
      sortBy,
      sortOrder,
      keyword,
      taxBusinessCategoryId,
      isActive,
    } = params;

    // tenant_id double-guard: WHERE句に必ず含める
    const where: Prisma.TaxCodeWhereInput = {
      tenantId, // tenant_id guard
    };

    // キーワード検索: 税コード部分一致
    if (keyword) {
      where.taxCode = { contains: keyword, mode: 'insensitive' };
    }

    // 税区分フィルタ
    if (taxBusinessCategoryId) {
      where.taxBusinessCategoryId = taxBusinessCategoryId;
    }

    // 有効フラグでフィルタ
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // ソートフィールドのマッピング
    const sortField = sortBy || 'taxCode';
    const sortDirection = sortOrder || 'asc';

    // リレーション経由のソート対応
    let orderBy: Prisma.TaxCodeOrderByWithRelationInput;
    if (sortField === 'taxBusinessCategoryName') {
      orderBy = {
        taxBusinessCategory: { taxBusinessCategoryName: sortDirection },
      };
    } else if (sortField === 'ratePercent') {
      orderBy = {
        taxRate: { ratePercent: sortDirection },
      };
    } else {
      orderBy = { [sortField]: sortDirection };
    }

    // 並列実行: データ取得と総件数取得
    const [items, total] = await Promise.all([
      this.prisma.taxCode.findMany({
        where,
        orderBy,
        skip: offset,
        take: limit,
        include: {
          taxBusinessCategory: true,
          taxRate: true,
        },
      }),
      this.prisma.taxCode.count({ where }),
    ]);

    return { items, total };
  }

  /**
   * 税コード詳細取得（ID指定）
   */
  async findById(params: {
    tenantId: string;
    taxCodeId: string;
  }): Promise<TaxCodeWithRelations | null> {
    const { tenantId, taxCodeId } = params;

    // tenant_id double-guard: WHERE句に必ず含める
    return this.prisma.taxCode.findFirst({
      where: {
        id: taxCodeId,
        tenantId, // tenant_id guard
      },
      include: {
        taxBusinessCategory: true,
        taxRate: true,
      },
    });
  }

  /**
   * 税コード取得（税コード指定）- 重複チェック用
   */
  async findByCode(params: {
    tenantId: string;
    taxCode: string;
  }): Promise<TaxCode | null> {
    const { tenantId, taxCode } = params;

    return this.prisma.taxCode.findFirst({
      where: {
        tenantId, // tenant_id guard
        taxCode,
      },
    });
  }

  /**
   * 税コード新規登録
   */
  async create(params: {
    tenantId: string;
    createdBy: string;
    data: {
      taxCode: string;
      taxBusinessCategoryId: string;
      taxRateId: string;
      taxInOut: TaxInOut;
      isActive?: boolean;
    };
  }): Promise<TaxCodeWithRelations> {
    const { tenantId, createdBy, data } = params;

    const created = await this.prisma.taxCode.create({
      data: {
        tenantId, // tenant_id設定
        taxCode: data.taxCode,
        taxBusinessCategoryId: data.taxBusinessCategoryId,
        taxRateId: data.taxRateId,
        taxInOut: data.taxInOut,
        isActive: data.isActive ?? true,
        version: 1, // 初期バージョン
        createdByLoginAccountId: createdBy, // 監査列
        updatedByLoginAccountId: createdBy, // 監査列（作成時は同じ）
      },
      include: {
        taxBusinessCategory: true,
        taxRate: true,
      },
    });

    return created;
  }

  /**
   * 税コード更新（楽観ロック）
   * Note: taxCode, taxBusinessCategoryId, taxRateId, taxInOut は更新不可
   */
  async update(params: {
    tenantId: string;
    taxCodeId: string;
    version: number;
    updatedBy: string;
    data: {
      isActive: boolean;
    };
  }): Promise<TaxCodeWithRelations | null> {
    const { tenantId, taxCodeId, version, updatedBy, data } = params;

    try {
      // 楽観ロック: WHERE句に version を含める
      // tenant_id double-guard: WHERE句に tenantId を含める
      const updated = await this.prisma.taxCode.updateMany({
        where: {
          id: taxCodeId,
          tenantId, // tenant_id guard
          version, // optimistic lock
        },
        data: {
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
      return this.findById({ tenantId, taxCodeId });
    } catch (error) {
      throw error;
    }
  }

  /**
   * 税コード無効化（楽観ロック）
   */
  async deactivate(params: {
    tenantId: string;
    taxCodeId: string;
    version: number;
    updatedBy: string;
  }): Promise<TaxCodeWithRelations | null> {
    const { tenantId, taxCodeId, version, updatedBy } = params;

    const updated = await this.prisma.taxCode.updateMany({
      where: {
        id: taxCodeId,
        tenantId, // tenant_id guard
        version, // optimistic lock
      },
      data: {
        isActive: false,
        version: version + 1,
        updatedByLoginAccountId: updatedBy,
      },
    });

    if (updated.count === 0) {
      return null;
    }

    return this.findById({ tenantId, taxCodeId });
  }

  /**
   * 税コード有効化（楽観ロック）
   */
  async activate(params: {
    tenantId: string;
    taxCodeId: string;
    version: number;
    updatedBy: string;
  }): Promise<TaxCodeWithRelations | null> {
    const { tenantId, taxCodeId, version, updatedBy } = params;

    const updated = await this.prisma.taxCode.updateMany({
      where: {
        id: taxCodeId,
        tenantId, // tenant_id guard
        version, // optimistic lock
      },
      data: {
        isActive: true,
        version: version + 1,
        updatedByLoginAccountId: updatedBy,
      },
    });

    if (updated.count === 0) {
      return null;
    }

    return this.findById({ tenantId, taxCodeId });
  }

  /**
   * 税コード重複チェック
   */
  async checkTaxCodeDuplicate(params: {
    tenantId: string;
    taxCode: string;
    excludeTaxCodeId?: string; // 更新時は自分自身を除外
  }): Promise<boolean> {
    const { tenantId, taxCode, excludeTaxCodeId } = params;

    const where: Prisma.TaxCodeWhereInput = {
      tenantId, // tenant_id guard
      taxCode,
    };

    // 更新時は自分自身を除外
    if (excludeTaxCodeId) {
      where.id = { not: excludeTaxCodeId };
    }

    const count = await this.prisma.taxCode.count({ where });
    return count > 0;
  }
}
