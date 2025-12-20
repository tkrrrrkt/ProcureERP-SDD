"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeMasterErrorStatusMap = exports.EmployeeMasterErrorCode = void 0;
exports.EmployeeMasterErrorCode = {
    EMPLOYEE_NOT_FOUND: 'EMPLOYEE_NOT_FOUND',
    EMPLOYEE_CODE_DUPLICATE: 'EMPLOYEE_CODE_DUPLICATE',
    EMPLOYEE_CODE_CANNOT_BE_CHANGED: 'EMPLOYEE_CODE_CANNOT_BE_CHANGED',
    EMPLOYEE_ALREADY_INACTIVE: 'EMPLOYEE_ALREADY_INACTIVE',
    EMPLOYEE_ALREADY_ACTIVE: 'EMPLOYEE_ALREADY_ACTIVE',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
};
exports.EmployeeMasterErrorStatusMap = {
    [exports.EmployeeMasterErrorCode.EMPLOYEE_NOT_FOUND]: 404,
    [exports.EmployeeMasterErrorCode.EMPLOYEE_CODE_DUPLICATE]: 409,
    [exports.EmployeeMasterErrorCode.EMPLOYEE_CODE_CANNOT_BE_CHANGED]: 422,
    [exports.EmployeeMasterErrorCode.EMPLOYEE_ALREADY_INACTIVE]: 409,
    [exports.EmployeeMasterErrorCode.EMPLOYEE_ALREADY_ACTIVE]: 409,
    [exports.EmployeeMasterErrorCode.VALIDATION_ERROR]: 422,
};
//# sourceMappingURL=employee-master-error.js.map