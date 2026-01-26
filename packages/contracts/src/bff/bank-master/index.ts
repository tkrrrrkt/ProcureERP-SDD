/**
 * BFF Contracts: Bank Master
 *
 * UI <-> BFF の契約定義
 * SSoT: packages/contracts/src/bff/bank-master
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
// BankDto
// =============================================================================

export interface BankDto {
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
// BranchDto
// =============================================================================

export interface BranchDto {
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

export interface ListBanksRequest {
  page?: number; // 1-based, default: 1
  pageSize?: number; // default: 50, max: 200
  sortBy?: BankSortBy; // default: 'displayOrder'
  sortOrder?: SortOrder; // default: 'asc'
  keyword?: string; // partial match on bankCode, bankName, bankNameKana
  isActive?: boolean; // filter by active status
}

export interface ListBanksResponse {
  items: BankDto[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// =============================================================================
// Get Bank
// =============================================================================

export interface GetBankResponse {
  bank: BankDto;
}

// =============================================================================
// Create Bank
// =============================================================================

export interface CreateBankRequest {
  bankCode: string; // 4-digit numeric (Zengin code)
  bankName: string;
  bankNameKana?: string;
  swiftCode?: string;
  displayOrder?: number; // default: 1000
  isActive?: boolean; // default: true
}

export interface CreateBankResponse {
  bank: BankDto;
}

// =============================================================================
// Update Bank
// =============================================================================

export interface UpdateBankRequest {
  // bankCode is NOT updatable
  bankName: string;
  bankNameKana?: string;
  swiftCode?: string;
  displayOrder: number;
  isActive: boolean;
  version: number; // optimistic lock
}

export interface UpdateBankResponse {
  bank: BankDto;
}

// =============================================================================
// Deactivate Bank
// =============================================================================

export interface DeactivateBankRequest {
  version: number;
}

export interface DeactivateBankResponse {
  bank: BankDto;
  warnings?: WarningInfo[]; // e.g., HAS_ACTIVE_BRANCHES
}

// =============================================================================
// Activate Bank
// =============================================================================

export interface ActivateBankRequest {
  version: number;
}

export interface ActivateBankResponse {
  bank: BankDto;
}

// =============================================================================
// List Branches
// =============================================================================

export interface ListBranchesRequest {
  page?: number; // 1-based, default: 1
  pageSize?: number; // default: 50, max: 200
  sortBy?: BranchSortBy; // default: 'displayOrder'
  sortOrder?: SortOrder; // default: 'asc'
  keyword?: string; // partial match on branchCode, branchName, branchNameKana
  isActive?: boolean; // filter by active status
}

export interface ListBranchesResponse {
  items: BranchDto[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// =============================================================================
// Get Branch
// =============================================================================

export interface GetBranchResponse {
  branch: BranchDto;
}

// =============================================================================
// Create Branch
// =============================================================================

export interface CreateBranchRequest {
  branchCode: string; // 3-digit numeric (Zengin code)
  branchName: string;
  branchNameKana?: string;
  displayOrder?: number; // default: 1000
  isActive?: boolean; // default: true
}

export interface CreateBranchResponse {
  branch: BranchDto;
}

// =============================================================================
// Update Branch
// =============================================================================

export interface UpdateBranchRequest {
  // branchCode is NOT updatable
  branchName: string;
  branchNameKana?: string;
  displayOrder: number;
  isActive: boolean;
  version: number; // optimistic lock
}

export interface UpdateBranchResponse {
  branch: BranchDto;
}

// =============================================================================
// Deactivate Branch
// =============================================================================

export interface DeactivateBranchRequest {
  version: number;
}

export interface DeactivateBranchResponse {
  branch: BranchDto;
  warnings?: WarningInfo[]; // e.g., BRANCH_IN_USE
}

// =============================================================================
// Activate Branch
// =============================================================================

export interface ActivateBranchRequest {
  version: number;
}

export interface ActivateBranchResponse {
  branch: BranchDto;
}
