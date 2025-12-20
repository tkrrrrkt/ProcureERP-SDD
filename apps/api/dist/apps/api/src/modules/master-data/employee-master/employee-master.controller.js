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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeMasterController = void 0;
const common_1 = require("@nestjs/common");
const errors_1 = require("../../../../../../packages/contracts/src/api/errors");
const employee_master_service_1 = require("./employee-master.service");
const prisma_service_1 = require("../../../prisma/prisma.service");
const VALID_SORT_BY = ['employeeCode', 'employeeName'];
let EmployeeMasterController = class EmployeeMasterController {
    constructor(service, prisma) {
        this.service = service;
        this.prisma = prisma;
    }
    async list(tenantId, userId, query) {
        try {
            await this.prisma.setTenantContext(tenantId);
            const sortBy = VALID_SORT_BY.includes(query.sortBy)
                ? query.sortBy
                : 'employeeCode';
            const request = {
                offset: query.offset ? parseInt(query.offset, 10) : 0,
                limit: query.limit ? parseInt(query.limit, 10) : 50,
                sortBy,
                sortOrder: query.sortOrder || 'asc',
                employeeCode: query.employeeCode,
                employeeName: query.employeeName,
                includeInactive: query.includeInactive === 'true',
            };
            return await this.service.list(tenantId, request);
        }
        catch (error) {
            throw this.handleError(error);
        }
    }
    async findById(tenantId, id) {
        try {
            await this.prisma.setTenantContext(tenantId);
            return await this.service.findById(tenantId, id);
        }
        catch (error) {
            throw this.handleError(error);
        }
    }
    async create(tenantId, userId, body) {
        try {
            await this.prisma.setTenantContext(tenantId);
            return await this.service.create(tenantId, userId, body);
        }
        catch (error) {
            throw this.handleError(error);
        }
    }
    async update(tenantId, userId, id, body) {
        try {
            await this.prisma.setTenantContext(tenantId);
            return await this.service.update(tenantId, userId, id, body);
        }
        catch (error) {
            throw this.handleError(error);
        }
    }
    async deactivate(tenantId, userId, id) {
        try {
            await this.prisma.setTenantContext(tenantId);
            return await this.service.deactivate(tenantId, userId, id);
        }
        catch (error) {
            throw this.handleError(error);
        }
    }
    async reactivate(tenantId, userId, id) {
        try {
            await this.prisma.setTenantContext(tenantId);
            return await this.service.reactivate(tenantId, userId, id);
        }
        catch (error) {
            throw this.handleError(error);
        }
    }
    handleError(error) {
        if (error instanceof employee_master_service_1.ServiceError) {
            const statusCode = errors_1.EmployeeMasterErrorStatusMap[error.error.code] ?? 500;
            return new common_1.HttpException({
                code: error.error.code,
                message: error.error.message,
                details: error.error.details,
            }, statusCode);
        }
        console.error('Unexpected error:', error);
        return new common_1.HttpException({
            code: 'INTERNAL_ERROR',
            message: 'An unexpected error occurred',
        }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
    }
};
exports.EmployeeMasterController = EmployeeMasterController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], EmployeeMasterController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], EmployeeMasterController.prototype, "findById", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], EmployeeMasterController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], EmployeeMasterController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/deactivate'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], EmployeeMasterController.prototype, "deactivate", null);
__decorate([
    (0, common_1.Post)(':id/reactivate'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], EmployeeMasterController.prototype, "reactivate", null);
exports.EmployeeMasterController = EmployeeMasterController = __decorate([
    (0, common_1.Controller)('master-data/employee-master'),
    __metadata("design:paramtypes", [employee_master_service_1.EmployeeMasterService,
        prisma_service_1.PrismaService])
], EmployeeMasterController);
//# sourceMappingURL=employee-master.controller.js.map