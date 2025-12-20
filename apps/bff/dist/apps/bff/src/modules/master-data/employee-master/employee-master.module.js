"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeMasterBffModule = void 0;
const common_1 = require("@nestjs/common");
const employee_master_controller_1 = require("./employee-master.controller");
const employee_master_service_1 = require("./employee-master.service");
const domain_api_client_1 = require("./domain-api.client");
let EmployeeMasterBffModule = class EmployeeMasterBffModule {
};
exports.EmployeeMasterBffModule = EmployeeMasterBffModule;
exports.EmployeeMasterBffModule = EmployeeMasterBffModule = __decorate([
    (0, common_1.Module)({
        controllers: [employee_master_controller_1.EmployeeMasterBffController],
        providers: [
            employee_master_service_1.EmployeeMasterBffService,
            {
                provide: employee_master_service_1.DOMAIN_API_CLIENT,
                useClass: domain_api_client_1.DomainApiHttpClient,
            },
        ],
        exports: [employee_master_service_1.EmployeeMasterBffService],
    })
], EmployeeMasterBffModule);
//# sourceMappingURL=employee-master.module.js.map