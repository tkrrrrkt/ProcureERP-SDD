import { Injectable } from '@nestjs/common'
import {
  ListEmployeeMasterResponse as ApiListResponse,
  EmployeeMasterEntity,
} from '@epm/contracts/api/employee-master'
import { DomainApiClient } from './employee-master.service'

/**
 * HTTP Client for Domain API
 * Calls the Domain API (apps/api) over HTTP
 */
@Injectable()
export class DomainApiHttpClient implements DomainApiClient {
  private readonly baseUrl: string

  constructor() {
    this.baseUrl = process.env.DOMAIN_API_URL || 'http://localhost:3002'
  }

  async list(tenantId: string, userId: string, request: unknown): Promise<ApiListResponse> {
    const params = request as Record<string, unknown>
    const queryParams = new URLSearchParams()

    if (params.offset !== undefined) queryParams.append('offset', String(params.offset))
    if (params.limit !== undefined) queryParams.append('limit', String(params.limit))
    if (params.sortBy) queryParams.append('sortBy', String(params.sortBy))
    if (params.sortOrder) queryParams.append('sortOrder', String(params.sortOrder))
    if (params.employeeCode) queryParams.append('employeeCode', String(params.employeeCode))
    if (params.employeeName) queryParams.append('employeeName', String(params.employeeName))
    if (params.includeInactive) queryParams.append('includeInactive', String(params.includeInactive))

    const response = await fetch(
      `${this.baseUrl}/api/master-data/employee-master?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': tenantId,
          'x-user-id': userId,
        },
      }
    )

    if (!response.ok) {
      throw await this.handleError(response)
    }

    return response.json()
  }

  async findById(tenantId: string, userId: string, id: string): Promise<EmployeeMasterEntity> {
    const response = await fetch(
      `${this.baseUrl}/api/master-data/employee-master/${id}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': tenantId,
          'x-user-id': userId,
        },
      }
    )

    if (!response.ok) {
      throw await this.handleError(response)
    }

    return response.json()
  }

  async create(tenantId: string, userId: string, request: unknown): Promise<EmployeeMasterEntity> {
    const response = await fetch(
      `${this.baseUrl}/api/master-data/employee-master`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': tenantId,
          'x-user-id': userId,
        },
        body: JSON.stringify(request),
      }
    )

    if (!response.ok) {
      throw await this.handleError(response)
    }

    return response.json()
  }

  async update(tenantId: string, userId: string, id: string, request: unknown): Promise<EmployeeMasterEntity> {
    const response = await fetch(
      `${this.baseUrl}/api/master-data/employee-master/${id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': tenantId,
          'x-user-id': userId,
        },
        body: JSON.stringify(request),
      }
    )

    if (!response.ok) {
      throw await this.handleError(response)
    }

    return response.json()
  }

  async deactivate(tenantId: string, userId: string, id: string): Promise<EmployeeMasterEntity> {
    const response = await fetch(
      `${this.baseUrl}/api/master-data/employee-master/${id}/deactivate`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': tenantId,
          'x-user-id': userId,
        },
      }
    )

    if (!response.ok) {
      throw await this.handleError(response)
    }

    return response.json()
  }

  async reactivate(tenantId: string, userId: string, id: string): Promise<EmployeeMasterEntity> {
    const response = await fetch(
      `${this.baseUrl}/api/master-data/employee-master/${id}/reactivate`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': tenantId,
          'x-user-id': userId,
        },
      }
    )

    if (!response.ok) {
      throw await this.handleError(response)
    }

    return response.json()
  }

  private async handleError(response: Response): Promise<Error> {
    let errorBody: Record<string, unknown>

    try {
      errorBody = await response.json()
    } catch {
      errorBody = { message: response.statusText }
    }

    return {
      name: 'DomainApiError',
      message: String(errorBody.message || 'Unknown error'),
      ...errorBody,
    } as Error
  }
}
