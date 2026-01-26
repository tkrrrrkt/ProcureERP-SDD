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
import { TaxRateService } from '../service/tax-rate.service';
import {
  ListTaxRatesApiRequest,
  ListTaxRatesApiResponse,
  GetTaxRateApiResponse,
  CreateTaxRateApiRequest,
  CreateTaxRateApiResponse,
  UpdateTaxRateApiRequest,
  UpdateTaxRateApiResponse,
  DeactivateTaxRateApiRequest,
  DeactivateTaxRateApiResponse,
  ActivateTaxRateApiRequest,
  ActivateTaxRateApiResponse,
  TaxRateSortBy,
  SortOrder,
} from '@procure/contracts/api/tax-rate';

/**
 * Tax Rate Controller
 *
 * Domain API エンドポイント
 * - BFF から呼び出される
 * - tenant_id / user_id はヘッダーから取得
 */
@Controller('master-data/tax-rate')
export class TaxRateController {
  constructor(private readonly taxRateService: TaxRateService) {}

  /**
   * GET /api/master-data/tax-rate
   * 税率一覧取得
   */
  @Get()
  async listTaxRates(
    @Headers('x-tenant-id') tenantId: string,
    @Query('offset') offset?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: TaxRateSortBy,
    @Query('sortOrder') sortOrder?: SortOrder,
    @Query('keyword') keyword?: string,
    @Query('isActive') isActive?: string,
  ): Promise<ListTaxRatesApiResponse> {
    const request: ListTaxRatesApiRequest = {
      offset: offset ? parseInt(offset, 10) : 0,
      limit: limit ? parseInt(limit, 10) : 50,
      sortBy,
      sortOrder,
      keyword: keyword?.trim() || undefined,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
    };

    return this.taxRateService.listTaxRates(tenantId, request);
  }

  /**
   * GET /api/master-data/tax-rate/:id
   * 税率詳細取得
   */
  @Get(':id')
  async getTaxRate(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') taxRateId: string,
  ): Promise<GetTaxRateApiResponse> {
    return this.taxRateService.getTaxRate(tenantId, taxRateId);
  }

  /**
   * POST /api/master-data/tax-rate
   * 税率新規登録
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createTaxRate(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Body() request: CreateTaxRateApiRequest,
  ): Promise<CreateTaxRateApiResponse> {
    return this.taxRateService.createTaxRate(tenantId, userId, request);
  }

  /**
   * PUT /api/master-data/tax-rate/:id
   * 税率更新
   */
  @Put(':id')
  async updateTaxRate(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') taxRateId: string,
    @Body() request: UpdateTaxRateApiRequest,
  ): Promise<UpdateTaxRateApiResponse> {
    return this.taxRateService.updateTaxRate(tenantId, userId, taxRateId, request);
  }

  /**
   * PATCH /api/master-data/tax-rate/:id/deactivate
   * 税率無効化
   */
  @Patch(':id/deactivate')
  async deactivateTaxRate(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') taxRateId: string,
    @Body() request: DeactivateTaxRateApiRequest,
  ): Promise<DeactivateTaxRateApiResponse> {
    return this.taxRateService.deactivateTaxRate(tenantId, userId, taxRateId, request);
  }

  /**
   * PATCH /api/master-data/tax-rate/:id/activate
   * 税率有効化
   */
  @Patch(':id/activate')
  async activateTaxRate(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') taxRateId: string,
    @Body() request: ActivateTaxRateApiRequest,
  ): Promise<ActivateTaxRateApiResponse> {
    return this.taxRateService.activateTaxRate(tenantId, userId, taxRateId, request);
  }
}
