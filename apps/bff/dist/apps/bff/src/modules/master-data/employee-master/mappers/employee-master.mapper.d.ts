import { ListEmployeeMasterRequest as BffListRequest, ListEmployeeMasterResponse as BffListResponse, EmployeeMasterListItem, EmployeeMasterDetailResponse, CreateEmployeeMasterRequest as BffCreateRequest, UpdateEmployeeMasterRequest as BffUpdateRequest } from '@epm/contracts/bff/employee-master';
import { ListEmployeeMasterRequest as ApiListRequest, ListEmployeeMasterResponse as ApiListResponse, EmployeeMasterEntity, CreateEmployeeMasterRequest as ApiCreateRequest, UpdateEmployeeMasterRequest as ApiUpdateRequest } from '@epm/contracts/api/employee-master';
export declare const EmployeeMasterMapper: {
    toApiListRequest(bffRequest: BffListRequest): ApiListRequest;
    toBffListResponse(apiResponse: ApiListResponse, page: number, pageSize: number): BffListResponse;
    entityToListItem(entity: EmployeeMasterEntity): EmployeeMasterListItem;
    toBffDetailResponse(entity: EmployeeMasterEntity): EmployeeMasterDetailResponse;
    toApiCreateRequest(bffRequest: BffCreateRequest): ApiCreateRequest;
    toApiUpdateRequest(bffRequest: BffUpdateRequest): ApiUpdateRequest;
    calculatePaging(bffRequest: BffListRequest): {
        page: number;
        pageSize: number;
    };
};
