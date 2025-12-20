import { ListProjectMasterResponse, ProjectMasterDetailResponse, CreateProjectMasterRequest, UpdateProjectMasterRequest } from '@epm/contracts/bff/project-master';
import { ProjectMasterBffService } from './project-master.service';
interface ListQueryDto {
    page?: string;
    pageSize?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    projectCode?: string;
    projectName?: string;
    projectShortName?: string;
    departmentCode?: string;
    responsibleEmployeeCode?: string;
    includeInactive?: string;
}
interface DeactivateDto {
    ifMatchVersion: number;
}
export declare class ProjectMasterBffController {
    private readonly service;
    constructor(service: ProjectMasterBffService);
    list(tenantId: string, userId: string, query: ListQueryDto): Promise<ListProjectMasterResponse>;
    findById(tenantId: string, userId: string, id: string): Promise<ProjectMasterDetailResponse>;
    create(tenantId: string, userId: string, body: CreateProjectMasterRequest): Promise<ProjectMasterDetailResponse>;
    update(tenantId: string, userId: string, id: string, body: UpdateProjectMasterRequest): Promise<ProjectMasterDetailResponse>;
    deactivate(tenantId: string, userId: string, id: string, body: DeactivateDto): Promise<ProjectMasterDetailResponse>;
    reactivate(tenantId: string, userId: string, id: string, body: DeactivateDto): Promise<ProjectMasterDetailResponse>;
    private handleError;
}
export {};
