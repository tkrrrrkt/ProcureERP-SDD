/**
 * Party Mapper
 *
 * API DTO ↔ BFF DTO の変換
 */

import { Injectable } from '@nestjs/common';
import {
  PartyApiDto,
  ListPartiesApiResponse,
  CreatePartyApiRequest as CreateApiReq,
  UpdatePartyApiRequest as UpdateApiReq,
} from '@procure/contracts/api/business-partner';
import {
  PartyDto,
  ListPartiesResponse,
  CreatePartyRequest,
  UpdatePartyRequest,
} from '@procure/contracts/bff/business-partner';

@Injectable()
export class PartyMapper {
  /**
   * API DTO → BFF DTO (単体)
   */
  toDto(apiDto: PartyApiDto): PartyDto {
    return {
      id: apiDto.id,
      partyCode: apiDto.partyCode,
      partyName: apiDto.partyName,
      partyNameKana: apiDto.partyNameKana,
      partyShortName: apiDto.partyShortName,
      countryCode: apiDto.countryCode,
      postalCode: apiDto.postalCode,
      prefecture: apiDto.prefecture,
      city: apiDto.city,
      addressLine1: apiDto.addressLine1,
      addressLine2: apiDto.addressLine2,
      phone: apiDto.phone,
      fax: apiDto.fax,
      websiteUrl: apiDto.websiteUrl,
      corporateNumber: apiDto.corporateNumber,
      invoiceRegistrationNo: apiDto.invoiceRegistrationNo,
      isSupplier: apiDto.isSupplier,
      isCustomer: apiDto.isCustomer,
      isActive: apiDto.isActive,
      notes: apiDto.notes,
      version: apiDto.version,
      createdAt: apiDto.createdAt,
      updatedAt: apiDto.updatedAt,
      createdBy: apiDto.createdBy,
      updatedBy: apiDto.updatedBy,
    };
  }

  /**
   * API Response → BFF Response (一覧)
   * page/pageSize を追加
   */
  toListResponse(
    apiResponse: ListPartiesApiResponse,
    page: number,
    pageSize: number,
  ): ListPartiesResponse {
    const totalPages = Math.ceil(apiResponse.total / pageSize);

    return {
      items: apiResponse.items.map((item) => this.toDto(item)),
      page,
      pageSize,
      total: apiResponse.total,
      totalPages,
    };
  }

  /**
   * BFF Request → API Request (新規登録)
   */
  toCreateApiRequest(request: CreatePartyRequest): CreateApiReq {
    return {
      partyCode: request.partyCode,
      partyName: request.partyName,
      partyNameKana: request.partyNameKana,
      partyShortName: request.partyShortName,
      countryCode: request.countryCode,
      postalCode: request.postalCode,
      prefecture: request.prefecture,
      city: request.city,
      addressLine1: request.addressLine1,
      addressLine2: request.addressLine2,
      phone: request.phone,
      fax: request.fax,
      websiteUrl: request.websiteUrl,
      corporateNumber: request.corporateNumber,
      invoiceRegistrationNo: request.invoiceRegistrationNo,
      notes: request.notes,
      isActive: request.isActive,
    };
  }

  /**
   * BFF Request → API Request (更新)
   */
  toUpdateApiRequest(request: UpdatePartyRequest): UpdateApiReq {
    return {
      partyName: request.partyName,
      partyNameKana: request.partyNameKana,
      partyShortName: request.partyShortName,
      countryCode: request.countryCode,
      postalCode: request.postalCode,
      prefecture: request.prefecture,
      city: request.city,
      addressLine1: request.addressLine1,
      addressLine2: request.addressLine2,
      phone: request.phone,
      fax: request.fax,
      websiteUrl: request.websiteUrl,
      corporateNumber: request.corporateNumber,
      invoiceRegistrationNo: request.invoiceRegistrationNo,
      notes: request.notes,
      isActive: request.isActive,
      version: request.version,
    };
  }
}
