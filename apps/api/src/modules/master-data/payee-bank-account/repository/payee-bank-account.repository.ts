import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import {
  Prisma,
  PayeeBankAccount,
  AccountCategory,
  AccountType,
  TransferFeeBearer,
} from '@prisma/client';
import {
  PayeeBankAccountSortBy,
  SortOrder,
} from '@procure/contracts/api/payee-bank-account';

/**
 * Payee Bank Account Repository
 *
 * DBアクセス層（tenant_id double-guard）
 */
@Injectable()
export class PayeeBankAccountRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 支払先口座一覧取得
   */
  async findMany(params: {
    tenantId: string;
    payeeId: string;
    offset: number;
    limit: number;
    sortBy?: PayeeBankAccountSortBy;
    sortOrder?: SortOrder;
    isActive?: boolean;
  }): Promise<{ items: PayeeBankAccount[]; total: number }> {
    const { tenantId, payeeId, offset, limit, sortBy, sortOrder, isActive } =
      params;

    const where: Prisma.PayeeBankAccountWhereInput = {
      tenantId,
      payeeId,
    };

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const sortField = sortBy || 'createdAt';
    const sortDirection = sortOrder || 'desc';

    const orderBy: Prisma.PayeeBankAccountOrderByWithRelationInput = {
      [sortField]: sortDirection,
    };

    const [items, total] = await Promise.all([
      this.prisma.payeeBankAccount.findMany({
        where,
        orderBy,
        skip: offset,
        take: limit,
        include: {
          bank: true,
          bankBranch: true,
        },
      }),
      this.prisma.payeeBankAccount.count({ where }),
    ]);

    return { items, total };
  }

  /**
   * 支払先口座詳細取得
   */
  async findOne(params: {
    tenantId: string;
    accountId: string;
  }): Promise<PayeeBankAccount | null> {
    const { tenantId, accountId } = params;

    return this.prisma.payeeBankAccount.findFirst({
      where: {
        id: accountId,
        tenantId,
      },
      include: {
        bank: true,
        bankBranch: true,
      },
    });
  }

  /**
   * 支払先口座新規登録
   */
  async create(params: {
    tenantId: string;
    createdBy: string;
    data: {
      payeeId: string;
      accountCategory: AccountCategory;
      bankId?: string;
      bankBranchId?: string;
      postOfficeSymbol?: string;
      postOfficeNumber?: string;
      accountType: AccountType;
      accountNo?: string;
      accountHolderName: string;
      accountHolderNameKana?: string;
      transferFeeBearer: TransferFeeBearer;
      isDefault?: boolean;
      notes?: string;
    };
  }): Promise<PayeeBankAccount> {
    const { tenantId, createdBy, data } = params;

    return this.prisma.payeeBankAccount.create({
      data: {
        tenantId,
        payeeId: data.payeeId,
        accountCategory: data.accountCategory,
        bankId: data.bankId ?? null,
        bankBranchId: data.bankBranchId ?? null,
        postOfficeSymbol: data.postOfficeSymbol ?? null,
        postOfficeNumber: data.postOfficeNumber ?? null,
        accountType: data.accountType,
        accountNo: data.accountNo ?? null,
        accountHolderName: data.accountHolderName,
        accountHolderNameKana: data.accountHolderNameKana ?? null,
        transferFeeBearer: data.transferFeeBearer,
        isDefault: data.isDefault ?? false,
        isActive: true,
        notes: data.notes ?? null,
        version: 1,
        createdByLoginAccountId: createdBy,
        updatedByLoginAccountId: createdBy,
      },
      include: {
        bank: true,
        bankBranch: true,
      },
    });
  }

  /**
   * 支払先口座更新（楽観ロック）
   */
  async update(params: {
    tenantId: string;
    accountId: string;
    version: number;
    updatedBy: string;
    data: {
      accountCategory: AccountCategory;
      bankId?: string;
      bankBranchId?: string;
      postOfficeSymbol?: string;
      postOfficeNumber?: string;
      accountType: AccountType;
      accountNo?: string;
      accountHolderName: string;
      accountHolderNameKana?: string;
      transferFeeBearer: TransferFeeBearer;
      isDefault: boolean;
      isActive: boolean;
      notes?: string;
    };
  }): Promise<PayeeBankAccount | null> {
    const { tenantId, accountId, version, updatedBy, data } = params;

    const updated = await this.prisma.payeeBankAccount.updateMany({
      where: {
        id: accountId,
        tenantId,
        version,
      },
      data: {
        accountCategory: data.accountCategory,
        bankId: data.bankId ?? null,
        bankBranchId: data.bankBranchId ?? null,
        postOfficeSymbol: data.postOfficeSymbol ?? null,
        postOfficeNumber: data.postOfficeNumber ?? null,
        accountType: data.accountType,
        accountNo: data.accountNo ?? null,
        accountHolderName: data.accountHolderName,
        accountHolderNameKana: data.accountHolderNameKana ?? null,
        transferFeeBearer: data.transferFeeBearer,
        isDefault: data.isDefault,
        isActive: data.isActive,
        notes: data.notes ?? null,
        version: version + 1,
        updatedByLoginAccountId: updatedBy,
      },
    });

    if (updated.count === 0) {
      return null;
    }

    return this.findOne({ tenantId, accountId });
  }

  /**
   * 既定口座の解除（同一支払先の他の既定口座を解除）
   */
  async clearDefaultAccount(params: {
    tenantId: string;
    payeeId: string;
    excludeAccountId?: string;
  }): Promise<void> {
    const { tenantId, payeeId, excludeAccountId } = params;

    const where: Prisma.PayeeBankAccountWhereInput = {
      tenantId,
      payeeId,
      isDefault: true,
      isActive: true,
    };

    if (excludeAccountId) {
      where.id = { not: excludeAccountId };
    }

    await this.prisma.payeeBankAccount.updateMany({
      where,
      data: {
        isDefault: false,
      },
    });
  }

  /**
   * 既定口座の存在チェック
   */
  async hasDefaultAccount(params: {
    tenantId: string;
    payeeId: string;
    excludeAccountId?: string;
  }): Promise<boolean> {
    const { tenantId, payeeId, excludeAccountId } = params;

    const where: Prisma.PayeeBankAccountWhereInput = {
      tenantId,
      payeeId,
      isDefault: true,
      isActive: true,
    };

    if (excludeAccountId) {
      where.id = { not: excludeAccountId };
    }

    const count = await this.prisma.payeeBankAccount.count({ where });
    return count > 0;
  }
}
