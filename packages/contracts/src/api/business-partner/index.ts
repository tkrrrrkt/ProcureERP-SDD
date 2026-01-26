/**
 * API Contracts: Business Partner (Party / SupplierSite / Payee)
 *
 * BFF ↔ Domain API の契約定義
 * SSoT: packages/contracts/src/api/business-partner
 *
 * Entity Definition: .kiro/specs/spec_doc/61_機能設計検討/02_エンティティ定義/03_取引先系マスタ関係.md
 */

// =============================================================================
// Common Types
// =============================================================================

export type SortOrder = 'asc' | 'desc';

export type PartySortBy =
  | 'partyCode'
  | 'partyName'
  | 'partyNameKana'
  | 'isSupplier'
  | 'isCustomer'
  | 'isActive';

export type SupplierSiteSortBy =
  | 'supplierCode'
  | 'supplierName'
  | 'supplierNameKana'
  | 'isActive';

export type PayeeSortBy = 'payeeCode' | 'payeeName' | 'payeeNameKana' | 'isActive';

// =============================================================================
// Party (取引先法人)
// =============================================================================

/**
 * Party API DTO - 取引先法人
 * 相手方の法人そのもの（会社単位で1レコード）
 */
export interface PartyApiDto {
  id: string;
  partyCode: string; // 10桁固定
  partyName: string; // 正式名称
  partyNameKana: string | null; // カナ
  partyShortName: string | null; // 略称
  countryCode: string | null; // ISO 2文字コード (e.g., "JP")
  postalCode: string | null; // ハイフン可
  prefecture: string | null;
  city: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  phone: string | null; // 代表電話
  fax: string | null;
  websiteUrl: string | null;
  corporateNumber: string | null; // 法人番号（日本）
  invoiceRegistrationNo: string | null; // インボイス登録番号
  isSupplier: boolean; // 仕入先系を持つか（派生フラグ）
  isCustomer: boolean; // 得意先系を持つか（派生フラグ）
  isActive: boolean;
  notes: string | null; // メモ
  version: number;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  createdBy: string | null; // login_account_id
  updatedBy: string | null; // login_account_id
}

export interface ListPartiesApiRequest {
  offset: number; // 0-based
  limit: number;
  sortBy?: PartySortBy; // default: 'partyCode'
  sortOrder?: SortOrder; // default: 'asc'
  keyword?: string; // partyCode, partyName, partyNameKana で部分一致検索
  isSupplier?: boolean;
  isCustomer?: boolean;
}

export interface ListPartiesApiResponse {
  items: PartyApiDto[];
  total: number;
}

export interface GetPartyApiResponse {
  party: PartyApiDto;
}

export interface CreatePartyApiRequest {
  partyCode: string; // 10桁固定
  partyName: string;
  partyNameKana?: string;
  partyShortName?: string;
  countryCode?: string;
  postalCode?: string;
  prefecture?: string;
  city?: string;
  addressLine1?: string;
  addressLine2?: string;
  phone?: string;
  fax?: string;
  websiteUrl?: string;
  corporateNumber?: string;
  invoiceRegistrationNo?: string;
  notes?: string;
  isActive?: boolean; // default: true
}

export interface CreatePartyApiResponse {
  party: PartyApiDto;
}

export interface UpdatePartyApiRequest {
  partyName: string;
  partyNameKana?: string;
  partyShortName?: string;
  countryCode?: string;
  postalCode?: string;
  prefecture?: string;
  city?: string;
  addressLine1?: string;
  addressLine2?: string;
  phone?: string;
  fax?: string;
  websiteUrl?: string;
  corporateNumber?: string;
  invoiceRegistrationNo?: string;
  notes?: string;
  isActive?: boolean;
  version: number; // 楽観ロック
}

export interface UpdatePartyApiResponse {
  party: PartyApiDto;
}

// =============================================================================
// SupplierSite (仕入先拠点)
// =============================================================================

/**
 * SupplierSite API DTO - 仕入先拠点
 * 取引先（Party）に紐づく「購買の実務窓口」拠点
 */
export interface SupplierSiteApiDto {
  id: string;
  partyId: string;
  supplierSubCode: string; // 10桁固定
  supplierCode: string; // 表示用（party_code + "-" + supplier_sub_code）最大21文字
  supplierName: string; // 拠点名
  supplierNameKana: string | null;
  postalCode: string | null;
  prefecture: string | null;
  city: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  phone: string | null;
  fax: string | null;
  email: string | null;
  contactName: string | null;
  payeeId: string; // FK payees
  isActive: boolean;
  notes: string | null;
  version: number;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  createdBy: string | null; // login_account_id
  updatedBy: string | null; // login_account_id
}

