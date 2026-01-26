import { Injectable, HttpException } from '@nestjs/common';
import { ItemAttributeValueRepository } from '../repository/item-attribute-value.repository';
import { ItemAttributeRepository } from '../repository/item-attribute.repository';
import {
  ListItemAttributeValuesApiRequest,
  ListItemAttributeValuesApiResponse,
  GetItemAttributeValueApiResponse,
  CreateItemAttributeValueApiRequest,
  CreateItemAttributeValueApiResponse,
  UpdateItemAttributeValueApiRequest,
  UpdateItemAttributeValueApiResponse,
  ActivateItemAttributeValueApiRequest,
  ActivateItemAttributeValueApiResponse,
  DeactivateItemAttributeValueApiRequest,
  DeactivateItemAttributeValueApiResponse,
  SuggestItemAttributeValuesApiRequest,
  SuggestItemAttributeValuesApiResponse,
  ItemAttributeValueApiDto,
} from '@procure/contracts/api/item-attribute';
import {
  ItemAttributeErrorCode,
  ItemAttributeErrorHttpStatus,
  ItemAttributeErrorMessage,
} from '@procure/contracts/api/errors';
import { ItemAttributeValue } from '@prisma/client';

/**
 * コード形式: 英数字大文字 + -_ のみ、1〜30文字
 */
const VALUE_CODE_FORMAT_REGEX = /^[A-Z0-9_-]{1,30}$/;

/**
 * ItemAttributeValue Service
 *
 * ビジネスルールの正本
 * - 属性値コード一意性チェック（同一属性内）
 * - コード形式検証
 * - コード変更禁止
 * - SKU使用中無効化警告
 * - 楽観ロック
 * - 監査ログ記録
 */
@Injectable()
export class ItemAttributeValueService {
  constructor(
    private readonly itemAttributeValueRepository: ItemAttributeValueRepository,
    private readonly itemAttributeRepository: ItemAttributeRepository,
  ) {}

  /**
   * 属性値一覧取得
   */
  async listItemAttributeValues(
    tenantId: string,
    attributeId: string,
    request: ListItemAttributeValuesApiRequest,
  ): Promise<ListItemAttributeValuesApiResponse> {
    // 親属性存在チェック
    const attribute = await this.itemAttributeRepository.findOne({
      tenantId,
      attributeId,
    });

    if (!attribute) {
      throw new HttpException(
        {
          code: ItemAttributeErrorCode.ITEM_ATTRIBUTE_NOT_FOUND,
          message: ItemAttributeErrorMessage.ITEM_ATTRIBUTE_NOT_FOUND,
        },
        ItemAttributeErrorHttpStatus.ITEM_ATTRIBUTE_NOT_FOUND,
      );
    }

    const { offset, limit, sortBy, sortOrder, keyword, isActive } = request;

    const result = await this.itemAttributeValueRepository.findMany({
      tenantId,
      attributeId,
      offset,
      limit,
      sortBy,
      sortOrder,
      keyword,
      isActive,
    });

    return {
      items: result.items.map((value) => this.toApiDto(value)),
      total: result.total,
    };
  }

  /**
   * 属性値詳細取得
   */
  async getItemAttributeValue(
    tenantId: string,
    valueId: string,
  ): Promise<GetItemAttributeValueApiResponse> {
    const value = await this.itemAttributeValueRepository.findOne({
      tenantId,
      valueId,
    });

    if (!value) {
      throw new HttpException(
        {
          code: ItemAttributeErrorCode.ITEM_ATTRIBUTE_VALUE_NOT_FOUND,
          message: ItemAttributeErrorMessage.ITEM_ATTRIBUTE_VALUE_NOT_FOUND,
        },
        ItemAttributeErrorHttpStatus.ITEM_ATTRIBUTE_VALUE_NOT_FOUND,
      );
    }

    return {
      value: this.toApiDto(value),
    };
  }

