import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import {
  CompanyBankAccountSortBy,
  SortOrder,
} from '@procure/contracts/api/company-bank-account';

/**
 * Company Bank Account Repository
 *
 * 自社口座マスタの永続化層
 */
@Injectable()
export class CompanyBankAccountRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 自社口座一覧取得
   */
  async findMany(params: {
    tenantId: string;
    offset: number;
    limit: number;
    sortBy?: CompanyBankAccountSortBy;
    sortOrder?: SortOrder;
    isActive?: boolean;
  }) {
    const { tenantId, offset, limit, sortBy, sortOrder, isActive } = params;

    const where: Prisma.CompanyBankAccountWhereInput = {
      tenantId,
      ...(isActive !== undefined ? { isActive } : {}),
    };

    // Build orderBy
    const orderByField = sortBy || 'accountCode';
    const orderByDirection = sortOrder || 'asc';
    const orderBy: Prisma.CompanyBankAccountOrderByWithRelationInput = {
      [orderByField]: orderByDirection,
    };

    const [items, total] = await Promise.all([
      this.prisma.companyBankAccount.findMany({
        where,
        orderBy,
        skip: offset,
        take: limit,
        include: {
          bank: true,
          bankBranch: true,
        },
      }),
      this.prisma.companyBankAccount.count({ where }),
    ]);

    return { items, total };
  }

  /**
   * 自社口座詳細取得（ID指定）
   */
  async findOne(params: { tenantId: string; accountId: string }) {
    const { tenantId, accountId } = params;

    return this.prisma.companyBankAccount.findFirst({
      where: {
        id: accountId,
        tenantId, // double-guard
      },
      include: {
        bank: true,
        bankBranch: true,
      },
    });
  }

  /**
   * 自社口座取得（口座コード指定）
   */
  async findByCode(params: { tenantId: string; accountCode: string }) {
    const { tenantId, accountCode } = params;

    return this.prisma.companyBankAccount.findFirst({
      where: {
        tenantId,
        accountCode,
      },
      include: {
        bank: true,
        bankBranch: true,
      },
    });
  }

  /**
   * 自社口座新規作成
   */
  async create(params: {
    tenantId: string;
    accountCode: string;
    accountName: string;
    accountCategory: 'bank' | 'post_office';
    bankId?: string;
    bankBranchId?: string;
    postOfficeSymbol?: string;
    postOfficeNumber?: string;
    accountType: 'ordinary' | 'current' | 'savings';
    accountNo?: string;
    accountHolderName: string;
    accountHolderNameKana?: string;
    consignorCode?: string;
    isDefault?: boolean;
    notes?: string;
    userId: string;
  }) {
    const {
      tenantId,
      accountCode,
      accountName,
      accountCategory,
      bankId,
      bankBranchId,
      postOfficeSymbol,
      postOfficeNumber,
      accountType,
      accountNo,
      accountHolderName,
      accountHolderNameKana,
      consignorCode,
      isDefault,
      notes,
      userId,
    } = params;

    return this.prisma.companyBankAccount.create({
      data: {
        tenantId,
        accountCode,
        accountName,
        accountCategory,
        bankId: bankId || null,
        bankBranchId: bankBranchId || null,
        postOfficeSymbol: postOfficeSymbol || null,
        postOfficeNumber: postOfficeNumber || null,
        accountType,
        accountNo: accountNo || null,
        accountHolderName,
        accountHolderNameKana: accountHolderNameKana || null,
        consignorCode: consignorCode || null,
        isDefault: isDefault || false,
        isActive: true,
        notes: notes || null,
        version: 1,
        createdByLoginAccountId: userId,
        updatedByLoginAccountId: userId,
      },
      include: {
        bank: true,
        bankBranch: true,
      },
    });
  }

  /**
   * 自社口座更新
   */
  async update(params: {
    tenantId: string;
    accountId: string;
    accountName: string;
    accountCategory: 'bank' | 'post_office';
    bankId?: string | null;
    bankBranchId?: string | null;
    postOfficeSymbol?: string | null;
    postOfficeNumber?: string | null;
    accountType: 'ordinary' | 'current' | 'savings';
    accountNo?: string | null;
    accountHolderName: string;
    accountHolderNameKana?: string | null;
    consignorCode?: string | null;
    isDefault: boolean;
    isActive: boolean;
    notes?: string | null;
    userId: string;
    currentVersion: number;
  }) {
    const {
      tenantId,
      accountId,
      accountName,
      accountCategory,
      bankId,
      bankBranchId,
      postOfficeSymbol,
      postOfficeNumber,
      accountType,
      accountNo,
      accountHolderName,
      accountHolderNameKana,
      consignorCode,
      isDefault,
      isActive,
      notes,
      userId,
      currentVersion,
    } = params;

    // Optimistic lock with version check
    return this.prisma.companyBankAccount.updateMany({
      where: {
        id: accountId,
        tenantId,
        version: currentVersion,
      },
      data: {
        accountName,
        accountCategory,
        bankId: bankId ?? null,
        bankBranchId: bankBranchId ?? null,
        postOfficeSymbol: postOfficeSymbol ?? null,
        postOfficeNumber: postOfficeNumber ?? null,
        accountType,
        accountNo: accountNo ?? null,
        accountHolderName,
        accountHolderNameKana: accountHolderNameKana ?? null,
        consignorCode: consignorCode ?? null,
        isDefault,
        isActive,
        notes: notes ?? null,
        version: { increment: 1 },
        updatedByLoginAccountId: userId,
      },
    });
  }

  /**
   * デフォルト口座のクリア（テナント内）
   */
  async clearDefaultAccount(params: { tenantId: string; userId: string }) {
    const { tenantId, userId } = params;

    return this.prisma.companyBankAccount.updateMany({
      where: {
        tenantId,
        isDefault: true,
      },
      data: {
        isDefault: false,
        version: { increment: 1 },
        updatedByLoginAccountId: userId,
      },
    });
  }

  /**
   * 現在のデフォルト口座取得
   */
  async findDefaultAccount(params: { tenantId: string }) {
    const { tenantId } = params;

    return this.prisma.companyBankAccount.findFirst({
      where: {
        tenantId,
        isDefault: true,
      },
      include: {
        bank: true,
        bankBranch: true,
      },
    });
  }
}
