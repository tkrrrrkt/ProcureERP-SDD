import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { Prisma, Department } from '@prisma/client';
import { DepartmentSortBy, SortOrder } from '@procure/contracts/api/organization-master';
import { randomUUID } from 'crypto';

/**
 * Department Repository
 *
 * DBアクセス層（tenant_id double-guard）
 * - すべてのメソッドは tenant_id を必須パラメータとして受け取る
 * - WHERE句に必ず tenant_id を含める
 * - RLS + アプリケーション層の二重ガード
 */
@Injectable()
export class DepartmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 部門一覧取得（バージョン指定）
   */
  async findByVersion(params: {
    tenantId: string;
    versionId: string;
    keyword?: string;
    isActive?: boolean;
    sortBy?: DepartmentSortBy;
    sortOrder?: SortOrder;
  }): Promise<Department[]> {
    const { tenantId, versionId, keyword, isActive, sortBy, sortOrder } = params;

    const where: Prisma.DepartmentWhereInput = {
      tenantId, // tenant_id guard
      versionId,
    };

    // キーワード検索
    if (keyword) {
      where.OR = [
        { departmentCode: { contains: keyword, mode: 'insensitive' } },
        { departmentName: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    // 有効フラグフィルタ
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // ソート
    const sortFieldMap: Record<DepartmentSortBy, keyof Department> = {
      sortOrder: 'sortOrder',
      departmentCode: 'departmentCode',
      departmentName: 'departmentName',
    };

    const sortField = sortFieldMap[sortBy ?? 'sortOrder'];
    const sortDirection = sortOrder ?? 'asc';

    const orderBy: Prisma.DepartmentOrderByWithRelationInput = {
      [sortField]: sortDirection,
    };

    return this.prisma.department.findMany({
      where,
      orderBy,
    });
  }

  /**
   * 部門詳細取得（IDで）
   */
  async findById(params: {
    tenantId: string;
    departmentId: string;
  }): Promise<Department | null> {
    const { tenantId, departmentId } = params;

    return this.prisma.department.findFirst({
      where: {
        id: departmentId,
        tenantId, // tenant_id guard
      },
    });
  }

  /**
   * 部門取得（コードで）
   */
  async findByCode(params: {
    tenantId: string;
    versionId: string;
    departmentCode: string;
  }): Promise<Department | null> {
    const { tenantId, versionId, departmentCode } = params;

    return this.prisma.department.findFirst({
      where: {
        tenantId, // tenant_id guard
        versionId,
        departmentCode,
      },
    });
  }

  /**
   * 部門取得（stable_idで、複数版を横断）
   */
  async findByStableId(params: {
    tenantId: string;
    stableId: string;
  }): Promise<Department[]> {
    const { tenantId, stableId } = params;

    return this.prisma.department.findMany({
      where: {
        tenantId, // tenant_id guard
        stableId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * 部門新規作成
   */
  async create(params: {
    tenantId: string;
    versionId: string;
    createdBy: string;
    data: {
      departmentCode: string;
      departmentName: string;
      departmentNameShort?: string;
      parentId?: string;
      sortOrder?: number;
      hierarchyLevel: number;
      hierarchyPath: string;
      postalCode?: string;
      addressLine1?: string;
      addressLine2?: string;
      phoneNumber?: string;
      description?: string;
      stableId?: string; // コピー時は引継ぎ、新規時は自動生成
    };
  }): Promise<Department> {
    const { tenantId, versionId, createdBy, data } = params;

    return this.prisma.department.create({
      data: {
        tenantId, // tenant_id設定
        versionId,
        stableId: data.stableId ?? randomUUID(), // stable_id自動生成
        departmentCode: data.departmentCode,
        departmentName: data.departmentName,
        departmentNameShort: data.departmentNameShort ?? null,
        parentId: data.parentId ?? null,
        sortOrder: data.sortOrder ?? 0,
        hierarchyLevel: data.hierarchyLevel,
        hierarchyPath: data.hierarchyPath,
        isActive: true,
        postalCode: data.postalCode ?? null,
        addressLine1: data.addressLine1 ?? null,
        addressLine2: data.addressLine2 ?? null,
        phoneNumber: data.phoneNumber ?? null,
        description: data.description ?? null,
        createdBy, // 監査列
        updatedBy: createdBy, // 監査列（作成時は同じ）
      },
    });
  }

  /**
   * 部門一括作成（コピー時）
   */
  async createMany(params: {
    tenantId: string;
    versionId: string;
    createdBy: string;
    data: Array<{
      stableId: string;
      departmentCode: string;
      departmentName: string;
      departmentNameShort?: string;
      parentId?: string;
      sortOrder: number;
      hierarchyLevel: number;
      hierarchyPath: string;
      isActive: boolean;
      postalCode?: string;
      addressLine1?: string;
      addressLine2?: string;
      phoneNumber?: string;
      description?: string;
    }>;
  }): Promise<{ count: number }> {
    const { tenantId, versionId, createdBy, data } = params;

    const result = await this.prisma.department.createMany({
      data: data.map((dept) => ({
        tenantId,
        versionId,
        stableId: dept.stableId,
        departmentCode: dept.departmentCode,
        departmentName: dept.departmentName,
        departmentNameShort: dept.departmentNameShort ?? null,
        parentId: dept.parentId ?? null,
        sortOrder: dept.sortOrder,
        hierarchyLevel: dept.hierarchyLevel,
        hierarchyPath: dept.hierarchyPath,
        isActive: dept.isActive,
        postalCode: dept.postalCode ?? null,
        addressLine1: dept.addressLine1 ?? null,
        addressLine2: dept.addressLine2 ?? null,
        phoneNumber: dept.phoneNumber ?? null,
        description: dept.description ?? null,
        createdBy,
        updatedBy: createdBy,
      })),
    });

    return result;
  }

  /**
   * 部門更新
   */
  async update(params: {
    tenantId: string;
    departmentId: string;
    updatedBy: string;
    data: {
      departmentCode?: string;
      departmentName?: string;
      departmentNameShort?: string | null;
      parentId?: string | null;
      sortOrder?: number;
      hierarchyLevel?: number;
      hierarchyPath?: string;
      isActive?: boolean;
      postalCode?: string | null;
      addressLine1?: string | null;
      addressLine2?: string | null;
      phoneNumber?: string | null;
      description?: string | null;
    };
  }): Promise<Department | null> {
    const { tenantId, departmentId, updatedBy, data } = params;

    const updated = await this.prisma.department.updateMany({
      where: {
        id: departmentId,
        tenantId, // tenant_id guard
      },
      data: {
        ...(data.departmentCode !== undefined && { departmentCode: data.departmentCode }),
        ...(data.departmentName !== undefined && { departmentName: data.departmentName }),
        ...(data.departmentNameShort !== undefined && {
          departmentNameShort: data.departmentNameShort,
        }),
        ...(data.parentId !== undefined && { parentId: data.parentId }),
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
        ...(data.hierarchyLevel !== undefined && { hierarchyLevel: data.hierarchyLevel }),
        ...(data.hierarchyPath !== undefined && { hierarchyPath: data.hierarchyPath }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.postalCode !== undefined && { postalCode: data.postalCode }),
        ...(data.addressLine1 !== undefined && { addressLine1: data.addressLine1 }),
        ...(data.addressLine2 !== undefined && { addressLine2: data.addressLine2 }),
        ...(data.phoneNumber !== undefined && { phoneNumber: data.phoneNumber }),
        ...(data.description !== undefined && { description: data.description }),
        updatedBy, // 監査列
      },
    });

    if (updated.count === 0) {
      return null;
    }

    return this.findById({ tenantId, departmentId });
  }

  /**
   * 部門コード重複チェック
   */
  async checkDepartmentCodeDuplicate(params: {
    tenantId: string;
    versionId: string;
    departmentCode: string;
    excludeDepartmentId?: string;
  }): Promise<boolean> {
    const { tenantId, versionId, departmentCode, excludeDepartmentId } = params;

    const where: Prisma.DepartmentWhereInput = {
      tenantId, // tenant_id guard
      versionId,
      departmentCode,
    };

    if (excludeDepartmentId) {
      where.id = { not: excludeDepartmentId };
    }

    const count = await this.prisma.department.count({ where });
    return count > 0;
  }
}