  /**
   * 属性値新規登録
   */
  async createItemAttributeValue(
    tenantId: string,
    userId: string,
    attributeId: string,
    request: CreateItemAttributeValueApiRequest,
  ): Promise<CreateItemAttributeValueApiResponse> {
    // 親属性存在チェック
    const attribute = await this.itemAttributeRepository.findOne({
      tenantId,
      attributeId,
    });

    if (!attribute) {
      throw new HttpException(
        {
          code: ItemAttributeErrorCode.ITEM_ATTRIBUTE_NOT_FOUND,
          message: ItemAttributeErrorMessage.ITEM_ATTRIBUTE_NOT_FOUND,
        },
        ItemAttributeErrorHttpStatus.ITEM_ATTRIBUTE_NOT_FOUND,
      );
    }

    // バリデーション: コード形式
    if (!VALUE_CODE_FORMAT_REGEX.test(request.valueCode)) {
      throw new HttpException(
        {
          code: ItemAttributeErrorCode.INVALID_VALUE_CODE_FORMAT,
          message: ItemAttributeErrorMessage.INVALID_VALUE_CODE_FORMAT,
        },
        ItemAttributeErrorHttpStatus.INVALID_VALUE_CODE_FORMAT,
      );
    }

    // バリデーション: コード重複チェック（同一属性内）
    const isDuplicate = await this.itemAttributeValueRepository.checkCodeDuplicate({
      tenantId,
      attributeId,
      valueCode: request.valueCode,
    });

    if (isDuplicate) {
      throw new HttpException(
        {
          code: ItemAttributeErrorCode.VALUE_CODE_DUPLICATE,
          message: ItemAttributeErrorMessage.VALUE_CODE_DUPLICATE,
        },
        ItemAttributeErrorHttpStatus.VALUE_CODE_DUPLICATE,
      );
    }

    // 登録
    const value = await this.itemAttributeValueRepository.create({
      tenantId,
      createdBy: userId,
      data: {
        attributeId,
        valueCode: request.valueCode,
        valueName: request.valueName,
        sortOrder: request.sortOrder,
      },
    });

    // TODO: 監査ログ記録

    return {
      value: this.toApiDto(value),
    };
  }

  /**
   * 属性値更新
   */
  async updateItemAttributeValue(
    tenantId: string,
    userId: string,
    valueId: string,
    request: UpdateItemAttributeValueApiRequest,
  ): Promise<UpdateItemAttributeValueApiResponse> {
    // 既存データ取得
    const existingValue = await this.itemAttributeValueRepository.findOne({
      tenantId,
      valueId,
    });

    if (!existingValue) {
      throw new HttpException(
        {
          code: ItemAttributeErrorCode.ITEM_ATTRIBUTE_VALUE_NOT_FOUND,
          message: ItemAttributeErrorMessage.ITEM_ATTRIBUTE_VALUE_NOT_FOUND,
        },
        ItemAttributeErrorHttpStatus.ITEM_ATTRIBUTE_VALUE_NOT_FOUND,
      );
    }

    // 注: コード変更禁止はリクエストDTOにフィールドがないため
    // 実装上は考慮不要（APIレベルで受け付けない）

    // 更新（楽観ロック）
    const updatedValue = await this.itemAttributeValueRepository.update({
      tenantId,
      valueId,
      version: request.version,
      updatedBy: userId,
      data: {
        valueName: request.valueName,
        sortOrder: request.sortOrder,
      },
    });

    // 楽観ロック競合
    if (!updatedValue) {
      throw new HttpException(
        {
          code: ItemAttributeErrorCode.CONCURRENT_UPDATE,
          message: ItemAttributeErrorMessage.CONCURRENT_UPDATE,
        },
        ItemAttributeErrorHttpStatus.CONCURRENT_UPDATE,
      );
    }

    // TODO: 監査ログ記録

    return {
      value: this.toApiDto(updatedValue),
    };
  }

