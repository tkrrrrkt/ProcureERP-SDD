import { Injectable } from '@nestjs/common';
import { EmployeeDomainApiClient } from '../clients/domain-api.client';
import { EmployeeMapper } from '../mappers/employee.mapper';
import {
  ListEmployeesRequest,
  ListEmployeesResponse,
  GetEmployeeResponse,
  CreateEmployeeRequest,
  CreateEmployeeResponse,
  UpdateEmployeeRequest,
  UpdateEmployeeResponse,
  EmployeeSortBy,
} from '@procure/contracts/bff/employee-master';
import { ListEmployeesApiRequest } from '@procure/contracts/api/employee-master';

/**
 * Employee BFF Service
 *
 * UI入力の正規化、Domain API呼び出し、DTO変換
 * - エラーは Pass-through（Domain API のエラーをそのまま返す）
 */
@Injectable()
export class EmployeeBffService {
  // Paging / Sorting Normalization
  private readonly DEFAULT_PAGE = 1;
  private readonly DEFAULT_PAGE_SIZE = 50;
  private readonly MAX_PAGE_SIZE = 200;
  private readonly DEFAULT_SORT_BY: EmployeeSortBy = 'employeeCode';
  private readonly DEFAULT_SORT_ORDER = 'asc' as const;

  // sortBy whitelist
  private readonly SORT_BY_WHITELIST: EmployeeSortBy[] = [
    'employeeCode',
    'employeeName',
    'employeeKanaName',
    'email',
    'joinDate',
    'retireDate',
    'isActive',
  ];

  constructor(
    private readonly domainApiClient: EmployeeDomainApiClient,
    private readonly mapper: EmployeeMapper,
  ) {}

  /**
   * 社員一覧取得
   */
  async listEmployees(
    tenantId: string,
    userId: string,
    request: ListEmployeesRequest,
  ): Promise<ListEmployeesResponse> {
    // Paging / Sorting Normalization
    const page = request.page ?? this.DEFAULT_PAGE;
    const pageSize = Math.min(request.pageSize ?? this.DEFAULT_PAGE_SIZE, this.MAX_PAGE_SIZE);
    const sortBy = this.validateSortBy(request.sortBy);
    const sortOrder = request.sortOrder ?? this.DEFAULT_SORT_ORDER;
    const keyword = this.normalizeKeyword(request.keyword);

    // page/pageSize → offset/limit 変換
    const offset = (page - 1) * pageSize;
    const limit = pageSize;

    // Domain API 呼び出し
    const apiRequest: ListEmployeesApiRequest = {
      offset,
      limit,
      sortBy,
      sortOrder,
      keyword,
    };

    const apiResponse = await this.domainApiClient.listEmployees(
      tenantId,
      userId,
      apiRequest,
    );

    // BFF DTO に変換（page/pageSize を追加）
    return this.mapper.toListResponse(apiResponse, page, pageSize);
  }

  /**
   * 社員詳細取得
   */
  async getEmployee(
    tenantId: string,
    userId: string,
    employeeId: string,
  ): Promise<GetEmployeeResponse> {
    const apiResponse = await this.domainApiClient.getEmployee(
      tenantId,
      userId,
      employeeId,
    );

    return {
      employee: this.mapper.toDto(apiResponse.employee),
    };
  }

  /**
   * 社員新規登録
   */
  async createEmployee(
    tenantId: string,
    userId: string,
    request: CreateEmployeeRequest,
  ): Promise<CreateEmployeeResponse> {
    const apiRequest = this.mapper.toCreateApiRequest(request);

    const apiResponse = await this.domainApiClient.createEmployee(
      tenantId,
      userId,
      apiRequest,
    );

    return {
      employee: this.mapper.toDto(apiResponse.employee),
    };
  }

  /**
   * 社員更新
   */
  async updateEmployee(
    tenantId: string,
    userId: string,
    employeeId: string,
    request: UpdateEmployeeRequest,
  ): Promise<UpdateEmployeeResponse> {
    const apiRequest = this.mapper.toUpdateApiRequest(request);

    const apiResponse = await this.domainApiClient.updateEmployee(
      tenantId,
      userId,
      employeeId,
      apiRequest,
    );

    return {
      employee: this.mapper.toDto(apiResponse.employee),
    };
  }

  /**
   * sortBy バリデーション（whitelist）
   */
  private validateSortBy(sortBy?: EmployeeSortBy): EmployeeSortBy {
    if (!sortBy) {
      return this.DEFAULT_SORT_BY;
    }
    if (this.SORT_BY_WHITELIST.includes(sortBy)) {
      return sortBy;
    }
    return this.DEFAULT_SORT_BY;
  }

  /**
   * keyword 正規化（trim、空→undefined）
   */
  private normalizeKeyword(keyword?: string): string | undefined {
    if (!keyword) {
      return undefined;
    }
    const trimmed = keyword.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
}
