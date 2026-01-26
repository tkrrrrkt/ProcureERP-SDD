import { Injectable } from '@nestjs/common';
import { ItemAttributeDomainApiClient } from '../clients/domain-api.client';
import { ItemAttributeMapper } from '../mappers/item-attribute.mapper';
import {
  ListItemAttributesRequest,
  ListItemAttributesResponse,
  GetItemAttributeResponse,
  CreateItemAttributeRequest,
  CreateItemAttributeResponse,
  UpdateItemAttributeRequest,
  UpdateItemAttributeResponse,
  ActivateItemAttributeRequest,
  ActivateItemAttributeResponse,
  DeactivateItemAttributeRequest,
  DeactivateItemAttributeResponse,
  SuggestItemAttributesRequest,
  SuggestItemAttributesResponse,
  ListItemAttributeValuesRequest,
  ListItemAttributeValuesResponse,
  GetItemAttributeValueResponse,
  CreateItemAttributeValueRequest,
  CreateItemAttributeValueResponse,
  UpdateItemAttributeValueRequest,
  UpdateItemAttributeValueResponse,
  ActivateItemAttributeValueRequest,
  ActivateItemAttributeValueResponse,
  DeactivateItemAttributeValueRequest,
  DeactivateItemAttributeValueResponse,
  SuggestItemAttributeValuesRequest,
  SuggestItemAttributeValuesResponse,
  ItemAttributeSortBy,
  ItemAttributeValueSortBy,
} from '@procure/contracts/bff/item-attribute';
import {
  ListItemAttributesApiRequest,
  ListItemAttributeValuesApiRequest,
  SuggestItemAttributesApiRequest,
  SuggestItemAttributeValuesApiRequest,
} from '@procure/contracts/api/item-attribute';

/**
 * Item Attribute BFF Service
 *
 * UI入力の正規化、Domain API呼び出し、DTO変換
 * - page/pageSize → offset/limit 変換
 * - sortBy ホワイトリストチェック
 * - keyword の trim・空→undefined
 * - valueCount / 親属性情報 の算出
 * - エラーは Pass-through
 */
@Injectable()
export class ItemAttributeBffService {
  // Paging / Sorting Normalization
  private readonly DEFAULT_PAGE = 1;
  private readonly DEFAULT_PAGE_SIZE = 50;
  private readonly MAX_PAGE_SIZE = 200;
  private readonly DEFAULT_ATTRIBUTE_SORT_BY: ItemAttributeSortBy = 'sortOrder';
  private readonly DEFAULT_VALUE_SORT_BY: ItemAttributeValueSortBy = 'sortOrder';
  private readonly DEFAULT_SORT_ORDER = 'asc' as const;

  // sortBy whitelist
  private readonly ATTRIBUTE_SORT_BY_WHITELIST: ItemAttributeSortBy[] = [
    'attributeCode',
    'attributeName',
    'sortOrder',
    'isActive',
  ];
  private readonly VALUE_SORT_BY_WHITELIST: ItemAttributeValueSortBy[] = [
    'valueCode',
    'valueName',
    'sortOrder',
    'isActive',
  ];

  constructor(
    private readonly domainApiClient: ItemAttributeDomainApiClient,
    private readonly mapper: ItemAttributeMapper,
  ) {}

  // ==========================================================================
  // ItemAttribute Operations
  // ==========================================================================

  /**
   * 仕様属性一覧取得
   */
  async listItemAttributes(
    tenantId: string,
    userId: string,
    request: ListItemAttributesRequest,
  ): Promise<ListItemAttributesResponse> {
    // Paging / Sorting Normalization
    const page = request.page ?? this.DEFAULT_PAGE;
    const pageSize = Math.min(request.pageSize ?? this.DEFAULT_PAGE_SIZE, this.MAX_PAGE_SIZE);
    const sortBy = this.validateAttributeSortBy(request.sortBy);
    const sortOrder = request.sortOrder ?? this.DEFAULT_SORT_ORDER;
    const keyword = this.normalizeKeyword(request.keyword);

    // page/pageSize → offset/limit 変換
    const offset = (page - 1) * pageSize;
    const limit = pageSize;

    // Domain API 呼び出し
    const apiRequest: ListItemAttributesApiRequest = {
      offset,
      limit,
      sortBy,
      sortOrder,
      keyword,
      isActive: request.isActive,
    };

    const apiResponse = await this.domainApiClient.listItemAttributes(tenantId, userId, apiRequest);

    // valueCount を取得するため、各属性の値件数を取得
    // TODO: バッチAPIが実装されたら一括取得に変更
    const valueCountMap = new Map<string, number>();
    for (const attr of apiResponse.items) {
      try {
        const valuesResponse = await this.domainApiClient.listItemAttributeValues(
          tenantId,
          userId,
          attr.id,
          { offset: 0, limit: 1 }, // 件数取得のみ
        );
        valueCountMap.set(attr.id, valuesResponse.total);
      } catch {
        valueCountMap.set(attr.id, 0);
      }
    }

    // BFF DTO に変換（page/pageSize を追加）
    return this.mapper.toAttributeListResponse(apiResponse, page, pageSize, valueCountMap);
  }

