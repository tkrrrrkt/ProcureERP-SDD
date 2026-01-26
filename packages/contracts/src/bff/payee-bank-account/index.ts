/**
 * BFF Contracts: Payee Bank Account
 *
 * UI <-> BFF の契約定義
 * SSoT: packages/contracts/src/bff/payee-bank-account
 */

// =============================================================================
// Re-export types from API contracts
// =============================================================================

export type {
  AccountCategory,
  AccountType,
  TransferFeeBearer,
  PayeeBankAccountSortBy,
  SortOrder,
} from '../../api/payee-bank-account';

// =============================================================================
// PayeeBankAccountDto (BFF)
// =============================================================================

export interface PayeeBankAccountDto {
  id: string;
  payeeId: string;
  accountCategory: 'bank' | 'post_office' | 'ja_bank';
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
  accountType: 'ordinary' | 'current' | 'savings' | 'other';
  accountNo: string | null;
  accountHolderName: string;
  accountHolderNameKana: string | null;
  transferFeeBearer: 'sender' | 'recipient';
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
// List Payee Bank Accounts
// =============================================================================

export interface ListPayeeBankAccountsRequest {
  page?: number; // 1-based, default: 1
  pageSize?: number; // default: 50, max: 200
  sortBy?: 'accountHolderName' | 'isDefault' | 'isActive' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  isActive?: boolean;
}

export interface ListPayeeBankAccountsResponse {
  items: PayeeBankAccountDto[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// =============================================================================
// Get Payee Bank Account
// =============================================================================

export interface GetPayeeBankAccountResponse {
  account: PayeeBankAccountDto;
}

// =============================================================================
// Create Payee Bank Account
// =============================================================================

export interface CreatePayeeBankAccountRequest {
  accountCategory: 'bank' | 'post_office' | 'ja_bank';
  bankId?: string;
  bankBranchId?: string;
  postOfficeSymbol?: string;
  postOfficeNumber?: string;
  accountType: 'ordinary' | 'current' | 'savings' | 'other';
  accountNo?: string;
  accountHolderName: string;
  accountHolderNameKana?: string;
  transferFeeBearer: 'sender' | 'recipient';
  isDefault?: boolean;
  notes?: string;
}

export interface CreatePayeeBankAccountResponse {
  account: PayeeBankAccountDto;
}

// =============================================================================
// Update Payee Bank Account
// =============================================================================

export interface UpdatePayeeBankAccountRequest {
  accountCategory: 'bank' | 'post_office' | 'ja_bank';
  bankId?: string;
  bankBranchId?: string;
  postOfficeSymbol?: string;
  postOfficeNumber?: string;
  accountType: 'ordinary' | 'current' | 'savings' | 'other';
  accountNo?: string;
  accountHolderName: string;
  accountHolderNameKana?: string;
  transferFeeBearer: 'sender' | 'recipient';
  isDefault: boolean;
  isActive: boolean;
  notes?: string;
  version: number;
}

export interface UpdatePayeeBankAccountResponse {
  account: PayeeBankAccountDto;
}

// =============================================================================
// Deactivate Payee Bank Account
// =============================================================================

export interface DeactivatePayeeBankAccountRequest {
  version: number;
}

export interface DeactivatePayeeBankAccountResponse {
  account: PayeeBankAccountDto;
}

// =============================================================================
// Activate Payee Bank Account
// =============================================================================

export interface ActivatePayeeBankAccountRequest {
  version: number;
}

export interface ActivatePayeeBankAccountResponse {
  account: PayeeBankAccountDto;
}

// =============================================================================
// Set Default Payee Bank Account
// =============================================================================

export interface SetDefaultPayeeBankAccountRequest {
  version: number;
}

export interface SetDefaultPayeeBankAccountResponse {
  account: PayeeBankAccountDto;
  previousDefault: PayeeBankAccountDto | null;
}