export interface ListSupplierSitesApiRequest {
  partyId: string;
  offset: number; // 0-based
  limit: number;
  sortBy?: SupplierSiteSortBy; // default: 'supplierCode'
  sortOrder?: SortOrder; // default: 'asc'
  keyword?: string; // supplierCode, supplierName で部分一致検索
}

export interface ListSupplierSitesApiResponse {
  items: SupplierSiteApiDto[];
  total: number;
}

export interface GetSupplierSiteApiResponse {
  supplierSite: SupplierSiteApiDto;
}

export interface CreateSupplierSiteApiRequest {
  partyId: string;
  supplierSubCode: string; // 10桁固定
  supplierName: string;
  supplierNameKana?: string;
  postalCode?: string;
  prefecture?: string;
  city?: string;
  addressLine1?: string;
  addressLine2?: string;
  phone?: string;
  fax?: string;
  email?: string;
  contactName?: string;
  payeeId?: string; // 未指定なら自動生成
  // Payee自動生成時の初期値
  payeeSubCode?: string; // 未指定の場合 supplierSubCode を使用
  payeeName?: string;
  payeeNameKana?: string;
  paymentMethod?: string;
  currencyCode?: string;
  paymentTermsText?: string;
  notes?: string;
}

export interface CreateSupplierSiteApiResponse {
  supplierSite: SupplierSiteApiDto;
}

export interface UpdateSupplierSiteApiRequest {
  supplierName: string;
  supplierNameKana?: string;
  postalCode?: string;
  prefecture?: string;
  city?: string;
  addressLine1?: string;
  addressLine2?: string;
  phone?: string;
  fax?: string;
  email?: string;
  contactName?: string;
  payeeId?: string; // 関連Payee変更可
  notes?: string;
  isActive?: boolean;
  version: number; // 楽観ロック
}

export interface UpdateSupplierSiteApiResponse {
  supplierSite: SupplierSiteApiDto;
}

// =============================================================================
// Payee (支払先)
// =============================================================================

/**
 * Payee API DTO - 支払先
 * 支払・請求書受領・振込の単位（AP/支払の正本）
 */
export interface PayeeApiDto {
  id: string;
  partyId: string;
  payeeSubCode: string; // 10桁固定
  payeeCode: string; // 表示用（party_code + "-" + payee_sub_code）最大21文字
  payeeName: string; // 支払先名称
  payeeNameKana: string | null;
  postalCode: string | null; // payee_postal_code
  prefecture: string | null; // payee_prefecture
  city: string | null; // payee_city
  addressLine1: string | null; // payee_address_line1
  addressLine2: string | null; // payee_address_line2
  phone: string | null; // payee_phone
  fax: string | null; // payee_fax
  email: string | null; // payee_email
  contactName: string | null; // payee_contact_name
  paymentMethod: string | null; // 決済方法（V1）
  currencyCode: string | null; // 金種（V1）
  paymentTermsText: string | null; // 決済条件（V1）
  defaultCompanyBankAccountId: string | null; // デフォルト出金口座
  isActive: boolean;
  notes: string | null;
  version: number;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  createdBy: string | null; // login_account_id
  updatedBy: string | null; // login_account_id
}

export interface ListPayeesApiRequest {
  partyId: string;
  offset: number; // 0-based
  limit: number;
  sortBy?: PayeeSortBy; // default: 'payeeCode'
  sortOrder?: SortOrder; // default: 'asc'
  keyword?: string; // payeeCode, payeeName で部分一致検索
}

export interface ListPayeesApiResponse {
  items: PayeeApiDto[];
  total: number;
}

export interface GetPayeeApiResponse {
  payee: PayeeApiDto;
}

export interface CreatePayeeApiRequest {
  partyId: string;
  payeeSubCode: string; // 10桁固定
  payeeName: string;
  payeeNameKana?: string;
  postalCode?: string;
  prefecture?: string;
  city?: string;
  addressLine1?: string;
  addressLine2?: string;
  phone?: string;
  fax?: string;
  email?: string;
  contactName?: string;
  paymentMethod?: string;
  currencyCode?: string;
  paymentTermsText?: string;
  defaultCompanyBankAccountId?: string;
  notes?: string;
}

export interface CreatePayeeApiResponse {
  payee: PayeeApiDto;
}

export interface UpdatePayeeApiRequest {
  payeeName: string;
  payeeNameKana?: string;
  postalCode?: string;
  prefecture?: string;
  city?: string;
  addressLine1?: string;
  addressLine2?: string;
  phone?: string;
  fax?: string;
  email?: string;
  contactName?: string;
  paymentMethod?: string;
  currencyCode?: string;
  paymentTermsText?: string;
  defaultCompanyBankAccountId?: string | null;
  notes?: string;
  isActive?: boolean;
  version: number; // 楽観ロック
}

export interface UpdatePayeeApiResponse {
  payee: PayeeApiDto;
}
