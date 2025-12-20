// master-data/project-master Domain service
// FR-LIST-03 ~ FR-LIST-09: ビジネスルール + トランザクション境界
//
// 実装要件:
// - projectCode変更不可チェック
// - projectCode一意性チェック
// - 日付範囲バリデーション
// - 楽観ロック（ifMatchVersion）
// - テナント境界チェック
// - wire-format（ISO 8601 string、decimal string）からDomain内部型へのparse

import { Injectable } from '@nestjs/common'
import { Project, Prisma } from '@prisma/client'
import {
  ListProjectMasterRequest,
  CreateProjectMasterRequest,
  UpdateProjectMasterRequest,
  ProjectMasterEntity,
  ListProjectMasterResponse,
} from '@epm/contracts/api/project-master'
import {
  ProjectMasterErrorCode,
  ProjectMasterError,
} from '@epm/contracts/api/errors'
import {
  ProjectMasterRepository,
  CreateData,
  UpdateData,
  FindManyParams,
} from './project-master.repository'

export class ServiceError extends Error {
  constructor(
    public readonly error: ProjectMasterError
  ) {
    super(error.message)
    this.name = 'ServiceError'
  }
}

function createError(code: ProjectMasterErrorCode, message: string, details?: Record<string, unknown>): ServiceError {
  return new ServiceError({ code, message, details })
}

// wire-format変換ヘルパー
function parseISODate(isoString: string): Date {
  const date = new Date(isoString)
  if (isNaN(date.getTime())) {
    throw createError(ProjectMasterErrorCode.VALIDATION_ERROR, `Invalid date format: ${isoString}`)
  }
  return date
}

function parseDecimal(decimalString: string): Prisma.Decimal {
  try {
    return new Prisma.Decimal(decimalString)
  } catch {
    throw createError(ProjectMasterErrorCode.VALIDATION_ERROR, `Invalid decimal format: ${decimalString}`)
  }
}

// Project → ProjectMasterEntity 変換
function toEntity(project: Project): ProjectMasterEntity {
  return {
    id: project.id,
    tenantId: project.tenantId,
    projectCode: project.projectCode,
    projectName: project.projectName,
    projectShortName: project.projectShortName,
    projectKanaName: project.projectKanaName,
    departmentCode: project.departmentCode,
    responsibleEmployeeCode: project.responsibleEmployeeCode,
    responsibleEmployeeName: project.responsibleEmployeeName,
    plannedPeriodFrom: project.plannedPeriodFrom.toISOString(),
    plannedPeriodTo: project.plannedPeriodTo.toISOString(),
    actualPeriodFrom: project.actualPeriodFrom?.toISOString() ?? null,
    actualPeriodTo: project.actualPeriodTo?.toISOString() ?? null,
    budgetAmount: project.budgetAmount.toString(),
    version: project.version,
    isActive: project.isActive,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
    createdBy: project.createdBy,
    updatedBy: project.updatedBy,
  }
}

@Injectable()
export class ProjectMasterService {
  constructor(private readonly repository: ProjectMasterRepository) {}

  /**
   * 一覧検索
   * FR-LIST-01: 権限チェック: epm.project-master.read
   */
  async list(
    tenantId: string,
    request: ListProjectMasterRequest
  ): Promise<ListProjectMasterResponse> {
    const params: FindManyParams = {
      offset: request.offset,
      limit: request.limit,
      sortBy: request.sortBy,
      sortOrder: request.sortOrder,
      projectCode: request.projectCode,
      projectName: request.projectName,
      projectShortName: request.projectShortName,
      departmentCode: request.departmentCode,
      responsibleEmployeeCode: request.responsibleEmployeeCode,
      includeInactive: request.includeInactive,
    }

    const { items, totalCount } = await this.repository.findMany(tenantId, params)

    return {
      items: items.map(toEntity),
      totalCount,
    }
  }

  /**
   * 詳細取得
   * FR-LIST-02: 権限チェック: epm.project-master.read
   */
  async findById(tenantId: string, id: string): Promise<ProjectMasterEntity> {
    const project = await this.repository.findById(tenantId, id)

    if (!project) {
      throw createError(
        ProjectMasterErrorCode.PROJECT_NOT_FOUND,
        `Project not found: ${id}`
      )
    }

    return toEntity(project)
  }

