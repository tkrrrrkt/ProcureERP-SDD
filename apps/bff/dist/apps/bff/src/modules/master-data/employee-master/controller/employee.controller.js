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
exports.EmployeeBffController = void 0;
const common_1 = require("@nestjs/common");
const employee_service_1 = require("../service/employee.service");
let EmployeeBffController = class EmployeeBffController {
    constructor(employeeService) {
        this.employeeService = employeeService;
    }
    async listEmployees(tenantId, userId, page, pageSize, sortBy, sortOrder, keyword) {
        this.validateAuth(tenantId, userId);
        const request = {
            page: page ? parseInt(page, 10) : undefined,
            pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
            sortBy,
            sortOrder,
            keyword,
        };
        return this.employeeService.listEmployees(tenantId, userId, request);
    }
    async getEmployee(tenantId, userId, employeeId) {
        this.validateAuth(tenantId, userId);
        return this.employeeService.getEmployee(tenantId, userId, employeeId);
    }
    async createEmployee(tenantId, userId, request) {
        this.validateAuth(tenantId, userId);
        return this.employeeService.createEmployee(tenantId, userId, request);
    }
    async updateEmployee(tenantId, userId, employeeId, request) {
        this.validateAuth(tenantId, userId);
        return this.employeeService.updateEmployee(tenantId, userId, employeeId, request);
    }
    validateAuth(tenantId, userId) {
        if (!tenantId || !userId) {
            throw new common_1.HttpException({ message: 'Unauthorized: Missing tenant_id or user_id' }, common_1.HttpStatus.UNAUTHORIZED);
        }
    }
};
exports.EmployeeBffController = EmployeeBffController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('pageSize')),
    __param(4, (0, common_1.Query)('sortBy')),
    __param(5, (0, common_1.Query)('sortOrder')),
    __param(6, (0, common_1.Query)('keyword')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], EmployeeBffController.prototype, "listEmployees", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], EmployeeBffController.prototype, "getEmployee", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], EmployeeBffController.prototype, "createEmployee", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], EmployeeBffController.prototype, "updateEmployee", null);
exports.EmployeeBffController = EmployeeBffController = __decorate([
    (0, common_1.Controller)('master-data/employee-master'),
    __metadata("design:paramtypes", [employee_service_1.EmployeeBffService])
], EmployeeBffController);
//# sourceMappingURL=employee.controller.js.map