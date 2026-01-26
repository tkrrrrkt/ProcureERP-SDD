/**
 * Item Attribute Master BFF Contracts - UI Local Types
 *
 * packages/contracts/src/bff/item-attribute から Re-export
 * UI層での型安全性を保証
 */

export type {
  // Sort Options
  ItemAttributeSortBy,
  ItemAttributeValueSortBy,
  SortOrder,

  // ItemAttribute DTOs
  ItemAttributeDto,
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

  // ItemAttributeValue DTOs
  ItemAttributeValueDto,
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

  // Error Codes
  ItemAttributeErrorCode,
} from '@contracts/bff/item-attribute';

// Error Code Alias for UI
export type ItemAttributeBffErrorCode = ItemAttributeErrorCode;
