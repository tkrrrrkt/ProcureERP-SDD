import { Injectable } from '@nestjs/common';
import {
  PayeeBankAccountApiDto,
  ListPayeeBankAccountsApiResponse,
  CreatePayeeBankAccountApiRequest as CreateApiReq,
  UpdatePayeeBankAccountApiRequest as UpdateApiReq,
} from '@procure/contracts/api/payee-bank-account';
import {
  PayeeBankAccountDto,
  ListPayeeBankAccountsResponse,
  CreatePayeeBankAccountRequest,
  UpdatePayeeBankAccountRequest,
} from '@procure/contracts/bff/payee-bank-account';

/**
 * Payee Bank Account Mapper
 *
 * API DTO ↔ BFF DTO の変換
 */
@Injectable()
export class PayeeBankAccountMapper {
  /**
   * API DTO → BFF DTO (単体)
   */
  toDto(apiDto: PayeeBankAccountApiDto): PayeeBankAccountDto {
    return {
      id: apiDto.id,
      payeeId: apiDto.payeeId,
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
      transferFeeBearer: apiDto.transferFeeBearer,
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
    apiResponse: ListPayeeBankAccountsApiResponse,
    page: number,
    pageSize: number,
  ): ListPayeeBankAccountsResponse {
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
  toCreateApiRequest(request: CreatePayeeBankAccountRequest): CreateApiReq {
    return {
      accountCategory: request.accountCategory,
      bankId: request.bankId,
      bankBranchId: request.bankBranchId,
      postOfficeSymbol: request.postOfficeSymbol,
      postOfficeNumber: request.postOfficeNumber,
      accountType: request.accountType,
      accountNo: request.accountNo,
      accountHolderName: request.accountHolderName,
      accountHolderNameKana: request.accountHolderNameKana,
      transferFeeBearer: request.transferFeeBearer,
      isDefault: request.isDefault,
      notes: request.notes,
    };
  }

  /**
   * BFF Request → API Request (更新)
   */
  toUpdateApiRequest(request: UpdatePayeeBankAccountRequest): UpdateApiReq {
    return {
      accountCategory: request.accountCategory,
      bankId: request.bankId,
      bankBranchId: request.bankBranchId,
      postOfficeSymbol: request.postOfficeSymbol,
      postOfficeNumber: request.postOfficeNumber,
      accountType: request.accountType,
      accountNo: request.accountNo,
      accountHolderName: request.accountHolderName,
      accountHolderNameKana: request.accountHolderNameKana,
      transferFeeBearer: request.transferFeeBearer,
      isDefault: request.isDefault,
      isActive: request.isActive,
      notes: request.notes,
      version: request.version,
    };
  }
}
