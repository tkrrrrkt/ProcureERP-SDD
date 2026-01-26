import { Injectable } from '@nestjs/common';
import {
  ShipToApiDto,
  ListShipTosApiResponse,
  CreateShipToApiRequest as CreateShipToApiReq,
  UpdateShipToApiRequest as UpdateShipToApiReq,
} from '@procure/contracts/api/ship-to';
import {
  ShipToDto,
  ListShipTosResponse,
  CreateShipToRequest,
  UpdateShipToRequest,
} from '@procure/contracts/bff/ship-to';

/**
 * ShipTo Mapper
 *
 * API DTO ↔ BFF DTO の変換
 * - page/pageSize ↔ offset/limit 変換
 * - totalPages の算出
 */
@Injectable()
export class ShipToMapper {
  /**
   * API DTO → BFF DTO (納入先単体)
   */
  toShipToDto(apiDto: ShipToApiDto): ShipToDto {
    return {
      id: apiDto.id,
      shipToCode: apiDto.shipToCode,
      shipToName: apiDto.shipToName,
      shipToNameKana: apiDto.shipToNameKana,
      customerSiteId: apiDto.customerSiteId,
      postalCode: apiDto.postalCode,
      prefecture: apiDto.prefecture,
      city: apiDto.city,
      address1: apiDto.address1,
      address2: apiDto.address2,
      phoneNumber: apiDto.phoneNumber,
      faxNumber: apiDto.faxNumber,
      email: apiDto.email,
      contactPerson: apiDto.contactPerson,
      remarks: apiDto.remarks,
      isActive: apiDto.isActive,
      version: apiDto.version,
      createdAt: apiDto.createdAt,
      updatedAt: apiDto.updatedAt,
      createdBy: apiDto.createdBy,
      updatedBy: apiDto.updatedBy,
    };
  }

  /**
   * API Response → BFF Response (納入先一覧)
   * page/pageSize を追加、totalPages を算出
   */
  toShipToListResponse(
    apiResponse: ListShipTosApiResponse,
    page: number,
    pageSize: number,
  ): ListShipTosResponse {
    const totalPages = Math.ceil(apiResponse.total / pageSize);

    return {
      items: apiResponse.items.map((item) => this.toShipToDto(item)),
      page,
      pageSize,
      total: apiResponse.total,
      totalPages,
    };
  }

  /**
   * BFF Request → API Request (納入先新規登録)
   */
  toCreateShipToApiRequest(request: CreateShipToRequest): CreateShipToApiReq {
    return {
      shipToCode: request.shipToCode,
      shipToName: request.shipToName,
      shipToNameKana: request.shipToNameKana,
      customerSiteId: request.customerSiteId,
      postalCode: request.postalCode,
      prefecture: request.prefecture,
      city: request.city,
      address1: request.address1,
      address2: request.address2,
      phoneNumber: request.phoneNumber,
      faxNumber: request.faxNumber,
      email: request.email,
      contactPerson: request.contactPerson,
      remarks: request.remarks,
      isActive: request.isActive,
    };
  }

  /**
   * BFF Request → API Request (納入先更新)
   */
  toUpdateShipToApiRequest(request: UpdateShipToRequest): UpdateShipToApiReq {
    return {
      shipToName: request.shipToName,
      shipToNameKana: request.shipToNameKana,
      customerSiteId: request.customerSiteId,
      postalCode: request.postalCode,
      prefecture: request.prefecture,
      city: request.city,
      address1: request.address1,
      address2: request.address2,
      phoneNumber: request.phoneNumber,
      faxNumber: request.faxNumber,
      email: request.email,
      contactPerson: request.contactPerson,
      remarks: request.remarks,
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
