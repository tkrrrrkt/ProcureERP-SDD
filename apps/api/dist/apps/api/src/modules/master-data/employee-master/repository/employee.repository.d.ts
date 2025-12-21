import { PrismaService } from '../../../../prisma/prisma.service';
import { Employee } from '@prisma/client';
import { EmployeeSortBy, SortOrder } from '@procure/contracts/api/employee-master';
export declare class EmployeeRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findMany(params: {
        tenantId: string;
        offset: number;
        limit: number;
        sortBy?: EmployeeSortBy;
        sortOrder?: SortOrder;
        keyword?: string;
    }): Promise<{
        items: Employee[];
        total: number;
    }>;
    findOne(params: {
        tenantId: string;
        employeeId: string;
    }): Promise<Employee | null>;
    create(params: {
        tenantId: string;
        data: {
            employeeCode: string;
            employeeName: string;
            employeeKanaName: string;
            email?: string;
            joinDate: Date;
            retireDate?: Date;
            remarks?: string;
            isActive?: boolean;
        };
    }): Promise<Employee>;
    update(params: {
        tenantId: string;
        employeeId: string;
        version: number;
        data: {
            employeeCode: string;
            employeeName: string;
            employeeKanaName: string;
            email?: string;
            joinDate: Date;
            retireDate?: Date;
            remarks?: string;
            isActive: boolean;
        };
    }): Promise<Employee | null>;
    checkEmployeeCodeDuplicate(params: {
        tenantId: string;
        employeeCode: string;
        excludeEmployeeId?: string;
    }): Promise<boolean>;
}