  /**
   * 仕様属性詳細取得
   */
  async getItemAttribute(
    tenantId: string,
    userId: string,
    attributeId: string,
  ): Promise<GetItemAttributeResponse> {
    const apiResponse = await this.domainApiClient.getItemAttribute(tenantId, userId, attributeId);

    // valueCount を取得
    let valueCount = 0;
    try {
      const valuesResponse = await this.domainApiClient.listItemAttributeValues(
        tenantId,
        userId,
        attributeId,
        { offset: 0, limit: 1 },
      );
      valueCount = valuesResponse.total;
    } catch {
      // 取得失敗時は0
    }

    return {
      attribute: this.mapper.toAttributeDto(apiResponse.attribute, valueCount),
    };
  }

  /**
   * 仕様属性新規登録
   */
  async createItemAttribute(
    tenantId: string,
    userId: string,
    request: CreateItemAttributeRequest,
  ): Promise<CreateItemAttributeResponse> {
    const apiRequest = this.mapper.toCreateAttributeApiRequest(request);

    const apiResponse = await this.domainApiClient.createItemAttribute(tenantId, userId, apiRequest);

    return {
      attribute: this.mapper.toAttributeDto(apiResponse.attribute, 0), // 新規作成時はvalueCount=0
    };
  }

  /**
   * 仕様属性更新
   */
  async updateItemAttribute(
    tenantId: string,
    userId: string,
    attributeId: string,
    request: UpdateItemAttributeRequest,
  ): Promise<UpdateItemAttributeResponse> {
    const apiRequest = this.mapper.toUpdateAttributeApiRequest(request);

    const apiResponse = await this.domainApiClient.updateItemAttribute(
      tenantId,
      userId,
      attributeId,
      apiRequest,
    );

    // valueCount を取得
    let valueCount = 0;
    try {
      const valuesResponse = await this.domainApiClient.listItemAttributeValues(
        tenantId,
        userId,
        attributeId,
        { offset: 0, limit: 1 },
      );
      valueCount = valuesResponse.total;
    } catch {
      // 取得失敗時は0
    }

    return {
      attribute: this.mapper.toAttributeDto(apiResponse.attribute, valueCount),
    };
  }

  /**
   * 仕様属性有効化
   */
  async activateItemAttribute(
    tenantId: string,
    userId: string,
    attributeId: string,
    request: ActivateItemAttributeRequest,
  ): Promise<ActivateItemAttributeResponse> {
    const apiResponse = await this.domainApiClient.activateItemAttribute(tenantId, userId, attributeId, {
      version: request.version,
    });

    return {
      attribute: this.mapper.toAttributeDto(apiResponse.attribute),
    };
  }

  /**
   * 仕様属性無効化
   */
  async deactivateItemAttribute(
    tenantId: string,
    userId: string,
    attributeId: string,
    request: DeactivateItemAttributeRequest,
  ): Promise<DeactivateItemAttributeResponse> {
    const apiResponse = await this.domainApiClient.deactivateItemAttribute(tenantId, userId, attributeId, {
      version: request.version,
      force: request.force,
    });

    return {
      attribute: this.mapper.toAttributeDto(apiResponse.attribute),
      warning: apiResponse.affectedCount && apiResponse.affectedCount > 0
        ? {
            code: 'ATTRIBUTE_IN_USE' as const,
            message: 'この仕様属性はSKU仕様で使用されています',
            usageCount: apiResponse.affectedCount,
          }
        : undefined,
    };
  }

  /**
   * 仕様属性サジェスト
   */
  async suggestItemAttributes(
    tenantId: string,
    userId: string,
    request: SuggestItemAttributesRequest,
  ): Promise<SuggestItemAttributesResponse> {
    const apiRequest: SuggestItemAttributesApiRequest = {
      keyword: this.normalizeKeyword(request.keyword) || '',
      limit: Math.min(request.limit ?? 20, 20),
    };

    const apiResponse = await this.domainApiClient.suggestItemAttributes(tenantId, userId, apiRequest);

    return {
      items: apiResponse.items.map((attr) => this.mapper.toAttributeDto(attr, 0)),
    };
  }

