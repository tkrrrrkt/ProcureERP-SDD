/**
 * BFF Client Interface for Bank Master
 *
 * contracts/bff の型を使用し、BFFエンドポイントへのアクセスを抽象化
 */

// contracts/bff から型を再エクスポート
export type {
  BankDto,
  BranchDto,
  BankSortBy,
  BranchSortBy,
  SortOrder,
  WarningInfo,
  // Bank
  ListBanksRequest,
  ListBanksResponse,
  GetBankResponse,
  CreateBankRequest,
  CreateBankResponse,
  UpdateBankRequest,
  UpdateBankResponse,
  DeactivateBankRequest,
  DeactivateBankResponse,
  ActivateBankRequest,
  ActivateBankResponse,
  // Branch
  ListBranchesRequest,
  ListBranchesResponse,
  GetBranchResponse,
  CreateBranchRequest,
  CreateBranchResponse,
  UpdateBranchRequest,
  UpdateBranchResponse,
  DeactivateBranchRequest,
  DeactivateBranchResponse,
  ActivateBranchRequest,
  ActivateBranchResponse,
} from '@contracts/bff/bank-master';

// contracts/bff/errors からエラー型を再エクスポート
export {
  BankMasterErrorCode,
  BankMasterErrorHttpStatus,
  BankMasterErrorMessage,
  BankMasterWarningCode,
  BankMasterWarningMessage,
} from '@contracts/bff/errors';

import {
  BankMasterErrorCode as ErrorCode,
  BankMasterErrorMessage,
} from '@contracts/bff/errors';

/**
 * BFF API Error
 * APIからのエラーレスポンスを表現するカスタムエラー
 */
export class BffApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = 'BffApiError';
  }

  /**
   * エラーコードからユーザー向けメッセージを取得
   */
  static getMessageForCode(code: string): string {
    const errorCode = code as ErrorCode;
    return BankMasterErrorMessage[errorCode] || 'エラーが発生しました';
  }
}

import type {
  ListBanksRequest,
  ListBanksResponse,
  GetBankResponse,
  CreateBankRequest,
  CreateBankResponse,
  UpdateBankRequest,
  UpdateBankResponse,
  DeactivateBankRequest,
  DeactivateBankResponse,
  ActivateBankRequest,
  ActivateBankResponse,
  ListBranchesRequest,
  ListBranchesResponse,
  GetBranchResponse,
  CreateBranchRequest,
  CreateBranchResponse,
  UpdateBranchRequest,
  UpdateBranchResponse,
  DeactivateBranchRequest,
  DeactivateBranchResponse,
  ActivateBranchRequest,
  ActivateBranchResponse,
} from '@contracts/bff/bank-master';

/**
 * BFF Client Interface
 */
export interface BffClient {
  // =============================================================================
  // Bank APIs
  // =============================================================================

  listBanks(request: ListBanksRequest): Promise<ListBanksResponse>;
  getBank(id: string): Promise<GetBankResponse>;
  createBank(request: CreateBankRequest): Promise<CreateBankResponse>;
  updateBank(id: string, request: UpdateBankRequest): Promise<UpdateBankResponse>;
  deactivateBank(id: string, request: DeactivateBankRequest): Promise<DeactivateBankResponse>;
  activateBank(id: string, request: ActivateBankRequest): Promise<ActivateBankResponse>;

  // =============================================================================
  // Branch APIs
  // =============================================================================

  listBranches(bankId: string, request: ListBranchesRequest): Promise<ListBranchesResponse>;
  getBranch(bankId: string, branchId: string): Promise<GetBranchResponse>;
  createBranch(bankId: string, request: CreateBranchRequest): Promise<CreateBranchResponse>;
  updateBranch(
    bankId: string,
    branchId: string,
    request: UpdateBranchRequest,
  ): Promise<UpdateBranchResponse>;
  deactivateBranch(
    bankId: string,
    branchId: string,
    request: DeactivateBranchRequest,
  ): Promise<DeactivateBranchResponse>;
  activateBranch(
    bankId: string,
    branchId: string,
    request: ActivateBranchRequest,
  ): Promise<ActivateBranchResponse>;
}
