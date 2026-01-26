import { Injectable, HttpException } from '@nestjs/common';
import { UomGroupRepository } from '../repository/uom-group.repository';
import { UomRepository } from '../repository/uom.repository';
import {
  ListUomGroupsApiRequest,
  ListUomGroupsApiResponse,
  GetUomGroupApiResponse,
  CreateUomGroupApiRequest,
  CreateUomGroupApiResponse,
  UpdateUomGroupApiRequest,
  UpdateUomGroupApiResponse,
  ActivateUomGroupApiRequest,
  ActivateUomGroupApiResponse,
  DeactivateUomGroupApiRequest,
  DeactivateUomGroupApiResponse,
  UomGroupApiDto,
  UomApiDto,
} from '@procure/contracts/api/unit-master';
import {
  UnitMasterErrorCode,
  UnitMasterErrorHttpStatus,
  UnitMasterErrorMessage,
} from '@procure/contracts/api/errors';
import { UomGroup, Uom } from '@prisma/client';

/**
 * コード形式: 英数字大文字 + -_ のみ、1〜10文字
 */
const CODE_FORMAT_REGEX = /^[A-Z0-9_-]{1,10}$/;

/**
 * UomGroup Service
 *
 * ビジネスルールの正本
 * - 単位グループコード一意性チェック
 * - コード形式検証
 * - 基準単位同時作成（トランザクション）
 * - 楽観ロック
 * - 監査ログ記録
 */
@Injectable()
export class UomGroupService {
  constructor(
    private readonly uomGroupRepository: UomGroupRepository,
    private readonly uomRepository: UomRepository,
  ) {}

  /**
   * 単位グループ一覧取得
   */
  async listUomGroups(
    tenantId: string,
    request: ListUomGroupsApiRequest,
  ): Promise<ListUomGroupsApiResponse> {
    const { offset, limit, sortBy, sortOrder, keyword, isActive } = request;

    const result = await this.uomGroupRepository.findMany({
      tenantId,
      offset,
      limit,
      sortBy,
      sortOrder,
      keyword,
      isActive,
    });

    return {
      items: result.items.map(this.toGroupApiDto),
      total: result.total,
    };
  }

