"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeMasterErrorMessage = exports.EmployeeMasterErrorHttpStatus = exports.EmployeeMasterErrorCode = void 0;
exports.EmployeeMasterErrorCode = {
    EMPLOYEE_NOT_FOUND: 'EMPLOYEE_NOT_FOUND',
    EMPLOYEE_CODE_DUPLICATE: 'EMPLOYEE_CODE_DUPLICATE',
    INVALID_EMAIL_FORMAT: 'INVALID_EMAIL_FORMAT',
    INVALID_DATE_RANGE: 'INVALID_DATE_RANGE',
    CONCURRENT_UPDATE: 'CONCURRENT_UPDATE',
};
exports.EmployeeMasterErrorHttpStatus = {
    [exports.EmployeeMasterErrorCode.EMPLOYEE_NOT_FOUND]: 404,
    [exports.EmployeeMasterErrorCode.EMPLOYEE_CODE_DUPLICATE]: 409,
    [exports.EmployeeMasterErrorCode.INVALID_EMAIL_FORMAT]: 422,
    [exports.EmployeeMasterErrorCode.INVALID_DATE_RANGE]: 422,
    [exports.EmployeeMasterErrorCode.CONCURRENT_UPDATE]: 409,
};
exports.EmployeeMasterErrorMessage = {
    [exports.EmployeeMasterErrorCode.EMPLOYEE_NOT_FOUND]: '指定された社員が見つかりません',
    [exports.EmployeeMasterErrorCode.EMPLOYEE_CODE_DUPLICATE]: '社員コードが重複しています',
    [exports.EmployeeMasterErrorCode.INVALID_EMAIL_FORMAT]: 'メールアドレスの形式が不正です',
    [exports.EmployeeMasterErrorCode.INVALID_DATE_RANGE]: '退社日は入社日以降の日付を指定してください',
    [exports.EmployeeMasterErrorCode.CONCURRENT_UPDATE]: '他のユーザーによって更新されています。再度読み込んでください',
};
//# sourceMappingURL=employee-master-error.js.map