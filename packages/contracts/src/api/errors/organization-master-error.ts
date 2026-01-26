/**
 * Error Codes: Organization Master
 *
 * Domain API のエラーコード定義
 * SSoT: packages/contracts/src/api/errors/organization-master-error.ts
 */

export const OrganizationMasterErrorCode = {
  /** 指定されたバージョンが見つからない (404) */
  VERSION_NOT_FOUND: 'VERSION_NOT_FOUND',

  /** バージョンコードが重複している (409) */
  VERSION_CODE_DUPLICATE: 'VERSION_CODE_DUPLICATE',

  /** 有効終了日が有効開始日以前 (422) */
  INVALID_EFFECTIVE_DATE_RANGE: 'INVALID_EFFECTIVE_DATE_RANGE',

  /** 指定日時点で有効なバージョンが見つからない (404) */
  NO_EFFECTIVE_VERSION_FOUND: 'NO_EFFECTIVE_VERSION_FOUND',

  /** 指定された部門が見つからない (404) */
  DEPARTMENT_NOT_FOUND: 'DEPARTMENT_NOT_FOUND',

  /** 部門コードが重複している (409) */
  DEPARTMENT_CODE_DUPLICATE: 'DEPARTMENT_CODE_DUPLICATE',

  /** 部門は既に無効化されている (409) */
  DEPARTMENT_ALREADY_INACTIVE: 'DEPARTMENT_ALREADY_INACTIVE',

  /** 部門は既に有効である (409) */
  DEPARTMENT_ALREADY_ACTIVE: 'DEPARTMENT_ALREADY_ACTIVE',

  /** 循環参照が検出された (422) */
  CIRCULAR_REFERENCE_DETECTED: 'CIRCULAR_REFERENCE_DETECTED',

  /** バリデーションエラー (422) */
  VALIDATION_ERROR: 'VALIDATION_ERROR',
} as const;

export type OrganizationMasterErrorCode =
  (typeof OrganizationMasterErrorCode)[keyof typeof OrganizationMasterErrorCode];

/**
 * エラーコードに対応するHTTPステータスコード
 */
export const OrganizationMasterErrorHttpStatus: Record<OrganizationMasterErrorCode, number> = {
  [OrganizationMasterErrorCode.VERSION_NOT_FOUND]: 404,
  [OrganizationMasterErrorCode.VERSION_CODE_DUPLICATE]: 409,
  [OrganizationMasterErrorCode.INVALID_EFFECTIVE_DATE_RANGE]: 422,
  [OrganizationMasterErrorCode.NO_EFFECTIVE_VERSION_FOUND]: 404,
  [OrganizationMasterErrorCode.DEPARTMENT_NOT_FOUND]: 404,
  [OrganizationMasterErrorCode.DEPARTMENT_CODE_DUPLICATE]: 409,
  [OrganizationMasterErrorCode.DEPARTMENT_ALREADY_INACTIVE]: 409,
  [OrganizationMasterErrorCode.DEPARTMENT_ALREADY_ACTIVE]: 409,
  [OrganizationMasterErrorCode.CIRCULAR_REFERENCE_DETECTED]: 422,
  [OrganizationMasterErrorCode.VALIDATION_ERROR]: 422,
};

/**
 * エラーコードに対応するデフォルトメッセージ
 */
export const OrganizationMasterErrorMessage: Record<OrganizationMasterErrorCode, string> = {
  [OrganizationMasterErrorCode.VERSION_NOT_FOUND]: '指定されたバージョンが見つかりません',
  [OrganizationMasterErrorCode.VERSION_CODE_DUPLICATE]: 'バージョンコードが重複しています',
  [OrganizationMasterErrorCode.INVALID_EFFECTIVE_DATE_RANGE]:
    '有効終了日は有効開始日より後である必要があります',
  [OrganizationMasterErrorCode.NO_EFFECTIVE_VERSION_FOUND]:
    '指定日時点で有効なバージョンが見つかりません',
  [OrganizationMasterErrorCode.DEPARTMENT_NOT_FOUND]: '指定された部門が見つかりません',
  [OrganizationMasterErrorCode.DEPARTMENT_CODE_DUPLICATE]: '部門コードが重複しています',
  [OrganizationMasterErrorCode.DEPARTMENT_ALREADY_INACTIVE]: 'この部門は既に無効化されています',
  [OrganizationMasterErrorCode.DEPARTMENT_ALREADY_ACTIVE]: 'この部門は既に有効です',
  [OrganizationMasterErrorCode.CIRCULAR_REFERENCE_DETECTED]:
    '循環参照が発生するため、この設定はできません',
  [OrganizationMasterErrorCode.VALIDATION_ERROR]: '入力値が不正です',
};
