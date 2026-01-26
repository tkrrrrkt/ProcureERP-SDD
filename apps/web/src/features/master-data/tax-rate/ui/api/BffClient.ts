import type {
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
} from "../types/bff-contracts"

export interface BffClient {
  // Tax Rate endpoints
  listTaxRates(request: ListTaxRatesRequest): Promise<ListTaxRatesResponse>
  getTaxRate(id: string): Promise<GetTaxRateResponse>
  createTaxRate(request: CreateTaxRateRequest): Promise<CreateTaxRateResponse>
  updateTaxRate(id: string, request: UpdateTaxRateRequest): Promise<UpdateTaxRateResponse>
  deactivateTaxRate(id: string, request: DeactivateTaxRateRequest): Promise<DeactivateTaxRateResponse>
  activateTaxRate(id: string, request: ActivateTaxRateRequest): Promise<ActivateTaxRateResponse>
}
