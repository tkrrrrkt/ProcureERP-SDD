import { Injectable } from '@nestjs/common';
import { CategorySegmentDomainApiClient } from '../clients/domain-api.client';
import { CategorySegmentMapper } from '../mappers/category-segment.mapper';
import {
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
  CategoryAxisSortBy,
  SegmentSortBy,
  TargetEntityKind,
} from '@procure/contracts/bff/category-segment';
import {
  ListCategoryAxesApiRequest,
  ListSegmentsApiRequest,
} from '@procure/contracts/api/category-segment';

/**
 * Category-Segment BFF Service
 *
 * UI入力の正規化、Domain API呼び出し、DTO変換
 * - エラーは Pass-through（Domain API のエラーをそのまま返す）
 */
@Injectable()
export class CategorySegmentBffService {
  // Paging / Sorting Normalization Constants
  private readonly DEFAULT_PAGE = 1;
  private readonly DEFAULT_PAGE_SIZE = 50;
  private readonly MAX_PAGE_SIZE = 200;
  private readonly DEFAULT_SORT_ORDER = 'asc' as const;

  // CategoryAxis sortBy defaults and whitelist
  private readonly CATEGORY_AXIS_DEFAULT_SORT_BY: CategoryAxisSortBy = 'displayOrder';
  private readonly CATEGORY_AXIS_SORT_BY_WHITELIST: CategoryAxisSortBy[] = [
    'axisCode',
    'axisName',
    'displayOrder',
    'targetEntityKind',
    'isActive',
  ];

  // Segment sortBy defaults and whitelist
  private readonly SEGMENT_DEFAULT_SORT_BY: SegmentSortBy = 'displayOrder';
  private readonly SEGMENT_SORT_BY_WHITELIST: SegmentSortBy[] = [
    'segmentCode',
    'segmentName',
    'displayOrder',
    'hierarchyLevel',
    'isActive',
  ];

  constructor(
    private readonly domainApiClient: CategorySegmentDomainApiClient,
    private readonly mapper: CategorySegmentMapper,
  ) {}

  // =============================================================================
  // CategoryAxis Operations
  // =============================================================================

  /**
   * カテゴリ軸一覧取得
   */
  async listCategoryAxes(
    tenantId: string,
    userId: string,
    request: ListCategoryAxesRequest,
  ): Promise<ListCategoryAxesResponse> {
    // Paging / Sorting Normalization
    const page = request.page ?? this.DEFAULT_PAGE;
    const pageSize = Math.min(
      request.pageSize ?? this.DEFAULT_PAGE_SIZE,
      this.MAX_PAGE_SIZE,
    );
    const sortBy = this.validateCategoryAxisSortBy(request.sortBy);
    const sortOrder = request.sortOrder ?? this.DEFAULT_SORT_ORDER;
    const keyword = this.normalizeKeyword(request.keyword);

    // page/pageSize → offset/limit 変換
    const offset = (page - 1) * pageSize;
    const limit = pageSize;

    // Domain API 呼び出し
    const apiRequest: ListCategoryAxesApiRequest = {
      offset,
      limit,
      sortBy,
      sortOrder,
      keyword,
      targetEntityKind: request.targetEntityKind,
      isActive: request.isActive,
    };

    const apiResponse = await this.domainApiClient.listCategoryAxes(
      tenantId,
      userId,
      apiRequest,
    );

    // BFF DTO に変換
    return this.mapper.toCategoryAxisListResponse(apiResponse, page, pageSize);
  }

  /**
   * カテゴリ軸詳細取得
   */
  async getCategoryAxis(
    tenantId: string,
    userId: string,
    axisId: string,
  ): Promise<GetCategoryAxisResponse> {
    const apiResponse = await this.domainApiClient.getCategoryAxis(
      tenantId,
      userId,
      axisId,
    );

    return {
      categoryAxis: this.mapper.toCategoryAxisDto(apiResponse.categoryAxis),
    };
  }

