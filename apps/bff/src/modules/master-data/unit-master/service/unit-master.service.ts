import { Injectable } from '@nestjs/common';
import { UnitMasterDomainApiClient } from '../clients/domain-api.client';
import { UnitMasterMapper } from '../mappers/unit-master.mapper';
import {
  ListUomGroupsRequest,
  ListUomGroupsResponse,
  GetUomGroupResponse,
  CreateUomGroupRequest,
  CreateUomGroupResponse,
  UpdateUomGroupRequest,
  UpdateUomGroupResponse,
  ActivateUomGroupRequest,
  ActivateUomGroupResponse,
  DeactivateUomGroupRequest,
  DeactivateUomGroupResponse,
  ListUomsRequest,
  ListUomsResponse,
  GetUomResponse,
  CreateUomRequest,
  CreateUomResponse,
  UpdateUomRequest,
  UpdateUomResponse,
  ActivateUomRequest,
  ActivateUomResponse,
  DeactivateUomRequest,
  DeactivateUomResponse,
  SuggestUomsRequest,
  SuggestUomsResponse,
  UomGroupSortBy,
  UomSortBy,
  UomSummaryDto,
} from '@procure/contracts/bff/unit-master';
import {
  ListUomGroupsApiRequest,
  ListUomsApiRequest,
  SuggestUomsApiRequest,
} from '@procure/contracts/api/unit-master';

/**
 * Unit Master BFF Service
 *
 * UI入力の正規化、Domain API呼び出し、DTO変換
 * - page/pageSize → offset/limit 変換
 * - sortBy ホワイトリストチェック
 * - keyword の trim・空→undefined
 * - isBaseUom の算出
 * - エラーは Pass-through
 */
@Injectable()
export class UnitMasterBffService {
  // Paging / Sorting Normalization
  private readonly DEFAULT_PAGE = 1;
  private readonly DEFAULT_PAGE_SIZE = 50;
  private readonly MAX_PAGE_SIZE = 200;
  private readonly DEFAULT_GROUP_SORT_BY: UomGroupSortBy = 'groupCode';
  private readonly DEFAULT_UOM_SORT_BY: UomSortBy = 'uomCode';
  private readonly DEFAULT_SORT_ORDER = 'asc' as const;

  // sortBy whitelist
  private readonly GROUP_SORT_BY_WHITELIST: UomGroupSortBy[] = [
    'groupCode',
    'groupName',
    'isActive',
  ];
  private readonly UOM_SORT_BY_WHITELIST: UomSortBy[] = [
    'uomCode',
    'uomName',
    'groupCode',
    'isActive',
  ];

  constructor(
    private readonly domainApiClient: UnitMasterDomainApiClient,
    private readonly mapper: UnitMasterMapper,
  ) {}

  // ==========================================================================
  // UomGroup Operations
  // ==========================================================================

  /**
   * 単位グループ一覧取得
   */
  async listUomGroups(
    tenantId: string,
    userId: string,
    request: ListUomGroupsRequest,
  ): Promise<ListUomGroupsResponse> {
    // Paging / Sorting Normalization
    const page = request.page ?? this.DEFAULT_PAGE;
    const pageSize = Math.min(request.pageSize ?? this.DEFAULT_PAGE_SIZE, this.MAX_PAGE_SIZE);
    const sortBy = this.validateGroupSortBy(request.sortBy);
    const sortOrder = request.sortOrder ?? this.DEFAULT_SORT_ORDER;
    const keyword = this.normalizeKeyword(request.keyword);

    // page/pageSize → offset/limit 変換
    const offset = (page - 1) * pageSize;
    const limit = pageSize;

    // Domain API 呼び出し
    const apiRequest: ListUomGroupsApiRequest = {
      offset,
      limit,
      sortBy,
      sortOrder,
      keyword,
      isActive: request.isActive,
    };

    const apiResponse = await this.domainApiClient.listUomGroups(tenantId, userId, apiRequest);

    // baseUom の情報を取得するため、baseUomId のリストを収集
    const baseUomIds = [...new Set(apiResponse.items.map((g) => g.baseUomId))];
    const baseUomMap = new Map<string, UomSummaryDto>();

    // baseUom を一括取得（効率化のため）
    if (baseUomIds.length > 0) {
      const uomsResponse = await this.domainApiClient.listUoms(tenantId, userId, {
        offset: 0,
        limit: baseUomIds.length,
      });

      for (const uom of uomsResponse.items) {
        if (baseUomIds.includes(uom.id)) {
          baseUomMap.set(uom.id, this.mapper.toUomSummary(uom));
        }
      }
    }

    // BFF DTO に変換（page/pageSize を追加）
    return this.mapper.toGroupListResponse(apiResponse, page, pageSize, baseUomMap);
  }

