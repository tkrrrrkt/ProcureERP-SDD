/**
 * BFF Error Codes: Employee Assignment
 *
 * API エラーコードを Re-export（Pass-through方針）
 * BFFとAPIでエラーコードの完全一致を保証
 * UIは本ファイルのみを参照する
 */

export {
  EmployeeAssignmentErrorCode,
  EmployeeAssignmentErrorHttpStatus,
  EmployeeAssignmentErrorMessage,
} from '../../api/errors/employee-assignment-error';
