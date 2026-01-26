/**
 * BFF Contracts: Company Bank Account (自社口座)
 *
 * UI <-> BFF の契約定義
 * SSoT: packages/contracts/src/bff/company-bank-account
 */

// =============================================================================
// Re-export types from API contracts
// =============================================================================

export type {
  CompanyAccountCategory,
  CompanyAccountType,
  CompanyBankAccountSortBy,
  SortOrder,
} from '../../api/company-bank-account';

// =============================================================================
// CompanyBankAccountDto (BFF)
// =============================================================================

export interface CompanyBankAccountDto {
  id: string;
  accountCode: string;
  accountName: string;
  accountCategory: 'bank' | 'post_office';
  // Bank fields
  bankId: string | null;
  bankBranchId: string | null;
  bankCode: string | null;
  bankName: string | null;
  branchCode: string | null;
  branchName: string | null;
  // Post office fields
  postOfficeSymbol: string | null;
  postOfficeNumber: string | null;
  // Common fields
  accountType: 'ordinary' | 'current' | 'savings';
  accountNo: string | null;
  accountHolderName: string;
  accountHolderNameKana: string | null;
  consignorCode: string | null;
  isDefault: boolean;
  isActive: boolean;
  notes: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
}

// =============================================================================
// List Company Bank Accounts
// =============================================================================

export interface ListCompanyBankAccountsRequest {
  page?: number; // 1-based, default: 1
  pageSize?: number; // default: 50, max: 200
  sortBy?: 'accountCode' | 'accountName' | 'isDefault' | 'isActive' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  isActive?: boolean;
}

export interface ListCompanyBankAccountsResponse {
  items: CompanyBankAccountDto[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// =============================================================================
// Get Company Bank Account
// =============================================================================

export interface GetCompanyBankAccountResponse {
  account: CompanyBankAccountDto;
}

// =============================================================================
// Create Company Bank Account
// =============================================================================

export interface CreateCompanyBankAccountRequest {
  accountCode: string;
  accountName: string;
  accountCategory: 'bank' | 'post_office';
  bankId?: string;
  bankBranchId?: string;
  postOfficeSymbol?: string;
  postOfficeNumber?: string;
  accountType: 'ordinary' | 'current' | 'savings';
  accountNo?: string;
  accountHolderName: string;
  accountHolderNameKana?: string;
  consignorCode?: string;
  isDefault?: boolean;
  notes?: string;
}

export interface CreateCompanyBankAccountResponse {
  account: CompanyBankAccountDto;
}

// =============================================================================
// Update Company Bank Account
// =============================================================================

export interface UpdateCompanyBankAccountRequest {
  accountName: string;
  accountCategory: 'bank' | 'post_office';
  bankId?: string;
  bankBranchId?: string;
  postOfficeSymbol?: string;
  postOfficeNumber?: string;
  accountType: 'ordinary' | 'current' | 'savings';
  accountNo?: string;
  accountHolderName: string;
  accountHolderNameKana?: string;
  consignorCode?: string;
  isDefault: boolean;
  isActive: boolean;
  notes?: string;
  version: number;
}

export interface UpdateCompanyBankAccountResponse {
  account: CompanyBankAccountDto;
}

// =============================================================================
// Deactivate Company Bank Account
// =============================================================================

export interface DeactivateCompanyBankAccountRequest {
  version: number;
}

export interface DeactivateCompanyBankAccountResponse {
  account: CompanyBankAccountDto;
}

// =============================================================================
// Activate Company Bank Account
// =============================================================================

export interface ActivateCompanyBankAccountRequest {
  version: number;
}

export interface ActivateCompanyBankAccountResponse {
  account: CompanyBankAccountDto;
}

// =============================================================================
// Set Default Company Bank Account
// =============================================================================

export interface SetDefaultCompanyBankAccountRequest {
  version: number;
}

export interface SetDefaultCompanyBankAccountResponse {
  account: CompanyBankAccountDto;
  previousDefault: CompanyBankAccountDto | null;
}
