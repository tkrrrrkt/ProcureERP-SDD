// Employee Master Domain API Errors
// Domain API正本 - BFFはこれをPass-throughする

export const EmployeeMasterErrorCode = {
  EMPLOYEE_NOT_FOUND: 'EMPLOYEE_NOT_FOUND',
  EMPLOYEE_CODE_DUPLICATE: 'EMPLOYEE_CODE_DUPLICATE',
  EMPLOYEE_CODE_CANNOT_BE_CHANGED: 'EMPLOYEE_CODE_CANNOT_BE_CHANGED',
  EMPLOYEE_ALREADY_INACTIVE: 'EMPLOYEE_ALREADY_INACTIVE',
  EMPLOYEE_ALREADY_ACTIVE: 'EMPLOYEE_ALREADY_ACTIVE',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
} as const

export type EmployeeMasterErrorCode = typeof EmployeeMasterErrorCode[keyof typeof EmployeeMasterErrorCode]

export interface EmployeeMasterError {
  code: EmployeeMasterErrorCode
  message: string
  details?: Record<string, unknown>
}

// HTTP Status Code mapping
export const EmployeeMasterErrorStatusMap: Record<EmployeeMasterErrorCode, number> = {
  [EmployeeMasterErrorCode.EMPLOYEE_NOT_FOUND]: 404,
  [EmployeeMasterErrorCode.EMPLOYEE_CODE_DUPLICATE]: 409,
  [EmployeeMasterErrorCode.EMPLOYEE_CODE_CANNOT_BE_CHANGED]: 422,
  [EmployeeMasterErrorCode.EMPLOYEE_ALREADY_INACTIVE]: 409,
  [EmployeeMasterErrorCode.EMPLOYEE_ALREADY_ACTIVE]: 409,
  [EmployeeMasterErrorCode.VALIDATION_ERROR]: 422,
}
