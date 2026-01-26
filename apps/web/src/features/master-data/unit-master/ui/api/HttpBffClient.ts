import type { BffClient } from './BffClient';
import type {
  // UomGroup
  ListUomGroupsRequest,
  ListUomGroupsResponse,
  GetUomGroupResponse,
  CreateUomGroupRequest,
  CreateUomGroupResponse,
  UpdateUomGroupRequest,
  UpdateUomGroupResponse,
  ActivateUomGroupRequest,
  ActivateUomGroupResponse,
  DeactivateUomGroupRequest,
  DeactivateUomGroupResponse,
  // Uom
  ListUomsRequest,
  ListUomsResponse,
  GetUomResponse,
  CreateUomRequest,
  CreateUomResponse,
  UpdateUomRequest,
  UpdateUomResponse,
  ActivateUomRequest,
  ActivateUomResponse,
  DeactivateUomRequest,
  DeactivateUomResponse,
  // Suggest
  SuggestUomsRequest,
  SuggestUomsResponse,
} from '../types/bff-contracts';

const BFF_BASE_URL =
  process.env.NEXT_PUBLIC_BFF_URL || '/api/bff/master-data/unit-master';

/**
 * Unit Master HTTP BFF Client
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
  // UomGroup Endpoints (6)
  // ==========================================================================

  async listUomGroups(request: ListUomGroupsRequest): Promise<ListUomGroupsResponse> {
    return this.request<ListUomGroupsResponse>('GET', '/groups', undefined, {
      page: request.page,
      pageSize: request.pageSize,
      sortBy: request.sortBy,
      sortOrder: request.sortOrder,
      keyword: request.keyword,
      isActive: request.isActive,
    });
  }

  async getUomGroup(id: string): Promise<GetUomGroupResponse> {
    return this.request<GetUomGroupResponse>('GET', `/groups/${id}`);
  }

  async createUomGroup(request: CreateUomGroupRequest): Promise<CreateUomGroupResponse> {
    return this.request<CreateUomGroupResponse>('POST', '/groups', request);
  }

  async updateUomGroup(
    id: string,
    request: UpdateUomGroupRequest,
  ): Promise<UpdateUomGroupResponse> {
    return this.request<UpdateUomGroupResponse>('PUT', `/groups/${id}`, request);
  }

  async activateUomGroup(
    id: string,
    request: ActivateUomGroupRequest,
  ): Promise<ActivateUomGroupResponse> {
    return this.request<ActivateUomGroupResponse>('PATCH', `/groups/${id}/activate`, request);
  }

  async deactivateUomGroup(
    id: string,
    request: DeactivateUomGroupRequest,
  ): Promise<DeactivateUomGroupResponse> {
    return this.request<DeactivateUomGroupResponse>('PATCH', `/groups/${id}/deactivate`, request);
  }

  // ==========================================================================
  // Uom Endpoints (7)
  // ==========================================================================

  async listUoms(request: ListUomsRequest): Promise<ListUomsResponse> {
    return this.request<ListUomsResponse>('GET', '/uoms', undefined, {
      page: request.page,
      pageSize: request.pageSize,
      sortBy: request.sortBy,
      sortOrder: request.sortOrder,
      keyword: request.keyword,
      groupId: request.groupId,
      isActive: request.isActive,
    });
  }

  async getUom(id: string): Promise<GetUomResponse> {
    return this.request<GetUomResponse>('GET', `/uoms/${id}`);
  }

  async createUom(request: CreateUomRequest): Promise<CreateUomResponse> {
    return this.request<CreateUomResponse>('POST', '/uoms', request);
  }

  async updateUom(id: string, request: UpdateUomRequest): Promise<UpdateUomResponse> {
    return this.request<UpdateUomResponse>('PUT', `/uoms/${id}`, request);
  }

  async activateUom(id: string, request: ActivateUomRequest): Promise<ActivateUomResponse> {
    return this.request<ActivateUomResponse>('PATCH', `/uoms/${id}/activate`, request);
  }

  async deactivateUom(id: string, request: DeactivateUomRequest): Promise<DeactivateUomResponse> {
    return this.request<DeactivateUomResponse>('PATCH', `/uoms/${id}/deactivate`, request);
  }

  async suggestUoms(request: SuggestUomsRequest): Promise<SuggestUomsResponse> {
    return this.request<SuggestUomsResponse>('GET', '/uoms/suggest', undefined, {
      keyword: request.keyword,
      groupId: request.groupId,
      limit: request.limit,
    });
  }
}
