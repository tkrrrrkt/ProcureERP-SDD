import { EmployeeApiDto, ListEmployeesApiResponse, CreateEmployeeApiRequest as CreateApiReq, UpdateEmployeeApiRequest as UpdateApiReq } from '@procure/contracts/api/employee-master';
import { EmployeeDto, ListEmployeesResponse, CreateEmployeeRequest, UpdateEmployeeRequest } from '@procure/contracts/bff/employee-master';
export declare class EmployeeMapper {
    toDto(apiDto: EmployeeApiDto): EmployeeDto;
    toListResponse(apiResponse: ListEmployeesApiResponse, page: number, pageSize: number): ListEmployeesResponse;
    toCreateApiRequest(request: CreateEmployeeRequest): CreateApiReq;
    toUpdateApiRequest(request: UpdateEmployeeRequest): UpdateApiReq;
}
