import { Injectable, HttpException } from '@nestjs/common';
import { EmployeeAssignmentRepository } from '../repository/employee-assignment.repository';
import {
  ListAssignmentsApiRequest,
  ListAssignmentsApiResponse,
  GetAssignmentApiResponse,
  CreateAssignmentApiRequest,
  CreateAssignmentApiResponse,
  UpdateAssignmentApiRequest,
  UpdateAssignmentApiResponse,
  DeleteAssignmentApiResponse,
  EmployeeAssignmentApiDto,
} from '@procure/contracts/api/employee-assignment';
import {
  EmployeeAssignmentErrorCode,
  EmployeeAssignmentErrorHttpStatus,
  EmployeeAssignmentErrorMessage,
} from '@procure/contracts/api/errors/employee-assignment-error';
import { EmployeeAssignment } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * Employee Assignment Service
 *
 * ビジネスルールの正本
 * - 主務重複チェック（同一社員・同時期に primary は1つのみ）
 * - 期間整合性チェック（expiry_date > effective_date）
 * - 按分率範囲チェック（0.00 ≤ allocation_ratio ≤ 100.00）
 * - 楽観ロック
 * - 社員・部門存在チェック
 * - 監査ログ記録
 */
@Injectable()
export class EmployeeAssignmentService {
  constructor(private readonly repository: EmployeeAssignmentRepository) {}

  /**
   * 所属一覧取得（社員別）
   */
  async listAssignments(
    tenantId: string,
    employeeId: string,
    request: ListAssignmentsApiRequest,
  ): Promise<ListAssignmentsApiResponse> {
    // 社員存在チェック
    const employeeExists = await this.repository.checkEmployeeExists({
      tenantId,
      employeeId,
    });

    if (!employeeExists) {
      throw new HttpException(
        {
          code: EmployeeAssignmentErrorCode.EMPLOYEE_NOT_FOUND,
          message: EmployeeAssignmentErrorMessage.EMPLOYEE_NOT_FOUND,
        },
        EmployeeAssignmentErrorHttpStatus.EMPLOYEE_NOT_FOUND,
      );
    }

    const items = await this.repository.findByEmployeeId({
      tenantId,
      employeeId,
      sortBy: request.sortBy,
      sortOrder: request.sortOrder,
    });

    return {
      items: items.map(this.toApiDto),
    };
  }

  /**
   * 所属情報取得
   */
  async getAssignment(
    tenantId: string,
    assignmentId: string,
  ): Promise<GetAssignmentApiResponse> {
    const assignment = await this.repository.findOne({
      tenantId,
      assignmentId,
    });

    if (!assignment) {
      throw new HttpException(
        {
          code: EmployeeAssignmentErrorCode.ASSIGNMENT_NOT_FOUND,
          message: EmployeeAssignmentErrorMessage.ASSIGNMENT_NOT_FOUND,
        },
        EmployeeAssignmentErrorHttpStatus.ASSIGNMENT_NOT_FOUND,
      );
    }

    return {
      assignment: this.toApiDto(assignment),
    };
  }

  /**
   * 所属登録
   */
  async createAssignment(
    tenantId: string,
    userId: string,
    employeeId: string,
    request: CreateAssignmentApiRequest,
  ): Promise<CreateAssignmentApiResponse> {
    // 社員存在チェック
    const employeeExists = await this.repository.checkEmployeeExists({
      tenantId,
      employeeId,
    });

    if (!employeeExists) {
      throw new HttpException(
        {
          code: EmployeeAssignmentErrorCode.EMPLOYEE_NOT_FOUND,
          message: EmployeeAssignmentErrorMessage.EMPLOYEE_NOT_FOUND,
        },
        EmployeeAssignmentErrorHttpStatus.EMPLOYEE_NOT_FOUND,
      );
    }

    // TODO: 部門存在チェック（organization-master API連携）
    // const departmentExists = await this.organizationClient.checkDepartmentExists({
    //   tenantId,
    //   departmentStableId: request.departmentStableId,
    // });
    // if (!departmentExists) {
    //   throw new HttpException({
    //     code: EmployeeAssignmentErrorCode.DEPARTMENT_NOT_FOUND,
    //     message: EmployeeAssignmentErrorMessage.DEPARTMENT_NOT_FOUND,
    //   }, EmployeeAssignmentErrorHttpStatus.DEPARTMENT_NOT_FOUND);
    // }

    const effectiveDate = new Date(request.effectiveDate);
    const expiryDate = request.expiryDate ? new Date(request.expiryDate) : null;

    // バリデーション: 期間整合性
    if (expiryDate && expiryDate <= effectiveDate) {
      throw new HttpException(
        {
          code: EmployeeAssignmentErrorCode.INVALID_DATE_RANGE,
          message: EmployeeAssignmentErrorMessage.INVALID_DATE_RANGE,
        },
        EmployeeAssignmentErrorHttpStatus.INVALID_DATE_RANGE,
      );
    }

    // バリデーション: 按分率範囲
    if (
      request.allocationRatio !== undefined &&
      (request.allocationRatio < 0 || request.allocationRatio > 100)
    ) {
      throw new HttpException(
        {
          code: EmployeeAssignmentErrorCode.INVALID_ALLOCATION_RATIO,
          message: EmployeeAssignmentErrorMessage.INVALID_ALLOCATION_RATIO,
        },
        EmployeeAssignmentErrorHttpStatus.INVALID_ALLOCATION_RATIO,
      );
    }

    // バリデーション: 主務重複チェック
    if (request.assignmentType === 'primary') {
      const hasOverlap = await this.repository.checkPrimaryOverlap({
        tenantId,
        employeeId,
        effectiveDate,
        expiryDate,
      });

      if (hasOverlap) {
        throw new HttpException(
          {
            code: EmployeeAssignmentErrorCode.DUPLICATE_PRIMARY_ASSIGNMENT,
            message: EmployeeAssignmentErrorMessage.DUPLICATE_PRIMARY_ASSIGNMENT,
          },
          EmployeeAssignmentErrorHttpStatus.DUPLICATE_PRIMARY_ASSIGNMENT,
        );
      }
    }

    // 登録
    const assignment = await this.repository.create({
      tenantId,
      employeeId,
      createdBy: userId,
      data: {
        departmentStableId: request.departmentStableId,
        assignmentType: request.assignmentType,
        allocationRatio: request.allocationRatio,
        title: request.title,
        effectiveDate,
        expiryDate: expiryDate ?? undefined,
      },
    });

    // TODO: 監査ログ記録
    // await this.auditLogService.log({
    //   action: 'CREATE',
    //   resource: 'employee_assignment',
    //   resourceId: assignment.id,
    //   tenantId,
    //   userId,
    //   details: request,
    // });

    return {
      assignment: this.toApiDto(assignment),
    };
  }

