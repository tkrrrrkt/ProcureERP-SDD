import type {
  // ItemAttribute
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
  // ItemAttributeValue
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
} from '../types/bff-contracts';

/**
 * Item Attribute Master BFF Client Interface
 *
 * UI ↔ BFF の通信インターフェース
 * MockBffClient / HttpBffClient で実装
 */
export interface BffClient {
  // ==========================================================================
  // ItemAttribute Endpoints (7)
  // ==========================================================================

  /** 仕様属性一覧取得 */
  listItemAttributes(request: ListItemAttributesRequest): Promise<ListItemAttributesResponse>;

  /** 仕様属性詳細取得 */
  getItemAttribute(id: string): Promise<GetItemAttributeResponse>;

  /** 仕様属性新規登録 */
  createItemAttribute(request: CreateItemAttributeRequest): Promise<CreateItemAttributeResponse>;

  /** 仕様属性更新 */
  updateItemAttribute(id: string, request: UpdateItemAttributeRequest): Promise<UpdateItemAttributeResponse>;

  /** 仕様属性有効化 */
  activateItemAttribute(id: string, request: ActivateItemAttributeRequest): Promise<ActivateItemAttributeResponse>;

  /** 仕様属性無効化 */
  deactivateItemAttribute(
    id: string,
    request: DeactivateItemAttributeRequest,
  ): Promise<DeactivateItemAttributeResponse>;

  /** 仕様属性サジェスト */
  suggestItemAttributes(request: SuggestItemAttributesRequest): Promise<SuggestItemAttributesResponse>;

  // ==========================================================================
  // ItemAttributeValue Endpoints (7)
  // ==========================================================================

  /** 属性値一覧取得 */
  listItemAttributeValues(
    attributeId: string,
    request: ListItemAttributeValuesRequest,
  ): Promise<ListItemAttributeValuesResponse>;

  /** 属性値詳細取得 */
  getItemAttributeValue(attributeId: string, valueId: string): Promise<GetItemAttributeValueResponse>;

  /** 属性値新規登録 */
  createItemAttributeValue(
    attributeId: string,
    request: CreateItemAttributeValueRequest,
  ): Promise<CreateItemAttributeValueResponse>;

  /** 属性値更新 */
  updateItemAttributeValue(
    attributeId: string,
    valueId: string,
    request: UpdateItemAttributeValueRequest,
  ): Promise<UpdateItemAttributeValueResponse>;

  /** 属性値有効化 */
  activateItemAttributeValue(
    attributeId: string,
    valueId: string,
    request: ActivateItemAttributeValueRequest,
  ): Promise<ActivateItemAttributeValueResponse>;

  /** 属性値無効化 */
  deactivateItemAttributeValue(
    attributeId: string,
    valueId: string,
    request: DeactivateItemAttributeValueRequest,
  ): Promise<DeactivateItemAttributeValueResponse>;

  /** 属性値サジェスト */
  suggestItemAttributeValues(request: SuggestItemAttributeValuesRequest): Promise<SuggestItemAttributeValuesResponse>;
}
