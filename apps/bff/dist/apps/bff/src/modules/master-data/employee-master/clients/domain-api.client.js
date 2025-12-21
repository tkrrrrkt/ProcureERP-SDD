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
exports.EmployeeDomainApiClient = void 0;
const common_1 = require("@nestjs/common");
let EmployeeDomainApiClient = class EmployeeDomainApiClient {
    constructor() {
        this.baseUrl = process.env.DOMAIN_API_URL || 'http://localhost:3002';
    }
    async listEmployees(tenantId, userId, request) {
        const params = new URLSearchParams();
        params.append('offset', String(request.offset));
        params.append('limit', String(request.limit));
        if (request.sortBy)
            params.append('sortBy', request.sortBy);
        if (request.sortOrder)
            params.append('sortOrder', request.sortOrder);
        if (request.keyword)
            params.append('keyword', request.keyword);
        const url = `${this.baseUrl}/api/master-data/employee-master?${params.toString()}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: this.buildHeaders(tenantId, userId),
        });
        return this.handleResponse(response);
    }
    async getEmployee(tenantId, userId, employeeId) {
        const url = `${this.baseUrl}/api/master-data/employee-master/${employeeId}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: this.buildHeaders(tenantId, userId),
        });
        return this.handleResponse(response);
    }
    async createEmployee(tenantId, userId, request) {
        const url = `${this.baseUrl}/api/master-data/employee-master`;
        const response = await fetch(url, {
            method: 'POST',
            headers: this.buildHeaders(tenantId, userId),
            body: JSON.stringify(request),
        });
        return this.handleResponse(response);
    }
    async updateEmployee(tenantId, userId, employeeId, request) {
        const url = `${this.baseUrl}/api/master-data/employee-master/${employeeId}`;
        const response = await fetch(url, {
            method: 'PUT',
            headers: this.buildHeaders(tenantId, userId),
            body: JSON.stringify(request),
        });
        return this.handleResponse(response);
    }
    buildHeaders(tenantId, userId) {
        return {
            'Content-Type': 'application/json',
            'x-tenant-id': tenantId,
            'x-user-id': userId,
        };
    }
    async handleResponse(response) {
        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({}));
            throw new common_1.HttpException(errorBody, response.status);
        }
        return response.json();
    }
};
exports.EmployeeDomainApiClient = EmployeeDomainApiClient;
exports.EmployeeDomainApiClient = EmployeeDomainApiClient = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], EmployeeDomainApiClient);
//# sourceMappingURL=domain-api.client.js.map