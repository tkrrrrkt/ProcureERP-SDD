import { EmployeeRepository } from '../repository/employee.repository';
import { ListEmployeesApiRequest, ListEmployeesApiResponse, GetEmployeeApiResponse, CreateEmployeeApiRequest, CreateEmployeeApiResponse, UpdateEmployeeApiRequest, UpdateEmployeeApiResponse } from '@procure/contracts/api/employee-master';
export declare class EmployeeService {
    private readonly employeeRepository;
    constructor(employeeRepository: EmployeeRepository);
    listEmployees(tenantId: string, request: ListEmployeesApiRequest): Promise<ListEmployeesApiResponse>;
    getEmployee(tenantId: string, employeeId: string): Promise<GetEmployeeApiResponse>;
    createEmployee(tenantId: string, userId: string, request: CreateEmployeeApiRequest): Promise<CreateEmployeeApiResponse>;
    updateEmployee(tenantId: string, userId: string, employeeId: string, request: UpdateEmployeeApiRequest): Promise<UpdateEmployeeApiResponse>;
    private toApiDto;
    private isValidEmail;
}
