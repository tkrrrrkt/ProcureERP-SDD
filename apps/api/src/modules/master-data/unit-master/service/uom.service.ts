import { Injectable, HttpException } from '@nestjs/common';
import { UomRepository } from '../repository/uom.repository';
import { UomGroupRepository } from '../repository/uom-group.repository';
import {
  ListUomsApiRequest,
  ListUomsApiResponse,
  GetUomApiResponse,
  CreateUomApiRequest,
  CreateUomApiResponse,
  UpdateUomApiRequest,
  UpdateUomApiResponse,
  ActivateUomApiRequest,
  ActivateUomApiResponse,
  DeactivateUomApiRequest,
  DeactivateUomApiResponse,
  SuggestUomsApiRequest,
  SuggestUomsApiResponse,
  UomApiDto,
} from '@procure/contracts/api/unit-master';
import {
  UnitMasterErrorCode,
  UnitMasterErrorHttpStatus,
  UnitMasterErrorMessage,
} from '@procure/contracts/api/errors';
import { Uom } from '@prisma/client';

/**
 * コード形式: 英数字大文字 + -_ のみ、1〜10文字
 */
const CODE_FORMAT_REGEX = /^[A-Z0-9_-]{1,10}$/;

/**
 * Uom Service
 *
 * ビジネスルールの正本
 * - 単位コード一意性チェック
 * - コード形式検証
 * - コード変更禁止
 * - グループ変更禁止
 * - 基準単位無効化禁止
 * - 品目使用中無効化禁止
 * - 楽観ロック
 * - 監査ログ記録
 */
@Injectable()
export class UomService {
  constructor(
    private readonly uomRepository: UomRepository,
    private readonly uomGroupRepository: UomGroupRepository,
  ) {}

  /**
   * 単位一覧取得
   */
  async listUoms(
    tenantId: string,
    request: ListUomsApiRequest,
  ): Promise<ListUomsApiResponse> {
    const { offset, limit, sortBy, sortOrder, keyword, groupId, isActive } = request;

    const result = await this.uomRepository.findMany({
      tenantId,
      offset,
      limit,
      sortBy,
      sortOrder,
      keyword,
      groupId,
      isActive,
    });

    return {
      items: result.items.map((uom) => this.toApiDto(uom)),
      total: result.total,
    };
  }

  /**
   * 単位詳細取得
   */
  async getUom(
    tenantId: string,
    uomId: string,
  ): Promise<GetUomApiResponse> {
    const uom = await this.uomRepository.findOne({
      tenantId,
      uomId,
    });

    if (!uom) {
      throw new HttpException(
        {
          code: UnitMasterErrorCode.UOM_NOT_FOUND,
          message: UnitMasterErrorMessage.UOM_NOT_FOUND,
        },
        UnitMasterErrorHttpStatus.UOM_NOT_FOUND,
      );
    }

    return {
      uom: this.toApiDto(uom),
    };
  }

  /**
   * 単位新規登録
   */
  async createUom(
    tenantId: string,
    userId: string,
    request: CreateUomApiRequest,
  ): Promise<CreateUomApiResponse> {
    // バリデーション: コード形式
    if (!CODE_FORMAT_REGEX.test(request.uomCode)) {
      throw new HttpException(
        {
          code: UnitMasterErrorCode.INVALID_UOM_CODE_FORMAT,
          message: UnitMasterErrorMessage.INVALID_UOM_CODE_FORMAT,
        },
        UnitMasterErrorHttpStatus.INVALID_UOM_CODE_FORMAT,
      );
    }

    // バリデーション: グループ存在チェック
    const group = await this.uomGroupRepository.findOne({
      tenantId,
      groupId: request.groupId,
    });

    if (!group) {
      throw new HttpException(
        {
          code: UnitMasterErrorCode.UOM_GROUP_NOT_FOUND,
          message: UnitMasterErrorMessage.UOM_GROUP_NOT_FOUND,
        },
        UnitMasterErrorHttpStatus.UOM_GROUP_NOT_FOUND,
      );
    }

    // バリデーション: コード重複チェック
    const isDuplicate = await this.uomRepository.checkUomCodeDuplicate({
      tenantId,
      uomCode: request.uomCode,
    });

    if (isDuplicate) {
      throw new HttpException(
        {
          code: UnitMasterErrorCode.UOM_CODE_DUPLICATE,
          message: UnitMasterErrorMessage.UOM_CODE_DUPLICATE,
        },
        UnitMasterErrorHttpStatus.UOM_CODE_DUPLICATE,
      );
    }

    // 登録
    const uom = await this.uomRepository.create({
      tenantId,
      createdBy: userId,
      data: {
        uomCode: request.uomCode,
        uomName: request.uomName,
        uomSymbol: request.uomSymbol,
        groupId: request.groupId,
      },
    });

    // TODO: 監査ログ記録

    return {
      uom: this.toApiDtoSimple(uom),
    };
  }

