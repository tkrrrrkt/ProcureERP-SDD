import type { BffClient } from './BffClient';
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

const BFF_BASE_URL =
  process.env.NEXT_PUBLIC_BFF_URL || '/api/bff/master-data/item-attribute';

/**
 * Item Attribute Master HTTP BFF Client
 *
 * BFF API との通信を行う実装クライアント
 * Phase 2 で MockBffClient から切り替えて使用
 */
export class HttpBffClient implements BffClient {
  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    params?: Record<string, unknown>,
  ): Promise<T> {
    const url = new URL(`${BFF_BASE_URL}${path}`, window.location.origin);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url.toString(), options);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.code || 'UNKNOWN_ERROR');
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  // ==========================================================================
  // ItemAttribute Endpoints (7)
  // ==========================================================================

  async listItemAttributes(request: ListItemAttributesRequest): Promise<ListItemAttributesResponse> {
    return this.request<ListItemAttributesResponse>('GET', '/attributes', undefined, {
      page: request.page,
      pageSize: request.pageSize,
      sortBy: request.sortBy,
      sortOrder: request.sortOrder,
      keyword: request.keyword,
      isActive: request.isActive,
    });
  }

  async getItemAttribute(id: string): Promise<GetItemAttributeResponse> {
    return this.request<GetItemAttributeResponse>('GET', `/attributes/${id}`);
  }

  async createItemAttribute(request: CreateItemAttributeRequest): Promise<CreateItemAttributeResponse> {
    return this.request<CreateItemAttributeResponse>('POST', '/attributes', request);
  }

  async updateItemAttribute(
    id: string,
    request: UpdateItemAttributeRequest,
  ): Promise<UpdateItemAttributeResponse> {
    return this.request<UpdateItemAttributeResponse>('PUT', `/attributes/${id}`, request);
  }

  async activateItemAttribute(
    id: string,
    request: ActivateItemAttributeRequest,
  ): Promise<ActivateItemAttributeResponse> {
    return this.request<ActivateItemAttributeResponse>('PATCH', `/attributes/${id}/activate`, request);
  }

  async deactivateItemAttribute(
    id: string,
    request: DeactivateItemAttributeRequest,
  ): Promise<DeactivateItemAttributeResponse> {
    return this.request<DeactivateItemAttributeResponse>('PATCH', `/attributes/${id}/deactivate`, request);
  }

  async suggestItemAttributes(request: SuggestItemAttributesRequest): Promise<SuggestItemAttributesResponse> {
    return this.request<SuggestItemAttributesResponse>('GET', '/attributes/suggest', undefined, {
      keyword: request.keyword,
      limit: request.limit,
    });
  }

  // ==========================================================================
  // ItemAttributeValue Endpoints (7)
  // ==========================================================================

  async listItemAttributeValues(
    attributeId: string,
    request: ListItemAttributeValuesRequest,
  ): Promise<ListItemAttributeValuesResponse> {
    return this.request<ListItemAttributeValuesResponse>('GET', `/attributes/${attributeId}/values`, undefined, {
      page: request.page,
      pageSize: request.pageSize,
      sortBy: request.sortBy,
      sortOrder: request.sortOrder,
      keyword: request.keyword,
      isActive: request.isActive,
    });
  }

  async getItemAttributeValue(attributeId: string, valueId: string): Promise<GetItemAttributeValueResponse> {
    return this.request<GetItemAttributeValueResponse>('GET', `/attributes/${attributeId}/values/${valueId}`);
  }

  async createItemAttributeValue(
    attributeId: string,
    request: CreateItemAttributeValueRequest,
  ): Promise<CreateItemAttributeValueResponse> {
    return this.request<CreateItemAttributeValueResponse>('POST', `/attributes/${attributeId}/values`, request);
  }

  async updateItemAttributeValue(
    attributeId: string,
    valueId: string,
    request: UpdateItemAttributeValueRequest,
  ): Promise<UpdateItemAttributeValueResponse> {
    return this.request<UpdateItemAttributeValueResponse>('PUT', `/attributes/${attributeId}/values/${valueId}`, request);
  }

  async activateItemAttributeValue(
    attributeId: string,
    valueId: string,
    request: ActivateItemAttributeValueRequest,
  ): Promise<ActivateItemAttributeValueResponse> {
    return this.request<ActivateItemAttributeValueResponse>(
      'PATCH',
      `/attributes/${attributeId}/values/${valueId}/activate`,
      request,
    );
  }

  async deactivateItemAttributeValue(
    attributeId: string,
    valueId: string,
    request: DeactivateItemAttributeValueRequest,
  ): Promise<DeactivateItemAttributeValueResponse> {
    return this.request<DeactivateItemAttributeValueResponse>(
      'PATCH',
      `/attributes/${attributeId}/values/${valueId}/deactivate`,
      request,
    );
  }

  async suggestItemAttributeValues(
    request: SuggestItemAttributeValuesRequest,
  ): Promise<SuggestItemAttributeValuesResponse> {
    return this.request<SuggestItemAttributeValuesResponse>('GET', '/values/suggest', undefined, {
      attributeId: request.attributeId,
      keyword: request.keyword,
      limit: request.limit,
    });
  }
}
