import type { BffClient } from "./BffClient"
import type {
  ListEmployeeMasterRequest,
  ListEmployeeMasterResponse,
  EmployeeMasterDetailResponse,
  CreateEmployeeMasterRequest,
  UpdateEmployeeMasterRequest,
} from "@contracts/bff/employee-master"

/**
 * HTTP BFF Client
 *
 * Implements real BFF API calls using fetch.
 * Ready to use when BFF endpoints are deployed.
 */
export class HttpBffClient implements BffClient {
  private baseUrl = "/api/bff/master-data/employee-master"

  private async fetch<T>(url: string, options?: RequestInit): Promise<T> {
    // TODO: 本番では認証情報から取得
    const tenantId = "tenant-001"
    const userId = "user-001"

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "x-tenant-id": tenantId,
        "x-user-id": userId,
        ...options?.headers,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`${response.status}: ${errorText}`)
    }

    return response.json()
  }

  async list(params: ListEmployeeMasterRequest): Promise<ListEmployeeMasterResponse> {
    const searchParams = new URLSearchParams()

    if (params.page) searchParams.set("page", params.page.toString())
    if (params.pageSize) searchParams.set("pageSize", params.pageSize.toString())
    if (params.sortBy) searchParams.set("sortBy", params.sortBy)
    if (params.sortOrder) searchParams.set("sortOrder", params.sortOrder)
    if (params.employeeCode) searchParams.set("employeeCode", params.employeeCode)
    if (params.employeeName) searchParams.set("employeeName", params.employeeName)
    if (params.includeInactive) searchParams.set("includeInactive", "true")

    const url = `${this.baseUrl}?${searchParams.toString()}`
    return this.fetch<ListEmployeeMasterResponse>(url)
  }

  async findById(id: string): Promise<EmployeeMasterDetailResponse> {
    return this.fetch<EmployeeMasterDetailResponse>(`${this.baseUrl}/${id}`)
  }

  async create(data: CreateEmployeeMasterRequest): Promise<EmployeeMasterDetailResponse> {
    return this.fetch<EmployeeMasterDetailResponse>(this.baseUrl, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async update(id: string, data: UpdateEmployeeMasterRequest): Promise<EmployeeMasterDetailResponse> {
    return this.fetch<EmployeeMasterDetailResponse>(`${this.baseUrl}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  async deactivate(id: string): Promise<EmployeeMasterDetailResponse> {
    return this.fetch<EmployeeMasterDetailResponse>(`${this.baseUrl}/${id}/deactivate`, {
      method: "POST",
    })
  }

  async reactivate(id: string): Promise<EmployeeMasterDetailResponse> {
    return this.fetch<EmployeeMasterDetailResponse>(`${this.baseUrl}/${id}/reactivate`, {
      method: "POST",
    })
  }
}
