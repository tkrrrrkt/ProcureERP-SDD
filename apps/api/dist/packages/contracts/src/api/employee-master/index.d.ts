export interface ListEmployeeMasterRequest {
    offset: number;
    limit: number;
    sortBy: 'employeeCode' | 'employeeName';
    sortOrder: 'asc' | 'desc';
    employeeCode?: string;
    employeeName?: string;
    includeInactive?: boolean;
}
export interface CreateEmployeeMasterRequest {
    employeeCode: string;
    employeeName: string;
    organizationKey?: string | null;
}
export interface UpdateEmployeeMasterRequest {
    employeeName?: string;
    organizationKey?: string | null;
}
export interface EmployeeMasterEntity {
    id: string;
    tenantId: string;
    employeeCode: string;
    employeeName: string;
    organizationKey?: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string;
}
export interface ListEmployeeMasterResponse {
    items: EmployeeMasterEntity[];
    totalCount: number;
}