  /**
   * 作成
   * FR-LIST-03: 権限チェック: epm.project-master.create
   */
  async create(
    tenantId: string,
    userId: string,
    request: CreateProjectMasterRequest
  ): Promise<ProjectMasterEntity> {
    // 1. projectCode一意性チェック
    const existing = await this.repository.findByProjectCode(tenantId, request.projectCode)
    if (existing) {
      throw createError(
        ProjectMasterErrorCode.PROJECT_CODE_DUPLICATE,
        `Project code already exists: ${request.projectCode}`
      )
    }

    // 2. 日付バリデーション
    const plannedPeriodFrom = parseISODate(request.plannedPeriodFrom)
    const plannedPeriodTo = parseISODate(request.plannedPeriodTo)

    if (plannedPeriodFrom > plannedPeriodTo) {
      throw createError(
        ProjectMasterErrorCode.INVALID_DATE_RANGE,
        'Planned period from must be before or equal to planned period to'
      )
    }

    let actualPeriodFrom: Date | null = null
    let actualPeriodTo: Date | null = null

    if (request.actualPeriodFrom) {
      actualPeriodFrom = parseISODate(request.actualPeriodFrom)

      if (!request.actualPeriodTo) {
        throw createError(
          ProjectMasterErrorCode.ACTUAL_PERIOD_TO_REQUIRED,
          'Actual period to is required when actual period from is specified'
        )
      }

      actualPeriodTo = parseISODate(request.actualPeriodTo)

      if (actualPeriodFrom > actualPeriodTo) {
        throw createError(
          ProjectMasterErrorCode.INVALID_DATE_RANGE,
          'Actual period from must be before or equal to actual period to'
        )
      }
    } else if (request.actualPeriodTo) {
      actualPeriodTo = parseISODate(request.actualPeriodTo)
    }

    // 3. 金額のparse
    const budgetAmount = parseDecimal(request.budgetAmount)

    // 4. 作成
    const data: CreateData = {
      projectCode: request.projectCode,
      projectName: request.projectName,
      projectShortName: request.projectShortName,
      projectKanaName: request.projectKanaName,
      departmentCode: request.departmentCode,
      responsibleEmployeeCode: request.responsibleEmployeeCode,
      responsibleEmployeeName: request.responsibleEmployeeName,
      plannedPeriodFrom,
      plannedPeriodTo,
      actualPeriodFrom,
      actualPeriodTo,
      budgetAmount,
      createdBy: userId,
      updatedBy: userId,
    }

    const created = await this.repository.create(tenantId, data)

    // TODO: 監査ログ記録

    return toEntity(created)
  }

  /**
   * 更新
   * FR-LIST-04: 権限チェック: epm.project-master.update
   */
  async update(
    tenantId: string,
    userId: string,
    id: string,
    request: UpdateProjectMasterRequest
  ): Promise<ProjectMasterEntity> {
    // 1. 既存レコード取得
    const existing = await this.repository.findById(tenantId, id)
    if (!existing) {
      throw createError(
        ProjectMasterErrorCode.PROJECT_NOT_FOUND,
        `Project not found: ${id}`
      )
    }

    // 2. 楽観ロックチェック（先にversion確認）
    if (existing.version !== request.ifMatchVersion) {
      throw createError(
        ProjectMasterErrorCode.STALE_UPDATE,
        'The project has been modified by another user. Please refresh and try again.'
      )
    }

    // 3. 日付バリデーション
    let plannedPeriodFrom: Date | undefined
    let plannedPeriodTo: Date | undefined

    if (request.plannedPeriodFrom !== undefined) {
      plannedPeriodFrom = parseISODate(request.plannedPeriodFrom)
    }
    if (request.plannedPeriodTo !== undefined) {
      plannedPeriodTo = parseISODate(request.plannedPeriodTo)
    }

    // From/To両方が指定されているか、どちらかが既存値を使う場合の検証
    const finalFrom = plannedPeriodFrom ?? existing.plannedPeriodFrom
    const finalTo = plannedPeriodTo ?? existing.plannedPeriodTo
    if (finalFrom > finalTo) {
      throw createError(
        ProjectMasterErrorCode.INVALID_DATE_RANGE,
        'Planned period from must be before or equal to planned period to'
      )
    }

    // 実績期間の検証
    let actualPeriodFrom: Date | null | undefined
    let actualPeriodTo: Date | null | undefined

    if (request.actualPeriodFrom !== undefined) {
      actualPeriodFrom = request.actualPeriodFrom ? parseISODate(request.actualPeriodFrom) : null
    }
    if (request.actualPeriodTo !== undefined) {
      actualPeriodTo = request.actualPeriodTo ? parseISODate(request.actualPeriodTo) : null
    }

    const finalActualFrom = actualPeriodFrom !== undefined ? actualPeriodFrom : existing.actualPeriodFrom
    const finalActualTo = actualPeriodTo !== undefined ? actualPeriodTo : existing.actualPeriodTo

    if (finalActualFrom && !finalActualTo) {
      throw createError(
        ProjectMasterErrorCode.ACTUAL_PERIOD_TO_REQUIRED,
        'Actual period to is required when actual period from is specified'
      )
    }
    if (finalActualFrom && finalActualTo && finalActualFrom > finalActualTo) {
      throw createError(
        ProjectMasterErrorCode.INVALID_DATE_RANGE,
        'Actual period from must be before or equal to actual period to'
      )
    }

    // 4. 金額のparse
    let budgetAmount: Prisma.Decimal | undefined
    if (request.budgetAmount !== undefined) {
      budgetAmount = parseDecimal(request.budgetAmount)
    }

    // 5. 更新データ構築
    const data: UpdateData = {
      ...(request.projectName !== undefined && { projectName: request.projectName }),
      ...(request.projectShortName !== undefined && { projectShortName: request.projectShortName }),
      ...(request.projectKanaName !== undefined && { projectKanaName: request.projectKanaName }),
      ...(request.departmentCode !== undefined && { departmentCode: request.departmentCode }),
      ...(request.responsibleEmployeeCode !== undefined && { responsibleEmployeeCode: request.responsibleEmployeeCode }),
      ...(request.responsibleEmployeeName !== undefined && { responsibleEmployeeName: request.responsibleEmployeeName }),
      ...(plannedPeriodFrom && { plannedPeriodFrom }),
      ...(plannedPeriodTo && { plannedPeriodTo }),
      ...(actualPeriodFrom !== undefined && { actualPeriodFrom }),
      ...(actualPeriodTo !== undefined && { actualPeriodTo }),
      ...(budgetAmount && { budgetAmount }),
      updatedBy: userId,
    }

    // 6. 更新実行（楽観ロック）
    const updated = await this.repository.update(tenantId, id, data, request.ifMatchVersion)
    if (!updated) {
      // 楽観ロック失敗（他のユーザーが先に更新した）
      throw createError(
        ProjectMasterErrorCode.STALE_UPDATE,
        'The project has been modified by another user. Please refresh and try again.'
      )
    }

    // TODO: 監査ログ記録

    return toEntity(updated)
  }

