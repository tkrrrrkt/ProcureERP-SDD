import { Injectable } from '@nestjs/common';
import {
  CompanyBankAccountApiDto,
  ListCompanyBankAccountsApiResponse,
  CreateCompanyBankAccountApiRequest as CreateApiReq,
  UpdateCompanyBankAccountApiRequest as UpdateApiReq,
} from '@procure/contracts/api/company-bank-account';
import {
  CompanyBankAccountDto,
  ListCompanyBankAccountsResponse,
  CreateCompanyBankAccountRequest,
  UpdateCompanyBankAccountRequest,
} from '@procure/contracts/bff/company-bank-account';

/**
 * Company Bank Account Mapper
 *
 * API DTO ↔ BFF DTO の変換
 */
@Injectable()
export class CompanyBankAccountMapper {
  /**
   * API DTO → BFF DTO (単体)
   */
  toDto(apiDto: CompanyBankAccountApiDto): CompanyBankAccountDto {
    return {
      id: apiDto.id,
      accountCode: apiDto.accountCode,
      accountName: apiDto.accountName,
      accountCategory: apiDto.accountCategory,
      bankId: apiDto.bankId,
      bankBranchId: apiDto.bankBranchId,
      bankCode: apiDto.bankCode,
      bankName: apiDto.bankName,
      branchCode: apiDto.branchCode,
      branchName: apiDto.branchName,
      postOfficeSymbol: apiDto.postOfficeSymbol,
      postOfficeNumber: apiDto.postOfficeNumber,
      accountType: apiDto.accountType,
      accountNo: apiDto.accountNo,
      accountHolderName: apiDto.accountHolderName,
      accountHolderNameKana: apiDto.accountHolderNameKana,
      consignorCode: apiDto.consignorCode,
      isDefault: apiDto.isDefault,
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
   */
  toListResponse(
    apiResponse: ListCompanyBankAccountsApiResponse,
    page: number,
    pageSize: number,
  ): ListCompanyBankAccountsResponse {
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
  toCreateApiRequest(request: CreateCompanyBankAccountRequest): CreateApiReq {
    return {
      accountCode: request.accountCode,
      accountName: request.accountName,
      accountCategory: request.accountCategory,
      bankId: request.bankId,
      bankBranchId: request.bankBranchId,
      postOfficeSymbol: request.postOfficeSymbol,
      postOfficeNumber: request.postOfficeNumber,
      accountType: request.accountType,
      accountNo: request.accountNo,
      accountHolderName: request.accountHolderName,
      accountHolderNameKana: request.accountHolderNameKana,
      consignorCode: request.consignorCode,
      isDefault: request.isDefault,
      notes: request.notes,
    };
  }

  /**
   * BFF Request → API Request (更新)
   */
  toUpdateApiRequest(request: UpdateCompanyBankAccountRequest): UpdateApiReq {
    return {
      accountName: request.accountName,
      accountCategory: request.accountCategory,
      bankId: request.bankId,
      bankBranchId: request.bankBranchId,
      postOfficeSymbol: request.postOfficeSymbol,
      postOfficeNumber: request.postOfficeNumber,
      accountType: request.accountType,
      accountNo: request.accountNo,
      accountHolderName: request.accountHolderName,
      accountHolderNameKana: request.accountHolderNameKana,
      consignorCode: request.consignorCode,
      isDefault: request.isDefault,
      isActive: request.isActive,
      notes: request.notes,
      version: request.version,
    };
  }
}
