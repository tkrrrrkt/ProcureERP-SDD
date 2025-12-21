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
exports.EmployeeService = void 0;
const common_1 = require("@nestjs/common");
const employee_repository_1 = require("../repository/employee.repository");
const errors_1 = require("../../../../../../../packages/contracts/src/api/errors");
let EmployeeService = class EmployeeService {
    constructor(employeeRepository) {
        this.employeeRepository = employeeRepository;
    }
    async listEmployees(tenantId, request) {
        const { offset, limit, sortBy, sortOrder, keyword } = request;
        const result = await this.employeeRepository.findMany({
            tenantId,
            offset,
            limit,
            sortBy,
            sortOrder,
            keyword,
        });
        return {
            items: result.items.map(this.toApiDto),
            total: result.total,
        };
    }
    async getEmployee(tenantId, employeeId) {
        const employee = await this.employeeRepository.findOne({
            tenantId,
            employeeId,
        });
        if (!employee) {
            throw new common_1.HttpException({
                code: errors_1.EmployeeMasterErrorCode.EMPLOYEE_NOT_FOUND,
                message: errors_1.EmployeeMasterErrorMessage.EMPLOYEE_NOT_FOUND,
            }, errors_1.EmployeeMasterErrorHttpStatus.EMPLOYEE_NOT_FOUND);
        }
        return {
            employee: this.toApiDto(employee),
        };
    }
    async createEmployee(tenantId, userId, request) {
        if (request.email && !this.isValidEmail(request.email)) {
            throw new common_1.HttpException({
                code: errors_1.EmployeeMasterErrorCode.INVALID_EMAIL_FORMAT,
                message: errors_1.EmployeeMasterErrorMessage.INVALID_EMAIL_FORMAT,
            }, errors_1.EmployeeMasterErrorHttpStatus.INVALID_EMAIL_FORMAT);
        }
        if (request.retireDate) {
            const joinDate = new Date(request.joinDate);
            const retireDate = new Date(request.retireDate);
            if (retireDate < joinDate) {
                throw new common_1.HttpException({
                    code: errors_1.EmployeeMasterErrorCode.INVALID_DATE_RANGE,
                    message: errors_1.EmployeeMasterErrorMessage.INVALID_DATE_RANGE,
                }, errors_1.EmployeeMasterErrorHttpStatus.INVALID_DATE_RANGE);
            }
        }
        const isDuplicate = await this.employeeRepository.checkEmployeeCodeDuplicate({
            tenantId,
            employeeCode: request.employeeCode,
        });
        if (isDuplicate) {
            throw new common_1.HttpException({
                code: errors_1.EmployeeMasterErrorCode.EMPLOYEE_CODE_DUPLICATE,
                message: errors_1.EmployeeMasterErrorMessage.EMPLOYEE_CODE_DUPLICATE,
            }, errors_1.EmployeeMasterErrorHttpStatus.EMPLOYEE_CODE_DUPLICATE);
        }
        const employee = await this.employeeRepository.create({
            tenantId,
            data: {
                employeeCode: request.employeeCode,
                employeeName: request.employeeName,
                employeeKanaName: request.employeeKanaName,
                email: request.email,
                joinDate: new Date(request.joinDate),
                retireDate: request.retireDate ? new Date(request.retireDate) : undefined,
                remarks: request.remarks,
                isActive: request.isActive ?? true,
            },
        });
        return {
            employee: this.toApiDto(employee),
        };
    }
    async updateEmployee(tenantId, userId, employeeId, request) {
        const existingEmployee = await this.employeeRepository.findOne({
            tenantId,
            employeeId,
        });
        if (!existingEmployee) {
            throw new common_1.HttpException({
                code: errors_1.EmployeeMasterErrorCode.EMPLOYEE_NOT_FOUND,
                message: errors_1.EmployeeMasterErrorMessage.EMPLOYEE_NOT_FOUND,
            }, errors_1.EmployeeMasterErrorHttpStatus.EMPLOYEE_NOT_FOUND);
        }
        if (request.email && !this.isValidEmail(request.email)) {
            throw new common_1.HttpException({
                code: errors_1.EmployeeMasterErrorCode.INVALID_EMAIL_FORMAT,
                message: errors_1.EmployeeMasterErrorMessage.INVALID_EMAIL_FORMAT,
            }, errors_1.EmployeeMasterErrorHttpStatus.INVALID_EMAIL_FORMAT);
        }
        if (request.retireDate) {
            const joinDate = new Date(request.joinDate);
            const retireDate = new Date(request.retireDate);
            if (retireDate < joinDate) {
                throw new common_1.HttpException({
                    code: errors_1.EmployeeMasterErrorCode.INVALID_DATE_RANGE,
                    message: errors_1.EmployeeMasterErrorMessage.INVALID_DATE_RANGE,
                }, errors_1.EmployeeMasterErrorHttpStatus.INVALID_DATE_RANGE);
            }
        }
        if (request.employeeCode !== existingEmployee.employeeCode) {
            const isDuplicate = await this.employeeRepository.checkEmployeeCodeDuplicate({
                tenantId,
                employeeCode: request.employeeCode,
                excludeEmployeeId: employeeId,
            });
            if (isDuplicate) {
                throw new common_1.HttpException({
                    code: errors_1.EmployeeMasterErrorCode.EMPLOYEE_CODE_DUPLICATE,
                    message: errors_1.EmployeeMasterErrorMessage.EMPLOYEE_CODE_DUPLICATE,
                }, errors_1.EmployeeMasterErrorHttpStatus.EMPLOYEE_CODE_DUPLICATE);
            }
        }
        const updatedEmployee = await this.employeeRepository.update({
            tenantId,
            employeeId,
            version: request.version,
            data: {
                employeeCode: request.employeeCode,
                employeeName: request.employeeName,
                employeeKanaName: request.employeeKanaName,
                email: request.email,
                joinDate: new Date(request.joinDate),
                retireDate: request.retireDate ? new Date(request.retireDate) : undefined,
                remarks: request.remarks,
                isActive: request.isActive,
            },
        });
        if (!updatedEmployee) {
            throw new common_1.HttpException({
                code: errors_1.EmployeeMasterErrorCode.CONCURRENT_UPDATE,
                message: errors_1.EmployeeMasterErrorMessage.CONCURRENT_UPDATE,
            }, errors_1.EmployeeMasterErrorHttpStatus.CONCURRENT_UPDATE);
        }
        return {
            employee: this.toApiDto(updatedEmployee),
        };
    }
    toApiDto(employee) {
        return {
            id: employee.id,
            employeeCode: employee.employeeCode,
            employeeName: employee.employeeName,
            employeeKanaName: employee.employeeKanaName,
            email: employee.email,
            joinDate: employee.joinDate.toISOString(),
            retireDate: employee.retireDate?.toISOString() ?? null,
            remarks: employee.remarks,
            isActive: employee.isActive,
            version: employee.version,
            createdAt: employee.createdAt.toISOString(),
            updatedAt: employee.updatedAt.toISOString(),
        };
    }
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
};
exports.EmployeeService = EmployeeService;
exports.EmployeeService = EmployeeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [employee_repository_1.EmployeeRepository])
], EmployeeService);
//# sourceMappingURL=employee.service.js.map