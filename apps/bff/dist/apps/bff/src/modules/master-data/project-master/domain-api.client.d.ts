import { ListProjectMasterResponse as ApiListResponse, ProjectMasterEntity } from '@epm/contracts/api/project-master';
import { DomainApiClient } from './project-master.service';
export declare class DomainApiHttpClient implements DomainApiClient {
    private readonly baseUrl;
    constructor();
    list(tenantId: string, userId: string, request: unknown): Promise<ApiListResponse>;
    findById(tenantId: string, userId: string, id: string): Promise<ProjectMasterEntity>;
    create(tenantId: string, userId: string, request: unknown): Promise<ProjectMasterEntity>;
    update(tenantId: string, userId: string, id: string, request: unknown): Promise<ProjectMasterEntity>;
    deactivate(tenantId: string, userId: string, id: string, ifMatchVersion: number): Promise<ProjectMasterEntity>;
    reactivate(tenantId: string, userId: string, id: string, ifMatchVersion: number): Promise<ProjectMasterEntity>;
    private handleError;
}
