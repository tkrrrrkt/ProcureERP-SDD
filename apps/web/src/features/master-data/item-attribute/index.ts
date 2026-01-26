/**
 * Item Attribute Master Feature
 *
 * 品目仕様属性マスタの登録・照会・編集機能
 * SKU作成時の仕様属性・属性値選択を提供
 */

// Main Page
export { ItemAttributePage } from './ui/app/page';

// Components
export { ItemAttributeList } from './ui/components/ItemAttributeList';
export { ItemAttributeDialog } from './ui/components/ItemAttributeDialog';
export { ItemAttributeValueDialog } from './ui/components/ItemAttributeValueDialog';
export { ItemAttributeSuggest } from './ui/components/ItemAttributeSuggest';
export { ItemAttributeValueSuggest } from './ui/components/ItemAttributeValueSuggest';

// Types
export type {
  ItemAttributeDto,
  ItemAttributeValueDto,
  ItemAttributeSortBy,
  ItemAttributeValueSortBy,
  SortOrder,
  ListItemAttributesRequest,
  ListItemAttributesResponse,
  ListItemAttributeValuesRequest,
  ListItemAttributeValuesResponse,
} from './ui/types/bff-contracts';

// BFF Client Interface
export type { BffClient } from './ui/api/BffClient';
