/**
 * Company Bank Account Error Codes
 */

export const CompanyBankAccountErrorCode = {
  // Not Found
  COMPANY_BANK_ACCOUNT_NOT_FOUND: 'COMPANY_BANK_ACCOUNT_NOT_FOUND',
  BANK_NOT_FOUND: 'BANK_NOT_FOUND',
  BRANCH_NOT_FOUND: 'BRANCH_NOT_FOUND',

  // Validation
  INVALID_ACCOUNT_CODE_FORMAT: 'INVALID_ACCOUNT_CODE_FORMAT',
  ACCOUNT_CODE_DUPLICATE: 'ACCOUNT_CODE_DUPLICATE',
  INVALID_ACCOUNT_CATEGORY: 'INVALID_ACCOUNT_CATEGORY',
  INVALID_ACCOUNT_TYPE: 'INVALID_ACCOUNT_TYPE',
  INVALID_ACCOUNT_NO_FORMAT: 'INVALID_ACCOUNT_NO_FORMAT',
  INVALID_POST_OFFICE_SYMBOL_FORMAT: 'INVALID_POST_OFFICE_SYMBOL_FORMAT',
  INVALID_POST_OFFICE_NUMBER_FORMAT: 'INVALID_POST_OFFICE_NUMBER_FORMAT',
  INVALID_CONSIGNOR_CODE_FORMAT: 'INVALID_CONSIGNOR_CODE_FORMAT',

  // Conditional required fields
  BANK_REQUIRED_FOR_BANK_ACCOUNT: 'BANK_REQUIRED_FOR_BANK_ACCOUNT',
  BRANCH_REQUIRED_FOR_BANK_ACCOUNT: 'BRANCH_REQUIRED_FOR_BANK_ACCOUNT',
  ACCOUNT_NO_REQUIRED_FOR_BANK_ACCOUNT: 'ACCOUNT_NO_REQUIRED_FOR_BANK_ACCOUNT',
  POST_OFFICE_SYMBOL_REQUIRED: 'POST_OFFICE_SYMBOL_REQUIRED',
  POST_OFFICE_NUMBER_REQUIRED: 'POST_OFFICE_NUMBER_REQUIRED',

  // Business rules
  DEFAULT_ACCOUNT_ALREADY_EXISTS: 'DEFAULT_ACCOUNT_ALREADY_EXISTS',
  CANNOT_DEACTIVATE_DEFAULT_ACCOUNT: 'CANNOT_DEACTIVATE_DEFAULT_ACCOUNT',
  CANNOT_DEACTIVATE_ACCOUNT_IN_USE: 'CANNOT_DEACTIVATE_ACCOUNT_IN_USE',

  // Concurrency
  CONCURRENT_UPDATE: 'CONCURRENT_UPDATE',
} as const;

export type CompanyBankAccountErrorCodeType =
  (typeof CompanyBankAccountErrorCode)[keyof typeof CompanyBankAccountErrorCode];

export const CompanyBankAccountErrorMessage: Record<CompanyBankAccountErrorCodeType, string> = {
  [CompanyBankAccountErrorCode.COMPANY_BANK_ACCOUNT_NOT_FOUND]: '自社口座が見つかりません',
  [CompanyBankAccountErrorCode.BANK_NOT_FOUND]: '銀行が見つかりません',
  [CompanyBankAccountErrorCode.BRANCH_NOT_FOUND]: '支店が見つかりません',
  [CompanyBankAccountErrorCode.INVALID_ACCOUNT_CODE_FORMAT]: '口座コードは10文字以内の英数字で入力してください',
  [CompanyBankAccountErrorCode.ACCOUNT_CODE_DUPLICATE]: 'この口座コードは既に使用されています',
  [CompanyBankAccountErrorCode.INVALID_ACCOUNT_CATEGORY]: '無効な口座区分です',
  [CompanyBankAccountErrorCode.INVALID_ACCOUNT_TYPE]: '無効な口座種別です',
  [CompanyBankAccountErrorCode.INVALID_ACCOUNT_NO_FORMAT]: '口座番号は7桁の数字で入力してください',
  [CompanyBankAccountErrorCode.INVALID_POST_OFFICE_SYMBOL_FORMAT]: 'ゆうちょ記号は5桁の数字で入力してください',
  [CompanyBankAccountErrorCode.INVALID_POST_OFFICE_NUMBER_FORMAT]: 'ゆうちょ番号は8桁以内の数字で入力してください',
  [CompanyBankAccountErrorCode.INVALID_CONSIGNOR_CODE_FORMAT]: '委託者コードは10桁の数字で入力してください',
  [CompanyBankAccountErrorCode.BANK_REQUIRED_FOR_BANK_ACCOUNT]: '銀行口座の場合、銀行を選択してください',
  [CompanyBankAccountErrorCode.BRANCH_REQUIRED_FOR_BANK_ACCOUNT]: '銀行口座の場合、支店を選択してください',
  [CompanyBankAccountErrorCode.ACCOUNT_NO_REQUIRED_FOR_BANK_ACCOUNT]: '銀行口座の場合、口座番号を入力してください',
  [CompanyBankAccountErrorCode.POST_OFFICE_SYMBOL_REQUIRED]: 'ゆうちょ銀行の場合、記号を入力してください',
  [CompanyBankAccountErrorCode.POST_OFFICE_NUMBER_REQUIRED]: 'ゆうちょ銀行の場合、番号を入力してください',
  [CompanyBankAccountErrorCode.DEFAULT_ACCOUNT_ALREADY_EXISTS]: '既定口座は1テナントに1つのみ設定できます',
  [CompanyBankAccountErrorCode.CANNOT_DEACTIVATE_DEFAULT_ACCOUNT]: '既定口座は無効化できません。先に別の口座を既定に設定してください',
  [CompanyBankAccountErrorCode.CANNOT_DEACTIVATE_ACCOUNT_IN_USE]: '使用中の口座は無効化できません',
  [CompanyBankAccountErrorCode.CONCURRENT_UPDATE]: '他のユーザーによって更新されました。画面を更新してください',
};
