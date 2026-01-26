/**
 * Category-Segment Master Feature Exports
 */

// API Clients
export type { BffClient } from './api/BffClient';
export { MockBffClient } from './api/MockBffClient';
export { HttpBffClient } from './api/HttpBffClient';

// Re-export types from BffClient
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
} from './api/BffClient';

// Re-export error codes
export {
  CategorySegmentErrorCode,
  CategorySegmentErrorHttpStatus,
  CategorySegmentErrorMessage,
} from './api/BffClient';

// UI Components
export { CategorySegmentPage } from './ui/CategorySegmentPage';
export {
  CategoryAxisList,
  CategoryAxisCreateDialog,
  CategoryAxisEditDialog,
  SegmentList,
  SegmentTreeView,
  SegmentCreateDialog,
  SegmentEditDialog,
  SegmentAssignmentSection,
  SegmentAssignmentDialog,
} from './ui/components';
