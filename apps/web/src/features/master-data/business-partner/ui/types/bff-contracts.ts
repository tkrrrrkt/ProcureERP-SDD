// BFF DTO types - re-exported from @contracts/bff/business-partner
// This file maps the shared contracts to the local feature
export type {
  SortOrder,
  PartySortBy,
  SupplierSiteSortBy,
  PayeeSortBy,
  PartyDto,
  SupplierSiteDto,
  PayeeDto,
  ListPartiesRequest,
  ListPartiesResponse,
  GetPartyResponse,
  CreatePartyRequest,
  CreatePartyResponse,
  UpdatePartyRequest,
  UpdatePartyResponse,
  ListSupplierSitesRequest,
  ListSupplierSitesResponse,
  GetSupplierSiteResponse,
  CreateSupplierSiteRequest,
  CreateSupplierSiteResponse,
  UpdateSupplierSiteRequest,
  UpdateSupplierSiteResponse,
  ListPayeesRequest,
  ListPayeesResponse,
  GetPayeeResponse,
  CreatePayeeRequest,
  CreatePayeeResponse,
  UpdatePayeeRequest,
  UpdatePayeeResponse,
  BusinessPartnerErrorCode,
  BusinessPartnerError,
} from "@contracts/bff/business-partner"

// =============================================================================
// Payee Bank Account (from payee-bank-account feature)
// =============================================================================

export type AccountCategory = "bank" | "post_office" | "ja_bank"
export type AccountType = "ordinary" | "current" | "savings" | "other"
export type TransferFeeBearer = "sender" | "recipient"

export interface PayeeBankAccountDto {
  id: string
  payeeId: string
  accountCategory: AccountCategory
  bankId: string | null
  bankBranchId: string | null
  bankCode: string | null
  bankName: string | null
  branchCode: string | null
  branchName: string | null
  postOfficeSymbol: string | null
  postOfficeNumber: string | null
  accountType: AccountType
  accountNo: string | null
  accountHolderName: string
  accountHolderNameKana: string | null
  transferFeeBearer: TransferFeeBearer
  isDefault: boolean
  isActive: boolean
  notes: string | null
  version: number
  createdAt: string
  updatedAt: string
  createdBy: string | null
  updatedBy: string | null
}

export interface ListPayeeBankAccountsRequest {
  payeeId: string
  isActive?: boolean
}

export interface ListPayeeBankAccountsResponse {
  items: PayeeBankAccountDto[]
  total: number
}

export interface CreatePayeeBankAccountRequest {
  payeeId: string
  accountCategory: AccountCategory
  bankId?: string
  bankBranchId?: string
  postOfficeSymbol?: string
  postOfficeNumber?: string
  accountType: AccountType
  accountNo?: string
  accountHolderName: string
  accountHolderNameKana?: string
  transferFeeBearer: TransferFeeBearer
  isDefault?: boolean
  notes?: string
}

export interface CreatePayeeBankAccountResponse {
  account: PayeeBankAccountDto
}

export interface UpdatePayeeBankAccountRequest {
  accountCategory: AccountCategory
  bankId?: string
  bankBranchId?: string
  postOfficeSymbol?: string
  postOfficeNumber?: string
  accountType: AccountType
  accountNo?: string
  accountHolderName: string
  accountHolderNameKana?: string
  transferFeeBearer: TransferFeeBearer
  isDefault: boolean
  isActive: boolean
  notes?: string
  version: number
}

export interface UpdatePayeeBankAccountResponse {
  account: PayeeBankAccountDto
}

// =============================================================================
// Bank / Branch Search (for PayeeBankAccount registration)
// =============================================================================

export interface BankSummary {
  id: string
  bankCode: string
  bankName: string
  bankNameKana: string | null
}

export interface BranchSummary {
  id: string
  branchCode: string
  branchName: string
  branchNameKana: string | null
}

export interface SearchBanksRequest {
  keyword: string
  limit?: number
}

export interface SearchBanksResponse {
  items: BankSummary[]
  total: number
}

export interface SearchBranchesRequest {
  bankId: string
  keyword: string
  limit?: number
}

export interface SearchBranchesResponse {
  items: BranchSummary[]
  total: number
}

// =============================================================================
// Company Bank Account (自社口座 - for 出金口座選択)
// =============================================================================

export interface CompanyBankAccountSummary {
  id: string
  accountName: string
  bankName: string
  branchName: string
  accountNo: string
  isActive: boolean
}

export interface ListCompanyBankAccountsRequest {
  isActive?: boolean
}

export interface ListCompanyBankAccountsResponse {
  items: CompanyBankAccountSummary[]
  total: number
}

// =============================================================================
// Error Types (alias)
// =============================================================================

export type BffErrorCode = import("@contracts/bff/business-partner").BusinessPartnerErrorCode

export interface BffError {
  code: BffErrorCode
  message: string
  field?: string
}
