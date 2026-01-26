import { Injectable, HttpException } from '@nestjs/common';
import { OrganizationVersionRepository } from '../repository/organization-version.repository';
import { DepartmentRepository } from '../repository/department.repository';
import {
  CopyVersionApiRequest,
  CopyVersionApiResponse,
  OrganizationVersionApiDto,
} from '@procure/contracts/api/organization-master';
import {
  OrganizationMasterErrorCode,
  OrganizationMasterErrorHttpStatus,
  OrganizationMasterErrorMessage,
} from '@procure/contracts/api/errors';
import { OrganizationVersion } from '@prisma/client';

/**
 * Version Copy Service
 *
 * バージョンコピー専用サービス
 * - 既存バージョンから新バージョンを作成
 * - 全部門を新バージョンにコピー
 * - stable_id を維持して版間追跡を可能に
 * - 部門IDは新規採番、parentId は新IDにマッピング
 */
@Injectable()
export class VersionCopyService {
  constructor(
    private readonly versionRepository: OrganizationVersionRepository,
    private readonly departmentRepository: DepartmentRepository,
  ) {}

  /**
   * バージョンコピー
   */
  async copyVersion(
    tenantId: string,
    userId: string,
    sourceVersionId: string,
    request: CopyVersionApiRequest,
  ): Promise<CopyVersionApiResponse> {
    // ソースバージョン存在確認
    const sourceVersion = await this.versionRepository.findById({
      tenantId,
      versionId: sourceVersionId,
    });

    if (!sourceVersion) {
      throw new HttpException(
        {
          code: OrganizationMasterErrorCode.VERSION_NOT_FOUND,
          message: OrganizationMasterErrorMessage.VERSION_NOT_FOUND,
        },
        OrganizationMasterErrorHttpStatus.VERSION_NOT_FOUND,
      );
    }

    // バリデーション: 有効期間整合性
    if (request.expiryDate) {
      const effectiveDate = new Date(request.effectiveDate);
      const expiryDate = new Date(request.expiryDate);
      if (expiryDate <= effectiveDate) {
        throw new HttpException(
          {
            code: OrganizationMasterErrorCode.INVALID_EFFECTIVE_DATE_RANGE,
            message: OrganizationMasterErrorMessage.INVALID_EFFECTIVE_DATE_RANGE,
          },
          OrganizationMasterErrorHttpStatus.INVALID_EFFECTIVE_DATE_RANGE,
        );
      }
    }

    // バリデーション: バージョンコード重複チェック
    const isDuplicate = await this.versionRepository.checkVersionCodeDuplicate({
      tenantId,
      versionCode: request.versionCode,
    });

    if (isDuplicate) {
      throw new HttpException(
        {
          code: OrganizationMasterErrorCode.VERSION_CODE_DUPLICATE,
          message: OrganizationMasterErrorMessage.VERSION_CODE_DUPLICATE,
        },
        OrganizationMasterErrorHttpStatus.VERSION_CODE_DUPLICATE,
      );
    }

    // 新バージョン作成（baseVersionId に元バージョンを記録）
    const newVersion = await this.versionRepository.create({
      tenantId,
      createdBy: userId,
      data: {
        versionCode: request.versionCode,
        versionName: request.versionName,
        effectiveDate: new Date(request.effectiveDate),
        expiryDate: request.expiryDate ? new Date(request.expiryDate) : undefined,
        description: request.description,
        baseVersionId: sourceVersionId,
      },
    });

    // ソースバージョンの全部門取得
    const sourceDepartments = await this.departmentRepository.findByVersion({
      tenantId,
      versionId: sourceVersionId,
    });

    if (sourceDepartments.length > 0) {
      // 旧ID→新IDマッピング（parentId変換用）
      const idMapping = new Map<string, string>();

      // 新しいIDを事前に生成
      const { randomUUID } = await import('crypto');
      for (const dept of sourceDepartments) {
        idMapping.set(dept.id, randomUUID());
      }

      // 部門データ変換（stable_id維持、parentId新IDマッピング）
      const newDepartmentsData = sourceDepartments.map((dept) => ({
        stableId: dept.stableId, // stable_id は維持（版間追跡キー）
        departmentCode: dept.departmentCode,
        departmentName: dept.departmentName,
        departmentNameShort: dept.departmentNameShort ?? undefined,
        parentId: dept.parentId ? idMapping.get(dept.parentId) : undefined,
        sortOrder: dept.sortOrder,
        hierarchyLevel: dept.hierarchyLevel,
        hierarchyPath: dept.hierarchyPath ?? '',
        isActive: dept.isActive,
        postalCode: dept.postalCode ?? undefined,
        addressLine1: dept.addressLine1 ?? undefined,
        addressLine2: dept.addressLine2 ?? undefined,
        phoneNumber: dept.phoneNumber ?? undefined,
        description: dept.description ?? undefined,
      }));

      // 一括挿入
      await this.departmentRepository.createMany({
        tenantId,
        versionId: newVersion.id,
        createdBy: userId,
        data: newDepartmentsData,
      });
    }

    return {
      version: this.toApiDto(newVersion),
    };
  }

  /**
   * OrganizationVersion -> OrganizationVersionApiDto 変換
   */
  private toApiDto(version: OrganizationVersion): OrganizationVersionApiDto {
    return {
      id: version.id,
      versionCode: version.versionCode,
      versionName: version.versionName,
      effectiveDate: version.effectiveDate.toISOString().split('T')[0], // YYYY-MM-DD
      expiryDate: version.expiryDate?.toISOString().split('T')[0] ?? null,
      baseVersionId: version.baseVersionId,
      description: version.description,
      isActive: version.isActive,
      createdAt: version.createdAt.toISOString(),
      updatedAt: version.updatedAt.toISOString(),
      createdBy: version.createdBy,
      updatedBy: version.updatedBy,
    };
  }
}
