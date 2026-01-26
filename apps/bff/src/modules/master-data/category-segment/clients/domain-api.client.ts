import { Injectable, HttpException } from '@nestjs/common';
import {
  ListCategoryAxesApiRequest,
  ListCategoryAxesApiResponse,
  GetCategoryAxisApiResponse,
  CreateCategoryAxisApiRequest,
  CreateCategoryAxisApiResponse,
  UpdateCategoryAxisApiRequest,
  UpdateCategoryAxisApiResponse,
  ListSegmentsApiRequest,
  ListSegmentsApiResponse,
  ListSegmentsTreeApiResponse,
  GetSegmentApiResponse,
  CreateSegmentApiRequest,
  CreateSegmentApiResponse,
  UpdateSegmentApiRequest,
  UpdateSegmentApiResponse,
  ListSegmentAssignmentsByEntityApiRequest,
  ListSegmentAssignmentsByEntityApiResponse,
  UpsertSegmentAssignmentApiRequest,
  UpsertSegmentAssignmentApiResponse,
  GetEntitySegmentsApiResponse,
  TargetEntityKind,
} from '@procure/contracts/api/category-segment';

/**
 * Domain API Client for Category-Segment
 *
 * BFF → Domain API の HTTP クライアント
 * - tenant_id / user_id をヘッダーに含めて伝搬
 * - Pass-through Error Policy（Domain API エラーをそのまま返す）
 */
