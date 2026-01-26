import { Injectable } from '@nestjs/common';
import {
  TaxCodeApiDto,
  TaxBusinessCategoryApiDto,
  TaxRateForDropdownApiDto,
  ListTaxCodesApiResponse,
  ListTaxBusinessCategoriesApiResponse,
  ListTaxRatesForDropdownApiResponse,
  CreateTaxCodeApiRequest as CreateApiReq,
  UpdateTaxCodeApiRequest as UpdateApiReq,
} from '@procure/contracts/api/tax-code';
import {
  TaxCodeDto,
  TaxBusinessCategoryDto,
  TaxRateForDropdownDto,
  ListTaxCodesResponse,
  ListTaxBusinessCategoriesResponse,
  ListTaxRatesForDropdownResponse,
  CreateTaxCodeRequest,
  UpdateTaxCodeRequest,
} from '@procure/contracts/bff/tax-code';

/**
 * Tax Code Mapper
 *
 * API DTO ↔ BFF DTO の変換
 */
@Injectable()
export class TaxCodeMapper {
  /**
   * API DTO → BFF DTO (税コード単体)
   */
  toDto(apiDto: TaxCodeApiDto): TaxCodeDto {
    return {
      id: apiDto.id,
      taxCode: apiDto.taxCode,
      taxBusinessCategoryId: apiDto.taxBusinessCategoryId,
      taxBusinessCategoryCode: apiDto.taxBusinessCategoryCode,
      taxBusinessCategoryName: apiDto.taxBusinessCategoryName,
      taxRateId: apiDto.taxRateId,
      taxRateCode: apiDto.taxRateCode,
      ratePercent: apiDto.ratePercent,
      taxInOut: apiDto.taxInOut,
      isActive: apiDto.isActive,
      version: apiDto.version,
      createdAt: apiDto.createdAt,
      updatedAt: apiDto.updatedAt,
      createdBy: apiDto.createdBy,
      updatedBy: apiDto.updatedBy,
    };
  }

  /**
   * API DTO → BFF DTO (税区分単体)
   */
  toTaxBusinessCategoryDto(apiDto: TaxBusinessCategoryApiDto): TaxBusinessCategoryDto {
    return {
      id: apiDto.id,
      taxBusinessCategoryCode: apiDto.taxBusinessCategoryCode,
      taxBusinessCategoryName: apiDto.taxBusinessCategoryName,
    };
  }

  /**
   * API DTO → BFF DTO (税率ドロップダウン単体)
   */
  toTaxRateForDropdownDto(apiDto: TaxRateForDropdownApiDto): TaxRateForDropdownDto {
    return {
      id: apiDto.id,
      taxRateCode: apiDto.taxRateCode,
      ratePercent: apiDto.ratePercent,
      validFrom: apiDto.validFrom,
      validTo: apiDto.validTo,
    };
  }

  /**
   * API Response → BFF Response (一覧)
   * page/pageSize を追加
   */
  toListResponse(
    apiResponse: ListTaxCodesApiResponse,
    page: number,
    pageSize: number,
  ): ListTaxCodesResponse {
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
   * API Response → BFF Response (税区分一覧)
   */
  toTaxBusinessCategoriesResponse(
    apiResponse: ListTaxBusinessCategoriesApiResponse,
  ): ListTaxBusinessCategoriesResponse {
    return {
      items: apiResponse.items.map((item) => this.toTaxBusinessCategoryDto(item)),
    };
  }

  /**
   * API Response → BFF Response (税率ドロップダウン一覧)
   */
  toTaxRatesForDropdownResponse(
    apiResponse: ListTaxRatesForDropdownApiResponse,
  ): ListTaxRatesForDropdownResponse {
    return {
      items: apiResponse.items.map((item) => this.toTaxRateForDropdownDto(item)),
    };
  }

  /**
   * BFF Request → API Request (新規登録)
   */
  toCreateApiRequest(request: CreateTaxCodeRequest): CreateApiReq {
    return {
      taxCode: request.taxCode,
      taxBusinessCategoryId: request.taxBusinessCategoryId,
      taxRateId: request.taxRateId,
      taxInOut: request.taxInOut,
      isActive: request.isActive,
    };
  }

  /**
   * BFF Request → API Request (更新)
   */
  toUpdateApiRequest(request: UpdateTaxCodeRequest): UpdateApiReq {
    return {
      isActive: request.isActive,
      version: request.version,
    };
  }
}
