import { ListProjectMasterRequest as BffListRequest, ListProjectMasterResponse as BffListResponse, ProjectMasterListItem, ProjectMasterDetailResponse, CreateProjectMasterRequest as BffCreateRequest, UpdateProjectMasterRequest as BffUpdateRequest } from '@epm/contracts/bff/project-master';
import { ListProjectMasterRequest as ApiListRequest, ListProjectMasterResponse as ApiListResponse, ProjectMasterEntity, CreateProjectMasterRequest as ApiCreateRequest, UpdateProjectMasterRequest as ApiUpdateRequest } from '@epm/contracts/api/project-master';
export declare const ProjectMasterMapper: {
    toApiListRequest(bffRequest: BffListRequest): ApiListRequest;
    toBffListResponse(apiResponse: ApiListResponse, page: number, pageSize: number): BffListResponse;
    entityToListItem(entity: ProjectMasterEntity): ProjectMasterListItem;
    toBffDetailResponse(entity: ProjectMasterEntity): ProjectMasterDetailResponse;
    toApiCreateRequest(bffRequest: BffCreateRequest): ApiCreateRequest;
    toApiUpdateRequest(bffRequest: BffUpdateRequest): ApiUpdateRequest;
    calculatePaging(bffRequest: BffListRequest): {
        page: number;
        pageSize: number;
    };
};
