/**
 * BFF Error Codes: Unit Master
 *
 * API エラーコードを Re-export（Pass-through方針）
 * BFFとAPIでエラーコードの完全一致を保証
 */

export {
  UnitMasterErrorCode,
  UnitMasterErrorHttpStatus,
  UnitMasterErrorMessage,
} from '../../api/errors/unit-master-error';
