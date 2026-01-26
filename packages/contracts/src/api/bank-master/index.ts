/**
 * API Contracts: Bank Master
 *
 * BFF <-> Domain API の契約定義
 * SSoT: packages/contracts/src/api/bank-master
 */

// =============================================================================
// Sort Options
// =============================================================================

export type BankSortBy =
  | 'bankCode'
  | 'bankName'
  | 'bankNameKana'
  | 'displayOrder'
  | 'isActive';

export type BranchSortBy =
  | 'branchCode'
  | 'branchName'
  | 'branchNameKana'
  | 'displayOrder'
  | 'isActive';

export type SortOrder = 'asc' | 'desc';

// =============================================================================
// BankApiDto
// =============================================================================

export interface BankApiDto {
  id: string;
  bankCode: string;
  bankName: string;
  bankNameKana: string | null;
  swiftCode: string | null;
  displayOrder: number;
  isActive: boolean;
  version: number;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  createdBy: string | null; // login_account_id
  updatedBy: string | null; // login_account_id
}

// =============================================================================
// BranchApiDto
// =============================================================================

export interface BranchApiDto {
  id: string;
  bankId: string;
  branchCode: string;
  branchName: string;
  branchNameKana: string | null;
  displayOrder: number;
  isActive: boolean;
  version: number;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  createdBy: string | null; // login_account_id
  updatedBy: string | null; // login_account_id
}

// =============================================================================
// Warning Response Type
// =============================================================================

export interface WarningInfo {
  code: string;
  message: string;
}

// =============================================================================
// List Banks
// =============================================================================

export interface ListBanksApiRequest {
  offset: number; // 0-based
  limit: number;
  sortBy?: BankSortBy; // default: 'displayOrder'
  sortOrder?: SortOrder; // default: 'asc'
  keyword?: string; // partial match on bankCode, bankName, bankNameKana
  isActive?: boolean; // filter by active status
}

export interface ListBanksApiResponse {
  items: BankApiDto[];
  total: number;
}

// =============================================================================
// Get Bank
// =============================================================================

export interface GetBankApiResponse {
  bank: BankApiDto;
}

// =============================================================================
// Create Bank
// =============================================================================

export interface CreateBankApiRequest {
  bankCode: string; // 4-digit numeric (Zengin code)
  bankName: string;
  bankNameKana?: string;
  swiftCode?: string;
  displayOrder?: number; // default: 1000
  isActive?: boolean; // default: true
}

export interface CreateBankApiResponse {
  bank: BankApiDto;
}

// =============================================================================
// Update Bank
// =============================================================================

export interface UpdateBankApiRequest {
  // bankCode is NOT updatable
  bankName: string;
  bankNameKana?: string;
  swiftCode?: string;
  displayOrder: number;
  isActive: boolean;
  version: number; // optimistic lock
}

export interface UpdateBankApiResponse {
  bank: BankApiDto;
}

// =============================================================================
// Deactivate Bank
// =============================================================================

export interface DeactivateBankApiRequest {
  version: number;
}

export interface DeactivateBankApiResponse {
  bank: BankApiDto;
  warnings?: WarningInfo[]; // e.g., HAS_ACTIVE_BRANCHES
}

// =============================================================================
// Activate Bank
// =============================================================================

export interface ActivateBankApiRequest {
  version: number;
}

export interface ActivateBankApiResponse {
  bank: BankApiDto;
}

// =============================================================================
// List Branches
// =============================================================================

export interface ListBranchesApiRequest {
  offset: number; // 0-based
  limit: number;
  sortBy?: BranchSortBy; // default: 'displayOrder'
  sortOrder?: SortOrder; // default: 'asc'
  keyword?: string; // partial match on branchCode, branchName, branchNameKana
  isActive?: boolean; // filter by active status
}

export interface ListBranchesApiResponse {
  items: BranchApiDto[];
  total: number;
}

// =============================================================================
// Get Branch
// =============================================================================

export interface GetBranchApiResponse {
  branch: BranchApiDto;
}

// =============================================================================
// Create Branch
// =============================================================================

export interface CreateBranchApiRequest {
  branchCode: string; // 3-digit numeric (Zengin code)
  branchName: string;
  branchNameKana?: string;
  displayOrder?: number; // default: 1000
  isActive?: boolean; // default: true
}

export interface CreateBranchApiResponse {
  branch: BranchApiDto;
}

// =============================================================================
// Update Branch
// =============================================================================

export interface UpdateBranchApiRequest {
  // branchCode is NOT updatable
  branchName: string;
  branchNameKana?: string;
  displayOrder: number;
  isActive: boolean;
  version: number; // optimistic lock
}

export interface UpdateBranchApiResponse {
  branch: BranchApiDto;
}

// =============================================================================
// Deactivate Branch
// =============================================================================

export interface DeactivateBranchApiRequest {
  version: number;
}

export interface DeactivateBranchApiResponse {
  branch: BranchApiDto;
  warnings?: WarningInfo[]; // e.g., BRANCH_IN_USE
}

// =============================================================================
// Activate Branch
// =============================================================================

export interface ActivateBranchApiRequest {
  version: number;
}

export interface ActivateBranchApiResponse {
  branch: BranchApiDto;
}
