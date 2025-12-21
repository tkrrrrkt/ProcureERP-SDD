import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { Prisma, Employee } from '@prisma/client';
import {
  EmployeeSortBy,
  SortOrder,
} from '@procure/contracts/api/employee-master';

/**
 * Employee Repository
 *
 * DBアクセス層（tenant_id double-guard）
 * - すべてのメソッドは tenant_id を必須パラメータとして受け取る
 * - WHERE句に必ず tenant_id を含める
 * - RLS + アプリケーション層の二重ガード
 */
@Injectable()
export class EmployeeRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 社員一覧取得
   */
  async findMany(params: {
    tenantId: string;
    offset: number;
    limit: number;
    sortBy?: EmployeeSortBy;
    sortOrder?: SortOrder;
    keyword?: string;
  }): Promise<{ items: Employee[]; total: number }> {
    const { tenantId, offset, limit, sortBy, sortOrder, keyword } = params;

    // tenant_id double-guard: WHERE句に必ず含める
    const where: Prisma.EmployeeWhereInput = {
      tenantId, // tenant_id guard
    };

    // キーワード検索: 部分一致（Case-insensitive）
    if (keyword) {
      where.OR = [
        { employeeCode: { contains: keyword, mode: 'insensitive' } },
        { employeeName: { contains: keyword, mode: 'insensitive' } },
        { employeeKanaName: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    // ソートフィールドのマッピング
    const sortField = sortBy || 'employeeCode';
    const sortDirection = sortOrder || 'asc';

    const orderBy: Prisma.EmployeeOrderByWithRelationInput = {
      [sortField]: sortDirection,
    };

    // 並列実行: データ取得と総件数取得
    const [items, total] = await Promise.all([
      this.prisma.employee.findMany({
        where,
        orderBy,
        skip: offset,
        take: limit,
      }),
      this.prisma.employee.count({ where }),
    ]);

    return { items, total };
  }

  /**
   * 社員詳細取得
   */
  async findOne(params: {
    tenantId: string;
    employeeId: string;
  }): Promise<Employee | null> {
    const { tenantId, employeeId } = params;

    // tenant_id double-guard: WHERE句に必ず含める
    return this.prisma.employee.findFirst({
      where: {
        id: employeeId,
        tenantId, // tenant_id guard
      },
    });
  }

  /**
   * 社員新規登録
   */
  async create(params: {
    tenantId: string;
    data: {
      employeeCode: string;
      employeeName: string;
      employeeKanaName: string;
      email?: string;
      joinDate: Date;
      retireDate?: Date;
      remarks?: string;
      isActive?: boolean;
    };
  }): Promise<Employee> {
    const { tenantId, data } = params;

    return this.prisma.employee.create({
      data: {
        tenantId, // tenant_id設定
        employeeCode: data.employeeCode,
        employeeName: data.employeeName,
        employeeKanaName: data.employeeKanaName,
        email: data.email ?? null,
        joinDate: data.joinDate,
        retireDate: data.retireDate ?? null,
        remarks: data.remarks ?? null,
        isActive: data.isActive ?? true,
        version: 1, // 初期バージョン
      },
    });
  }

  /**
   * 社員更新（楽観ロック）
   */
  async update(params: {
    tenantId: string;
    employeeId: string;
    version: number;
    data: {
      employeeCode: string;
      employeeName: string;
      employeeKanaName: string;
      email?: string;
      joinDate: Date;
      retireDate?: Date;
      remarks?: string;
      isActive: boolean;
    };
  }): Promise<Employee | null> {
    const { tenantId, employeeId, version, data } = params;

    try {
      // 楽観ロック: WHERE句に version を含める
      // tenant_id double-guard: WHERE句に tenantId を含める
      const updated = await this.prisma.employee.updateMany({
        where: {
          id: employeeId,
          tenantId, // tenant_id guard
          version, // optimistic lock
        },
        data: {
          employeeCode: data.employeeCode,
          employeeName: data.employeeName,
          employeeKanaName: data.employeeKanaName,
          email: data.email ?? null,
          joinDate: data.joinDate,
          retireDate: data.retireDate ?? null,
          remarks: data.remarks ?? null,
          isActive: data.isActive,
          version: version + 1, // version increment
        },
      });

      // 更新件数が0の場合は競合（または存在しない）
      if (updated.count === 0) {
        return null;
      }

      // 更新後のデータを取得
      return this.findOne({ tenantId, employeeId });
    } catch (error) {
      throw error;
    }
  }

  /**
   * 社員コード重複チェック
   */
  async checkEmployeeCodeDuplicate(params: {
    tenantId: string;
    employeeCode: string;
    excludeEmployeeId?: string; // 更新時は自分自身を除外
  }): Promise<boolean> {
    const { tenantId, employeeCode, excludeEmployeeId } = params;

    const where: Prisma.EmployeeWhereInput = {
      tenantId, // tenant_id guard
      employeeCode,
    };

    // 更新時は自分自身を除外
    if (excludeEmployeeId) {
      where.id = { not: excludeEmployeeId };
    }

    const count = await this.prisma.employee.count({ where });
    return count > 0;
  }
}
