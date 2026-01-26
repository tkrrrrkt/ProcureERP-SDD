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
import { TaxCodeService } from '../service/tax-code.service';
import {
  ListTaxCodesApiRequest,
  ListTaxCodesApiResponse,
  GetTaxCodeApiResponse,
  CreateTaxCodeApiRequest,
  CreateTaxCodeApiResponse,
  UpdateTaxCodeApiRequest,
  UpdateTaxCodeApiResponse,
  DeactivateTaxCodeApiRequest,
  DeactivateTaxCodeApiResponse,
  ActivateTaxCodeApiRequest,
  ActivateTaxCodeApiResponse,
  ListTaxBusinessCategoriesApiResponse,
  ListTaxRatesForDropdownApiResponse,
  TaxCodeSortBy,
  SortOrder,
} from '@procure/contracts/api/tax-code';

/**
 * Tax Code Controller
 *
 * Domain API エンドポイント
 * - BFF から呼び出される
 * - tenant_id / user_id はヘッダーから取得
 */
@Controller('master-data/tax-code')
export class TaxCodeController {
  constructor(private readonly taxCodeService: TaxCodeService) {}

  /**
   * GET /api/master-data/tax-code/tax-business-categories
   * 税区分一覧取得（ドロップダウン用）
   * Note: :id より先に定義しないとパスがマッチしない
   */
  @Get('tax-business-categories')
  async listTaxBusinessCategories(
    @Headers('x-tenant-id') tenantId: string,
  ): Promise<ListTaxBusinessCategoriesApiResponse> {
    return this.taxCodeService.listTaxBusinessCategories(tenantId);
  }

  /**
   * GET /api/master-data/tax-code/tax-rates
   * 税率一覧取得（ドロップダウン用）
   * Note: :id より先に定義しないとパスがマッチしない
   */
  @Get('tax-rates')
  async listTaxRatesForDropdown(
    @Headers('x-tenant-id') tenantId: string,
  ): Promise<ListTaxRatesForDropdownApiResponse> {
    return this.taxCodeService.listTaxRatesForDropdown(tenantId);
  }

  /**
   * GET /api/master-data/tax-code
   * 税コード一覧取得
   */
  @Get()
  async listTaxCodes(
    @Headers('x-tenant-id') tenantId: string,
    @Query('offset') offset?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: TaxCodeSortBy,
    @Query('sortOrder') sortOrder?: SortOrder,
    @Query('keyword') keyword?: string,
    @Query('taxBusinessCategoryId') taxBusinessCategoryId?: string,
    @Query('isActive') isActive?: string,
  ): Promise<ListTaxCodesApiResponse> {
    const request: ListTaxCodesApiRequest = {
      offset: offset ? parseInt(offset, 10) : 0,
      limit: limit ? parseInt(limit, 10) : 50,
      sortBy,
      sortOrder,
      keyword: keyword?.trim() || undefined,
      taxBusinessCategoryId: taxBusinessCategoryId || undefined,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
    };

    return this.taxCodeService.listTaxCodes(tenantId, request);
  }

  /**
   * GET /api/master-data/tax-code/:id
   * 税コード詳細取得
   */
  @Get(':id')
  async getTaxCode(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') taxCodeId: string,
  ): Promise<GetTaxCodeApiResponse> {
    return this.taxCodeService.getTaxCode(tenantId, taxCodeId);
  }

  /**
   * POST /api/master-data/tax-code
   * 税コード新規登録
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createTaxCode(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Body() request: CreateTaxCodeApiRequest,
  ): Promise<CreateTaxCodeApiResponse> {
    return this.taxCodeService.createTaxCode(tenantId, userId, request);
  }

  /**
   * PUT /api/master-data/tax-code/:id
   * 税コード更新
   */
  @Put(':id')
  async updateTaxCode(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') taxCodeId: string,
    @Body() request: UpdateTaxCodeApiRequest,
  ): Promise<UpdateTaxCodeApiResponse> {
    return this.taxCodeService.updateTaxCode(tenantId, userId, taxCodeId, request);
  }

  /**
   * PATCH /api/master-data/tax-code/:id/deactivate
   * 税コード無効化
   */
  @Patch(':id/deactivate')
  async deactivateTaxCode(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') taxCodeId: string,
    @Body() request: DeactivateTaxCodeApiRequest,
  ): Promise<DeactivateTaxCodeApiResponse> {
    return this.taxCodeService.deactivateTaxCode(tenantId, userId, taxCodeId, request);
  }

  /**
   * PATCH /api/master-data/tax-code/:id/activate
   * 税コード有効化
   */
  @Patch(':id/activate')
  async activateTaxCode(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') taxCodeId: string,
    @Body() request: ActivateTaxCodeApiRequest,
  ): Promise<ActivateTaxCodeApiResponse> {
    return this.taxCodeService.activateTaxCode(tenantId, userId, taxCodeId, request);
  }
}
