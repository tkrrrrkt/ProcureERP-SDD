/**
 * BFF Contracts: Category-Segment Master
 *
 * UI ↔ BFF の契約定義
 * SSoT: packages/contracts/src/bff/category-segment
 */

// =============================================================================
// Enums
// =============================================================================

export const TargetEntityKind = {
  ITEM: 'ITEM',
  PARTY: 'PARTY',
  SUPPLIER_SITE: 'SUPPLIER_SITE',
} as const;

export type TargetEntityKind = (typeof TargetEntityKind)[keyof typeof TargetEntityKind];

// =============================================================================
// Sort Options
// =============================================================================

export type CategoryAxisSortBy =
  | 'axisCode'
  | 'axisName'
  | 'displayOrder'
  | 'targetEntityKind'
  | 'isActive';

export type SegmentSortBy =
  | 'segmentCode'
  | 'segmentName'
  | 'displayOrder'
  | 'hierarchyLevel'
  | 'isActive';

export type SortOrder = 'asc' | 'desc';

// =============================================================================
// CategoryAxis DTOs
// =============================================================================

export interface CategoryAxisDto {
  id: string;
  axisCode: string;
  axisName: string;
  targetEntityKind: TargetEntityKind;
  supportsHierarchy: boolean;
  displayOrder: number;
  description: string | null;
  isActive: boolean;
  version: number;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  createdBy: string | null; // login_account_id
  updatedBy: string | null; // login_account_id
}

// =============================================================================
// List CategoryAxes
// =============================================================================

export interface ListCategoryAxesRequest {
  page?: number; // 1-based, default: 1
  pageSize?: number; // default: 50, max: 200
  sortBy?: CategoryAxisSortBy; // default: 'displayOrder'
  sortOrder?: SortOrder; // default: 'asc'
  keyword?: string; // partial match on axisCode, axisName
  targetEntityKind?: TargetEntityKind;
  isActive?: boolean;
}

export interface ListCategoryAxesResponse {
  items: CategoryAxisDto[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// =============================================================================
// Get CategoryAxis
// =============================================================================

export interface GetCategoryAxisResponse {
  categoryAxis: CategoryAxisDto;
}

// =============================================================================
// Create CategoryAxis
// =============================================================================

export interface CreateCategoryAxisRequest {
  axisCode: string;
  axisName: string;
  targetEntityKind: TargetEntityKind;
  supportsHierarchy?: boolean; // default: false (only allowed true for ITEM)
  displayOrder?: number;
  description?: string;
}

export interface CreateCategoryAxisResponse {
  categoryAxis: CategoryAxisDto;
}

// =============================================================================
// Update CategoryAxis
// =============================================================================

export interface UpdateCategoryAxisRequest {
  axisName: string;
  displayOrder?: number;
  description?: string;
  isActive?: boolean;
  version: number; // optimistic lock
  // axisCode / targetEntityKind は変更不可
}

export interface UpdateCategoryAxisResponse {
  categoryAxis: CategoryAxisDto;
}

// =============================================================================
// Segment DTOs
// =============================================================================

export interface SegmentDto {
  id: string;
  categoryAxisId: string;
  segmentCode: string;
  segmentName: string;
  parentSegmentId: string | null;
  hierarchyLevel: number;
  hierarchyPath: string | null;
  displayOrder: number;
  description: string | null;
  isActive: boolean;
  version: number;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  createdBy: string | null; // login_account_id
  updatedBy: string | null; // login_account_id
}

export interface SegmentTreeNode {
  id: string;
  segmentCode: string;
  segmentName: string;
  hierarchyLevel: number;
  children: SegmentTreeNode[];
}

// =============================================================================
// List Segments
// =============================================================================

export type SegmentViewMode = 'flat' | 'tree';

export interface ListSegmentsRequest {
  categoryAxisId: string; // required
  page?: number; // 1-based, default: 1
  pageSize?: number; // default: 50, max: 200
  sortBy?: SegmentSortBy; // default: 'displayOrder'
  sortOrder?: SortOrder; // default: 'asc'
  keyword?: string; // partial match on segmentCode, segmentName
  isActive?: boolean;
  viewMode?: SegmentViewMode; // default: 'flat'
}

export interface ListSegmentsResponse {
  items: SegmentDto[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ListSegmentsTreeResponse {
  tree: SegmentTreeNode[];
  total: number;
}

// =============================================================================
// Get Segment
// =============================================================================

export interface GetSegmentResponse {
  segment: SegmentDto;
}

// =============================================================================
// Create Segment
// =============================================================================

export interface CreateSegmentRequest {
  categoryAxisId: string;
  segmentCode: string;
  segmentName: string;
  parentSegmentId?: string; // optional (only for hierarchy-enabled axes)
  displayOrder?: number;
  description?: string;
}

export interface CreateSegmentResponse {
  segment: SegmentDto;
}

// =============================================================================
// Update Segment
// =============================================================================

export interface UpdateSegmentRequest {
  segmentName: string;
  parentSegmentId?: string | null; // null to remove parent
  displayOrder?: number;
  description?: string;
  isActive?: boolean;
  version: number; // optimistic lock
  // segmentCode は変更不可
}

export interface UpdateSegmentResponse {
  segment: SegmentDto;
}

// =============================================================================
// SegmentAssignment DTOs
// =============================================================================

export interface SegmentAssignmentDto {
  id: string;
  entityKind: TargetEntityKind;
  entityId: string;
  categoryAxisId: string;
  segmentId: string;
  isActive: boolean;
  version: number;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  createdBy: string | null; // login_account_id
  updatedBy: string | null; // login_account_id
}

// =============================================================================
// List SegmentAssignments
// =============================================================================

export interface ListSegmentAssignmentsRequest {
  entityKind: TargetEntityKind; // required
  entityId: string; // required
}

export interface ListSegmentAssignmentsResponse {
  items: SegmentAssignmentDto[];
}

// =============================================================================
// Upsert SegmentAssignment (1軸1値)
// =============================================================================

export interface UpsertSegmentAssignmentRequest {
  entityKind: TargetEntityKind;
  entityId: string;
  categoryAxisId: string;
  segmentId: string;
}

export interface UpsertSegmentAssignmentResponse {
  assignment: SegmentAssignmentDto;
}

// =============================================================================
// Delete SegmentAssignment (論理削除)
// =============================================================================

// DELETE /api/bff/master-data/category-segment/assignments/:id
// No request body, response is 204 No Content

// =============================================================================
// Get Entity Segments (エンティティ詳細画面用)
// =============================================================================

export interface EntitySegmentInfo {
  categoryAxisId: string;
  categoryAxisName: string;
  segmentId: string;
  segmentCode: string;
  segmentName: string;
}

export interface GetEntitySegmentsResponse {
  segments: EntitySegmentInfo[];
}
