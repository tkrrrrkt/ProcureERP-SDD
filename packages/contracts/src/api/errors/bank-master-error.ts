/**
 * Error Codes: Bank Master
 *
 * Domain API のエラーコード定義
 * SSoT: packages/contracts/src/api/errors/bank-master-error.ts
 */

export const BankMasterErrorCode = {
  /** 指定された銀行が見つからない (404) */
  BANK_NOT_FOUND: 'BANK_NOT_FOUND',

  /** 銀行コードが重複している (409) */
  BANK_CODE_DUPLICATE: 'BANK_CODE_DUPLICATE',

  /** 銀行コードの形式が不正（4桁数字でない） (422) */
  INVALID_BANK_CODE_FORMAT: 'INVALID_BANK_CODE_FORMAT',

  /** 指定された支店が見つからない (404) */
  BRANCH_NOT_FOUND: 'BRANCH_NOT_FOUND',

  /** 支店コードが重複している (409) */
  BRANCH_CODE_DUPLICATE: 'BRANCH_CODE_DUPLICATE',

  /** 支店コードの形式が不正（3桁数字でない） (422) */
  INVALID_BRANCH_CODE_FORMAT: 'INVALID_BRANCH_CODE_FORMAT',

  /** 楽観ロックによる競合 (409) */
  CONCURRENT_UPDATE: 'CONCURRENT_UPDATE',
} as const;

export type BankMasterErrorCode =
  (typeof BankMasterErrorCode)[keyof typeof BankMasterErrorCode];

/**
 * エラーコードに対応するHTTPステータスコード
 */
export const BankMasterErrorHttpStatus: Record<BankMasterErrorCode, number> = {
  [BankMasterErrorCode.BANK_NOT_FOUND]: 404,
  [BankMasterErrorCode.BANK_CODE_DUPLICATE]: 409,
  [BankMasterErrorCode.INVALID_BANK_CODE_FORMAT]: 422,
  [BankMasterErrorCode.BRANCH_NOT_FOUND]: 404,
  [BankMasterErrorCode.BRANCH_CODE_DUPLICATE]: 409,
  [BankMasterErrorCode.INVALID_BRANCH_CODE_FORMAT]: 422,
  [BankMasterErrorCode.CONCURRENT_UPDATE]: 409,
};

/**
 * エラーコードに対応するデフォルトメッセージ
 */
export const BankMasterErrorMessage: Record<BankMasterErrorCode, string> = {
  [BankMasterErrorCode.BANK_NOT_FOUND]: '指定された銀行が見つかりません',
  [BankMasterErrorCode.BANK_CODE_DUPLICATE]: '銀行コードが重複しています',
  [BankMasterErrorCode.INVALID_BANK_CODE_FORMAT]:
    '銀行コードは4桁の数字で入力してください',
  [BankMasterErrorCode.BRANCH_NOT_FOUND]: '指定された支店が見つかりません',
  [BankMasterErrorCode.BRANCH_CODE_DUPLICATE]: '支店コードが重複しています',
  [BankMasterErrorCode.INVALID_BRANCH_CODE_FORMAT]:
    '支店コードは3桁の数字で入力してください',
  [BankMasterErrorCode.CONCURRENT_UPDATE]:
    '他のユーザーによって更新されています。再度読み込んでください',
};

/**
 * 警告コード: Bank Master
 *
 * 処理は続行可能だが、ユーザーへの通知が必要な警告
 */
export const BankMasterWarningCode = {
  /** 銀行無効化時、有効な支店が存在する */
  HAS_ACTIVE_BRANCHES: 'HAS_ACTIVE_BRANCHES',

  /** 支店無効化時、支払先口座で使用されている */
  BRANCH_IN_USE: 'BRANCH_IN_USE',
} as const;

export type BankMasterWarningCode =
  (typeof BankMasterWarningCode)[keyof typeof BankMasterWarningCode];

/**
 * 警告コードに対応するデフォルトメッセージ
 */
export const BankMasterWarningMessage: Record<BankMasterWarningCode, string> = {
  [BankMasterWarningCode.HAS_ACTIVE_BRANCHES]:
    'この銀行には有効な支店が登録されています。銀行を無効化すると、支払先口座の選択時に候補から除外されます。',
  [BankMasterWarningCode.BRANCH_IN_USE]:
    'この支店は支払先口座で使用されています。支店を無効化すると、新規の支払先口座の選択時に候補から除外されます。',
};
