/**
 * Error Codes: Item Attribute Master
 *
 * Domain API のエラーコード定義
 * SSoT: packages/contracts/src/api/errors/item-attribute-error.ts
 */

export const ItemAttributeErrorCode = {
  /** 指定された仕様属性が見つからない (404) */
  ITEM_ATTRIBUTE_NOT_FOUND: 'ITEM_ATTRIBUTE_NOT_FOUND',

  /** 指定された属性値が見つからない (404) */
  ITEM_ATTRIBUTE_VALUE_NOT_FOUND: 'ITEM_ATTRIBUTE_VALUE_NOT_FOUND',

  /** 仕様属性コードが重複している (409) */
  ITEM_ATTRIBUTE_CODE_DUPLICATE: 'ITEM_ATTRIBUTE_CODE_DUPLICATE',

  /** 属性値コードが重複している (409) */
  VALUE_CODE_DUPLICATE: 'VALUE_CODE_DUPLICATE',

  /** 楽観ロックによる競合 (409) */
  CONCURRENT_UPDATE: 'CONCURRENT_UPDATE',

  /** 仕様属性コードの形式が不正 (422) */
  INVALID_ATTRIBUTE_CODE_FORMAT: 'INVALID_ATTRIBUTE_CODE_FORMAT',

  /** 属性値コードの形式が不正 (422) */
  INVALID_VALUE_CODE_FORMAT: 'INVALID_VALUE_CODE_FORMAT',

  /** コード変更は許可されていない (422) */
  CODE_CHANGE_NOT_ALLOWED: 'CODE_CHANGE_NOT_ALLOWED',

  /** 仕様属性がSKU仕様で使用中 (422) */
  ATTRIBUTE_IN_USE: 'ATTRIBUTE_IN_USE',

  /** 属性値がSKU仕様で使用中 (422) */
  VALUE_IN_USE: 'VALUE_IN_USE',
} as const;

export type ItemAttributeErrorCode =
  (typeof ItemAttributeErrorCode)[keyof typeof ItemAttributeErrorCode];

/**
 * エラーコードに対応するHTTPステータスコード
 */
export const ItemAttributeErrorHttpStatus: Record<ItemAttributeErrorCode, number> = {
  [ItemAttributeErrorCode.ITEM_ATTRIBUTE_NOT_FOUND]: 404,
  [ItemAttributeErrorCode.ITEM_ATTRIBUTE_VALUE_NOT_FOUND]: 404,
  [ItemAttributeErrorCode.ITEM_ATTRIBUTE_CODE_DUPLICATE]: 409,
  [ItemAttributeErrorCode.VALUE_CODE_DUPLICATE]: 409,
  [ItemAttributeErrorCode.CONCURRENT_UPDATE]: 409,
  [ItemAttributeErrorCode.INVALID_ATTRIBUTE_CODE_FORMAT]: 422,
  [ItemAttributeErrorCode.INVALID_VALUE_CODE_FORMAT]: 422,
  [ItemAttributeErrorCode.CODE_CHANGE_NOT_ALLOWED]: 422,
  [ItemAttributeErrorCode.ATTRIBUTE_IN_USE]: 422,
  [ItemAttributeErrorCode.VALUE_IN_USE]: 422,
};

/**
 * エラーコードに対応するデフォルトメッセージ
 */
export const ItemAttributeErrorMessage: Record<ItemAttributeErrorCode, string> = {
  [ItemAttributeErrorCode.ITEM_ATTRIBUTE_NOT_FOUND]:
    '指定された仕様属性が見つかりません',
  [ItemAttributeErrorCode.ITEM_ATTRIBUTE_VALUE_NOT_FOUND]:
    '指定された属性値が見つかりません',
  [ItemAttributeErrorCode.ITEM_ATTRIBUTE_CODE_DUPLICATE]:
    '仕様属性コードが既に使用されています',
  [ItemAttributeErrorCode.VALUE_CODE_DUPLICATE]:
    '同一仕様属性内で属性値コードが重複しています',
  [ItemAttributeErrorCode.CONCURRENT_UPDATE]:
    '他のユーザーによって更新されています。最新データを取得してください',
  [ItemAttributeErrorCode.INVALID_ATTRIBUTE_CODE_FORMAT]:
    '仕様属性コードは英数字大文字と-_のみ、1〜20文字で入力してください',
  [ItemAttributeErrorCode.INVALID_VALUE_CODE_FORMAT]:
    '属性値コードは英数字大文字と-_のみ、1〜30文字で入力してください',
  [ItemAttributeErrorCode.CODE_CHANGE_NOT_ALLOWED]:
    'コードの変更は許可されていません',
  [ItemAttributeErrorCode.ATTRIBUTE_IN_USE]:
    'この仕様属性はSKU仕様で使用されています',
  [ItemAttributeErrorCode.VALUE_IN_USE]:
    'この属性値はSKU仕様で使用されています',
};
