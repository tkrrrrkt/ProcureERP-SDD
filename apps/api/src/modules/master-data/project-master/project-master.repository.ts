// master-data/project-master Repository
// FR-LIST-08: tenant_id required + double-where guard
//
// 実装要件:
// - すべてのメソッドでtenant_idを必須パラメータとして受け取る
// - すべてのクエリでwhere句に tenant_id = ? を追加（二重ガード）
// - sortByマッピング: DTOキー（camelCase）→ DB列名（snake_case）
// - 検索条件の一致仕様: projectCode完全一致、他は部分一致（ILIKE）
// - 楽観ロック: 更新時にversionをチェック

import { Injectable } from '@nestjs/common'
import { Project, Prisma } from '@prisma/client'
import { PrismaService } from '../../../prisma/prisma.service'
import {
  ProjectMasterErrorCode,
} from '@epm/contracts/api/errors'

// sortByマッピング: DTOキー（camelCase）→ DB列名
const SORT_BY_MAPPING: Record<string, keyof Prisma.ProjectOrderByWithRelationInput> = {
  projectCode: 'projectCode',
  projectName: 'projectName',
  projectShortName: 'projectShortName',
  plannedPeriodFrom: 'plannedPeriodFrom',
  budgetAmount: 'budgetAmount',
}

export interface FindManyParams {
  offset: number
  limit: number
  sortBy: string
  sortOrder: 'asc' | 'desc'
  projectCode?: string
  projectName?: string
  projectShortName?: string
  departmentCode?: string
  responsibleEmployeeCode?: string
  includeInactive?: boolean
}

export interface CreateData {
  projectCode: string
  projectName: string
  projectShortName?: string | null
  projectKanaName?: string | null
  departmentCode?: string | null
  responsibleEmployeeCode?: string | null
  responsibleEmployeeName?: string | null
  plannedPeriodFrom: Date
  plannedPeriodTo: Date
  actualPeriodFrom?: Date | null
  actualPeriodTo?: Date | null
  budgetAmount: Prisma.Decimal
  createdBy: string
  updatedBy: string
}

export interface UpdateData {
  projectName?: string
  projectShortName?: string | null
  projectKanaName?: string | null
  departmentCode?: string | null
  responsibleEmployeeCode?: string | null
  responsibleEmployeeName?: string | null
  plannedPeriodFrom?: Date
  plannedPeriodTo?: Date
  actualPeriodFrom?: Date | null
  actualPeriodTo?: Date | null
  budgetAmount?: Prisma.Decimal
  updatedBy: string
}

@Injectable()
export class ProjectMasterRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 一覧検索（offset, limit, sortBy, sortOrder, filters）
   * FR-LIST-01: 一覧検索
   */
  async findMany(
    tenantId: string,
    params: FindManyParams
  ): Promise<{ items: Project[]; totalCount: number }> {
    const {
      offset,
      limit,
      sortBy,
      sortOrder,
      projectCode,
      projectName,
      projectShortName,
      departmentCode,
      responsibleEmployeeCode,
      includeInactive,
    } = params

    // sortByの検証とマッピング
    const mappedSortBy = SORT_BY_MAPPING[sortBy]
    if (!mappedSortBy) {
      throw new RepositoryError(
        ProjectMasterErrorCode.VALIDATION_ERROR,
        `Invalid sortBy: ${sortBy}`
      )
    }

    // 検索条件構築（tenant_idは必須）
    const where: Prisma.ProjectWhereInput = {
      tenantId, // 二重ガード: 必ずtenant_idを含める
      ...(projectCode && { projectCode }), // 完全一致
      ...(projectName && {
        projectName: { contains: projectName.trim(), mode: 'insensitive' },
      }), // 部分一致
      ...(projectShortName && {
        projectShortName: { contains: projectShortName.trim(), mode: 'insensitive' },
      }), // 部分一致
      ...(departmentCode && { departmentCode }), // 完全一致
      ...(responsibleEmployeeCode && { responsibleEmployeeCode }), // 完全一致
      ...(!includeInactive && { isActive: true }), // デフォルト: 有効のみ
    }

    const [items, totalCount] = await Promise.all([
      this.prisma.project.findMany({
        where,
        orderBy: { [mappedSortBy]: sortOrder },
        skip: offset,
        take: limit,
      }),
      this.prisma.project.count({ where }),
    ])

    return { items, totalCount }
  }

  /**
   * ID検索
   * FR-LIST-02: 詳細取得
   */
  async findById(tenantId: string, id: string): Promise<Project | null> {
    return this.prisma.project.findFirst({
      where: {
        id,
        tenantId, // 二重ガード
      },
    })
  }

  /**
   * プロジェクトコード検索
   */
  async findByProjectCode(tenantId: string, projectCode: string): Promise<Project | null> {
    return this.prisma.project.findFirst({
      where: {
        projectCode,
        tenantId, // 二重ガード
      },
    })
  }

  /**
   * 作成
   * FR-LIST-03: 新規作成
   */
  async create(tenantId: string, data: CreateData): Promise<Project> {
    return this.prisma.project.create({
      data: {
        tenantId,
        ...data,
        version: 0,
        isActive: true,
      },
    })
  }

  /**
   * 更新（楽観ロック対応）
   * FR-LIST-04: 更新
   */
  async update(
    tenantId: string,
    id: string,
    data: UpdateData,
    expectedVersion: number
  ): Promise<Project | null> {
    // 楽観ロック: versionが一致するレコードのみ更新
    const result = await this.prisma.project.updateMany({
      where: {
        id,
        tenantId, // 二重ガード
        version: expectedVersion,
      },
      data: {
        ...data,
        version: { increment: 1 },
      },
    })

    if (result.count === 0) {
      // 更新されなかった場合は、レコードが存在しないか、versionが不一致
      return null
    }

    // 更新後のレコードを取得
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
    updatedBy: string,
    expectedVersion: number
  ): Promise<Project | null> {
    const result = await this.prisma.project.updateMany({
      where: {
        id,
        tenantId, // 二重ガード
        version: expectedVersion,
      },
      data: {
        isActive,
        updatedBy,
        version: { increment: 1 },
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
