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
exports.ProjectMasterBffService = exports.DOMAIN_API_CLIENT = void 0;
const common_1 = require("@nestjs/common");
const project_master_mapper_1 = require("./mappers/project-master.mapper");
exports.DOMAIN_API_CLIENT = 'DOMAIN_API_CLIENT';
let ProjectMasterBffService = class ProjectMasterBffService {
    constructor(apiClient) {
        this.apiClient = apiClient;
    }
    async list(tenantId, userId, request) {
        const { page, pageSize } = project_master_mapper_1.ProjectMasterMapper.calculatePaging(request);
        const apiRequest = project_master_mapper_1.ProjectMasterMapper.toApiListRequest(request);
        const apiResponse = await this.apiClient.list(tenantId, userId, apiRequest);
        return project_master_mapper_1.ProjectMasterMapper.toBffListResponse(apiResponse, page, pageSize);
    }
    async findById(tenantId, userId, id) {
        const entity = await this.apiClient.findById(tenantId, userId, id);
        return project_master_mapper_1.ProjectMasterMapper.toBffDetailResponse(entity);
    }
    async create(tenantId, userId, request) {
        const apiRequest = project_master_mapper_1.ProjectMasterMapper.toApiCreateRequest(request);
        const entity = await this.apiClient.create(tenantId, userId, apiRequest);
        return project_master_mapper_1.ProjectMasterMapper.toBffDetailResponse(entity);
    }
    async update(tenantId, userId, id, request) {
        const apiRequest = project_master_mapper_1.ProjectMasterMapper.toApiUpdateRequest(request);
        const entity = await this.apiClient.update(tenantId, userId, id, apiRequest);
        return project_master_mapper_1.ProjectMasterMapper.toBffDetailResponse(entity);
    }
    async deactivate(tenantId, userId, id, ifMatchVersion) {
        const entity = await this.apiClient.deactivate(tenantId, userId, id, ifMatchVersion);
        return project_master_mapper_1.ProjectMasterMapper.toBffDetailResponse(entity);
    }
    async reactivate(tenantId, userId, id, ifMatchVersion) {
        const entity = await this.apiClient.reactivate(tenantId, userId, id, ifMatchVersion);
        return project_master_mapper_1.ProjectMasterMapper.toBffDetailResponse(entity);
    }
};
exports.ProjectMasterBffService = ProjectMasterBffService;
exports.ProjectMasterBffService = ProjectMasterBffService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(exports.DOMAIN_API_CLIENT)),
    __metadata("design:paramtypes", [Object])
], ProjectMasterBffService);
//# sourceMappingURL=project-master.service.js.map