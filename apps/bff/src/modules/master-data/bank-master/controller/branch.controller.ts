import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Param,
  Query,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { BranchBffService } from '../service/branch.service';
import {
  ListBranchesRequest,
  ListBranchesResponse,
  GetBranchResponse,
  CreateBranchRequest,
  CreateBranchResponse,
  UpdateBranchRequest,
  UpdateBranchResponse,
  DeactivateBranchRequest,
  DeactivateBranchResponse,
  ActivateBranchRequest,
  ActivateBranchResponse,
  BranchSortBy,
  SortOrder,
} from '@procure/contracts/bff/bank-master';

/**
 * Branch BFF Controller
 *
 * UI からの API エンドポイント
 * - tenant_id / user_id を認証情報（Clerk）から解決
 * - Global prefix: /api/bff が main.ts で設定済み
 */
@Controller('master-data/bank-master/:bankId/branches')
export class BranchBffController {
  constructor(private readonly branchService: BranchBffService) {}

  /**
   * GET /api/bff/master-data/bank-master/:bankId/branches
   * 支店一覧取得
   */
  @Get()
  async listBranches(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('bankId') bankId: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('sortBy') sortBy?: BranchSortBy,
    @Query('sortOrder') sortOrder?: SortOrder,
    @Query('keyword') keyword?: string,
    @Query('isActive') isActive?: string,
  ): Promise<ListBranchesResponse> {
    this.validateAuth(tenantId, userId);

    const request: ListBranchesRequest = {
      page: page ? parseInt(page, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
      sortBy,
      sortOrder,
      keyword,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
    };

    return this.branchService.listBranches(tenantId, userId, bankId, request);
  }

  /**
   * GET /api/bff/master-data/bank-master/:bankId/branches/:branchId
   * 支店詳細取得
   */
  @Get(':branchId')
  async getBranch(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('bankId') bankId: string,
    @Param('branchId') branchId: string,
  ): Promise<GetBranchResponse> {
    this.validateAuth(tenantId, userId);

    return this.branchService.getBranch(tenantId, userId, bankId, branchId);
  }

  /**
   * POST /api/bff/master-data/bank-master/:bankId/branches
   * 支店新規登録
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createBranch(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('bankId') bankId: string,
    @Body() request: CreateBranchRequest,
  ): Promise<CreateBranchResponse> {
    this.validateAuth(tenantId, userId);

    return this.branchService.createBranch(tenantId, userId, bankId, request);
  }

  /**
   * PUT /api/bff/master-data/bank-master/:bankId/branches/:branchId
   * 支店更新
   */
  @Put(':branchId')
  async updateBranch(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('bankId') bankId: string,
    @Param('branchId') branchId: string,
    @Body() request: UpdateBranchRequest,
  ): Promise<UpdateBranchResponse> {
    this.validateAuth(tenantId, userId);

    return this.branchService.updateBranch(
      tenantId,
      userId,
      bankId,
      branchId,
      request,
    );
  }

  /**
   * PATCH /api/bff/master-data/bank-master/:bankId/branches/:branchId/deactivate
   * 支店無効化
   */
  @Patch(':branchId/deactivate')
  async deactivateBranch(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('bankId') bankId: string,
    @Param('branchId') branchId: string,
    @Body() request: DeactivateBranchRequest,
  ): Promise<DeactivateBranchResponse> {
    this.validateAuth(tenantId, userId);

    return this.branchService.deactivateBranch(
      tenantId,
      userId,
      bankId,
      branchId,
      request,
    );
  }

  /**
   * PATCH /api/bff/master-data/bank-master/:bankId/branches/:branchId/activate
   * 支店再有効化
   */
  @Patch(':branchId/activate')
  async activateBranch(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('bankId') bankId: string,
    @Param('branchId') branchId: string,
    @Body() request: ActivateBranchRequest,
  ): Promise<ActivateBranchResponse> {
    this.validateAuth(tenantId, userId);

    return this.branchService.activateBranch(
      tenantId,
      userId,
      bankId,
      branchId,
      request,
    );
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