  /**
   * 単位グループ詳細取得
   */
  async getUomGroup(
    tenantId: string,
    groupId: string,
  ): Promise<GetUomGroupApiResponse> {
    const group = await this.uomGroupRepository.findOne({
      tenantId,
      groupId,
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

    return {
      group: this.toGroupApiDto(group),
    };
  }

  /**
   * 単位グループ新規登録
   *
   * 循環参照の解決：
   * - UomGroupとUomは相互参照関係
   * - PostgreSQL DEFERRABLE制約を使用
   * - 単一トランザクション内で両方を作成
   */
  async createUomGroup(
    tenantId: string,
    userId: string,
    request: CreateUomGroupApiRequest,
  ): Promise<CreateUomGroupApiResponse> {
    // バリデーション: グループコード形式
    if (!CODE_FORMAT_REGEX.test(request.groupCode)) {
      throw new HttpException(
        {
          code: UnitMasterErrorCode.INVALID_UOM_GROUP_CODE_FORMAT,
          message: UnitMasterErrorMessage.INVALID_UOM_GROUP_CODE_FORMAT,
        },
        UnitMasterErrorHttpStatus.INVALID_UOM_GROUP_CODE_FORMAT,
      );
    }

    // バリデーション: 基準単位コード形式
    if (!CODE_FORMAT_REGEX.test(request.baseUomCode)) {
      throw new HttpException(
        {
          code: UnitMasterErrorCode.INVALID_UOM_CODE_FORMAT,
          message: UnitMasterErrorMessage.INVALID_UOM_CODE_FORMAT,
        },
        UnitMasterErrorHttpStatus.INVALID_UOM_CODE_FORMAT,
      );
    }

    // バリデーション: グループコード重複チェック
    const isGroupCodeDuplicate = await this.uomGroupRepository.checkGroupCodeDuplicate({
      tenantId,
      groupCode: request.groupCode,
    });

    if (isGroupCodeDuplicate) {
      throw new HttpException(
        {
          code: UnitMasterErrorCode.UOM_GROUP_CODE_DUPLICATE,
          message: UnitMasterErrorMessage.UOM_GROUP_CODE_DUPLICATE,
        },
        UnitMasterErrorHttpStatus.UOM_GROUP_CODE_DUPLICATE,
      );
    }

    // バリデーション: 基準単位コード重複チェック
    const isUomCodeDuplicate = await this.uomRepository.checkUomCodeDuplicate({
      tenantId,
      uomCode: request.baseUomCode,
    });

    if (isUomCodeDuplicate) {
      throw new HttpException(
        {
          code: UnitMasterErrorCode.UOM_CODE_DUPLICATE,
          message: UnitMasterErrorMessage.UOM_CODE_DUPLICATE,
        },
        UnitMasterErrorHttpStatus.UOM_CODE_DUPLICATE,
      );
    }

    // トランザクションで UomGroup と Uom を同時作成
    const prisma = this.uomGroupRepository.getPrisma();
    const { group, baseUom } = await prisma.$transaction(async (tx) => {
      // 1. 仮のbaseUomIdでUomGroupを作成（後で更新）
      // ※ DEFERRABLE制約により、トランザクション終了時まで制約チェックが遅延される

      // UUIDを事前生成
      const groupId = crypto.randomUUID();
      const uomId = crypto.randomUUID();

      // 2. UomGroupを作成（baseUomIdは作成予定のUomのID）
      const createdGroup = await tx.uomGroup.create({
        data: {
          id: groupId,
          tenantId,
          uomGroupCode: request.groupCode,
          uomGroupName: request.groupName,
          description: request.description ?? null,
          baseUomId: uomId, // 作成予定のUomのID
          isActive: true,
          version: 1,
          createdByLoginAccountId: userId,
          updatedByLoginAccountId: userId,
        },
      });

      // 3. Uom（基準単位）を作成
      const createdUom = await tx.uom.create({
        data: {
          id: uomId,
          tenantId,
          uomCode: request.baseUomCode,
          uomName: request.baseUomName,
          uomSymbol: request.baseUomSymbol ?? null,
          uomGroupId: groupId, // 作成したUomGroupのID
          isActive: true,
          version: 1,
          createdByLoginAccountId: userId,
          updatedByLoginAccountId: userId,
        },
      });

      return { group: createdGroup, baseUom: createdUom };
    });

    // TODO: 監査ログ記録

    return {
      group: this.toGroupApiDto(group),
      baseUom: this.toUomApiDto(baseUom),
    };
  }

  /**
   * 単位グループ更新
   */
  async updateUomGroup(
    tenantId: string,
    userId: string,
    groupId: string,
    request: UpdateUomGroupApiRequest,
  ): Promise<UpdateUomGroupApiResponse> {
    // 既存データ取得
    const existingGroup = await this.uomGroupRepository.findOne({
      tenantId,
      groupId,
    });

    if (!existingGroup) {
      throw new HttpException(
        {
          code: UnitMasterErrorCode.UOM_GROUP_NOT_FOUND,
          message: UnitMasterErrorMessage.UOM_GROUP_NOT_FOUND,
        },
        UnitMasterErrorHttpStatus.UOM_GROUP_NOT_FOUND,
      );
    }

    // バリデーション: 基準単位変更時は同一グループ内の単位かチェック
    if (request.baseUomId && request.baseUomId !== existingGroup.baseUomId) {
      const newBaseUom = await this.uomRepository.findOne({
        tenantId,
        uomId: request.baseUomId,
      });

      if (!newBaseUom) {
        throw new HttpException(
          {
            code: UnitMasterErrorCode.UOM_NOT_FOUND,
            message: UnitMasterErrorMessage.UOM_NOT_FOUND,
          },
          UnitMasterErrorHttpStatus.UOM_NOT_FOUND,
        );
      }

      if (newBaseUom.uomGroupId !== groupId) {
        throw new HttpException(
          {
            code: UnitMasterErrorCode.BASE_UOM_NOT_IN_GROUP,
            message: UnitMasterErrorMessage.BASE_UOM_NOT_IN_GROUP,
          },
          UnitMasterErrorHttpStatus.BASE_UOM_NOT_IN_GROUP,
        );
      }
    }

    // 更新（楽観ロック）
    const updatedGroup = await this.uomGroupRepository.update({
      tenantId,
      groupId,
      version: request.version,
      updatedBy: userId,
      data: {
        groupName: request.groupName,
        description: request.description,
        baseUomId: request.baseUomId,
      },
    });

    // 楽観ロック競合
    if (!updatedGroup) {
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
      group: this.toGroupApiDto(updatedGroup),
    };
  }

  /**
   * 単位グループ有効化
   */
  async activateUomGroup(
    tenantId: string,
    userId: string,
    groupId: string,
    request: ActivateUomGroupApiRequest,
  ): Promise<ActivateUomGroupApiResponse> {
    // 既存データ取得
    const existingGroup = await this.uomGroupRepository.findOne({
      tenantId,
      groupId,
    });

    if (!existingGroup) {
      throw new HttpException(
        {
          code: UnitMasterErrorCode.UOM_GROUP_NOT_FOUND,
          message: UnitMasterErrorMessage.UOM_GROUP_NOT_FOUND,
        },
        UnitMasterErrorHttpStatus.UOM_GROUP_NOT_FOUND,
      );
    }

    // 有効化
    const updatedGroup = await this.uomGroupRepository.setActive({
      tenantId,
      groupId,
      version: request.version,
      updatedBy: userId,
      isActive: true,
    });

    if (!updatedGroup) {
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
      group: this.toGroupApiDto(updatedGroup),
    };
  }

  /**
   * 単位グループ無効化
   */
  async deactivateUomGroup(
    tenantId: string,
    userId: string,
    groupId: string,
    request: DeactivateUomGroupApiRequest,
  ): Promise<DeactivateUomGroupApiResponse> {
    // 既存データ取得
    const existingGroup = await this.uomGroupRepository.findOne({
      tenantId,
      groupId,
    });

    if (!existingGroup) {
      throw new HttpException(
        {
          code: UnitMasterErrorCode.UOM_GROUP_NOT_FOUND,
          message: UnitMasterErrorMessage.UOM_GROUP_NOT_FOUND,
        },
        UnitMasterErrorHttpStatus.UOM_GROUP_NOT_FOUND,
      );
    }

    // 警告: 有効な単位が存在する場合（無効化は許可するが警告）
    // ※ 現在の設計では警告はログのみ、無効化自体は許可
    const hasActiveUoms = await this.uomGroupRepository.hasActiveUoms({
      tenantId,
      groupId,
    });

    if (hasActiveUoms) {
      // TODO: 警告をレスポンスに含める or ログ出力
      // 現時点では無効化を許可（UIで確認ダイアログを出す想定）
    }

    // 無効化
    const updatedGroup = await this.uomGroupRepository.setActive({
      tenantId,
      groupId,
      version: request.version,
      updatedBy: userId,
      isActive: false,
    });

    if (!updatedGroup) {
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
      group: this.toGroupApiDto(updatedGroup),
    };
  }

  /**
   * UomGroup -> UomGroupApiDto 変換
   */
  private toGroupApiDto(group: UomGroup): UomGroupApiDto {
    return {
      id: group.id,
      groupCode: group.uomGroupCode,
      groupName: group.uomGroupName,
      description: group.description,
      baseUomId: group.baseUomId,
      isActive: group.isActive,
      version: group.version,
      createdAt: group.createdAt.toISOString(),
      updatedAt: group.updatedAt.toISOString(),
      createdByLoginAccountId: group.createdByLoginAccountId,
      updatedByLoginAccountId: group.updatedByLoginAccountId,
    };
  }

  /**
   * Uom -> UomApiDto 変換
   */
  private toUomApiDto(uom: Uom): UomApiDto {
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
