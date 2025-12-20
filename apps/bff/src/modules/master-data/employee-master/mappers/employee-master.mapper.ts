// api DTO -> bff DTO mapper for master-data/employee-master
// FR-LIST-10: ページング/ソート正規化
//
// 実装要件:
// - page/pageSize → offset/limit変換: offset=(page-1)*pageSize, limit=pageSize
// - sortByはDTOキー（camelCase）のままDomain APIへ渡す
// - BFFレスポンスにpage/pageSize/totalCountを含める

import {
  ListEmployeeMasterRequest as BffListRequest,
  ListEmployeeMasterResponse as BffListResponse,
  EmployeeMasterListItem,
  EmployeeMasterDetailResponse,
  CreateEmployeeMasterRequest as BffCreateRequest,
  UpdateEmployeeMasterRequest as BffUpdateRequest,
} from '@epm/contracts/bff/employee-master'

import {
  ListEmployeeMasterRequest as ApiListRequest,
  ListEmployeeMasterResponse as ApiListResponse,
  EmployeeMasterEntity,
  CreateEmployeeMasterRequest as ApiCreateRequest,
  UpdateEmployeeMasterRequest as ApiUpdateRequest,
} from '@epm/contracts/api/employee-master'

// デフォルト値
const DEFAULT_PAGE = 1
const DEFAULT_PAGE_SIZE = 50
const MAX_PAGE_SIZE = 200
const DEFAULT_SORT_BY = 'employeeCode' as const
const DEFAULT_SORT_ORDER = 'asc' as const

// sortBy whitelist
const VALID_SORT_BY = ['employeeCode', 'employeeName'] as const
type ValidSortBy = typeof VALID_SORT_BY[number]

function isValidSortBy(value: string): value is ValidSortBy {
  return VALID_SORT_BY.includes(value as ValidSortBy)
}

export const EmployeeMasterMapper = {
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
      employeeCode: bffRequest.employeeCode?.trim() || undefined,
      employeeName: bffRequest.employeeName?.trim() || undefined,
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
  entityToListItem(entity: EmployeeMasterEntity): EmployeeMasterListItem {
    return {
      id: entity.id,
      employeeCode: entity.employeeCode,
      employeeName: entity.employeeName,
      organizationKey: entity.organizationKey,
      isActive: entity.isActive,
    }
  },

  /**
   * API Entity → BFF DetailResponse変換
   */
  toBffDetailResponse(entity: EmployeeMasterEntity): EmployeeMasterDetailResponse {
    return {
      id: entity.id,
      employeeCode: entity.employeeCode,
      employeeName: entity.employeeName,
      organizationKey: entity.organizationKey,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      createdBy: entity.createdBy,
      updatedBy: entity.updatedBy,
    }
  },

  /**
   * BFF CreateRequest → API CreateRequest変換
   */
  toApiCreateRequest(bffRequest: BffCreateRequest): ApiCreateRequest {
    return {
      employeeCode: bffRequest.employeeCode,
      employeeName: bffRequest.employeeName,
      organizationKey: bffRequest.organizationKey,
    }
  },

  /**
   * BFF UpdateRequest → API UpdateRequest変換
   */
  toApiUpdateRequest(bffRequest: BffUpdateRequest): ApiUpdateRequest {
    return {
      employeeName: bffRequest.employeeName,
      organizationKey: bffRequest.organizationKey,
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
