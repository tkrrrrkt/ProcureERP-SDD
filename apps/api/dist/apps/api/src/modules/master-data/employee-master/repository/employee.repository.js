"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../prisma/prisma.service");
let EmployeeRepository = class EmployeeRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findMany(params) {
        const { tenantId, offset, limit, sortBy, sortOrder, keyword } = params;
        const where = {
            tenantId,
        };
        if (keyword) {
            where.OR = [
                { employeeCode: { contains: keyword, mode: 'insensitive' } },
                { employeeName: { contains: keyword, mode: 'insensitive' } },
                { employeeKanaName: { contains: keyword, mode: 'insensitive' } },
            ];
        }
        const sortField = sortBy || 'employeeCode';
        const sortDirection = sortOrder || 'asc';
        const orderBy = {
            [sortField]: sortDirection,
        };
        const [items, total] = await Promise.all([
            this.prisma.employee.findMany({
                where,
                orderBy,
                skip: offset,
                take: limit,
            }),
            this.prisma.employee.count({ where }),
        ]);
        return { items, total };
    }
    async findOne(params) {
        const { tenantId, employeeId } = params;
        return this.prisma.employee.findFirst({
            where: {
                id: employeeId,
                tenantId,
            },
        });
    }
    async create(params) {
        const { tenantId, data } = params;
        return this.prisma.employee.create({
            data: {
                tenantId,
                employeeCode: data.employeeCode,
                employeeName: data.employeeName,
                employeeKanaName: data.employeeKanaName,
                email: data.email ?? null,
                joinDate: data.joinDate,
                retireDate: data.retireDate ?? null,
                remarks: data.remarks ?? null,
                isActive: data.isActive ?? true,
                version: 1,
            },
        });
    }
    async update(params) {
        const { tenantId, employeeId, version, data } = params;
        try {
            const updated = await this.prisma.employee.updateMany({
                where: {
                    id: employeeId,
                    tenantId,
                    version,
                },
                data: {
                    employeeCode: data.employeeCode,
                    employeeName: data.employeeName,
                    employeeKanaName: data.employeeKanaName,
                    email: data.email ?? null,
                    joinDate: data.joinDate,
                    retireDate: data.retireDate ?? null,
                    remarks: data.remarks ?? null,
                    isActive: data.isActive,
                    version: version + 1,
                },
            });
            if (updated.count === 0) {
                return null;
            }
            return this.findOne({ tenantId, employeeId });
        }
        catch (error) {
            throw error;
        }
    }
    async checkEmployeeCodeDuplicate(params) {
        const { tenantId, employeeCode, excludeEmployeeId } = params;
        const where = {
            tenantId,
            employeeCode,
        };
        if (excludeEmployeeId) {
            where.id = { not: excludeEmployeeId };
        }
        const count = await this.prisma.employee.count({ where });
        return count > 0;
    }
};
exports.EmployeeRepository = EmployeeRepository;
exports.EmployeeRepository = EmployeeRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EmployeeRepository);
//# sourceMappingURL=employee.repository.js.map