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
exports.EmployeeBffService = void 0;
const common_1 = require("@nestjs/common");
const domain_api_client_1 = require("../clients/domain-api.client");
const employee_mapper_1 = require("../mappers/employee.mapper");
let EmployeeBffService = class EmployeeBffService {
    constructor(domainApiClient, mapper) {
        this.domainApiClient = domainApiClient;
        this.mapper = mapper;
        this.DEFAULT_PAGE = 1;
        this.DEFAULT_PAGE_SIZE = 50;
        this.MAX_PAGE_SIZE = 200;
        this.DEFAULT_SORT_BY = 'employeeCode';
        this.DEFAULT_SORT_ORDER = 'asc';
        this.SORT_BY_WHITELIST = [
            'employeeCode',
            'employeeName',
            'employeeKanaName',
            'email',
            'joinDate',
            'retireDate',
            'isActive',
        ];
    }
    async listEmployees(tenantId, userId, request) {
        const page = request.page ?? this.DEFAULT_PAGE;
        const pageSize = Math.min(request.pageSize ?? this.DEFAULT_PAGE_SIZE, this.MAX_PAGE_SIZE);
        const sortBy = this.validateSortBy(request.sortBy);
        const sortOrder = request.sortOrder ?? this.DEFAULT_SORT_ORDER;
        const keyword = this.normalizeKeyword(request.keyword);
        const offset = (page - 1) * pageSize;
        const limit = pageSize;
        const apiRequest = {
            offset,
            limit,
            sortBy,
            sortOrder,
            keyword,
        };
        const apiResponse = await this.domainApiClient.listEmployees(tenantId, userId, apiRequest);
        return this.mapper.toListResponse(apiResponse, page, pageSize);
    }
    async getEmployee(tenantId, userId, employeeId) {
        const apiResponse = await this.domainApiClient.getEmployee(tenantId, userId, employeeId);
        return {
            employee: this.mapper.toDto(apiResponse.employee),
        };
    }
    async createEmployee(tenantId, userId, request) {
        const apiRequest = this.mapper.toCreateApiRequest(request);
        const apiResponse = await this.domainApiClient.createEmployee(tenantId, userId, apiRequest);
        return {
            employee: this.mapper.toDto(apiResponse.employee),
        };
    }
    async updateEmployee(tenantId, userId, employeeId, request) {
        const apiRequest = this.mapper.toUpdateApiRequest(request);
        const apiResponse = await this.domainApiClient.updateEmployee(tenantId, userId, employeeId, apiRequest);
        return {
            employee: this.mapper.toDto(apiResponse.employee),
        };
    }
    validateSortBy(sortBy) {
        if (!sortBy) {
            return this.DEFAULT_SORT_BY;
        }
        if (this.SORT_BY_WHITELIST.includes(sortBy)) {
            return sortBy;
        }
        return this.DEFAULT_SORT_BY;
    }
    normalizeKeyword(keyword) {
        if (!keyword) {
            return undefined;
        }
        const trimmed = keyword.trim();
        return trimmed.length > 0 ? trimmed : undefined;
    }
};
exports.EmployeeBffService = EmployeeBffService;
exports.EmployeeBffService = EmployeeBffService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [domain_api_client_1.EmployeeDomainApiClient,
        employee_mapper_1.EmployeeMapper])
], EmployeeBffService);
//# sourceMappingURL=employee.service.js.map