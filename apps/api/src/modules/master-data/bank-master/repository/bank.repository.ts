import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { Prisma, Bank } from '@prisma/client';
import { BankSortBy, SortOrder } from '@procure/contracts/api/bank-master';

/**
 * Bank Repository
 *
 * DBアクセス層（tenant_id double-guard）
 * - すべてのメソッドは tenant_id を必須パラメータとして受け取る
 * - WHERE句に必ず tenant_id を含める
 * - RLS + アプリケーション層の二重ガード
 */
@Injectable()
export class BankRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 銀行一覧取得
   */
  async findMany(params: {
    tenantId: string;
    offset: number;
    limit: number;
    sortBy?: BankSortBy;
    sortOrder?: SortOrder;
    keyword?: string;
    isActive?: boolean;
  }): Promise<{ items: Bank[]; total: number }> {
    const { tenantId, offset, limit, sortBy, sortOrder, keyword, isActive } =
      params;

    // tenant_id double-guard: WHERE句に必ず含める
    const where: Prisma.BankWhereInput = {
      tenantId, // tenant_id guard
    };

    // isActive フィルタ
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // キーワード検索: 部分一致（Case-insensitive）
    if (keyword) {
      where.OR = [
        { bankCode: { contains: keyword, mode: 'insensitive' } },
        { bankName: { contains: keyword, mode: 'insensitive' } },
        { bankNameKana: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    // ソートフィールドのマッピング
    const sortField = sortBy || 'displayOrder';
    const sortDirection = sortOrder || 'asc';

    const orderBy: Prisma.BankOrderByWithRelationInput = {
      [sortField]: sortDirection,
    };

    // 並列実行: データ取得と総件数取得
    const [items, total] = await Promise.all([
      this.prisma.bank.findMany({
        where,
        orderBy,
        skip: offset,
        take: limit,
      }),
      this.prisma.bank.count({ where }),
    ]);

    return { items, total };
  }

  /**
   * 銀行詳細取得
   */
  async findOne(params: {
    tenantId: string;
    bankId: string;
  }): Promise<Bank | null> {
    const { tenantId, bankId } = params;

    // tenant_id double-guard: WHERE句に必ず含める
    return this.prisma.bank.findFirst({
      where: {
        id: bankId,
        tenantId, // tenant_id guard
      },
    });
  }

  /**
   * 銀行コード検索
   */
  async findByCode(params: {
    tenantId: string;
    bankCode: string;
  }): Promise<Bank | null> {
    const { tenantId, bankCode } = params;

    // tenant_id double-guard: WHERE句に必ず含める
    return this.prisma.bank.findFirst({
      where: {
        tenantId, // tenant_id guard
        bankCode,
      },
    });
  }

  /**
   * 銀行新規登録
   */
  async create(params: {
    tenantId: string;
    createdBy: string;
    data: {
      bankCode: string;
      bankName: string;
      bankNameKana?: string;
      swiftCode?: string;
      displayOrder?: number;
      isActive?: boolean;
    };
  }): Promise<Bank> {
    const { tenantId, createdBy, data } = params;

    return this.prisma.bank.create({
      data: {
        tenantId, // tenant_id設定
        bankCode: data.bankCode,
        bankName: data.bankName,
        bankNameKana: data.bankNameKana ?? null,
        swiftCode: data.swiftCode ?? null,
        displayOrder: data.displayOrder ?? 1000,
        isActive: data.isActive ?? true,
        version: 1, // 初期バージョン
        createdByLoginAccountId: createdBy, // 監査列
        updatedByLoginAccountId: createdBy, // 監査列（作成時は同じ）
      },
    });
  }

  /**
   * 銀行更新（楽観ロック）
   */
  async update(params: {
    tenantId: string;
    bankId: string;
    version: number;
    updatedBy: string;
    data: {
      bankName: string;
      bankNameKana?: string;
      swiftCode?: string;
      displayOrder: number;
      isActive: boolean;
    };
  }): Promise<Bank | null> {
    const { tenantId, bankId, version, updatedBy, data } = params;

    // 楽観ロック: WHERE句に version を含める
    // tenant_id double-guard: WHERE句に tenantId を含める
    const updated = await this.prisma.bank.updateMany({
      where: {
        id: bankId,
        tenantId, // tenant_id guard
        version, // optimistic lock
      },
      data: {
        bankName: data.bankName,
        bankNameKana: data.bankNameKana ?? null,
        swiftCode: data.swiftCode ?? null,
        displayOrder: data.displayOrder,
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
    return this.findOne({ tenantId, bankId });
  }

  /**
   * 銀行コード重複チェック
   */
  async checkBankCodeDuplicate(params: {
    tenantId: string;
    bankCode: string;
    excludeBankId?: string; // 更新時は自分自身を除外
  }): Promise<boolean> {
    const { tenantId, bankCode, excludeBankId } = params;

    const where: Prisma.BankWhereInput = {
      tenantId, // tenant_id guard
      bankCode,
    };

    // 更新時は自分自身を除外
    if (excludeBankId) {
      where.id = { not: excludeBankId };
    }

    const count = await this.prisma.bank.count({ where });
    return count > 0;
  }

  /**
   * 有効支店数取得
   */
  async countActiveBranches(params: {
    tenantId: string;
    bankId: string;
  }): Promise<number> {
    const { tenantId, bankId } = params;

    return this.prisma.bankBranch.count({
      where: {
        tenantId, // tenant_id guard
        bankId,
        isActive: true,
      },
    });
  }
}
