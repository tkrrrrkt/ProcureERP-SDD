import type { BffClient } from "./BffClient"
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

/**
 * HTTP BFF Client
 *
 * 実際の BFF API を呼び出すクライアント
 */
export class HttpBffClient implements BffClient {
  private readonly baseUrl: string

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || "/api/bff/master-data/tax-rate"
  }

  async listTaxRates(request: ListTaxRatesRequest): Promise<ListTaxRatesResponse> {
    const params = new URLSearchParams()
    if (request.page) params.set("page", String(request.page))
    if (request.pageSize) params.set("pageSize", String(request.pageSize))
    if (request.sortBy) params.set("sortBy", request.sortBy)
    if (request.sortOrder) params.set("sortOrder", request.sortOrder)
    if (request.keyword) params.set("keyword", request.keyword)
    if (request.isActive !== undefined) params.set("isActive", String(request.isActive))

    const url = `${this.baseUrl}?${params.toString()}`
    const response = await fetch(url)
    return this.handleResponse<ListTaxRatesResponse>(response)
  }

  async getTaxRate(id: string): Promise<GetTaxRateResponse> {
    const url = `${this.baseUrl}/${id}`
    const response = await fetch(url)
    return this.handleResponse<GetTaxRateResponse>(response)
  }

  async createTaxRate(request: CreateTaxRateRequest): Promise<CreateTaxRateResponse> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    })
    return this.handleResponse<CreateTaxRateResponse>(response)
  }

  async updateTaxRate(id: string, request: UpdateTaxRateRequest): Promise<UpdateTaxRateResponse> {
    const url = `${this.baseUrl}/${id}`
    const response = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    })
    return this.handleResponse<UpdateTaxRateResponse>(response)
  }

  async deactivateTaxRate(id: string, request: DeactivateTaxRateRequest): Promise<DeactivateTaxRateResponse> {
    const url = `${this.baseUrl}/${id}/deactivate`
    const response = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    })
    return this.handleResponse<DeactivateTaxRateResponse>(response)
  }

  async activateTaxRate(id: string, request: ActivateTaxRateRequest): Promise<ActivateTaxRateResponse> {
    const url = `${this.baseUrl}/${id}/activate`
    const response = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    })
    return this.handleResponse<ActivateTaxRateResponse>(response)
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}))
      const errorCode = errorBody.code || "UNKNOWN_ERROR"
      throw new Error(errorCode)
    }
    return response.json()
  }
}
