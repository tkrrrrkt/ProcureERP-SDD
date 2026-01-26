import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { Prisma, BankBranch } from '@prisma/client';
import { BranchSortBy, SortOrder } from '@procure/contracts/api/bank-master';

/**
 * Branch Repository
 *
 * DBアクセス層（tenant_id double-guard）
 * - すべてのメソッドは tenant_id を必須パラメータとして受け取る
 * - WHERE句に必ず tenant_id を含める
 * - RLS + アプリケーション層の二重ガード
 */
@Injectable()
export class BranchRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 支店一覧取得
   * bank_id は必須フィルタ
   */
  async findMany(params: {
    tenantId: string;
    bankId: string;
    offset: number;
    limit: number;
    sortBy?: BranchSortBy;
    sortOrder?: SortOrder;
    keyword?: string;
    isActive?: boolean;
  }): Promise<{ items: BankBranch[]; total: number }> {
    const {
      tenantId,
      bankId,
      offset,
      limit,
      sortBy,
      sortOrder,
      keyword,
      isActive,
    } = params;

    // tenant_id double-guard: WHERE句に必ず含める
    const where: Prisma.BankBranchWhereInput = {
      tenantId, // tenant_id guard
      bankId, // bank_id 必須フィルタ
    };

    // isActive フィルタ
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // キーワード検索: 部分一致（Case-insensitive）
    if (keyword) {
      where.OR = [
        { branchCode: { contains: keyword, mode: 'insensitive' } },
        { branchName: { contains: keyword, mode: 'insensitive' } },
        { branchNameKana: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    // ソートフィールドのマッピング
    const sortField = sortBy || 'displayOrder';
    const sortDirection = sortOrder || 'asc';

    const orderBy: Prisma.BankBranchOrderByWithRelationInput = {
      [sortField]: sortDirection,
    };

    // 並列実行: データ取得と総件数取得
    const [items, total] = await Promise.all([
      this.prisma.bankBranch.findMany({
        where,
        orderBy,
        skip: offset,
        take: limit,
      }),
      this.prisma.bankBranch.count({ where }),
    ]);

    return { items, total };
  }

  /**
   * 支店詳細取得
   */
  async findOne(params: {
    tenantId: string;
    branchId: string;
  }): Promise<BankBranch | null> {
    const { tenantId, branchId } = params;

    // tenant_id double-guard: WHERE句に必ず含める
    return this.prisma.bankBranch.findFirst({
      where: {
        id: branchId,
        tenantId, // tenant_id guard
      },
    });
  }

  /**
   * 支店コード検索（銀行内でユニーク）
   */
  async findByCode(params: {
    tenantId: string;
    bankId: string;
    branchCode: string;
  }): Promise<BankBranch | null> {
    const { tenantId, bankId, branchCode } = params;

    // tenant_id double-guard: WHERE句に必ず含める
    return this.prisma.bankBranch.findFirst({
      where: {
        tenantId, // tenant_id guard
        bankId,
        branchCode,
      },
    });
  }

  /**
   * 支店新規登録
   */
  async create(params: {
    tenantId: string;
    bankId: string;
    createdBy: string;
    data: {
      branchCode: string;
      branchName: string;
      branchNameKana?: string;
      displayOrder?: number;
      isActive?: boolean;
    };
  }): Promise<BankBranch> {
    const { tenantId, bankId, createdBy, data } = params;

    return this.prisma.bankBranch.create({
      data: {
        tenantId, // tenant_id設定
        bankId, // bank_id設定
        branchCode: data.branchCode,
        branchName: data.branchName,
        branchNameKana: data.branchNameKana ?? null,
        displayOrder: data.displayOrder ?? 1000,
        isActive: data.isActive ?? true,
        version: 1, // 初期バージョン
        createdByLoginAccountId: createdBy, // 監査列
        updatedByLoginAccountId: createdBy, // 監査列（作成時は同じ）
      },
    });
  }

  /**
   * 支店更新（楽観ロック）
   */
  async update(params: {
    tenantId: string;
    branchId: string;
    version: number;
    updatedBy: string;
    data: {
      branchName: string;
      branchNameKana?: string;
      displayOrder: number;
      isActive: boolean;
    };
  }): Promise<BankBranch | null> {
    const { tenantId, branchId, version, updatedBy, data } = params;

    // 楽観ロック: WHERE句に version を含める
    // tenant_id double-guard: WHERE句に tenantId を含める
    const updated = await this.prisma.bankBranch.updateMany({
      where: {
        id: branchId,
        tenantId, // tenant_id guard
        version, // optimistic lock
      },
      data: {
        branchName: data.branchName,
        branchNameKana: data.branchNameKana ?? null,
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
    return this.findOne({ tenantId, branchId });
  }

  /**
   * 支店コード重複チェック（銀行内）
   */
  async checkBranchCodeDuplicate(params: {
    tenantId: string;
    bankId: string;
    branchCode: string;
    excludeBranchId?: string; // 更新時は自分自身を除外
  }): Promise<boolean> {
    const { tenantId, bankId, branchCode, excludeBranchId } = params;

    const where: Prisma.BankBranchWhereInput = {
      tenantId, // tenant_id guard
      bankId,
      branchCode,
    };

    // 更新時は自分自身を除外
    if (excludeBranchId) {
      where.id = { not: excludeBranchId };
    }

    const count = await this.prisma.bankBranch.count({ where });
    return count > 0;
  }

  /**
   * 支店が使用中かチェック（支払先口座での使用）
   *
   * TODO: PayeeBankAccount テーブルが実装されたら実装を更新
   * 現時点では常に false を返す
   */
  async isInUse(params: {
    tenantId: string;
    branchId: string;
  }): Promise<boolean> {
    const { tenantId: _tenantId, branchId: _branchId } = params;

    // TODO: PayeeBankAccount が実装されたら以下のようなクエリを実行
    // const count = await this.prisma.payeeBankAccount.count({
    //   where: {
    //     tenantId,
    //     branchId,
    //   },
    // });
    // return count > 0;

    // 現時点では常に false を返す
    return false;
  }
}
