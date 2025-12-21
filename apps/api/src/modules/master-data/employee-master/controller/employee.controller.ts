import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Query,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { EmployeeService } from '../service/employee.service';
import {
  ListEmployeesApiRequest,
  ListEmployeesApiResponse,
  GetEmployeeApiResponse,
  CreateEmployeeApiRequest,
  CreateEmployeeApiResponse,
  UpdateEmployeeApiRequest,
  UpdateEmployeeApiResponse,
  EmployeeSortBy,
  SortOrder,
} from '@procure/contracts/api/employee-master';

/**
 * Employee Controller
 *
 * Domain API エンドポイント
 * - BFF から呼び出される
 * - tenant_id / user_id はヘッダーから取得
 */
@Controller('master-data/employee-master')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  /**
   * GET /api/master-data/employee-master
   * 社員一覧取得
   */
  @Get()
  async listEmployees(
    @Headers('x-tenant-id') tenantId: string,
    @Query('offset') offset?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: EmployeeSortBy,
    @Query('sortOrder') sortOrder?: SortOrder,
    @Query('keyword') keyword?: string,
  ): Promise<ListEmployeesApiResponse> {
    const request: ListEmployeesApiRequest = {
      offset: offset ? parseInt(offset, 10) : 0,
      limit: limit ? parseInt(limit, 10) : 50,
      sortBy,
      sortOrder,
      keyword: keyword?.trim() || undefined,
    };

    return this.employeeService.listEmployees(tenantId, request);
  }

  /**
   * GET /api/master-data/employee-master/:id
   * 社員詳細取得
   */
  @Get(':id')
  async getEmployee(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') employeeId: string,
  ): Promise<GetEmployeeApiResponse> {
    return this.employeeService.getEmployee(tenantId, employeeId);
  }

  /**
   * POST /api/master-data/employee-master
   * 社員新規登録
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createEmployee(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Body() request: CreateEmployeeApiRequest,
  ): Promise<CreateEmployeeApiResponse> {
    return this.employeeService.createEmployee(tenantId, userId, request);
  }

  /**
   * PUT /api/master-data/employee-master/:id
   * 社員更新
   */
  @Put(':id')
  async updateEmployee(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') employeeId: string,
    @Body() request: UpdateEmployeeApiRequest,
  ): Promise<UpdateEmployeeApiResponse> {
    return this.employeeService.updateEmployee(tenantId, userId, employeeId, request);
  }
}