  /**
   * 単位更新
   */
  async updateUom(
    tenantId: string,
    userId: string,
    uomId: string,
    request: UpdateUomApiRequest,
  ): Promise<UpdateUomApiResponse> {
    // 既存データ取得
    const existingUom = await this.uomRepository.findOne({
      tenantId,
      uomId,
    });

    if (!existingUom) {
      throw new HttpException(
        {
          code: UnitMasterErrorCode.UOM_NOT_FOUND,
          message: UnitMasterErrorMessage.UOM_NOT_FOUND,
        },
        UnitMasterErrorHttpStatus.UOM_NOT_FOUND,
      );
    }

    // 注: コード変更禁止、グループ変更禁止はリクエストDTOにフィールドがないため
    // 実装上は考慮不要（APIレベルで受け付けない）

    // 更新（楽観ロック）
    const updatedUom = await this.uomRepository.update({
      tenantId,
      uomId,
      version: request.version,
      updatedBy: userId,
      data: {
        uomName: request.uomName,
        uomSymbol: request.uomSymbol,
      },
    });

    // 楽観ロック競合
    if (!updatedUom) {
      throw new HttpException(
        {
          code: UnitMasterErrorCode.CONCURRENT_UPDATE,
          message: UnitMasterErrorMessage.CONCURRENT_UPDATE,
        },
        UnitMasterErrorHttpStatus.CONCURRENT_UPDATE,
      );
    }

    // TODO: 監査ログ記録

    return {
      uom: this.toApiDtoSimple(updatedUom),
    };
  }

  /**
   * 単位有効化
   */
  async activateUom(
    tenantId: string,
    userId: string,
    uomId: string,
    request: ActivateUomApiRequest,
  ): Promise<ActivateUomApiResponse> {
    // 既存データ取得
    const existingUom = await this.uomRepository.findOne({
      tenantId,
      uomId,
    });

    if (!existingUom) {
      throw new HttpException(
        {
          code: UnitMasterErrorCode.UOM_NOT_FOUND,
          message: UnitMasterErrorMessage.UOM_NOT_FOUND,
        },
        UnitMasterErrorHttpStatus.UOM_NOT_FOUND,
      );
    }

    // 有効化
    const updatedUom = await this.uomRepository.setActive({
      tenantId,
      uomId,
      version: request.version,
      updatedBy: userId,
      isActive: true,
    });

    if (!updatedUom) {
      throw new HttpException(
        {
          code: UnitMasterErrorCode.CONCURRENT_UPDATE,
          message: UnitMasterErrorMessage.CONCURRENT_UPDATE,
        },
        UnitMasterErrorHttpStatus.CONCURRENT_UPDATE,
      );
    }

    // TODO: 監査ログ記録

    return {
      uom: this.toApiDtoSimple(updatedUom),
    };
  }

