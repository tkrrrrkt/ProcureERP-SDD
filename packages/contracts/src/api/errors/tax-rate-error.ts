/**
 * API Error Contracts: Tax Rate
 *
 * 税率マスタ用エラーコード定義
 * SSoT: packages/contracts/src/api/errors/tax-rate-error.ts
 */

export const TAX_RATE_ERROR_CODES = {
  /** 税率が見つからない (404) */
  TAX_RATE_NOT_FOUND: 'TAX_RATE_NOT_FOUND',
  /** 税率コードが重複している (409) */
  TAX_RATE_CODE_DUPLICATE: 'TAX_RATE_CODE_DUPLICATE',
  /** 適用期間が不正（valid_from > valid_to） (422) */
  INVALID_DATE_RANGE: 'INVALID_DATE_RANGE',
  /** 楽観ロック競合（versionが一致しない） (409) */
  VERSION_CONFLICT: 'VERSION_CONFLICT',
  /** 税率値（ratePercent）は編集不可 (422) */
  RATE_PERCENT_NOT_EDITABLE: 'RATE_PERCENT_NOT_EDITABLE',
} as const;

export type TaxRateErrorCode =
  (typeof TAX_RATE_ERROR_CODES)[keyof typeof TAX_RATE_ERROR_CODES];

/**
 * エラーコードに対応するHTTPステータスコード
 */
export const TaxRateErrorHttpStatus: Record<TaxRateErrorCode, number> = {
  [TAX_RATE_ERROR_CODES.TAX_RATE_NOT_FOUND]: 404,
  [TAX_RATE_ERROR_CODES.TAX_RATE_CODE_DUPLICATE]: 409,
  [TAX_RATE_ERROR_CODES.INVALID_DATE_RANGE]: 422,
  [TAX_RATE_ERROR_CODES.VERSION_CONFLICT]: 409,
  [TAX_RATE_ERROR_CODES.RATE_PERCENT_NOT_EDITABLE]: 422,
};

/**
 * エラーコードに対応するデフォルトメッセージ
 */
export const TaxRateErrorMessage: Record<TaxRateErrorCode, string> = {
  [TAX_RATE_ERROR_CODES.TAX_RATE_NOT_FOUND]: '指定された税率が見つかりません',
  [TAX_RATE_ERROR_CODES.TAX_RATE_CODE_DUPLICATE]: '税率コードが重複しています',
  [TAX_RATE_ERROR_CODES.INVALID_DATE_RANGE]: '適用終了日は適用開始日以降の日付を指定してください',
  [TAX_RATE_ERROR_CODES.VERSION_CONFLICT]: '他のユーザーによって更新されています。再度読み込んでください',
  [TAX_RATE_ERROR_CODES.RATE_PERCENT_NOT_EDITABLE]: '税率値は変更できません',
};
