import type { BffClient } from "./BffClient"
import type {
  ListProjectMasterRequest,
  ListProjectMasterResponse,
  ProjectMasterDetailResponse,
  CreateProjectMasterRequest,
  UpdateProjectMasterRequest,
} from "@contracts/bff/project-master"

/**
 * HTTP BFF Client for production use.
 * Calls real BFF endpoints over HTTP.
 */
export class HttpBffClient implements BffClient {
  private baseUrl = "/api/bff/master-data/project-master"

  // TODO: Replace with actual auth context
  private tenantId = "tenant-001"
  private userId = "user-001"

  private getHeaders(): HeadersInit {
    return {
      "Content-Type": "application/json",
      "x-tenant-id": this.tenantId,
      "x-user-id": this.userId,
    }
  }

  async list(params: ListProjectMasterRequest): Promise<ListProjectMasterResponse> {
    const queryParams = new URLSearchParams()

    if (params.page) queryParams.append("page", String(params.page))
    if (params.pageSize) queryParams.append("pageSize", String(params.pageSize))
    if (params.sortBy) queryParams.append("sortBy", params.sortBy)
    if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder)
    if (params.projectCode) queryParams.append("projectCode", params.projectCode)
    if (params.projectName) queryParams.append("projectName", params.projectName)
    if (params.projectShortName) queryParams.append("projectShortName", params.projectShortName)
    if (params.departmentCode) queryParams.append("departmentCode", params.departmentCode)
    if (params.responsibleEmployeeCode) queryParams.append("responsibleEmployeeCode", params.responsibleEmployeeCode)
    if (params.includeInactive) queryParams.append("includeInactive", String(params.includeInactive))

    const response = await fetch(`${this.baseUrl}?${queryParams.toString()}`, {
      method: "GET",
      headers: this.getHeaders(),
    })

    if (!response.ok) {
      throw await this.handleError(response)
    }

    return response.json()
  }

  async findById(id: string): Promise<ProjectMasterDetailResponse> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "GET",
      headers: this.getHeaders(),
    })

    if (!response.ok) {
      throw await this.handleError(response)
    }

    return response.json()
  }

  async create(data: CreateProjectMasterRequest): Promise<ProjectMasterDetailResponse> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw await this.handleError(response)
    }

    return response.json()
  }

  async update(id: string, data: UpdateProjectMasterRequest): Promise<ProjectMasterDetailResponse> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw await this.handleError(response)
    }

    return response.json()
  }

  async deactivate(id: string, ifMatchVersion: number): Promise<ProjectMasterDetailResponse> {
    const response = await fetch(`${this.baseUrl}/${id}/deactivate`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ ifMatchVersion }),
    })

    if (!response.ok) {
      throw await this.handleError(response)
    }

    return response.json()
  }

  async reactivate(id: string, ifMatchVersion: number): Promise<ProjectMasterDetailResponse> {
    const response = await fetch(`${this.baseUrl}/${id}/reactivate`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ ifMatchVersion }),
    })

    if (!response.ok) {
      throw await this.handleError(response)
    }

    return response.json()
  }

  private async handleError(response: Response): Promise<Error> {
    let errorBody: any

    try {
      errorBody = await response.json()
    } catch {
      errorBody = { message: response.statusText }
    }

    return {
      name: "BffError",
      message: errorBody.message || "Unknown error",
      status: response.status,
      code: errorBody.code,
      ...errorBody,
    } as any
  }
}
