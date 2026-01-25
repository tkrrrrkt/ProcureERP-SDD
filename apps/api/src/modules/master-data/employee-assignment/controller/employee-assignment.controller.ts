import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { EmployeeAssignmentService } from '../service/employee-assignment.service';
import {
  ListAssignmentsApiRequest,
  ListAssignmentsApiResponse,
  GetAssignmentApiResponse,
  CreateAssignmentApiRequest,
  CreateAssignmentApiResponse,
  UpdateAssignmentApiRequest,
  UpdateAssignmentApiResponse,
  DeleteAssignmentApiRequest,
  DeleteAssignmentApiResponse,
  AssignmentSortBy,
  SortOrder,
} from '@procure/contracts/api/employee-assignment';

/**
 * Employee Assignment Controller
 *
 * Domain API エンドポイント
 * - BFF から呼び出される
 * - tenant_id / user_id はヘッダーから取得
 * - 社員IDにネストした構造: /master-data/employees/{employeeId}/assignments
 */
@Controller('master-data/employees/:employeeId/assignments')
export class EmployeeAssignmentController {
  constructor(private readonly assignmentService: EmployeeAssignmentService) {}

  /**
   * GET /api/master-data/employees/{employeeId}/assignments
   * 所属一覧取得
   */
  @Get()
  async listAssignments(
    @Headers('x-tenant-id') tenantId: string,
    @Param('employeeId') employeeId: string,
    @Query('sortBy') sortBy?: AssignmentSortBy,
    @Query('sortOrder') sortOrder?: SortOrder,
  ): Promise<ListAssignmentsApiResponse> {
    const request: ListAssignmentsApiRequest = {
      sortBy,
      sortOrder,
    };

    return this.assignmentService.listAssignments(tenantId, employeeId, request);
  }

  /**
   * GET /api/master-data/employees/{employeeId}/assignments/{id}
   * 所属情報取得
   */
  @Get(':id')
  async getAssignment(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') assignmentId: string,
  ): Promise<GetAssignmentApiResponse> {
    return this.assignmentService.getAssignment(tenantId, assignmentId);
  }

  /**
   * POST /api/master-data/employees/{employeeId}/assignments
   * 所属登録
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createAssignment(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('employeeId') employeeId: string,
    @Body() request: CreateAssignmentApiRequest,
  ): Promise<CreateAssignmentApiResponse> {
    return this.assignmentService.createAssignment(
      tenantId,
      userId,
      employeeId,
      request,
    );
  }

  /**
   * PUT /api/master-data/employees/{employeeId}/assignments/{id}
   * 所属更新
   */
  @Put(':id')
  async updateAssignment(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('employeeId') employeeId: string,
    @Param('id') assignmentId: string,
    @Body() request: UpdateAssignmentApiRequest,
  ): Promise<UpdateAssignmentApiResponse> {
    return this.assignmentService.updateAssignment(
      tenantId,
      userId,
      employeeId,
      assignmentId,
      request,
    );
  }

  /**
   * DELETE /api/master-data/employees/{employeeId}/assignments/{id}
   * 所属削除（論理削除）
   */
  @Delete(':id')
  async deleteAssignment(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('employeeId') employeeId: string,
    @Param('id') assignmentId: string,
    @Body() request: DeleteAssignmentApiRequest,
  ): Promise<DeleteAssignmentApiResponse> {
    return this.assignmentService.deleteAssignment(
      tenantId,
      userId,
      employeeId,
      assignmentId,
      request.version,
    );
  }
}