  /**
   * カテゴリ軸新規登録
   */
  async createCategoryAxis(
    tenantId: string,
    userId: string,
    request: CreateCategoryAxisRequest,
  ): Promise<CreateCategoryAxisResponse> {
    const apiRequest = this.mapper.toCreateCategoryAxisApiRequest(request);

    const apiResponse = await this.domainApiClient.createCategoryAxis(
      tenantId,
      userId,
      apiRequest,
    );

    return {
      categoryAxis: this.mapper.toCategoryAxisDto(apiResponse.categoryAxis),
    };
  }

  /**
   * カテゴリ軸更新
   */
  async updateCategoryAxis(
    tenantId: string,
    userId: string,
    axisId: string,
    request: UpdateCategoryAxisRequest,
  ): Promise<UpdateCategoryAxisResponse> {
    const apiRequest = this.mapper.toUpdateCategoryAxisApiRequest(request);

    const apiResponse = await this.domainApiClient.updateCategoryAxis(
      tenantId,
      userId,
      axisId,
      apiRequest,
    );

    return {
      categoryAxis: this.mapper.toCategoryAxisDto(apiResponse.categoryAxis),
    };
  }

  // =============================================================================
  // Segment Operations
  // =============================================================================

  /**
   * セグメント一覧取得（フラット形式）
   */
  async listSegments(
    tenantId: string,
    userId: string,
    request: ListSegmentsRequest,
  ): Promise<ListSegmentsResponse> {
    // Paging / Sorting Normalization
    const page = request.page ?? this.DEFAULT_PAGE;
    const pageSize = Math.min(
      request.pageSize ?? this.DEFAULT_PAGE_SIZE,
      this.MAX_PAGE_SIZE,
    );
    const sortBy = this.validateSegmentSortBy(request.sortBy);
    const sortOrder = request.sortOrder ?? this.DEFAULT_SORT_ORDER;
    const keyword = this.normalizeKeyword(request.keyword);

    // page/pageSize → offset/limit 変換
    const offset = (page - 1) * pageSize;
    const limit = pageSize;

    // Domain API 呼び出し
    const apiRequest: ListSegmentsApiRequest = {
      categoryAxisId: request.categoryAxisId,
      offset,
      limit,
      sortBy,
      sortOrder,
      keyword,
      isActive: request.isActive,
    };

    const apiResponse = await this.domainApiClient.listSegments(
      tenantId,
      userId,
      apiRequest,
    );

    // BFF DTO に変換
    return this.mapper.toSegmentListResponse(apiResponse, page, pageSize);
  }

  /**
   * セグメント一覧取得（ツリー形式）
   */
  async listSegmentsTree(
    tenantId: string,
    userId: string,
    categoryAxisId: string,
  ): Promise<ListSegmentsTreeResponse> {
    const apiResponse = await this.domainApiClient.listSegmentsTree(
      tenantId,
      userId,
      categoryAxisId,
    );

    return this.mapper.toSegmentTreeResponse(apiResponse);
  }

  /**
   * セグメント詳細取得
   */
  async getSegment(
    tenantId: string,
    userId: string,
    segmentId: string,
  ): Promise<GetSegmentResponse> {
    const apiResponse = await this.domainApiClient.getSegment(
      tenantId,
      userId,
      segmentId,
    );

    return {
      segment: this.mapper.toSegmentDto(apiResponse.segment),
    };
  }

  /**
   * セグメント新規登録
   */
  async createSegment(
    tenantId: string,
    userId: string,
    request: CreateSegmentRequest,
  ): Promise<CreateSegmentResponse> {
    const apiRequest = this.mapper.toCreateSegmentApiRequest(request);

    const apiResponse = await this.domainApiClient.createSegment(
      tenantId,
      userId,
      apiRequest,
    );

    return {
      segment: this.mapper.toSegmentDto(apiResponse.segment),
    };
  }

