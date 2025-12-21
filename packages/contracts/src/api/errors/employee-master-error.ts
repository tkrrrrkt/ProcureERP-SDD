/**
 * Error Codes: Employee Master
 *
 * Domain API のエラーコード定義
 * SSoT: packages/contracts/src/api/errors/employee-master-error.ts
 */

export const EmployeeMasterErrorCode = {
  /** 指定された社員が見つからない (404) */
  EMPLOYEE_NOT_FOUND: 'EMPLOYEE_NOT_FOUND',

  /** 社員コードが重複している (409) */
  EMPLOYEE_CODE_DUPLICATE: 'EMPLOYEE_CODE_DUPLICATE',

  /** メールアドレスの形式が不正 (422) */
  INVALID_EMAIL_FORMAT: 'INVALID_EMAIL_FORMAT',

  /** 退社日が入社日より前 (422) */
  INVALID_DATE_RANGE: 'INVALID_DATE_RANGE',

  /** 楽観ロックによる競合 (409) */
  CONCURRENT_UPDATE: 'CONCURRENT_UPDATE',
} as const;

export type EmployeeMasterErrorCode =
  (typeof EmployeeMasterErrorCode)[keyof typeof EmployeeMasterErrorCode];

/**
 * エラーコードに対応するHTTPステータスコード
 */
export const EmployeeMasterErrorHttpStatus: Record<EmployeeMasterErrorCode, number> = {
  [EmployeeMasterErrorCode.EMPLOYEE_NOT_FOUND]: 404,
  [EmployeeMasterErrorCode.EMPLOYEE_CODE_DUPLICATE]: 409,
  [EmployeeMasterErrorCode.INVALID_EMAIL_FORMAT]: 422,
  [EmployeeMasterErrorCode.INVALID_DATE_RANGE]: 422,
  [EmployeeMasterErrorCode.CONCURRENT_UPDATE]: 409,
};

/**
 * エラーコードに対応するデフォルトメッセージ
 */
export const EmployeeMasterErrorMessage: Record<EmployeeMasterErrorCode, string> = {
  [EmployeeMasterErrorCode.EMPLOYEE_NOT_FOUND]: '指定された社員が見つかりません',
  [EmployeeMasterErrorCode.EMPLOYEE_CODE_DUPLICATE]: '社員コードが重複しています',
  [EmployeeMasterErrorCode.INVALID_EMAIL_FORMAT]: 'メールアドレスの形式が不正です',
  [EmployeeMasterErrorCode.INVALID_DATE_RANGE]: '退社日は入社日以降の日付を指定してください',
  [EmployeeMasterErrorCode.CONCURRENT_UPDATE]:
    '他のユーザーによって更新されています。再度読み込んでください',
};
