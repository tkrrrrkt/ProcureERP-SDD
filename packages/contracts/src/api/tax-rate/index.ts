/**
 * API Contracts: Tax Rate
 *
 * BFF <-> Domain API の契約定義
 * SSoT: packages/contracts/src/api/tax-rate
 */

// =============================================================================
// Sort Options
// =============================================================================

export type TaxRateSortBy =
  | 'taxRateCode'
  | 'ratePercent'
  | 'validFrom'
  | 'isActive';

export type SortOrder = 'asc' | 'desc';

// =============================================================================
// TaxRateApiDto
// =============================================================================

export interface TaxRateApiDto {
  id: string;
  taxRateCode: string;
  ratePercent: string; // Decimal as string (e.g., "10.00")
  validFrom: string; // ISO 8601 date
  validTo: string | null;
  isActive: boolean;
  version: number;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  createdBy: string | null; // login_account_id
  updatedBy: string | null; // login_account_id
}

// =============================================================================
// List Tax Rates
// =============================================================================

export interface ListTaxRatesApiRequest {
  offset: number; // 0-based
  limit: number;
  sortBy?: TaxRateSortBy; // default: 'taxRateCode'
  sortOrder?: SortOrder; // default: 'asc'
  keyword?: string; // partial match on taxRateCode
  isActive?: boolean; // filter by active status
}

export interface ListTaxRatesApiResponse {
  items: TaxRateApiDto[];
  total: number;
}

// =============================================================================
// Get Tax Rate
// =============================================================================

export interface GetTaxRateApiResponse {
  taxRate: TaxRateApiDto;
}

// =============================================================================
// Create Tax Rate
// =============================================================================

export interface CreateTaxRateApiRequest {
  taxRateCode: string;
  ratePercent: string; // Decimal as string (e.g., "10.00")
  validFrom: string; // ISO 8601 date
  validTo?: string; // ISO 8601 date, optional
  isActive?: boolean; // default: true
}

export interface CreateTaxRateApiResponse {
  taxRate: TaxRateApiDto;
}

// =============================================================================
// Update Tax Rate
// =============================================================================

// Note: taxRateCode and ratePercent are NOT updatable
export interface UpdateTaxRateApiRequest {
  validFrom: string; // ISO 8601 date
  validTo?: string; // ISO 8601 date, optional
  isActive: boolean;
  version: number; // optimistic lock
}

export interface UpdateTaxRateApiResponse {
  taxRate: TaxRateApiDto;
}

// =============================================================================
// Deactivate Tax Rate
// =============================================================================

export interface DeactivateTaxRateApiRequest {
  version: number; // optimistic lock
}

export interface DeactivateTaxRateApiResponse {
  taxRate: TaxRateApiDto;
}

// =============================================================================
// Activate Tax Rate
// =============================================================================

export interface ActivateTaxRateApiRequest {
  version: number; // optimistic lock
}

export interface ActivateTaxRateApiResponse {
  taxRate: TaxRateApiDto;
}