  /**
   * 所属更新
   */
  async updateAssignment(
    tenantId: string,
    userId: string,
    employeeId: string,
    assignmentId: string,
    request: UpdateAssignmentApiRequest,
  ): Promise<UpdateAssignmentApiResponse> {
    // 既存データ取得
    const existingAssignment = await this.repository.findOne({
      tenantId,
      assignmentId,
    });

    if (!existingAssignment) {
      throw new HttpException(
        {
          code: EmployeeAssignmentErrorCode.ASSIGNMENT_NOT_FOUND,
          message: EmployeeAssignmentErrorMessage.ASSIGNMENT_NOT_FOUND,
        },
        EmployeeAssignmentErrorHttpStatus.ASSIGNMENT_NOT_FOUND,
      );
    }

    // 論理削除済みチェック
    if (!existingAssignment.isActive) {
      throw new HttpException(
        {
          code: EmployeeAssignmentErrorCode.ASSIGNMENT_NOT_FOUND,
          message: EmployeeAssignmentErrorMessage.ASSIGNMENT_NOT_FOUND,
        },
        EmployeeAssignmentErrorHttpStatus.ASSIGNMENT_NOT_FOUND,
      );
    }

    // 所属先社員IDの整合性チェック
    if (existingAssignment.employeeId !== employeeId) {
      throw new HttpException(
        {
          code: EmployeeAssignmentErrorCode.ASSIGNMENT_NOT_FOUND,
          message: EmployeeAssignmentErrorMessage.ASSIGNMENT_NOT_FOUND,
        },
        EmployeeAssignmentErrorHttpStatus.ASSIGNMENT_NOT_FOUND,
      );
    }

    // TODO: 部門存在チェック（organization-master API連携）

    const effectiveDate = new Date(request.effectiveDate);
    const expiryDate = request.expiryDate ? new Date(request.expiryDate) : null;

    // バリデーション: 期間整合性
    if (expiryDate && expiryDate <= effectiveDate) {
      throw new HttpException(
        {
          code: EmployeeAssignmentErrorCode.INVALID_DATE_RANGE,
          message: EmployeeAssignmentErrorMessage.INVALID_DATE_RANGE,
        },
        EmployeeAssignmentErrorHttpStatus.INVALID_DATE_RANGE,
      );
    }

    // バリデーション: 按分率範囲
    if (
      request.allocationRatio !== undefined &&
      request.allocationRatio !== null &&
      (request.allocationRatio < 0 || request.allocationRatio > 100)
    ) {
      throw new HttpException(
        {
          code: EmployeeAssignmentErrorCode.INVALID_ALLOCATION_RATIO,
          message: EmployeeAssignmentErrorMessage.INVALID_ALLOCATION_RATIO,
        },
        EmployeeAssignmentErrorHttpStatus.INVALID_ALLOCATION_RATIO,
      );
    }

    // バリデーション: 主務重複チェック（主務に変更する場合、または主務のまま期間変更する場合）
    if (request.assignmentType === 'primary') {
      const hasOverlap = await this.repository.checkPrimaryOverlap({
        tenantId,
        employeeId,
        effectiveDate,
        expiryDate,
        excludeId: assignmentId, // 自分自身を除外
      });

      if (hasOverlap) {
        throw new HttpException(
          {
            code: EmployeeAssignmentErrorCode.DUPLICATE_PRIMARY_ASSIGNMENT,
            message: EmployeeAssignmentErrorMessage.DUPLICATE_PRIMARY_ASSIGNMENT,
          },
          EmployeeAssignmentErrorHttpStatus.DUPLICATE_PRIMARY_ASSIGNMENT,
        );
      }
    }

    // 更新（楽観ロック）
    const updatedAssignment = await this.repository.update({
      tenantId,
      assignmentId,
      version: request.version,
      updatedBy: userId,
      data: {
        departmentStableId: request.departmentStableId,
        assignmentType: request.assignmentType,
        allocationRatio: request.allocationRatio,
        title: request.title,
        effectiveDate,
        expiryDate,
      },
    });

    // 楽観ロック競合
    if (!updatedAssignment) {
      throw new HttpException(
        {
          code: EmployeeAssignmentErrorCode.OPTIMISTIC_LOCK_ERROR,
          message: EmployeeAssignmentErrorMessage.OPTIMISTIC_LOCK_ERROR,
        },
        EmployeeAssignmentErrorHttpStatus.OPTIMISTIC_LOCK_ERROR,
      );
    }

    // TODO: 監査ログ記録

    return {
      assignment: this.toApiDto(updatedAssignment),
    };
  }

