import { EmployeeService } from '../service/employee.service';
import { ListEmployeesApiResponse, GetEmployeeApiResponse, CreateEmployeeApiRequest, CreateEmployeeApiResponse, UpdateEmployeeApiRequest, UpdateEmployeeApiResponse, EmployeeSortBy, SortOrder } from '@procure/contracts/api/employee-master';
export declare class EmployeeController {
    private readonly employeeService;
    constructor(employeeService: EmployeeService);
    listEmployees(tenantId: string, offset?: string, limit?: string, sortBy?: EmployeeSortBy, sortOrder?: SortOrder, keyword?: string): Promise<ListEmployeesApiResponse>;
    getEmployee(tenantId: string, employeeId: string): Promise<GetEmployeeApiResponse>;
    createEmployee(tenantId: string, userId: string, request: CreateEmployeeApiRequest): Promise<CreateEmployeeApiResponse>;
    updateEmployee(tenantId: string, userId: string, employeeId: string, request: UpdateEmployeeApiRequest): Promise<UpdateEmployeeApiResponse>;
}
