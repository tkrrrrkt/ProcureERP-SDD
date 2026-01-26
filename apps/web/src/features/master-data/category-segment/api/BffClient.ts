/**
 * BFF Client Interface for Category-Segment Master
 *
 * contracts/bff の型を使用し、BFFエンドポイントへのアクセスを抽象化
 */

// contracts/bff から型を再エクスポート
export type {
  // Enums
  TargetEntityKind,
  // Sort Options
  CategoryAxisSortBy,
  SegmentSortBy,
  SortOrder,
  SegmentViewMode,
  // CategoryAxis DTOs
  CategoryAxisDto,
  ListCategoryAxesRequest,
  ListCategoryAxesResponse,
  GetCategoryAxisResponse,
  CreateCategoryAxisRequest,
  CreateCategoryAxisResponse,
  UpdateCategoryAxisRequest,
  UpdateCategoryAxisResponse,
  // Segment DTOs
  SegmentDto,
  SegmentTreeNode,
  ListSegmentsRequest,
  ListSegmentsResponse,
  ListSegmentsTreeResponse,
  GetSegmentResponse,
  CreateSegmentRequest,
  CreateSegmentResponse,
  UpdateSegmentRequest,
  UpdateSegmentResponse,
  // SegmentAssignment DTOs
  SegmentAssignmentDto,
  ListSegmentAssignmentsRequest,
  ListSegmentAssignmentsResponse,
  UpsertSegmentAssignmentRequest,
  UpsertSegmentAssignmentResponse,
  // EntitySegmentInfo
  EntitySegmentInfo,
  GetEntitySegmentsResponse,
} from '@contracts/bff/category-segment';

// contracts/bff/errors からエラー型を再エクスポート
export {
  CategorySegmentErrorCode,
  CategorySegmentErrorHttpStatus,
  CategorySegmentErrorMessage,
} from '@contracts/bff/errors/category-segment-error';

import type {
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
} from '@contracts/bff/category-segment';

/**
 * BFF Client Interface for Category-Segment
 */
export interface BffClient {
  // ===========================================================================
  // CategoryAxis API
  // ===========================================================================

  /**
   * Get category axis list with pagination, sort, and search
   * GET /api/bff/master-data/category-segment/category-axes
   */
  listCategoryAxes(request: ListCategoryAxesRequest): Promise<ListCategoryAxesResponse>;

  /**
   * Get category axis detail by ID
   * GET /api/bff/master-data/category-segment/category-axes/:id
   */
  getCategoryAxis(id: string): Promise<GetCategoryAxisResponse>;

  /**
   * Create new category axis
   * POST /api/bff/master-data/category-segment/category-axes
   */
  createCategoryAxis(request: CreateCategoryAxisRequest): Promise<CreateCategoryAxisResponse>;

  /**
   * Update category axis (with optimistic locking)
   * PUT /api/bff/master-data/category-segment/category-axes/:id
   */
  updateCategoryAxis(id: string, request: UpdateCategoryAxisRequest): Promise<UpdateCategoryAxisResponse>;

  // ===========================================================================
  // Segment API
  // ===========================================================================

  /**
   * Get segment list with pagination (flat)
   * GET /api/bff/master-data/category-segment/segments
   */
  listSegments(request: ListSegmentsRequest): Promise<ListSegmentsResponse>;

  /**
   * Get segment tree (hierarchy)
   * GET /api/bff/master-data/category-segment/segments/tree
   */
  listSegmentsTree(categoryAxisId: string): Promise<ListSegmentsTreeResponse>;

  /**
   * Get segment detail by ID
   * GET /api/bff/master-data/category-segment/segments/:id
   */
  getSegment(id: string): Promise<GetSegmentResponse>;

  /**
   * Create new segment
   * POST /api/bff/master-data/category-segment/segments
   */
  createSegment(request: CreateSegmentRequest): Promise<CreateSegmentResponse>;

  /**
   * Update segment (with optimistic locking)
   * PUT /api/bff/master-data/category-segment/segments/:id
   */
  updateSegment(id: string, request: UpdateSegmentRequest): Promise<UpdateSegmentResponse>;

  // ===========================================================================
  // SegmentAssignment API
  // ===========================================================================

  /**
   * Get segment assignments for an entity
   * GET /api/bff/master-data/category-segment/assignments
   */
  listSegmentAssignments(request: ListSegmentAssignmentsRequest): Promise<ListSegmentAssignmentsResponse>;

  /**
   * Upsert segment assignment (1軸1値)
   * POST /api/bff/master-data/category-segment/assignments
   */
  upsertSegmentAssignment(request: UpsertSegmentAssignmentRequest): Promise<UpsertSegmentAssignmentResponse>;

  /**
   * Delete segment assignment
   * DELETE /api/bff/master-data/category-segment/assignments/:id
   */
  deleteSegmentAssignment(id: string): Promise<void>;

  /**
   * Get entity segments (for detail screen display)
   * GET /api/bff/master-data/category-segment/entities/:entityKind/:entityId/segments
   */
  getEntitySegments(entityKind: TargetEntityKind, entityId: string): Promise<GetEntitySegmentsResponse>;
}
