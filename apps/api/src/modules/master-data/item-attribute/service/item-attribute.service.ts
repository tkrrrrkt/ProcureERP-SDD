import { Injectable, HttpException } from '@nestjs/common';
import { ItemAttributeRepository } from '../repository/item-attribute.repository';
import {
  ListItemAttributesApiRequest,
  ListItemAttributesApiResponse,
  GetItemAttributeApiResponse,
  CreateItemAttributeApiRequest,
  CreateItemAttributeApiResponse,
  UpdateItemAttributeApiRequest,
  UpdateItemAttributeApiResponse,
  ActivateItemAttributeApiRequest,
  ActivateItemAttributeApiResponse,
  DeactivateItemAttributeApiRequest,
  DeactivateItemAttributeApiResponse,
  SuggestItemAttributesApiRequest,
  SuggestItemAttributesApiResponse,
  ItemAttributeApiDto,
} from '@procure/contracts/api/item-attribute';
import {
  ItemAttributeErrorCode,
  ItemAttributeErrorHttpStatus,
  ItemAttributeErrorMessage,
} from '@procure/contracts/api/errors';
import { ItemAttribute } from '@prisma/client';

/**
 * コード形式: 英数字大文字 + -_ のみ、1〜20文字
 */
const CODE_FORMAT_REGEX = /^[A-Z0-9_-]{1,20}$/;

/**
 * ItemAttribute Service
 *
 * ビジネスルールの正本
 * - 仕様属性コード一意性チェック
 * - コード形式検証
 * - コード変更禁止
 * - SKU使用中無効化警告
 * - 楽観ロック
 * - 監査ログ記録
 */
@Injectable()
export class ItemAttributeService {
  constructor(
    private readonly itemAttributeRepository: ItemAttributeRepository,
  ) {}

  /**
   * 仕様属性一覧取得
   */
  async listItemAttributes(
    tenantId: string,
    request: ListItemAttributesApiRequest,
  ): Promise<ListItemAttributesApiResponse> {
    const { offset, limit, sortBy, sortOrder, keyword, isActive } = request;

    const result = await this.itemAttributeRepository.findMany({
      tenantId,
      offset,
      limit,
      sortBy,
      sortOrder,
      keyword,
      isActive,
    });

    return {
      items: result.items.map((attr) => this.toApiDto(attr)),
      total: result.total,
    };
  }

  /**
   * 仕様属性詳細取得
   */
  async getItemAttribute(
    tenantId: string,
    attributeId: string,
  ): Promise<GetItemAttributeApiResponse> {
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

    return {
      attribute: this.toApiDto(attribute),
    };
  }

  /**
   * 仕様属性新規登録
   */
  async createItemAttribute(
    tenantId: string,
    userId: string,
    request: CreateItemAttributeApiRequest,
  ): Promise<CreateItemAttributeApiResponse> {
    // バリデーション: コード形式
    if (!CODE_FORMAT_REGEX.test(request.attributeCode)) {
      throw new HttpException(
        {
          code: ItemAttributeErrorCode.INVALID_ATTRIBUTE_CODE_FORMAT,
          message: ItemAttributeErrorMessage.INVALID_ATTRIBUTE_CODE_FORMAT,
        },
        ItemAttributeErrorHttpStatus.INVALID_ATTRIBUTE_CODE_FORMAT,
      );
    }

    // バリデーション: コード重複チェック
    const isDuplicate = await this.itemAttributeRepository.checkCodeDuplicate({
      tenantId,
      attributeCode: request.attributeCode,
    });

    if (isDuplicate) {
      throw new HttpException(
        {
          code: ItemAttributeErrorCode.ITEM_ATTRIBUTE_CODE_DUPLICATE,
          message: ItemAttributeErrorMessage.ITEM_ATTRIBUTE_CODE_DUPLICATE,
        },
        ItemAttributeErrorHttpStatus.ITEM_ATTRIBUTE_CODE_DUPLICATE,
      );
    }

    // 登録
    const attribute = await this.itemAttributeRepository.create({
      tenantId,
      createdBy: userId,
      data: {
        attributeCode: request.attributeCode,
        attributeName: request.attributeName,
        sortOrder: request.sortOrder,
      },
    });

    // TODO: 監査ログ記録

    return {
      attribute: this.toApiDto(attribute),
    };
  }

