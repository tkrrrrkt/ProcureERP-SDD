/**
 * API Contracts: Payee Bank Account
 *
 * BFF <-> Domain API の契約定義
 * SSoT: packages/contracts/src/api/payee-bank-account
 */

// =============================================================================
// Enums / Types
// =============================================================================

export type AccountCategory = 'bank' | 'post_office' | 'ja_bank';
export type AccountType = 'ordinary' | 'current' | 'savings' | 'other';
export type TransferFeeBearer = 'sender' | 'recipient';
export type PayeeBankAccountSortBy = 'accountHolderName' | 'isDefault' | 'isActive' | 'createdAt';
export type SortOrder = 'asc' | 'desc';

// =============================================================================
// PayeeBankAccountApiDto
// =============================================================================

export interface PayeeBankAccountApiDto {
  id: string;
  payeeId: string;
  accountCategory: AccountCategory;
  // Bank fields (for bank/ja_bank)
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
  accountType: AccountType;
  accountNo: string | null; // 7 digits for bank/ja_bank
  accountHolderName: string;
  accountHolderNameKana: string | null;
  transferFeeBearer: TransferFeeBearer;
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
// List Payee Bank Accounts
// =============================================================================

export interface ListPayeeBankAccountsApiRequest {
  offset: number;
  limit: number;
  sortBy?: PayeeBankAccountSortBy;
  sortOrder?: SortOrder;
  isActive?: boolean;
}

export interface ListPayeeBankAccountsApiResponse {
  items: PayeeBankAccountApiDto[];
  total: number;
}

// =============================================================================
// Get Payee Bank Account
// =============================================================================

export interface GetPayeeBankAccountApiResponse {
  account: PayeeBankAccountApiDto;
}

// =============================================================================
// Create Payee Bank Account
// =============================================================================

export interface CreatePayeeBankAccountApiRequest {
  accountCategory: AccountCategory;
  // Bank fields (required when accountCategory = 'bank' | 'ja_bank')
  bankId?: string;
  bankBranchId?: string;
  // Post office fields (required when accountCategory = 'post_office')
  postOfficeSymbol?: string; // 5 digits
  postOfficeNumber?: string; // up to 8 digits
  // Common fields
  accountType: AccountType;
  accountNo?: string; // 7 digits (required for bank/ja_bank)
  accountHolderName: string;
  accountHolderNameKana?: string;
  transferFeeBearer: TransferFeeBearer;
  isDefault?: boolean; // default: false
  notes?: string;
}

export interface CreatePayeeBankAccountApiResponse {
  account: PayeeBankAccountApiDto;
}

// =============================================================================
// Update Payee Bank Account
// =============================================================================

export interface UpdatePayeeBankAccountApiRequest {
  accountCategory: AccountCategory;
  // Bank fields
  bankId?: string;
  bankBranchId?: string;
  // Post office fields
  postOfficeSymbol?: string;
  postOfficeNumber?: string;
  // Common fields
  accountType: AccountType;
  accountNo?: string;
  accountHolderName: string;
  accountHolderNameKana?: string;
  transferFeeBearer: TransferFeeBearer;
  isDefault: boolean;
  isActive: boolean;
  notes?: string;
  version: number; // optimistic lock
}

export interface UpdatePayeeBankAccountApiResponse {
  account: PayeeBankAccountApiDto;
}

// =============================================================================
// Delete (Deactivate) Payee Bank Account
// =============================================================================

export interface DeactivatePayeeBankAccountApiRequest {
  version: number;
}

export interface DeactivatePayeeBankAccountApiResponse {
  account: PayeeBankAccountApiDto;
}

// =============================================================================
// Activate Payee Bank Account
// =============================================================================

export interface ActivatePayeeBankAccountApiRequest {
  version: number;
}

export interface ActivatePayeeBankAccountApiResponse {
  account: PayeeBankAccountApiDto;
}

// =============================================================================
// Set Default Payee Bank Account
// =============================================================================

export interface SetDefaultPayeeBankAccountApiRequest {
  version: number;
}

export interface SetDefaultPayeeBankAccountApiResponse {
  account: PayeeBankAccountApiDto;
  previousDefault: PayeeBankAccountApiDto | null; // The account that was previously default
}
