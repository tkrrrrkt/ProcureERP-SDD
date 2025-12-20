// Project Master Domain API Errors
// Domain API正本 - BFFはこれをPass-throughする

export const ProjectMasterErrorCode = {
  PROJECT_NOT_FOUND: 'PROJECT_NOT_FOUND',
  PROJECT_CODE_DUPLICATE: 'PROJECT_CODE_DUPLICATE',
  PROJECT_CODE_CANNOT_BE_CHANGED: 'PROJECT_CODE_CANNOT_BE_CHANGED',
  PROJECT_ALREADY_INACTIVE: 'PROJECT_ALREADY_INACTIVE',
  PROJECT_ALREADY_ACTIVE: 'PROJECT_ALREADY_ACTIVE',
  STALE_UPDATE: 'STALE_UPDATE',
  INVALID_DATE_RANGE: 'INVALID_DATE_RANGE',
  ACTUAL_PERIOD_TO_REQUIRED: 'ACTUAL_PERIOD_TO_REQUIRED',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
} as const

export type ProjectMasterErrorCode = typeof ProjectMasterErrorCode[keyof typeof ProjectMasterErrorCode]

export interface ProjectMasterError {
  code: ProjectMasterErrorCode
  message: string
  details?: Record<string, unknown>
}

// HTTP Status Code mapping
export const ProjectMasterErrorStatusMap: Record<ProjectMasterErrorCode, number> = {
  [ProjectMasterErrorCode.PROJECT_NOT_FOUND]: 404,
  [ProjectMasterErrorCode.PROJECT_CODE_DUPLICATE]: 409,
  [ProjectMasterErrorCode.PROJECT_CODE_CANNOT_BE_CHANGED]: 422,
  [ProjectMasterErrorCode.PROJECT_ALREADY_INACTIVE]: 409,
  [ProjectMasterErrorCode.PROJECT_ALREADY_ACTIVE]: 409,
  [ProjectMasterErrorCode.STALE_UPDATE]: 409,
  [ProjectMasterErrorCode.INVALID_DATE_RANGE]: 422,
  [ProjectMasterErrorCode.ACTUAL_PERIOD_TO_REQUIRED]: 422,
  [ProjectMasterErrorCode.VALIDATION_ERROR]: 422,
}
