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
import { TaxCodeBffService } from '../service/tax-code.service';
import {
  ListTaxCodesRequest,
  ListTaxCodesResponse,
  GetTaxCodeResponse,
  CreateTaxCodeRequest,
  CreateTaxCodeResponse,
  UpdateTaxCodeRequest,
  UpdateTaxCodeResponse,
  DeactivateTaxCodeRequest,
  DeactivateTaxCodeResponse,
  ActivateTaxCodeRequest,
  ActivateTaxCodeResponse,
  ListTaxBusinessCategoriesResponse,
  ListTaxRatesForDropdownResponse,
  TaxCodeSortBy,
  SortOrder,
} from '@procure/contracts/bff/tax-code';

/**
 * Tax Code BFF Controller
 *
 * UI からの API エンドポイント
 * - tenant_id / user_id を認証情報（Clerk）から解決
 * - Global prefix: /api/bff が main.ts で設定済み
 */
@Controller('master-data/tax-code')
export class TaxCodeBffController {
  constructor(private readonly taxCodeService: TaxCodeBffService) {}

  /**
   * GET /api/bff/master-data/tax-code/tax-business-categories
   * 税区分一覧取得（ドロップダウン用）
   * Note: :id より先に定義しないとパスがマッチしない
   */
  @Get('tax-business-categories')
  async listTaxBusinessCategories(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
  ): Promise<ListTaxBusinessCategoriesResponse> {
    this.validateAuth(tenantId, userId);

    return this.taxCodeService.listTaxBusinessCategories(tenantId, userId);
  }

  /**
   * GET /api/bff/master-data/tax-code/tax-rates
   * 税率一覧取得（ドロップダウン用）
   * Note: :id より先に定義しないとパスがマッチしない
   */
  @Get('tax-rates')
  async listTaxRatesForDropdown(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
  ): Promise<ListTaxRatesForDropdownResponse> {
    this.validateAuth(tenantId, userId);

    return this.taxCodeService.listTaxRatesForDropdown(tenantId, userId);
  }

  /**
   * GET /api/bff/master-data/tax-code
   * 税コード一覧取得
   */
  @Get()
  async listTaxCodes(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('sortBy') sortBy?: TaxCodeSortBy,
    @Query('sortOrder') sortOrder?: SortOrder,
    @Query('keyword') keyword?: string,
    @Query('taxBusinessCategoryId') taxBusinessCategoryId?: string,
    @Query('isActive') isActive?: string,
  ): Promise<ListTaxCodesResponse> {
    this.validateAuth(tenantId, userId);

    const request: ListTaxCodesRequest = {
      page: page ? parseInt(page, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
      sortBy,
      sortOrder,
      keyword,
      taxBusinessCategoryId,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
    };

    return this.taxCodeService.listTaxCodes(tenantId, userId, request);
  }

  /**
   * GET /api/bff/master-data/tax-code/:id
   * 税コード詳細取得
   */
  @Get(':id')
  async getTaxCode(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') taxCodeId: string,
  ): Promise<GetTaxCodeResponse> {
    this.validateAuth(tenantId, userId);

    return this.taxCodeService.getTaxCode(tenantId, userId, taxCodeId);
  }

  /**
   * POST /api/bff/master-data/tax-code
   * 税コード新規登録
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createTaxCode(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Body() request: CreateTaxCodeRequest,
  ): Promise<CreateTaxCodeResponse> {
    this.validateAuth(tenantId, userId);

    return this.taxCodeService.createTaxCode(tenantId, userId, request);
  }

  /**
   * PUT /api/bff/master-data/tax-code/:id
   * 税コード更新
   */
  @Put(':id')
  async updateTaxCode(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') taxCodeId: string,
    @Body() request: UpdateTaxCodeRequest,
  ): Promise<UpdateTaxCodeResponse> {
    this.validateAuth(tenantId, userId);

    return this.taxCodeService.updateTaxCode(tenantId, userId, taxCodeId, request);
  }

  /**
   * PATCH /api/bff/master-data/tax-code/:id/deactivate
   * 税コード無効化
   */
  @Patch(':id/deactivate')
  async deactivateTaxCode(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') taxCodeId: string,
    @Body() request: DeactivateTaxCodeRequest,
  ): Promise<DeactivateTaxCodeResponse> {
    this.validateAuth(tenantId, userId);

    return this.taxCodeService.deactivateTaxCode(tenantId, userId, taxCodeId, request);
  }

  /**
   * PATCH /api/bff/master-data/tax-code/:id/activate
   * 税コード有効化
   */
  @Patch(':id/activate')
  async activateTaxCode(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') taxCodeId: string,
    @Body() request: ActivateTaxCodeRequest,
  ): Promise<ActivateTaxCodeResponse> {
    this.validateAuth(tenantId, userId);

    return this.taxCodeService.activateTaxCode(tenantId, userId, taxCodeId, request);
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
