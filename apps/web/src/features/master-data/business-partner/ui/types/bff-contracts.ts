// BFF DTO types (normally imported from packages/contracts/src/bff)
// These should be imported from @contracts/bff/business-partner in production

export type SortOrder = "asc" | "desc"

export type PartySortBy = "partyCode" | "partyName" | "partyNameKana" | "isSupplier" | "isCustomer" | "isActive"

export interface PartyDto {
  id: string
  partyCode: string
  partyName: string
  partyNameKana: string | null
  isSupplier: boolean
  isCustomer: boolean
  isActive: boolean
  remarks: string | null
  version: number
  createdAt: string
  updatedAt: string
  createdBy: string | null
  updatedBy: string | null
}

export interface SupplierSiteDto {
  id: string
  partyId: string
  supplierSubCode: string
  supplierCode: string
  supplierName: string
  supplierNameKana: string | null
  payeeId: string
  // Payee reference info (for display)
  payeeCode: string
  payeeName: string
  postalCode: string | null
  prefecture: string | null
  city: string | null
  addressLine1: string | null
  addressLine2: string | null
  phone: string | null
  fax: string | null
  email: string | null
  contactName: string | null
  isActive: boolean
  version: number
  createdAt: string
  updatedAt: string
  createdBy: string | null
  updatedBy: string | null
}

export interface PayeeDto {
  id: string
  partyId: string
  payeeSubCode: string
  payeeCode: string
  payeeName: string
  payeeNameKana: string | null
  postalCode: string | null
  prefecture: string | null
  city: string | null
  addressLine1: string | null
  addressLine2: string | null
  phone: string | null
  fax: string | null
  email: string | null
  contactName: string | null
  paymentMethod: string | null
  currencyCode: string | null
  paymentTermsText: string | null
  isActive: boolean
  version: number
  createdAt: string
  updatedAt: string
  createdBy: string | null
  updatedBy: string | null
}

export interface ListPartiesRequest {
  page?: number
  pageSize?: number
  sortBy?: PartySortBy
  sortOrder?: SortOrder
  keyword?: string
  isSupplier?: boolean
  isCustomer?: boolean
}

export interface ListPartiesResponse {
  items: PartyDto[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface GetPartyResponse {
  party: PartyDto
}

export interface CreatePartyRequest {
  partyCode: string
  partyName: string
  partyNameKana?: string
  remarks?: string
  isActive?: boolean
}

export interface CreatePartyResponse {
  party: PartyDto
}

export interface UpdatePartyRequest {
  partyName: string
  partyNameKana?: string
  remarks?: string
  isActive?: boolean
  version: number
}

export interface UpdatePartyResponse {
  party: PartyDto
}

export interface ListSupplierSitesRequest {
  partyId: string
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: SortOrder
  keyword?: string
}

export interface ListSupplierSitesResponse {
  items: SupplierSiteDto[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface GetSupplierSiteResponse {
  supplierSite: SupplierSiteDto
}

export interface CreateSupplierSiteRequest {
  partyId: string
  supplierSubCode: string
  supplierName: string
  supplierNameKana?: string
  payeeId?: string
  payeeSubCode?: string
  payeeName?: string
  payeeNameKana?: string
  postalCode?: string
  prefecture?: string
  city?: string
  addressLine1?: string
  addressLine2?: string
  phone?: string
  fax?: string
  email?: string
  contactName?: string
  paymentMethod?: string
  currencyCode?: string
  paymentTermsText?: string
}

export interface CreateSupplierSiteResponse {
  supplierSite: SupplierSiteDto
}

export interface UpdateSupplierSiteRequest {
  supplierName: string
  supplierNameKana?: string
  payeeId?: string // Allow changing payee association
  postalCode?: string
  prefecture?: string
  city?: string
  addressLine1?: string
  addressLine2?: string
  phone?: string
  fax?: string
  email?: string
  contactName?: string
  isActive?: boolean
  version: number
}

export interface UpdateSupplierSiteResponse {
  supplierSite: SupplierSiteDto
}

export interface ListPayeesRequest {
  partyId: string
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: SortOrder
  keyword?: string
}

export interface ListPayeesResponse {
  items: PayeeDto[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface GetPayeeResponse {
  payee: PayeeDto
}

export interface CreatePayeeRequest {
  partyId: string
  payeeSubCode: string
  payeeName: string
  payeeNameKana?: string
  postalCode?: string
  prefecture?: string
  city?: string
  addressLine1?: string
  addressLine2?: string
  phone?: string
  fax?: string
  email?: string
  contactName?: string
  paymentMethod?: string
  currencyCode?: string
  paymentTermsText?: string
}

export interface CreatePayeeResponse {
  payee: PayeeDto
}

export interface UpdatePayeeRequest {
  payeeName: string
  payeeNameKana?: string
  postalCode?: string
  prefecture?: string
  city?: string
  addressLine1?: string
  addressLine2?: string
  phone?: string
  fax?: string
  email?: string
  contactName?: string
  paymentMethod?: string
  currencyCode?: string
  paymentTermsText?: string
  isActive?: boolean
  version: number
}

export interface UpdatePayeeResponse {
  payee: PayeeDto
}

export type BffErrorCode =
  | "PARTY_NOT_FOUND"
  | "PARTY_CODE_DUPLICATE"
  | "SUPPLIER_SITE_NOT_FOUND"
  | "SUPPLIER_CODE_DUPLICATE"
  | "PAYEE_NOT_FOUND"
  | "PAYEE_CODE_DUPLICATE"
  | "INVALID_CODE_LENGTH"
  | "REQUIRED_FIELD_MISSING"
  | "CONCURRENT_UPDATE"

export interface BffError {
  code: BffErrorCode
  message: string
  field?: string
}
