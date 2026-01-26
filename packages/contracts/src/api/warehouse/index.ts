/**
 * API Contracts: Warehouse (倉庫マスタ)
 *
 * BFF <-> Domain API の契約定義
 * SSoT: packages/contracts/src/api/warehouse
 */

// =============================================================================
// Sort Options
// =============================================================================

export type WarehouseSortBy =
  | 'warehouseCode'
  | 'warehouseName'
  | 'warehouseNameKana'
  | 'displayOrder'
  | 'isActive';

export type SortOrder = 'asc' | 'desc';

// =============================================================================
// WarehouseApiDto
// =============================================================================

export interface WarehouseApiDto {
  id: string;
  warehouseCode: string;
  warehouseName: string;
  warehouseNameKana: string | null;
  warehouseGroupId: string | null;
  // 住所（分割形式）
  postalCode: string | null;
  prefecture: string | null;
  city: string | null;
  address1: string | null;
  address2: string | null;
  phoneNumber: string | null;
  // 運用
  isDefaultReceiving: boolean;
  displayOrder: number;
  notes: string | null;
  isActive: boolean;
  version: number;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  createdBy: string | null; // login_account_id
  updatedBy: string | null; // login_account_id
}

// =============================================================================
// List Warehouses
// =============================================================================

export interface ListWarehousesApiRequest {
  offset: number; // 0-based
  limit: number; // max: 200
  sortBy?: WarehouseSortBy; // default: 'displayOrder'
  sortOrder?: SortOrder; // default: 'asc'
  keyword?: string; // partial match on warehouseCode, warehouseName, warehouseNameKana
  isActive?: boolean; // filter by active status
}

export interface ListWarehousesApiResponse {
  items: WarehouseApiDto[];
  total: number;
}

// =============================================================================
// Get Warehouse
// =============================================================================

export interface GetWarehouseApiResponse {
  warehouse: WarehouseApiDto;
}

// =============================================================================
// Create Warehouse
// =============================================================================

export interface CreateWarehouseApiRequest {
  warehouseCode: string; // 10-digit alphanumeric (required)
  warehouseName: string; // required
  warehouseNameKana?: string;
  warehouseGroupId?: string; // nullable, MVP外
  postalCode?: string;
  prefecture?: string;
  city?: string;
  address1?: string;
  address2?: string;
  phoneNumber?: string;
  isDefaultReceiving?: boolean; // default: false
  displayOrder?: number; // default: 1000
  notes?: string;
  isActive?: boolean; // default: true
}

export interface CreateWarehouseApiResponse {
  warehouse: WarehouseApiDto;
}

// =============================================================================
// Update Warehouse
// =============================================================================

export interface UpdateWarehouseApiRequest {
  // warehouseCode is NOT updatable
  warehouseName: string;
  warehouseNameKana?: string;
  warehouseGroupId?: string | null; // can set, change, or clear
  postalCode?: string;
  prefecture?: string;
  city?: string;
  address1?: string;
  address2?: string;
  phoneNumber?: string;
  isDefaultReceiving: boolean;
  displayOrder: number;
  notes?: string;
  isActive: boolean;
  version: number; // optimistic lock
}

export interface UpdateWarehouseApiResponse {
  warehouse: WarehouseApiDto;
}

// =============================================================================
// Deactivate Warehouse
// =============================================================================

export interface DeactivateWarehouseApiRequest {
  version: number;
}

export interface DeactivateWarehouseApiResponse {
  warehouse: WarehouseApiDto;
}

// =============================================================================
// Activate Warehouse
// =============================================================================

export interface ActivateWarehouseApiRequest {
  version: number;
}

export interface ActivateWarehouseApiResponse {
  warehouse: WarehouseApiDto;
}

// =============================================================================
// Set Default Receiving Warehouse
// =============================================================================

export interface SetDefaultReceivingWarehouseApiRequest {
  version: number;
}

export interface SetDefaultReceivingWarehouseApiResponse {
  warehouse: WarehouseApiDto;
  previousDefault: WarehouseApiDto | null; // 以前の既定倉庫（あれば）
}
