/**
 * API Contracts: Company Bank Account (自社口座 / 出金口座)
 *
 * BFF <-> Domain API の契約定義
 * SSoT: packages/contracts/src/api/company-bank-account
 */

// =============================================================================
// Enums / Types
// =============================================================================

export type CompanyAccountCategory = 'bank' | 'post_office';
export type CompanyAccountType = 'ordinary' | 'current' | 'savings';
export type CompanyBankAccountSortBy = 'accountCode' | 'accountName' | 'isDefault' | 'isActive' | 'createdAt';
export type SortOrder = 'asc' | 'desc';

// =============================================================================
// CompanyBankAccountApiDto
// =============================================================================

export interface CompanyBankAccountApiDto {
  id: string;
  accountCode: string;
  accountName: string;
  accountCategory: CompanyAccountCategory;
  // Bank fields (for bank)
  bankId: string | null;
  bankBranchId: string | null;
  bankCode: string | null; // Denormalized for display
  bankName: string | null; // Denormalized for display
  branchCode: string | null; // Denormalized for display
  branchName: string | null; // Denormalized for display
  // Post office fields
  postOfficeSymbol: string | null;
  postOfficeNumber: string | null;
  // Common fields
  accountType: CompanyAccountType;
  accountNo: string | null; // 7 digits for bank
  accountHolderName: string;
  accountHolderNameKana: string | null;
  consignorCode: string | null; // 10 digits for Zengin FB
  isDefault: boolean;
  isActive: boolean;
  notes: string | null;
  version: number;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  createdBy: string | null;
  updatedBy: string | null;
}

// =============================================================================
// List Company Bank Accounts
// =============================================================================

export interface ListCompanyBankAccountsApiRequest {
  offset: number;
  limit: number;
  sortBy?: CompanyBankAccountSortBy;
  sortOrder?: SortOrder;
  isActive?: boolean;
}

export interface ListCompanyBankAccountsApiResponse {
  items: CompanyBankAccountApiDto[];
  total: number;
}

// =============================================================================
// Get Company Bank Account
// =============================================================================

export interface GetCompanyBankAccountApiResponse {
  account: CompanyBankAccountApiDto;
}

// =============================================================================
// Create Company Bank Account
// =============================================================================

export interface CreateCompanyBankAccountApiRequest {
  accountCode: string; // max 10 chars, tenant-unique
  accountName: string;
  accountCategory: CompanyAccountCategory;
  // Bank fields (required when accountCategory = 'bank')
  bankId?: string;
  bankBranchId?: string;
  // Post office fields (required when accountCategory = 'post_office')
  postOfficeSymbol?: string; // 5 digits
  postOfficeNumber?: string; // up to 8 digits
  // Common fields
  accountType: CompanyAccountType;
  accountNo?: string; // 7 digits (required for bank)
  accountHolderName: string;
  accountHolderNameKana?: string;
  consignorCode?: string; // 10 digits
  isDefault?: boolean; // default: false
  notes?: string;
}

export interface CreateCompanyBankAccountApiResponse {
  account: CompanyBankAccountApiDto;
}

// =============================================================================
// Update Company Bank Account
// =============================================================================

export interface UpdateCompanyBankAccountApiRequest {
  // accountCode is NOT updatable
  accountName: string;
  accountCategory: CompanyAccountCategory;
  // Bank fields
  bankId?: string;
  bankBranchId?: string;
  // Post office fields
  postOfficeSymbol?: string;
  postOfficeNumber?: string;
  // Common fields
  accountType: CompanyAccountType;
  accountNo?: string;
  accountHolderName: string;
  accountHolderNameKana?: string;
  consignorCode?: string;
  isDefault: boolean;
  isActive: boolean;
  notes?: string;
  version: number; // optimistic lock
}

export interface UpdateCompanyBankAccountApiResponse {
  account: CompanyBankAccountApiDto;
}

// =============================================================================
// Deactivate Company Bank Account
// =============================================================================

export interface DeactivateCompanyBankAccountApiRequest {
  version: number;
}

export interface DeactivateCompanyBankAccountApiResponse {
  account: CompanyBankAccountApiDto;
}

// =============================================================================
// Activate Company Bank Account
// =============================================================================

export interface ActivateCompanyBankAccountApiRequest {
  version: number;
}

export interface ActivateCompanyBankAccountApiResponse {
  account: CompanyBankAccountApiDto;
}

// =============================================================================
// Set Default Company Bank Account
// =============================================================================

export interface SetDefaultCompanyBankAccountApiRequest {
  version: number;
}

export interface SetDefaultCompanyBankAccountApiResponse {
  account: CompanyBankAccountApiDto;
  previousDefault: CompanyBankAccountApiDto | null;
}
