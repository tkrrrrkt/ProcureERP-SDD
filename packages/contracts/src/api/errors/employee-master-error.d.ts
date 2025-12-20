export declare const EmployeeMasterErrorCode: {
    readonly EMPLOYEE_NOT_FOUND: "EMPLOYEE_NOT_FOUND";
    readonly EMPLOYEE_CODE_DUPLICATE: "EMPLOYEE_CODE_DUPLICATE";
    readonly EMPLOYEE_CODE_CANNOT_BE_CHANGED: "EMPLOYEE_CODE_CANNOT_BE_CHANGED";
    readonly EMPLOYEE_ALREADY_INACTIVE: "EMPLOYEE_ALREADY_INACTIVE";
    readonly EMPLOYEE_ALREADY_ACTIVE: "EMPLOYEE_ALREADY_ACTIVE";
    readonly VALIDATION_ERROR: "VALIDATION_ERROR";
};
export type EmployeeMasterErrorCode = typeof EmployeeMasterErrorCode[keyof typeof EmployeeMasterErrorCode];
export interface EmployeeMasterError {
    code: EmployeeMasterErrorCode;
    message: string;
    details?: Record<string, unknown>;
}
export declare const EmployeeMasterErrorStatusMap: Record<EmployeeMasterErrorCode, number>;
