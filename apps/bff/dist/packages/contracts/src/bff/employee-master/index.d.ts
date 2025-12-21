export type EmployeeSortBy = 'employeeCode' | 'employeeName' | 'employeeKanaName' | 'email' | 'joinDate' | 'retireDate' | 'isActive';
export type SortOrder = 'asc' | 'desc';
export interface EmployeeDto {
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
export interface ListEmployeesRequest {
    page?: number;
    pageSize?: number;
    sortBy?: EmployeeSortBy;
    sortOrder?: SortOrder;
    keyword?: string;
}
export interface ListEmployeesResponse {
    items: EmployeeDto[];
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
}
export interface GetEmployeeResponse {
    employee: EmployeeDto;
}
export interface CreateEmployeeRequest {
    employeeCode: string;
    employeeName: string;
    employeeKanaName: string;
    email?: string;
    joinDate: string;
    retireDate?: string;
    remarks?: string;
    isActive?: boolean;
}
export interface CreateEmployeeResponse {
    employee: EmployeeDto;
}
export interface UpdateEmployeeRequest {
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
export interface UpdateEmployeeResponse {
    employee: EmployeeDto;
}
