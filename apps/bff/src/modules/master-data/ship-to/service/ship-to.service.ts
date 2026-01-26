import { Injectable } from '@nestjs/common';
import { ShipToDomainApiClient } from '../clients/domain-api.client';
import { ShipToMapper } from '../mappers/ship-to.mapper';
import {
  ListShipTosRequest,
  ListShipTosResponse,
  GetShipToResponse,
  CreateShipToRequest,
  CreateShipToResponse,
  UpdateShipToRequest,
  UpdateShipToResponse,
  DeactivateShipToRequest,
  DeactivateShipToResponse,
  ActivateShipToRequest,
  ActivateShipToResponse,
  ShipToSortBy,
} from '@procure/contracts/bff/ship-to';
import { ListShipTosApiRequest } from '@procure/contracts/api/ship-to';

/**
 * ShipTo BFF Service
 *
 * UI入力の正規化、Domain API呼び出し、DTO変換
 * - エラーは Pass-through（Domain API のエラーをそのまま返す）
 */
@Injectable()
export class ShipToBffService {
  // Paging / Sorting Normalization (design.md)
  private readonly DEFAULT_PAGE = 1;
  private readonly DEFAULT_PAGE_SIZE = 20;
  private readonly MAX_PAGE_SIZE = 200;
  private readonly DEFAULT_SORT_BY: ShipToSortBy = 'shipToCode';
  private readonly DEFAULT_SORT_ORDER = 'asc' as const;

  // sortBy whitelist
  private readonly SORT_BY_WHITELIST: ShipToSortBy[] = [
    'shipToCode',
    'shipToName',
    'shipToNameKana',
    'prefecture',
    'isActive',
  ];

  constructor(
    private readonly domainApiClient: ShipToDomainApiClient,
    private readonly mapper: ShipToMapper,
  ) {}

  /**
   * 納入先一覧取得
   */
  async listShipTos(
    tenantId: string,
    userId: string,
    request: ListShipTosRequest,
  ): Promise<ListShipTosResponse> {
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
    const apiRequest: ListShipTosApiRequest = {
      offset,
      limit,
      sortBy,
      sortOrder,
      keyword,
      isActive: request.isActive,
    };

    const apiResponse = await this.domainApiClient.listShipTos(
      tenantId,
      userId,
      apiRequest,
    );

    // BFF DTO に変換（page/pageSize を追加）
    return this.mapper.toShipToListResponse(apiResponse, page, pageSize);
  }

  /**
   * 納入先詳細取得
   */
  async getShipTo(
    tenantId: string,
    userId: string,
    shipToId: string,
  ): Promise<GetShipToResponse> {
    const apiResponse = await this.domainApiClient.getShipTo(
      tenantId,
      userId,
      shipToId,
    );

    return {
      shipTo: this.mapper.toShipToDto(apiResponse.shipTo),
    };
  }

  /**
   * 納入先新規登録
   */
  async createShipTo(
    tenantId: string,
    userId: string,
    request: CreateShipToRequest,
  ): Promise<CreateShipToResponse> {
    const apiRequest = this.mapper.toCreateShipToApiRequest(request);

    const apiResponse = await this.domainApiClient.createShipTo(
      tenantId,
      userId,
      apiRequest,
    );

    return {
      shipTo: this.mapper.toShipToDto(apiResponse.shipTo),
    };
  }

  /**
   * 納入先更新
   */
  async updateShipTo(
    tenantId: string,
    userId: string,
    shipToId: string,
    request: UpdateShipToRequest,
  ): Promise<UpdateShipToResponse> {
    const apiRequest = this.mapper.toUpdateShipToApiRequest(request);

    const apiResponse = await this.domainApiClient.updateShipTo(
      tenantId,
      userId,
      shipToId,
      apiRequest,
    );

    return {
      shipTo: this.mapper.toShipToDto(apiResponse.shipTo),
    };
  }

  /**
   * 納入先無効化
   */
  async deactivateShipTo(
    tenantId: string,
    userId: string,
    shipToId: string,
    request: DeactivateShipToRequest,
  ): Promise<DeactivateShipToResponse> {
    const apiResponse = await this.domainApiClient.deactivateShipTo(
      tenantId,
      userId,
      shipToId,
      { version: request.version },
    );

    return {
      shipTo: this.mapper.toShipToDto(apiResponse.shipTo),
    };
  }

  /**
   * 納入先再有効化
   */
  async activateShipTo(
    tenantId: string,
    userId: string,
    shipToId: string,
    request: ActivateShipToRequest,
  ): Promise<ActivateShipToResponse> {
    const apiResponse = await this.domainApiClient.activateShipTo(
      tenantId,
      userId,
      shipToId,
      { version: request.version },
    );

    return {
      shipTo: this.mapper.toShipToDto(apiResponse.shipTo),
    };
  }

  /**
   * sortBy バリデーション（whitelist）
   */
  private validateSortBy(sortBy?: ShipToSortBy): ShipToSortBy {
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
