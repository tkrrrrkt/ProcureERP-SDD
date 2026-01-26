/**
 * Payee Repository
 *
 * DBアクセス層（tenant_id double-guard）
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { Prisma, Payee, CompanyBankAccount } from '@prisma/client';
import { PayeeSortBy, SortOrder } from '@procure/contracts/api/business-partner';

export type PayeeWithRelations = Payee & {
  defaultCompanyBankAccount?: CompanyBankAccount | null;
};

@Injectable()
export class PayeeRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 支払先一覧取得
   */
  async findMany(params: {
    tenantId: string;
    partyId?: string;
    offset: number;
    limit: number;
    sortBy?: PayeeSortBy;
    sortOrder?: SortOrder;
    keyword?: string;
  }): Promise<{ items: PayeeWithRelations[]; total: number }> {
    const { tenantId, partyId, offset, limit, sortBy, sortOrder, keyword } = params;

    const where: Prisma.PayeeWhereInput = {
      tenantId,
    };

    if (partyId) {
      where.partyId = partyId;
    }

    if (keyword) {
      where.OR = [
        { payeeCode: { contains: keyword, mode: 'insensitive' } },
        { payeeName: { contains: keyword, mode: 'insensitive' } },
        { payeeNameKana: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    const sortField = sortBy || 'payeeCode';
    const sortDirection = sortOrder || 'asc';

    const orderBy: Prisma.PayeeOrderByWithRelationInput = {
      [sortField]: sortDirection,
    };

    const [items, total] = await Promise.all([
      this.prisma.payee.findMany({
        where,
        orderBy,
        skip: offset,
        take: limit,
        include: {
          defaultCompanyBankAccount: {
            include: {
              bank: true,
            },
          },
        },
      }),
      this.prisma.payee.count({ where }),
    ]);

    return { items, total };
  }

  /**
   * 支払先詳細取得（ID指定）
   */
  async findById(params: {
    tenantId: string;
    payeeId: string;
  }): Promise<PayeeWithRelations | null> {
    const { tenantId, payeeId } = params;

    return this.prisma.payee.findFirst({
      where: {
        id: payeeId,
        tenantId,
      },
      include: {
        defaultCompanyBankAccount: {
          include: {
            bank: true,
          },
        },
      },
    });
  }

  /**
   * 支払先取得（Party + SubCode指定、Payee自動生成検索用）
   */
  async findByPartyAndSubCode(params: {
    tenantId: string;
    partyId: string;
    payeeSubCode: string;
  }): Promise<Payee | null> {
    const { tenantId, partyId, payeeSubCode } = params;

    return this.prisma.payee.findFirst({
      where: {
        tenantId,
        partyId,
        payeeSubCode,
      },
    });
  }

  /**
   * 支払先取得（コード指定、重複チェック用）
   */
  async findByCode(params: {
    tenantId: string;
    payeeCode: string;
    excludePayeeId?: string;
  }): Promise<Payee | null> {
    const { tenantId, payeeCode, excludePayeeId } = params;

    const where: Prisma.PayeeWhereInput = {
      tenantId,
      payeeCode,
    };

    if (excludePayeeId) {
      where.id = { not: excludePayeeId };
    }

    return this.prisma.payee.findFirst({ where });
  }

  /**
   * 支払先新規登録
   */
  async create(params: {
    tenantId: string;
    createdBy: string;
    data: {
      partyId: string;
      payeeSubCode: string;
      payeeCode: string;
      payeeName: string;
      payeeNameKana?: string;
      postalCode?: string;
      prefecture?: string;
      city?: string;
      addressLine1?: string;
      addressLine2?: string;
      phone?: string;
      fax?: string;
      email?: string;
      contactName?: string;
      paymentMethod?: string;
      currencyCode?: string;
      paymentTermsText?: string;
      defaultCompanyBankAccountId?: string;
      notes?: string;
    };
  }): Promise<Payee> {
    const { tenantId, createdBy, data } = params;

    return this.prisma.payee.create({
      data: {
        tenantId,
        partyId: data.partyId,
        payeeSubCode: data.payeeSubCode,
        payeeCode: data.payeeCode,
        payeeName: data.payeeName,
        payeeNameKana: data.payeeNameKana ?? null,
        payeePostalCode: data.postalCode ?? null,
        payeePrefecture: data.prefecture ?? null,
        payeeCity: data.city ?? null,
        payeeAddressLine1: data.addressLine1 ?? null,
        payeeAddressLine2: data.addressLine2 ?? null,
        payeePhone: data.phone ?? null,
        payeeFax: data.fax ?? null,
        payeeEmail: data.email ?? null,
        payeeContactName: data.contactName ?? null,
        paymentMethod: data.paymentMethod ?? null,
        currencyCode: data.currencyCode ?? null,
        paymentTermsText: data.paymentTermsText ?? null,
        defaultCompanyBankAccountId: data.defaultCompanyBankAccountId ?? null,
        notes: data.notes ?? null,
        isActive: true,
        version: 1,
        createdByLoginAccountId: createdBy,
        updatedByLoginAccountId: createdBy,
      },
    });
  }

  /**
   * 支払先更新（楽観ロック）
   */
  async update(params: {
    tenantId: string;
    payeeId: string;
    version: number;
    updatedBy: string;
    data: {
      payeeName: string;
      payeeNameKana?: string;
      postalCode?: string;
      prefecture?: string;
      city?: string;
      addressLine1?: string;
      addressLine2?: string;
      phone?: string;
      fax?: string;
      email?: string;
      contactName?: string;
      paymentMethod?: string;
      currencyCode?: string;
      paymentTermsText?: string;
      defaultCompanyBankAccountId?: string | null;
      notes?: string;
      isActive?: boolean;
    };
  }): Promise<PayeeWithRelations | null> {
    const { tenantId, payeeId, version, updatedBy, data } = params;

    const updated = await this.prisma.payee.updateMany({
      where: {
        id: payeeId,
        tenantId,
        version,
      },
      data: {
        payeeName: data.payeeName,
        payeeNameKana: data.payeeNameKana ?? null,
        payeePostalCode: data.postalCode ?? null,
        payeePrefecture: data.prefecture ?? null,
        payeeCity: data.city ?? null,
        payeeAddressLine1: data.addressLine1 ?? null,
        payeeAddressLine2: data.addressLine2 ?? null,
        payeePhone: data.phone ?? null,
        payeeFax: data.fax ?? null,
        payeeEmail: data.email ?? null,
        payeeContactName: data.contactName ?? null,
        paymentMethod: data.paymentMethod ?? null,
        currencyCode: data.currencyCode ?? null,
        paymentTermsText: data.paymentTermsText ?? null,
        defaultCompanyBankAccountId: data.defaultCompanyBankAccountId,
        notes: data.notes ?? null,
        isActive: data.isActive,
        version: version + 1,
        updatedByLoginAccountId: updatedBy,
      },
    });

    if (updated.count === 0) {
      return null;
    }

    return this.findById({ tenantId, payeeId });
  }
}
