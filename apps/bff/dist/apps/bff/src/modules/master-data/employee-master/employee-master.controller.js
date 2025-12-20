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
exports.EmployeeMasterBffController = void 0;
const common_1 = require("@nestjs/common");
const employee_master_service_1 = require("./employee-master.service");
let EmployeeMasterBffController = class EmployeeMasterBffController {
    constructor(service) {
        this.service = service;
    }
    async list(tenantId, userId, query) {
        try {
            const request = {
                page: query.page ? parseInt(query.page, 10) : undefined,
                pageSize: query.pageSize ? parseInt(query.pageSize, 10) : undefined,
                sortBy: query.sortBy,
                sortOrder: query.sortOrder,
                employeeCode: query.employeeCode,
                employeeName: query.employeeName,
                includeInactive: query.includeInactive === 'true',
            };
            return await this.service.list(tenantId, userId, request);
        }
        catch (error) {
            throw this.handleError(error);
        }
    }
    async findById(tenantId, userId, id) {
        try {
            return await this.service.findById(tenantId, userId, id);
        }
        catch (error) {
            throw this.handleError(error);
        }
    }
    async create(tenantId, userId, body) {
        try {
            return await this.service.create(tenantId, userId, body);
        }
        catch (error) {
            throw this.handleError(error);
        }
    }
    async update(tenantId, userId, id, body) {
        try {
            return await this.service.update(tenantId, userId, id, body);
        }
        catch (error) {
            throw this.handleError(error);
        }
    }
    async deactivate(tenantId, userId, id) {
        try {
            return await this.service.deactivate(tenantId, userId, id);
        }
        catch (error) {
            throw this.handleError(error);
        }
    }
    async reactivate(tenantId, userId, id) {
        try {
            return await this.service.reactivate(tenantId, userId, id);
        }
        catch (error) {
            throw this.handleError(error);
        }
    }
    handleError(error) {
        if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
            const apiError = error;
            const statusCode = apiError.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR;
            return new common_1.HttpException({
                code: apiError.code,
                message: apiError.message,
                details: apiError.details,
            }, statusCode);
        }
        console.error('Unexpected BFF error:', error);
        return new common_1.HttpException({
            code: 'INTERNAL_ERROR',
            message: 'An unexpected error occurred',
        }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
    }
};
exports.EmployeeMasterBffController = EmployeeMasterBffController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], EmployeeMasterBffController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], EmployeeMasterBffController.prototype, "findById", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], EmployeeMasterBffController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], EmployeeMasterBffController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/deactivate'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], EmployeeMasterBffController.prototype, "deactivate", null);
__decorate([
    (0, common_1.Post)(':id/reactivate'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], EmployeeMasterBffController.prototype, "reactivate", null);
exports.EmployeeMasterBffController = EmployeeMasterBffController = __decorate([
    (0, common_1.Controller)('master-data/employee-master'),
    __metadata("design:paramtypes", [employee_master_service_1.EmployeeMasterBffService])
], EmployeeMasterBffController);
//# sourceMappingURL=employee-master.controller.js.map