  /**
   * セグメント更新
   */
  async updateSegment(
    tenantId: string,
    userId: string,
    segmentId: string,
    request: UpdateSegmentRequest,
  ): Promise<UpdateSegmentResponse> {
    const apiRequest = this.mapper.toUpdateSegmentApiRequest(request);

    const apiResponse = await this.domainApiClient.updateSegment(
      tenantId,
      userId,
      segmentId,
      apiRequest,
    );

    return {
      segment: this.mapper.toSegmentDto(apiResponse.segment),
    };
  }

  // =============================================================================
  // SegmentAssignment Operations
  // =============================================================================

  /**
   * エンティティ別セグメント割当一覧取得
   */
  async listSegmentAssignments(
    tenantId: string,
    userId: string,
    request: ListSegmentAssignmentsRequest,
  ): Promise<ListSegmentAssignmentsResponse> {
    const apiResponse = await this.domainApiClient.listSegmentAssignmentsByEntity(
      tenantId,
      userId,
      {
        entityKind: request.entityKind,
        entityId: request.entityId,
      },
    );

    return this.mapper.toSegmentAssignmentListResponse(apiResponse);
  }

  /**
   * セグメント割当 Upsert（1軸1値）
   */
  async upsertSegmentAssignment(
    tenantId: string,
    userId: string,
    request: UpsertSegmentAssignmentRequest,
  ): Promise<UpsertSegmentAssignmentResponse> {
    const apiRequest = this.mapper.toUpsertSegmentAssignmentApiRequest(request);

    const apiResponse = await this.domainApiClient.upsertSegmentAssignment(
      tenantId,
      userId,
      apiRequest,
    );

    return {
      assignment: this.mapper.toSegmentAssignmentDto(apiResponse.assignment),
    };
  }

  /**
   * セグメント割当解除（論理削除）
   */
  async deleteSegmentAssignment(
    tenantId: string,
    userId: string,
    assignmentId: string,
  ): Promise<void> {
    await this.domainApiClient.deleteSegmentAssignment(
      tenantId,
      userId,
      assignmentId,
    );
  }

  /**
   * エンティティ別セグメント情報取得（詳細画面用）
   */
  async getEntitySegments(
    tenantId: string,
    userId: string,
    entityKind: TargetEntityKind,
    entityId: string,
  ): Promise<GetEntitySegmentsResponse> {
    const apiResponse = await this.domainApiClient.getEntitySegments(
      tenantId,
      userId,
      entityKind,
      entityId,
    );

    return this.mapper.toGetEntitySegmentsResponse(apiResponse);
  }

  // =============================================================================
  // Private Helper Methods
  // =============================================================================

  /**
   * CategoryAxis sortBy バリデーション（whitelist）
   */
  private validateCategoryAxisSortBy(
    sortBy?: CategoryAxisSortBy,
  ): CategoryAxisSortBy {
    if (!sortBy) {
      return this.CATEGORY_AXIS_DEFAULT_SORT_BY;
    }
    if (this.CATEGORY_AXIS_SORT_BY_WHITELIST.includes(sortBy)) {
      return sortBy;
    }
    return this.CATEGORY_AXIS_DEFAULT_SORT_BY;
  }

  /**
   * Segment sortBy バリデーション（whitelist）
   */
  private validateSegmentSortBy(sortBy?: SegmentSortBy): SegmentSortBy {
    if (!sortBy) {
      return this.SEGMENT_DEFAULT_SORT_BY;
    }
    if (this.SEGMENT_SORT_BY_WHITELIST.includes(sortBy)) {
      return sortBy;
    }
    return this.SEGMENT_DEFAULT_SORT_BY;
  }

  /**
   * keyword 正規化（trim、空→undefined）
   */
  private normalizeKeyword(keyword?: string): string | undefined {
    if (!keyword) {
      return undefined;
    }
    const trimmed = keyword.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
}