  /**
   * 単位グループ詳細取得
   */
  async getUomGroup(
    tenantId: string,
    userId: string,
    groupId: string,
  ): Promise<GetUomGroupResponse> {
    const apiResponse = await this.domainApiClient.getUomGroup(tenantId, userId, groupId);

    // baseUom の情報を取得
    let baseUomSummary: UomSummaryDto | null = null;
    try {
      const baseUomResponse = await this.domainApiClient.getUom(
        tenantId,
        userId,
        apiResponse.group.baseUomId,
      );
      baseUomSummary = this.mapper.toUomSummary(baseUomResponse.uom);
    } catch {
      // baseUom が取得できない場合は null
    }

    return {
      group: this.mapper.toGroupDto(apiResponse.group, baseUomSummary),
    };
  }

  /**
   * 単位グループ新規登録
   */
  async createUomGroup(
    tenantId: string,
    userId: string,
    request: CreateUomGroupRequest,
  ): Promise<CreateUomGroupResponse> {
    const apiRequest = this.mapper.toCreateGroupApiRequest(request);

    const apiResponse = await this.domainApiClient.createUomGroup(tenantId, userId, apiRequest);

    // baseUom の概要情報を作成
    const baseUomSummary: UomSummaryDto = {
      id: apiResponse.baseUom.id,
      uomCode: apiResponse.baseUom.uomCode,
      uomName: apiResponse.baseUom.uomName,
    };

    return {
      group: this.mapper.toGroupDto(apiResponse.group, baseUomSummary),
    };
  }

  /**
   * 単位グループ更新
   */
  async updateUomGroup(
    tenantId: string,
    userId: string,
    groupId: string,
    request: UpdateUomGroupRequest,
  ): Promise<UpdateUomGroupResponse> {
    const apiRequest = this.mapper.toUpdateGroupApiRequest(request);

    const apiResponse = await this.domainApiClient.updateUomGroup(
      tenantId,
      userId,
      groupId,
      apiRequest,
    );

    // baseUom の情報を取得
    let baseUomSummary: UomSummaryDto | null = null;
    try {
      const baseUomResponse = await this.domainApiClient.getUom(
        tenantId,
        userId,
        apiResponse.group.baseUomId,
      );
      baseUomSummary = this.mapper.toUomSummary(baseUomResponse.uom);
    } catch {
      // baseUom が取得できない場合は null
    }

    return {
      group: this.mapper.toGroupDto(apiResponse.group, baseUomSummary),
    };
  }

  /**
   * 単位グループ有効化
   */
  async activateUomGroup(
    tenantId: string,
    userId: string,
    groupId: string,
    request: ActivateUomGroupRequest,
  ): Promise<ActivateUomGroupResponse> {
    const apiResponse = await this.domainApiClient.activateUomGroup(tenantId, userId, groupId, {
      version: request.version,
    });

    return {
      group: this.mapper.toGroupDto(apiResponse.group),
    };
  }

  /**
   * 単位グループ無効化
   */
  async deactivateUomGroup(
    tenantId: string,
    userId: string,
    groupId: string,
    request: DeactivateUomGroupRequest,
  ): Promise<DeactivateUomGroupResponse> {
    const apiResponse = await this.domainApiClient.deactivateUomGroup(tenantId, userId, groupId, {
      version: request.version,
    });

    return {
      group: this.mapper.toGroupDto(apiResponse.group),
    };
  }

