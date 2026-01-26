/**
 * BFF Contracts: Tax Rate
 *
 * UI <-> BFF の契約定義
 * SSoT: packages/contracts/src/bff/tax-rate
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
// TaxRateDto
// =============================================================================

export interface TaxRateDto {
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

export interface ListTaxRatesRequest {
  page?: number; // 1-based, default: 1
  pageSize?: number; // default: 20, max: 200
  sortBy?: TaxRateSortBy; // default: 'taxRateCode'
  sortOrder?: SortOrder; // default: 'asc'
  keyword?: string; // partial match on taxRateCode
  isActive?: boolean; // filter by active status
}

export interface ListTaxRatesResponse {
  items: TaxRateDto[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// =============================================================================
// Get Tax Rate
// =============================================================================

export interface GetTaxRateResponse {
  taxRate: TaxRateDto;
}

// =============================================================================
// Create Tax Rate
// =============================================================================

export interface CreateTaxRateRequest {
  taxRateCode: string;
  ratePercent: string; // Decimal as string (e.g., "10.00")
  validFrom: string; // ISO 8601 date
  validTo?: string; // ISO 8601 date, optional
  isActive?: boolean; // default: true
}

export interface CreateTaxRateResponse {
  taxRate: TaxRateDto;
}

// =============================================================================
// Update Tax Rate
// =============================================================================

// Note: taxRateCode and ratePercent are NOT updatable
export interface UpdateTaxRateRequest {
  validFrom: string; // ISO 8601 date
  validTo?: string; // ISO 8601 date, optional
  isActive: boolean;
  version: number; // optimistic lock
}

export interface UpdateTaxRateResponse {
  taxRate: TaxRateDto;
}

// =============================================================================
// Deactivate Tax Rate
// =============================================================================

export interface DeactivateTaxRateRequest {
  version: number; // optimistic lock
}

export interface DeactivateTaxRateResponse {
  taxRate: TaxRateDto;
}

// =============================================================================
// Activate Tax Rate
// =============================================================================

export interface ActivateTaxRateRequest {
  version: number; // optimistic lock
}

export interface ActivateTaxRateResponse {
  taxRate: TaxRateDto;
}
