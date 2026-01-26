import { Injectable } from '@nestjs/common';
import {
  ItemAttributeApiDto,
  ItemAttributeValueApiDto,
  ListItemAttributesApiResponse,
  ListItemAttributeValuesApiResponse,
} from '@procure/contracts/api/item-attribute';
import {
  ItemAttributeDto,
  ItemAttributeValueDto,
  ListItemAttributesResponse,
  ListItemAttributeValuesResponse,
  CreateItemAttributeRequest,
  UpdateItemAttributeRequest,
  CreateItemAttributeValueRequest,
  UpdateItemAttributeValueRequest,
} from '@procure/contracts/bff/item-attribute';
import {
  CreateItemAttributeApiRequest,
  UpdateItemAttributeApiRequest,
  CreateItemAttributeValueApiRequest,
  UpdateItemAttributeValueApiRequest,
} from '@procure/contracts/api/item-attribute';

/**
 * Item Attribute Mapper
 *
 * API DTO ↔ BFF DTO の変換
 * - valueCount の付与（BFF責務）
 * - 親属性情報（attributeCode/attributeName）の付与（BFF責務）
 * - createdByLoginAccountId → createdBy のフィールド名変換
 */
@Injectable()
export class ItemAttributeMapper {
  // ==========================================================================
  // ItemAttribute Mapping
  // ==========================================================================

  /**
   * API DTO → BFF DTO (ItemAttribute単体)
   * valueCount は別途取得・設定が必要
   */
  toAttributeDto(apiDto: ItemAttributeApiDto, valueCount: number = 0): ItemAttributeDto {
    return {
      id: apiDto.id,
      attributeCode: apiDto.attributeCode,
      attributeName: apiDto.attributeName,
      valueType: apiDto.valueType,
      sortOrder: apiDto.sortOrder,
      isActive: apiDto.isActive,
      valueCount, // BFF算出
      version: apiDto.version,
      createdAt: apiDto.createdAt,
      updatedAt: apiDto.updatedAt,
      createdBy: apiDto.createdByLoginAccountId,
      updatedBy: apiDto.updatedByLoginAccountId,
    };
  }

  /**
   * API Response → BFF Response (ItemAttribute一覧)
   * page/pageSize を追加
   */
  toAttributeListResponse(
    apiResponse: ListItemAttributesApiResponse,
    page: number,
    pageSize: number,
    valueCountMap?: Map<string, number>,
  ): ListItemAttributesResponse {
    const totalPages = Math.ceil(apiResponse.total / pageSize);

    return {
      items: apiResponse.items.map((item) =>
        this.toAttributeDto(item, valueCountMap?.get(item.id) ?? 0),
      ),
      page,
      pageSize,
      total: apiResponse.total,
      totalPages,
    };
  }

  /**
   * BFF Request → API Request (ItemAttribute新規登録)
   */
  toCreateAttributeApiRequest(request: CreateItemAttributeRequest): CreateItemAttributeApiRequest {
    return {
      attributeCode: request.attributeCode,
      attributeName: request.attributeName,
      sortOrder: request.sortOrder,
    };
  }

  /**
   * BFF Request → API Request (ItemAttribute更新)
   */
  toUpdateAttributeApiRequest(request: UpdateItemAttributeRequest): UpdateItemAttributeApiRequest {
    return {
      attributeName: request.attributeName,
      sortOrder: request.sortOrder,
      version: request.version,
    };
  }

  // ==========================================================================
  // ItemAttributeValue Mapping
  // ==========================================================================

  /**
   * API DTO → BFF DTO (ItemAttributeValue単体)
   * 親属性情報は別途設定が必要
   */
  toValueDto(
    apiDto: ItemAttributeValueApiDto,
    attributeCode: string = '',
    attributeName: string = '',
  ): ItemAttributeValueDto {
    return {
      id: apiDto.id,
      attributeId: apiDto.attributeId,
      attributeCode, // BFF付与
      attributeName, // BFF付与
      valueCode: apiDto.valueCode,
      valueName: apiDto.valueName,
      sortOrder: apiDto.sortOrder,
      isActive: apiDto.isActive,
      version: apiDto.version,
      createdAt: apiDto.createdAt,
      updatedAt: apiDto.updatedAt,
      createdBy: apiDto.createdByLoginAccountId,
      updatedBy: apiDto.updatedByLoginAccountId,
    };
  }

  /**
   * API Response → BFF Response (ItemAttributeValue一覧)
   * page/pageSize を追加、親属性情報を付与
   */
  toValueListResponse(
    apiResponse: ListItemAttributeValuesApiResponse,
    page: number,
    pageSize: number,
    attributeCode: string,
    attributeName: string,
  ): ListItemAttributeValuesResponse {
    const totalPages = Math.ceil(apiResponse.total / pageSize);

    return {
      items: apiResponse.items.map((item) =>
        this.toValueDto(item, attributeCode, attributeName),
      ),
      page,
      pageSize,
      total: apiResponse.total,
      totalPages,
    };
  }

  /**
   * BFF Request → API Request (ItemAttributeValue新規登録)
   */
  toCreateValueApiRequest(request: CreateItemAttributeValueRequest): CreateItemAttributeValueApiRequest {
    return {
      valueCode: request.valueCode,
      valueName: request.valueName,
      sortOrder: request.sortOrder,
    };
  }

  /**
   * BFF Request → API Request (ItemAttributeValue更新)
   */
  toUpdateValueApiRequest(request: UpdateItemAttributeValueRequest): UpdateItemAttributeValueApiRequest {
    return {
      valueName: request.valueName,
      sortOrder: request.sortOrder,
      version: request.version,
    };
  }
}
