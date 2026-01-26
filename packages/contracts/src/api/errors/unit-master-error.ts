/**
 * Error Codes: Unit Master
 *
 * Domain API のエラーコード定義
 * SSoT: packages/contracts/src/api/errors/unit-master-error.ts
 */

export const UnitMasterErrorCode = {
  /** 指定された単位グループが見つからない (404) */
  UOM_GROUP_NOT_FOUND: 'UOM_GROUP_NOT_FOUND',

  /** 指定された単位が見つからない (404) */
  UOM_NOT_FOUND: 'UOM_NOT_FOUND',

  /** 単位グループコードが重複している (409) */
  UOM_GROUP_CODE_DUPLICATE: 'UOM_GROUP_CODE_DUPLICATE',

  /** 単位コードが重複している (409) */
  UOM_CODE_DUPLICATE: 'UOM_CODE_DUPLICATE',

  /** 楽観ロックによる競合 (409) */
  CONCURRENT_UPDATE: 'CONCURRENT_UPDATE',

  /** 単位グループコードの形式が不正 (422) */
  INVALID_UOM_GROUP_CODE_FORMAT: 'INVALID_UOM_GROUP_CODE_FORMAT',

  /** 単位コードの形式が不正 (422) */
  INVALID_UOM_CODE_FORMAT: 'INVALID_UOM_CODE_FORMAT',

  /** コード変更は許可されていない (422) */
  CODE_CHANGE_NOT_ALLOWED: 'CODE_CHANGE_NOT_ALLOWED',

  /** グループ変更は許可されていない (422) */
  GROUP_CHANGE_NOT_ALLOWED: 'GROUP_CHANGE_NOT_ALLOWED',

  /** 基準単位が同一グループに属していない (422) */
  BASE_UOM_NOT_IN_GROUP: 'BASE_UOM_NOT_IN_GROUP',

  /** 基準単位は無効化できない (422) */
  CANNOT_DEACTIVATE_BASE_UOM: 'CANNOT_DEACTIVATE_BASE_UOM',

  /** 単位が品目で使用中のため無効化できない (422) */
  UOM_IN_USE: 'UOM_IN_USE',
} as const;

export type UnitMasterErrorCode =
  (typeof UnitMasterErrorCode)[keyof typeof UnitMasterErrorCode];

/**
 * エラーコードに対応するHTTPステータスコード
 */
export const UnitMasterErrorHttpStatus: Record<UnitMasterErrorCode, number> = {
  [UnitMasterErrorCode.UOM_GROUP_NOT_FOUND]: 404,
  [UnitMasterErrorCode.UOM_NOT_FOUND]: 404,
  [UnitMasterErrorCode.UOM_GROUP_CODE_DUPLICATE]: 409,
  [UnitMasterErrorCode.UOM_CODE_DUPLICATE]: 409,
  [UnitMasterErrorCode.CONCURRENT_UPDATE]: 409,
  [UnitMasterErrorCode.INVALID_UOM_GROUP_CODE_FORMAT]: 422,
  [UnitMasterErrorCode.INVALID_UOM_CODE_FORMAT]: 422,
  [UnitMasterErrorCode.CODE_CHANGE_NOT_ALLOWED]: 422,
  [UnitMasterErrorCode.GROUP_CHANGE_NOT_ALLOWED]: 422,
  [UnitMasterErrorCode.BASE_UOM_NOT_IN_GROUP]: 422,
  [UnitMasterErrorCode.CANNOT_DEACTIVATE_BASE_UOM]: 422,
  [UnitMasterErrorCode.UOM_IN_USE]: 422,
};

/**
 * エラーコードに対応するデフォルトメッセージ
 */
export const UnitMasterErrorMessage: Record<UnitMasterErrorCode, string> = {
  [UnitMasterErrorCode.UOM_GROUP_NOT_FOUND]: '指定された単位グループが見つかりません',
  [UnitMasterErrorCode.UOM_NOT_FOUND]: '指定された単位が見つかりません',
  [UnitMasterErrorCode.UOM_GROUP_CODE_DUPLICATE]: '単位グループコードが既に使用されています',
  [UnitMasterErrorCode.UOM_CODE_DUPLICATE]: '単位コードが既に使用されています',
  [UnitMasterErrorCode.CONCURRENT_UPDATE]:
    '他のユーザーによって更新されています。最新データを取得してください',
  [UnitMasterErrorCode.INVALID_UOM_GROUP_CODE_FORMAT]:
    '単位グループコードは英数字大文字と-_のみ、1〜10文字で入力してください',
  [UnitMasterErrorCode.INVALID_UOM_CODE_FORMAT]:
    '単位コードは英数字大文字と-_のみ、1〜10文字で入力してください',
  [UnitMasterErrorCode.CODE_CHANGE_NOT_ALLOWED]: 'コードの変更は許可されていません',
  [UnitMasterErrorCode.GROUP_CHANGE_NOT_ALLOWED]: '所属グループの変更は許可されていません',
  [UnitMasterErrorCode.BASE_UOM_NOT_IN_GROUP]:
    '基準単位は同一グループ内の単位を指定してください',
  [UnitMasterErrorCode.CANNOT_DEACTIVATE_BASE_UOM]:
    '基準単位として使用中のため無効化できません',
  [UnitMasterErrorCode.UOM_IN_USE]: '品目で使用中のため無効化できません',
};
