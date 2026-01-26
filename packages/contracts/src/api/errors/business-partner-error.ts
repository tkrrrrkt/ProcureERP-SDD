/**
 * Error Codes: Business Partner (Party / SupplierSite / Payee)
 *
 * Domain API のエラーコード定義
 * SSoT: packages/contracts/src/api/errors/business-partner-error.ts
 */

export const BusinessPartnerErrorCode = {
  // -------------------------------------------------------------------------
  // Party Errors
  // -------------------------------------------------------------------------
  /** 指定された取引先が見つからない (404) */
  PARTY_NOT_FOUND: 'PARTY_NOT_FOUND',

  /** 取引先コードが重複している (409) */
  PARTY_CODE_DUPLICATE: 'PARTY_CODE_DUPLICATE',

  /** 取引先コードの桁数が不正（10桁でない） (422) */
  PARTY_CODE_INVALID_LENGTH: 'PARTY_CODE_INVALID_LENGTH',

  /** 取引先コードの形式が不正（許可されていない文字を含む） (422) */
  PARTY_CODE_INVALID_FORMAT: 'PARTY_CODE_INVALID_FORMAT',

  // -------------------------------------------------------------------------
  // SupplierSite Errors
  // -------------------------------------------------------------------------
  /** 指定された仕入先拠点が見つからない (404) */
  SUPPLIER_SITE_NOT_FOUND: 'SUPPLIER_SITE_NOT_FOUND',

  /** 仕入先コードが重複している (409) */
  SUPPLIER_CODE_DUPLICATE: 'SUPPLIER_CODE_DUPLICATE',

  /** 仕入先枝番コードの桁数が不正（10桁でない） (422) */
  SUPPLIER_SUB_CODE_INVALID_LENGTH: 'SUPPLIER_SUB_CODE_INVALID_LENGTH',

  /** 仕入先枝番コードの形式が不正（許可されていない文字を含む） (422) */
  SUPPLIER_SUB_CODE_INVALID_FORMAT: 'SUPPLIER_SUB_CODE_INVALID_FORMAT',

  // -------------------------------------------------------------------------
  // Payee Errors
  // -------------------------------------------------------------------------
  /** 指定された支払先が見つからない (404) */
  PAYEE_NOT_FOUND: 'PAYEE_NOT_FOUND',

  /** 支払先コードが重複している (409) */
  PAYEE_CODE_DUPLICATE: 'PAYEE_CODE_DUPLICATE',

  /** 支払先枝番コードの桁数が不正（10桁でない） (422) */
  PAYEE_SUB_CODE_INVALID_LENGTH: 'PAYEE_SUB_CODE_INVALID_LENGTH',

  /** 支払先枝番コードの形式が不正（許可されていない文字を含む） (422) */
  PAYEE_SUB_CODE_INVALID_FORMAT: 'PAYEE_SUB_CODE_INVALID_FORMAT',

  // -------------------------------------------------------------------------
  // Common Errors
  // -------------------------------------------------------------------------
  /** 必須フィールドが未入力 (422) */
  REQUIRED_FIELD_MISSING: 'REQUIRED_FIELD_MISSING',

  /** 楽観ロックによる競合 (409) */
  CONCURRENT_UPDATE: 'CONCURRENT_UPDATE',

  /** 参照先の自社口座が見つからない (404) */
  COMPANY_BANK_ACCOUNT_NOT_FOUND: 'COMPANY_BANK_ACCOUNT_NOT_FOUND',
} as const;

export type BusinessPartnerErrorCode =
  (typeof BusinessPartnerErrorCode)[keyof typeof BusinessPartnerErrorCode];

/**
 * エラーコードに対応するHTTPステータスコード
 */
