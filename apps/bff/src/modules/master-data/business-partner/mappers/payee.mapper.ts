/**
 * Payee Mapper
 *
 * API DTO ↔ BFF DTO の変換
 */

import { Injectable } from '@nestjs/common';
import {
  PayeeApiDto,
  ListPayeesApiResponse,
  CreatePayeeApiRequest as CreateApiReq,
  UpdatePayeeApiRequest as UpdateApiReq,
} from '@procure/contracts/api/business-partner';
import {
  PayeeDto,
  ListPayeesResponse,
  CreatePayeeRequest,
  UpdatePayeeRequest,
} from '@procure/contracts/bff/business-partner';

@Injectable()
export class PayeeMapper {
  /**
   * API DTO → BFF DTO (単体)
   * Note: defaultCompanyBankAccountName, defaultCompanyBankName は別途参照が必要
   */
  toDto(apiDto: PayeeApiDto): PayeeDto {
    return {
      id: apiDto.id,
      partyId: apiDto.partyId,
      payeeSubCode: apiDto.payeeSubCode,
      payeeCode: apiDto.payeeCode,
      payeeName: apiDto.payeeName,
      payeeNameKana: apiDto.payeeNameKana,
      postalCode: apiDto.postalCode,
      prefecture: apiDto.prefecture,
      city: apiDto.city,
      addressLine1: apiDto.addressLine1,
      addressLine2: apiDto.addressLine2,
      phone: apiDto.phone,
      fax: apiDto.fax,
      email: apiDto.email,
      contactName: apiDto.contactName,
      paymentMethod: apiDto.paymentMethod,
      currencyCode: apiDto.currencyCode,
      paymentTermsText: apiDto.paymentTermsText,
      defaultCompanyBankAccountId: apiDto.defaultCompanyBankAccountId,
      // 参照表示用フィールド - 将来的にはAPIから取得or追加のルックアップ
      defaultCompanyBankAccountName: null,
      defaultCompanyBankName: null,
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
    apiResponse: ListPayeesApiResponse,
    page: number,
    pageSize: number,
  ): ListPayeesResponse {
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
  toCreateApiRequest(request: CreatePayeeRequest): CreateApiReq {
    return {
      partyId: request.partyId,
      payeeSubCode: request.payeeSubCode,
      payeeName: request.payeeName,
      payeeNameKana: request.payeeNameKana,
      postalCode: request.postalCode,
      prefecture: request.prefecture,
      city: request.city,
      addressLine1: request.addressLine1,
      addressLine2: request.addressLine2,
      phone: request.phone,
      fax: request.fax,
      email: request.email,
      contactName: request.contactName,
      paymentMethod: request.paymentMethod,
      currencyCode: request.currencyCode,
      paymentTermsText: request.paymentTermsText,
      defaultCompanyBankAccountId: request.defaultCompanyBankAccountId,
      notes: request.notes,
    };
  }

  /**
   * BFF Request → API Request (更新)
   */
  toUpdateApiRequest(request: UpdatePayeeRequest): UpdateApiReq {
    return {
      payeeName: request.payeeName,
      payeeNameKana: request.payeeNameKana,
      postalCode: request.postalCode,
      prefecture: request.prefecture,
      city: request.city,
      addressLine1: request.addressLine1,
      addressLine2: request.addressLine2,
      phone: request.phone,
      fax: request.fax,
      email: request.email,
      contactName: request.contactName,
      paymentMethod: request.paymentMethod,
      currencyCode: request.currencyCode,
      paymentTermsText: request.paymentTermsText,
      defaultCompanyBankAccountId: request.defaultCompanyBankAccountId,
      notes: request.notes,
      isActive: request.isActive,
      version: request.version,
    };
  }
}
