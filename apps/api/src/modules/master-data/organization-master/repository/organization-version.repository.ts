import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { Prisma, OrganizationVersion } from '@prisma/client';
import { VersionSortBy, SortOrder } from '@procure/contracts/api/organization-master';

/**
 * OrganizationVersion Repository
 *
 * DBアクセス層（tenant_id double-guard）
 * - すべてのメソッドは tenant_id を必須パラメータとして受け取る
 * - WHERE句に必ず tenant_id を含める
 * - RLS + アプリケーション層の二重ガード
 */
@Injectable()
export class OrganizationVersionRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * バージョン一覧取得
   */
  async findMany(params: {
    tenantId: string;
    sortBy?: VersionSortBy;
    sortOrder?: SortOrder;
  }): Promise<OrganizationVersion[]> {
    const { tenantId, sortBy, sortOrder } = params;

    // ソートフィールドのマッピング
    const sortFieldMap: Record<VersionSortBy, keyof OrganizationVersion> = {
      effectiveDate: 'effectiveDate',
      versionCode: 'versionCode',
      versionName: 'versionName',
    };

    const sortField = sortFieldMap[sortBy ?? 'effectiveDate'];
    const sortDirection = sortOrder ?? 'desc';

    const orderBy: Prisma.OrganizationVersionOrderByWithRelationInput = {
      [sortField]: sortDirection,
    };

    return this.prisma.organizationVersion.findMany({
      where: {
        tenantId, // tenant_id guard
      },
      orderBy,
    });
  }

  /**
   * バージョン詳細取得（IDで）
   */
  async findById(params: {
    tenantId: string;
    versionId: string;
  }): Promise<OrganizationVersion | null> {
    const { tenantId, versionId } = params;

    return this.prisma.organizationVersion.findFirst({
      where: {
        id: versionId,
        tenantId, // tenant_id guard
      },
    });
  }

  /**
   * バージョン取得（コードで）
   */
  async findByCode(params: {
    tenantId: string;
    versionCode: string;
  }): Promise<OrganizationVersion | null> {
    const { tenantId, versionCode } = params;

    return this.prisma.organizationVersion.findFirst({
      where: {
        tenantId, // tenant_id guard
        versionCode,
      },
    });
  }

  /**
   * as-of検索: 指定日時点で有効なバージョンを取得
   */
  async findEffectiveAsOf(params: {
    tenantId: string;
    asOfDate: Date;
  }): Promise<OrganizationVersion | null> {
    const { tenantId, asOfDate } = params;

    // effective_date <= asOfDate AND (expiry_date IS NULL OR expiry_date > asOfDate)
    // 複数該当の場合は effective_date DESC で最新を取得
    return this.prisma.organizationVersion.findFirst({
      where: {
        tenantId, // tenant_id guard
        effectiveDate: { lte: asOfDate },
        OR: [{ expiryDate: null }, { expiryDate: { gt: asOfDate } }],
        isActive: true,
      },
      orderBy: {
        effectiveDate: 'desc',
      },
    });
  }

  /**
   * バージョン新規作成
   */
  async create(params: {
    tenantId: string;
    createdBy: string;
    data: {
      versionCode: string;
      versionName: string;
      effectiveDate: Date;
      expiryDate?: Date;
      baseVersionId?: string;
      description?: string;
    };
  }): Promise<OrganizationVersion> {
    const { tenantId, createdBy, data } = params;

    return this.prisma.organizationVersion.create({
      data: {
        tenantId, // tenant_id設定
        versionCode: data.versionCode,
        versionName: data.versionName,
        effectiveDate: data.effectiveDate,
        expiryDate: data.expiryDate ?? null,
        baseVersionId: data.baseVersionId ?? null,
        description: data.description ?? null,
        isActive: true,
        createdBy, // 監査列
        updatedBy: createdBy, // 監査列（作成時は同じ）
      },
    });
  }

  /**
   * バージョン更新
   */
  async update(params: {
    tenantId: string;
    versionId: string;
    updatedBy: string;
    data: {
      versionCode?: string;
      versionName?: string;
      effectiveDate?: Date;
      expiryDate?: Date | null;
      description?: string | null;
    };
  }): Promise<OrganizationVersion | null> {
    const { tenantId, versionId, updatedBy, data } = params;

    // tenant_id double-guard: WHERE句に tenantId を含める
    const updated = await this.prisma.organizationVersion.updateMany({
      where: {
        id: versionId,
        tenantId, // tenant_id guard
      },
      data: {
        ...(data.versionCode !== undefined && { versionCode: data.versionCode }),
        ...(data.versionName !== undefined && { versionName: data.versionName }),
        ...(data.effectiveDate !== undefined && { effectiveDate: data.effectiveDate }),
        ...(data.expiryDate !== undefined && { expiryDate: data.expiryDate }),
        ...(data.description !== undefined && { description: data.description }),
        updatedBy, // 監査列
      },
    });

    if (updated.count === 0) {
      return null;
    }

    return this.findById({ tenantId, versionId });
  }

  /**
   * バージョンコード重複チェック
   */
  async checkVersionCodeDuplicate(params: {
    tenantId: string;
    versionCode: string;
    excludeVersionId?: string;
  }): Promise<boolean> {
    const { tenantId, versionCode, excludeVersionId } = params;

    const where: Prisma.OrganizationVersionWhereInput = {
      tenantId, // tenant_id guard
      versionCode,
    };

    if (excludeVersionId) {
      where.id = { not: excludeVersionId };
    }

    const count = await this.prisma.organizationVersion.count({ where });
    return count > 0;
  }

  /**
   * バージョンの部門数を取得
   */
  async getDepartmentCount(params: {
    tenantId: string;
    versionId: string;
  }): Promise<number> {
    const { tenantId, versionId } = params;

    return this.prisma.department.count({
      where: {
        tenantId,
        versionId,
      },
    });
  }
}
