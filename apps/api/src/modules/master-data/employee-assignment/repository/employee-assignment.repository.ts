import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { Prisma, EmployeeAssignment } from '@prisma/client';
import {
  AssignmentSortBy,
  SortOrder,
} from '@procure/contracts/api/employee-assignment';

/**
 * Employee Assignment Repository
 *
 * DBアクセス層（tenant_id double-guard）
 * - すべてのメソッドは tenant_id を必須パラメータとして受け取る
 * - WHERE句に必ず tenant_id を含める
 * - RLS + アプリケーション層の二重ガード
 */
@Injectable()
export class EmployeeAssignmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 社員別の所属一覧取得（論理削除除外）
   */
  async findByEmployeeId(params: {
    tenantId: string;
    employeeId: string;
    sortBy?: AssignmentSortBy;
    sortOrder?: SortOrder;
  }): Promise<EmployeeAssignment[]> {
    const { tenantId, employeeId, sortBy, sortOrder } = params;

    // tenant_id double-guard: WHERE句に必ず含める
    const where: Prisma.EmployeeAssignmentWhereInput = {
      tenantId, // tenant_id guard
      employeeId,
      isActive: true, // 論理削除除外
    };

    // ソートフィールドのマッピング
    const sortField = sortBy || 'effectiveDate';
    const sortDirection = sortOrder || 'desc';

    const orderBy: Prisma.EmployeeAssignmentOrderByWithRelationInput = {
      [sortField]: sortDirection,
    };

    return this.prisma.employeeAssignment.findMany({
      where,
      orderBy,
    });
  }

  /**
   * 所属情報の取得
   */
  async findOne(params: {
    tenantId: string;
    assignmentId: string;
  }): Promise<EmployeeAssignment | null> {
    const { tenantId, assignmentId } = params;

    // tenant_id double-guard: WHERE句に必ず含める
    return this.prisma.employeeAssignment.findFirst({
      where: {
        id: assignmentId,
        tenantId, // tenant_id guard
      },
    });
  }

  /**
   * 所属情報の作成
   */
  async create(params: {
    tenantId: string;
    employeeId: string;
    createdBy: string;
    data: {
      departmentStableId: string;
      assignmentType: string;
      allocationRatio?: number;
      title?: string;
      effectiveDate: Date;
      expiryDate?: Date;
    };
  }): Promise<EmployeeAssignment> {
    const { tenantId, employeeId, createdBy, data } = params;

    return this.prisma.employeeAssignment.create({
      data: {
        tenantId, // tenant_id設定
        employeeId,
        departmentStableId: data.departmentStableId,
        assignmentType: data.assignmentType,
        allocationRatio: data.allocationRatio ?? null,
        title: data.title ?? null,
        effectiveDate: data.effectiveDate,
        expiryDate: data.expiryDate ?? null,
        isActive: true,
        version: 1, // 初期バージョン
        createdByLoginAccountId: createdBy, // 監査列
        updatedByLoginAccountId: createdBy, // 監査列（作成時は同じ）
      },
    });
  }

  /**
   * 所属情報の更新（楽観ロック）
   */
  async update(params: {
    tenantId: string;
    assignmentId: string;
    version: number;
    updatedBy: string;
    data: {
      departmentStableId: string;
      assignmentType: string;
      allocationRatio?: number | null;
      title?: string | null;
      effectiveDate: Date;
      expiryDate?: Date | null;
    };
  }): Promise<EmployeeAssignment | null> {
    const { tenantId, assignmentId, version, updatedBy, data } = params;

    // 楽観ロック: WHERE句に version を含める
    // tenant_id double-guard: WHERE句に tenantId を含める
    const updated = await this.prisma.employeeAssignment.updateMany({
      where: {
        id: assignmentId,
        tenantId, // tenant_id guard
        version, // optimistic lock
        isActive: true, // 論理削除されていないこと
      },
      data: {
        departmentStableId: data.departmentStableId,
        assignmentType: data.assignmentType,
        allocationRatio: data.allocationRatio ?? null,
        title: data.title ?? null,
        effectiveDate: data.effectiveDate,
        expiryDate: data.expiryDate ?? null,
        version: version + 1, // version increment
        updatedByLoginAccountId: updatedBy, // 監査列
      },
    });

    // 更新件数が0の場合は競合（または存在しない）
    if (updated.count === 0) {
      return null;
    }

    // 更新後のデータを取得
    return this.findOne({ tenantId, assignmentId });
  }

  /**
   * 所属情報の論理削除（楽観ロック）
   */
  async softDelete(params: {
    tenantId: string;
    assignmentId: string;
    version: number;
    updatedBy: string;
  }): Promise<boolean> {
    const { tenantId, assignmentId, version, updatedBy } = params;

    // 楽観ロック: WHERE句に version を含める
    // tenant_id double-guard: WHERE句に tenantId を含める
    const updated = await this.prisma.employeeAssignment.updateMany({
      where: {
        id: assignmentId,
        tenantId, // tenant_id guard
        version, // optimistic lock
        isActive: true, // 既に削除されていないこと
      },
      data: {
        isActive: false, // 論理削除
        version: version + 1, // version increment
        updatedByLoginAccountId: updatedBy, // 監査列
      },
    });

    return updated.count > 0;
  }

  /**
   * 主務重複チェック
   *
   * 同一社員・同時期（期間重複）に primary がないかチェック
   * 期間重複条件: effective_date <= other.expiry_date AND expiry_date >= other.effective_date
   *              (expiry_date が NULL の場合は無期限とみなす)
   */
  async checkPrimaryOverlap(params: {
    tenantId: string;
    employeeId: string;
    effectiveDate: Date;
    expiryDate?: Date | null;
    excludeId?: string; // 更新時は自分自身を除外
  }): Promise<boolean> {
    const { tenantId, employeeId, effectiveDate, expiryDate, excludeId } = params;

    // 期間重複の条件を構築
    // 新規レコード: [effectiveDate, expiryDate]
    // 既存レコード: [existing.effectiveDate, existing.expiryDate]
    // 重複条件: effectiveDate <= existing.expiryDate AND (expiryDate IS NULL OR expiryDate >= existing.effectiveDate)
    const where: Prisma.EmployeeAssignmentWhereInput = {
      tenantId, // tenant_id guard
      employeeId,
      assignmentType: 'primary',
      isActive: true, // 論理削除除外
      // 期間重複チェック
      AND: [
        // 新規の開始日 <= 既存の終了日（既存が無期限の場合も含む）
        {
          OR: [
            { expiryDate: { gte: effectiveDate } },
            { expiryDate: null }, // 既存が無期限
          ],
        },
        // 新規の終了日 >= 既存の開始日（新規が無期限の場合も含む）
        expiryDate
          ? { effectiveDate: { lte: expiryDate } }
          : {}, // 新規が無期限の場合は常に重複可能性あり
      ],
    };

    // 更新時は自分自身を除外
    if (excludeId) {
      where.id = { not: excludeId };
    }

    const count = await this.prisma.employeeAssignment.count({ where });
    return count > 0;
  }

  /**
   * 社員存在チェック
   */
  async checkEmployeeExists(params: {
    tenantId: string;
    employeeId: string;
  }): Promise<boolean> {
    const { tenantId, employeeId } = params;

    const count = await this.prisma.employee.count({
      where: {
        id: employeeId,
        tenantId, // tenant_id guard
      },
    });

    return count > 0;
  }
}