export const BusinessPartnerErrorHttpStatus: Record<BusinessPartnerErrorCode, number> = {
  // Party
  [BusinessPartnerErrorCode.PARTY_NOT_FOUND]: 404,
  [BusinessPartnerErrorCode.PARTY_CODE_DUPLICATE]: 409,
  [BusinessPartnerErrorCode.PARTY_CODE_INVALID_LENGTH]: 422,
  [BusinessPartnerErrorCode.PARTY_CODE_INVALID_FORMAT]: 422,
  // SupplierSite
  [BusinessPartnerErrorCode.SUPPLIER_SITE_NOT_FOUND]: 404,
  [BusinessPartnerErrorCode.SUPPLIER_CODE_DUPLICATE]: 409,
  [BusinessPartnerErrorCode.SUPPLIER_SUB_CODE_INVALID_LENGTH]: 422,
  [BusinessPartnerErrorCode.SUPPLIER_SUB_CODE_INVALID_FORMAT]: 422,
  // Payee
  [BusinessPartnerErrorCode.PAYEE_NOT_FOUND]: 404,
  [BusinessPartnerErrorCode.PAYEE_CODE_DUPLICATE]: 409,
  [BusinessPartnerErrorCode.PAYEE_SUB_CODE_INVALID_LENGTH]: 422,
  [BusinessPartnerErrorCode.PAYEE_SUB_CODE_INVALID_FORMAT]: 422,
  // Common
  [BusinessPartnerErrorCode.REQUIRED_FIELD_MISSING]: 422,
  [BusinessPartnerErrorCode.CONCURRENT_UPDATE]: 409,
  [BusinessPartnerErrorCode.COMPANY_BANK_ACCOUNT_NOT_FOUND]: 404,
};

/**
 * エラーコードに対応するデフォルトメッセージ
 */
export const BusinessPartnerErrorMessage: Record<BusinessPartnerErrorCode, string> = {
  // Party
  [BusinessPartnerErrorCode.PARTY_NOT_FOUND]: '指定された取引先が見つかりません',
  [BusinessPartnerErrorCode.PARTY_CODE_DUPLICATE]: '取引先コードが重複しています',
  [BusinessPartnerErrorCode.PARTY_CODE_INVALID_LENGTH]: '取引先コードは10桁で入力してください',
  [BusinessPartnerErrorCode.PARTY_CODE_INVALID_FORMAT]:
    '取引先コードに使用できない文字が含まれています',
  // SupplierSite
  [BusinessPartnerErrorCode.SUPPLIER_SITE_NOT_FOUND]: '指定された仕入先拠点が見つかりません',
  [BusinessPartnerErrorCode.SUPPLIER_CODE_DUPLICATE]: '仕入先コードが重複しています',
  [BusinessPartnerErrorCode.SUPPLIER_SUB_CODE_INVALID_LENGTH]:
    '仕入先枝番コードは10桁で入力してください',
  [BusinessPartnerErrorCode.SUPPLIER_SUB_CODE_INVALID_FORMAT]:
    '仕入先枝番コードに使用できない文字が含まれています',
  // Payee
  [BusinessPartnerErrorCode.PAYEE_NOT_FOUND]: '指定された支払先が見つかりません',
  [BusinessPartnerErrorCode.PAYEE_CODE_DUPLICATE]: '支払先コードが重複しています',
  [BusinessPartnerErrorCode.PAYEE_SUB_CODE_INVALID_LENGTH]:
    '支払先枝番コードは10桁で入力してください',
  [BusinessPartnerErrorCode.PAYEE_SUB_CODE_INVALID_FORMAT]:
    '支払先枝番コードに使用できない文字が含まれています',
  // Common
  [BusinessPartnerErrorCode.REQUIRED_FIELD_MISSING]: '必須項目が入力されていません',
  [BusinessPartnerErrorCode.CONCURRENT_UPDATE]:
    '他のユーザーによって更新されています。再度読み込んでください',
  [BusinessPartnerErrorCode.COMPANY_BANK_ACCOUNT_NOT_FOUND]:
    '指定された自社口座が見つかりません',
};
