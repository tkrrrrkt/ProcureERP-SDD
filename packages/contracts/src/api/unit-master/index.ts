/**
 * API Contracts: Unit Master
 *
 * BFF ↔ Domain API の契約定義（単位グループ・単位）
 * SSoT: packages/contracts/src/api/unit-master
 */

// =============================================================================
// Sort Options（BFFと同一）
// =============================================================================

export type UomGroupSortBy = 'groupCode' | 'groupName' | 'isActive';

export type UomSortBy = 'uomCode' | 'uomName' | 'groupCode' | 'isActive';

export type SortOrder = 'asc' | 'desc';

// =============================================================================
// UomGroupApiDto
// =============================================================================

export interface UomGroupApiDto {
  id: string;
  groupCode: string;
  groupName: string;
  description: string | null;
  baseUomId: string;
  isActive: boolean;
  version: number;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  createdByLoginAccountId: string | null;
  updatedByLoginAccountId: string | null;
}

// =============================================================================
// UomApiDto
// =============================================================================

export interface UomApiDto {
  id: string;
  uomCode: string;
  uomName: string;
  uomSymbol: string | null;
  uomGroupId: string;
  isActive: boolean;
  version: number;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  createdByLoginAccountId: string | null;
  updatedByLoginAccountId: string | null;
}

// =============================================================================
// List UomGroups
// =============================================================================

export interface ListUomGroupsApiRequest {
  offset: number; // 0-based
  limit: number;
  sortBy?: UomGroupSortBy; // default: 'groupCode'
  sortOrder?: SortOrder; // default: 'asc'
  keyword?: string; // partial match on groupCode, groupName
  isActive?: boolean; // filter by active status
}

export interface ListUomGroupsApiResponse {
  items: UomGroupApiDto[];
  total: number;
}

// =============================================================================
// Get UomGroup
// =============================================================================

export interface GetUomGroupApiResponse {
  group: UomGroupApiDto;
}

// =============================================================================
// Create UomGroup
// =============================================================================

export interface CreateUomGroupApiRequest {
  groupCode: string;
  groupName: string;
  description?: string;
  baseUomCode: string;
  baseUomName: string;
  baseUomSymbol?: string;
}

export interface CreateUomGroupApiResponse {
  group: UomGroupApiDto;
  baseUom: UomApiDto; // 同時作成された基準単位
}

// =============================================================================
// Update UomGroup
// =============================================================================

export interface UpdateUomGroupApiRequest {
  groupName: string;
  description?: string;
  baseUomId?: string;
  version: number; // optimistic lock
}

export interface UpdateUomGroupApiResponse {
  group: UomGroupApiDto;
}

// =============================================================================
// Activate/Deactivate UomGroup
// =============================================================================

export interface ActivateUomGroupApiRequest {
  version: number;
}

export interface ActivateUomGroupApiResponse {
  group: UomGroupApiDto;
}

export interface DeactivateUomGroupApiRequest {
  version: number;
}

export interface DeactivateUomGroupApiResponse {
  group: UomGroupApiDto;
}

// =============================================================================
// List Uoms
// =============================================================================

export interface ListUomsApiRequest {
  offset: number; // 0-based
  limit: number;
  sortBy?: UomSortBy; // default: 'uomCode'
  sortOrder?: SortOrder; // default: 'asc'
  keyword?: string; // partial match on uomCode, uomName
  groupId?: string; // filter by group
  isActive?: boolean; // filter by active status
}

export interface ListUomsApiResponse {
  items: UomApiDto[];
  total: number;
}

// =============================================================================
// Get Uom
// =============================================================================

export interface GetUomApiResponse {
  uom: UomApiDto;
}

// =============================================================================
// Create Uom
// =============================================================================

export interface CreateUomApiRequest {
  uomCode: string;
  uomName: string;
  uomSymbol?: string;
  groupId: string;
}

export interface CreateUomApiResponse {
  uom: UomApiDto;
}

// =============================================================================
// Update Uom
// =============================================================================

export interface UpdateUomApiRequest {
  uomName: string;
  uomSymbol?: string;
  version: number; // optimistic lock
}

export interface UpdateUomApiResponse {
  uom: UomApiDto;
}

// =============================================================================
// Activate/Deactivate Uom
// =============================================================================

export interface ActivateUomApiRequest {
  version: number;
}

export interface ActivateUomApiResponse {
  uom: UomApiDto;
}

export interface DeactivateUomApiRequest {
  version: number;
}

export interface DeactivateUomApiResponse {
  uom: UomApiDto;
}

// =============================================================================
// Suggest Uoms
// =============================================================================

export interface SuggestUomsApiRequest {
  keyword: string;
  groupId?: string;
  limit: number;
}

export interface SuggestUomsApiResponse {
  items: UomApiDto[];
}
