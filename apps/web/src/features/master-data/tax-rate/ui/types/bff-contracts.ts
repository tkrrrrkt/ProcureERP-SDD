// BFF DTO types - re-exported from @contracts/bff/tax-rate
// This file maps the shared contracts to the local feature
export type {
  SortOrder,
  TaxRateSortBy,
  TaxRateDto,
  ListTaxRatesRequest,
  ListTaxRatesResponse,
  GetTaxRateResponse,
  CreateTaxRateRequest,
  CreateTaxRateResponse,
  UpdateTaxRateRequest,
  UpdateTaxRateResponse,
  DeactivateTaxRateRequest,
  DeactivateTaxRateResponse,
  ActivateTaxRateRequest,
  ActivateTaxRateResponse,
} from "@contracts/bff/tax-rate"

export type {
  TaxRateErrorCode,
} from "@contracts/bff/errors/tax-rate-error"

// =============================================================================
// Error Types
// =============================================================================

export interface BffError {
  code: string
  message: string
  field?: string
}
