import { ListEmployeeMasterRequest, CreateEmployeeMasterRequest, UpdateEmployeeMasterRequest, EmployeeMasterEntity, ListEmployeeMasterResponse } from '@epm/contracts/api/employee-master';
import { EmployeeMasterError } from '@epm/contracts/api/errors';
import { EmployeeMasterRepository } from './employee-master.repository';
export declare class ServiceError extends Error {
    readonly error: EmployeeMasterError;
    constructor(error: EmployeeMasterError);
}
export declare class EmployeeMasterService {
    private readonly repository;
    constructor(repository: EmployeeMasterRepository);
    list(tenantId: string, request: ListEmployeeMasterRequest): Promise<ListEmployeeMasterResponse>;
    findById(tenantId: string, id: string): Promise<EmployeeMasterEntity>;
    create(tenantId: string, userId: string, request: CreateEmployeeMasterRequest): Promise<EmployeeMasterEntity>;
    update(tenantId: string, userId: string, id: string, request: UpdateEmployeeMasterRequest): Promise<EmployeeMasterEntity>;
    deactivate(tenantId: string, userId: string, id: string): Promise<EmployeeMasterEntity>;
    reactivate(tenantId: string, userId: string, id: string): Promise<EmployeeMasterEntity>;
}
