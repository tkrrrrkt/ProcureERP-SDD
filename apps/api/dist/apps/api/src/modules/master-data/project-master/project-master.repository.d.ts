import { Project, Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
export interface FindManyParams {
    offset: number;
    limit: number;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    projectCode?: string;
    projectName?: string;
    projectShortName?: string;
    departmentCode?: string;
    responsibleEmployeeCode?: string;
    includeInactive?: boolean;
}
export interface CreateData {
    projectCode: string;
    projectName: string;
    projectShortName?: string | null;
    projectKanaName?: string | null;
    departmentCode?: string | null;
    responsibleEmployeeCode?: string | null;
    responsibleEmployeeName?: string | null;
    plannedPeriodFrom: Date;
    plannedPeriodTo: Date;
    actualPeriodFrom?: Date | null;
    actualPeriodTo?: Date | null;
    budgetAmount: Prisma.Decimal;
    createdBy: string;
    updatedBy: string;
}
export interface UpdateData {
    projectName?: string;
    projectShortName?: string | null;
    projectKanaName?: string | null;
    departmentCode?: string | null;
    responsibleEmployeeCode?: string | null;
    responsibleEmployeeName?: string | null;
    plannedPeriodFrom?: Date;
    plannedPeriodTo?: Date;
    actualPeriodFrom?: Date | null;
    actualPeriodTo?: Date | null;
    budgetAmount?: Prisma.Decimal;
    updatedBy: string;
}
export declare class ProjectMasterRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findMany(tenantId: string, params: FindManyParams): Promise<{
        items: Project[];
        totalCount: number;
    }>;
    findById(tenantId: string, id: string): Promise<Project | null>;
    findByProjectCode(tenantId: string, projectCode: string): Promise<Project | null>;
    create(tenantId: string, data: CreateData): Promise<Project>;
    update(tenantId: string, id: string, data: UpdateData, expectedVersion: number): Promise<Project | null>;
    updateStatus(tenantId: string, id: string, isActive: boolean, updatedBy: string, expectedVersion: number): Promise<Project | null>;
}
export declare class RepositoryError extends Error {
    readonly code: string;
    constructor(code: string, message: string);
}
