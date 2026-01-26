/**
 * API Contracts: Organization Master
 *
 * BFF ↔ Domain API の契約定義
 * SSoT: packages/contracts/src/api/organization-master
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

export interface OrganizationVersionApiDto {
  id: string;
  versionCode: string;
  versionName: string;
  effectiveDate: string; // ISO 8601 (date only: YYYY-MM-DD)
  expiryDate: string | null; // ISO 8601 (date only: YYYY-MM-DD)
  baseVersionId: string | null;
  description: string | null;
  isActive: boolean;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  createdBy: string | null;
  updatedBy: string | null;
}

// =============================================================================
// List Versions
// =============================================================================

export interface ListVersionsApiRequest {
  sortBy?: VersionSortBy; // default: 'effectiveDate'
  sortOrder?: SortOrder; // default: 'desc'
}

export interface ListVersionsApiResponse {
  items: OrganizationVersionApiDto[];
}

// =============================================================================
// Get Version
// =============================================================================

export interface GetVersionApiResponse {
  version: OrganizationVersionApiDto;
}

// =============================================================================
// Create Version
// =============================================================================

export interface CreateVersionApiRequest {
  versionCode: string;
  versionName: string;
  effectiveDate: string; // ISO 8601 (date only: YYYY-MM-DD)
  expiryDate?: string; // ISO 8601 (date only: YYYY-MM-DD)
  description?: string;
}

export interface CreateVersionApiResponse {
  version: OrganizationVersionApiDto;
}

// =============================================================================
// Copy Version
// =============================================================================

export interface CopyVersionApiRequest {
  versionCode: string;
  versionName: string;
  effectiveDate: string; // ISO 8601 (date only: YYYY-MM-DD)
  expiryDate?: string; // ISO 8601 (date only: YYYY-MM-DD)
  description?: string;
}

export interface CopyVersionApiResponse {
  version: OrganizationVersionApiDto;
}

// =============================================================================
// Update Version
// =============================================================================

export interface UpdateVersionApiRequest {
  versionCode?: string;
  versionName?: string;
  effectiveDate?: string; // ISO 8601 (date only: YYYY-MM-DD)
  expiryDate?: string | null; // ISO 8601 (date only: YYYY-MM-DD), null to clear
  description?: string | null;
}

export interface UpdateVersionApiResponse {
  version: OrganizationVersionApiDto;
}

// =============================================================================
// As-Of Search
// =============================================================================

export interface AsOfSearchApiRequest {
  asOfDate: string; // ISO 8601 (date only: YYYY-MM-DD)
}

export interface AsOfSearchApiResponse {
  version: OrganizationVersionApiDto | null;
}

// =============================================================================
// Department DTOs
// =============================================================================

export interface DepartmentApiDto {
  id: string;
  versionId: string;
  stableId: string;
  departmentCode: string;
  departmentName: string;
  departmentNameShort: string | null;
  parentId: string | null;
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
  createdBy: string | null;
  updatedBy: string | null;
}

// =============================================================================
// List Departments
// =============================================================================

export interface ListDepartmentsApiRequest {
  keyword?: string; // partial match on departmentCode, departmentName
  isActive?: boolean; // default: true (only active)
  sortBy?: DepartmentSortBy; // default: 'sortOrder'
  sortOrder?: SortOrder; // default: 'asc'
}

export interface ListDepartmentsApiResponse {
  items: DepartmentApiDto[];
}

// =============================================================================
// Get Department
// =============================================================================

export interface GetDepartmentApiResponse {
  department: DepartmentApiDto;
}

// =============================================================================
// Create Department
// =============================================================================

export interface CreateDepartmentApiRequest {
  departmentCode: string;
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

export interface CreateDepartmentApiResponse {
  department: DepartmentApiDto;
}

// =============================================================================
// Update Department
// =============================================================================

export interface UpdateDepartmentApiRequest {
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

export interface UpdateDepartmentApiResponse {
  department: DepartmentApiDto;
}

// =============================================================================
// Move Department
// =============================================================================

export interface MoveDepartmentApiRequest {
  newParentId: string | null; // null = move to root
}

export interface MoveDepartmentApiResponse {
  department: DepartmentApiDto;
}

// =============================================================================
// Deactivate / Reactivate Department
// =============================================================================

export interface DeactivateDepartmentApiResponse {
  department: DepartmentApiDto;
}

export interface ReactivateDepartmentApiResponse {
  department: DepartmentApiDto;
}