  // ==========================================================================
  // ItemAttributeValue Operations
  // ==========================================================================

  /**
   * 属性値一覧取得
   */
  async listItemAttributeValues(
    tenantId: string,
    userId: string,
    attributeId: string,
    request: ListItemAttributeValuesRequest,
  ): Promise<ListItemAttributeValuesResponse> {
    // Paging / Sorting Normalization
    const page = request.page ?? this.DEFAULT_PAGE;
    const pageSize = Math.min(request.pageSize ?? this.DEFAULT_PAGE_SIZE, this.MAX_PAGE_SIZE);
    const sortBy = this.validateValueSortBy(request.sortBy);
    const sortOrder = request.sortOrder ?? this.DEFAULT_SORT_ORDER;
    const keyword = this.normalizeKeyword(request.keyword);

    // page/pageSize → offset/limit 変換
    const offset = (page - 1) * pageSize;
    const limit = pageSize;

    // 親属性情報を取得
    const attributeResponse = await this.domainApiClient.getItemAttribute(tenantId, userId, attributeId);
    const attributeCode = attributeResponse.attribute.attributeCode;
    const attributeName = attributeResponse.attribute.attributeName;

    // Domain API 呼び出し
    const apiRequest: ListItemAttributeValuesApiRequest = {
      offset,
      limit,
      sortBy,
      sortOrder,
      keyword,
      isActive: request.isActive,
    };

    const apiResponse = await this.domainApiClient.listItemAttributeValues(
      tenantId,
      userId,
      attributeId,
      apiRequest,
    );

    // BFF DTO に変換
    return this.mapper.toValueListResponse(apiResponse, page, pageSize, attributeCode, attributeName);
  }

  /**
   * 属性値詳細取得
   */
  async getItemAttributeValue(
    tenantId: string,
    userId: string,
    attributeId: string,
    valueId: string,
  ): Promise<GetItemAttributeValueResponse> {
    // 親属性情報を取得
    const attributeResponse = await this.domainApiClient.getItemAttribute(tenantId, userId, attributeId);
    const attributeCode = attributeResponse.attribute.attributeCode;
    const attributeName = attributeResponse.attribute.attributeName;

    const apiResponse = await this.domainApiClient.getItemAttributeValue(
      tenantId,
      userId,
      attributeId,
      valueId,
    );

    return {
      value: this.mapper.toValueDto(apiResponse.value, attributeCode, attributeName),
    };
  }

  /**
   * 属性値新規登録
   */
  async createItemAttributeValue(
    tenantId: string,
    userId: string,
    attributeId: string,
    request: CreateItemAttributeValueRequest,
  ): Promise<CreateItemAttributeValueResponse> {
    // 親属性情報を取得
    const attributeResponse = await this.domainApiClient.getItemAttribute(tenantId, userId, attributeId);
    const attributeCode = attributeResponse.attribute.attributeCode;
    const attributeName = attributeResponse.attribute.attributeName;

    const apiRequest = this.mapper.toCreateValueApiRequest(request);

    const apiResponse = await this.domainApiClient.createItemAttributeValue(
      tenantId,
      userId,
      attributeId,
      apiRequest,
    );

    return {
      value: this.mapper.toValueDto(apiResponse.value, attributeCode, attributeName),
    };
  }

  /**
   * 属性値更新
   */
  async updateItemAttributeValue(
    tenantId: string,
    userId: string,
    attributeId: string,
    valueId: string,
    request: UpdateItemAttributeValueRequest,
  ): Promise<UpdateItemAttributeValueResponse> {
    // 親属性情報を取得
    const attributeResponse = await this.domainApiClient.getItemAttribute(tenantId, userId, attributeId);
    const attributeCode = attributeResponse.attribute.attributeCode;
    const attributeName = attributeResponse.attribute.attributeName;

    const apiRequest = this.mapper.toUpdateValueApiRequest(request);

    const apiResponse = await this.domainApiClient.updateItemAttributeValue(
      tenantId,
      userId,
      attributeId,
      valueId,
      apiRequest,
    );

    return {
      value: this.mapper.toValueDto(apiResponse.value, attributeCode, attributeName),
    };
  }

