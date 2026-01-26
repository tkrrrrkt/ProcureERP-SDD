import { Injectable, HttpException } from '@nestjs/common';
import { DepartmentRepository } from '../repository/department.repository';
import {
  ListDepartmentsApiRequest,
  ListDepartmentsApiResponse,
  GetDepartmentApiResponse,
  CreateDepartmentApiRequest,
  CreateDepartmentApiResponse,
  UpdateDepartmentApiRequest,
  UpdateDepartmentApiResponse,
  MoveDepartmentApiRequest,
  MoveDepartmentApiResponse,
  DeactivateDepartmentApiResponse,
  ReactivateDepartmentApiResponse,
  DepartmentApiDto,
} from '@procure/contracts/api/organization-master';
import {
  OrganizationMasterErrorCode,
  OrganizationMasterErrorHttpStatus,
  OrganizationMasterErrorMessage,
} from '@procure/contracts/api/errors';
import { Department } from '@prisma/client';
import { CircularRefChecker } from '../utils/circular-ref-checker';
import { HierarchyCalculator } from '../utils/hierarchy-calculator';

/**
 * Department Service
 *
 * ビジネスルールの正本
 * - 部門コード一意性チェック
 * - 循環参照チェック
 * - 階層情報自動計算
 * - 無効化/有効化状態管理
 * - 監査ログ記録
 */
@Injectable()
export class DepartmentService {
  constructor(private readonly departmentRepository: DepartmentRepository) {}

  /**
   * 部門一覧取得
   */
  async listDepartments(
    tenantId: string,
    versionId: string,
    request: ListDepartmentsApiRequest,
  ): Promise<ListDepartmentsApiResponse> {
    const departments = await this.departmentRepository.findByVersion({
      tenantId,
      versionId,
      keyword: request.keyword,
      isActive: request.isActive ?? true, // デフォルト: 有効のみ
      sortBy: request.sortBy,
      sortOrder: request.sortOrder,
    });

    return {
      items: departments.map((d) => this.toApiDto(d)),
    };
  }

  /**
   * 部門詳細取得
   */
  async getDepartment(
    tenantId: string,
    departmentId: string,
  ): Promise<GetDepartmentApiResponse> {
    const department = await this.departmentRepository.findById({
      tenantId,
      departmentId,
    });

    if (!department) {
      throw new HttpException(
        {
          code: OrganizationMasterErrorCode.DEPARTMENT_NOT_FOUND,
          message: OrganizationMasterErrorMessage.DEPARTMENT_NOT_FOUND,
        },
        OrganizationMasterErrorHttpStatus.DEPARTMENT_NOT_FOUND,
      );
    }

    return {
      department: this.toApiDto(department),
    };
  }

  /**
   * 部門新規作成
   */
  async createDepartment(
    tenantId: string,
    versionId: string,
    userId: string,
    request: CreateDepartmentApiRequest,
  ): Promise<CreateDepartmentApiResponse> {
    // バリデーション: 部門コード重複チェック
    const isDuplicate = await this.departmentRepository.checkDepartmentCodeDuplicate({
      tenantId,
      versionId,
      departmentCode: request.departmentCode,
    });

    if (isDuplicate) {
      throw new HttpException(
        {
          code: OrganizationMasterErrorCode.DEPARTMENT_CODE_DUPLICATE,
          message: OrganizationMasterErrorMessage.DEPARTMENT_CODE_DUPLICATE,
        },
        OrganizationMasterErrorHttpStatus.DEPARTMENT_CODE_DUPLICATE,
      );
    }

    // 親部門存在チェック（指定時のみ）
    if (request.parentId) {
      const parent = await this.departmentRepository.findById({
        tenantId,
        departmentId: request.parentId,
      });

      if (!parent || parent.versionId !== versionId) {
        throw new HttpException(
          {
            code: OrganizationMasterErrorCode.DEPARTMENT_NOT_FOUND,
            message: 'Parent department not found',
          },
          OrganizationMasterErrorHttpStatus.DEPARTMENT_NOT_FOUND,
        );
      }
    }

    // 階層情報を計算
    const allDepartments = await this.departmentRepository.findByVersion({
      tenantId,
      versionId,
    });

    const hierarchyInfo = HierarchyCalculator.calculate(
      request.departmentCode,
      request.parentId ?? null,
      allDepartments,
    );

    // 登録
    const department = await this.departmentRepository.create({
      tenantId,
      versionId,
      createdBy: userId,
      data: {
        departmentCode: request.departmentCode,
        departmentName: request.departmentName,
        departmentNameShort: request.departmentNameShort,
        parentId: request.parentId,
        sortOrder: request.sortOrder,
        hierarchyLevel: hierarchyInfo.hierarchyLevel,
        hierarchyPath: hierarchyInfo.hierarchyPath,
        postalCode: request.postalCode,
        addressLine1: request.addressLine1,
        addressLine2: request.addressLine2,
        phoneNumber: request.phoneNumber,
        description: request.description,
      },
    });

    return {
      department: this.toApiDto(department),
    };
  }

