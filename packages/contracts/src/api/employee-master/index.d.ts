export type EmployeeSortBy = 'employeeCode' | 'employeeName' | 'employeeKanaName' | 'email' | 'joinDate' | 'retireDate' | 'isActive';
export type SortOrder = 'asc' | 'desc';
export interface EmployeeApiDto {
    id: string;
    employeeCode: string;
    employeeName: string;
    employeeKanaName: string;
    email: string | null;
    joinDate: string;
    retireDate: string | null;
    remarks: string | null;
    isActive: boolean;
    version: number;
    createdAt: string;
    updatedAt: string;
}
export interface ListEmployeesApiRequest {
    offset: number;
    limit: number;
    sortBy?: EmployeeSortBy;
    sortOrder?: SortOrder;
    keyword?: string;
}
export interface ListEmployeesApiResponse {
    items: EmployeeApiDto[];
    total: number;
}
export interface GetEmployeeApiResponse {
    employee: EmployeeApiDto;
}
export interface CreateEmployeeApiRequest {
    employeeCode: string;
    employeeName: string;
    employeeKanaName: string;
    email?: string;
    joinDate: string;
    retireDate?: string;
    remarks?: string;
    isActive?: boolean;
}
export interface CreateEmployeeApiResponse {
    employee: EmployeeApiDto;
}
export interface UpdateEmployeeApiRequest {
    employeeCode: string;
    employeeName: string;
    employeeKanaName: string;
    email?: string;
    joinDate: string;
    retireDate?: string;
    remarks?: string;
    isActive: boolean;
    version: number;
}
export interface UpdateEmployeeApiResponse {
    employee: EmployeeApiDto;
}
