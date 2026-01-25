import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { EmployeeAssignmentBffService } from '../service/employee-assignment.service';
import {
  ListAssignmentsResponse,
  CreateAssignmentRequest,
  CreateAssignmentResponse,
  UpdateAssignmentRequest,
  UpdateAssignmentResponse,
  DeleteAssignmentResponse,
  ListActiveDepartmentsResponse,
} from '@procure/contracts/bff/employee-assignment';

/**
 * Employee Assignment BFF Controller
 *
 * UI からの API エンドポイント
 * - tenant_id / user_id を認証情報（Clerk）から解決
 * - Global prefix: /api/bff が main.ts で設定済み
 */
@Controller()
export class EmployeeAssignmentBffController {
  constructor(private readonly assignmentService: EmployeeAssignmentBffService) {}

  // ===========================================================================
  // Assignment Endpoints
  // ===========================================================================

  /**
   * GET /api/bff/employees/{employeeId}/assignments
   * 所属一覧取得
   */
  @Get('employees/:employeeId/assignments')
  async listAssignments(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('employeeId') employeeId: string,
  ): Promise<ListAssignmentsResponse> {
    this.validateAuth(tenantId, userId);

    return this.assignmentService.listAssignments(tenantId, userId, employeeId);
  }

  /**
   * POST /api/bff/employees/{employeeId}/assignments
   * 所属登録
   */
  @Post('employees/:employeeId/assignments')
  @HttpCode(HttpStatus.CREATED)
  async createAssignment(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('employeeId') employeeId: string,
    @Body() request: CreateAssignmentRequest,
  ): Promise<CreateAssignmentResponse> {
    this.validateAuth(tenantId, userId);

    return this.assignmentService.createAssignment(tenantId, userId, employeeId, request);
  }

  /**
   * PUT /api/bff/employees/{employeeId}/assignments/{id}
   * 所属更新
   */
  @Put('employees/:employeeId/assignments/:id')
  async updateAssignment(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('employeeId') employeeId: string,
    @Param('id') assignmentId: string,
    @Body() request: UpdateAssignmentRequest,
  ): Promise<UpdateAssignmentResponse> {
    this.validateAuth(tenantId, userId);

    return this.assignmentService.updateAssignment(
      tenantId,
      userId,
      employeeId,
      assignmentId,
      request,
    );
  }

  /**
   * DELETE /api/bff/employees/{employeeId}/assignments/{id}
   * 所属削除（論理削除）
   */
  @Delete('employees/:employeeId/assignments/:id')
  async deleteAssignment(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('employeeId') employeeId: string,
    @Param('id') assignmentId: string,
    @Body() body: { version: number },
  ): Promise<DeleteAssignmentResponse> {
    this.validateAuth(tenantId, userId);

    return this.assignmentService.deleteAssignment(
      tenantId,
      userId,
      employeeId,
      assignmentId,
      body.version,
    );
  }

  // ===========================================================================
  // Department Endpoints (for Assignment Form)
  // ===========================================================================

  /**
   * GET /api/bff/departments/active
   * 有効部門一覧取得
   */
  @Get('departments/active')
  async listActiveDepartments(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
  ): Promise<ListActiveDepartmentsResponse> {
    this.validateAuth(tenantId, userId);

    return this.assignmentService.listActiveDepartments(tenantId, userId);
  }

  // ===========================================================================
  // Helper Methods
  // ===========================================================================

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
