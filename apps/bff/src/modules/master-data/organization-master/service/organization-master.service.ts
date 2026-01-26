import { Injectable } from '@nestjs/common';
import { OrganizationMasterDomainApiClient } from '../clients/domain-api.client';
import { OrganizationMasterMapper } from '../mappers/organization-master.mapper';
import {
  // Version types
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
  VersionSortBy,
  // Department types
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
} from '@procure/contracts/bff/organization-master';
import {
  ListVersionsApiRequest,
  ListDepartmentsApiRequest,
  MoveDepartmentApiRequest,
} from '@procure/contracts/api/organization-master';

/**
 * Organization Master BFF Service
 *
 * UI入力の正規化、Domain API呼び出し、DTO変換
 * - エラーは Pass-through（Domain API のエラーをそのまま返す）
 * - ツリー構造構築
 * - isCurrentlyEffective / departmentCount の計算
 */
@Injectable()
export class OrganizationMasterBffService {
  // Sorting Normalization
  private readonly DEFAULT_VERSION_SORT_BY: VersionSortBy = 'effectiveDate';
  private readonly DEFAULT_SORT_ORDER = 'desc' as const;

  // sortBy whitelist
  private readonly VERSION_SORT_BY_WHITELIST: VersionSortBy[] = [
    'effectiveDate',
    'versionCode',
    'versionName',
  ];

  constructor(
    private readonly domainApiClient: OrganizationMasterDomainApiClient,
    private readonly mapper: OrganizationMasterMapper,
  ) {}

  // ===========================================================================
  // Version Methods
  // ===========================================================================

  /**
   * バージョン一覧取得
   */
  async listVersions(
    tenantId: string,
    userId: string,
    request: ListVersionsRequest,
  ): Promise<ListVersionsResponse> {
    const sortBy = this.validateVersionSortBy(request.sortBy);
    const sortOrder = request.sortOrder ?? this.DEFAULT_SORT_ORDER;

    const apiRequest: ListVersionsApiRequest = { sortBy, sortOrder };
    const apiResponse = await this.domainApiClient.listVersions(
      tenantId,
      userId,
      apiRequest,
    );

    // 各バージョンの部門数を取得
    const departmentCounts = new Map<string, number>();
    for (const version of apiResponse.items) {
      const deptResponse = await this.domainApiClient.listDepartments(
        tenantId,
        userId,
        version.id,
        { isActive: true },
      );
      departmentCounts.set(version.id, deptResponse.items.length);
    }

    return this.mapper.toListVersionsResponse(apiResponse, departmentCounts);
  }

  /**
   * バージョン詳細取得
   */
  async getVersion(
    tenantId: string,
    userId: string,
    versionId: string,
  ): Promise<GetVersionResponse> {
    const apiResponse = await this.domainApiClient.getVersion(
      tenantId,
      userId,
      versionId,
    );

    return {
      version: this.mapper.toVersionDetail(apiResponse.version),
    };
  }

  /**
   * バージョン新規作成
   */
  async createVersion(
    tenantId: string,
    userId: string,
    request: CreateVersionRequest,
  ): Promise<CreateVersionResponse> {
    const apiRequest = this.mapper.toCreateVersionApiRequest(request);

    const apiResponse = await this.domainApiClient.createVersion(
      tenantId,
      userId,
      apiRequest,
    );

    return {
      version: this.mapper.toVersionDetail(apiResponse.version),
    };
  }

  /**
   * バージョンコピー
   */
  async copyVersion(
    tenantId: string,
    userId: string,
    sourceVersionId: string,
    request: CopyVersionRequest,
  ): Promise<CopyVersionResponse> {
    const apiRequest = this.mapper.toCopyVersionApiRequest(request);

    const apiResponse = await this.domainApiClient.copyVersion(
      tenantId,
      userId,
      sourceVersionId,
      apiRequest,
    );

    return {
      version: this.mapper.toVersionDetail(apiResponse.version),
    };
  }

  /**
   * バージョン更新
   */
  async updateVersion(
    tenantId: string,
    userId: string,
    versionId: string,
    request: UpdateVersionRequest,
  ): Promise<UpdateVersionResponse> {
    const apiRequest = this.mapper.toUpdateVersionApiRequest(request);

    const apiResponse = await this.domainApiClient.updateVersion(
      tenantId,
      userId,
      versionId,
      apiRequest,
    );

    return {
      version: this.mapper.toVersionDetail(apiResponse.version),
    };
  }

  /**
   * as-of検索
   */
  async findEffectiveAsOf(
    tenantId: string,
    userId: string,
    request: AsOfSearchRequest,
  ): Promise<AsOfSearchResponse> {
    const apiResponse = await this.domainApiClient.findEffectiveAsOf(
      tenantId,
      userId,
      { asOfDate: request.asOfDate },
    );

    return {
      version: apiResponse.version
        ? this.mapper.toVersionDetail(apiResponse.version)
        : null,
    };
  }

  // ===========================================================================
  // Department Methods
  // ===========================================================================

  /**
   * 部門一覧取得（ツリー構造）
   */
  async listDepartmentsTree(
    tenantId: string,
    userId: string,
    versionId: string,
    request: ListDepartmentsTreeRequest,
  ): Promise<ListDepartmentsTreeResponse> {
    // バージョン情報取得（versionCode取得用）
    const versionResponse = await this.domainApiClient.getVersion(
      tenantId,
      userId,
      versionId,
    );

    // 部門一覧取得
    const apiRequest: ListDepartmentsApiRequest = {
      keyword: this.normalizeKeyword(request.keyword),
      isActive: request.isActive ?? true, // デフォルト: 有効のみ
      sortBy: 'sortOrder',
      sortOrder: 'asc',
    };

    const apiResponse = await this.domainApiClient.listDepartments(
      tenantId,
      userId,
      versionId,
      apiRequest,
    );

    return this.mapper.toListDepartmentsTreeResponse(
      apiResponse,
      versionId,
      versionResponse.version.versionCode,
    );
  }

