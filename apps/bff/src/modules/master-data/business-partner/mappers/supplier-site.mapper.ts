/**
 * SupplierSite Mapper
 *
 * API DTO ↔ BFF DTO の変換
 */

import { Injectable } from '@nestjs/common';
import {
  SupplierSiteApiDto,
  ListSupplierSitesApiResponse,
  CreateSupplierSiteApiRequest as CreateApiReq,
  UpdateSupplierSiteApiRequest as UpdateApiReq,
} from '@procure/contracts/api/business-partner';
import {
  SupplierSiteDto,
  ListSupplierSitesResponse,
  CreateSupplierSiteRequest,
  UpdateSupplierSiteRequest,
} from '@procure/contracts/bff/business-partner';

@Injectable()
export class SupplierSiteMapper {
  /**
   * API DTO → BFF DTO (単体)
   * Note: payeeCode, payeeName は別途参照が必要（Payee情報をルックアップ）
   */
  toDto(apiDto: SupplierSiteApiDto, payeeCode?: string, payeeName?: string): SupplierSiteDto {
    return {
      id: apiDto.id,
      partyId: apiDto.partyId,
      supplierSubCode: apiDto.supplierSubCode,
      supplierCode: apiDto.supplierCode,
      supplierName: apiDto.supplierName,
      supplierNameKana: apiDto.supplierNameKana,
      postalCode: apiDto.postalCode,
      prefecture: apiDto.prefecture,
      city: apiDto.city,
      addressLine1: apiDto.addressLine1,
      addressLine2: apiDto.addressLine2,
      phone: apiDto.phone,
      fax: apiDto.fax,
      email: apiDto.email,
      contactName: apiDto.contactName,
      payeeId: apiDto.payeeId,
      // 参照表示用フィールド
      payeeCode: payeeCode ?? '',
      payeeName: payeeName ?? '',
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
   * Note: payeeCode, payeeName は別途取得が必要
   */
  toListResponse(
    apiResponse: ListSupplierSitesApiResponse,
    page: number,
    pageSize: number,
    payeeMap?: Map<string, { code: string; name: string }>,
  ): ListSupplierSitesResponse {
    const totalPages = Math.ceil(apiResponse.total / pageSize);

    return {
      items: apiResponse.items.map((item) => {
        const payeeInfo = payeeMap?.get(item.payeeId);
        return this.toDto(item, payeeInfo?.code, payeeInfo?.name);
      }),
      page,
      pageSize,
      total: apiResponse.total,
      totalPages,
    };
  }

  /**
   * BFF Request → API Request (新規登録)
   */
  toCreateApiRequest(request: CreateSupplierSiteRequest): CreateApiReq {
    return {
      partyId: request.partyId,
      supplierSubCode: request.supplierSubCode,
      supplierName: request.supplierName,
      supplierNameKana: request.supplierNameKana,
      postalCode: request.postalCode,
      prefecture: request.prefecture,
      city: request.city,
      addressLine1: request.addressLine1,
      addressLine2: request.addressLine2,
      phone: request.phone,
      fax: request.fax,
      email: request.email,
      contactName: request.contactName,
      payeeId: request.payeeId,
      payeeSubCode: request.payeeSubCode,
      payeeName: request.payeeName,
      payeeNameKana: request.payeeNameKana,
      paymentMethod: request.paymentMethod,
      currencyCode: request.currencyCode,
      paymentTermsText: request.paymentTermsText,
      notes: request.notes,
    };
  }

  /**
   * BFF Request → API Request (更新)
   */
  toUpdateApiRequest(request: UpdateSupplierSiteRequest): UpdateApiReq {
    return {
      supplierName: request.supplierName,
      supplierNameKana: request.supplierNameKana,
      postalCode: request.postalCode,
      prefecture: request.prefecture,
      city: request.city,
      addressLine1: request.addressLine1,
      addressLine2: request.addressLine2,
      phone: request.phone,
      fax: request.fax,
      email: request.email,
      contactName: request.contactName,
      payeeId: request.payeeId,
      notes: request.notes,
      isActive: request.isActive,
      version: request.version,
    };
  }
}
