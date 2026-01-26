/**
 * BFF Contracts: Business Partner (Party / SupplierSite / Payee)
 *
 * Entity Definition: .kiro/specs/spec_doc/61_機能設計検討/02_エンティティ定義/03_取引先系マスタ関係.md
 */

// =============================================================================
// Common Types
// =============================================================================

export type SortOrder = "asc" | "desc"

export type PartySortBy =
  | "partyCode"
  | "partyName"
  | "partyNameKana"
  | "isSupplier"
  | "isCustomer"
  | "isActive"

export type SupplierSiteSortBy =
  | "supplierCode"
  | "supplierName"
  | "supplierNameKana"
  | "isActive"

export type PayeeSortBy =
  | "payeeCode"
  | "payeeName"
  | "payeeNameKana"
  | "isActive"

// =============================================================================
// Party (取引先法人)
// =============================================================================

/**
 * Party DTO - 取引先法人
 * 相手方の法人そのもの（会社単位で1レコード）
 */
export interface PartyDto {
  id: string
  partyCode: string // 10桁固定
  partyName: string // 正式名称
  partyNameKana: string | null // カナ
  partyShortName: string | null // 略称
  countryCode: string | null // ISO 2文字コード (e.g., "JP")
  postalCode: string | null // ハイフン可
  prefecture: string | null
  city: string | null
  addressLine1: string | null
  addressLine2: string | null
  phone: string | null // 代表電話
  fax: string | null
  websiteUrl: string | null
  corporateNumber: string | null // 法人番号（日本）
  invoiceRegistrationNo: string | null // インボイス登録番号
  isSupplier: boolean // 仕入先系を持つか（派生フラグ）
  isCustomer: boolean // 得意先系を持つか（派生フラグ）
  isActive: boolean
  notes: string | null // メモ
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
  keyword?: string // partyCode, partyName, partyNameKana で部分一致検索
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
  partyCode: string // 10桁固定
  partyName: string
  partyNameKana?: string
  partyShortName?: string
  countryCode?: string
  postalCode?: string
  prefecture?: string
  city?: string
  addressLine1?: string
  addressLine2?: string
  phone?: string
  fax?: string
  websiteUrl?: string
  corporateNumber?: string
  invoiceRegistrationNo?: string
  notes?: string
  isActive?: boolean // default: true
}

export interface CreatePartyResponse {
  party: PartyDto
}

export interface UpdatePartyRequest {
  partyName: string
  partyNameKana?: string
  partyShortName?: string
  countryCode?: string
  postalCode?: string
  prefecture?: string
  city?: string
  addressLine1?: string
  addressLine2?: string
  phone?: string
  fax?: string
  websiteUrl?: string
  corporateNumber?: string
  invoiceRegistrationNo?: string
  notes?: string
  isActive?: boolean
  version: number // 楽観ロック
}

export interface UpdatePartyResponse {
  party: PartyDto
}

// =============================================================================
// SupplierSite (仕入先拠点)
// =============================================================================

/**
 * SupplierSite DTO - 仕入先拠点
 * 取引先（Party）に紐づく「購買の実務窓口」拠点
 */
export interface SupplierSiteDto {
  id: string
  partyId: string
  supplierSubCode: string // 10桁固定
  supplierCode: string // 表示用（party_code + "-" + supplier_sub_code）最大21文字
  supplierName: string // 拠点名
  supplierNameKana: string | null
  postalCode: string | null
  prefecture: string | null
  city: string | null
  addressLine1: string | null
  addressLine2: string | null
  phone: string | null
  fax: string | null
  email: string | null
  contactName: string | null
  payeeId: string // FK payees
  // Payee reference info (for display)
  payeeCode: string
  payeeName: string
  isActive: boolean
  notes: string | null
  version: number
  createdAt: string
  updatedAt: string
  createdBy: string | null
  updatedBy: string | null
}

