import { ListEmployeeMasterResponse as ApiListResponse, EmployeeMasterEntity } from '@epm/contracts/api/employee-master';
import { DomainApiClient } from './employee-master.service';
export declare class DomainApiHttpClient implements DomainApiClient {
    private readonly baseUrl;
    constructor();
    list(tenantId: string, userId: string, request: unknown): Promise<ApiListResponse>;
    findById(tenantId: string, userId: string, id: string): Promise<EmployeeMasterEntity>;
    create(tenantId: string, userId: string, request: unknown): Promise<EmployeeMasterEntity>;
    update(tenantId: string, userId: string, id: string, request: unknown): Promise<EmployeeMasterEntity>;
    deactivate(tenantId: string, userId: string, id: string): Promise<EmployeeMasterEntity>;
    reactivate(tenantId: string, userId: string, id: string): Promise<EmployeeMasterEntity>;
    private handleError;
}
