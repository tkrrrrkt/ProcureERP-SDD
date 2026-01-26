/**
 * BFF Contracts: Unit Master
 *
 * UI ↔ BFF の契約定義（単位グループ・単位）
 * SSoT: packages/contracts/src/bff/unit-master
 */

// =============================================================================
// Error Codes (Re-export from BFF errors)
// =============================================================================

export {
  UnitMasterErrorCode,
  UnitMasterErrorMessage,
} from '../errors/unit-master-error';

// =============================================================================
// Sort Options
// =============================================================================

export type UomGroupSortBy = 'groupCode' | 'groupName' | 'isActive';

export type UomSortBy = 'uomCode' | 'uomName' | 'groupCode' | 'isActive';

export type SortOrder = 'asc' | 'desc';

// =============================================================================
// UomSummaryDto (基準単位の概要情報)
// =============================================================================

export interface UomSummaryDto {
  id: string;
  uomCode: string;
  uomName: string;
}

// =============================================================================
// UomGroupDto
// =============================================================================

export interface UomGroupDto {
  id: string;
  groupCode: string;
  groupName: string;
  description: string | null;
  baseUomId: string;
  baseUom: UomSummaryDto | null; // 基準単位の概要情報
  isActive: boolean;
  version: number;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  createdBy: string | null; // login_account_id
  updatedBy: string | null; // login_account_id
}

// =============================================================================
// List UomGroups
// =============================================================================

export interface ListUomGroupsRequest {
  page?: number; // 1-based, default: 1
  pageSize?: number; // default: 50, max: 200
  sortBy?: UomGroupSortBy; // default: 'groupCode'
  sortOrder?: SortOrder; // default: 'asc'
  keyword?: string; // partial match on groupCode, groupName
  isActive?: boolean; // filter by active status
}

export interface ListUomGroupsResponse {
  items: UomGroupDto[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// =============================================================================
// Get UomGroup
// =============================================================================

export interface GetUomGroupResponse {
  group: UomGroupDto;
}

// =============================================================================
// Create UomGroup
// =============================================================================

export interface CreateUomGroupRequest {
  groupCode: string; // 1-10 chars, uppercase alphanumeric + -_
  groupName: string;
  description?: string;
  baseUomCode: string; // 基準単位のコード（同時作成）
  baseUomName: string; // 基準単位の名称（同時作成）
  baseUomSymbol?: string; // 基準単位の記号（任意）
}

export interface CreateUomGroupResponse {
  group: UomGroupDto;
}

// =============================================================================
// Update UomGroup
// =============================================================================

export interface UpdateUomGroupRequest {
  groupName: string;
  description?: string;
  baseUomId?: string; // 同一グループ内の別単位に変更可能
  version: number; // optimistic lock
}

export interface UpdateUomGroupResponse {
  group: UomGroupDto;
}

// =============================================================================
// Activate UomGroup
// =============================================================================

export interface ActivateUomGroupRequest {
  version: number; // optimistic lock
}

export interface ActivateUomGroupResponse {
  group: UomGroupDto;
}

// =============================================================================
// Deactivate UomGroup
// =============================================================================

export interface DeactivateUomGroupRequest {
  version: number; // optimistic lock
}

export interface DeactivateUomGroupResponse {
  group: UomGroupDto;
}

// =============================================================================
// UomDto
// =============================================================================

export interface UomDto {
  id: string;
  uomCode: string;
  uomName: string;
  uomSymbol: string | null;
  uomGroupId: string; // グループID（UIで使用）
  groupId: string; // alias for uomGroupId
  groupCode: string;
  groupName: string;
  conversionFactor: number; // 基準単位への換算率（例: 1cm = 0.01m なら 0.01）
  isBaseUom: boolean; // この単位が基準単位かどうか（BFF算出）
  isActive: boolean;
  version: number;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  createdBy: string | null; // login_account_id
  updatedBy: string | null; // login_account_id
}

// =============================================================================
// List Uoms
// =============================================================================

export interface ListUomsRequest {
  page?: number; // 1-based, default: 1
  pageSize?: number; // default: 50, max: 200
  sortBy?: UomSortBy; // default: 'uomCode'
  sortOrder?: SortOrder; // default: 'asc'
  keyword?: string; // partial match on uomCode, uomName
  groupId?: string; // filter by group
  isActive?: boolean; // filter by active status
}

export interface ListUomsResponse {
  items: UomDto[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// =============================================================================
// Get Uom
// =============================================================================

export interface GetUomResponse {
  uom: UomDto;
}

// =============================================================================
// Create Uom
// =============================================================================

export interface CreateUomRequest {
  uomCode: string; // 1-10 chars, uppercase alphanumeric + -_
  uomName: string;
  uomSymbol?: string;
  uomGroupId: string; // グループID
  conversionFactor: number; // 基準単位への換算率（基準単位の場合は1）
}

export interface CreateUomResponse {
  uom: UomDto;
}

// =============================================================================
// Update Uom
// =============================================================================

export interface UpdateUomRequest {
  uomName: string;
  uomSymbol?: string;
  conversionFactor: number; // 基準単位への換算率
  version: number; // optimistic lock
}

export interface UpdateUomResponse {
  uom: UomDto;
}

// =============================================================================
// Activate Uom
// =============================================================================

export interface ActivateUomRequest {
  version: number; // optimistic lock
}

export interface ActivateUomResponse {
  uom: UomDto;
}

// =============================================================================
// Deactivate Uom
// =============================================================================

export interface DeactivateUomRequest {
  version: number; // optimistic lock
}

export interface DeactivateUomResponse {
  uom: UomDto;
}

// =============================================================================
// Suggest Uoms
// =============================================================================

export interface SuggestUomsRequest {
  keyword: string; // prefix match on uomCode, uomName
  groupId?: string; // filter by group
  limit?: number; // default: 20, max: 20
}

export interface SuggestUomsResponse {
  items: UomDto[];
}