  // ==========================================================================
  // Uom Operations
  // ==========================================================================

  /**
   * 単位一覧取得
   */
  async listUoms(
    tenantId: string,
    userId: string,
    request: ListUomsRequest,
  ): Promise<ListUomsResponse> {
    // Paging / Sorting Normalization
    const page = request.page ?? this.DEFAULT_PAGE;
    const pageSize = Math.min(request.pageSize ?? this.DEFAULT_PAGE_SIZE, this.MAX_PAGE_SIZE);
    const sortBy = this.validateUomSortBy(request.sortBy);
    const sortOrder = request.sortOrder ?? this.DEFAULT_SORT_ORDER;
    const keyword = this.normalizeKeyword(request.keyword);

    // page/pageSize → offset/limit 変換
    const offset = (page - 1) * pageSize;
    const limit = pageSize;

    // Domain API 呼び出し
    const apiRequest: ListUomsApiRequest = {
      offset,
      limit,
      sortBy,
      sortOrder,
      keyword,
      groupId: request.groupId,
      isActive: request.isActive,
    };

    const apiResponse = await this.domainApiClient.listUoms(tenantId, userId, apiRequest);

    // グループ情報を取得（isBaseUom 算出のため）
    const groupIds = [...new Set(apiResponse.items.map((u) => u.uomGroupId))];
    const groupInfoMap = new Map<
      string,
      { groupCode: string; groupName: string; baseUomId: string }
    >();

    // グループ情報を一括取得
    for (const gId of groupIds) {
      try {
        const groupResponse = await this.domainApiClient.getUomGroup(tenantId, userId, gId);
        groupInfoMap.set(gId, {
          groupCode: groupResponse.group.groupCode,
          groupName: groupResponse.group.groupName,
          baseUomId: groupResponse.group.baseUomId,
        });
      } catch {
        // グループ取得失敗時はスキップ
      }
    }

    // BFF DTO に変換
    return this.mapper.toUomListResponse(apiResponse, page, pageSize, groupInfoMap);
  }

  /**
   * 単位詳細取得
   */
  async getUom(tenantId: string, userId: string, uomId: string): Promise<GetUomResponse> {
    const apiResponse = await this.domainApiClient.getUom(tenantId, userId, uomId);

    // グループ情報を取得
    const groupResponse = await this.domainApiClient.getUomGroup(
      tenantId,
      userId,
      apiResponse.uom.uomGroupId,
    );

    return {
      uom: this.mapper.toUomDto(
        apiResponse.uom,
        groupResponse.group.groupCode,
        groupResponse.group.groupName,
        groupResponse.group.baseUomId,
      ),
    };
  }

  /**
   * 単位新規登録
   */
  async createUom(
    tenantId: string,
    userId: string,
    request: CreateUomRequest,
  ): Promise<CreateUomResponse> {
    const apiRequest = this.mapper.toCreateUomApiRequest(request);

    const apiResponse = await this.domainApiClient.createUom(tenantId, userId, apiRequest);

    // グループ情報を取得
    const groupResponse = await this.domainApiClient.getUomGroup(
      tenantId,
      userId,
      apiResponse.uom.uomGroupId,
    );

    return {
      uom: this.mapper.toUomDto(
        apiResponse.uom,
        groupResponse.group.groupCode,
        groupResponse.group.groupName,
        groupResponse.group.baseUomId,
      ),
    };
  }

  /**
   * 単位更新
   */
  async updateUom(
    tenantId: string,
    userId: string,
    uomId: string,
    request: UpdateUomRequest,
  ): Promise<UpdateUomResponse> {
    const apiRequest = this.mapper.toUpdateUomApiRequest(request);

    const apiResponse = await this.domainApiClient.updateUom(tenantId, userId, uomId, apiRequest);

    // グループ情報を取得
    const groupResponse = await this.domainApiClient.getUomGroup(
      tenantId,
      userId,
      apiResponse.uom.uomGroupId,
    );

    return {
      uom: this.mapper.toUomDto(
        apiResponse.uom,
        groupResponse.group.groupCode,
        groupResponse.group.groupName,
        groupResponse.group.baseUomId,
      ),
    };
  }

