export interface ListEmployeeMasterRequest {
    page?: number;
    pageSize?: number;
    sortBy?: 'employeeCode' | 'employeeName';
    sortOrder?: 'asc' | 'desc';
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
export interface EmployeeMasterListItem {
    id: string;
    employeeCode: string;
    employeeName: string;
    organizationKey?: string | null;
    isActive: boolean;
}
export interface ListEmployeeMasterResponse {
    items: EmployeeMasterListItem[];
    page: number;
    pageSize: number;
    totalCount: number;
}
export interface EmployeeMasterDetailResponse {
    id: string;
    employeeCode: string;
    employeeName: string;
    organizationKey?: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string;
}