  /**
   * 所属削除（論理削除）
   */
  async deleteAssignment(
    tenantId: string,
    userId: string,
    employeeId: string,
    assignmentId: string,
    version: number,
  ): Promise<DeleteAssignmentApiResponse> {
    // 既存データ取得
    const existingAssignment = await this.repository.findOne({
      tenantId,
      assignmentId,
    });

    if (!existingAssignment) {
      throw new HttpException(
        {
          code: EmployeeAssignmentErrorCode.ASSIGNMENT_NOT_FOUND,
          message: EmployeeAssignmentErrorMessage.ASSIGNMENT_NOT_FOUND,
        },
        EmployeeAssignmentErrorHttpStatus.ASSIGNMENT_NOT_FOUND,
      );
    }

    // 論理削除済みチェック
    if (!existingAssignment.isActive) {
      throw new HttpException(
        {
          code: EmployeeAssignmentErrorCode.ASSIGNMENT_NOT_FOUND,
          message: EmployeeAssignmentErrorMessage.ASSIGNMENT_NOT_FOUND,
        },
        EmployeeAssignmentErrorHttpStatus.ASSIGNMENT_NOT_FOUND,
      );
    }

    // 所属先社員IDの整合性チェック
    if (existingAssignment.employeeId !== employeeId) {
      throw new HttpException(
        {
          code: EmployeeAssignmentErrorCode.ASSIGNMENT_NOT_FOUND,
          message: EmployeeAssignmentErrorMessage.ASSIGNMENT_NOT_FOUND,
        },
        EmployeeAssignmentErrorHttpStatus.ASSIGNMENT_NOT_FOUND,
      );
    }

    // 論理削除（楽観ロック）
    const success = await this.repository.softDelete({
      tenantId,
      assignmentId,
      version,
      updatedBy: userId,
    });

    // 楽観ロック競合
    if (!success) {
      throw new HttpException(
        {
          code: EmployeeAssignmentErrorCode.OPTIMISTIC_LOCK_ERROR,
          message: EmployeeAssignmentErrorMessage.OPTIMISTIC_LOCK_ERROR,
        },
        EmployeeAssignmentErrorHttpStatus.OPTIMISTIC_LOCK_ERROR,
      );
    }

    // TODO: 監査ログ記録

    return {
      success: true,
    };
  }

  /**
   * EmployeeAssignment -> EmployeeAssignmentApiDto 変換
   */
  private toApiDto(assignment: EmployeeAssignment): EmployeeAssignmentApiDto {
    return {
      id: assignment.id,
      employeeId: assignment.employeeId,
      departmentStableId: assignment.departmentStableId,
      assignmentType: assignment.assignmentType as 'primary' | 'secondary',
      allocationRatio: assignment.allocationRatio
        ? this.decimalToNumber(assignment.allocationRatio)
        : null,
      title: assignment.title,
      effectiveDate: this.dateToIsoString(assignment.effectiveDate),
      expiryDate: assignment.expiryDate
        ? this.dateToIsoString(assignment.expiryDate)
        : null,
      isActive: assignment.isActive,
      version: assignment.version,
      createdAt: assignment.createdAt.toISOString(),
      updatedAt: assignment.updatedAt.toISOString(),
      createdBy: assignment.createdByLoginAccountId,
      updatedBy: assignment.updatedByLoginAccountId,
    };
  }

  /**
   * Decimal -> number 変換
   */
  private decimalToNumber(value: Decimal): number {
    return parseFloat(value.toString());
  }

  /**
   * Date -> ISO 8601 date string (YYYY-MM-DD) 変換
   */
  private dateToIsoString(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
