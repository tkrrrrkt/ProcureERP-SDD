/**
 * BFF Contracts: Organization Master
 *
 * UI ↔ BFF の契約定義
 * SSoT: packages/contracts/src/bff/organization-master
 */

// =============================================================================
// Sort Options
// =============================================================================

export type VersionSortBy = 'effectiveDate' | 'versionCode' | 'versionName';

export type DepartmentSortBy = 'sortOrder' | 'departmentCode' | 'departmentName';

export type SortOrder = 'asc' | 'desc';

// =============================================================================
// Organization Version DTOs
// =============================================================================

/**
 * バージョン一覧用サマリーDTO
 */
export interface VersionSummaryDto {
  id: string;
  versionCode: string;
  versionName: string;
  effectiveDate: string; // ISO 8601 (date only: YYYY-MM-DD)
  expiryDate: string | null; // ISO 8601 (date only: YYYY-MM-DD)
  /** 現在有効なバージョンかどうか（BFF計算） */
  isCurrentlyEffective: boolean;
  /** 所属部門数（BFF集計） */
  departmentCount: number;
}

/**
 * バージョン詳細DTO
 */
export interface VersionDetailDto {
  id: string;
  versionCode: string;
  versionName: string;
  effectiveDate: string; // ISO 8601 (date only: YYYY-MM-DD)
  expiryDate: string | null; // ISO 8601 (date only: YYYY-MM-DD)
  baseVersionId: string | null;
  description: string | null;
  isCurrentlyEffective: boolean;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

// =============================================================================
// List Versions
// =============================================================================

export interface ListVersionsRequest {
  sortBy?: VersionSortBy; // default: 'effectiveDate'
  sortOrder?: SortOrder; // default: 'desc'
}

export interface ListVersionsResponse {
  items: VersionSummaryDto[];
}

// =============================================================================
// Get Version
// =============================================================================

export interface GetVersionResponse {
  version: VersionDetailDto;
}

// =============================================================================
// Create Version
// =============================================================================

export interface CreateVersionRequest {
  versionCode: string;
  versionName: string;
  effectiveDate: string; // ISO 8601 (date only: YYYY-MM-DD)
  expiryDate?: string; // ISO 8601 (date only: YYYY-MM-DD)
  description?: string;
}

export interface CreateVersionResponse {
  version: VersionDetailDto;
}

// =============================================================================
// Copy Version
// =============================================================================

export interface CopyVersionRequest {
  versionCode: string;
  versionName: string;
  effectiveDate: string; // ISO 8601 (date only: YYYY-MM-DD)
  expiryDate?: string; // ISO 8601 (date only: YYYY-MM-DD)
  description?: string;
}

export interface CopyVersionResponse {
  version: VersionDetailDto;
}

// =============================================================================
// Update Version
// =============================================================================

export interface UpdateVersionRequest {
  versionCode?: string;
  versionName?: string;
  effectiveDate?: string; // ISO 8601 (date only: YYYY-MM-DD)
  expiryDate?: string | null; // ISO 8601 (date only: YYYY-MM-DD), null to clear
  description?: string | null;
}

export interface UpdateVersionResponse {
  version: VersionDetailDto;
}

// =============================================================================
// As-Of Search
// =============================================================================

export interface AsOfSearchRequest {
  asOfDate: string; // ISO 8601 (date only: YYYY-MM-DD)
}

export interface AsOfSearchResponse {
  version: VersionDetailDto | null;
}

// =============================================================================
// Department DTOs
// =============================================================================

/**
 * 部門ツリーノードDTO（ツリー表示用）
 */
export interface DepartmentTreeNodeDto {
  id: string;
  departmentCode: string;
  departmentName: string;
  departmentNameShort: string | null;
  isActive: boolean;
  hierarchyLevel: number;
  children: DepartmentTreeNodeDto[];
}

/**
 * 部門詳細DTO（詳細パネル表示用）
 */
export interface DepartmentDetailDto {
  id: string;
  versionId: string;
  stableId: string;
  departmentCode: string;
  departmentName: string;
  departmentNameShort: string | null;
  parentId: string | null;
  /** 親部門名（BFF結合） */
  parentDepartmentName: string | null;
  sortOrder: number;
  hierarchyLevel: number;
  hierarchyPath: string | null;
  isActive: boolean;
  postalCode: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  phoneNumber: string | null;
  description: string | null;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

// =============================================================================
// List Departments (Tree)
// =============================================================================

export interface ListDepartmentsTreeRequest {
  keyword?: string; // partial match on departmentCode, departmentName
  isActive?: boolean; // default: true (only active)
}

export interface ListDepartmentsTreeResponse {
  versionId: string;
  versionCode: string;
  nodes: DepartmentTreeNodeDto[];
}

// =============================================================================
// Get Department
// =============================================================================

export interface GetDepartmentResponse {
  department: DepartmentDetailDto;
}

// =============================================================================
// Create Department
// =============================================================================

export interface CreateDepartmentRequest {
  departmentCode: string; // ユーザー手動入力
  departmentName: string;
  departmentNameShort?: string;
  parentId?: string; // null = root department
  sortOrder?: number; // default: 0
  postalCode?: string;
  addressLine1?: string;
  addressLine2?: string;
  phoneNumber?: string;
  description?: string;
}

export interface CreateDepartmentResponse {
  department: DepartmentDetailDto;
}

// =============================================================================
// Update Department
// =============================================================================

export interface UpdateDepartmentRequest {
  departmentCode?: string;
  departmentName?: string;
  departmentNameShort?: string | null;
  parentId?: string | null; // null = move to root
  sortOrder?: number;
  postalCode?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  phoneNumber?: string | null;
  description?: string | null;
}

export interface UpdateDepartmentResponse {
  department: DepartmentDetailDto;
}

// =============================================================================
// Move Department (Drag & Drop)
// =============================================================================

export interface MoveDepartmentRequest {
  newParentId: string | null; // null = move to root
}

export interface MoveDepartmentResponse {
  /** 移動後のツリー全体を返す */
  tree: ListDepartmentsTreeResponse;
}

// =============================================================================
// Deactivate / Reactivate Department
// =============================================================================

export interface DeactivateDepartmentResponse {
  department: DepartmentDetailDto;
}

export interface ReactivateDepartmentResponse {
  department: DepartmentDetailDto;
}