  /**
   * 部門詳細取得
   */
  async getDepartment(
    tenantId: string,
    userId: string,
    departmentId: string,
  ): Promise<GetDepartmentResponse> {
    const apiResponse = await this.domainApiClient.getDepartment(
      tenantId,
      userId,
      departmentId,
    );

    // 親部門名を取得
    let parentDepartmentName: string | null = null;
    if (apiResponse.department.parentId) {
      const parentResponse = await this.domainApiClient.getDepartment(
        tenantId,
        userId,
        apiResponse.department.parentId,
      );
      parentDepartmentName = parentResponse.department.departmentName;
    }

    return {
      department: this.mapper.toDepartmentDetail(
        apiResponse.department,
        parentDepartmentName,
      ),
    };
  }

  /**
   * 部門新規作成
   */
  async createDepartment(
    tenantId: string,
    userId: string,
    versionId: string,
    request: CreateDepartmentRequest,
  ): Promise<CreateDepartmentResponse> {
    const apiRequest = this.mapper.toCreateDepartmentApiRequest(request);

    const apiResponse = await this.domainApiClient.createDepartment(
      tenantId,
      userId,
      versionId,
      apiRequest,
    );

    // 親部門名を取得
    let parentDepartmentName: string | null = null;
    if (apiResponse.department.parentId) {
      const parentResponse = await this.domainApiClient.getDepartment(
        tenantId,
        userId,
        apiResponse.department.parentId,
      );
      parentDepartmentName = parentResponse.department.departmentName;
    }

    return {
      department: this.mapper.toDepartmentDetail(
        apiResponse.department,
        parentDepartmentName,
      ),
    };
  }

  /**
   * 部門更新
   */
  async updateDepartment(
    tenantId: string,
    userId: string,
    departmentId: string,
    request: UpdateDepartmentRequest,
  ): Promise<UpdateDepartmentResponse> {
    const apiRequest = this.mapper.toUpdateDepartmentApiRequest(request);

    const apiResponse = await this.domainApiClient.updateDepartment(
      tenantId,
      userId,
      departmentId,
      apiRequest,
    );

    // 親部門名を取得
    let parentDepartmentName: string | null = null;
    if (apiResponse.department.parentId) {
      const parentResponse = await this.domainApiClient.getDepartment(
        tenantId,
        userId,
        apiResponse.department.parentId,
      );
      parentDepartmentName = parentResponse.department.departmentName;
    }

    return {
      department: this.mapper.toDepartmentDetail(
        apiResponse.department,
        parentDepartmentName,
      ),
    };
  }

  /**
   * 部門移動（ドラッグ＆ドロップ）
   */
  async moveDepartment(
    tenantId: string,
    userId: string,
    departmentId: string,
    request: MoveDepartmentRequest,
  ): Promise<MoveDepartmentResponse> {
    // 移動前に部門情報を取得（versionId取得用）
    const deptResponse = await this.domainApiClient.getDepartment(
      tenantId,
      userId,
      departmentId,
    );

    const apiRequest: MoveDepartmentApiRequest = {
      newParentId: request.newParentId,
    };

    await this.domainApiClient.moveDepartment(
      tenantId,
      userId,
      departmentId,
      apiRequest,
    );

    // 移動後のツリー全体を取得して返す
    const treeResponse = await this.listDepartmentsTree(
      tenantId,
      userId,
      deptResponse.department.versionId,
      { isActive: true },
    );

    return {
      tree: treeResponse,
    };
  }

  /**
   * 部門無効化
   */
  async deactivateDepartment(
    tenantId: string,
    userId: string,
    departmentId: string,
  ): Promise<DeactivateDepartmentResponse> {
    const apiResponse = await this.domainApiClient.deactivateDepartment(
      tenantId,
      userId,
      departmentId,
    );

    // 親部門名を取得
    let parentDepartmentName: string | null = null;
    if (apiResponse.department.parentId) {
      const parentResponse = await this.domainApiClient.getDepartment(
        tenantId,
        userId,
        apiResponse.department.parentId,
      );
      parentDepartmentName = parentResponse.department.departmentName;
    }

    return {
      department: this.mapper.toDepartmentDetail(
        apiResponse.department,
        parentDepartmentName,
      ),
    };
  }

  /**
   * 部門有効化
   */
  async reactivateDepartment(
    tenantId: string,
    userId: string,
    departmentId: string,
  ): Promise<ReactivateDepartmentResponse> {
    const apiResponse = await this.domainApiClient.reactivateDepartment(
      tenantId,
      userId,
      departmentId,
    );

    // 親部門名を取得
    let parentDepartmentName: string | null = null;
    if (apiResponse.department.parentId) {
      const parentResponse = await this.domainApiClient.getDepartment(
        tenantId,
        userId,
        apiResponse.department.parentId,
      );
      parentDepartmentName = parentResponse.department.departmentName;
    }

    return {
      department: this.mapper.toDepartmentDetail(
        apiResponse.department,
        parentDepartmentName,
      ),
    };
  }

  // ===========================================================================
  // Helper Methods
  // ===========================================================================

  /**
   * sortBy バリデーション（whitelist）
   */
  private validateVersionSortBy(sortBy?: VersionSortBy): VersionSortBy {
    if (!sortBy) {
      return this.DEFAULT_VERSION_SORT_BY;
    }
    if (this.VERSION_SORT_BY_WHITELIST.includes(sortBy)) {
      return sortBy;
    }
    return this.DEFAULT_VERSION_SORT_BY;
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
