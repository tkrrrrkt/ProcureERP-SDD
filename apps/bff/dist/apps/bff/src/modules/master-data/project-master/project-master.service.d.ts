import { ListProjectMasterRequest as BffListRequest, ListProjectMasterResponse as BffListResponse, ProjectMasterDetailResponse, CreateProjectMasterRequest as BffCreateRequest, UpdateProjectMasterRequest as BffUpdateRequest } from '@epm/contracts/bff/project-master';
import { ListProjectMasterResponse as ApiListResponse, ProjectMasterEntity } from '@epm/contracts/api/project-master';
export interface DomainApiClient {
    list(tenantId: string, userId: string, request: unknown): Promise<ApiListResponse>;
    findById(tenantId: string, userId: string, id: string): Promise<ProjectMasterEntity>;
    create(tenantId: string, userId: string, request: unknown): Promise<ProjectMasterEntity>;
    update(tenantId: string, userId: string, id: string, request: unknown): Promise<ProjectMasterEntity>;
    deactivate(tenantId: string, userId: string, id: string, ifMatchVersion: number): Promise<ProjectMasterEntity>;
    reactivate(tenantId: string, userId: string, id: string, ifMatchVersion: number): Promise<ProjectMasterEntity>;
}
export declare const DOMAIN_API_CLIENT = "DOMAIN_API_CLIENT";
export declare class ProjectMasterBffService {
    private readonly apiClient;
    constructor(apiClient: DomainApiClient);
    list(tenantId: string, userId: string, request: BffListRequest): Promise<BffListResponse>;
    findById(tenantId: string, userId: string, id: string): Promise<ProjectMasterDetailResponse>;
    create(tenantId: string, userId: string, request: BffCreateRequest): Promise<ProjectMasterDetailResponse>;
    update(tenantId: string, userId: string, id: string, request: BffUpdateRequest): Promise<ProjectMasterDetailResponse>;
    deactivate(tenantId: string, userId: string, id: string, ifMatchVersion: number): Promise<ProjectMasterDetailResponse>;
    reactivate(tenantId: string, userId: string, id: string, ifMatchVersion: number): Promise<ProjectMasterDetailResponse>;
}
