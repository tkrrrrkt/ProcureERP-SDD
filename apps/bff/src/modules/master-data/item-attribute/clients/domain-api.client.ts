import { Injectable, HttpException } from '@nestjs/common';
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
} from '@procure/contracts/api/item-attribute';

/**
 * Item Attribute Domain API Client
 *
 * BFF → Domain API の HTTP クライアント
 * - tenant_id / user_id をヘッダーに含めて伝搬
 * - エラーは Pass-through（Domain API のエラーをそのまま返す）
 */
@Injectable()
export class ItemAttributeDomainApiClient {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.DOMAIN_API_URL || 'http://localhost:3002';
  }

  // ==========================================================================
  // ItemAttribute Endpoints
  // ==========================================================================

  /**
   * 仕様属性一覧取得
   */
  async listItemAttributes(
    tenantId: string,
    userId: string,
    request: ListItemAttributesApiRequest,
  ): Promise<ListItemAttributesApiResponse> {
    const params = new URLSearchParams();
    params.append('offset', String(request.offset));
    params.append('limit', String(request.limit));
    if (request.sortBy) params.append('sortBy', request.sortBy);
    if (request.sortOrder) params.append('sortOrder', request.sortOrder);
    if (request.keyword) params.append('keyword', request.keyword);
    if (request.isActive !== undefined) params.append('isActive', String(request.isActive));

    const url = `${this.baseUrl}/api/master-data/item-attributes?${params.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.buildHeaders(tenantId, userId),
    });

    return this.handleResponse<ListItemAttributesApiResponse>(response);
  }

  /**
   * 仕様属性詳細取得
   */
  async getItemAttribute(
    tenantId: string,
    userId: string,
    attributeId: string,
  ): Promise<GetItemAttributeApiResponse> {
    const url = `${this.baseUrl}/api/master-data/item-attributes/${attributeId}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.buildHeaders(tenantId, userId),
    });

    return this.handleResponse<GetItemAttributeApiResponse>(response);
  }

  /**
   * 仕様属性新規登録
   */
  async createItemAttribute(
    tenantId: string,
    userId: string,
    request: CreateItemAttributeApiRequest,
  ): Promise<CreateItemAttributeApiResponse> {
    const url = `${this.baseUrl}/api/master-data/item-attributes`;

    const response = await fetch(url, {
      method: 'POST',
      headers: this.buildHeaders(tenantId, userId),
      body: JSON.stringify(request),
    });

    return this.handleResponse<CreateItemAttributeApiResponse>(response);
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
    const url = `${this.baseUrl}/api/master-data/item-attributes/${attributeId}`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: this.buildHeaders(tenantId, userId),
      body: JSON.stringify(request),
    });

    return this.handleResponse<UpdateItemAttributeApiResponse>(response);
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
    const url = `${this.baseUrl}/api/master-data/item-attributes/${attributeId}/activate`;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: this.buildHeaders(tenantId, userId),
      body: JSON.stringify(request),
    });

    return this.handleResponse<ActivateItemAttributeApiResponse>(response);
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
    const url = `${this.baseUrl}/api/master-data/item-attributes/${attributeId}/deactivate`;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: this.buildHeaders(tenantId, userId),
      body: JSON.stringify(request),
    });

    return this.handleResponse<DeactivateItemAttributeApiResponse>(response);
  }

  /**
   * 仕様属性サジェスト
   */
  async suggestItemAttributes(
    tenantId: string,
    userId: string,
    request: SuggestItemAttributesApiRequest,
  ): Promise<SuggestItemAttributesApiResponse> {
    const params = new URLSearchParams();
    params.append('keyword', request.keyword);
    params.append('limit', String(request.limit));

    const url = `${this.baseUrl}/api/master-data/item-attributes/suggest?${params.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.buildHeaders(tenantId, userId),
    });

    return this.handleResponse<SuggestItemAttributesApiResponse>(response);
  }

  // ==========================================================================
  // ItemAttributeValue Endpoints
  // ==========================================================================

  /**
   * 属性値一覧取得
   */
  async listItemAttributeValues(
    tenantId: string,
    userId: string,
    attributeId: string,
    request: ListItemAttributeValuesApiRequest,
  ): Promise<ListItemAttributeValuesApiResponse> {
    const params = new URLSearchParams();
    params.append('offset', String(request.offset));
    params.append('limit', String(request.limit));
    if (request.sortBy) params.append('sortBy', request.sortBy);
    if (request.sortOrder) params.append('sortOrder', request.sortOrder);
    if (request.keyword) params.append('keyword', request.keyword);
    if (request.isActive !== undefined) params.append('isActive', String(request.isActive));

    const url = `${this.baseUrl}/api/master-data/item-attributes/${attributeId}/values?${params.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.buildHeaders(tenantId, userId),
    });

    return this.handleResponse<ListItemAttributeValuesApiResponse>(response);
  }

  /**
   * 属性値詳細取得
   */
  async getItemAttributeValue(
    tenantId: string,
    userId: string,
    attributeId: string,
    valueId: string,
  ): Promise<GetItemAttributeValueApiResponse> {
    const url = `${this.baseUrl}/api/master-data/item-attributes/${attributeId}/values/${valueId}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.buildHeaders(tenantId, userId),
    });

    return this.handleResponse<GetItemAttributeValueApiResponse>(response);
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
    const url = `${this.baseUrl}/api/master-data/item-attributes/${attributeId}/values`;

    const response = await fetch(url, {
      method: 'POST',
      headers: this.buildHeaders(tenantId, userId),
      body: JSON.stringify(request),
    });

    return this.handleResponse<CreateItemAttributeValueApiResponse>(response);
  }

  /**
   * 属性値更新
   */
  async updateItemAttributeValue(
    tenantId: string,
    userId: string,
    attributeId: string,
    valueId: string,
    request: UpdateItemAttributeValueApiRequest,
  ): Promise<UpdateItemAttributeValueApiResponse> {
    const url = `${this.baseUrl}/api/master-data/item-attributes/${attributeId}/values/${valueId}`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: this.buildHeaders(tenantId, userId),
      body: JSON.stringify(request),
    });

    return this.handleResponse<UpdateItemAttributeValueApiResponse>(response);
  }

  /**
   * 属性値有効化
   */
  async activateItemAttributeValue(
    tenantId: string,
    userId: string,
    attributeId: string,
    valueId: string,
    request: ActivateItemAttributeValueApiRequest,
  ): Promise<ActivateItemAttributeValueApiResponse> {
    const url = `${this.baseUrl}/api/master-data/item-attributes/${attributeId}/values/${valueId}/activate`;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: this.buildHeaders(tenantId, userId),
      body: JSON.stringify(request),
    });

    return this.handleResponse<ActivateItemAttributeValueApiResponse>(response);
  }

  /**
   * 属性値無効化
   */
  async deactivateItemAttributeValue(
    tenantId: string,
    userId: string,
    attributeId: string,
    valueId: string,
    request: DeactivateItemAttributeValueApiRequest,
  ): Promise<DeactivateItemAttributeValueApiResponse> {
    const url = `${this.baseUrl}/api/master-data/item-attributes/${attributeId}/values/${valueId}/deactivate`;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: this.buildHeaders(tenantId, userId),
      body: JSON.stringify(request),
    });

    return this.handleResponse<DeactivateItemAttributeValueApiResponse>(response);
  }

  /**
   * 属性値サジェスト
   */
  async suggestItemAttributeValues(
    tenantId: string,
    userId: string,
    request: SuggestItemAttributeValuesApiRequest,
  ): Promise<SuggestItemAttributeValuesApiResponse> {
    const params = new URLSearchParams();
    params.append('keyword', request.keyword);
    params.append('limit', String(request.limit));
    if (request.attributeId) params.append('attributeId', request.attributeId);

    const url = `${this.baseUrl}/api/master-data/item-attribute-values/suggest?${params.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.buildHeaders(tenantId, userId),
    });

    return this.handleResponse<SuggestItemAttributeValuesApiResponse>(response);
  }

  // ==========================================================================
  // Helper Methods
  // ==========================================================================

  /**
   * HTTP ヘッダー構築
   */
  private buildHeaders(tenantId: string, userId: string): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'x-tenant-id': tenantId,
      'x-user-id': userId,
    };
  }

  /**
   * レスポンス処理
   * エラーは Pass-through（Domain API のエラーをそのまま返す）
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new HttpException(errorBody, response.status);
    }

    return response.json();
  }
}
