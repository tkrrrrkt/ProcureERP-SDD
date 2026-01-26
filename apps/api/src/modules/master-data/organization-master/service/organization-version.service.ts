import { Injectable, HttpException } from '@nestjs/common';
import { OrganizationVersionRepository } from '../repository/organization-version.repository';
import {
  ListVersionsApiRequest,
  ListVersionsApiResponse,
  GetVersionApiResponse,
  CreateVersionApiRequest,
  CreateVersionApiResponse,
  UpdateVersionApiRequest,
  UpdateVersionApiResponse,
  AsOfSearchApiRequest,
  AsOfSearchApiResponse,
  OrganizationVersionApiDto,
} from '@procure/contracts/api/organization-master';
import {
  OrganizationMasterErrorCode,
  OrganizationMasterErrorHttpStatus,
  OrganizationMasterErrorMessage,
} from '@procure/contracts/api/errors';
import { OrganizationVersion } from '@prisma/client';

/**
 * OrganizationVersion Service
 *
 * ビジネスルールの正本
 * - バージョンコード一意性チェック
 * - 有効期間整合性チェック
 * - as-of検索
 * - 監査ログ記録
 */
@Injectable()
export class OrganizationVersionService {
  constructor(private readonly versionRepository: OrganizationVersionRepository) {}

  /**
   * バージョン一覧取得
   */
  async listVersions(
    tenantId: string,
    request: ListVersionsApiRequest,
  ): Promise<ListVersionsApiResponse> {
    const versions = await this.versionRepository.findMany({
      tenantId,
      sortBy: request.sortBy,
      sortOrder: request.sortOrder,
    });

    return {
      items: versions.map((v) => this.toApiDto(v)),
    };
  }

  /**
   * バージョン詳細取得
   */
  async getVersion(tenantId: string, versionId: string): Promise<GetVersionApiResponse> {
    const version = await this.versionRepository.findById({
      tenantId,
      versionId,
    });

    if (!version) {
      throw new HttpException(
        {
          code: OrganizationMasterErrorCode.VERSION_NOT_FOUND,
          message: OrganizationMasterErrorMessage.VERSION_NOT_FOUND,
        },
        OrganizationMasterErrorHttpStatus.VERSION_NOT_FOUND,
      );
    }

    return {
      version: this.toApiDto(version),
    };
  }

  /**
   * バージョン新規作成
   */
  async createVersion(
    tenantId: string,
    userId: string,
    request: CreateVersionApiRequest,
  ): Promise<CreateVersionApiResponse> {
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

    // 登録
    const version = await this.versionRepository.create({
      tenantId,
      createdBy: userId,
      data: {
        versionCode: request.versionCode,
        versionName: request.versionName,
        effectiveDate: new Date(request.effectiveDate),
        expiryDate: request.expiryDate ? new Date(request.expiryDate) : undefined,
        description: request.description,
      },
    });

    return {
      version: this.toApiDto(version),
    };
  }

  /**
   * バージョン更新
   */
  async updateVersion(
    tenantId: string,
    userId: string,
    versionId: string,
    request: UpdateVersionApiRequest,
  ): Promise<UpdateVersionApiResponse> {
    // 既存データ取得
    const existingVersion = await this.versionRepository.findById({
      tenantId,
      versionId,
    });

    if (!existingVersion) {
      throw new HttpException(
        {
          code: OrganizationMasterErrorCode.VERSION_NOT_FOUND,
          message: OrganizationMasterErrorMessage.VERSION_NOT_FOUND,
        },
        OrganizationMasterErrorHttpStatus.VERSION_NOT_FOUND,
      );
    }

    // バリデーション: 有効期間整合性
    const effectiveDate = request.effectiveDate
      ? new Date(request.effectiveDate)
      : existingVersion.effectiveDate;
    const expiryDate =
      request.expiryDate !== undefined
        ? request.expiryDate
          ? new Date(request.expiryDate)
          : null
        : existingVersion.expiryDate;

    if (expiryDate && expiryDate <= effectiveDate) {
      throw new HttpException(
        {
          code: OrganizationMasterErrorCode.INVALID_EFFECTIVE_DATE_RANGE,
          message: OrganizationMasterErrorMessage.INVALID_EFFECTIVE_DATE_RANGE,
        },
        OrganizationMasterErrorHttpStatus.INVALID_EFFECTIVE_DATE_RANGE,
      );
    }

    // バリデーション: バージョンコード変更がある場合のみ重複チェック
    if (request.versionCode && request.versionCode !== existingVersion.versionCode) {
      const isDuplicate = await this.versionRepository.checkVersionCodeDuplicate({
        tenantId,
        versionCode: request.versionCode,
        excludeVersionId: versionId,
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
    }

    // 更新
    const updatedVersion = await this.versionRepository.update({
      tenantId,
      versionId,
      updatedBy: userId,
      data: {
        versionCode: request.versionCode,
        versionName: request.versionName,
        effectiveDate: request.effectiveDate ? new Date(request.effectiveDate) : undefined,
        expiryDate:
          request.expiryDate !== undefined
            ? request.expiryDate
              ? new Date(request.expiryDate)
              : null
            : undefined,
        description: request.description,
      },
    });

    if (!updatedVersion) {
      throw new HttpException(
        {
          code: OrganizationMasterErrorCode.VERSION_NOT_FOUND,
          message: OrganizationMasterErrorMessage.VERSION_NOT_FOUND,
        },
        OrganizationMasterErrorHttpStatus.VERSION_NOT_FOUND,
      );
    }

    return {
      version: this.toApiDto(updatedVersion),
    };
  }

  /**
   * as-of検索
   */
  async findEffectiveAsOf(
    tenantId: string,
    request: AsOfSearchApiRequest,
  ): Promise<AsOfSearchApiResponse> {
    const version = await this.versionRepository.findEffectiveAsOf({
      tenantId,
      asOfDate: new Date(request.asOfDate),
    });

    return {
      version: version ? this.toApiDto(version) : null,
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
