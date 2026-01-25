import { Injectable } from '@nestjs/common';
import {
  EmployeeAssignmentApiDto,
  CreateAssignmentApiRequest as CreateApiReq,
  UpdateAssignmentApiRequest as UpdateApiReq,
} from '@procure/contracts/api/employee-assignment';
import {
  EmployeeAssignmentDto,
  CreateAssignmentRequest,
  UpdateAssignmentRequest,
  AssignmentType,
} from '@procure/contracts/bff/employee-assignment';

/**
 * 部門情報（Service から渡される）
 */
export interface DepartmentInfo {
  departmentCode: string;
  departmentName: string;
}

/**
 * Employee Assignment Mapper
 *
 * API DTO ↔ BFF DTO の変換
 * - assignmentType → assignmentTypeLabel (primary → 主務, secondary → 兼務)
 * - isCurrent フラグの計算
 * - 部門名の付与（Service から渡される）
 */
@Injectable()
export class EmployeeAssignmentMapper {
  /**
   * 所属種別ラベルのマッピング
   */
  private readonly assignmentTypeLabels: Record<AssignmentType, string> = {
    primary: '主務',
    secondary: '兼務',
  };

  /**
   * API DTO → BFF DTO (単体)
   * @param apiDto API から取得した DTO
   * @param departmentInfo 部門情報（Service で解決済み）
   */
  toDto(apiDto: EmployeeAssignmentApiDto, departmentInfo: DepartmentInfo): EmployeeAssignmentDto {
    const assignmentType = apiDto.assignmentType as AssignmentType;

    return {
      id: apiDto.id,
      employeeId: apiDto.employeeId,
      departmentStableId: apiDto.departmentStableId,
      departmentCode: departmentInfo.departmentCode,
      departmentName: departmentInfo.departmentName,
      assignmentType,
      assignmentTypeLabel: this.assignmentTypeLabels[assignmentType],
      allocationRatio: apiDto.allocationRatio,
      title: apiDto.title,
      effectiveDate: apiDto.effectiveDate,
      expiryDate: apiDto.expiryDate,
      isCurrent: this.calculateIsCurrent(apiDto.effectiveDate, apiDto.expiryDate),
      isActive: apiDto.isActive,
      version: apiDto.version,
      createdAt: apiDto.createdAt,
      updatedAt: apiDto.updatedAt,
    };
  }

  /**
   * BFF Request → API Request (新規登録)
   */
  toCreateApiRequest(request: CreateAssignmentRequest): CreateApiReq {
    return {
      departmentStableId: request.departmentStableId,
      assignmentType: request.assignmentType,
      allocationRatio: request.allocationRatio,
      title: request.title,
      effectiveDate: request.effectiveDate,
      expiryDate: request.expiryDate,
    };
  }

  /**
   * BFF Request → API Request (更新)
   */
  toUpdateApiRequest(request: UpdateAssignmentRequest): UpdateApiReq {
    return {
      departmentStableId: request.departmentStableId,
      assignmentType: request.assignmentType,
      allocationRatio: request.allocationRatio,
      title: request.title,
      effectiveDate: request.effectiveDate,
      expiryDate: request.expiryDate,
      version: request.version,
    };
  }

  /**
   * 現在有効かどうかを計算
   * effectiveDate <= 今日 <= expiryDate (expiryDate が null の場合は無期限)
   */
  private calculateIsCurrent(effectiveDate: string, expiryDate: string | null): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 日付のみで比較

    const effective = new Date(effectiveDate);
    effective.setHours(0, 0, 0, 0);

    if (effective > today) {
      return false; // まだ有効開始日に達していない
    }

    if (expiryDate === null) {
      return true; // 無期限
    }

    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);

    return today <= expiry;
  }
}
