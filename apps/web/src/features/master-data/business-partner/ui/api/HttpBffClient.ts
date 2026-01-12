import type { BffClient } from "./BffClient"
import type {
  ListPartiesRequest,
  ListPartiesResponse,
  GetPartyResponse,
  CreatePartyRequest,
  CreatePartyResponse,
  UpdatePartyRequest,
  UpdatePartyResponse,
  ListSupplierSitesRequest,
  ListSupplierSitesResponse,
  GetSupplierSiteResponse,
  CreateSupplierSiteRequest,
  CreateSupplierSiteResponse,
  UpdateSupplierSiteRequest,
  UpdateSupplierSiteResponse,
  ListPayeesRequest,
  ListPayeesResponse,
  GetPayeeResponse,
  CreatePayeeRequest,
  CreatePayeeResponse,
  UpdatePayeeRequest,
  UpdatePayeeResponse,
} from "../types/bff-contracts"

// TODO: Use environment variable or config for BFF base URL
const BFF_BASE_URL = process.env.NEXT_PUBLIC_BFF_URL || "/api/bff/master-data/business-partner"

export class HttpBffClient implements BffClient {
  private async request<T>(method: string, path: string, body?: any, params?: Record<string, any>): Promise<T> {
    const url = new URL(`${BFF_BASE_URL}${path}`, window.location.origin)

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value))
        }
      })
    }

    const options: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    }

    if (body) {
      options.body = JSON.stringify(body)
    }

    const response = await fetch(url.toString(), options)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.code || "UNKNOWN_ERROR")
    }

    if (response.status === 204) {
      return undefined as T
    }

    return response.json()
  }

  async listParties(request: ListPartiesRequest): Promise<ListPartiesResponse> {
    return this.request<ListPartiesResponse>("GET", "/parties", undefined, request)
  }

  async getParty(id: string): Promise<GetPartyResponse> {
    return this.request<GetPartyResponse>("GET", `/parties/${id}`)
  }

  async createParty(request: CreatePartyRequest): Promise<CreatePartyResponse> {
    return this.request<CreatePartyResponse>("POST", "/parties", request)
  }

  async updateParty(id: string, request: UpdatePartyRequest): Promise<UpdatePartyResponse> {
    return this.request<UpdatePartyResponse>("PUT", `/parties/${id}`, request)
  }

  async listSupplierSites(request: ListSupplierSitesRequest): Promise<ListSupplierSitesResponse> {
    return this.request<ListSupplierSitesResponse>("GET", "/supplier-sites", undefined, request)
  }

  async getSupplierSite(id: string): Promise<GetSupplierSiteResponse> {
    return this.request<GetSupplierSiteResponse>("GET", `/supplier-sites/${id}`)
  }

  async createSupplierSite(request: CreateSupplierSiteRequest): Promise<CreateSupplierSiteResponse> {
    return this.request<CreateSupplierSiteResponse>("POST", "/supplier-sites", request)
  }

  async updateSupplierSite(id: string, request: UpdateSupplierSiteRequest): Promise<UpdateSupplierSiteResponse> {
    return this.request<UpdateSupplierSiteResponse>("PUT", `/supplier-sites/${id}`, request)
  }

  async deleteSupplierSite(id: string): Promise<void> {
    return this.request<void>("DELETE", `/supplier-sites/${id}`)
  }

  async listPayees(request: ListPayeesRequest): Promise<ListPayeesResponse> {
    return this.request<ListPayeesResponse>("GET", "/payees", undefined, request)
  }

  async getPayee(id: string): Promise<GetPayeeResponse> {
    return this.request<GetPayeeResponse>("GET", `/payees/${id}`)
  }

  async createPayee(request: CreatePayeeRequest): Promise<CreatePayeeResponse> {
    return this.request<CreatePayeeResponse>("POST", "/payees", request)
  }

  async updatePayee(id: string, request: UpdatePayeeRequest): Promise<UpdatePayeeResponse> {
    return this.request<UpdatePayeeResponse>("PUT", `/payees/${id}`, request)
  }
}
