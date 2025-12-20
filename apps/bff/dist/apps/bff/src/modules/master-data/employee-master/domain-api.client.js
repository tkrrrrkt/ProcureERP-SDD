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
exports.DomainApiHttpClient = void 0;
const common_1 = require("@nestjs/common");
let DomainApiHttpClient = class DomainApiHttpClient {
    constructor() {
        this.baseUrl = process.env.DOMAIN_API_URL || 'http://localhost:3002';
    }
    async list(tenantId, userId, request) {
        const params = request;
        const queryParams = new URLSearchParams();
        if (params.offset !== undefined)
            queryParams.append('offset', String(params.offset));
        if (params.limit !== undefined)
            queryParams.append('limit', String(params.limit));
        if (params.sortBy)
            queryParams.append('sortBy', String(params.sortBy));
        if (params.sortOrder)
            queryParams.append('sortOrder', String(params.sortOrder));
        if (params.employeeCode)
            queryParams.append('employeeCode', String(params.employeeCode));
        if (params.employeeName)
            queryParams.append('employeeName', String(params.employeeName));
        if (params.includeInactive)
            queryParams.append('includeInactive', String(params.includeInactive));
        const response = await fetch(`${this.baseUrl}/api/master-data/employee-master?${queryParams.toString()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-tenant-id': tenantId,
                'x-user-id': userId,
            },
        });
        if (!response.ok) {
            throw await this.handleError(response);
        }
        return response.json();
    }
    async findById(tenantId, userId, id) {
        const response = await fetch(`${this.baseUrl}/api/master-data/employee-master/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-tenant-id': tenantId,
                'x-user-id': userId,
            },
        });
        if (!response.ok) {
            throw await this.handleError(response);
        }
        return response.json();
    }
    async create(tenantId, userId, request) {
        const response = await fetch(`${this.baseUrl}/api/master-data/employee-master`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-tenant-id': tenantId,
                'x-user-id': userId,
            },
            body: JSON.stringify(request),
        });
        if (!response.ok) {
            throw await this.handleError(response);
        }
        return response.json();
    }
    async update(tenantId, userId, id, request) {
        const response = await fetch(`${this.baseUrl}/api/master-data/employee-master/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'x-tenant-id': tenantId,
                'x-user-id': userId,
            },
            body: JSON.stringify(request),
        });
        if (!response.ok) {
            throw await this.handleError(response);
        }
        return response.json();
    }
    async deactivate(tenantId, userId, id) {
        const response = await fetch(`${this.baseUrl}/api/master-data/employee-master/${id}/deactivate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-tenant-id': tenantId,
                'x-user-id': userId,
            },
        });
        if (!response.ok) {
            throw await this.handleError(response);
        }
        return response.json();
    }
    async reactivate(tenantId, userId, id) {
        const response = await fetch(`${this.baseUrl}/api/master-data/employee-master/${id}/reactivate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-tenant-id': tenantId,
                'x-user-id': userId,
            },
        });
        if (!response.ok) {
            throw await this.handleError(response);
        }
        return response.json();
    }
    async handleError(response) {
        let errorBody;
        try {
            errorBody = await response.json();
        }
        catch {
            errorBody = { message: response.statusText };
        }
        return {
            name: 'DomainApiError',
            message: String(errorBody.message || 'Unknown error'),
            ...errorBody,
        };
    }
};
exports.DomainApiHttpClient = DomainApiHttpClient;
exports.DomainApiHttpClient = DomainApiHttpClient = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], DomainApiHttpClient);
//# sourceMappingURL=domain-api.client.js.map