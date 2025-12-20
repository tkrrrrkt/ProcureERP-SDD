"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectMasterModule = void 0;
const common_1 = require("@nestjs/common");
const project_master_controller_1 = require("./project-master.controller");
const project_master_service_1 = require("./project-master.service");
const project_master_repository_1 = require("./project-master.repository");
const prisma_module_1 = require("../../../prisma/prisma.module");
let ProjectMasterModule = class ProjectMasterModule {
};
exports.ProjectMasterModule = ProjectMasterModule;
exports.ProjectMasterModule = ProjectMasterModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [project_master_controller_1.ProjectMasterController],
        providers: [project_master_service_1.ProjectMasterService, project_master_repository_1.ProjectMasterRepository],
        exports: [project_master_service_1.ProjectMasterService],
    })
], ProjectMasterModule);
//# sourceMappingURL=project-master.module.js.map