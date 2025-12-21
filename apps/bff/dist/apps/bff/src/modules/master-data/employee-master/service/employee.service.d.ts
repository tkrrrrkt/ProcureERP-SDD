import { EmployeeDomainApiClient } from '../clients/domain-api.client';
import { EmployeeMapper } from '../mappers/employee.mapper';
import { ListEmployeesRequest, ListEmployeesResponse, GetEmployeeResponse, CreateEmployeeRequest, CreateEmployeeResponse, UpdateEmployeeRequest, UpdateEmployeeResponse } from '@procure/contracts/bff/employee-master';
export declare class EmployeeBffService {
    private readonly domainApiClient;
    private readonly mapper;
    private readonly DEFAULT_PAGE;
    private readonly DEFAULT_PAGE_SIZE;
    private readonly MAX_PAGE_SIZE;
    private readonly DEFAULT_SORT_BY;
    private readonly DEFAULT_SORT_ORDER;
    private readonly SORT_BY_WHITELIST;
    constructor(domainApiClient: EmployeeDomainApiClient, mapper: EmployeeMapper);
    listEmployees(tenantId: string, userId: string, request: ListEmployeesRequest): Promise<ListEmployeesResponse>;
    getEmployee(tenantId: string, userId: string, employeeId: string): Promise<GetEmployeeResponse>;
    createEmployee(tenantId: string, userId: string, request: CreateEmployeeRequest): Promise<CreateEmployeeResponse>;
    updateEmployee(tenantId: string, userId: string, employeeId: string, request: UpdateEmployeeRequest): Promise<UpdateEmployeeResponse>;
    private validateSortBy;
    private normalizeKeyword;
}
