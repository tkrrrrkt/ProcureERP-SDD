/**
 * Error Codes: Employee Assignment
 *
 * Domain API のエラーコード定義
 * SSoT: packages/contracts/src/api/errors/employee-assignment-error.ts
 */

export const EmployeeAssignmentErrorCode = {
  /** 指定された所属情報が見つからない (404) */
  ASSIGNMENT_NOT_FOUND: 'ASSIGNMENT_NOT_FOUND',

  /** 同時期に既に主務が設定されている (409) */
  DUPLICATE_PRIMARY_ASSIGNMENT: 'DUPLICATE_PRIMARY_ASSIGNMENT',

  /** 有効終了日が有効開始日以前 (422) */
  INVALID_DATE_RANGE: 'INVALID_DATE_RANGE',

  /** 按分率が範囲外 (422) */
  INVALID_ALLOCATION_RATIO: 'INVALID_ALLOCATION_RATIO',

  /** 楽観ロックによる競合 (409) */
  OPTIMISTIC_LOCK_ERROR: 'OPTIMISTIC_LOCK_ERROR',

  /** 指定された社員が見つからない (404) */
  EMPLOYEE_NOT_FOUND: 'EMPLOYEE_NOT_FOUND',

  /** 指定された部門が見つからない (404) */
  DEPARTMENT_NOT_FOUND: 'DEPARTMENT_NOT_FOUND',
} as const;

export type EmployeeAssignmentErrorCode =
  (typeof EmployeeAssignmentErrorCode)[keyof typeof EmployeeAssignmentErrorCode];

/**
 * エラーコードに対応するHTTPステータスコード
 */
export const EmployeeAssignmentErrorHttpStatus: Record<EmployeeAssignmentErrorCode, number> = {
  [EmployeeAssignmentErrorCode.ASSIGNMENT_NOT_FOUND]: 404,
  [EmployeeAssignmentErrorCode.DUPLICATE_PRIMARY_ASSIGNMENT]: 409,
  [EmployeeAssignmentErrorCode.INVALID_DATE_RANGE]: 422,
  [EmployeeAssignmentErrorCode.INVALID_ALLOCATION_RATIO]: 422,
  [EmployeeAssignmentErrorCode.OPTIMISTIC_LOCK_ERROR]: 409,
  [EmployeeAssignmentErrorCode.EMPLOYEE_NOT_FOUND]: 404,
  [EmployeeAssignmentErrorCode.DEPARTMENT_NOT_FOUND]: 404,
};

/**
 * エラーコードに対応するデフォルトメッセージ
 */
export const EmployeeAssignmentErrorMessage: Record<EmployeeAssignmentErrorCode, string> = {
  [EmployeeAssignmentErrorCode.ASSIGNMENT_NOT_FOUND]: '指定された所属情報が見つかりません',
  [EmployeeAssignmentErrorCode.DUPLICATE_PRIMARY_ASSIGNMENT]:
    '同時期に既に主務が設定されています',
  [EmployeeAssignmentErrorCode.INVALID_DATE_RANGE]:
    '有効終了日は有効開始日より後の日付を指定してください',
  [EmployeeAssignmentErrorCode.INVALID_ALLOCATION_RATIO]: '按分率は0〜100の範囲で指定してください',
  [EmployeeAssignmentErrorCode.OPTIMISTIC_LOCK_ERROR]:
    '他のユーザーによって更新されています。再度読み込んでください',
  [EmployeeAssignmentErrorCode.EMPLOYEE_NOT_FOUND]: '指定された社員が見つかりません',
  [EmployeeAssignmentErrorCode.DEPARTMENT_NOT_FOUND]: '指定された部門が見つかりません',
};
