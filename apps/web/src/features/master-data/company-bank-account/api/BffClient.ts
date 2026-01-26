/**
 * Company Bank Account BFF Client Interface
 *
 * UI <-> BFF の API クライアント抽象
 */

// Re-export types from BFF contracts
export type {
  CompanyBankAccountDto,
  CompanyAccountCategory,
  CompanyAccountType,
  CompanyBankAccountSortBy,
  SortOrder,
  ListCompanyBankAccountsRequest,
  ListCompanyBankAccountsResponse,
  GetCompanyBankAccountResponse,
  CreateCompanyBankAccountRequest,
  CreateCompanyBankAccountResponse,
  UpdateCompanyBankAccountRequest,
  UpdateCompanyBankAccountResponse,
  DeactivateCompanyBankAccountRequest,
  DeactivateCompanyBankAccountResponse,
  ActivateCompanyBankAccountRequest,
  ActivateCompanyBankAccountResponse,
  SetDefaultCompanyBankAccountRequest,
  SetDefaultCompanyBankAccountResponse,
} from '@contracts/bff/company-bank-account';

import type {
  ListCompanyBankAccountsRequest,
  ListCompanyBankAccountsResponse,
  GetCompanyBankAccountResponse,
  CreateCompanyBankAccountRequest,
  CreateCompanyBankAccountResponse,
  UpdateCompanyBankAccountRequest,
  UpdateCompanyBankAccountResponse,
  DeactivateCompanyBankAccountRequest,
  DeactivateCompanyBankAccountResponse,
  ActivateCompanyBankAccountRequest,
  ActivateCompanyBankAccountResponse,
  SetDefaultCompanyBankAccountRequest,
  SetDefaultCompanyBankAccountResponse,
} from '@contracts/bff/company-bank-account';

/**
 * BFF API Error
 */
export interface BffApiError {
  code: string;
  message: string;
}

/**
 * Company Bank Account BFF Client Interface
 */
export interface CompanyBankAccountBffClient {
  // List
  listAccounts(
    request: ListCompanyBankAccountsRequest,
  ): Promise<ListCompanyBankAccountsResponse>;

  // Get
  getAccount(id: string): Promise<GetCompanyBankAccountResponse>;

  // Create
  createAccount(
    request: CreateCompanyBankAccountRequest,
  ): Promise<CreateCompanyBankAccountResponse>;

  // Update
  updateAccount(
    id: string,
    request: UpdateCompanyBankAccountRequest,
  ): Promise<UpdateCompanyBankAccountResponse>;

  // Deactivate
  deactivateAccount(
    id: string,
    request: DeactivateCompanyBankAccountRequest,
  ): Promise<DeactivateCompanyBankAccountResponse>;

  // Activate
  activateAccount(
    id: string,
    request: ActivateCompanyBankAccountRequest,
  ): Promise<ActivateCompanyBankAccountResponse>;

  // Set Default
  setDefaultAccount(
    id: string,
    request: SetDefaultCompanyBankAccountRequest,
  ): Promise<SetDefaultCompanyBankAccountResponse>;
}
