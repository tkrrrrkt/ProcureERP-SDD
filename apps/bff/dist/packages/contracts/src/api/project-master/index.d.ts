export interface ListProjectMasterRequest {
    offset: number;
    limit: number;
    sortBy: 'projectCode' | 'projectName' | 'projectShortName' | 'plannedPeriodFrom' | 'budgetAmount';
    sortOrder: 'asc' | 'desc';
    projectCode?: string;
    projectName?: string;
    projectShortName?: string;
    departmentCode?: string;
    responsibleEmployeeCode?: string;
    includeInactive?: boolean;
}
export interface CreateProjectMasterRequest {
    projectCode: string;
    projectName: string;
    projectShortName?: string | null;
    projectKanaName?: string | null;
    departmentCode?: string | null;
    responsibleEmployeeCode?: string | null;
    responsibleEmployeeName?: string | null;
    plannedPeriodFrom: string;
    plannedPeriodTo: string;
    actualPeriodFrom?: string | null;
    actualPeriodTo?: string | null;
    budgetAmount: string;
}
export interface UpdateProjectMasterRequest {
    ifMatchVersion: number;
    projectName?: string;
    projectShortName?: string | null;
    projectKanaName?: string | null;
    departmentCode?: string | null;
    responsibleEmployeeCode?: string | null;
    responsibleEmployeeName?: string | null;
    plannedPeriodFrom?: string;
    plannedPeriodTo?: string;
    actualPeriodFrom?: string | null;
    actualPeriodTo?: string | null;
    budgetAmount?: string;
}
export interface ProjectMasterEntity {
    id: string;
    tenantId: string;
    projectCode: string;
    projectName: string;
    projectShortName?: string | null;
    projectKanaName?: string | null;
    departmentCode?: string | null;
    responsibleEmployeeCode?: string | null;
    responsibleEmployeeName?: string | null;
    plannedPeriodFrom: string;
    plannedPeriodTo: string;
    actualPeriodFrom?: string | null;
    actualPeriodTo?: string | null;
    budgetAmount: string;
    version: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string;
}
export interface ListProjectMasterResponse {
    items: ProjectMasterEntity[];
    totalCount: number;
}