export interface ListSupplierSitesRequest {
  partyId: string
  page?: number
  pageSize?: number
  sortBy?: SupplierSiteSortBy
  sortOrder?: SortOrder
  keyword?: string // supplierCode, supplierName で部分一致検索
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
  supplierSubCode: string // 10桁固定
  supplierName: string
  supplierNameKana?: string
  postalCode?: string
  prefecture?: string
  city?: string
  addressLine1?: string
  addressLine2?: string
  phone?: string
  fax?: string
  email?: string
  contactName?: string
  payeeId?: string // 未指定なら自動生成
  // Payee自動生成時の初期値
  payeeSubCode?: string // 未指定の場合 supplierSubCode を使用
  payeeName?: string
  payeeNameKana?: string
  paymentMethod?: string
  currencyCode?: string
  paymentTermsText?: string
  notes?: string
}

export interface CreateSupplierSiteResponse {
  supplierSite: SupplierSiteDto
}

export interface UpdateSupplierSiteRequest {
  supplierName: string
  supplierNameKana?: string
  postalCode?: string
  prefecture?: string
  city?: string
  addressLine1?: string
  addressLine2?: string
  phone?: string
  fax?: string
  email?: string
  contactName?: string
  payeeId?: string // 関連Payee変更可
  notes?: string
  isActive?: boolean
  version: number // 楽観ロック
}

export interface UpdateSupplierSiteResponse {
  supplierSite: SupplierSiteDto
}

// =============================================================================
// Payee (支払先)
// =============================================================================

/**
 * Payee DTO - 支払先
 * 支払・請求書受領・振込の単位（AP/支払の正本）
 */
export interface PayeeDto {
  id: string
  partyId: string
  payeeSubCode: string // 10桁固定
  payeeCode: string // 表示用（party_code + "-" + payee_sub_code）最大21文字
  payeeName: string // 支払先名称
  payeeNameKana: string | null
  postalCode: string | null // payee_postal_code
  prefecture: string | null // payee_prefecture
  city: string | null // payee_city
  addressLine1: string | null // payee_address_line1
  addressLine2: string | null // payee_address_line2
  phone: string | null // payee_phone
  fax: string | null // payee_fax
  email: string | null // payee_email
  contactName: string | null // payee_contact_name
  paymentMethod: string | null // 決済方法（V1）
  currencyCode: string | null // 金種（V1）
  paymentTermsText: string | null // 決済条件（V1）
  // デフォルト出金口座（自社口座）
  defaultCompanyBankAccountId: string | null
  defaultCompanyBankAccountName: string | null // 参照表示用
  defaultCompanyBankName: string | null // 参照表示用
  isActive: boolean
  notes: string | null
  version: number
  createdAt: string
  updatedAt: string
  createdBy: string | null
  updatedBy: string | null
}

export interface ListPayeesRequest {
  partyId: string
  page?: number
  pageSize?: number
  sortBy?: PayeeSortBy
  sortOrder?: SortOrder
  keyword?: string // payeeCode, payeeName で部分一致検索
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
  payeeSubCode: string // 10桁固定
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
  defaultCompanyBankAccountId?: string
  notes?: string
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
  defaultCompanyBankAccountId?: string | null
  notes?: string
  isActive?: boolean
  version: number // 楽観ロック
}

export interface UpdatePayeeResponse {
  payee: PayeeDto
}

// =============================================================================
// Error Types
// =============================================================================

export type BusinessPartnerErrorCode =
  // Party errors
  | "PARTY_NOT_FOUND"
  | "PARTY_CODE_DUPLICATE"
  | "PARTY_CODE_INVALID_LENGTH"
  | "PARTY_CODE_INVALID_FORMAT"
  // SupplierSite errors
  | "SUPPLIER_SITE_NOT_FOUND"
  | "SUPPLIER_CODE_DUPLICATE"
  | "SUPPLIER_SUB_CODE_INVALID_LENGTH"
  | "SUPPLIER_SUB_CODE_INVALID_FORMAT"
  // Payee errors
  | "PAYEE_NOT_FOUND"
  | "PAYEE_CODE_DUPLICATE"
  | "PAYEE_SUB_CODE_INVALID_LENGTH"
  | "PAYEE_SUB_CODE_INVALID_FORMAT"
  // Common errors
  | "REQUIRED_FIELD_MISSING"
  | "CONCURRENT_UPDATE"

export interface BusinessPartnerError {
  code: BusinessPartnerErrorCode
  message: string
  field?: string
}