  /**
   * 部門更新
   */
  async updateDepartment(
    tenantId: string,
    userId: string,
    departmentId: string,
    request: UpdateDepartmentApiRequest,
  ): Promise<UpdateDepartmentApiResponse> {
    // 既存データ取得
    const existingDepartment = await this.departmentRepository.findById({
      tenantId,
      departmentId,
    });

    if (!existingDepartment) {
      throw new HttpException(
        {
          code: OrganizationMasterErrorCode.DEPARTMENT_NOT_FOUND,
          message: OrganizationMasterErrorMessage.DEPARTMENT_NOT_FOUND,
        },
        OrganizationMasterErrorHttpStatus.DEPARTMENT_NOT_FOUND,
      );
    }

    // 部門コード変更がある場合のみ重複チェック
    if (request.departmentCode && request.departmentCode !== existingDepartment.departmentCode) {
      const isDuplicate = await this.departmentRepository.checkDepartmentCodeDuplicate({
        tenantId,
        versionId: existingDepartment.versionId,
        departmentCode: request.departmentCode,
        excludeDepartmentId: departmentId,
      });

      if (isDuplicate) {
        throw new HttpException(
          {
            code: OrganizationMasterErrorCode.DEPARTMENT_CODE_DUPLICATE,
            message: OrganizationMasterErrorMessage.DEPARTMENT_CODE_DUPLICATE,
          },
          OrganizationMasterErrorHttpStatus.DEPARTMENT_CODE_DUPLICATE,
        );
      }
    }

    // 親IDが変更される場合は循環参照チェックと階層再計算
    let hierarchyLevel: number | undefined;
    let hierarchyPath: string | undefined;

    if (request.parentId !== undefined && request.parentId !== existingDepartment.parentId) {
      const allDepartments = await this.departmentRepository.findByVersion({
        tenantId,
        versionId: existingDepartment.versionId,
      });

      // 循環参照チェック
      const isCircular = CircularRefChecker.check(
        departmentId,
        request.parentId,
        allDepartments,
      );

      if (isCircular) {
        throw new HttpException(
          {
            code: OrganizationMasterErrorCode.CIRCULAR_REFERENCE_DETECTED,
            message: OrganizationMasterErrorMessage.CIRCULAR_REFERENCE_DETECTED,
          },
          OrganizationMasterErrorHttpStatus.CIRCULAR_REFERENCE_DETECTED,
        );
      }

      // 階層情報を再計算
      const newCode = request.departmentCode ?? existingDepartment.departmentCode;
      const hierarchyInfo = HierarchyCalculator.calculate(
        newCode,
        request.parentId,
        allDepartments,
      );
      hierarchyLevel = hierarchyInfo.hierarchyLevel;
      hierarchyPath = hierarchyInfo.hierarchyPath;
    }

    // 更新
    const updatedDepartment = await this.departmentRepository.update({
      tenantId,
      departmentId,
      updatedBy: userId,
      data: {
        departmentCode: request.departmentCode,
        departmentName: request.departmentName,
        departmentNameShort: request.departmentNameShort,
        parentId: request.parentId,
        sortOrder: request.sortOrder,
        hierarchyLevel,
        hierarchyPath,
        postalCode: request.postalCode,
        addressLine1: request.addressLine1,
        addressLine2: request.addressLine2,
        phoneNumber: request.phoneNumber,
        description: request.description,
      },
    });

    if (!updatedDepartment) {
      throw new HttpException(
        {
          code: OrganizationMasterErrorCode.DEPARTMENT_NOT_FOUND,
          message: OrganizationMasterErrorMessage.DEPARTMENT_NOT_FOUND,
        },
        OrganizationMasterErrorHttpStatus.DEPARTMENT_NOT_FOUND,
      );
    }

    // 子孫部門の階層情報も更新（親ID変更時）
    if (hierarchyPath !== undefined) {
      await this.updateDescendantsHierarchy(tenantId, userId, updatedDepartment);
    }

    return {
      department: this.toApiDto(updatedDepartment),
    };
  }

