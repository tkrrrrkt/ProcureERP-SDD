import { Injectable } from '@nestjs/common';
import {
  BankApiDto,
  BranchApiDto,
  ListBanksApiResponse,
  ListBranchesApiResponse,
  CreateBankApiRequest as CreateBankApiReq,
  UpdateBankApiRequest as UpdateBankApiReq,
  CreateBranchApiRequest as CreateBranchApiReq,
  UpdateBranchApiRequest as UpdateBranchApiReq,
} from '@procure/contracts/api/bank-master';
import {
  BankDto,
  BranchDto,
  ListBanksResponse,
  ListBranchesResponse,
  CreateBankRequest,
  UpdateBankRequest,
  CreateBranchRequest,
  UpdateBranchRequest,
} from '@procure/contracts/bff/bank-master';

/**
 * Bank Master Mapper
 *
 * API DTO ↔ BFF DTO の変換
 */
@Injectable()
export class BankMasterMapper {
  // =============================================================================
  // Bank Mappings
  // =============================================================================

  /**
   * API DTO → BFF DTO (銀行単体)
   */
  toBankDto(apiDto: BankApiDto): BankDto {
    return {
      id: apiDto.id,
      bankCode: apiDto.bankCode,
      bankName: apiDto.bankName,
      bankNameKana: apiDto.bankNameKana,
      swiftCode: apiDto.swiftCode,
      displayOrder: apiDto.displayOrder,
      isActive: apiDto.isActive,
      version: apiDto.version,
      createdAt: apiDto.createdAt,
      updatedAt: apiDto.updatedAt,
      createdBy: apiDto.createdBy,
      updatedBy: apiDto.updatedBy,
    };
  }

  /**
   * API Response → BFF Response (銀行一覧)
   * page/pageSize を追加
   */
  toBankListResponse(
    apiResponse: ListBanksApiResponse,
    page: number,
    pageSize: number,
  ): ListBanksResponse {
    const totalPages = Math.ceil(apiResponse.total / pageSize);

    return {
      items: apiResponse.items.map((item) => this.toBankDto(item)),
      page,
      pageSize,
      total: apiResponse.total,
      totalPages,
    };
  }

  /**
   * BFF Request → API Request (銀行新規登録)
   */
  toCreateBankApiRequest(request: CreateBankRequest): CreateBankApiReq {
    return {
      bankCode: request.bankCode,
      bankName: request.bankName,
      bankNameKana: request.bankNameKana,
      swiftCode: request.swiftCode,
      displayOrder: request.displayOrder,
      isActive: request.isActive,
    };
  }

  /**
   * BFF Request → API Request (銀行更新)
   */
  toUpdateBankApiRequest(request: UpdateBankRequest): UpdateBankApiReq {
    return {
      bankName: request.bankName,
      bankNameKana: request.bankNameKana,
      swiftCode: request.swiftCode,
      displayOrder: request.displayOrder,
      isActive: request.isActive,
      version: request.version,
    };
  }

  // =============================================================================
  // Branch Mappings
  // =============================================================================

  /**
   * API DTO → BFF DTO (支店単体)
   */
  toBranchDto(apiDto: BranchApiDto): BranchDto {
    return {
      id: apiDto.id,
      bankId: apiDto.bankId,
      branchCode: apiDto.branchCode,
      branchName: apiDto.branchName,
      branchNameKana: apiDto.branchNameKana,
      displayOrder: apiDto.displayOrder,
      isActive: apiDto.isActive,
      version: apiDto.version,
      createdAt: apiDto.createdAt,
      updatedAt: apiDto.updatedAt,
      createdBy: apiDto.createdBy,
      updatedBy: apiDto.updatedBy,
    };
  }

  /**
   * API Response → BFF Response (支店一覧)
   * page/pageSize を追加
   */
  toBranchListResponse(
    apiResponse: ListBranchesApiResponse,
    page: number,
    pageSize: number,
  ): ListBranchesResponse {
    const totalPages = Math.ceil(apiResponse.total / pageSize);

    return {
      items: apiResponse.items.map((item) => this.toBranchDto(item)),
      page,
      pageSize,
      total: apiResponse.total,
      totalPages,
    };
  }

  /**
   * BFF Request → API Request (支店新規登録)
   */
  toCreateBranchApiRequest(request: CreateBranchRequest): CreateBranchApiReq {
    return {
      branchCode: request.branchCode,
      branchName: request.branchName,
      branchNameKana: request.branchNameKana,
      displayOrder: request.displayOrder,
      isActive: request.isActive,
    };
  }

  /**
   * BFF Request → API Request (支店更新)
   */
  toUpdateBranchApiRequest(request: UpdateBranchRequest): UpdateBranchApiReq {
    return {
      branchName: request.branchName,
      branchNameKana: request.branchNameKana,
      displayOrder: request.displayOrder,
      isActive: request.isActive,
      version: request.version,
    };
  }
}
