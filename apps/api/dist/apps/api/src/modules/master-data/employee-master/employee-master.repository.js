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
exports.RepositoryError = exports.EmployeeMasterRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
const errors_1 = require("../../../../../../packages/contracts/src/api/errors");
const SORT_BY_MAPPING = {
    employeeCode: 'employeeCode',
    employeeName: 'employeeName',
};
let EmployeeMasterRepository = class EmployeeMasterRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findMany(tenantId, params) {
        const { offset, limit, sortBy, sortOrder, employeeCode, employeeName, includeInactive, } = params;
        const mappedSortBy = SORT_BY_MAPPING[sortBy];
        if (!mappedSortBy) {
            throw new RepositoryError(errors_1.EmployeeMasterErrorCode.VALIDATION_ERROR, `Invalid sortBy: ${sortBy}`);
        }
        const where = {
            tenantId,
            ...(employeeCode && { employeeCode }),
            ...(employeeName && {
                employeeName: { contains: employeeName.trim(), mode: 'insensitive' },
            }),
            ...(!includeInactive && { isActive: true }),
        };
        const [items, totalCount] = await Promise.all([
            this.prisma.employee.findMany({
                where,
                orderBy: { [mappedSortBy]: sortOrder },
                skip: offset,
                take: limit,
            }),
            this.prisma.employee.count({ where }),
        ]);
        return { items, totalCount };
    }
    async findById(tenantId, id) {
        return this.prisma.employee.findFirst({
            where: {
                id,
                tenantId,
            },
        });
    }
    async findByEmployeeCode(tenantId, employeeCode) {
        return this.prisma.employee.findFirst({
            where: {
                employeeCode,
                tenantId,
            },
        });
    }
    async create(tenantId, data) {
        return this.prisma.employee.create({
            data: {
                tenantId,
                ...data,
                isActive: true,
            },
        });
    }
    async update(tenantId, id, data) {
        const result = await this.prisma.employee.updateMany({
            where: {
                id,
                tenantId,
            },
            data: {
                ...data,
            },
        });
        if (result.count === 0) {
            return null;
        }
        return this.findById(tenantId, id);
    }
    async updateStatus(tenantId, id, isActive, updatedBy) {
        const result = await this.prisma.employee.updateMany({
            where: {
                id,
                tenantId,
            },
            data: {
                isActive,
                updatedBy,
            },
        });
        if (result.count === 0) {
            return null;
        }
        return this.findById(tenantId, id);
    }
};
exports.EmployeeMasterRepository = EmployeeMasterRepository;
exports.EmployeeMasterRepository = EmployeeMasterRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EmployeeMasterRepository);
class RepositoryError extends Error {
    constructor(code, message) {
        super(message);
        this.code = code;
        this.name = 'RepositoryError';
    }
}
exports.RepositoryError = RepositoryError;
//# sourceMappingURL=employee-master.repository.js.map