  /**
   * 属性値有効化
   */
  async activateItemAttributeValue(
    tenantId: string,
    userId: string,
    valueId: string,
    request: ActivateItemAttributeValueApiRequest,
  ): Promise<ActivateItemAttributeValueApiResponse> {
    // 既存データ取得
    const existingValue = await this.itemAttributeValueRepository.findOne({
      tenantId,
      valueId,
    });

    if (!existingValue) {
      throw new HttpException(
        {
          code: ItemAttributeErrorCode.ITEM_ATTRIBUTE_VALUE_NOT_FOUND,
          message: ItemAttributeErrorMessage.ITEM_ATTRIBUTE_VALUE_NOT_FOUND,
        },
        ItemAttributeErrorHttpStatus.ITEM_ATTRIBUTE_VALUE_NOT_FOUND,
      );
    }

    // 有効化
    const updatedValue = await this.itemAttributeValueRepository.setActive({
      tenantId,
      valueId,
      version: request.version,
      updatedBy: userId,
      isActive: true,
    });

    if (!updatedValue) {
      throw new HttpException(
        {
          code: ItemAttributeErrorCode.CONCURRENT_UPDATE,
          message: ItemAttributeErrorMessage.CONCURRENT_UPDATE,
        },
        ItemAttributeErrorHttpStatus.CONCURRENT_UPDATE,
      );
    }

    // TODO: 監査ログ記録

    return {
      value: this.toApiDto(updatedValue),
    };
  }

  /**
   * 属性値無効化
   */
  async deactivateItemAttributeValue(
    tenantId: string,
    userId: string,
    valueId: string,
    request: DeactivateItemAttributeValueApiRequest,
  ): Promise<DeactivateItemAttributeValueApiResponse> {
    // 既存データ取得
    const existingValue = await this.itemAttributeValueRepository.findOne({
      tenantId,
      valueId,
    });

    if (!existingValue) {
      throw new HttpException(
        {
          code: ItemAttributeErrorCode.ITEM_ATTRIBUTE_VALUE_NOT_FOUND,
          message: ItemAttributeErrorMessage.ITEM_ATTRIBUTE_VALUE_NOT_FOUND,
        },
        ItemAttributeErrorHttpStatus.ITEM_ATTRIBUTE_VALUE_NOT_FOUND,
      );
    }

    // バリデーション: SKUで使用中の属性値は無効化時に警告（force指定時は許可）
    const usageCheck = await this.itemAttributeValueRepository.isUsedByVariants({
      tenantId,
      valueId,
    });

    if (usageCheck.isUsed && !request.force) {
      throw new HttpException(
        {
          code: ItemAttributeErrorCode.VALUE_IN_USE,
          message: ItemAttributeErrorMessage.VALUE_IN_USE,
        },
        ItemAttributeErrorHttpStatus.VALUE_IN_USE,
      );
    }

    // 無効化
    const updatedValue = await this.itemAttributeValueRepository.setActive({
      tenantId,
      valueId,
      version: request.version,
      updatedBy: userId,
      isActive: false,
    });

    if (!updatedValue) {
      throw new HttpException(
        {
          code: ItemAttributeErrorCode.CONCURRENT_UPDATE,
          message: ItemAttributeErrorMessage.CONCURRENT_UPDATE,
        },
        ItemAttributeErrorHttpStatus.CONCURRENT_UPDATE,
      );
    }

    // TODO: 監査ログ記録

    return {
      value: this.toApiDto(updatedValue),
      affectedCount: usageCheck.usageCount,
    };
  }

  /**
   * 属性値サジェスト
   */
  async suggestItemAttributeValues(
    tenantId: string,
    request: SuggestItemAttributeValuesApiRequest,
  ): Promise<SuggestItemAttributeValuesApiResponse> {
    const { attributeId, keyword, limit } = request;

    const items = await this.itemAttributeValueRepository.suggest({
      tenantId,
      attributeId,
      keyword,
      limit: Math.min(limit, 20), // 最大20件
    });

    return {
      items: items.map((value) => this.toApiDto(value)),
    };
  }

  /**
   * ItemAttributeValue -> ItemAttributeValueApiDto 変換
   */
  private toApiDto(value: ItemAttributeValue): ItemAttributeValueApiDto {
    return {
      id: value.id,
      attributeId: value.itemAttributeId,
      valueCode: value.valueCode,
      valueName: value.valueName,
      sortOrder: value.sortOrder,
      isActive: value.isActive,
      version: value.version,
      createdAt: value.createdAt.toISOString(),
      updatedAt: value.updatedAt.toISOString(),
      createdByLoginAccountId: value.createdByLoginAccountId,
      updatedByLoginAccountId: value.updatedByLoginAccountId,
    };
  }
}
