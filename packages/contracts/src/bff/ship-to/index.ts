/**
 * BFF Contracts: Ship-To (納入先マスタ)
 *
 * UI <-> BFF の契約定義
 * SSoT: packages/contracts/src/bff/ship-to
 */

// =============================================================================
// Sort Options
// =============================================================================

export type ShipToSortBy =
  | 'shipToCode'
  | 'shipToName'
  | 'shipToNameKana'
  | 'prefecture'
  | 'isActive';

export type SortOrder = 'asc' | 'desc';

// =============================================================================
// ShipToDto
// =============================================================================

export interface ShipToDto {
  id: string;
  shipToCode: string;
  shipToName: string;
  shipToNameKana: string | null;
  customerSiteId: string | null; // nullable, can link later
  postalCode: string | null;
  prefecture: string | null;
  city: string | null;
  address1: string | null;
  address2: string | null;
  phoneNumber: string | null;
  faxNumber: string | null;
  email: string | null;
  contactPerson: string | null;
  remarks: string | null;
  isActive: boolean;
  version: number;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  createdBy: string | null; // login_account_id
  updatedBy: string | null; // login_account_id
}

// =============================================================================
// List ShipTos
// =============================================================================

export interface ListShipTosRequest {
  page?: number; // 1-based, default: 1
  pageSize?: number; // default: 20, max: 200
  sortBy?: ShipToSortBy; // default: 'shipToCode'
  sortOrder?: SortOrder; // default: 'asc'
  keyword?: string; // partial match on shipToCode, shipToName, shipToNameKana
  isActive?: boolean; // filter by active status
}

export interface ListShipTosResponse {
  items: ShipToDto[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// =============================================================================
// Get ShipTo
// =============================================================================

export interface GetShipToResponse {
  shipTo: ShipToDto;
}

// =============================================================================
// Create ShipTo
// =============================================================================

export interface CreateShipToRequest {
  shipToCode: string; // 10-digit alphanumeric (required)
  shipToName: string; // required
  shipToNameKana?: string;
  customerSiteId?: string; // nullable, can link later (disabled until CustomerSite implemented)
  postalCode?: string;
  prefecture?: string;
  city?: string;
  address1?: string;
  address2?: string;
  phoneNumber?: string;
  faxNumber?: string;
  email?: string;
  contactPerson?: string;
  remarks?: string;
  isActive?: boolean; // default: true
}

export interface CreateShipToResponse {
  shipTo: ShipToDto;
}

// =============================================================================
// Update ShipTo
// =============================================================================

export interface UpdateShipToRequest {
  // shipToCode is NOT updatable
  shipToName: string;
  shipToNameKana?: string;
  customerSiteId?: string | null; // can set, change, or clear (disabled until CustomerSite implemented)
  postalCode?: string;
  prefecture?: string;
  city?: string;
  address1?: string;
  address2?: string;
  phoneNumber?: string;
  faxNumber?: string;
  email?: string;
  contactPerson?: string;
  remarks?: string;
  isActive: boolean;
  version: number; // optimistic lock
}

export interface UpdateShipToResponse {
  shipTo: ShipToDto;
}

// =============================================================================
// Deactivate ShipTo
// =============================================================================

export interface DeactivateShipToRequest {
  version: number;
}

export interface DeactivateShipToResponse {
  shipTo: ShipToDto;
}

// =============================================================================
// Activate ShipTo
// =============================================================================

export interface ActivateShipToRequest {
  version: number;
}

export interface ActivateShipToResponse {
  shipTo: ShipToDto;
}
