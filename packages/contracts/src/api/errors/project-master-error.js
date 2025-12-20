"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectMasterErrorStatusMap = exports.ProjectMasterErrorCode = void 0;
exports.ProjectMasterErrorCode = {
    PROJECT_NOT_FOUND: 'PROJECT_NOT_FOUND',
    PROJECT_CODE_DUPLICATE: 'PROJECT_CODE_DUPLICATE',
    PROJECT_CODE_CANNOT_BE_CHANGED: 'PROJECT_CODE_CANNOT_BE_CHANGED',
    PROJECT_ALREADY_INACTIVE: 'PROJECT_ALREADY_INACTIVE',
    PROJECT_ALREADY_ACTIVE: 'PROJECT_ALREADY_ACTIVE',
    STALE_UPDATE: 'STALE_UPDATE',
    INVALID_DATE_RANGE: 'INVALID_DATE_RANGE',
    ACTUAL_PERIOD_TO_REQUIRED: 'ACTUAL_PERIOD_TO_REQUIRED',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
};
exports.ProjectMasterErrorStatusMap = {
    [exports.ProjectMasterErrorCode.PROJECT_NOT_FOUND]: 404,
    [exports.ProjectMasterErrorCode.PROJECT_CODE_DUPLICATE]: 409,
    [exports.ProjectMasterErrorCode.PROJECT_CODE_CANNOT_BE_CHANGED]: 422,
    [exports.ProjectMasterErrorCode.PROJECT_ALREADY_INACTIVE]: 409,
    [exports.ProjectMasterErrorCode.PROJECT_ALREADY_ACTIVE]: 409,
    [exports.ProjectMasterErrorCode.STALE_UPDATE]: 409,
    [exports.ProjectMasterErrorCode.INVALID_DATE_RANGE]: 422,
    [exports.ProjectMasterErrorCode.ACTUAL_PERIOD_TO_REQUIRED]: 422,
    [exports.ProjectMasterErrorCode.VALIDATION_ERROR]: 422,
};
//# sourceMappingURL=project-master-error.js.map