import { CreateEmployeeMasterRequest, UpdateEmployeeMasterRequest, EmployeeMasterEntity, ListEmployeeMasterResponse } from '@epm/contracts/api/employee-master';
import { EmployeeMasterService } from './employee-master.service';
import { PrismaService } from '../../../prisma/prisma.service';
interface ListQueryDto {
    offset?: string;
    limit?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    employeeCode?: string;
    employeeName?: string;
    includeInactive?: string;
}
export declare class EmployeeMasterController {
    private readonly service;
    private readonly prisma;
    constructor(service: EmployeeMasterService, prisma: PrismaService);
    list(tenantId: string, userId: string, query: ListQueryDto): Promise<ListEmployeeMasterResponse>;
    findById(tenantId: string, id: string): Promise<EmployeeMasterEntity>;
    create(tenantId: string, userId: string, body: CreateEmployeeMasterRequest): Promise<EmployeeMasterEntity>;
    update(tenantId: string, userId: string, id: string, body: UpdateEmployeeMasterRequest): Promise<EmployeeMasterEntity>;
    deactivate(tenantId: string, userId: string, id: string): Promise<EmployeeMasterEntity>;
    reactivate(tenantId: string, userId: string, id: string): Promise<EmployeeMasterEntity>;
    private handleError;
}
export {};
