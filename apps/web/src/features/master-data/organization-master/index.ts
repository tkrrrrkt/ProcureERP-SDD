/**
 * Organization Master Feature
 * 組織マスタ機能のエントリーポイント
 */

// UI Components
export { OrganizationMasterPage } from './ui/OrganizationMasterPage';
export { VersionCardList } from './ui/components/VersionCardList';
export { VersionCard } from './ui/components/VersionCard';
export { VersionFormDialog } from './ui/components/VersionFormDialog';
export { VersionDetail } from './ui/components/VersionDetail';
export { DepartmentTree } from './ui/components/DepartmentTree';
export { DepartmentTreeNode, DepartmentTreeNodeDragOverlay } from './ui/components/DepartmentTreeNode';
export { DepartmentContextMenu } from './ui/components/DepartmentContextMenu';
export { DepartmentFormDialog } from './ui/components/DepartmentFormDialog';
export { DepartmentDetail } from './ui/components/DepartmentDetail';
export { TreeFilter } from './ui/components/TreeFilter';
export { DetailPanel } from './ui/components/DetailPanel';

// API Clients
export type { BffClient } from './api/BffClient';
export { MockBffClient } from './api/MockBffClient';
export { HttpBffClient } from './api/HttpBffClient';
export { getBffClient, getSharedBffClient } from './api/client';

// Hooks
export {
  versionKeys,
  useVersionList,
  useVersionDetail,
  useCreateVersion,
  useCopyVersion,
  useUpdateVersion,
} from './hooks/use-versions';
export {
  departmentKeys,
  useDepartmentTree,
  useDepartmentDetail,
  useCreateDepartment,
  useUpdateDepartment,
  useMoveDepartment,
  useDeactivateDepartment,
  useReactivateDepartment,
} from './hooks/use-departments';
export { useDepartmentTreeDnd } from './hooks/use-department-tree-dnd';
export type { DndState, UseDepartmentTreeDndResult } from './hooks/use-department-tree-dnd';

// Types (re-exported from contracts + UI-specific types)
export type {
  // From BFF Contracts
  VersionSortBy,
  DepartmentSortBy,
  SortOrder,
  VersionSummaryDto,
  VersionDetailDto,
  ListVersionsRequest,
  ListVersionsResponse,
  GetVersionResponse,
  CreateVersionRequest,
  CreateVersionResponse,
  CopyVersionRequest,
  CopyVersionResponse,
  UpdateVersionRequest,
  UpdateVersionResponse,
  AsOfSearchRequest,
  AsOfSearchResponse,
  DepartmentTreeNodeDto,
  DepartmentDetailDto,
  ListDepartmentsTreeRequest,
  ListDepartmentsTreeResponse,
  GetDepartmentResponse,
  CreateDepartmentRequest,
  CreateDepartmentResponse,
  UpdateDepartmentRequest,
  UpdateDepartmentResponse,
  MoveDepartmentRequest,
  MoveDepartmentResponse,
  DeactivateDepartmentResponse,
  ReactivateDepartmentResponse,
  // UI-specific types
  BffErrorCode,
  BffError,
  DetailPanelType,
  DetailPanelState,
  VersionDialogState,
  DepartmentDialogState,
  DialogState,
} from './lib/types';

export { ERROR_MESSAGES, getErrorMessage } from './lib/types';

// Utils
export {
  formatDate,
  formatDateTime,
  toISODateString,
  isValidDate,
} from './lib/date-utils';
