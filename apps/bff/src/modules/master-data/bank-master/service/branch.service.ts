import { Injectable } from '@nestjs/common';
import { BankDomainApiClient } from '../clients/domain-api.client';
import { BankMasterMapper } from '../mappers/bank-master.mapper';
import {
  ListBranchesRequest,
  ListBranchesResponse,
  GetBranchResponse,
  CreateBranchRequest,
  CreateBranchResponse,
  UpdateBranchRequest,
  UpdateBranchResponse,
  DeactivateBranchRequest,
  DeactivateBranchResponse,
  ActivateBranchRequest,
  ActivateBranchResponse,
  BranchSortBy,
} from '@procure/contracts/bff/bank-master';
import { ListBranchesApiRequest } from '@procure/contracts/api/bank-master';

/**
 * Branch BFF Service
 *
 * UI入力の正規化、Domain API呼び出し、DTO変換
 * - エラーは Pass-through（Domain API のエラーをそのまま返す）
 */
@Injectable()
export class BranchBffService {
  // Paging / Sorting Normalization
  private readonly DEFAULT_PAGE = 1;
  private readonly DEFAULT_PAGE_SIZE = 50;
  private readonly MAX_PAGE_SIZE = 200;
  private readonly DEFAULT_SORT_BY: BranchSortBy = 'displayOrder';
  private readonly DEFAULT_SORT_ORDER = 'asc' as const;

  // sortBy whitelist
  private readonly SORT_BY_WHITELIST: BranchSortBy[] = [
    'branchCode',
    'branchName',
    'branchNameKana',
    'displayOrder',
    'isActive',
  ];

  constructor(
    private readonly domainApiClient: BankDomainApiClient,
    private readonly mapper: BankMasterMapper,
  ) {}

  /**
   * 支店一覧取得
   */
  async listBranches(
    tenantId: string,
    userId: string,
    bankId: string,
    request: ListBranchesRequest,
  ): Promise<ListBranchesResponse> {
    // Paging / Sorting Normalization
    const page = request.page ?? this.DEFAULT_PAGE;
    const pageSize = Math.min(
      request.pageSize ?? this.DEFAULT_PAGE_SIZE,
      this.MAX_PAGE_SIZE,
    );
    const sortBy = this.validateSortBy(request.sortBy);
    const sortOrder = request.sortOrder ?? this.DEFAULT_SORT_ORDER;
    const keyword = this.normalizeKeyword(request.keyword);

    // page/pageSize → offset/limit 変換
    const offset = (page - 1) * pageSize;
    const limit = pageSize;

    // Domain API 呼び出し
    const apiRequest: ListBranchesApiRequest = {
      offset,
      limit,
      sortBy,
      sortOrder,
      keyword,
      isActive: request.isActive,
    };

    const apiResponse = await this.domainApiClient.listBranches(
      tenantId,
      userId,
      bankId,
      apiRequest,
    );

    // BFF DTO に変換（page/pageSize を追加）
    return this.mapper.toBranchListResponse(apiResponse, page, pageSize);
  }

  /**
   * 支店詳細取得
   */
  async getBranch(
    tenantId: string,
    userId: string,
    bankId: string,
    branchId: string,
  ): Promise<GetBranchResponse> {
    const apiResponse = await this.domainApiClient.getBranch(
      tenantId,
      userId,
      bankId,
      branchId,
    );

    return {
      branch: this.mapper.toBranchDto(apiResponse.branch),
    };
  }

  /**
   * 支店新規登録
   */
  async createBranch(
    tenantId: string,
    userId: string,
    bankId: string,
    request: CreateBranchRequest,
  ): Promise<CreateBranchResponse> {
    const apiRequest = this.mapper.toCreateBranchApiRequest(request);

    const apiResponse = await this.domainApiClient.createBranch(
      tenantId,
      userId,
      bankId,
      apiRequest,
    );

    return {
      branch: this.mapper.toBranchDto(apiResponse.branch),
    };
  }

  /**
   * 支店更新
   */
  async updateBranch(
    tenantId: string,
    userId: string,
    bankId: string,
    branchId: string,
    request: UpdateBranchRequest,
  ): Promise<UpdateBranchResponse> {
    const apiRequest = this.mapper.toUpdateBranchApiRequest(request);

    const apiResponse = await this.domainApiClient.updateBranch(
      tenantId,
      userId,
      bankId,
      branchId,
      apiRequest,
    );

    return {
      branch: this.mapper.toBranchDto(apiResponse.branch),
    };
  }

  /**
   * 支店無効化
   */
  async deactivateBranch(
    tenantId: string,
    userId: string,
    bankId: string,
    branchId: string,
    request: DeactivateBranchRequest,
  ): Promise<DeactivateBranchResponse> {
    const apiResponse = await this.domainApiClient.deactivateBranch(
      tenantId,
      userId,
      bankId,
      branchId,
      { version: request.version },
    );

    return {
      branch: this.mapper.toBranchDto(apiResponse.branch),
      warnings: apiResponse.warnings,
    };
  }

  /**
   * 支店再有効化
   */
  async activateBranch(
    tenantId: string,
    userId: string,
    bankId: string,
    branchId: string,
    request: ActivateBranchRequest,
  ): Promise<ActivateBranchResponse> {
    const apiResponse = await this.domainApiClient.activateBranch(
      tenantId,
      userId,
      bankId,
      branchId,
      { version: request.version },
    );

    return {
      branch: this.mapper.toBranchDto(apiResponse.branch),
    };
  }

  /**
   * sortBy バリデーション（whitelist）
   */
  private validateSortBy(sortBy?: BranchSortBy): BranchSortBy {
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
