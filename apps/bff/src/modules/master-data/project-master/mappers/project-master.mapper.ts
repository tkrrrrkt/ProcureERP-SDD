// api DTO -> bff DTO mapper for master-data/project-master
// FR-LIST-10: ページング/ソート正規化
//
// 実装要件:
// - page/pageSize → offset/limit変換: offset=(page-1)*pageSize, limit=pageSize
// - sortByはDTOキー（camelCase）のままDomain APIへ渡す
// - BFFレスポンスにpage/pageSize/totalCountを含める
// - wire-format（ISO 8601 string、decimal string）はそのまま伝達

import {
  ListProjectMasterRequest as BffListRequest,
  ListProjectMasterResponse as BffListResponse,
  ProjectMasterListItem,
  ProjectMasterDetailResponse,
  CreateProjectMasterRequest as BffCreateRequest,
  UpdateProjectMasterRequest as BffUpdateRequest,
} from '@epm/contracts/bff/project-master'

import {
  ListProjectMasterRequest as ApiListRequest,
  ListProjectMasterResponse as ApiListResponse,
  ProjectMasterEntity,
  CreateProjectMasterRequest as ApiCreateRequest,
  UpdateProjectMasterRequest as ApiUpdateRequest,
} from '@epm/contracts/api/project-master'

// デフォルト値
const DEFAULT_PAGE = 1
const DEFAULT_PAGE_SIZE = 50
const MAX_PAGE_SIZE = 200
const DEFAULT_SORT_BY = 'projectCode' as const
const DEFAULT_SORT_ORDER = 'asc' as const

// sortBy whitelist
const VALID_SORT_BY = ['projectCode', 'projectName', 'projectShortName', 'plannedPeriodFrom', 'budgetAmount'] as const
type ValidSortBy = typeof VALID_SORT_BY[number]

function isValidSortBy(value: string): value is ValidSortBy {
  return VALID_SORT_BY.includes(value as ValidSortBy)
}

