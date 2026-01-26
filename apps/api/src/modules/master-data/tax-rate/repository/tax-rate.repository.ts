import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { Prisma, TaxRate } from '@prisma/client';
import { TaxRateSortBy, SortOrder } from '@procure/contracts/api/tax-rate';

/**
 * Tax Rate Repository
 *
 * DBアクセス層（tenant_id double-guard）
 * - すべてのメソッドは tenant_id を必須パラメータとして受け取る
 * - WHERE句に必ず tenant_id を含める
 * - RLS + アプリケーション層の二重ガード
 */
@Injectable()
export class TaxRateRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 税率一覧取得
   */
  async findMany(params: {
    tenantId: string;
    offset: number;
    limit: number;
    sortBy?: TaxRateSortBy;
    sortOrder?: SortOrder;
    keyword?: string;
    isActive?: boolean;
  }): Promise<{ items: TaxRate[]; total: number }> {
    const { tenantId, offset, limit, sortBy, sortOrder, keyword, isActive } = params;

    // tenant_id double-guard: WHERE句に必ず含める
    const where: Prisma.TaxRateWhereInput = {
      tenantId, // tenant_id guard
    };

    // キーワード検索: 税率コード部分一致
    if (keyword) {
      where.taxRateCode = { contains: keyword, mode: 'insensitive' };
    }

    // 有効フラグでフィルタ
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // ソートフィールドのマッピング
    const sortField = sortBy || 'taxRateCode';
    const sortDirection = sortOrder || 'asc';

    const orderBy: Prisma.TaxRateOrderByWithRelationInput = {
      [sortField]: sortDirection,
    };

    // 並列実行: データ取得と総件数取得
    const [items, total] = await Promise.all([
      this.prisma.taxRate.findMany({
        where,
        orderBy,
        skip: offset,
        take: limit,
      }),
      this.prisma.taxRate.count({ where }),
    ]);

    return { items, total };
  }

  /**
   * 税率詳細取得（ID指定）
   */
  async findById(params: {
    tenantId: string;
    taxRateId: string;
  }): Promise<TaxRate | null> {
    const { tenantId, taxRateId } = params;

    // tenant_id double-guard: WHERE句に必ず含める
    return this.prisma.taxRate.findFirst({
      where: {
        id: taxRateId,
        tenantId, // tenant_id guard
      },
    });
  }

  /**
   * 税率取得（税率コード指定）- 重複チェック用
   */
  async findByCode(params: {
    tenantId: string;
    taxRateCode: string;
  }): Promise<TaxRate | null> {
    const { tenantId, taxRateCode } = params;

    return this.prisma.taxRate.findFirst({
      where: {
        tenantId, // tenant_id guard
        taxRateCode,
      },
    });
  }

  /**
   * 税率新規登録
   */
  async create(params: {
    tenantId: string;
    createdBy: string;
    data: {
      taxRateCode: string;
      ratePercent: string; // Decimal as string
      validFrom: Date;
      validTo?: Date;
      isActive?: boolean;
    };
  }): Promise<TaxRate> {
    const { tenantId, createdBy, data } = params;

    return this.prisma.taxRate.create({
      data: {
        tenantId, // tenant_id設定
        taxRateCode: data.taxRateCode,
        ratePercent: new Prisma.Decimal(data.ratePercent),
        validFrom: data.validFrom,
        validTo: data.validTo ?? null,
        isActive: data.isActive ?? true,
        version: 1, // 初期バージョン
        createdByLoginAccountId: createdBy, // 監査列
        updatedByLoginAccountId: createdBy, // 監査列（作成時は同じ）
      },
    });
  }

  /**
   * 税率更新（楽観ロック）
   * Note: taxRateCode と ratePercent は更新不可
   */
  async update(params: {
    tenantId: string;
    taxRateId: string;
    version: number;
    updatedBy: string;
    data: {
      validFrom: Date;
      validTo?: Date;
      isActive: boolean;
    };
  }): Promise<TaxRate | null> {
    const { tenantId, taxRateId, version, updatedBy, data } = params;

    try {
      // 楽観ロック: WHERE句に version を含める
      // tenant_id double-guard: WHERE句に tenantId を含める
      const updated = await this.prisma.taxRate.updateMany({
        where: {
          id: taxRateId,
          tenantId, // tenant_id guard
          version, // optimistic lock
        },
        data: {
          validFrom: data.validFrom,
          validTo: data.validTo ?? null,
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
      return this.findById({ tenantId, taxRateId });
    } catch (error) {
      throw error;
    }
  }

  /**
   * 税率無効化（楽観ロック）
   */
  async deactivate(params: {
    tenantId: string;
    taxRateId: string;
    version: number;
    updatedBy: string;
  }): Promise<TaxRate | null> {
    const { tenantId, taxRateId, version, updatedBy } = params;

    const updated = await this.prisma.taxRate.updateMany({
      where: {
        id: taxRateId,
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

    return this.findById({ tenantId, taxRateId });
  }

  /**
   * 税率有効化（楽観ロック）
   */
  async activate(params: {
    tenantId: string;
    taxRateId: string;
    version: number;
    updatedBy: string;
  }): Promise<TaxRate | null> {
    const { tenantId, taxRateId, version, updatedBy } = params;

    const updated = await this.prisma.taxRate.updateMany({
      where: {
        id: taxRateId,
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

    return this.findById({ tenantId, taxRateId });
  }

  /**
   * 税率コード重複チェック
   */
  async checkTaxRateCodeDuplicate(params: {
    tenantId: string;
    taxRateCode: string;
    excludeTaxRateId?: string; // 更新時は自分自身を除外
  }): Promise<boolean> {
    const { tenantId, taxRateCode, excludeTaxRateId } = params;

    const where: Prisma.TaxRateWhereInput = {
      tenantId, // tenant_id guard
      taxRateCode,
    };

    // 更新時は自分自身を除外
    if (excludeTaxRateId) {
      where.id = { not: excludeTaxRateId };
    }

    const count = await this.prisma.taxRate.count({ where });
    return count > 0;
  }
}