  /**
   * 単位無効化
   */
  async deactivateUom(
    tenantId: string,
    userId: string,
    uomId: string,
    request: DeactivateUomApiRequest,
  ): Promise<DeactivateUomApiResponse> {
    // 既存データ取得
    const existingUom = await this.uomRepository.findOne({
      tenantId,
      uomId,
    });

    if (!existingUom) {
      throw new HttpException(
        {
          code: UnitMasterErrorCode.UOM_NOT_FOUND,
          message: UnitMasterErrorMessage.UOM_NOT_FOUND,
        },
        UnitMasterErrorHttpStatus.UOM_NOT_FOUND,
      );
    }

    // バリデーション: 基準単位は無効化できない
    if (existingUom.uomGroup.baseUomId === uomId) {
      throw new HttpException(
        {
          code: UnitMasterErrorCode.CANNOT_DEACTIVATE_BASE_UOM,
          message: UnitMasterErrorMessage.CANNOT_DEACTIVATE_BASE_UOM,
        },
        UnitMasterErrorHttpStatus.CANNOT_DEACTIVATE_BASE_UOM,
      );
    }

    // バリデーション: 品目で使用中の単位は無効化できない
    const isUsed = await this.uomRepository.isUsedByItems({
      tenantId,
      uomId,
    });

    if (isUsed) {
      throw new HttpException(
        {
          code: UnitMasterErrorCode.UOM_IN_USE,
          message: UnitMasterErrorMessage.UOM_IN_USE,
        },
        UnitMasterErrorHttpStatus.UOM_IN_USE,
      );
    }

    // 無効化
    const updatedUom = await this.uomRepository.setActive({
      tenantId,
      uomId,
      version: request.version,
      updatedBy: userId,
      isActive: false,
    });

    if (!updatedUom) {
      throw new HttpException(
        {
          code: UnitMasterErrorCode.CONCURRENT_UPDATE,
          message: UnitMasterErrorMessage.CONCURRENT_UPDATE,
        },
        UnitMasterErrorHttpStatus.CONCURRENT_UPDATE,
      );
    }

    // TODO: 監査ログ記録

    return {
      uom: this.toApiDtoSimple(updatedUom),
    };
  }

  /**
   * 単位サジェスト
   */
  async suggestUoms(
    tenantId: string,
    request: SuggestUomsApiRequest,
  ): Promise<SuggestUomsApiResponse> {
    const { keyword, groupId, limit } = request;

    const items = await this.uomRepository.suggest({
      tenantId,
      keyword,
      groupId,
      limit: Math.min(limit, 20), // 最大20件
    });

    return {
      items: items.map((uom) => this.toApiDto(uom)),
    };
  }

  /**
   * Uom -> UomApiDto 変換（uomGroup include版）
   */
  private toApiDto(uom: Uom & { uomGroup?: { uomGroupCode: string } }): UomApiDto {
    return {
      id: uom.id,
      uomCode: uom.uomCode,
      uomName: uom.uomName,
      uomSymbol: uom.uomSymbol,
      uomGroupId: uom.uomGroupId,
      isActive: uom.isActive,
      version: uom.version,
      createdAt: uom.createdAt.toISOString(),
      updatedAt: uom.updatedAt.toISOString(),
      createdByLoginAccountId: uom.createdByLoginAccountId,
      updatedByLoginAccountId: uom.updatedByLoginAccountId,
    };
  }

  /**
   * Uom -> UomApiDto 変換（シンプル版）
   */
  private toApiDtoSimple(uom: Uom): UomApiDto {
    return {
      id: uom.id,
      uomCode: uom.uomCode,
      uomName: uom.uomName,
      uomSymbol: uom.uomSymbol,
      uomGroupId: uom.uomGroupId,
      isActive: uom.isActive,
      version: uom.version,
      createdAt: uom.createdAt.toISOString(),
      updatedAt: uom.updatedAt.toISOString(),
      createdByLoginAccountId: uom.createdByLoginAccountId,
      updatedByLoginAccountId: uom.updatedByLoginAccountId,
    };
  }
}
