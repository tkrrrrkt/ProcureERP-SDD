/**
 * API Contracts: Category-Segment Master
 *
 * BFF ↔ Domain API の契約定義
 * SSoT: packages/contracts/src/api/category-segment
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
// CategoryAxis API DTOs
// =============================================================================

export interface CategoryAxisApiDto {
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

export interface ListCategoryAxesApiRequest {
  offset: number; // 0-based
  limit: number;
  sortBy?: CategoryAxisSortBy; // default: 'displayOrder'
  sortOrder?: SortOrder; // default: 'asc'
  keyword?: string; // partial match on axisCode, axisName
  targetEntityKind?: TargetEntityKind;
  isActive?: boolean;
}

export interface ListCategoryAxesApiResponse {
  items: CategoryAxisApiDto[];
  total: number;
}

// =============================================================================
// Get CategoryAxis
// =============================================================================

export interface GetCategoryAxisApiResponse {
  categoryAxis: CategoryAxisApiDto;
}

// =============================================================================
// Create CategoryAxis
// =============================================================================

export interface CreateCategoryAxisApiRequest {
  axisCode: string;
  axisName: string;
  targetEntityKind: TargetEntityKind;
  supportsHierarchy?: boolean; // default: false (only allowed true for ITEM)
  displayOrder?: number;
  description?: string;
}

export interface CreateCategoryAxisApiResponse {
  categoryAxis: CategoryAxisApiDto;
}

// =============================================================================
// Update CategoryAxis
// =============================================================================

export interface UpdateCategoryAxisApiRequest {
  axisName: string;
  displayOrder?: number;
  description?: string;
  isActive?: boolean;
  version: number; // optimistic lock
  // axisCode / targetEntityKind は変更不可
}

export interface UpdateCategoryAxisApiResponse {
  categoryAxis: CategoryAxisApiDto;
}

// =============================================================================
// Segment API DTOs
// =============================================================================

export interface SegmentApiDto {
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

export interface ListSegmentsApiRequest {
  categoryAxisId: string; // required
  offset: number; // 0-based
  limit: number;
  sortBy?: SegmentSortBy; // default: 'displayOrder'
  sortOrder?: SortOrder; // default: 'asc'
  keyword?: string; // partial match on segmentCode, segmentName
  isActive?: boolean;
}

export interface ListSegmentsApiResponse {
  items: SegmentApiDto[];
  total: number;
}

export interface ListSegmentsTreeApiResponse {
  tree: SegmentTreeNode[];
  total: number;
}

// =============================================================================
// Get Segment
// =============================================================================

export interface GetSegmentApiResponse {
  segment: SegmentApiDto;
}

// =============================================================================
// Create Segment
// =============================================================================

export interface CreateSegmentApiRequest {
  categoryAxisId: string;
  segmentCode: string;
  segmentName: string;
  parentSegmentId?: string; // optional (only for hierarchy-enabled axes)
  displayOrder?: number;
  description?: string;
}

export interface CreateSegmentApiResponse {
  segment: SegmentApiDto;
}

// =============================================================================
// Update Segment
// =============================================================================

export interface UpdateSegmentApiRequest {
  segmentName: string;
  parentSegmentId?: string | null; // null to remove parent
  displayOrder?: number;
  description?: string;
  isActive?: boolean;
  version: number; // optimistic lock
  // segmentCode は変更不可
}

export interface UpdateSegmentApiResponse {
  segment: SegmentApiDto;
}

// =============================================================================
// SegmentAssignment API DTOs
// =============================================================================

export interface SegmentAssignmentApiDto {
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
// List SegmentAssignments by Entity
// =============================================================================

export interface ListSegmentAssignmentsByEntityApiRequest {
  entityKind: TargetEntityKind; // required
  entityId: string; // required
}

export interface ListSegmentAssignmentsByEntityApiResponse {
  items: SegmentAssignmentApiDto[];
}

// =============================================================================
// List SegmentAssignments by Segment
// =============================================================================

export interface ListSegmentAssignmentsBySegmentApiRequest {
  segmentId: string; // required
  offset: number; // 0-based
  limit: number;
  includeDescendants?: boolean; // default: false (include child segment assignments)
}

export interface ListSegmentAssignmentsBySegmentApiResponse {
  items: SegmentAssignmentApiDto[];
  total: number;
}

// =============================================================================
// Upsert SegmentAssignment (1軸1値)
// =============================================================================

export interface UpsertSegmentAssignmentApiRequest {
  entityKind: TargetEntityKind;
  entityId: string;
  categoryAxisId: string;
  segmentId: string;
}

export interface UpsertSegmentAssignmentApiResponse {
  assignment: SegmentAssignmentApiDto;
}

// =============================================================================
// Delete SegmentAssignment (論理削除)
// =============================================================================

export interface DeleteSegmentAssignmentApiRequest {
  version: number; // optimistic lock
}

// DELETE /api/master-data/category-segment/assignments/:id
// Response is 204 No Content

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

export interface GetEntitySegmentsApiResponse {
  segments: EntitySegmentInfo[];
}

// =============================================================================
// Find Descendant Segment IDs (階層フィルタリング用)
// =============================================================================

export interface FindDescendantSegmentIdsApiResponse {
  segmentIds: string[];
}
