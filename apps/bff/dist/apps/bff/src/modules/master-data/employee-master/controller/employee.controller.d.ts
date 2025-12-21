import { EmployeeBffService } from '../service/employee.service';
import { ListEmployeesResponse, GetEmployeeResponse, CreateEmployeeRequest, CreateEmployeeResponse, UpdateEmployeeRequest, UpdateEmployeeResponse, EmployeeSortBy, SortOrder } from '@procure/contracts/bff/employee-master';
export declare class EmployeeBffController {
    private readonly employeeService;
    constructor(employeeService: EmployeeBffService);
    listEmployees(tenantId: string, userId: string, page?: string, pageSize?: string, sortBy?: EmployeeSortBy, sortOrder?: SortOrder, keyword?: string): Promise<ListEmployeesResponse>;
    getEmployee(tenantId: string, userId: string, employeeId: string): Promise<GetEmployeeResponse>;
    createEmployee(tenantId: string, userId: string, request: CreateEmployeeRequest): Promise<CreateEmployeeResponse>;
    updateEmployee(tenantId: string, userId: string, employeeId: string, request: UpdateEmployeeRequest): Promise<UpdateEmployeeResponse>;
    private validateAuth;
}
