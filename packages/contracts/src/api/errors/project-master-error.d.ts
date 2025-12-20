export declare const ProjectMasterErrorCode: {
    readonly PROJECT_NOT_FOUND: "PROJECT_NOT_FOUND";
    readonly PROJECT_CODE_DUPLICATE: "PROJECT_CODE_DUPLICATE";
    readonly PROJECT_CODE_CANNOT_BE_CHANGED: "PROJECT_CODE_CANNOT_BE_CHANGED";
    readonly PROJECT_ALREADY_INACTIVE: "PROJECT_ALREADY_INACTIVE";
    readonly PROJECT_ALREADY_ACTIVE: "PROJECT_ALREADY_ACTIVE";
    readonly STALE_UPDATE: "STALE_UPDATE";
    readonly INVALID_DATE_RANGE: "INVALID_DATE_RANGE";
    readonly ACTUAL_PERIOD_TO_REQUIRED: "ACTUAL_PERIOD_TO_REQUIRED";
    readonly VALIDATION_ERROR: "VALIDATION_ERROR";
};
export type ProjectMasterErrorCode = typeof ProjectMasterErrorCode[keyof typeof ProjectMasterErrorCode];
export interface ProjectMasterError {
    code: ProjectMasterErrorCode;
    message: string;
    details?: Record<string, unknown>;
}
export declare const ProjectMasterErrorStatusMap: Record<ProjectMasterErrorCode, number>;
