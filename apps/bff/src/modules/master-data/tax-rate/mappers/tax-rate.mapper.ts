import { Injectable } from '@nestjs/common';
import {
  TaxRateApiDto,
  ListTaxRatesApiResponse,
  CreateTaxRateApiRequest as CreateApiReq,
  UpdateTaxRateApiRequest as UpdateApiReq,
} from '@procure/contracts/api/tax-rate';
import {
  TaxRateDto,
  ListTaxRatesResponse,
  CreateTaxRateRequest,
  UpdateTaxRateRequest,
} from '@procure/contracts/bff/tax-rate';

/**
 * Tax Rate Mapper
 *
 * API DTO ↔ BFF DTO の変換
 */
@Injectable()
export class TaxRateMapper {
  /**
   * API DTO → BFF DTO (単体)
   */
  toDto(apiDto: TaxRateApiDto): TaxRateDto {
    return {
      id: apiDto.id,
      taxRateCode: apiDto.taxRateCode,
      ratePercent: apiDto.ratePercent,
      validFrom: apiDto.validFrom,
      validTo: apiDto.validTo,
      isActive: apiDto.isActive,
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
    apiResponse: ListTaxRatesApiResponse,
    page: number,
    pageSize: number,
  ): ListTaxRatesResponse {
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
  toCreateApiRequest(request: CreateTaxRateRequest): CreateApiReq {
    return {
      taxRateCode: request.taxRateCode,
      ratePercent: request.ratePercent,
      validFrom: request.validFrom,
      validTo: request.validTo,
      isActive: request.isActive,
    };
  }

  /**
   * BFF Request → API Request (更新)
   */
  toUpdateApiRequest(request: UpdateTaxRateRequest): UpdateApiReq {
    return {
      validFrom: request.validFrom,
      validTo: request.validTo,
      isActive: request.isActive,
      version: request.version,
    };
  }
}