@Injectable()
export class CategorySegmentDomainApiClient {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.DOMAIN_API_URL || 'http://localhost:3002';
  }

  // =============================================================================
  // CategoryAxis API
  // =============================================================================

  /**
   * カテゴリ軸一覧取得
   */
  async listCategoryAxes(
    tenantId: string,
    userId: string,
    request: ListCategoryAxesApiRequest,
  ): Promise<ListCategoryAxesApiResponse> {
    const params = new URLSearchParams();
    params.append('offset', String(request.offset));
    params.append('limit', String(request.limit));
    if (request.sortBy) params.append('sortBy', request.sortBy);
    if (request.sortOrder) params.append('sortOrder', request.sortOrder);
    if (request.keyword) params.append('keyword', request.keyword);
    if (request.targetEntityKind) params.append('targetEntityKind', request.targetEntityKind);
    if (request.isActive !== undefined) params.append('isActive', String(request.isActive));

    const url = `${this.baseUrl}/api/master-data/category-segment/category-axes?${params.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.buildHeaders(tenantId, userId),
    });

    return this.handleResponse<ListCategoryAxesApiResponse>(response);
  }

  /**
   * カテゴリ軸詳細取得
   */
  async getCategoryAxis(
    tenantId: string,
    userId: string,
    axisId: string,
  ): Promise<GetCategoryAxisApiResponse> {
    const url = `${this.baseUrl}/api/master-data/category-segment/category-axes/${axisId}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.buildHeaders(tenantId, userId),
    });

    return this.handleResponse<GetCategoryAxisApiResponse>(response);
  }

  /**
   * カテゴリ軸新規登録
   */
  async createCategoryAxis(
    tenantId: string,
    userId: string,
    request: CreateCategoryAxisApiRequest,
  ): Promise<CreateCategoryAxisApiResponse> {
    const url = `${this.baseUrl}/api/master-data/category-segment/category-axes`;

    const response = await fetch(url, {
      method: 'POST',
      headers: this.buildHeaders(tenantId, userId),
      body: JSON.stringify(request),
    });

    return this.handleResponse<CreateCategoryAxisApiResponse>(response);
  }

  /**
   * カテゴリ軸更新
   */
  async updateCategoryAxis(
    tenantId: string,
    userId: string,
    axisId: string,
    request: UpdateCategoryAxisApiRequest,
  ): Promise<UpdateCategoryAxisApiResponse> {
    const url = `${this.baseUrl}/api/master-data/category-segment/category-axes/${axisId}`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: this.buildHeaders(tenantId, userId),
      body: JSON.stringify(request),
    });

    return this.handleResponse<UpdateCategoryAxisApiResponse>(response);
  }

  // =============================================================================
  // Segment API
  // =============================================================================

  /**
   * セグメント一覧取得（フラット形式）
   */
  async listSegments(
    tenantId: string,
    userId: string,
    request: ListSegmentsApiRequest,
  ): Promise<ListSegmentsApiResponse> {
    const params = new URLSearchParams();
    params.append('categoryAxisId', request.categoryAxisId);
    params.append('offset', String(request.offset));
    params.append('limit', String(request.limit));
    if (request.sortBy) params.append('sortBy', request.sortBy);
    if (request.sortOrder) params.append('sortOrder', request.sortOrder);
    if (request.keyword) params.append('keyword', request.keyword);
    if (request.isActive !== undefined) params.append('isActive', String(request.isActive));

    const url = `${this.baseUrl}/api/master-data/category-segment/segments?${params.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.buildHeaders(tenantId, userId),
    });

    return this.handleResponse<ListSegmentsApiResponse>(response);
  }

  /**
   * セグメント一覧取得（ツリー形式）
   */
  async listSegmentsTree(
    tenantId: string,
    userId: string,
    categoryAxisId: string,
  ): Promise<ListSegmentsTreeApiResponse> {
    const url = `${this.baseUrl}/api/master-data/category-segment/segments/tree?categoryAxisId=${categoryAxisId}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.buildHeaders(tenantId, userId),
    });

    return this.handleResponse<ListSegmentsTreeApiResponse>(response);
  }

  /**
   * セグメント詳細取得
   */
  async getSegment(
    tenantId: string,
    userId: string,
    segmentId: string,
  ): Promise<GetSegmentApiResponse> {
    const url = `${this.baseUrl}/api/master-data/category-segment/segments/${segmentId}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.buildHeaders(tenantId, userId),
    });

    return this.handleResponse<GetSegmentApiResponse>(response);
  }

  /**
   * セグメント新規登録
   */
  async createSegment(
    tenantId: string,
    userId: string,
    request: CreateSegmentApiRequest,
  ): Promise<CreateSegmentApiResponse> {
    const url = `${this.baseUrl}/api/master-data/category-segment/segments`;

    const response = await fetch(url, {
      method: 'POST',
      headers: this.buildHeaders(tenantId, userId),
      body: JSON.stringify(request),
    });

    return this.handleResponse<CreateSegmentApiResponse>(response);
  }

  /**
   * セグメント更新
   */
  async updateSegment(
    tenantId: string,
    userId: string,
    segmentId: string,
    request: UpdateSegmentApiRequest,
  ): Promise<UpdateSegmentApiResponse> {
    const url = `${this.baseUrl}/api/master-data/category-segment/segments/${segmentId}`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: this.buildHeaders(tenantId, userId),
      body: JSON.stringify(request),
    });

    return this.handleResponse<UpdateSegmentApiResponse>(response);
  }

  // =============================================================================
  // SegmentAssignment API
  // =============================================================================

  /**
   * エンティティ別セグメント割当一覧取得
   */
  async listSegmentAssignmentsByEntity(
    tenantId: string,
    userId: string,
    request: ListSegmentAssignmentsByEntityApiRequest,
  ): Promise<ListSegmentAssignmentsByEntityApiResponse> {
    const params = new URLSearchParams();
    params.append('entityKind', request.entityKind);
    params.append('entityId', request.entityId);

    const url = `${this.baseUrl}/api/master-data/category-segment/assignments?${params.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.buildHeaders(tenantId, userId),
    });

    return this.handleResponse<ListSegmentAssignmentsByEntityApiResponse>(response);
  }

  /**
   * セグメント割当 Upsert
   */
  async upsertSegmentAssignment(
    tenantId: string,
    userId: string,
    request: UpsertSegmentAssignmentApiRequest,
  ): Promise<UpsertSegmentAssignmentApiResponse> {
    const url = `${this.baseUrl}/api/master-data/category-segment/assignments`;

    const response = await fetch(url, {
      method: 'POST',
      headers: this.buildHeaders(tenantId, userId),
      body: JSON.stringify(request),
    });

    return this.handleResponse<UpsertSegmentAssignmentApiResponse>(response);
  }

  /**
   * セグメント割当解除（論理削除）
   */
  async deleteSegmentAssignment(
    tenantId: string,
    userId: string,
    assignmentId: string,
  ): Promise<void> {
    const url = `${this.baseUrl}/api/master-data/category-segment/assignments/${assignmentId}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.buildHeaders(tenantId, userId),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new HttpException(errorBody, response.status);
    }

    // 204 No Content
  }

  /**
   * エンティティ別セグメント情報取得（詳細画面用）
   */
  async getEntitySegments(
    tenantId: string,
    userId: string,
    entityKind: TargetEntityKind,
    entityId: string,
  ): Promise<GetEntitySegmentsApiResponse> {
    const url = `${this.baseUrl}/api/master-data/category-segment/entities/${entityKind}/${entityId}/segments`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.buildHeaders(tenantId, userId),
    });

    return this.handleResponse<GetEntitySegmentsApiResponse>(response);
  }

  // =============================================================================
  // Private Helper Methods
  // =============================================================================

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