  /**
   * 単位有効化
   */
  async activateUom(
    tenantId: string,
    userId: string,
    uomId: string,
    request: ActivateUomRequest,
  ): Promise<ActivateUomResponse> {
    const apiResponse = await this.domainApiClient.activateUom(tenantId, userId, uomId, {
      version: request.version,
    });

    // グループ情報を取得
    const groupResponse = await this.domainApiClient.getUomGroup(
      tenantId,
      userId,
      apiResponse.uom.uomGroupId,
    );

    return {
      uom: this.mapper.toUomDto(
        apiResponse.uom,
        groupResponse.group.groupCode,
        groupResponse.group.groupName,
        groupResponse.group.baseUomId,
      ),
    };
  }

  /**
   * 単位無効化
   */
  async deactivateUom(
    tenantId: string,
    userId: string,
    uomId: string,
    request: DeactivateUomRequest,
  ): Promise<DeactivateUomResponse> {
    const apiResponse = await this.domainApiClient.deactivateUom(tenantId, userId, uomId, {
      version: request.version,
    });

    // グループ情報を取得
    const groupResponse = await this.domainApiClient.getUomGroup(
      tenantId,
      userId,
      apiResponse.uom.uomGroupId,
    );

    return {
      uom: this.mapper.toUomDto(
        apiResponse.uom,
        groupResponse.group.groupCode,
        groupResponse.group.groupName,
        groupResponse.group.baseUomId,
      ),
    };
  }

  /**
   * 単位サジェスト
   */
  async suggestUoms(
    tenantId: string,
    userId: string,
    request: SuggestUomsRequest,
  ): Promise<SuggestUomsResponse> {
    const apiRequest: SuggestUomsApiRequest = {
      keyword: this.normalizeKeyword(request.keyword) || '',
      groupId: request.groupId,
      limit: Math.min(request.limit ?? 20, 20),
    };

    const apiResponse = await this.domainApiClient.suggestUoms(tenantId, userId, apiRequest);

    // グループ情報を取得
    const groupIds = [...new Set(apiResponse.items.map((u) => u.uomGroupId))];
    const groupInfoMap = new Map<
      string,
      { groupCode: string; groupName: string; baseUomId: string }
    >();

    for (const gId of groupIds) {
      try {
        const groupResponse = await this.domainApiClient.getUomGroup(tenantId, userId, gId);
        groupInfoMap.set(gId, {
          groupCode: groupResponse.group.groupCode,
          groupName: groupResponse.group.groupName,
          baseUomId: groupResponse.group.baseUomId,
        });
      } catch {
        // グループ取得失敗時はスキップ
      }
    }

    return {
      items: apiResponse.items.map((uom) => {
        const groupInfo = groupInfoMap.get(uom.uomGroupId);
        return this.mapper.toUomDto(
          uom,
          groupInfo?.groupCode ?? '',
          groupInfo?.groupName ?? '',
          groupInfo?.baseUomId ?? '',
        );
      }),
    };
  }

  // ==========================================================================
  // Helper Methods
  // ==========================================================================

  /**
   * sortBy バリデーション（UomGroup）
   */
  private validateGroupSortBy(sortBy?: UomGroupSortBy): UomGroupSortBy {
    if (!sortBy) {
      return this.DEFAULT_GROUP_SORT_BY;
    }
    if (this.GROUP_SORT_BY_WHITELIST.includes(sortBy)) {
      return sortBy;
    }
    return this.DEFAULT_GROUP_SORT_BY;
  }

  /**
   * sortBy バリデーション（Uom）
   */
  private validateUomSortBy(sortBy?: UomSortBy): UomSortBy {
    if (!sortBy) {
      return this.DEFAULT_UOM_SORT_BY;
    }
    if (this.UOM_SORT_BY_WHITELIST.includes(sortBy)) {
      return sortBy;
    }
    return this.DEFAULT_UOM_SORT_BY;
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
