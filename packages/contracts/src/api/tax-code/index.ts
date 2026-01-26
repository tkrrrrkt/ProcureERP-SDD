/**
 * API Contracts: Tax Code
 *
 * BFF <-> Domain API の契約定義
 * SSoT: packages/contracts/src/api/tax-code
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
// TaxCodeApiDto
// =============================================================================

export interface TaxCodeApiDto {
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
// TaxBusinessCategoryApiDto (for dropdown)
// =============================================================================

export interface TaxBusinessCategoryApiDto {
  id: string;
  taxBusinessCategoryCode: string;
  taxBusinessCategoryName: string;
}

// =============================================================================
// TaxRateForDropdownApiDto (for dropdown)
// =============================================================================

export interface TaxRateForDropdownApiDto {
  id: string;
  taxRateCode: string;
  ratePercent: string; // Decimal as string (e.g., "10.00")
  validFrom: string; // ISO 8601 date
  validTo: string | null;
}

// =============================================================================
// List Tax Codes
// =============================================================================

export interface ListTaxCodesApiRequest {
  offset: number; // 0-based
  limit: number;
  sortBy?: TaxCodeSortBy; // default: 'taxCode'
  sortOrder?: SortOrder; // default: 'asc'
  keyword?: string; // partial match on taxCode
  taxBusinessCategoryId?: string; // filter by tax business category
  isActive?: boolean; // filter by active status
}

export interface ListTaxCodesApiResponse {
  items: TaxCodeApiDto[];
  total: number;
}

// =============================================================================
// Get Tax Code
// =============================================================================

export interface GetTaxCodeApiResponse {
  taxCode: TaxCodeApiDto;
}

// =============================================================================
// Create Tax Code
// =============================================================================

export interface CreateTaxCodeApiRequest {
  taxCode: string;
  taxBusinessCategoryId: string;
  taxRateId: string;
  taxInOut: TaxInOut;
  isActive?: boolean; // default: true
}

export interface CreateTaxCodeApiResponse {
  taxCode: TaxCodeApiDto;
}

// =============================================================================
// Update Tax Code
// =============================================================================

// Note: taxCode, taxBusinessCategoryId, taxRateId, taxInOut are NOT updatable
export interface UpdateTaxCodeApiRequest {
  isActive: boolean;
  version: number; // optimistic lock
}

export interface UpdateTaxCodeApiResponse {
  taxCode: TaxCodeApiDto;
}

// =============================================================================
// Deactivate Tax Code
// =============================================================================

export interface DeactivateTaxCodeApiRequest {
  version: number; // optimistic lock
}

export interface DeactivateTaxCodeApiResponse {
  taxCode: TaxCodeApiDto;
}

// =============================================================================
// Activate Tax Code
// =============================================================================

export interface ActivateTaxCodeApiRequest {
  version: number; // optimistic lock
}

export interface ActivateTaxCodeApiResponse {
  taxCode: TaxCodeApiDto;
}

// =============================================================================
// List Tax Business Categories (for dropdown)
// =============================================================================

export interface ListTaxBusinessCategoriesApiResponse {
  items: TaxBusinessCategoryApiDto[];
}

// =============================================================================
// List Tax Rates for Dropdown
// =============================================================================

export interface ListTaxRatesForDropdownApiResponse {
  items: TaxRateForDropdownApiDto[];
}
