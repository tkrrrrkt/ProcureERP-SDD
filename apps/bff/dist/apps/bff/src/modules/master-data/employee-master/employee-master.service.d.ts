import { ListEmployeeMasterRequest as BffListRequest, ListEmployeeMasterResponse as BffListResponse, EmployeeMasterDetailResponse, CreateEmployeeMasterRequest as BffCreateRequest, UpdateEmployeeMasterRequest as BffUpdateRequest } from '@epm/contracts/bff/employee-master';
import { ListEmployeeMasterResponse as ApiListResponse, EmployeeMasterEntity } from '@epm/contracts/api/employee-master';
export interface DomainApiClient {
    list(tenantId: string, userId: string, request: unknown): Promise<ApiListResponse>;
    findById(tenantId: string, userId: string, id: string): Promise<EmployeeMasterEntity>;
    create(tenantId: string, userId: string, request: unknown): Promise<EmployeeMasterEntity>;
    update(tenantId: string, userId: string, id: string, request: unknown): Promise<EmployeeMasterEntity>;
    deactivate(tenantId: string, userId: string, id: string): Promise<EmployeeMasterEntity>;
    reactivate(tenantId: string, userId: string, id: string): Promise<EmployeeMasterEntity>;
}
export declare const DOMAIN_API_CLIENT = "EMPLOYEE_DOMAIN_API_CLIENT";
export declare class EmployeeMasterBffService {
    private readonly apiClient;
    constructor(apiClient: DomainApiClient);
    list(tenantId: string, userId: string, request: BffListRequest): Promise<BffListResponse>;
    findById(tenantId: string, userId: string, id: string): Promise<EmployeeMasterDetailResponse>;
    create(tenantId: string, userId: string, request: BffCreateRequest): Promise<EmployeeMasterDetailResponse>;
    update(tenantId: string, userId: string, id: string, request: BffUpdateRequest): Promise<EmployeeMasterDetailResponse>;
    deactivate(tenantId: string, userId: string, id: string): Promise<EmployeeMasterDetailResponse>;
    reactivate(tenantId: string, userId: string, id: string): Promise<EmployeeMasterDetailResponse>;
}
