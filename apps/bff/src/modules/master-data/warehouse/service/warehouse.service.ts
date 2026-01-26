import { Injectable } from '@nestjs/common';
import { WarehouseDomainApiClient } from '../clients/domain-api.client';
import { WarehouseMapper } from '../mappers/warehouse.mapper';
import {
  ListWarehousesRequest,
  ListWarehousesResponse,
  GetWarehouseResponse,
  CreateWarehouseRequest,
  CreateWarehouseResponse,
  UpdateWarehouseRequest,
  UpdateWarehouseResponse,
  DeactivateWarehouseRequest,
  DeactivateWarehouseResponse,
  ActivateWarehouseRequest,
  ActivateWarehouseResponse,
  SetDefaultReceivingWarehouseRequest,
  SetDefaultReceivingWarehouseResponse,
  WarehouseSortBy,
} from '@procure/contracts/bff/warehouse';
import { ListWarehousesApiRequest } from '@procure/contracts/api/warehouse';

/**
 * Warehouse BFF Service
 *
 * UI入力の正規化、Domain API呼び出し、DTO変換
 * - エラーは Pass-through（Domain API のエラーをそのまま返す）
 */
@Injectable()
export class WarehouseBffService {
  // Paging / Sorting Normalization (design.md)
  private readonly DEFAULT_PAGE = 1;
  private readonly DEFAULT_PAGE_SIZE = 20;
  private readonly MAX_PAGE_SIZE = 200;
  private readonly DEFAULT_SORT_BY: WarehouseSortBy = 'displayOrder';
  private readonly DEFAULT_SORT_ORDER = 'asc' as const;

  // sortBy whitelist
  private readonly SORT_BY_WHITELIST: WarehouseSortBy[] = [
    'warehouseCode',
    'warehouseName',
    'warehouseNameKana',
    'displayOrder',
    'isActive',
  ];

  constructor(
    private readonly domainApiClient: WarehouseDomainApiClient,
    private readonly mapper: WarehouseMapper,
  ) {}

  /**
   * 倉庫一覧取得
   */
  async listWarehouses(
    tenantId: string,
    userId: string,
    request: ListWarehousesRequest,
  ): Promise<ListWarehousesResponse> {
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
    const { offset, limit } = this.mapper.toOffsetLimit(page, pageSize);

    // Domain API 呼び出し
    const apiRequest: ListWarehousesApiRequest = {
      offset,
      limit,
      sortBy,
      sortOrder,
      keyword,
      isActive: request.isActive,
    };

    const apiResponse = await this.domainApiClient.listWarehouses(
      tenantId,
      userId,
      apiRequest,
    );

    // BFF DTO に変換（page/pageSize を追加）
    return this.mapper.toWarehouseListResponse(apiResponse, page, pageSize);
  }

  /**
   * 倉庫詳細取得
   */
  async getWarehouse(
    tenantId: string,
    userId: string,
    warehouseId: string,
  ): Promise<GetWarehouseResponse> {
    const apiResponse = await this.domainApiClient.getWarehouse(
      tenantId,
      userId,
      warehouseId,
    );

    return {
      warehouse: this.mapper.toWarehouseDto(apiResponse.warehouse),
    };
  }

  /**
   * 倉庫新規登録
   */
  async createWarehouse(
    tenantId: string,
    userId: string,
    request: CreateWarehouseRequest,
  ): Promise<CreateWarehouseResponse> {
    const apiRequest = this.mapper.toCreateWarehouseApiRequest(request);

    const apiResponse = await this.domainApiClient.createWarehouse(
      tenantId,
      userId,
      apiRequest,
    );

    return {
      warehouse: this.mapper.toWarehouseDto(apiResponse.warehouse),
    };
  }

  /**
   * 倉庫更新
   */
  async updateWarehouse(
    tenantId: string,
    userId: string,
    warehouseId: string,
    request: UpdateWarehouseRequest,
  ): Promise<UpdateWarehouseResponse> {
    const apiRequest = this.mapper.toUpdateWarehouseApiRequest(request);

    const apiResponse = await this.domainApiClient.updateWarehouse(
      tenantId,
      userId,
      warehouseId,
      apiRequest,
    );

    return {
      warehouse: this.mapper.toWarehouseDto(apiResponse.warehouse),
    };
  }

  /**
   * 倉庫無効化
   */
  async deactivateWarehouse(
    tenantId: string,
    userId: string,
    warehouseId: string,
    request: DeactivateWarehouseRequest,
  ): Promise<DeactivateWarehouseResponse> {
    const apiResponse = await this.domainApiClient.deactivateWarehouse(
      tenantId,
      userId,
      warehouseId,
      { version: request.version },
    );

    return {
      warehouse: this.mapper.toWarehouseDto(apiResponse.warehouse),
    };
  }

  /**
   * 倉庫再有効化
   */
  async activateWarehouse(
    tenantId: string,
    userId: string,
    warehouseId: string,
    request: ActivateWarehouseRequest,
  ): Promise<ActivateWarehouseResponse> {
    const apiResponse = await this.domainApiClient.activateWarehouse(
      tenantId,
      userId,
      warehouseId,
      { version: request.version },
    );

    return {
      warehouse: this.mapper.toWarehouseDto(apiResponse.warehouse),
    };
  }

  /**
   * 既定受入倉庫設定
   */
  async setDefaultReceivingWarehouse(
    tenantId: string,
    userId: string,
    warehouseId: string,
    request: SetDefaultReceivingWarehouseRequest,
  ): Promise<SetDefaultReceivingWarehouseResponse> {
    const apiResponse =
      await this.domainApiClient.setDefaultReceivingWarehouse(
        tenantId,
        userId,
        warehouseId,
        { version: request.version },
      );

    return {
      warehouse: this.mapper.toWarehouseDto(apiResponse.warehouse),
      previousDefault: apiResponse.previousDefault
        ? this.mapper.toWarehouseDto(apiResponse.previousDefault)
        : null,
    };
  }

  /**
   * sortBy バリデーション（whitelist）
   */
  private validateSortBy(sortBy?: WarehouseSortBy): WarehouseSortBy {
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
