/**
 * BFF Error Codes: Bank Master
 *
 * API エラーコードを Re-export（Pass-through方針）
 * BFFとAPIでエラーコードの完全一致を保証
 */

export {
  BankMasterErrorCode,
  BankMasterErrorHttpStatus,
  BankMasterErrorMessage,
  BankMasterWarningCode,
  BankMasterWarningMessage,
} from '../../api/errors/bank-master-error';
