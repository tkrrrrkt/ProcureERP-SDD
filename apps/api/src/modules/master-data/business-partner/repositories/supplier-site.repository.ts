/**
 * SupplierSite Repository
 *
 * DBアクセス層（tenant_id double-guard）
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { Prisma, SupplierSite, Payee } from '@prisma/client';
import { SupplierSiteSortBy, SortOrder } from '@procure/contracts/api/business-partner';

export type SupplierSiteWithPayee = SupplierSite & {
  payee?: Payee | null;
};

@Injectable()
export class SupplierSiteRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 仕入先拠点一覧取得
   */
  async findMany(params: {
    tenantId: string;
    partyId?: string;
    offset: number;
    limit: number;
    sortBy?: SupplierSiteSortBy;
    sortOrder?: SortOrder;
    keyword?: string;
  }): Promise<{ items: SupplierSiteWithPayee[]; total: number }> {
    const { tenantId, partyId, offset, limit, sortBy, sortOrder, keyword } = params;

    const where: Prisma.SupplierSiteWhereInput = {
      tenantId,
    };

    if (partyId) {
      where.partyId = partyId;
    }

    if (keyword) {
      where.OR = [
        { supplierCode: { contains: keyword, mode: 'insensitive' } },
        { supplierName: { contains: keyword, mode: 'insensitive' } },
        { supplierNameKana: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    const sortField = sortBy || 'supplierCode';
    const sortDirection = sortOrder || 'asc';

    const orderBy: Prisma.SupplierSiteOrderByWithRelationInput = {
      [sortField]: sortDirection,
    };

    const [items, total] = await Promise.all([
      this.prisma.supplierSite.findMany({
        where,
        orderBy,
        skip: offset,
        take: limit,
        include: {
          payee: true,
        },
      }),
      this.prisma.supplierSite.count({ where }),
    ]);

    return { items, total };
  }

  /**
   * 仕入先拠点詳細取得（ID指定）
   */
  async findById(params: {
    tenantId: string;
    supplierSiteId: string;
  }): Promise<SupplierSiteWithPayee | null> {
    const { tenantId, supplierSiteId } = params;

    return this.prisma.supplierSite.findFirst({
      where: {
        id: supplierSiteId,
        tenantId,
      },
      include: {
        payee: true,
      },
    });
  }

  /**
   * 仕入先拠点取得（コード指定、重複チェック用）
   */
  async findByCode(params: {
    tenantId: string;
    supplierCode: string;
    excludeId?: string;
  }): Promise<SupplierSite | null> {
    const { tenantId, supplierCode, excludeId } = params;

    const where: Prisma.SupplierSiteWhereInput = {
      tenantId,
      supplierCode,
    };

    if (excludeId) {
      where.id = { not: excludeId };
    }

    return this.prisma.supplierSite.findFirst({ where });
  }

  /**
   * 仕入先拠点新規登録
   */
  async create(params: {
    tenantId: string;
    createdBy: string;
    data: {
      partyId: string;
      supplierSubCode: string;
      supplierCode: string;
      supplierName: string;
      supplierNameKana?: string;
      postalCode?: string;
      prefecture?: string;
      city?: string;
      addressLine1?: string;
      addressLine2?: string;
      phone?: string;
      fax?: string;
      email?: string;
      contactName?: string;
      payeeId: string;
      notes?: string;
    };
  }): Promise<SupplierSite> {
    const { tenantId, createdBy, data } = params;

    return this.prisma.supplierSite.create({
      data: {
        tenantId,
        partyId: data.partyId,
        supplierSubCode: data.supplierSubCode,
        supplierCode: data.supplierCode,
        supplierName: data.supplierName,
        supplierNameKana: data.supplierNameKana ?? null,
        postalCode: data.postalCode ?? null,
        prefecture: data.prefecture ?? null,
        city: data.city ?? null,
        addressLine1: data.addressLine1 ?? null,
        addressLine2: data.addressLine2 ?? null,
        phone: data.phone ?? null,
        fax: data.fax ?? null,
        email: data.email ?? null,
        contactName: data.contactName ?? null,
        payeeId: data.payeeId,
        notes: data.notes ?? null,
        isActive: true,
        version: 1,
        createdByLoginAccountId: createdBy,
        updatedByLoginAccountId: createdBy,
      },
    });
  }

  /**
   * 仕入先拠点更新（楽観ロック）
   */
  async update(params: {
    tenantId: string;
    supplierSiteId: string;
    version: number;
    updatedBy: string;
    data: {
      supplierName: string;
      supplierNameKana?: string;
      postalCode?: string;
      prefecture?: string;
      city?: string;
      addressLine1?: string;
      addressLine2?: string;
      phone?: string;
      fax?: string;
      email?: string;
      contactName?: string;
      payeeId?: string;
      notes?: string;
      isActive?: boolean;
    };
  }): Promise<SupplierSiteWithPayee | null> {
    const { tenantId, supplierSiteId, version, updatedBy, data } = params;

    const updated = await this.prisma.supplierSite.updateMany({
      where: {
        id: supplierSiteId,
        tenantId,
        version,
      },
      data: {
        supplierName: data.supplierName,
        supplierNameKana: data.supplierNameKana ?? null,
        postalCode: data.postalCode ?? null,
        prefecture: data.prefecture ?? null,
        city: data.city ?? null,
        addressLine1: data.addressLine1 ?? null,
        addressLine2: data.addressLine2 ?? null,
        phone: data.phone ?? null,
        fax: data.fax ?? null,
        email: data.email ?? null,
        contactName: data.contactName ?? null,
        payeeId: data.payeeId,
        notes: data.notes ?? null,
        isActive: data.isActive,
        version: version + 1,
        updatedByLoginAccountId: updatedBy,
      },
    });

    if (updated.count === 0) {
      return null;
    }

    return this.findById({ tenantId, supplierSiteId });
  }

  /**
   * 仕入先拠点論理削除（is_active = false）
   */
  async softDelete(params: {
    tenantId: string;
    supplierSiteId: string;
    version: number;
    updatedBy: string;
  }): Promise<boolean> {
    const { tenantId, supplierSiteId, version, updatedBy } = params;

    const updated = await this.prisma.supplierSite.updateMany({
      where: {
        id: supplierSiteId,
        tenantId,
        version,
      },
      data: {
        isActive: false,
        version: version + 1,
        updatedByLoginAccountId: updatedBy,
      },
    });

    return updated.count > 0;
  }
}
