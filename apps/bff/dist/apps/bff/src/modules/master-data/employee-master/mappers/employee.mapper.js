"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeMapper = void 0;
const common_1 = require("@nestjs/common");
let EmployeeMapper = class EmployeeMapper {
    toDto(apiDto) {
        return {
            id: apiDto.id,
            employeeCode: apiDto.employeeCode,
            employeeName: apiDto.employeeName,
            employeeKanaName: apiDto.employeeKanaName,
            email: apiDto.email,
            joinDate: apiDto.joinDate,
            retireDate: apiDto.retireDate,
            remarks: apiDto.remarks,
            isActive: apiDto.isActive,
            version: apiDto.version,
            createdAt: apiDto.createdAt,
            updatedAt: apiDto.updatedAt,
        };
    }
    toListResponse(apiResponse, page, pageSize) {
        const totalPages = Math.ceil(apiResponse.total / pageSize);
        return {
            items: apiResponse.items.map((item) => this.toDto(item)),
            page,
            pageSize,
            total: apiResponse.total,
            totalPages,
        };
    }
    toCreateApiRequest(request) {
        return {
            employeeCode: request.employeeCode,
            employeeName: request.employeeName,
            employeeKanaName: request.employeeKanaName,
            email: request.email,
            joinDate: request.joinDate,
            retireDate: request.retireDate,
            remarks: request.remarks,
            isActive: request.isActive,
        };
    }
    toUpdateApiRequest(request) {
        return {
            employeeCode: request.employeeCode,
            employeeName: request.employeeName,
            employeeKanaName: request.employeeKanaName,
            email: request.email,
            joinDate: request.joinDate,
            retireDate: request.retireDate,
            remarks: request.remarks,
            isActive: request.isActive,
            version: request.version,
        };
    }
};
exports.EmployeeMapper = EmployeeMapper;
exports.EmployeeMapper = EmployeeMapper = __decorate([
    (0, common_1.Injectable)()
], EmployeeMapper);
//# sourceMappingURL=employee.mapper.js.map