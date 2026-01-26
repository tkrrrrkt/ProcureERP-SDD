/**
 * BFF Error Codes: Warehouse (倉庫マスタ)
 *
 * SSoT: packages/contracts/src/bff/errors/warehouse-error.ts
 */

// =============================================================================
// Error Codes
// =============================================================================

export const WarehouseErrorCode = {
  WAREHOUSE_NOT_FOUND: 'WAREHOUSE_NOT_FOUND',
  WAREHOUSE_CODE_DUPLICATE: 'WAREHOUSE_CODE_DUPLICATE',
  INVALID_WAREHOUSE_CODE_FORMAT: 'INVALID_WAREHOUSE_CODE_FORMAT',
  INVALID_WAREHOUSE_CODE_LENGTH: 'INVALID_WAREHOUSE_CODE_LENGTH',
  INVALID_WAREHOUSE_CODE_CHARS: 'INVALID_WAREHOUSE_CODE_CHARS',
  WAREHOUSE_GROUP_NOT_FOUND: 'WAREHOUSE_GROUP_NOT_FOUND',
  DEFAULT_RECEIVING_ALREADY_SET: 'DEFAULT_RECEIVING_ALREADY_SET',
  CANNOT_DEACTIVATE_DEFAULT_RECEIVING: 'CANNOT_DEACTIVATE_DEFAULT_RECEIVING',
  CONCURRENT_UPDATE: 'CONCURRENT_UPDATE',
} as const;

export type WarehouseErrorCode =
  (typeof WarehouseErrorCode)[keyof typeof WarehouseErrorCode];

// =============================================================================
// Default Error Messages (for UI display)
// =============================================================================

export const WarehouseErrorMessage: Record<WarehouseErrorCode, string> = {
  [WarehouseErrorCode.WAREHOUSE_NOT_FOUND]: '指定された倉庫が見つかりません',
  [WarehouseErrorCode.WAREHOUSE_CODE_DUPLICATE]:
    '倉庫コードが既に使用されています',
  [WarehouseErrorCode.INVALID_WAREHOUSE_CODE_FORMAT]: '倉庫コードの形式が不正です',
  [WarehouseErrorCode.INVALID_WAREHOUSE_CODE_LENGTH]:
    '倉庫コードは10文字以内である必要があります',
  [WarehouseErrorCode.INVALID_WAREHOUSE_CODE_CHARS]:
    '倉庫コードは半角英数字のみ使用可能です',
  [WarehouseErrorCode.WAREHOUSE_GROUP_NOT_FOUND]:
    '指定された倉庫グループが見つかりません',
  [WarehouseErrorCode.DEFAULT_RECEIVING_ALREADY_SET]:
    '既定受入倉庫は既に設定されています',
  [WarehouseErrorCode.CANNOT_DEACTIVATE_DEFAULT_RECEIVING]:
    '既定受入倉庫を無効化することはできません。先に別の倉庫を既定に設定してください',
  [WarehouseErrorCode.CONCURRENT_UPDATE]:
    '他のユーザーによりデータが更新されました。再読み込みしてください',
};