  /**
   * 属性値有効化
   */
  async activateItemAttributeValue(
    tenantId: string,
    userId: string,
    attributeId: string,
    valueId: string,
    request: ActivateItemAttributeValueRequest,
  ): Promise<ActivateItemAttributeValueResponse> {
    // 親属性情報を取得
    const attributeResponse = await this.domainApiClient.getItemAttribute(tenantId, userId, attributeId);
    const attributeCode = attributeResponse.attribute.attributeCode;
    const attributeName = attributeResponse.attribute.attributeName;

    const apiResponse = await this.domainApiClient.activateItemAttributeValue(
      tenantId,
      userId,
      attributeId,
      valueId,
      { version: request.version },
    );

    return {
      value: this.mapper.toValueDto(apiResponse.value, attributeCode, attributeName),
    };
  }

  /**
   * 属性値無効化
   */
  async deactivateItemAttributeValue(
    tenantId: string,
    userId: string,
    attributeId: string,
    valueId: string,
    request: DeactivateItemAttributeValueRequest,
  ): Promise<DeactivateItemAttributeValueResponse> {
    // 親属性情報を取得
    const attributeResponse = await this.domainApiClient.getItemAttribute(tenantId, userId, attributeId);
    const attributeCode = attributeResponse.attribute.attributeCode;
    const attributeName = attributeResponse.attribute.attributeName;

    const apiResponse = await this.domainApiClient.deactivateItemAttributeValue(
      tenantId,
      userId,
      attributeId,
      valueId,
      { version: request.version, force: request.force },
    );

    return {
      value: this.mapper.toValueDto(apiResponse.value, attributeCode, attributeName),
      warning: apiResponse.affectedCount && apiResponse.affectedCount > 0
        ? {
            code: 'VALUE_IN_USE' as const,
            message: 'この属性値はSKU仕様で使用されています',
            usageCount: apiResponse.affectedCount,
          }
        : undefined,
    };
  }

  /**
   * 属性値サジェスト
   */
  async suggestItemAttributeValues(
    tenantId: string,
    userId: string,
    request: SuggestItemAttributeValuesRequest,
  ): Promise<SuggestItemAttributeValuesResponse> {
    const apiRequest: SuggestItemAttributeValuesApiRequest = {
      keyword: this.normalizeKeyword(request.keyword) || '',
      attributeId: request.attributeId,
      limit: Math.min(request.limit ?? 20, 20),
    };

    const apiResponse = await this.domainApiClient.suggestItemAttributeValues(tenantId, userId, apiRequest);

    // 親属性情報を取得するため、attributeIdでグルーピング
    const attributeIds = [...new Set(apiResponse.items.map((v) => v.attributeId))];
    const attributeInfoMap = new Map<string, { attributeCode: string; attributeName: string }>();

    for (const attrId of attributeIds) {
      try {
        const attrResponse = await this.domainApiClient.getItemAttribute(tenantId, userId, attrId);
        attributeInfoMap.set(attrId, {
          attributeCode: attrResponse.attribute.attributeCode,
          attributeName: attrResponse.attribute.attributeName,
        });
      } catch {
        // 取得失敗時はスキップ
      }
    }

    return {
      items: apiResponse.items.map((value) => {
        const attrInfo = attributeInfoMap.get(value.attributeId);
        return this.mapper.toValueDto(
          value,
          attrInfo?.attributeCode ?? '',
          attrInfo?.attributeName ?? '',
        );
      }),
    };
  }

  // ==========================================================================
  // Helper Methods
  // ==========================================================================

  /**
   * sortBy バリデーション（ItemAttribute）
   */
  private validateAttributeSortBy(sortBy?: ItemAttributeSortBy): ItemAttributeSortBy {
    if (!sortBy) {
      return this.DEFAULT_ATTRIBUTE_SORT_BY;
    }
    if (this.ATTRIBUTE_SORT_BY_WHITELIST.includes(sortBy)) {
      return sortBy;
    }
    return this.DEFAULT_ATTRIBUTE_SORT_BY;
  }

  /**
   * sortBy バリデーション（ItemAttributeValue）
   */
  private validateValueSortBy(sortBy?: ItemAttributeValueSortBy): ItemAttributeValueSortBy {
    if (!sortBy) {
      return this.DEFAULT_VALUE_SORT_BY;
    }
    if (this.VALUE_SORT_BY_WHITELIST.includes(sortBy)) {
      return sortBy;
    }
    return this.DEFAULT_VALUE_SORT_BY;
  }

  /**
   * keyword 正規化（trim、空→undefined）
   */
  private normalizeKeyword(keyword?: string): string | undefined {
    if (!keyword) {
      return undefined;
    }
    const trimmed = keyword.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
}
