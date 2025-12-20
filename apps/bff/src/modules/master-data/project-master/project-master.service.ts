// master-data/project-master BFF service
// FR-LIST-10, FR-LIST-11: aggregation/transform + error pass-through
//
// 実装要件:
// - Domain API呼び出し（HTTP client経由）
// - ページング/ソート正規化（Mapper経由）
// - エラーのPass-through（意味的な変更禁止）
// - tenant_id/user_idをDomain APIへ伝搬

import { Injectable, Inject } from '@nestjs/common'
import {
  ListProjectMasterRequest as BffListRequest,
  ListProjectMasterResponse as BffListResponse,
  ProjectMasterDetailResponse,
  CreateProjectMasterRequest as BffCreateRequest,
  UpdateProjectMasterRequest as BffUpdateRequest,
} from '@epm/contracts/bff/project-master'

import {
  ListProjectMasterResponse as ApiListResponse,
  ProjectMasterEntity,
} from '@epm/contracts/api/project-master'

import { ProjectMasterMapper } from './mappers/project-master.mapper'

// Domain API Client interface
export interface DomainApiClient {
  list(tenantId: string, userId: string, request: unknown): Promise<ApiListResponse>
  findById(tenantId: string, userId: string, id: string): Promise<ProjectMasterEntity>
  create(tenantId: string, userId: string, request: unknown): Promise<ProjectMasterEntity>
  update(tenantId: string, userId: string, id: string, request: unknown): Promise<ProjectMasterEntity>
  deactivate(tenantId: string, userId: string, id: string, ifMatchVersion: number): Promise<ProjectMasterEntity>
  reactivate(tenantId: string, userId: string, id: string, ifMatchVersion: number): Promise<ProjectMasterEntity>
}

export const DOMAIN_API_CLIENT = 'DOMAIN_API_CLIENT'

@Injectable()
export class ProjectMasterBffService {
  constructor(
    @Inject(DOMAIN_API_CLIENT) private readonly apiClient: DomainApiClient
  ) {}

  /**
   * 一覧検索
   * FR-LIST-01, FR-LIST-10
   */
  async list(
    tenantId: string,
    userId: string,
    request: BffListRequest
  ): Promise<BffListResponse> {
    // 1. ページング情報を計算
    const { page, pageSize } = ProjectMasterMapper.calculatePaging(request)

    // 2. BFF → API リクエスト変換
    const apiRequest = ProjectMasterMapper.toApiListRequest(request)

    // 3. Domain API呼び出し（エラーはPass-through）
    const apiResponse = await this.apiClient.list(tenantId, userId, apiRequest)

    // 4. API → BFF レスポンス変換
    return ProjectMasterMapper.toBffListResponse(apiResponse, page, pageSize)
  }

  /**
   * 詳細取得
   * FR-LIST-02
   */
  async findById(
    tenantId: string,
    userId: string,
    id: string
  ): Promise<ProjectMasterDetailResponse> {
    // Domain API呼び出し（エラーはPass-through）
    const entity = await this.apiClient.findById(tenantId, userId, id)

    // API → BFF レスポンス変換
    return ProjectMasterMapper.toBffDetailResponse(entity)
  }

  /**
   * 作成
   * FR-LIST-03
   */
  async create(
    tenantId: string,
    userId: string,
    request: BffCreateRequest
  ): Promise<ProjectMasterDetailResponse> {
    // BFF → API リクエスト変換
    const apiRequest = ProjectMasterMapper.toApiCreateRequest(request)

    // Domain API呼び出し（エラーはPass-through）
    const entity = await this.apiClient.create(tenantId, userId, apiRequest)

    // API → BFF レスポンス変換
    return ProjectMasterMapper.toBffDetailResponse(entity)
  }

  /**
   * 更新
   * FR-LIST-04
   */
  async update(
    tenantId: string,
    userId: string,
    id: string,
    request: BffUpdateRequest
  ): Promise<ProjectMasterDetailResponse> {
    // BFF → API リクエスト変換
    const apiRequest = ProjectMasterMapper.toApiUpdateRequest(request)

    // Domain API呼び出し（エラーはPass-through）
    const entity = await this.apiClient.update(tenantId, userId, id, apiRequest)

    // API → BFF レスポンス変換
    return ProjectMasterMapper.toBffDetailResponse(entity)
  }

  /**
   * 無効化
   * FR-LIST-05
   */
  async deactivate(
    tenantId: string,
    userId: string,
    id: string,
    ifMatchVersion: number
  ): Promise<ProjectMasterDetailResponse> {
    // Domain API呼び出し（エラーはPass-through）
    const entity = await this.apiClient.deactivate(tenantId, userId, id, ifMatchVersion)

    // API → BFF レスポンス変換
    return ProjectMasterMapper.toBffDetailResponse(entity)
  }

  /**
   * 再有効化
   * FR-LIST-06
   */
  async reactivate(
    tenantId: string,
    userId: string,
    id: string,
    ifMatchVersion: number
  ): Promise<ProjectMasterDetailResponse> {
    // Domain API呼び出し（エラーはPass-through）
    const entity = await this.apiClient.reactivate(tenantId, userId, id, ifMatchVersion)

    // API → BFF レスポンス変換
    return ProjectMasterMapper.toBffDetailResponse(entity)
  }
}
