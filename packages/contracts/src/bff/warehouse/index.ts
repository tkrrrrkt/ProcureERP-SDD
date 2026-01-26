/**
 * BFF Contracts: Warehouse (倉庫マスタ)
 *
 * UI <-> BFF の契約定義
 * SSoT: packages/contracts/src/bff/warehouse
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
// WarehouseDto
// =============================================================================

export interface WarehouseDto {
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

export interface ListWarehousesRequest {
  page?: number; // 1-based, default: 1
  pageSize?: number; // default: 20, max: 200
  sortBy?: WarehouseSortBy; // default: 'displayOrder'
  sortOrder?: SortOrder; // default: 'asc'
  keyword?: string; // partial match on warehouseCode, warehouseName, warehouseNameKana
  isActive?: boolean; // filter by active status
}

export interface ListWarehousesResponse {
  items: WarehouseDto[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// =============================================================================
// Get Warehouse
// =============================================================================

export interface GetWarehouseResponse {
  warehouse: WarehouseDto;
}

// =============================================================================
// Create Warehouse
// =============================================================================

export interface CreateWarehouseRequest {
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

export interface CreateWarehouseResponse {
  warehouse: WarehouseDto;
}

// =============================================================================
// Update Warehouse
// =============================================================================

export interface UpdateWarehouseRequest {
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

export interface UpdateWarehouseResponse {
  warehouse: WarehouseDto;
}

// =============================================================================
// Deactivate Warehouse
// =============================================================================

export interface DeactivateWarehouseRequest {
  version: number;
}

export interface DeactivateWarehouseResponse {
  warehouse: WarehouseDto;
}

// =============================================================================
// Activate Warehouse
// =============================================================================

export interface ActivateWarehouseRequest {
  version: number;
}

export interface ActivateWarehouseResponse {
  warehouse: WarehouseDto;
}

// =============================================================================
// Set Default Receiving Warehouse
// =============================================================================

export interface SetDefaultReceivingWarehouseRequest {
  version: number;
}

export interface SetDefaultReceivingWarehouseResponse {
  warehouse: WarehouseDto;
  previousDefault: WarehouseDto | null; // 以前の既定倉庫（あれば）
}
