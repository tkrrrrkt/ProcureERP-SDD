import { ListEmployeeMasterResponse, EmployeeMasterDetailResponse, CreateEmployeeMasterRequest, UpdateEmployeeMasterRequest } from '@epm/contracts/bff/employee-master';
import { EmployeeMasterBffService } from './employee-master.service';
interface ListQueryDto {
    page?: string;
    pageSize?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    employeeCode?: string;
    employeeName?: string;
    includeInactive?: string;
}
export declare class EmployeeMasterBffController {
    private readonly service;
    constructor(service: EmployeeMasterBffService);
    list(tenantId: string, userId: string, query: ListQueryDto): Promise<ListEmployeeMasterResponse>;
    findById(tenantId: string, userId: string, id: string): Promise<EmployeeMasterDetailResponse>;
    create(tenantId: string, userId: string, body: CreateEmployeeMasterRequest): Promise<EmployeeMasterDetailResponse>;
    update(tenantId: string, userId: string, id: string, body: UpdateEmployeeMasterRequest): Promise<EmployeeMasterDetailResponse>;
    deactivate(tenantId: string, userId: string, id: string): Promise<EmployeeMasterDetailResponse>;
    reactivate(tenantId: string, userId: string, id: string): Promise<EmployeeMasterDetailResponse>;
    private handleError;
}
export {};
