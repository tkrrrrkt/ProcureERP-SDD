/**
 * HTTP BFF Client for Category-Segment Master
 * Real HTTP implementation for production use
 */

import type {
  BffClient,
  ListCategoryAxesRequest,
  ListCategoryAxesResponse,
  GetCategoryAxisResponse,
  CreateCategoryAxisRequest,
  CreateCategoryAxisResponse,
  UpdateCategoryAxisRequest,
  UpdateCategoryAxisResponse,
  ListSegmentsRequest,
  ListSegmentsResponse,
  ListSegmentsTreeResponse,
  GetSegmentResponse,
  CreateSegmentRequest,
  CreateSegmentResponse,
  UpdateSegmentRequest,
  UpdateSegmentResponse,
  ListSegmentAssignmentsRequest,
  ListSegmentAssignmentsResponse,
  UpsertSegmentAssignmentRequest,
  UpsertSegmentAssignmentResponse,
  GetEntitySegmentsResponse,
  TargetEntityKind,
} from './BffClient';

export class HttpBffClient implements BffClient {
  private baseUrl: string;
  private tenantId: string;
  private userId: string;

  constructor(baseUrl = '/api/bff', tenantId = 'demo-tenant', userId = 'demo-user') {
    this.baseUrl = baseUrl;
    this.tenantId = tenantId;
    this.userId = userId;
  }

  /**
   * Build common headers including auth
   */
  private buildHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'x-tenant-id': this.tenantId,
      'x-user-id': this.userId,
    };
  }

  /**
   * Build query string from params
   */
  private buildQueryString(params: Record<string, unknown>): string {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    return searchParams.toString();
  }

  /**
   * Handle fetch response (Pass-through error policy)
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'リクエストに失敗しました' }));
      throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  // ===========================================================================
  // CategoryAxis Methods
  // ===========================================================================

  async listCategoryAxes(request: ListCategoryAxesRequest): Promise<ListCategoryAxesResponse> {
    const queryString = this.buildQueryString(request as Record<string, unknown>);
    const url = `${this.baseUrl}/master-data/category-segment/category-axes?${queryString}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.buildHeaders(),
    });

    return this.handleResponse<ListCategoryAxesResponse>(response);
  }

  async getCategoryAxis(id: string): Promise<GetCategoryAxisResponse> {
    const url = `${this.baseUrl}/master-data/category-segment/category-axes/${id}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.buildHeaders(),
    });

    return this.handleResponse<GetCategoryAxisResponse>(response);
  }

  async createCategoryAxis(request: CreateCategoryAxisRequest): Promise<CreateCategoryAxisResponse> {
    const url = `${this.baseUrl}/master-data/category-segment/category-axes`;

    const response = await fetch(url, {
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify(request),
    });

    return this.handleResponse<CreateCategoryAxisResponse>(response);
  }

  async updateCategoryAxis(
    id: string,
    request: UpdateCategoryAxisRequest
  ): Promise<UpdateCategoryAxisResponse> {
    const url = `${this.baseUrl}/master-data/category-segment/category-axes/${id}`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: this.buildHeaders(),
      body: JSON.stringify(request),
    });

    return this.handleResponse<UpdateCategoryAxisResponse>(response);
  }

  // ===========================================================================
  // Segment Methods
  // ===========================================================================

  async listSegments(request: ListSegmentsRequest): Promise<ListSegmentsResponse> {
    const queryString = this.buildQueryString(request as Record<string, unknown>);
    const url = `${this.baseUrl}/master-data/category-segment/segments?${queryString}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.buildHeaders(),
    });

    return this.handleResponse<ListSegmentsResponse>(response);
  }

  async listSegmentsTree(categoryAxisId: string): Promise<ListSegmentsTreeResponse> {
    const url = `${this.baseUrl}/master-data/category-segment/segments/tree?categoryAxisId=${categoryAxisId}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.buildHeaders(),
    });

    return this.handleResponse<ListSegmentsTreeResponse>(response);
  }

  async getSegment(id: string): Promise<GetSegmentResponse> {
    const url = `${this.baseUrl}/master-data/category-segment/segments/${id}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.buildHeaders(),
    });

    return this.handleResponse<GetSegmentResponse>(response);
  }

  async createSegment(request: CreateSegmentRequest): Promise<CreateSegmentResponse> {
    const url = `${this.baseUrl}/master-data/category-segment/segments`;

    const response = await fetch(url, {
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify(request),
    });

    return this.handleResponse<CreateSegmentResponse>(response);
  }

  async updateSegment(id: string, request: UpdateSegmentRequest): Promise<UpdateSegmentResponse> {
    const url = `${this.baseUrl}/master-data/category-segment/segments/${id}`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: this.buildHeaders(),
      body: JSON.stringify(request),
    });

    return this.handleResponse<UpdateSegmentResponse>(response);
  }

  // ===========================================================================
  // SegmentAssignment Methods
  // ===========================================================================

  async listSegmentAssignments(
    request: ListSegmentAssignmentsRequest
  ): Promise<ListSegmentAssignmentsResponse> {
    const queryString = this.buildQueryString(request as Record<string, unknown>);
    const url = `${this.baseUrl}/master-data/category-segment/assignments?${queryString}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.buildHeaders(),
    });

    return this.handleResponse<ListSegmentAssignmentsResponse>(response);
  }

  async upsertSegmentAssignment(
    request: UpsertSegmentAssignmentRequest
  ): Promise<UpsertSegmentAssignmentResponse> {
    const url = `${this.baseUrl}/master-data/category-segment/assignments`;

    const response = await fetch(url, {
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify(request),
    });

    return this.handleResponse<UpsertSegmentAssignmentResponse>(response);
  }

  async deleteSegmentAssignment(id: string): Promise<void> {
    const url = `${this.baseUrl}/master-data/category-segment/assignments/${id}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.buildHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'リクエストに失敗しました' }));
      throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    // 204 No Content - no response body
  }

  async getEntitySegments(
    entityKind: TargetEntityKind,
    entityId: string
  ): Promise<GetEntitySegmentsResponse> {
    const url = `${this.baseUrl}/master-data/category-segment/entities/${entityKind}/${entityId}/segments`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.buildHeaders(),
    });

    return this.handleResponse<GetEntitySegmentsResponse>(response);
  }
}
