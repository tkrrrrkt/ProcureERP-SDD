"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeBffModule = void 0;
const common_1 = require("@nestjs/common");
const employee_controller_1 = require("./controller/employee.controller");
const employee_service_1 = require("./service/employee.service");
const domain_api_client_1 = require("./clients/domain-api.client");
const employee_mapper_1 = require("./mappers/employee.mapper");
let EmployeeBffModule = class EmployeeBffModule {
};
exports.EmployeeBffModule = EmployeeBffModule;
exports.EmployeeBffModule = EmployeeBffModule = __decorate([
    (0, common_1.Module)({
        controllers: [employee_controller_1.EmployeeBffController],
        providers: [
            employee_service_1.EmployeeBffService,
            domain_api_client_1.EmployeeDomainApiClient,
            employee_mapper_1.EmployeeMapper,
        ],
        exports: [employee_service_1.EmployeeBffService],
    })
], EmployeeBffModule);
//# sourceMappingURL=employee.module.js.map