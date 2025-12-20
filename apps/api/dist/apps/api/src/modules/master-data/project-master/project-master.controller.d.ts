import { CreateProjectMasterRequest, UpdateProjectMasterRequest, ProjectMasterEntity, ListProjectMasterResponse } from '@epm/contracts/api/project-master';
import { ProjectMasterService } from './project-master.service';
import { PrismaService } from '../../../prisma/prisma.service';
export interface RequestContext {
    tenantId: string;
    userId: string;
}
interface ListQueryDto {
    offset?: string;
    limit?: string;
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
export declare class ProjectMasterController {
    private readonly service;
    private readonly prisma;
    constructor(service: ProjectMasterService, prisma: PrismaService);
    list(tenantId: string, userId: string, query: ListQueryDto): Promise<ListProjectMasterResponse>;
    findById(tenantId: string, id: string): Promise<ProjectMasterEntity>;
    create(tenantId: string, userId: string, body: CreateProjectMasterRequest): Promise<ProjectMasterEntity>;
    update(tenantId: string, userId: string, id: string, body: UpdateProjectMasterRequest): Promise<ProjectMasterEntity>;
    deactivate(tenantId: string, userId: string, id: string, body: DeactivateDto): Promise<ProjectMasterEntity>;
    reactivate(tenantId: string, userId: string, id: string, body: DeactivateDto): Promise<ProjectMasterEntity>;
    private handleError;
}
export {};
