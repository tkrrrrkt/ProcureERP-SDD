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
exports.EmployeeMasterService = exports.ServiceError = void 0;
const common_1 = require("@nestjs/common");
const errors_1 = require("../../../../../../packages/contracts/src/api/errors");
const employee_master_repository_1 = require("./employee-master.repository");
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
function toEntity(employee) {
    return {
        id: employee.id,
        tenantId: employee.tenantId,
        employeeCode: employee.employeeCode,
        employeeName: employee.employeeName,
        organizationKey: employee.organizationKey,
        isActive: employee.isActive,
        createdAt: employee.createdAt.toISOString(),
        updatedAt: employee.updatedAt.toISOString(),
        createdBy: employee.createdBy,
        updatedBy: employee.updatedBy,
    };
}
let EmployeeMasterService = class EmployeeMasterService {
    constructor(repository) {
        this.repository = repository;
    }
    async list(tenantId, request) {
        const params = {
            offset: request.offset,
            limit: request.limit,
            sortBy: request.sortBy,
            sortOrder: request.sortOrder,
            employeeCode: request.employeeCode,
            employeeName: request.employeeName,
            includeInactive: request.includeInactive,
        };
        const { items, totalCount } = await this.repository.findMany(tenantId, params);
        return {
            items: items.map(toEntity),
            totalCount,
        };
    }
    async findById(tenantId, id) {
        const employee = await this.repository.findById(tenantId, id);
        if (!employee) {
            throw createError(errors_1.EmployeeMasterErrorCode.EMPLOYEE_NOT_FOUND, `Employee not found: ${id}`);
        }
        return toEntity(employee);
    }
    async create(tenantId, userId, request) {
        const existing = await this.repository.findByEmployeeCode(tenantId, request.employeeCode);
        if (existing) {
            throw createError(errors_1.EmployeeMasterErrorCode.EMPLOYEE_CODE_DUPLICATE, `Employee code already exists: ${request.employeeCode}`);
        }
        const data = {
            employeeCode: request.employeeCode,
            employeeName: request.employeeName,
            organizationKey: request.organizationKey,
            createdBy: userId,
            updatedBy: userId,
        };
        const created = await this.repository.create(tenantId, data);
        return toEntity(created);
    }
    async update(tenantId, userId, id, request) {
        const existing = await this.repository.findById(tenantId, id);
        if (!existing) {
            throw createError(errors_1.EmployeeMasterErrorCode.EMPLOYEE_NOT_FOUND, `Employee not found: ${id}`);
        }
        const data = {
            ...(request.employeeName !== undefined && { employeeName: request.employeeName }),
            ...(request.organizationKey !== undefined && { organizationKey: request.organizationKey }),
            updatedBy: userId,
        };
        const updated = await this.repository.update(tenantId, id, data);
        if (!updated) {
            throw createError(errors_1.EmployeeMasterErrorCode.EMPLOYEE_NOT_FOUND, `Employee not found: ${id}`);
        }
        return toEntity(updated);
    }
    async deactivate(tenantId, userId, id) {
        const existing = await this.repository.findById(tenantId, id);
        if (!existing) {
            throw createError(errors_1.EmployeeMasterErrorCode.EMPLOYEE_NOT_FOUND, `Employee not found: ${id}`);
        }
        if (!existing.isActive) {
            throw createError(errors_1.EmployeeMasterErrorCode.EMPLOYEE_ALREADY_INACTIVE, 'Employee is already inactive');
        }
        const updated = await this.repository.updateStatus(tenantId, id, false, userId);
        if (!updated) {
            throw createError(errors_1.EmployeeMasterErrorCode.EMPLOYEE_NOT_FOUND, `Employee not found: ${id}`);
        }
        return toEntity(updated);
    }
    async reactivate(tenantId, userId, id) {
        const existing = await this.repository.findById(tenantId, id);
        if (!existing) {
            throw createError(errors_1.EmployeeMasterErrorCode.EMPLOYEE_NOT_FOUND, `Employee not found: ${id}`);
        }
        if (existing.isActive) {
            throw createError(errors_1.EmployeeMasterErrorCode.EMPLOYEE_ALREADY_ACTIVE, 'Employee is already active');
        }
        const updated = await this.repository.updateStatus(tenantId, id, true, userId);
        if (!updated) {
            throw createError(errors_1.EmployeeMasterErrorCode.EMPLOYEE_NOT_FOUND, `Employee not found: ${id}`);
        }
        return toEntity(updated);
    }
};
exports.EmployeeMasterService = EmployeeMasterService;
exports.EmployeeMasterService = EmployeeMasterService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [employee_master_repository_1.EmployeeMasterRepository])
], EmployeeMasterService);
//# sourceMappingURL=employee-master.service.js.map