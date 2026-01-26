/**
 * API Error Contracts: Tax Code
 *
 * 税コードマスタ用エラーコード定義
 * SSoT: packages/contracts/src/api/errors/tax-code-error.ts
 */

export const TAX_CODE_ERROR_CODES = {
  /** 税コードが見つからない (404) */
  TAX_CODE_NOT_FOUND: 'TAX_CODE_NOT_FOUND',
  /** 税コードが重複している (409) */
  TAX_CODE_DUPLICATE: 'TAX_CODE_DUPLICATE',
  /** 税区分が見つからない (400) */
  TAX_BUSINESS_CATEGORY_NOT_FOUND: 'TAX_BUSINESS_CATEGORY_NOT_FOUND',
  /** 税率が見つからない (400) */
  TAX_RATE_NOT_FOUND: 'TAX_RATE_NOT_FOUND',
  /** 楽観ロック競合（versionが一致しない） (409) */
  VERSION_CONFLICT: 'VERSION_CONFLICT',
  /** 変更不可フィールドの更新試行 (400) */
  IMMUTABLE_FIELD_UPDATE: 'IMMUTABLE_FIELD_UPDATE',
} as const;

export type TaxCodeErrorCode =
  (typeof TAX_CODE_ERROR_CODES)[keyof typeof TAX_CODE_ERROR_CODES];

/**
 * エラーコードに対応するHTTPステータスコード
 */
export const TaxCodeErrorHttpStatus: Record<TaxCodeErrorCode, number> = {
  [TAX_CODE_ERROR_CODES.TAX_CODE_NOT_FOUND]: 404,
  [TAX_CODE_ERROR_CODES.TAX_CODE_DUPLICATE]: 409,
  [TAX_CODE_ERROR_CODES.TAX_BUSINESS_CATEGORY_NOT_FOUND]: 400,
  [TAX_CODE_ERROR_CODES.TAX_RATE_NOT_FOUND]: 400,
  [TAX_CODE_ERROR_CODES.VERSION_CONFLICT]: 409,
  [TAX_CODE_ERROR_CODES.IMMUTABLE_FIELD_UPDATE]: 400,
};

/**
 * エラーコードに対応するデフォルトメッセージ
 */
export const TaxCodeErrorMessage: Record<TaxCodeErrorCode, string> = {
  [TAX_CODE_ERROR_CODES.TAX_CODE_NOT_FOUND]: '指定された税コードが見つかりません',
  [TAX_CODE_ERROR_CODES.TAX_CODE_DUPLICATE]: '同じ税コードが既に存在します',
  [TAX_CODE_ERROR_CODES.TAX_BUSINESS_CATEGORY_NOT_FOUND]: '指定された税区分が見つかりません',
  [TAX_CODE_ERROR_CODES.TAX_RATE_NOT_FOUND]: '指定された税率が見つかりません',
  [TAX_CODE_ERROR_CODES.VERSION_CONFLICT]: '他のユーザーによって更新されています。画面を更新してください',
  [TAX_CODE_ERROR_CODES.IMMUTABLE_FIELD_UPDATE]: 'このフィールドは変更できません',
};
