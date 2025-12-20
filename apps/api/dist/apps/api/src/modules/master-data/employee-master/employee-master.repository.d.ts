import { Employee } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
export interface FindManyParams {
    offset: number;
    limit: number;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    employeeCode?: string;
    employeeName?: string;
    includeInactive?: boolean;
}
export interface CreateData {
    employeeCode: string;
    employeeName: string;
    organizationKey?: string | null;
    createdBy: string;
    updatedBy: string;
}
export interface UpdateData {
    employeeName?: string;
    organizationKey?: string | null;
    updatedBy: string;
}
export declare class EmployeeMasterRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findMany(tenantId: string, params: FindManyParams): Promise<{
        items: Employee[];
        totalCount: number;
    }>;
    findById(tenantId: string, id: string): Promise<Employee | null>;
    findByEmployeeCode(tenantId: string, employeeCode: string): Promise<Employee | null>;
    create(tenantId: string, data: CreateData): Promise<Employee>;
    update(tenantId: string, id: string, data: UpdateData): Promise<Employee | null>;
    updateStatus(tenantId: string, id: string, isActive: boolean, updatedBy: string): Promise<Employee | null>;
}
export declare class RepositoryError extends Error {
    readonly code: string;
    constructor(code: string, message: string);
}