  /**
   * 無効化
   * FR-LIST-05: 権限チェック: epm.project-master.update
   */
  async deactivate(
    tenantId: string,
    userId: string,
    id: string,
    ifMatchVersion: number
  ): Promise<ProjectMasterEntity> {
    // 1. 既存レコード取得
    const existing = await this.repository.findById(tenantId, id)
    if (!existing) {
      throw createError(
        ProjectMasterErrorCode.PROJECT_NOT_FOUND,
        `Project not found: ${id}`
      )
    }

    // 2. 既に無効化されているかチェック
    if (!existing.isActive) {
      throw createError(
        ProjectMasterErrorCode.PROJECT_ALREADY_INACTIVE,
        'Project is already inactive'
      )
    }

    // 3. 楽観ロックチェック
    if (existing.version !== ifMatchVersion) {
      throw createError(
        ProjectMasterErrorCode.STALE_UPDATE,
        'The project has been modified by another user. Please refresh and try again.'
      )
    }

    // 4. 無効化実行
    const updated = await this.repository.updateStatus(tenantId, id, false, userId, ifMatchVersion)
    if (!updated) {
      throw createError(
        ProjectMasterErrorCode.STALE_UPDATE,
        'The project has been modified by another user. Please refresh and try again.'
      )
    }

    // TODO: 監査ログ記録

    return toEntity(updated)
  }

  /**
   * 再有効化
   * FR-LIST-06: 権限チェック: epm.project-master.update
   */
  async reactivate(
    tenantId: string,
    userId: string,
    id: string,
    ifMatchVersion: number
  ): Promise<ProjectMasterEntity> {
    // 1. 既存レコード取得
    const existing = await this.repository.findById(tenantId, id)
    if (!existing) {
      throw createError(
        ProjectMasterErrorCode.PROJECT_NOT_FOUND,
        `Project not found: ${id}`
      )
    }

    // 2. 既に有効かチェック
    if (existing.isActive) {
      throw createError(
        ProjectMasterErrorCode.PROJECT_ALREADY_ACTIVE,
        'Project is already active'
      )
    }

    // 3. 楽観ロックチェック
    if (existing.version !== ifMatchVersion) {
      throw createError(
        ProjectMasterErrorCode.STALE_UPDATE,
        'The project has been modified by another user. Please refresh and try again.'
      )
    }

    // 4. 再有効化実行
    const updated = await this.repository.updateStatus(tenantId, id, true, userId, ifMatchVersion)
    if (!updated) {
      throw createError(
        ProjectMasterErrorCode.STALE_UPDATE,
        'The project has been modified by another user. Please refresh and try again.'
      )
    }

    // TODO: 監査ログ記録

    return toEntity(updated)
  }
}
