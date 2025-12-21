import { ListEmployeesApiRequest, ListEmployeesApiResponse, GetEmployeeApiResponse, CreateEmployeeApiRequest, CreateEmployeeApiResponse, UpdateEmployeeApiRequest, UpdateEmployeeApiResponse } from '@procure/contracts/api/employee-master';
export declare class EmployeeDomainApiClient {
    private readonly baseUrl;
    constructor();
    listEmployees(tenantId: string, userId: string, request: ListEmployeesApiRequest): Promise<ListEmployeesApiResponse>;
    getEmployee(tenantId: string, userId: string, employeeId: string): Promise<GetEmployeeApiResponse>;
    createEmployee(tenantId: string, userId: string, request: CreateEmployeeApiRequest): Promise<CreateEmployeeApiResponse>;
    updateEmployee(tenantId: string, userId: string, employeeId: string, request: UpdateEmployeeApiRequest): Promise<UpdateEmployeeApiResponse>;
    private buildHeaders;
    private handleResponse;
}
