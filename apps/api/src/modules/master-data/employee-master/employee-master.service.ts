// master-data/employee-master Domain service
// FR-LIST-03 ~ FR-LIST-09: ビジネスルール + トランザクション境界
//
// 実装要件:
// - employeeCode変更不可（UpdateRequestにemployeeCodeを含めない）
// - employeeCode一意性チェック
// - テナント境界チェック

import { Injectable } from '@nestjs/common'
import { Employee } from '@prisma/client'
import {
  ListEmployeeMasterRequest,
  CreateEmployeeMasterRequest,
  UpdateEmployeeMasterRequest,
  EmployeeMasterEntity,
  ListEmployeeMasterResponse,
} from '@epm/contracts/api/employee-master'
import {
  EmployeeMasterErrorCode,
  EmployeeMasterError,
} from '@epm/contracts/api/errors'
import {
  EmployeeMasterRepository,
  CreateData,
  UpdateData,
  FindManyParams,
} from './employee-master.repository'

export class ServiceError extends Error {
  constructor(
    public readonly error: EmployeeMasterError
  ) {
    super(error.message)
    this.name = 'ServiceError'
  }
}

function createError(code: EmployeeMasterErrorCode, message: string, details?: Record<string, unknown>): ServiceError {
  return new ServiceError({ code, message, details })
}

// Employee → EmployeeMasterEntity 変換
function toEntity(employee: Employee): EmployeeMasterEntity {
  return {
    id: employee.id,
    tenantId: employee.tenantId,
    employeeCode: employee.employeeCode,
    employeeName: employee.employeeName,
    organizationKey: employee.organizationKey,
    isActive: employee.isActive,
    createdAt: employee.createdAt.toISOString(),
    updatedAt: employee.updatedAt.toISOString(),
    createdBy: employee.createdBy,
    updatedBy: employee.updatedBy,
  }
}

@Injectable()
export class EmployeeMasterService {
  constructor(private readonly repository: EmployeeMasterRepository) {}

  /**
   * 一覧検索
   * FR-LIST-01: 権限チェック: epm.employee-master.read
   */
  async list(
    tenantId: string,
    request: ListEmployeeMasterRequest
  ): Promise<ListEmployeeMasterResponse> {
    const params: FindManyParams = {
      offset: request.offset,
      limit: request.limit,
      sortBy: request.sortBy,
      sortOrder: request.sortOrder,
      employeeCode: request.employeeCode,
      employeeName: request.employeeName,
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
   * FR-LIST-02: 権限チェック: epm.employee-master.read
   */
  async findById(tenantId: string, id: string): Promise<EmployeeMasterEntity> {
    const employee = await this.repository.findById(tenantId, id)

    if (!employee) {
      throw createError(
        EmployeeMasterErrorCode.EMPLOYEE_NOT_FOUND,
        `Employee not found: ${id}`
      )
    }

    return toEntity(employee)
  }

  /**
   * 作成
   * FR-LIST-03: 権限チェック: epm.employee-master.create
   */
  async create(
    tenantId: string,
    userId: string,
    request: CreateEmployeeMasterRequest
  ): Promise<EmployeeMasterEntity> {
    // 1. employeeCode一意性チェック
    const existing = await this.repository.findByEmployeeCode(tenantId, request.employeeCode)
    if (existing) {
      throw createError(
        EmployeeMasterErrorCode.EMPLOYEE_CODE_DUPLICATE,
        `Employee code already exists: ${request.employeeCode}`
      )
    }

    // 2. 作成
    const data: CreateData = {
      employeeCode: request.employeeCode,
      employeeName: request.employeeName,
      organizationKey: request.organizationKey,
      createdBy: userId,
      updatedBy: userId,
    }

    const created = await this.repository.create(tenantId, data)

    // TODO: 監査ログ記録

    return toEntity(created)
  }

  /**
   * 更新
   * FR-LIST-04: 権限チェック: epm.employee-master.update
   * Note: employeeCodeは変更不可（UpdateRequestに含まれていない）
   */
  async update(
    tenantId: string,
    userId: string,
    id: string,
    request: UpdateEmployeeMasterRequest
  ): Promise<EmployeeMasterEntity> {
    // 1. 既存レコード取得
    const existing = await this.repository.findById(tenantId, id)
    if (!existing) {
      throw createError(
        EmployeeMasterErrorCode.EMPLOYEE_NOT_FOUND,
        `Employee not found: ${id}`
      )
    }

    // 2. 更新データ構築
    const data: UpdateData = {
      ...(request.employeeName !== undefined && { employeeName: request.employeeName }),
      ...(request.organizationKey !== undefined && { organizationKey: request.organizationKey }),
      updatedBy: userId,
    }

    // 3. 更新実行
    const updated = await this.repository.update(tenantId, id, data)
    if (!updated) {
      throw createError(
        EmployeeMasterErrorCode.EMPLOYEE_NOT_FOUND,
        `Employee not found: ${id}`
      )
    }

    // TODO: 監査ログ記録

    return toEntity(updated)
  }

  /**
   * 無効化
   * FR-LIST-05: 権限チェック: epm.employee-master.update
   */
  async deactivate(
    tenantId: string,
    userId: string,
    id: string
  ): Promise<EmployeeMasterEntity> {
    // 1. 既存レコード取得
    const existing = await this.repository.findById(tenantId, id)
    if (!existing) {
      throw createError(
        EmployeeMasterErrorCode.EMPLOYEE_NOT_FOUND,
        `Employee not found: ${id}`
      )
    }

    // 2. 既に無効化されているかチェック
    if (!existing.isActive) {
      throw createError(
        EmployeeMasterErrorCode.EMPLOYEE_ALREADY_INACTIVE,
        'Employee is already inactive'
      )
    }

    // 3. 無効化実行
    const updated = await this.repository.updateStatus(tenantId, id, false, userId)
    if (!updated) {
      throw createError(
        EmployeeMasterErrorCode.EMPLOYEE_NOT_FOUND,
        `Employee not found: ${id}`
      )
    }

    // TODO: 監査ログ記録

    return toEntity(updated)
  }

  /**
   * 再有効化
   * FR-LIST-06: 権限チェック: epm.employee-master.update
   */
  async reactivate(
    tenantId: string,
    userId: string,
    id: string
  ): Promise<EmployeeMasterEntity> {
    // 1. 既存レコード取得
    const existing = await this.repository.findById(tenantId, id)
    if (!existing) {
      throw createError(
        EmployeeMasterErrorCode.EMPLOYEE_NOT_FOUND,
        `Employee not found: ${id}`
      )
    }

    // 2. 既に有効かチェック
    if (existing.isActive) {
      throw createError(
        EmployeeMasterErrorCode.EMPLOYEE_ALREADY_ACTIVE,
        'Employee is already active'
      )
    }

    // 3. 再有効化実行
    const updated = await this.repository.updateStatus(tenantId, id, true, userId)
    if (!updated) {
      throw createError(
        EmployeeMasterErrorCode.EMPLOYEE_NOT_FOUND,
        `Employee not found: ${id}`
      )
    }

    // TODO: 監査ログ記録

    return toEntity(updated)
  }
}
