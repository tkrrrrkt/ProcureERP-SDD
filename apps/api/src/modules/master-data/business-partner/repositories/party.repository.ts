/**
 * Party Repository
 *
 * DBアクセス層（tenant_id double-guard）
 * - すべてのメソッドは tenant_id を必須パラメータとして受け取る
 * - WHERE句に必ず tenant_id を含める
 * - RLS + アプリケーション層の二重ガード
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { Prisma, Party } from '@prisma/client';
import { PartySortBy, SortOrder } from '@procure/contracts/api/business-partner';

@Injectable()
export class PartyRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 取引先一覧取得
   */
  async findMany(params: {
    tenantId: string;
    offset: number;
    limit: number;
    sortBy?: PartySortBy;
    sortOrder?: SortOrder;
    keyword?: string;
    isSupplier?: boolean;
    isCustomer?: boolean;
  }): Promise<{ items: Party[]; total: number }> {
    const { tenantId, offset, limit, sortBy, sortOrder, keyword, isSupplier, isCustomer } = params;

    // tenant_id double-guard: WHERE句に必ず含める
    const where: Prisma.PartyWhereInput = {
      tenantId,
    };

    // キーワード検索: 部分一致（Case-insensitive）
    if (keyword) {
      where.OR = [
        { partyCode: { contains: keyword, mode: 'insensitive' } },
        { partyName: { contains: keyword, mode: 'insensitive' } },
        { partyNameKana: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    // 仕入先/得意先フィルタ
    if (isSupplier !== undefined) {
      where.isSupplier = isSupplier;
    }
    if (isCustomer !== undefined) {
      where.isCustomer = isCustomer;
    }

    // ソートフィールドのマッピング
    const sortField = sortBy || 'partyCode';
    const sortDirection = sortOrder || 'asc';

    const orderBy: Prisma.PartyOrderByWithRelationInput = {
      [sortField]: sortDirection,
    };

    // 並列実行: データ取得と総件数取得
    const [items, total] = await Promise.all([
      this.prisma.party.findMany({
        where,
        orderBy,
        skip: offset,
        take: limit,
      }),
      this.prisma.party.count({ where }),
    ]);

    return { items, total };
  }

  /**
   * 取引先詳細取得（ID指定）
   */
  async findById(params: {
    tenantId: string;
    partyId: string;
  }): Promise<Party | null> {
    const { tenantId, partyId } = params;

    return this.prisma.party.findFirst({
      where: {
        id: partyId,
        tenantId,
      },
    });
  }

  /**
   * 取引先取得（コード指定、重複チェック用）
   */
  async findByCode(params: {
    tenantId: string;
    partyCode: string;
    excludePartyId?: string;
  }): Promise<Party | null> {
    const { tenantId, partyCode, excludePartyId } = params;

    const where: Prisma.PartyWhereInput = {
      tenantId,
      partyCode,
    };

    if (excludePartyId) {
      where.id = { not: excludePartyId };
    }

    return this.prisma.party.findFirst({ where });
  }

  /**
   * 取引先新規登録
   */
  async create(params: {
    tenantId: string;
    createdBy: string;
    data: {
      partyCode: string;
      partyName: string;
      partyNameKana?: string;
      partyShortName?: string;
      countryCode?: string;
      postalCode?: string;
      prefecture?: string;
      city?: string;
      addressLine1?: string;
      addressLine2?: string;
      phone?: string;
      fax?: string;
      websiteUrl?: string;
      corporateNumber?: string;
      invoiceRegistrationNo?: string;
      notes?: string;
      isActive?: boolean;
    };
  }): Promise<Party> {
    const { tenantId, createdBy, data } = params;

    return this.prisma.party.create({
      data: {
        tenantId,
        partyCode: data.partyCode,
        partyName: data.partyName,
        partyNameKana: data.partyNameKana ?? null,
        partyShortName: data.partyShortName ?? null,
        countryCode: data.countryCode ?? null,
        postalCode: data.postalCode ?? null,
        prefecture: data.prefecture ?? null,
        city: data.city ?? null,
        addressLine1: data.addressLine1 ?? null,
        addressLine2: data.addressLine2 ?? null,
        phone: data.phone ?? null,
        fax: data.fax ?? null,
        websiteUrl: data.websiteUrl ?? null,
        corporateNumber: data.corporateNumber ?? null,
        invoiceRegistrationNo: data.invoiceRegistrationNo ?? null,
        notes: data.notes ?? null,
        isSupplier: false, // 派生フラグ: 初期値
        isCustomer: false, // 派生フラグ: 初期値
        isActive: data.isActive ?? true,
        version: 1,
        createdByLoginAccountId: createdBy,
        updatedByLoginAccountId: createdBy,
      },
    });
  }

  /**
   * 取引先更新（楽観ロック）
   */
  async update(params: {
    tenantId: string;
    partyId: string;
    version: number;
    updatedBy: string;
    data: {
      partyName: string;
      partyNameKana?: string;
      partyShortName?: string;
      countryCode?: string;
      postalCode?: string;
      prefecture?: string;
      city?: string;
      addressLine1?: string;
      addressLine2?: string;
      phone?: string;
      fax?: string;
      websiteUrl?: string;
      corporateNumber?: string;
      invoiceRegistrationNo?: string;
      notes?: string;
      isActive?: boolean;
    };
  }): Promise<Party | null> {
    const { tenantId, partyId, version, updatedBy, data } = params;

    // 楽観ロック: WHERE句に version を含める
    const updated = await this.prisma.party.updateMany({
      where: {
        id: partyId,
        tenantId,
        version,
      },
      data: {
        partyName: data.partyName,
        partyNameKana: data.partyNameKana ?? null,
        partyShortName: data.partyShortName ?? null,
        countryCode: data.countryCode ?? null,
        postalCode: data.postalCode ?? null,
        prefecture: data.prefecture ?? null,
        city: data.city ?? null,
        addressLine1: data.addressLine1 ?? null,
        addressLine2: data.addressLine2 ?? null,
        phone: data.phone ?? null,
        fax: data.fax ?? null,
        websiteUrl: data.websiteUrl ?? null,
        corporateNumber: data.corporateNumber ?? null,
        invoiceRegistrationNo: data.invoiceRegistrationNo ?? null,
        notes: data.notes ?? null,
        isActive: data.isActive,
        version: version + 1,
        updatedByLoginAccountId: updatedBy,
      },
    });

    if (updated.count === 0) {
      return null;
    }

    return this.findById({ tenantId, partyId });
  }

  /**
   * 派生フラグ更新（is_supplier / is_customer）
   */
  async updateDerivedFlags(params: {
    tenantId: string;
    partyId: string;
    isSupplier?: boolean;
    isCustomer?: boolean;
  }): Promise<void> {
    const { tenantId, partyId, isSupplier, isCustomer } = params;

    const data: Prisma.PartyUpdateInput = {};
    if (isSupplier !== undefined) {
      data.isSupplier = isSupplier;
    }
    if (isCustomer !== undefined) {
      data.isCustomer = isCustomer;
    }

    await this.prisma.party.updateMany({
      where: {
        id: partyId,
        tenantId,
      },
      data,
    });
  }

  /**
   * 仕入先拠点件数カウント（派生フラグ更新用）
   */
  async countSupplierSites(params: {
    tenantId: string;
    partyId: string;
    isActive?: boolean;
  }): Promise<number> {
    const { tenantId, partyId, isActive } = params;

    const where: Prisma.SupplierSiteWhereInput = {
      tenantId,
      partyId,
    };

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    return this.prisma.supplierSite.count({ where });
  }
}
