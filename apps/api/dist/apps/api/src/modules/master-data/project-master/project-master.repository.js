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
exports.RepositoryError = exports.ProjectMasterRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
const errors_1 = require("../../../../../../packages/contracts/src/api/errors");
const SORT_BY_MAPPING = {
    projectCode: 'projectCode',
    projectName: 'projectName',
    projectShortName: 'projectShortName',
    plannedPeriodFrom: 'plannedPeriodFrom',
    budgetAmount: 'budgetAmount',
};
let ProjectMasterRepository = class ProjectMasterRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findMany(tenantId, params) {
        const { offset, limit, sortBy, sortOrder, projectCode, projectName, projectShortName, departmentCode, responsibleEmployeeCode, includeInactive, } = params;
        const mappedSortBy = SORT_BY_MAPPING[sortBy];
        if (!mappedSortBy) {
            throw new RepositoryError(errors_1.ProjectMasterErrorCode.VALIDATION_ERROR, `Invalid sortBy: ${sortBy}`);
        }
        const where = {
            tenantId,
            ...(projectCode && { projectCode }),
            ...(projectName && {
                projectName: { contains: projectName.trim(), mode: 'insensitive' },
            }),
            ...(projectShortName && {
                projectShortName: { contains: projectShortName.trim(), mode: 'insensitive' },
            }),
            ...(departmentCode && { departmentCode }),
            ...(responsibleEmployeeCode && { responsibleEmployeeCode }),
            ...(!includeInactive && { isActive: true }),
        };
        const [items, totalCount] = await Promise.all([
            this.prisma.project.findMany({
                where,
                orderBy: { [mappedSortBy]: sortOrder },
                skip: offset,
                take: limit,
            }),
            this.prisma.project.count({ where }),
        ]);
        return { items, totalCount };
    }
    async findById(tenantId, id) {
        return this.prisma.project.findFirst({
            where: {
                id,
                tenantId,
            },
        });
    }
    async findByProjectCode(tenantId, projectCode) {
        return this.prisma.project.findFirst({
            where: {
                projectCode,
                tenantId,
            },
        });
    }
    async create(tenantId, data) {
        return this.prisma.project.create({
            data: {
                tenantId,
                ...data,
                version: 0,
                isActive: true,
            },
        });
    }
    async update(tenantId, id, data, expectedVersion) {
        const result = await this.prisma.project.updateMany({
            where: {
                id,
                tenantId,
                version: expectedVersion,
            },
            data: {
                ...data,
                version: { increment: 1 },
            },
        });
        if (result.count === 0) {
            return null;
        }
        return this.findById(tenantId, id);
    }
    async updateStatus(tenantId, id, isActive, updatedBy, expectedVersion) {
        const result = await this.prisma.project.updateMany({
            where: {
                id,
                tenantId,
                version: expectedVersion,
            },
            data: {
                isActive,
                updatedBy,
                version: { increment: 1 },
            },
        });
        if (result.count === 0) {
            return null;
        }
        return this.findById(tenantId, id);
    }
};
exports.ProjectMasterRepository = ProjectMasterRepository;
exports.ProjectMasterRepository = ProjectMasterRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProjectMasterRepository);
class RepositoryError extends Error {
    constructor(code, message) {
        super(message);
        this.code = code;
        this.name = 'RepositoryError';
    }
}
exports.RepositoryError = RepositoryError;
//# sourceMappingURL=project-master.repository.js.map