  /**
   * 部門移動（ドラッグ＆ドロップ専用）
   */
  async moveDepartment(
    tenantId: string,
    userId: string,
    departmentId: string,
    request: MoveDepartmentApiRequest,
  ): Promise<MoveDepartmentApiResponse> {
    // 既存データ取得
    const existingDepartment = await this.departmentRepository.findById({
      tenantId,
      departmentId,
    });

    if (!existingDepartment) {
      throw new HttpException(
        {
          code: OrganizationMasterErrorCode.DEPARTMENT_NOT_FOUND,
          message: OrganizationMasterErrorMessage.DEPARTMENT_NOT_FOUND,
        },
        OrganizationMasterErrorHttpStatus.DEPARTMENT_NOT_FOUND,
      );
    }

    // 同じ親なら何もしない
    if (request.newParentId === existingDepartment.parentId) {
      return {
        department: this.toApiDto(existingDepartment),
      };
    }

    // 全部門取得
    const allDepartments = await this.departmentRepository.findByVersion({
      tenantId,
      versionId: existingDepartment.versionId,
    });

    // 循環参照チェック
    const isCircular = CircularRefChecker.check(
      departmentId,
      request.newParentId,
      allDepartments,
    );

    if (isCircular) {
      throw new HttpException(
        {
          code: OrganizationMasterErrorCode.CIRCULAR_REFERENCE_DETECTED,
          message: OrganizationMasterErrorMessage.CIRCULAR_REFERENCE_DETECTED,
        },
        OrganizationMasterErrorHttpStatus.CIRCULAR_REFERENCE_DETECTED,
      );
    }

    // 新しい親部門の存在チェック（指定時のみ）
    if (request.newParentId) {
      const newParent = allDepartments.find((d) => d.id === request.newParentId);
      if (!newParent) {
        throw new HttpException(
          {
            code: OrganizationMasterErrorCode.DEPARTMENT_NOT_FOUND,
            message: 'New parent department not found',
          },
          OrganizationMasterErrorHttpStatus.DEPARTMENT_NOT_FOUND,
        );
      }
    }

    // 階層情報を再計算
    const hierarchyInfo = HierarchyCalculator.calculate(
      existingDepartment.departmentCode,
      request.newParentId,
      allDepartments,
    );

    // 更新
    const movedDepartment = await this.departmentRepository.update({
      tenantId,
      departmentId,
      updatedBy: userId,
      data: {
        parentId: request.newParentId,
        hierarchyLevel: hierarchyInfo.hierarchyLevel,
        hierarchyPath: hierarchyInfo.hierarchyPath,
      },
    });

    if (!movedDepartment) {
      throw new HttpException(
        {
          code: OrganizationMasterErrorCode.DEPARTMENT_NOT_FOUND,
          message: OrganizationMasterErrorMessage.DEPARTMENT_NOT_FOUND,
        },
        OrganizationMasterErrorHttpStatus.DEPARTMENT_NOT_FOUND,
      );
    }

    // 子孫部門の階層情報も更新
    await this.updateDescendantsHierarchy(tenantId, userId, movedDepartment);

    return {
      department: this.toApiDto(movedDepartment),
    };
  }

