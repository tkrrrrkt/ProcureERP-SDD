/**
 * BFF Contracts: Tax Code
 *
 * UI <-> BFF の契約定義
 * SSoT: packages/contracts/src/bff/tax-code
 */

// =============================================================================
// Enums
// =============================================================================

export const TaxInOut = {
  /** 内税 */
  INCLUSIVE: 'INCLUSIVE',
  /** 外税 */
  EXCLUSIVE: 'EXCLUSIVE',
} as const;

export type TaxInOut = (typeof TaxInOut)[keyof typeof TaxInOut];

// =============================================================================
// Sort Options
// =============================================================================

export type TaxCodeSortBy =
  | 'taxCode'
  | 'taxBusinessCategoryName'
  | 'ratePercent'
  | 'taxInOut'
  | 'isActive';

export type SortOrder = 'asc' | 'desc';

// =============================================================================
// TaxCodeDto
// =============================================================================

export interface TaxCodeDto {
  id: string;
  taxCode: string;
  taxBusinessCategoryId: string;
  taxBusinessCategoryCode: string;
  taxBusinessCategoryName: string;
  taxRateId: string;
  taxRateCode: string;
  ratePercent: string; // Decimal as string (e.g., "10.00")
  taxInOut: TaxInOut;
  isActive: boolean;
  version: number;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  createdBy: string | null; // login_account_id
  updatedBy: string | null; // login_account_id
}

// =============================================================================
// TaxBusinessCategoryDto (for dropdown)
// =============================================================================

export interface TaxBusinessCategoryDto {
  id: string;
  taxBusinessCategoryCode: string;
  taxBusinessCategoryName: string;
}

// =============================================================================
// TaxRateForDropdownDto (for dropdown)
// =============================================================================

export interface TaxRateForDropdownDto {
  id: string;
  taxRateCode: string;
  ratePercent: string; // Decimal as string (e.g., "10.00")
  validFrom: string; // ISO 8601 date
  validTo: string | null;
}

// =============================================================================
// List Tax Codes
// =============================================================================

export interface ListTaxCodesRequest {
  page?: number; // 1-based, default: 1
  pageSize?: number; // default: 20, max: 200
  sortBy?: TaxCodeSortBy; // default: 'taxCode'
  sortOrder?: SortOrder; // default: 'asc'
  keyword?: string; // partial match on taxCode
  taxBusinessCategoryId?: string; // filter by tax business category
  isActive?: boolean; // filter by active status
}

export interface ListTaxCodesResponse {
  items: TaxCodeDto[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// =============================================================================
// Get Tax Code
// =============================================================================

export interface GetTaxCodeResponse {
  taxCode: TaxCodeDto;
}

// =============================================================================
// Create Tax Code
// =============================================================================

export interface CreateTaxCodeRequest {
  taxCode: string;
  taxBusinessCategoryId: string;
  taxRateId: string;
  taxInOut: TaxInOut;
  isActive?: boolean; // default: true
}

export interface CreateTaxCodeResponse {
  taxCode: TaxCodeDto;
}

// =============================================================================
// Update Tax Code
// =============================================================================

// Note: taxCode, taxBusinessCategoryId, taxRateId, taxInOut are NOT updatable
export interface UpdateTaxCodeRequest {
  isActive: boolean;
  version: number; // optimistic lock
}

export interface UpdateTaxCodeResponse {
  taxCode: TaxCodeDto;
}

// =============================================================================
// Deactivate Tax Code
// =============================================================================

export interface DeactivateTaxCodeRequest {
  version: number; // optimistic lock
}

export interface DeactivateTaxCodeResponse {
  taxCode: TaxCodeDto;
}

// =============================================================================
// Activate Tax Code
// =============================================================================

export interface ActivateTaxCodeRequest {
  version: number; // optimistic lock
}

export interface ActivateTaxCodeResponse {
  taxCode: TaxCodeDto;
}

// =============================================================================
// List Tax Business Categories (for dropdown)
// =============================================================================

export interface ListTaxBusinessCategoriesResponse {
  items: TaxBusinessCategoryDto[];
}

// =============================================================================
// List Tax Rates for Dropdown
// =============================================================================

export interface ListTaxRatesForDropdownResponse {
  items: TaxRateForDropdownDto[];
}
