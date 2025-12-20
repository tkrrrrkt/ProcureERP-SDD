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
exports.ProjectMasterService = exports.ServiceError = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const errors_1 = require("../../../../../../packages/contracts/src/api/errors");
const project_master_repository_1 = require("./project-master.repository");
class ServiceError extends Error {
    constructor(error) {
        super(error.message);
        this.error = error;
        this.name = 'ServiceError';
    }
}
exports.ServiceError = ServiceError;
function createError(code, message, details) {
    return new ServiceError({ code, message, details });
}
function parseISODate(isoString) {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
        throw createError(errors_1.ProjectMasterErrorCode.VALIDATION_ERROR, `Invalid date format: ${isoString}`);
    }
    return date;
}
function parseDecimal(decimalString) {
    try {
        return new client_1.Prisma.Decimal(decimalString);
    }
    catch {
        throw createError(errors_1.ProjectMasterErrorCode.VALIDATION_ERROR, `Invalid decimal format: ${decimalString}`);
    }
}
function toEntity(project) {
    return {
        id: project.id,
        tenantId: project.tenantId,
        projectCode: project.projectCode,
        projectName: project.projectName,
        projectShortName: project.projectShortName,
        projectKanaName: project.projectKanaName,
        departmentCode: project.departmentCode,
        responsibleEmployeeCode: project.responsibleEmployeeCode,
        responsibleEmployeeName: project.responsibleEmployeeName,
        plannedPeriodFrom: project.plannedPeriodFrom.toISOString(),
        plannedPeriodTo: project.plannedPeriodTo.toISOString(),
        actualPeriodFrom: project.actualPeriodFrom?.toISOString() ?? null,
        actualPeriodTo: project.actualPeriodTo?.toISOString() ?? null,
        budgetAmount: project.budgetAmount.toString(),
        version: project.version,
        isActive: project.isActive,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString(),
        createdBy: project.createdBy,
        updatedBy: project.updatedBy,
    };
}
let ProjectMasterService = class ProjectMasterService {
    constructor(repository) {
        this.repository = repository;
    }
    async list(tenantId, request) {
        const params = {
            offset: request.offset,
            limit: request.limit,
            sortBy: request.sortBy,
            sortOrder: request.sortOrder,
            projectCode: request.projectCode,
            projectName: request.projectName,
            projectShortName: request.projectShortName,
            departmentCode: request.departmentCode,
            responsibleEmployeeCode: request.responsibleEmployeeCode,
            includeInactive: request.includeInactive,
        };
        const { items, totalCount } = await this.repository.findMany(tenantId, params);
        return {
            items: items.map(toEntity),
            totalCount,
        };
    }
    async findById(tenantId, id) {
        const project = await this.repository.findById(tenantId, id);
        if (!project) {
            throw createError(errors_1.ProjectMasterErrorCode.PROJECT_NOT_FOUND, `Project not found: ${id}`);
        }
        return toEntity(project);
    }
    async create(tenantId, userId, request) {
        const existing = await this.repository.findByProjectCode(tenantId, request.projectCode);
        if (existing) {
            throw createError(errors_1.ProjectMasterErrorCode.PROJECT_CODE_DUPLICATE, `Project code already exists: ${request.projectCode}`);
        }
        const plannedPeriodFrom = parseISODate(request.plannedPeriodFrom);
        const plannedPeriodTo = parseISODate(request.plannedPeriodTo);
        if (plannedPeriodFrom > plannedPeriodTo) {
            throw createError(errors_1.ProjectMasterErrorCode.INVALID_DATE_RANGE, 'Planned period from must be before or equal to planned period to');
        }
        let actualPeriodFrom = null;
        let actualPeriodTo = null;
        if (request.actualPeriodFrom) {
            actualPeriodFrom = parseISODate(request.actualPeriodFrom);
            if (!request.actualPeriodTo) {
                throw createError(errors_1.ProjectMasterErrorCode.ACTUAL_PERIOD_TO_REQUIRED, 'Actual period to is required when actual period from is specified');
            }
            actualPeriodTo = parseISODate(request.actualPeriodTo);
            if (actualPeriodFrom > actualPeriodTo) {
                throw createError(errors_1.ProjectMasterErrorCode.INVALID_DATE_RANGE, 'Actual period from must be before or equal to actual period to');
            }
        }
        else if (request.actualPeriodTo) {
            actualPeriodTo = parseISODate(request.actualPeriodTo);
        }
        const budgetAmount = parseDecimal(request.budgetAmount);
        const data = {
            projectCode: request.projectCode,
            projectName: request.projectName,
            projectShortName: request.projectShortName,
            projectKanaName: request.projectKanaName,
            departmentCode: request.departmentCode,
            responsibleEmployeeCode: request.responsibleEmployeeCode,
            responsibleEmployeeName: request.responsibleEmployeeName,
            plannedPeriodFrom,
            plannedPeriodTo,
            actualPeriodFrom,
            actualPeriodTo,
            budgetAmount,
            createdBy: userId,
            updatedBy: userId,
        };
        const created = await this.repository.create(tenantId, data);
        return toEntity(created);
    }
    async update(tenantId, userId, id, request) {
        const existing = await this.repository.findById(tenantId, id);
        if (!existing) {
            throw createError(errors_1.ProjectMasterErrorCode.PROJECT_NOT_FOUND, `Project not found: ${id}`);
        }
        if (existing.version !== request.ifMatchVersion) {
            throw createError(errors_1.ProjectMasterErrorCode.STALE_UPDATE, 'The project has been modified by another user. Please refresh and try again.');
        }
        let plannedPeriodFrom;
        let plannedPeriodTo;
        if (request.plannedPeriodFrom !== undefined) {
            plannedPeriodFrom = parseISODate(request.plannedPeriodFrom);
        }
        if (request.plannedPeriodTo !== undefined) {
            plannedPeriodTo = parseISODate(request.plannedPeriodTo);
        }
        const finalFrom = plannedPeriodFrom ?? existing.plannedPeriodFrom;
        const finalTo = plannedPeriodTo ?? existing.plannedPeriodTo;
        if (finalFrom > finalTo) {
            throw createError(errors_1.ProjectMasterErrorCode.INVALID_DATE_RANGE, 'Planned period from must be before or equal to planned period to');
        }
        let actualPeriodFrom;
        let actualPeriodTo;
        if (request.actualPeriodFrom !== undefined) {
            actualPeriodFrom = request.actualPeriodFrom ? parseISODate(request.actualPeriodFrom) : null;
        }
        if (request.actualPeriodTo !== undefined) {
            actualPeriodTo = request.actualPeriodTo ? parseISODate(request.actualPeriodTo) : null;
        }
        const finalActualFrom = actualPeriodFrom !== undefined ? actualPeriodFrom : existing.actualPeriodFrom;
        const finalActualTo = actualPeriodTo !== undefined ? actualPeriodTo : existing.actualPeriodTo;
        if (finalActualFrom && !finalActualTo) {
            throw createError(errors_1.ProjectMasterErrorCode.ACTUAL_PERIOD_TO_REQUIRED, 'Actual period to is required when actual period from is specified');
        }
        if (finalActualFrom && finalActualTo && finalActualFrom > finalActualTo) {
            throw createError(errors_1.ProjectMasterErrorCode.INVALID_DATE_RANGE, 'Actual period from must be before or equal to actual period to');
        }
        let budgetAmount;
        if (request.budgetAmount !== undefined) {
            budgetAmount = parseDecimal(request.budgetAmount);
        }
        const data = {
            ...(request.projectName !== undefined && { projectName: request.projectName }),
            ...(request.projectShortName !== undefined && { projectShortName: request.projectShortName }),
            ...(request.projectKanaName !== undefined && { projectKanaName: request.projectKanaName }),
            ...(request.departmentCode !== undefined && { departmentCode: request.departmentCode }),
            ...(request.responsibleEmployeeCode !== undefined && { responsibleEmployeeCode: request.responsibleEmployeeCode }),
            ...(request.responsibleEmployeeName !== undefined && { responsibleEmployeeName: request.responsibleEmployeeName }),
            ...(plannedPeriodFrom && { plannedPeriodFrom }),
            ...(plannedPeriodTo && { plannedPeriodTo }),
            ...(actualPeriodFrom !== undefined && { actualPeriodFrom }),
            ...(actualPeriodTo !== undefined && { actualPeriodTo }),
            ...(budgetAmount && { budgetAmount }),
            updatedBy: userId,
        };
        const updated = await this.repository.update(tenantId, id, data, request.ifMatchVersion);
        if (!updated) {
            throw createError(errors_1.ProjectMasterErrorCode.STALE_UPDATE, 'The project has been modified by another user. Please refresh and try again.');
        }
        return toEntity(updated);
    }
    async deactivate(tenantId, userId, id, ifMatchVersion) {
        const existing = await this.repository.findById(tenantId, id);
        if (!existing) {
            throw createError(errors_1.ProjectMasterErrorCode.PROJECT_NOT_FOUND, `Project not found: ${id}`);
        }
        if (!existing.isActive) {
            throw createError(errors_1.ProjectMasterErrorCode.PROJECT_ALREADY_INACTIVE, 'Project is already inactive');
        }
        if (existing.version !== ifMatchVersion) {
            throw createError(errors_1.ProjectMasterErrorCode.STALE_UPDATE, 'The project has been modified by another user. Please refresh and try again.');
        }
        const updated = await this.repository.updateStatus(tenantId, id, false, userId, ifMatchVersion);
        if (!updated) {
            throw createError(errors_1.ProjectMasterErrorCode.STALE_UPDATE, 'The project has been modified by another user. Please refresh and try again.');
        }
        return toEntity(updated);
    }
    async reactivate(tenantId, userId, id, ifMatchVersion) {
        const existing = await this.repository.findById(tenantId, id);
        if (!existing) {
            throw createError(errors_1.ProjectMasterErrorCode.PROJECT_NOT_FOUND, `Project not found: ${id}`);
        }
        if (existing.isActive) {
            throw createError(errors_1.ProjectMasterErrorCode.PROJECT_ALREADY_ACTIVE, 'Project is already active');
        }
        if (existing.version !== ifMatchVersion) {
            throw createError(errors_1.ProjectMasterErrorCode.STALE_UPDATE, 'The project has been modified by another user. Please refresh and try again.');
        }
        const updated = await this.repository.updateStatus(tenantId, id, true, userId, ifMatchVersion);
        if (!updated) {
            throw createError(errors_1.ProjectMasterErrorCode.STALE_UPDATE, 'The project has been modified by another user. Please refresh and try again.');
        }
        return toEntity(updated);
    }
};
exports.ProjectMasterService = ProjectMasterService;
exports.ProjectMasterService = ProjectMasterService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [project_master_repository_1.ProjectMasterRepository])
], ProjectMasterService);
//# sourceMappingURL=project-master.service.js.map