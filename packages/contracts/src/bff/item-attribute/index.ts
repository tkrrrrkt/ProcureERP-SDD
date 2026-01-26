/**
 * BFF Contracts: Item Attribute Master
 *
 * UI ↔ BFF の契約定義（品目仕様属性・属性値）
 * SSoT: packages/contracts/src/bff/item-attribute
 */

// =============================================================================
// Error Codes (Re-export from BFF errors)
// =============================================================================

export {
  ItemAttributeErrorCode,
  ItemAttributeErrorMessage,
} from '../errors/item-attribute-error';

// =============================================================================
// Sort Options
// =============================================================================

export type ItemAttributeSortBy =
  | 'attributeCode'
  | 'attributeName'
  | 'sortOrder'
  | 'isActive';

export type ItemAttributeValueSortBy =
  | 'valueCode'
  | 'valueName'
  | 'sortOrder'
  | 'isActive';

export type SortOrder = 'asc' | 'desc';

// =============================================================================
// ItemAttributeDto
// =============================================================================

export interface ItemAttributeDto {
  id: string;
  attributeCode: string;
  attributeName: string;
  valueType: string; // MVP: 'SELECT' fixed
  sortOrder: number;
  isActive: boolean;
  valueCount: number; // 属性値件数（BFF算出）
  version: number;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  createdBy: string | null; // login_account_id
  updatedBy: string | null; // login_account_id
}

// =============================================================================
// List ItemAttributes
// =============================================================================

export interface ListItemAttributesRequest {
  page?: number; // 1-based, default: 1
  pageSize?: number; // default: 50, max: 200
  sortBy?: ItemAttributeSortBy; // default: 'sortOrder'
  sortOrder?: SortOrder; // default: 'asc'
  keyword?: string; // partial match on attributeCode, attributeName
  isActive?: boolean; // filter by active status
}

export interface ListItemAttributesResponse {
  items: ItemAttributeDto[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// =============================================================================
// Get ItemAttribute
// =============================================================================

export interface GetItemAttributeResponse {
  attribute: ItemAttributeDto;
}

// =============================================================================
// Create ItemAttribute
// =============================================================================

export interface CreateItemAttributeRequest {
  attributeCode: string; // 1-20 chars, uppercase alphanumeric + -_
  attributeName: string;
  sortOrder?: number; // default: 0
}

export interface CreateItemAttributeResponse {
  attribute: ItemAttributeDto;
}

// =============================================================================
// Update ItemAttribute
// =============================================================================

export interface UpdateItemAttributeRequest {
  attributeName: string;
  sortOrder?: number;
  version: number; // optimistic lock
}

export interface UpdateItemAttributeResponse {
  attribute: ItemAttributeDto;
}

// =============================================================================
// Activate ItemAttribute
// =============================================================================

export interface ActivateItemAttributeRequest {
  version: number; // optimistic lock
}

export interface ActivateItemAttributeResponse {
  attribute: ItemAttributeDto;
}

// =============================================================================
// Deactivate ItemAttribute
// =============================================================================

export interface DeactivateItemAttributeRequest {
  version: number; // optimistic lock
  force?: boolean; // 使用中でも強制無効化
}

export interface DeactivateItemAttributeResponse {
  attribute: ItemAttributeDto;
  warning?: {
    code: 'ATTRIBUTE_IN_USE';
    message: string;
    usageCount: number;
  };
}

// =============================================================================
// Suggest ItemAttributes
// =============================================================================

export interface SuggestItemAttributesRequest {
  keyword: string; // prefix match on attributeCode, attributeName
  limit?: number; // default: 20, max: 20
}

export interface SuggestItemAttributesResponse {
  items: ItemAttributeDto[];
}

// =============================================================================
// ItemAttributeValueDto
// =============================================================================

export interface ItemAttributeValueDto {
  id: string;
  attributeId: string;
  attributeCode: string; // 親属性のコード（BFF付与）
  attributeName: string; // 親属性の名称（BFF付与）
  valueCode: string;
  valueName: string;
  sortOrder: number;
  isActive: boolean;
  version: number;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  createdBy: string | null; // login_account_id
  updatedBy: string | null; // login_account_id
}

// =============================================================================
// List ItemAttributeValues
// =============================================================================

export interface ListItemAttributeValuesRequest {
  page?: number; // 1-based, default: 1
  pageSize?: number; // default: 50, max: 200
  sortBy?: ItemAttributeValueSortBy; // default: 'sortOrder'
  sortOrder?: SortOrder; // default: 'asc'
  keyword?: string; // partial match on valueCode, valueName
  isActive?: boolean; // filter by active status
}

export interface ListItemAttributeValuesResponse {
  items: ItemAttributeValueDto[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// =============================================================================
// Get ItemAttributeValue
// =============================================================================

export interface GetItemAttributeValueResponse {
  value: ItemAttributeValueDto;
}

// =============================================================================
// Create ItemAttributeValue
// =============================================================================

export interface CreateItemAttributeValueRequest {
  valueCode: string; // 1-30 chars, uppercase alphanumeric + -_
  valueName: string;
  sortOrder?: number; // default: 0
}

export interface CreateItemAttributeValueResponse {
  value: ItemAttributeValueDto;
}

// =============================================================================
// Update ItemAttributeValue
// =============================================================================

export interface UpdateItemAttributeValueRequest {
  valueName: string;
  sortOrder?: number;
  version: number; // optimistic lock
}

export interface UpdateItemAttributeValueResponse {
  value: ItemAttributeValueDto;
}

// =============================================================================
// Activate ItemAttributeValue
// =============================================================================

export interface ActivateItemAttributeValueRequest {
  version: number; // optimistic lock
}

export interface ActivateItemAttributeValueResponse {
  value: ItemAttributeValueDto;
}

// =============================================================================
// Deactivate ItemAttributeValue
// =============================================================================

export interface DeactivateItemAttributeValueRequest {
  version: number; // optimistic lock
  force?: boolean; // 使用中でも強制無効化
}

export interface DeactivateItemAttributeValueResponse {
  value: ItemAttributeValueDto;
  warning?: {
    code: 'VALUE_IN_USE';
    message: string;
    usageCount: number;
  };
}

// =============================================================================
// Suggest ItemAttributeValues
// =============================================================================

export interface SuggestItemAttributeValuesRequest {
  attributeId?: string; // 特定属性内に限定
  keyword: string; // prefix match on valueCode, valueName
  limit?: number; // default: 20, max: 20
}

export interface SuggestItemAttributeValuesResponse {
  items: ItemAttributeValueDto[];
}