export const ProjectMasterMapper = {
  /**
   * BFF ListRequest → API ListRequest変換
   * page/pageSize → offset/limit
   */
  toApiListRequest(bffRequest: BffListRequest): ApiListRequest {
    const page = Math.max(bffRequest.page ?? DEFAULT_PAGE, 1)
    const pageSize = Math.min(Math.max(bffRequest.pageSize ?? DEFAULT_PAGE_SIZE, 1), MAX_PAGE_SIZE)
    const sortBy = bffRequest.sortBy && isValidSortBy(bffRequest.sortBy)
      ? bffRequest.sortBy
      : DEFAULT_SORT_BY
    const sortOrder = bffRequest.sortOrder ?? DEFAULT_SORT_ORDER

    return {
      offset: (page - 1) * pageSize,
      limit: pageSize,
      sortBy,
      sortOrder,
      projectCode: bffRequest.projectCode?.trim() || undefined,
      projectName: bffRequest.projectName?.trim() || undefined,
      projectShortName: bffRequest.projectShortName?.trim() || undefined,
      departmentCode: bffRequest.departmentCode?.trim() || undefined,
      responsibleEmployeeCode: bffRequest.responsibleEmployeeCode?.trim() || undefined,
      includeInactive: bffRequest.includeInactive,
    }
  },

  /**
   * API ListResponse → BFF ListResponse変換
   */
  toBffListResponse(
    apiResponse: ApiListResponse,
    page: number,
    pageSize: number
  ): BffListResponse {
    return {
      items: apiResponse.items.map(entity => this.entityToListItem(entity)),
      page,
      pageSize,
      totalCount: apiResponse.totalCount,
    }
  },

  /**
   * API Entity → BFF ListItem変換
   * 一覧表示に必要なフィールドのみ抽出
   */
  entityToListItem(entity: ProjectMasterEntity): ProjectMasterListItem {
    return {
      id: entity.id,
      projectCode: entity.projectCode,
      projectName: entity.projectName,
      projectShortName: entity.projectShortName,
      projectKanaName: entity.projectKanaName,
      departmentCode: entity.departmentCode,
      responsibleEmployeeCode: entity.responsibleEmployeeCode,
      responsibleEmployeeName: entity.responsibleEmployeeName,
      plannedPeriodFrom: entity.plannedPeriodFrom,
      plannedPeriodTo: entity.plannedPeriodTo,
      budgetAmount: entity.budgetAmount,
      isActive: entity.isActive,
    }
  },

  /**
   * API Entity → BFF DetailResponse変換
   */
  toBffDetailResponse(entity: ProjectMasterEntity): ProjectMasterDetailResponse {
    return {
      id: entity.id,
      projectCode: entity.projectCode,
      projectName: entity.projectName,
      projectShortName: entity.projectShortName,
      projectKanaName: entity.projectKanaName,
      departmentCode: entity.departmentCode,
      responsibleEmployeeCode: entity.responsibleEmployeeCode,
      responsibleEmployeeName: entity.responsibleEmployeeName,
      plannedPeriodFrom: entity.plannedPeriodFrom,
      plannedPeriodTo: entity.plannedPeriodTo,
      actualPeriodFrom: entity.actualPeriodFrom,
      actualPeriodTo: entity.actualPeriodTo,
      budgetAmount: entity.budgetAmount,
      version: entity.version,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      createdBy: entity.createdBy,
      updatedBy: entity.updatedBy,
    }
  },

  /**
   * BFF CreateRequest → API CreateRequest変換
   * そのまま伝達（wire-formatは変換不要）
   */
  toApiCreateRequest(bffRequest: BffCreateRequest): ApiCreateRequest {
    return {
      projectCode: bffRequest.projectCode,
      projectName: bffRequest.projectName,
      projectShortName: bffRequest.projectShortName,
      projectKanaName: bffRequest.projectKanaName,
      departmentCode: bffRequest.departmentCode,
      responsibleEmployeeCode: bffRequest.responsibleEmployeeCode,
      responsibleEmployeeName: bffRequest.responsibleEmployeeName,
      plannedPeriodFrom: bffRequest.plannedPeriodFrom,
      plannedPeriodTo: bffRequest.plannedPeriodTo,
      actualPeriodFrom: bffRequest.actualPeriodFrom,
      actualPeriodTo: bffRequest.actualPeriodTo,
      budgetAmount: bffRequest.budgetAmount,
    }
  },

  /**
   * BFF UpdateRequest → API UpdateRequest変換
   * そのまま伝達（wire-formatは変換不要）
   */
  toApiUpdateRequest(bffRequest: BffUpdateRequest): ApiUpdateRequest {
    return {
      ifMatchVersion: bffRequest.ifMatchVersion,
      projectName: bffRequest.projectName,
      projectShortName: bffRequest.projectShortName,
      projectKanaName: bffRequest.projectKanaName,
      departmentCode: bffRequest.departmentCode,
      responsibleEmployeeCode: bffRequest.responsibleEmployeeCode,
      responsibleEmployeeName: bffRequest.responsibleEmployeeName,
      plannedPeriodFrom: bffRequest.plannedPeriodFrom,
      plannedPeriodTo: bffRequest.plannedPeriodTo,
      actualPeriodFrom: bffRequest.actualPeriodFrom,
      actualPeriodTo: bffRequest.actualPeriodTo,
      budgetAmount: bffRequest.budgetAmount,
    }
  },

  /**
   * ページング情報を計算
   */
  calculatePaging(bffRequest: BffListRequest): { page: number; pageSize: number } {
    const page = Math.max(bffRequest.page ?? DEFAULT_PAGE, 1)
    const pageSize = Math.min(Math.max(bffRequest.pageSize ?? DEFAULT_PAGE_SIZE, 1), MAX_PAGE_SIZE)
    return { page, pageSize }
  },
}
