import { Injectable } from '@nestjs/common';
import {
  UomGroupApiDto,
  UomApiDto,
  ListUomGroupsApiResponse,
  ListUomsApiResponse,
  CreateUomGroupApiResponse,
} from '@procure/contracts/api/unit-master';
import {
  UomGroupDto,
  UomDto,
  UomSummaryDto,
  ListUomGroupsResponse,
  ListUomsResponse,
  CreateUomGroupRequest,
  UpdateUomGroupRequest,
  CreateUomRequest,
  UpdateUomRequest,
} from '@procure/contracts/bff/unit-master';
import {
  CreateUomGroupApiRequest,
  UpdateUomGroupApiRequest,
  CreateUomApiRequest,
  UpdateUomApiRequest,
} from '@procure/contracts/api/unit-master';

/**
 * Unit Master Mapper
 *
 * API DTO ↔ BFF DTO の変換
 * - isBaseUom の算出（BFF責務）
 * - createdByLoginAccountId → createdBy のフィールド名変換
 */
@Injectable()
export class UnitMasterMapper {
  // ==========================================================================
  // UomGroup Mapping
  // ==========================================================================

  /**
   * API DTO → BFF DTO (UomGroup単体)
   * baseUom は別途取得・設定が必要
   */
  toGroupDto(apiDto: UomGroupApiDto, baseUom?: UomSummaryDto | null): UomGroupDto {
    return {
      id: apiDto.id,
      groupCode: apiDto.groupCode,
      groupName: apiDto.groupName,
      description: apiDto.description,
      baseUomId: apiDto.baseUomId,
      baseUom: baseUom ?? null,
      isActive: apiDto.isActive,
      version: apiDto.version,
      createdAt: apiDto.createdAt,
      updatedAt: apiDto.updatedAt,
      createdBy: apiDto.createdByLoginAccountId,
      updatedBy: apiDto.updatedByLoginAccountId,
    };
  }

  /**
   * API Response → BFF Response (UomGroup一覧)
   * page/pageSize を追加
   */
  toGroupListResponse(
    apiResponse: ListUomGroupsApiResponse,
    page: number,
    pageSize: number,
    baseUomMap?: Map<string, UomSummaryDto>,
  ): ListUomGroupsResponse {
    const totalPages = Math.ceil(apiResponse.total / pageSize);

    return {
      items: apiResponse.items.map((item) =>
        this.toGroupDto(item, baseUomMap?.get(item.baseUomId)),
      ),
      page,
      pageSize,
      total: apiResponse.total,
      totalPages,
    };
  }

  /**
   * BFF Request → API Request (UomGroup新規登録)
   */
  toCreateGroupApiRequest(request: CreateUomGroupRequest): CreateUomGroupApiRequest {
    return {
      groupCode: request.groupCode,
      groupName: request.groupName,
      description: request.description,
      baseUomCode: request.baseUomCode,
      baseUomName: request.baseUomName,
      baseUomSymbol: request.baseUomSymbol,
    };
  }

  /**
   * BFF Request → API Request (UomGroup更新)
   */
  toUpdateGroupApiRequest(request: UpdateUomGroupRequest): UpdateUomGroupApiRequest {
    return {
      groupName: request.groupName,
      description: request.description,
      baseUomId: request.baseUomId,
      version: request.version,
    };
  }

  // ==========================================================================
  // Uom Mapping
  // ==========================================================================

  /**
   * API DTO → BFF DTO (Uom単体)
   * isBaseUom は BFF で算出
   * conversionFactor は API未対応のため暫定で1を設定（基準単位扱い）
   */
  toUomDto(
    apiDto: UomApiDto,
    groupCode: string,
    groupName: string,
    baseUomId: string,
  ): UomDto {
    const isBaseUom = apiDto.id === baseUomId;
    return {
      id: apiDto.id,
      uomCode: apiDto.uomCode,
      uomName: apiDto.uomName,
      uomSymbol: apiDto.uomSymbol,
      uomGroupId: apiDto.uomGroupId, // BFF契約で必須
      groupId: apiDto.uomGroupId, // alias
      groupCode,
      groupName,
      conversionFactor: 1, // TODO: API契約に追加後、正しい値を設定
      isBaseUom, // BFF算出
      isActive: apiDto.isActive,
      version: apiDto.version,
      createdAt: apiDto.createdAt,
      updatedAt: apiDto.updatedAt,
      createdBy: apiDto.createdByLoginAccountId,
      updatedBy: apiDto.updatedByLoginAccountId,
    };
  }

  /**
   * API Response → BFF Response (Uom一覧)
   * page/pageSize を追加、isBaseUom を算出
   */
  toUomListResponse(
    apiResponse: ListUomsApiResponse,
    page: number,
    pageSize: number,
    groupInfoMap: Map<string, { groupCode: string; groupName: string; baseUomId: string }>,
  ): ListUomsResponse {
    const totalPages = Math.ceil(apiResponse.total / pageSize);

    return {
      items: apiResponse.items.map((item) => {
        const groupInfo = groupInfoMap.get(item.uomGroupId);
        return this.toUomDto(
          item,
          groupInfo?.groupCode ?? '',
          groupInfo?.groupName ?? '',
          groupInfo?.baseUomId ?? '',
        );
      }),
      page,
      pageSize,
      total: apiResponse.total,
      totalPages,
    };
  }

  /**
   * BFF Request → API Request (Uom新規登録)
   */
  toCreateUomApiRequest(request: CreateUomRequest): CreateUomApiRequest {
    return {
      uomCode: request.uomCode,
      uomName: request.uomName,
      uomSymbol: request.uomSymbol,
      groupId: request.uomGroupId, // BFF契約: uomGroupId → API契約: groupId
    };
  }

  /**
   * BFF Request → API Request (Uom更新)
   */
  toUpdateUomApiRequest(request: UpdateUomRequest): UpdateUomApiRequest {
    return {
      uomName: request.uomName,
      uomSymbol: request.uomSymbol,
      version: request.version,
    };
  }

  /**
   * UomApiDto → UomSummaryDto
   */
  toUomSummary(uom: UomApiDto): UomSummaryDto {
    return {
      id: uom.id,
      uomCode: uom.uomCode,
      uomName: uom.uomName,
    };
  }
}