  /**
   * 部門無効化
   */
  async deactivateDepartment(
    tenantId: string,
    userId: string,
    departmentId: string,
  ): Promise<DeactivateDepartmentApiResponse> {
    const existingDepartment = await this.departmentRepository.findById({
      tenantId,
      departmentId,
    });

    if (!existingDepartment) {
      throw new HttpException(
        {
          code: OrganizationMasterErrorCode.DEPARTMENT_NOT_FOUND,
          message: OrganizationMasterErrorMessage.DEPARTMENT_NOT_FOUND,
        },
        OrganizationMasterErrorHttpStatus.DEPARTMENT_NOT_FOUND,
      );
    }

    if (!existingDepartment.isActive) {
      throw new HttpException(
        {
          code: OrganizationMasterErrorCode.DEPARTMENT_ALREADY_INACTIVE,
          message: OrganizationMasterErrorMessage.DEPARTMENT_ALREADY_INACTIVE,
        },
        OrganizationMasterErrorHttpStatus.DEPARTMENT_ALREADY_INACTIVE,
      );
    }

    const updatedDepartment = await this.departmentRepository.update({
      tenantId,
      departmentId,
      updatedBy: userId,
      data: {
        isActive: false,
      },
    });

    if (!updatedDepartment) {
      throw new HttpException(
        {
          code: OrganizationMasterErrorCode.DEPARTMENT_NOT_FOUND,
          message: OrganizationMasterErrorMessage.DEPARTMENT_NOT_FOUND,
        },
        OrganizationMasterErrorHttpStatus.DEPARTMENT_NOT_FOUND,
      );
    }

    return {
      department: this.toApiDto(updatedDepartment),
    };
  }

  /**
   * 部門有効化
   */
  async reactivateDepartment(
    tenantId: string,
    userId: string,
    departmentId: string,
  ): Promise<ReactivateDepartmentApiResponse> {
    const existingDepartment = await this.departmentRepository.findById({
      tenantId,
      departmentId,
    });

    if (!existingDepartment) {
      throw new HttpException(
        {
          code: OrganizationMasterErrorCode.DEPARTMENT_NOT_FOUND,
          message: OrganizationMasterErrorMessage.DEPARTMENT_NOT_FOUND,
        },
        OrganizationMasterErrorHttpStatus.DEPARTMENT_NOT_FOUND,
      );
    }

    if (existingDepartment.isActive) {
      throw new HttpException(
        {
          code: OrganizationMasterErrorCode.DEPARTMENT_ALREADY_ACTIVE,
          message: OrganizationMasterErrorMessage.DEPARTMENT_ALREADY_ACTIVE,
        },
        OrganizationMasterErrorHttpStatus.DEPARTMENT_ALREADY_ACTIVE,
      );
    }

    const updatedDepartment = await this.departmentRepository.update({
      tenantId,
      departmentId,
      updatedBy: userId,
      data: {
        isActive: true,
      },
    });

    if (!updatedDepartment) {
      throw new HttpException(
        {
          code: OrganizationMasterErrorCode.DEPARTMENT_NOT_FOUND,
          message: OrganizationMasterErrorMessage.DEPARTMENT_NOT_FOUND,
        },
        OrganizationMasterErrorHttpStatus.DEPARTMENT_NOT_FOUND,
      );
    }

    return {
      department: this.toApiDto(updatedDepartment),
    };
  }

  /**
   * 子孫部門の階層情報を再帰的に更新
   */
  private async updateDescendantsHierarchy(
    tenantId: string,
    userId: string,
    parentDepartment: Department,
  ): Promise<void> {
    const allDepartments = await this.departmentRepository.findByVersion({
      tenantId,
      versionId: parentDepartment.versionId,
    });

    const descendantUpdates = HierarchyCalculator.recalculateDescendants(
      parentDepartment,
      allDepartments,
    );

    // 各子孫を更新
    for (const [deptId, hierarchyInfo] of descendantUpdates) {
      await this.departmentRepository.update({
        tenantId,
        departmentId: deptId,
        updatedBy: userId,
        data: {
          hierarchyLevel: hierarchyInfo.hierarchyLevel,
          hierarchyPath: hierarchyInfo.hierarchyPath,
        },
      });
    }
  }

  /**
   * Department -> DepartmentApiDto 変換
   */
  private toApiDto(department: Department): DepartmentApiDto {
    return {
      id: department.id,
      versionId: department.versionId,
      stableId: department.stableId,
      departmentCode: department.departmentCode,
      departmentName: department.departmentName,
      departmentNameShort: department.departmentNameShort,
      parentId: department.parentId,
      sortOrder: department.sortOrder,
      hierarchyLevel: department.hierarchyLevel,
      hierarchyPath: department.hierarchyPath,
      isActive: department.isActive,
      postalCode: department.postalCode,
      addressLine1: department.addressLine1,
      addressLine2: department.addressLine2,
      phoneNumber: department.phoneNumber,
      description: department.description,
      createdAt: department.createdAt.toISOString(),
      updatedAt: department.updatedAt.toISOString(),
      createdBy: department.createdBy,
      updatedBy: department.updatedBy,
    };
  }
}
