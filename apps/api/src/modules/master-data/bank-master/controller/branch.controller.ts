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
} from '@nestjs/common';
import { BranchService } from '../service/branch.service';
import {
  ListBranchesApiRequest,
  ListBranchesApiResponse,
  GetBranchApiResponse,
  CreateBranchApiRequest,
  CreateBranchApiResponse,
  UpdateBranchApiRequest,
  UpdateBranchApiResponse,
  DeactivateBranchApiRequest,
  DeactivateBranchApiResponse,
  ActivateBranchApiRequest,
  ActivateBranchApiResponse,
  BranchSortBy,
  SortOrder,
} from '@procure/contracts/api/bank-master';

/**
 * Branch Controller
 *
 * Domain API エンドポイント
 * - BFF から呼び出される
 * - tenant_id / user_id はヘッダーから取得
 * - 権限チェックは Guard で実施（TODO: 実装）
 */
@Controller('master-data/bank-master/:bankId/branches')
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  /**
   * GET /api/master-data/bank-master/:bankId/branches
   * 支店一覧取得
   *
   * 権限: procure.bank-branch.read
   */
  @Get()
  async listBranches(
    @Headers('x-tenant-id') tenantId: string,
    @Param('bankId') bankId: string,
    @Query('offset') offset?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: BranchSortBy,
    @Query('sortOrder') sortOrder?: SortOrder,
    @Query('keyword') keyword?: string,
    @Query('isActive') isActive?: string,
  ): Promise<ListBranchesApiResponse> {
    const request: ListBranchesApiRequest = {
      offset: offset ? parseInt(offset, 10) : 0,
      limit: limit ? parseInt(limit, 10) : 50,
      sortBy,
      sortOrder,
      keyword: keyword?.trim() || undefined,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
    };

    return this.branchService.listBranches(tenantId, bankId, request);
  }

  /**
   * GET /api/master-data/bank-master/:bankId/branches/:branchId
   * 支店詳細取得
   *
   * 権限: procure.bank-branch.read
   */
  @Get(':branchId')
  async getBranch(
    @Headers('x-tenant-id') tenantId: string,
    @Param('bankId') bankId: string,
    @Param('branchId') branchId: string,
  ): Promise<GetBranchApiResponse> {
    return this.branchService.getBranch(tenantId, bankId, branchId);
  }

  /**
   * POST /api/master-data/bank-master/:bankId/branches
   * 支店新規登録
   *
   * 権限: procure.bank-branch.create
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createBranch(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('bankId') bankId: string,
    @Body() request: CreateBranchApiRequest,
  ): Promise<CreateBranchApiResponse> {
    return this.branchService.createBranch(tenantId, userId, bankId, request);
  }

  /**
   * PUT /api/master-data/bank-master/:bankId/branches/:branchId
   * 支店更新
   *
   * 権限: procure.bank-branch.update
   */
  @Put(':branchId')
  async updateBranch(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('bankId') bankId: string,
    @Param('branchId') branchId: string,
    @Body() request: UpdateBranchApiRequest,
  ): Promise<UpdateBranchApiResponse> {
    return this.branchService.updateBranch(
      tenantId,
      userId,
      bankId,
      branchId,
      request,
    );
  }

  /**
   * PATCH /api/master-data/bank-master/:bankId/branches/:branchId/deactivate
   * 支店無効化
   *
   * 権限: procure.bank-branch.update
   */
  @Patch(':branchId/deactivate')
  async deactivateBranch(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('bankId') bankId: string,
    @Param('branchId') branchId: string,
    @Body() request: DeactivateBranchApiRequest,
  ): Promise<DeactivateBranchApiResponse> {
    return this.branchService.deactivateBranch(
      tenantId,
      userId,
      bankId,
      branchId,
      request,
    );
  }

  /**
   * PATCH /api/master-data/bank-master/:bankId/branches/:branchId/activate
   * 支店再有効化
   *
   * 権限: procure.bank-branch.update
   */
  @Patch(':branchId/activate')
  async activateBranch(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('bankId') bankId: string,
    @Param('branchId') branchId: string,
    @Body() request: ActivateBranchApiRequest,
  ): Promise<ActivateBranchApiResponse> {
    return this.branchService.activateBranch(
      tenantId,
      userId,
      bankId,
      branchId,
      request,
    );
  }
}
