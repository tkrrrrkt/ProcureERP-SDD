"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeMasterMapper = void 0;
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 200;
const DEFAULT_SORT_BY = 'employeeCode';
const DEFAULT_SORT_ORDER = 'asc';
const VALID_SORT_BY = ['employeeCode', 'employeeName'];
function isValidSortBy(value) {
    return VALID_SORT_BY.includes(value);
}
exports.EmployeeMasterMapper = {
    toApiListRequest(bffRequest) {
        const page = Math.max(bffRequest.page ?? DEFAULT_PAGE, 1);
        const pageSize = Math.min(Math.max(bffRequest.pageSize ?? DEFAULT_PAGE_SIZE, 1), MAX_PAGE_SIZE);
        const sortBy = bffRequest.sortBy && isValidSortBy(bffRequest.sortBy)
            ? bffRequest.sortBy
            : DEFAULT_SORT_BY;
        const sortOrder = bffRequest.sortOrder ?? DEFAULT_SORT_ORDER;
        return {
            offset: (page - 1) * pageSize,
            limit: pageSize,
            sortBy,
            sortOrder,
            employeeCode: bffRequest.employeeCode?.trim() || undefined,
            employeeName: bffRequest.employeeName?.trim() || undefined,
            includeInactive: bffRequest.includeInactive,
        };
    },
    toBffListResponse(apiResponse, page, pageSize) {
        return {
            items: apiResponse.items.map(entity => this.entityToListItem(entity)),
            page,
            pageSize,
            totalCount: apiResponse.totalCount,
        };
    },
    entityToListItem(entity) {
        return {
            id: entity.id,
            employeeCode: entity.employeeCode,
            employeeName: entity.employeeName,
            organizationKey: entity.organizationKey,
            isActive: entity.isActive,
        };
    },
    toBffDetailResponse(entity) {
        return {
            id: entity.id,
            employeeCode: entity.employeeCode,
            employeeName: entity.employeeName,
            organizationKey: entity.organizationKey,
            isActive: entity.isActive,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
            createdBy: entity.createdBy,
            updatedBy: entity.updatedBy,
        };
    },
    toApiCreateRequest(bffRequest) {
        return {
            employeeCode: bffRequest.employeeCode,
            employeeName: bffRequest.employeeName,
            organizationKey: bffRequest.organizationKey,
        };
    },
    toApiUpdateRequest(bffRequest) {
        return {
            employeeName: bffRequest.employeeName,
            organizationKey: bffRequest.organizationKey,
        };
    },
    calculatePaging(bffRequest) {
        const page = Math.max(bffRequest.page ?? DEFAULT_PAGE, 1);
        const pageSize = Math.min(Math.max(bffRequest.pageSize ?? DEFAULT_PAGE_SIZE, 1), MAX_PAGE_SIZE);
        return { page, pageSize };
    },
};
//# sourceMappingURL=employee-master.mapper.js.map