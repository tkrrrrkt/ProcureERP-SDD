/**
 * API Error Codes: Ship-To (納入先マスタ)
 *
 * SSoT: packages/contracts/src/api/errors/ship-to-error.ts
 */

// =============================================================================
// Error Codes
// =============================================================================

export const ShipToErrorCode = {
  SHIP_TO_NOT_FOUND: 'SHIP_TO_NOT_FOUND',
  SHIP_TO_CODE_DUPLICATE: 'SHIP_TO_CODE_DUPLICATE',
  INVALID_SHIP_TO_CODE_FORMAT: 'INVALID_SHIP_TO_CODE_FORMAT',
  INVALID_SHIP_TO_CODE_LENGTH: 'INVALID_SHIP_TO_CODE_LENGTH',
  INVALID_SHIP_TO_CODE_CHARS: 'INVALID_SHIP_TO_CODE_CHARS',
  INVALID_EMAIL_FORMAT: 'INVALID_EMAIL_FORMAT',
  CUSTOMER_SITE_NOT_AVAILABLE: 'CUSTOMER_SITE_NOT_AVAILABLE',
  CONCURRENT_UPDATE: 'CONCURRENT_UPDATE',
} as const;

export type ShipToErrorCode =
  (typeof ShipToErrorCode)[keyof typeof ShipToErrorCode];

// =============================================================================
// HTTP Status Mapping
// =============================================================================

export const ShipToErrorHttpStatus: Record<ShipToErrorCode, number> = {
  [ShipToErrorCode.SHIP_TO_NOT_FOUND]: 404,
  [ShipToErrorCode.SHIP_TO_CODE_DUPLICATE]: 409,
  [ShipToErrorCode.INVALID_SHIP_TO_CODE_FORMAT]: 422,
  [ShipToErrorCode.INVALID_SHIP_TO_CODE_LENGTH]: 422,
  [ShipToErrorCode.INVALID_SHIP_TO_CODE_CHARS]: 422,
  [ShipToErrorCode.INVALID_EMAIL_FORMAT]: 422,
  [ShipToErrorCode.CUSTOMER_SITE_NOT_AVAILABLE]: 422,
  [ShipToErrorCode.CONCURRENT_UPDATE]: 409,
};

// =============================================================================
// Default Error Messages
// =============================================================================

export const ShipToErrorMessage: Record<ShipToErrorCode, string> = {
  [ShipToErrorCode.SHIP_TO_NOT_FOUND]: '指定された納入先が見つかりません',
  [ShipToErrorCode.SHIP_TO_CODE_DUPLICATE]:
    '納入先コードが既に使用されています',
  [ShipToErrorCode.INVALID_SHIP_TO_CODE_FORMAT]: '納入先コードの形式が不正です',
  [ShipToErrorCode.INVALID_SHIP_TO_CODE_LENGTH]:
    '納入先コードは10文字である必要があります',
  [ShipToErrorCode.INVALID_SHIP_TO_CODE_CHARS]:
    '納入先コードは半角英数字のみ使用可能です',
  [ShipToErrorCode.INVALID_EMAIL_FORMAT]: 'メールアドレスの形式が不正です',
  [ShipToErrorCode.CUSTOMER_SITE_NOT_AVAILABLE]:
    '顧客サイト機能は現在利用できません',
  [ShipToErrorCode.CONCURRENT_UPDATE]:
    '他のユーザーによりデータが更新されました。再読み込みしてください',
};