  /**
   * 仕様属性更新
   */
  async updateItemAttribute(
    tenantId: string,
    userId: string,
    attributeId: string,
    request: UpdateItemAttributeApiRequest,
  ): Promise<UpdateItemAttributeApiResponse> {
    // 既存データ取得
    const existingAttribute = await this.itemAttributeRepository.findOne({
      tenantId,
      attributeId,
    });

    if (!existingAttribute) {
      throw new HttpException(
        {
          code: ItemAttributeErrorCode.ITEM_ATTRIBUTE_NOT_FOUND,
          message: ItemAttributeErrorMessage.ITEM_ATTRIBUTE_NOT_FOUND,
        },
        ItemAttributeErrorHttpStatus.ITEM_ATTRIBUTE_NOT_FOUND,
      );
    }

    // 注: コード変更禁止はリクエストDTOにフィールドがないため
    // 実装上は考慮不要（APIレベルで受け付けない）

    // 更新（楽観ロック）
    const updatedAttribute = await this.itemAttributeRepository.update({
      tenantId,
      attributeId,
      version: request.version,
      updatedBy: userId,
      data: {
        attributeName: request.attributeName,
        sortOrder: request.sortOrder,
      },
    });

    // 楽観ロック競合
    if (!updatedAttribute) {
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
      attribute: this.toApiDto(updatedAttribute),
    };
  }

  /**
   * 仕様属性有効化
   */
  async activateItemAttribute(
    tenantId: string,
    userId: string,
    attributeId: string,
    request: ActivateItemAttributeApiRequest,
  ): Promise<ActivateItemAttributeApiResponse> {
    // 既存データ取得
    const existingAttribute = await this.itemAttributeRepository.findOne({
      tenantId,
      attributeId,
    });

    if (!existingAttribute) {
      throw new HttpException(
        {
          code: ItemAttributeErrorCode.ITEM_ATTRIBUTE_NOT_FOUND,
          message: ItemAttributeErrorMessage.ITEM_ATTRIBUTE_NOT_FOUND,
        },
        ItemAttributeErrorHttpStatus.ITEM_ATTRIBUTE_NOT_FOUND,
      );
    }

    // 有効化
    const updatedAttribute = await this.itemAttributeRepository.setActive({
      tenantId,
      attributeId,
      version: request.version,
      updatedBy: userId,
      isActive: true,
    });

    if (!updatedAttribute) {
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
      attribute: this.toApiDto(updatedAttribute),
    };
  }

  /**
   * 仕様属性無効化
   */
  async deactivateItemAttribute(
    tenantId: string,
    userId: string,
    attributeId: string,
    request: DeactivateItemAttributeApiRequest,
  ): Promise<DeactivateItemAttributeApiResponse> {
    // 既存データ取得
    const existingAttribute = await this.itemAttributeRepository.findOne({
      tenantId,
      attributeId,
    });

    if (!existingAttribute) {
      throw new HttpException(
        {
          code: ItemAttributeErrorCode.ITEM_ATTRIBUTE_NOT_FOUND,
          message: ItemAttributeErrorMessage.ITEM_ATTRIBUTE_NOT_FOUND,
        },
        ItemAttributeErrorHttpStatus.ITEM_ATTRIBUTE_NOT_FOUND,
      );
    }

    // バリデーション: SKUで使用中の仕様属性は無効化時に警告（force指定時は許可）
    const usageCheck = await this.itemAttributeRepository.isUsedByVariants({
      tenantId,
      attributeId,
    });

    if (usageCheck.isUsed && !request.force) {
      throw new HttpException(
        {
          code: ItemAttributeErrorCode.ATTRIBUTE_IN_USE,
          message: ItemAttributeErrorMessage.ATTRIBUTE_IN_USE,
        },
        ItemAttributeErrorHttpStatus.ATTRIBUTE_IN_USE,
      );
    }

    // 無効化
    const updatedAttribute = await this.itemAttributeRepository.setActive({
      tenantId,
      attributeId,
      version: request.version,
      updatedBy: userId,
      isActive: false,
    });

    if (!updatedAttribute) {
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
      attribute: this.toApiDto(updatedAttribute),
      affectedCount: usageCheck.usageCount,
    };
  }

  /**
   * 仕様属性サジェスト
   */
  async suggestItemAttributes(
    tenantId: string,
    request: SuggestItemAttributesApiRequest,
  ): Promise<SuggestItemAttributesApiResponse> {
    const { keyword, limit } = request;

    const items = await this.itemAttributeRepository.suggest({
      tenantId,
      keyword,
      limit: Math.min(limit, 20), // 最大20件
    });

    return {
      items: items.map((attr) => this.toApiDto(attr)),
    };
  }

  /**
   * ItemAttribute -> ItemAttributeApiDto 変換
   */
  private toApiDto(attribute: ItemAttribute): ItemAttributeApiDto {
    return {
      id: attribute.id,
      attributeCode: attribute.itemAttributeCode,
      attributeName: attribute.itemAttributeName,
      valueType: attribute.valueType,
      sortOrder: attribute.sortOrder,
      isActive: attribute.isActive,
      version: attribute.version,
      createdAt: attribute.createdAt.toISOString(),
      updatedAt: attribute.updatedAt.toISOString(),
      createdByLoginAccountId: attribute.createdByLoginAccountId,
      updatedByLoginAccountId: attribute.updatedByLoginAccountId,
    };
  }
}
