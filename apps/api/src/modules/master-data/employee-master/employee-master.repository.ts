// master-data/employee-master Repository
// FR-LIST-08: tenant_id required + double-where guard
//
// 実装要件:
// - すべてのメソッドでtenant_idを必須パラメータとして受け取る
// - すべてのクエリでwhere句に tenant_id = ? を追加（二重ガード）
// - sortByマッピング: DTOキー（camelCase）→ DB列名（snake_case）
// - 検索条件の一致仕様: employeeCode完全一致、employeeName部分一致（ILIKE）

import { Injectable } from '@nestjs/common'
import { Employee, Prisma } from '@prisma/client'
import { PrismaService } from '../../../prisma/prisma.service'
import {
  EmployeeMasterErrorCode,
} from '@epm/contracts/api/errors'

// sortByマッピング: DTOキー（camelCase）→ DB列名
const SORT_BY_MAPPING: Record<string, keyof Prisma.EmployeeOrderByWithRelationInput> = {
  employeeCode: 'employeeCode',
  employeeName: 'employeeName',
}

export interface FindManyParams {
  offset: number
  limit: number
  sortBy: string
  sortOrder: 'asc' | 'desc'
  employeeCode?: string
  employeeName?: string
  includeInactive?: boolean
}

export interface CreateData {
  employeeCode: string
  employeeName: string
  organizationKey?: string | null
  createdBy: string
  updatedBy: string
}

export interface UpdateData {
  employeeName?: string
  organizationKey?: string | null
  updatedBy: string
}

@Injectable()
export class EmployeeMasterRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 一覧検索（offset, limit, sortBy, sortOrder, filters）
   * FR-LIST-01: 一覧検索
   */
  async findMany(
    tenantId: string,
    params: FindManyParams
  ): Promise<{ items: Employee[]; totalCount: number }> {
    const {
      offset,
      limit,
      sortBy,
      sortOrder,
      employeeCode,
      employeeName,
      includeInactive,
    } = params

    // sortByの検証とマッピング
    const mappedSortBy = SORT_BY_MAPPING[sortBy]
    if (!mappedSortBy) {
      throw new RepositoryError(
        EmployeeMasterErrorCode.VALIDATION_ERROR,
        `Invalid sortBy: ${sortBy}`
      )
    }

    // 検索条件構築（tenant_idは必須）
    const where: Prisma.EmployeeWhereInput = {
      tenantId, // 二重ガード: 必ずtenant_idを含める
      ...(employeeCode && { employeeCode }), // 完全一致
      ...(employeeName && {
        employeeName: { contains: employeeName.trim(), mode: 'insensitive' },
      }), // 部分一致
      ...(!includeInactive && { isActive: true }), // デフォルト: 有効のみ
    }

    const [items, totalCount] = await Promise.all([
      this.prisma.employee.findMany({
        where,
        orderBy: { [mappedSortBy]: sortOrder },
        skip: offset,
        take: limit,
      }),
      this.prisma.employee.count({ where }),
    ])

    return { items, totalCount }
  }

  /**
   * ID検索
   * FR-LIST-02: 詳細取得
   */
  async findById(tenantId: string, id: string): Promise<Employee | null> {
    return this.prisma.employee.findFirst({
      where: {
        id,
        tenantId, // 二重ガード
      },
    })
  }

  /**
   * 社員コード検索
   */
  async findByEmployeeCode(tenantId: string, employeeCode: string): Promise<Employee | null> {
    return this.prisma.employee.findFirst({
      where: {
        employeeCode,
        tenantId, // 二重ガード
      },
    })
  }

  /**
   * 作成
   * FR-LIST-03: 新規作成
   */
  async create(tenantId: string, data: CreateData): Promise<Employee> {
    return this.prisma.employee.create({
      data: {
        tenantId,
        ...data,
        isActive: true,
      },
    })
  }

  /**
   * 更新
   * FR-LIST-04: 更新
   */
  async update(
    tenantId: string,
    id: string,
    data: UpdateData
  ): Promise<Employee | null> {
    const result = await this.prisma.employee.updateMany({
      where: {
        id,
        tenantId, // 二重ガード
      },
      data: {
        ...data,
      },
    })

    if (result.count === 0) {
      return null
    }

    return this.findById(tenantId, id)
  }

  /**
   * 状態更新（無効化/再有効化）
   * FR-LIST-05, FR-LIST-06: 無効化/再有効化
   */
  async updateStatus(
    tenantId: string,
    id: string,
    isActive: boolean,
    updatedBy: string
  ): Promise<Employee | null> {
    const result = await this.prisma.employee.updateMany({
      where: {
        id,
        tenantId, // 二重ガード
      },
      data: {
        isActive,
        updatedBy,
      },
    })

    if (result.count === 0) {
      return null
    }

    return this.findById(tenantId, id)
  }
}

// Repository層で発生するエラー
export class RepositoryError extends Error {
  constructor(
    public readonly code: string,
    message: string
  ) {
    super(message)
    this.name = 'RepositoryError'
  }
}
