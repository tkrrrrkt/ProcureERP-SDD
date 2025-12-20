"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectMasterMapper = void 0;
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 200;
const DEFAULT_SORT_BY = 'projectCode';
const DEFAULT_SORT_ORDER = 'asc';
const VALID_SORT_BY = ['projectCode', 'projectName', 'projectShortName', 'plannedPeriodFrom', 'budgetAmount'];
function isValidSortBy(value) {
    return VALID_SORT_BY.includes(value);
}
exports.ProjectMasterMapper = {
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
            projectCode: bffRequest.projectCode?.trim() || undefined,
            projectName: bffRequest.projectName?.trim() || undefined,
            projectShortName: bffRequest.projectShortName?.trim() || undefined,
            departmentCode: bffRequest.departmentCode?.trim() || undefined,
            responsibleEmployeeCode: bffRequest.responsibleEmployeeCode?.trim() || undefined,
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
            projectCode: entity.projectCode,
            projectName: entity.projectName,
            projectShortName: entity.projectShortName,
            projectKanaName: entity.projectKanaName,
            departmentCode: entity.departmentCode,
            responsibleEmployeeCode: entity.responsibleEmployeeCode,
            responsibleEmployeeName: entity.responsibleEmployeeName,
            plannedPeriodFrom: entity.plannedPeriodFrom,
            plannedPeriodTo: entity.plannedPeriodTo,
            budgetAmount: entity.budgetAmount,
            isActive: entity.isActive,
        };
    },
    toBffDetailResponse(entity) {
        return {
            id: entity.id,
            projectCode: entity.projectCode,
            projectName: entity.projectName,
            projectShortName: entity.projectShortName,
            projectKanaName: entity.projectKanaName,
            departmentCode: entity.departmentCode,
            responsibleEmployeeCode: entity.responsibleEmployeeCode,
            responsibleEmployeeName: entity.responsibleEmployeeName,
            plannedPeriodFrom: entity.plannedPeriodFrom,
            plannedPeriodTo: entity.plannedPeriodTo,
            actualPeriodFrom: entity.actualPeriodFrom,
            actualPeriodTo: entity.actualPeriodTo,
            budgetAmount: entity.budgetAmount,
            version: entity.version,
            isActive: entity.isActive,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
            createdBy: entity.createdBy,
            updatedBy: entity.updatedBy,
        };
    },
    toApiCreateRequest(bffRequest) {
        return {
            projectCode: bffRequest.projectCode,
            projectName: bffRequest.projectName,
            projectShortName: bffRequest.projectShortName,
            projectKanaName: bffRequest.projectKanaName,
            departmentCode: bffRequest.departmentCode,
            responsibleEmployeeCode: bffRequest.responsibleEmployeeCode,
            responsibleEmployeeName: bffRequest.responsibleEmployeeName,
            plannedPeriodFrom: bffRequest.plannedPeriodFrom,
            plannedPeriodTo: bffRequest.plannedPeriodTo,
            actualPeriodFrom: bffRequest.actualPeriodFrom,
            actualPeriodTo: bffRequest.actualPeriodTo,
            budgetAmount: bffRequest.budgetAmount,
        };
    },
    toApiUpdateRequest(bffRequest) {
        return {
            ifMatchVersion: bffRequest.ifMatchVersion,
            projectName: bffRequest.projectName,
            projectShortName: bffRequest.projectShortName,
            projectKanaName: bffRequest.projectKanaName,
            departmentCode: bffRequest.departmentCode,
            responsibleEmployeeCode: bffRequest.responsibleEmployeeCode,
            responsibleEmployeeName: bffRequest.responsibleEmployeeName,
            plannedPeriodFrom: bffRequest.plannedPeriodFrom,
            plannedPeriodTo: bffRequest.plannedPeriodTo,
            actualPeriodFrom: bffRequest.actualPeriodFrom,
            actualPeriodTo: bffRequest.actualPeriodTo,
            budgetAmount: bffRequest.budgetAmount,
        };
    },
    calculatePaging(bffRequest) {
        const page = Math.max(bffRequest.page ?? DEFAULT_PAGE, 1);
        const pageSize = Math.min(Math.max(bffRequest.pageSize ?? DEFAULT_PAGE_SIZE, 1), MAX_PAGE_SIZE);
        return { page, pageSize };
    },
};
//# sourceMappingURL=project-master.mapper.js.map