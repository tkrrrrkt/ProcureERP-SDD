/**
 * HttpBffClient - Organization Master
 *
 * 本番用のHTTP実装
 * BFFエンドポイントに接続してデータを取得・更新
 */

import type { BffClient } from './BffClient';
import type {
  ListVersionsRequest,
  ListVersionsResponse,
  GetVersionResponse,
  CreateVersionRequest,
  CreateVersionResponse,
  CopyVersionRequest,
  CopyVersionResponse,
  UpdateVersionRequest,
  UpdateVersionResponse,
  AsOfSearchRequest,
  AsOfSearchResponse,
  ListDepartmentsTreeRequest,
  ListDepartmentsTreeResponse,
  GetDepartmentResponse,
  CreateDepartmentRequest,
  CreateDepartmentResponse,
  UpdateDepartmentRequest,
  UpdateDepartmentResponse,
  MoveDepartmentRequest,
  MoveDepartmentResponse,
  DeactivateDepartmentResponse,
  ReactivateDepartmentResponse,
} from '@contracts/bff/organization-master';
import type { BffError } from '../lib/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_BFF_API_URL ?? '/api';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = (await response.json()) as BffError;
    throw error;
  }
  return response.json();
}

export class HttpBffClient implements BffClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  // ===========================================================================
  // Version Operations
  // ===========================================================================

  async listVersions(
    request: ListVersionsRequest
  ): Promise<ListVersionsResponse> {
    const params = new URLSearchParams();
    if (request.sortBy) params.set('sortBy', request.sortBy);
    if (request.sortOrder) params.set('sortOrder', request.sortOrder);

    const response = await fetch(
      `${this.baseUrl}/organization-master/versions?${params.toString()}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    return handleResponse<ListVersionsResponse>(response);
  }

  async getVersion(versionId: string): Promise<GetVersionResponse> {
    const response = await fetch(
      `${this.baseUrl}/organization-master/versions/${versionId}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    return handleResponse<GetVersionResponse>(response);
  }

  async createVersion(
    request: CreateVersionRequest
  ): Promise<CreateVersionResponse> {
    const response = await fetch(
      `${this.baseUrl}/organization-master/versions`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      }
    );

    return handleResponse<CreateVersionResponse>(response);
  }

  async copyVersion(
    sourceVersionId: string,
    request: CopyVersionRequest
  ): Promise<CopyVersionResponse> {
    const response = await fetch(
      `${this.baseUrl}/organization-master/versions/${sourceVersionId}/copy`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      }
    );

    return handleResponse<CopyVersionResponse>(response);
  }

  async updateVersion(
    versionId: string,
    request: UpdateVersionRequest
  ): Promise<UpdateVersionResponse> {
    const response = await fetch(
      `${this.baseUrl}/organization-master/versions/${versionId}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      }
    );

    return handleResponse<UpdateVersionResponse>(response);
  }

  async findEffectiveAsOf(
    request: AsOfSearchRequest
  ): Promise<AsOfSearchResponse> {
    const params = new URLSearchParams();
    params.set('asOfDate', request.asOfDate);

    const response = await fetch(
      `${this.baseUrl}/organization-master/versions/as-of?${params.toString()}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    return handleResponse<AsOfSearchResponse>(response);
  }

  // ===========================================================================
  // Department Operations
  // ===========================================================================

  async listDepartmentsTree(
    versionId: string,
    request: ListDepartmentsTreeRequest
  ): Promise<ListDepartmentsTreeResponse> {
    const params = new URLSearchParams();
    if (request.keyword) params.set('keyword', request.keyword);
    if (request.isActive !== undefined) {
      params.set('isActive', String(request.isActive));
    }

    const response = await fetch(
      `${this.baseUrl}/organization-master/versions/${versionId}/departments?${params.toString()}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    return handleResponse<ListDepartmentsTreeResponse>(response);
  }

  async getDepartment(departmentId: string): Promise<GetDepartmentResponse> {
    const response = await fetch(
      `${this.baseUrl}/organization-master/departments/${departmentId}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    return handleResponse<GetDepartmentResponse>(response);
  }

  async createDepartment(
    versionId: string,
    request: CreateDepartmentRequest
  ): Promise<CreateDepartmentResponse> {
    const response = await fetch(
      `${this.baseUrl}/organization-master/versions/${versionId}/departments`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      }
    );

    return handleResponse<CreateDepartmentResponse>(response);
  }

  async updateDepartment(
    departmentId: string,
    request: UpdateDepartmentRequest
  ): Promise<UpdateDepartmentResponse> {
    const response = await fetch(
      `${this.baseUrl}/organization-master/departments/${departmentId}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      }
    );

    return handleResponse<UpdateDepartmentResponse>(response);
  }

  async moveDepartment(
    departmentId: string,
    request: MoveDepartmentRequest
  ): Promise<MoveDepartmentResponse> {
    const response = await fetch(
      `${this.baseUrl}/organization-master/departments/${departmentId}/move`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      }
    );

    return handleResponse<MoveDepartmentResponse>(response);
  }

  async deactivateDepartment(
    departmentId: string
  ): Promise<DeactivateDepartmentResponse> {
    const response = await fetch(
      `${this.baseUrl}/organization-master/departments/${departmentId}/deactivate`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    return handleResponse<DeactivateDepartmentResponse>(response);
  }

  async reactivateDepartment(
    departmentId: string
  ): Promise<ReactivateDepartmentResponse> {
    const response = await fetch(
      `${this.baseUrl}/organization-master/departments/${departmentId}/reactivate`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    return handleResponse<ReactivateDepartmentResponse>(response);
  }
}
