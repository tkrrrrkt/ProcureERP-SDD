import { ListProjectMasterRequest, CreateProjectMasterRequest, UpdateProjectMasterRequest, ProjectMasterEntity, ListProjectMasterResponse } from '@epm/contracts/api/project-master';
import { ProjectMasterError } from '@epm/contracts/api/errors';
import { ProjectMasterRepository } from './project-master.repository';
export declare class ServiceError extends Error {
    readonly error: ProjectMasterError;
    constructor(error: ProjectMasterError);
}
export declare class ProjectMasterService {
    private readonly repository;
    constructor(repository: ProjectMasterRepository);
    list(tenantId: string, request: ListProjectMasterRequest): Promise<ListProjectMasterResponse>;
    findById(tenantId: string, id: string): Promise<ProjectMasterEntity>;
    create(tenantId: string, userId: string, request: CreateProjectMasterRequest): Promise<ProjectMasterEntity>;
    update(tenantId: string, userId: string, id: string, request: UpdateProjectMasterRequest): Promise<ProjectMasterEntity>;
    deactivate(tenantId: string, userId: string, id: string, ifMatchVersion: number): Promise<ProjectMasterEntity>;
    reactivate(tenantId: string, userId: string, id: string, ifMatchVersion: number): Promise<ProjectMasterEntity>;
}
