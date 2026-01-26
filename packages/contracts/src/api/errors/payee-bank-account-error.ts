/**
 * Payee Bank Account Error Codes
 */

export const PayeeBankAccountErrorCode = {
  // Not Found
  PAYEE_BANK_ACCOUNT_NOT_FOUND: 'PAYEE_BANK_ACCOUNT_NOT_FOUND',
  PAYEE_NOT_FOUND: 'PAYEE_NOT_FOUND',
  BANK_NOT_FOUND: 'BANK_NOT_FOUND',
  BRANCH_NOT_FOUND: 'BRANCH_NOT_FOUND',

  // Validation
  INVALID_ACCOUNT_CATEGORY: 'INVALID_ACCOUNT_CATEGORY',
  INVALID_ACCOUNT_TYPE: 'INVALID_ACCOUNT_TYPE',
  INVALID_ACCOUNT_NO_FORMAT: 'INVALID_ACCOUNT_NO_FORMAT',
  INVALID_POST_OFFICE_SYMBOL_FORMAT: 'INVALID_POST_OFFICE_SYMBOL_FORMAT',
  INVALID_POST_OFFICE_NUMBER_FORMAT: 'INVALID_POST_OFFICE_NUMBER_FORMAT',
  INVALID_TRANSFER_FEE_BEARER: 'INVALID_TRANSFER_FEE_BEARER',

  // Conditional required fields
  BANK_REQUIRED_FOR_BANK_ACCOUNT: 'BANK_REQUIRED_FOR_BANK_ACCOUNT',
  BRANCH_REQUIRED_FOR_BANK_ACCOUNT: 'BRANCH_REQUIRED_FOR_BANK_ACCOUNT',
  ACCOUNT_NO_REQUIRED_FOR_BANK_ACCOUNT: 'ACCOUNT_NO_REQUIRED_FOR_BANK_ACCOUNT',
  POST_OFFICE_SYMBOL_REQUIRED: 'POST_OFFICE_SYMBOL_REQUIRED',
  POST_OFFICE_NUMBER_REQUIRED: 'POST_OFFICE_NUMBER_REQUIRED',

  // Business rules
  DEFAULT_ACCOUNT_ALREADY_EXISTS: 'DEFAULT_ACCOUNT_ALREADY_EXISTS',
  CANNOT_DEACTIVATE_DEFAULT_ACCOUNT: 'CANNOT_DEACTIVATE_DEFAULT_ACCOUNT',

  // Concurrency
  CONCURRENT_UPDATE: 'CONCURRENT_UPDATE',
} as const;

export type PayeeBankAccountErrorCodeType =
  (typeof PayeeBankAccountErrorCode)[keyof typeof PayeeBankAccountErrorCode];

export const PayeeBankAccountErrorMessage: Record<PayeeBankAccountErrorCodeType, string> = {
  [PayeeBankAccountErrorCode.PAYEE_BANK_ACCOUNT_NOT_FOUND]: '支払先口座が見つかりません',
  [PayeeBankAccountErrorCode.PAYEE_NOT_FOUND]: '支払先が見つかりません',
  [PayeeBankAccountErrorCode.BANK_NOT_FOUND]: '銀行が見つかりません',
  [PayeeBankAccountErrorCode.BRANCH_NOT_FOUND]: '支店が見つかりません',
  [PayeeBankAccountErrorCode.INVALID_ACCOUNT_CATEGORY]: '無効な口座区分です',
  [PayeeBankAccountErrorCode.INVALID_ACCOUNT_TYPE]: '無効な口座種別です',
  [PayeeBankAccountErrorCode.INVALID_ACCOUNT_NO_FORMAT]: '口座番号は7桁の数字で入力してください',
  [PayeeBankAccountErrorCode.INVALID_POST_OFFICE_SYMBOL_FORMAT]: 'ゆうちょ記号は5桁の数字で入力してください',
  [PayeeBankAccountErrorCode.INVALID_POST_OFFICE_NUMBER_FORMAT]: 'ゆうちょ番号は8桁以内の数字で入力してください',
  [PayeeBankAccountErrorCode.INVALID_TRANSFER_FEE_BEARER]: '無効な振込手数料負担区分です',
  [PayeeBankAccountErrorCode.BANK_REQUIRED_FOR_BANK_ACCOUNT]: '銀行口座の場合、銀行を選択してください',
  [PayeeBankAccountErrorCode.BRANCH_REQUIRED_FOR_BANK_ACCOUNT]: '銀行口座の場合、支店を選択してください',
  [PayeeBankAccountErrorCode.ACCOUNT_NO_REQUIRED_FOR_BANK_ACCOUNT]: '銀行口座の場合、口座番号を入力してください',
  [PayeeBankAccountErrorCode.POST_OFFICE_SYMBOL_REQUIRED]: 'ゆうちょ銀行の場合、記号を入力してください',
  [PayeeBankAccountErrorCode.POST_OFFICE_NUMBER_REQUIRED]: 'ゆうちょ銀行の場合、番号を入力してください',
  [PayeeBankAccountErrorCode.DEFAULT_ACCOUNT_ALREADY_EXISTS]: 'この支払先には既に既定口座が設定されています',
  [PayeeBankAccountErrorCode.CANNOT_DEACTIVATE_DEFAULT_ACCOUNT]: '既定口座は無効化できません。先に別の口座を既定に設定してください',
  [PayeeBankAccountErrorCode.CONCURRENT_UPDATE]: '他のユーザーによって更新されました。画面を更新してください',
};
