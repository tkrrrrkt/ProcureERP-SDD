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
  HttpException,
} from '@nestjs/common';
import { EmployeeBffService } from '../service/employee.service';
import {
  ListEmployeesRequest,
  ListEmployeesResponse,
  GetEmployeeResponse,
  CreateEmployeeRequest,
  CreateEmployeeResponse,
  UpdateEmployeeRequest,
  UpdateEmployeeResponse,
  EmployeeSortBy,
  SortOrder,
} from '@procure/contracts/bff/employee-master';

/**
 * Employee BFF Controller
 *
 * UI からの API エンドポイント
 * - tenant_id / user_id を認証情報（Clerk）から解決
 * - Global prefix: /api/bff が main.ts で設定済み
 */
@Controller('master-data/employee-master')
export class EmployeeBffController {
  constructor(private readonly employeeService: EmployeeBffService) {}

  /**
   * GET /api/bff/master-data/employee-master
   * 社員一覧取得
   */
  @Get()
  async listEmployees(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('sortBy') sortBy?: EmployeeSortBy,
    @Query('sortOrder') sortOrder?: SortOrder,
    @Query('keyword') keyword?: string,
  ): Promise<ListEmployeesResponse> {
    this.validateAuth(tenantId, userId);

    const request: ListEmployeesRequest = {
      page: page ? parseInt(page, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
      sortBy,
      sortOrder,
      keyword,
    };

    return this.employeeService.listEmployees(tenantId, userId, request);
  }

  /**
   * GET /api/bff/master-data/employee-master/:id
   * 社員詳細取得
   */
  @Get(':id')
  async getEmployee(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') employeeId: string,
  ): Promise<GetEmployeeResponse> {
    this.validateAuth(tenantId, userId);

    return this.employeeService.getEmployee(tenantId, userId, employeeId);
  }

  /**
   * POST /api/bff/master-data/employee-master
   * 社員新規登録
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createEmployee(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Body() request: CreateEmployeeRequest,
  ): Promise<CreateEmployeeResponse> {
    this.validateAuth(tenantId, userId);

    return this.employeeService.createEmployee(tenantId, userId, request);
  }

  /**
   * PUT /api/bff/master-data/employee-master/:id
   * 社員更新
   */
  @Put(':id')
  async updateEmployee(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') employeeId: string,
    @Body() request: UpdateEmployeeRequest,
  ): Promise<UpdateEmployeeResponse> {
    this.validateAuth(tenantId, userId);

    return this.employeeService.updateEmployee(tenantId, userId, employeeId, request);
  }

  /**
   * 認証情報バリデーション
   * tenant_id / user_id が存在しない場合は 401 Unauthorized
   */
  private validateAuth(tenantId: string, userId: string): void {
    if (!tenantId || !userId) {
      throw new HttpException(
        { message: 'Unauthorized: Missing tenant_id or user_id' },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
