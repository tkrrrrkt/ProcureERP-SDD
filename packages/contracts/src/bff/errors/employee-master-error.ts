/**
 * BFF Error Codes: Employee Master
 *
 * API エラーコードを Re-export（Pass-through方針）
 * BFFとAPIでエラーコードの完全一致を保証
 */

export {
  EmployeeMasterErrorCode,
  EmployeeMasterErrorHttpStatus,
  EmployeeMasterErrorMessage,
} from '../../api/errors/employee-master-error';
