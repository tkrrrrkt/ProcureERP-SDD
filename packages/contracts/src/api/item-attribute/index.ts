/**
 * API Contracts: Item Attribute Master
 *
 * BFF ↔ Domain API の契約定義（品目仕様属性・属性値）
 * SSoT: packages/contracts/src/api/item-attribute
 */

// =============================================================================
// Sort Options（BFFと同一）
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
// ItemAttributeApiDto
// =============================================================================

export interface ItemAttributeApiDto {
  id: string;
  attributeCode: string;
  attributeName: string;
  valueType: string; // MVP: 'SELECT' fixed
  sortOrder: number;
  isActive: boolean;
  version: number;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  createdByLoginAccountId: string | null;
  updatedByLoginAccountId: string | null;
}

// =============================================================================
// List ItemAttributes
// =============================================================================

export interface ListItemAttributesApiRequest {
  offset: number; // 0-based
  limit: number;
  sortBy?: ItemAttributeSortBy; // default: 'sortOrder'
  sortOrder?: SortOrder; // default: 'asc'
  keyword?: string; // partial match on attributeCode, attributeName
  isActive?: boolean; // filter by active status
}

export interface ListItemAttributesApiResponse {
  items: ItemAttributeApiDto[];
  total: number;
}

// =============================================================================
// Get ItemAttribute
// =============================================================================

export interface GetItemAttributeApiResponse {
  attribute: ItemAttributeApiDto;
}

// =============================================================================
// Create ItemAttribute
// =============================================================================

export interface CreateItemAttributeApiRequest {
  attributeCode: string; // 1-20 chars, uppercase alphanumeric + -_
  attributeName: string;
  sortOrder?: number; // default: 0
}

export interface CreateItemAttributeApiResponse {
  attribute: ItemAttributeApiDto;
}

// =============================================================================
// Update ItemAttribute
// =============================================================================

export interface UpdateItemAttributeApiRequest {
  attributeName: string;
  sortOrder?: number;
  version: number; // optimistic lock
}

export interface UpdateItemAttributeApiResponse {
  attribute: ItemAttributeApiDto;
}

// =============================================================================
// Activate ItemAttribute
// =============================================================================

export interface ActivateItemAttributeApiRequest {
  version: number;
}

export interface ActivateItemAttributeApiResponse {
  attribute: ItemAttributeApiDto;
}

// =============================================================================
// Deactivate ItemAttribute
// =============================================================================

export interface DeactivateItemAttributeApiRequest {
  version: number;
  force?: boolean; // 使用中でも強制無効化
}

export interface DeactivateItemAttributeApiResponse {
  attribute: ItemAttributeApiDto;
  affectedCount?: number; // force=true時、影響を受けたSKU仕様の件数
}

// =============================================================================
// Suggest ItemAttributes
// =============================================================================

export interface SuggestItemAttributesApiRequest {
  keyword: string; // prefix match on attributeCode, attributeName
  limit: number;
}

export interface SuggestItemAttributesApiResponse {
  items: ItemAttributeApiDto[];
}

// =============================================================================
// ItemAttributeValueApiDto
// =============================================================================

export interface ItemAttributeValueApiDto {
  id: string;
  attributeId: string;
  valueCode: string;
  valueName: string;
  sortOrder: number;
  isActive: boolean;
  version: number;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  createdByLoginAccountId: string | null;
  updatedByLoginAccountId: string | null;
}

// =============================================================================
// List ItemAttributeValues
// =============================================================================

export interface ListItemAttributeValuesApiRequest {
  offset: number; // 0-based
  limit: number;
  sortBy?: ItemAttributeValueSortBy; // default: 'sortOrder'
  sortOrder?: SortOrder; // default: 'asc'
  keyword?: string; // partial match on valueCode, valueName
  isActive?: boolean; // filter by active status
}

export interface ListItemAttributeValuesApiResponse {
  items: ItemAttributeValueApiDto[];
  total: number;
}

// =============================================================================
// Get ItemAttributeValue
// =============================================================================

export interface GetItemAttributeValueApiResponse {
  value: ItemAttributeValueApiDto;
}

// =============================================================================
// Create ItemAttributeValue
// =============================================================================

export interface CreateItemAttributeValueApiRequest {
  valueCode: string; // 1-30 chars, uppercase alphanumeric + -_
  valueName: string;
  sortOrder?: number; // default: 0
}

export interface CreateItemAttributeValueApiResponse {
  value: ItemAttributeValueApiDto;
}

// =============================================================================
// Update ItemAttributeValue
// =============================================================================

export interface UpdateItemAttributeValueApiRequest {
  valueName: string;
  sortOrder?: number;
  version: number; // optimistic lock
}

export interface UpdateItemAttributeValueApiResponse {
  value: ItemAttributeValueApiDto;
}

// =============================================================================
// Activate ItemAttributeValue
// =============================================================================

export interface ActivateItemAttributeValueApiRequest {
  version: number;
}

export interface ActivateItemAttributeValueApiResponse {
  value: ItemAttributeValueApiDto;
}

// =============================================================================
// Deactivate ItemAttributeValue
// =============================================================================

export interface DeactivateItemAttributeValueApiRequest {
  version: number;
  force?: boolean; // 使用中でも強制無効化
}

export interface DeactivateItemAttributeValueApiResponse {
  value: ItemAttributeValueApiDto;
  affectedCount?: number; // force=true時、影響を受けたSKU仕様の件数
}

// =============================================================================
// Suggest ItemAttributeValues
// =============================================================================

export interface SuggestItemAttributeValuesApiRequest {
  attributeId?: string; // 特定属性内に限定
  keyword: string; // prefix match on valueCode, valueName
  limit: number;
}

export interface SuggestItemAttributeValuesApiResponse {
  items: ItemAttributeValueApiDto[];
}
