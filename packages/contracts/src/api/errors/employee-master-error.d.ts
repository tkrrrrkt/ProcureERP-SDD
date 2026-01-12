export declare const EmployeeMasterErrorCode: {
    readonly EMPLOYEE_NOT_FOUND: "EMPLOYEE_NOT_FOUND";
    readonly EMPLOYEE_CODE_DUPLICATE: "EMPLOYEE_CODE_DUPLICATE";
    readonly INVALID_EMAIL_FORMAT: "INVALID_EMAIL_FORMAT";
    readonly INVALID_DATE_RANGE: "INVALID_DATE_RANGE";
    readonly CONCURRENT_UPDATE: "CONCURRENT_UPDATE";
};
export type EmployeeMasterErrorCode = (typeof EmployeeMasterErrorCode)[keyof typeof EmployeeMasterErrorCode];
export declare const EmployeeMasterErrorHttpStatus: Record<EmployeeMasterErrorCode, number>;
export declare const EmployeeMasterErrorMessage: Record<EmployeeMasterErrorCode, string>;
