import { Injectable } from '@nestjs/common';
import {
  WarehouseApiDto,
  ListWarehousesApiResponse,
  CreateWarehouseApiRequest as CreateWarehouseApiReq,
  UpdateWarehouseApiRequest as UpdateWarehouseApiReq,
} from '@procure/contracts/api/warehouse';
import {
  WarehouseDto,
  ListWarehousesResponse,
  CreateWarehouseRequest,
  UpdateWarehouseRequest,
} from '@procure/contracts/bff/warehouse';

/**
 * Warehouse Mapper
 *
 * API DTO ↔ BFF DTO の変換
 * - page/pageSize ↔ offset/limit 変換
 * - totalPages の算出
 */
@Injectable()
export class WarehouseMapper {
  /**
   * API DTO → BFF DTO (倉庫単体)
   */
  toWarehouseDto(apiDto: WarehouseApiDto): WarehouseDto {
    return {
      id: apiDto.id,
      warehouseCode: apiDto.warehouseCode,
      warehouseName: apiDto.warehouseName,
      warehouseNameKana: apiDto.warehouseNameKana,
      warehouseGroupId: apiDto.warehouseGroupId,
      postalCode: apiDto.postalCode,
      prefecture: apiDto.prefecture,
      city: apiDto.city,
      address1: apiDto.address1,
      address2: apiDto.address2,
      phoneNumber: apiDto.phoneNumber,
      isDefaultReceiving: apiDto.isDefaultReceiving,
      displayOrder: apiDto.displayOrder,
      notes: apiDto.notes,
      isActive: apiDto.isActive,
      version: apiDto.version,
      createdAt: apiDto.createdAt,
      updatedAt: apiDto.updatedAt,
      createdBy: apiDto.createdBy,
      updatedBy: apiDto.updatedBy,
    };
  }

  /**
   * API Response → BFF Response (倉庫一覧)
   * page/pageSize を追加、totalPages を算出
   */
  toWarehouseListResponse(
    apiResponse: ListWarehousesApiResponse,
    page: number,
    pageSize: number,
  ): ListWarehousesResponse {
    const totalPages = Math.ceil(apiResponse.total / pageSize);

    return {
      items: apiResponse.items.map((item) => this.toWarehouseDto(item)),
      page,
      pageSize,
      total: apiResponse.total,
      totalPages,
    };
  }

  /**
   * BFF Request → API Request (倉庫新規登録)
   */
  toCreateWarehouseApiRequest(
    request: CreateWarehouseRequest,
  ): CreateWarehouseApiReq {
    return {
      warehouseCode: request.warehouseCode,
      warehouseName: request.warehouseName,
      warehouseNameKana: request.warehouseNameKana,
      warehouseGroupId: request.warehouseGroupId,
      postalCode: request.postalCode,
      prefecture: request.prefecture,
      city: request.city,
      address1: request.address1,
      address2: request.address2,
      phoneNumber: request.phoneNumber,
      isDefaultReceiving: request.isDefaultReceiving,
      displayOrder: request.displayOrder,
      notes: request.notes,
      isActive: request.isActive,
    };
  }

  /**
   * BFF Request → API Request (倉庫更新)
   */
  toUpdateWarehouseApiRequest(
    request: UpdateWarehouseRequest,
  ): UpdateWarehouseApiReq {
    return {
      warehouseName: request.warehouseName,
      warehouseNameKana: request.warehouseNameKana,
      warehouseGroupId: request.warehouseGroupId,
      postalCode: request.postalCode,
      prefecture: request.prefecture,
      city: request.city,
      address1: request.address1,
      address2: request.address2,
      phoneNumber: request.phoneNumber,
      isDefaultReceiving: request.isDefaultReceiving,
      displayOrder: request.displayOrder,
      notes: request.notes,
      isActive: request.isActive,
      version: request.version,
    };
  }

  /**
   * page/pageSize → offset/limit 変換
   */
  toOffsetLimit(
    page: number,
    pageSize: number,
  ): { offset: number; limit: number } {
    const offset = (page - 1) * pageSize;
    return { offset, limit: pageSize };
  }
}
