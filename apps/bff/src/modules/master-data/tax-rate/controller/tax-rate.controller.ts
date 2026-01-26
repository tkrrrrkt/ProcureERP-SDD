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
import { TaxRateBffService } from '../service/tax-rate.service';
import {
  ListTaxRatesRequest,
  ListTaxRatesResponse,
  GetTaxRateResponse,
  CreateTaxRateRequest,
  CreateTaxRateResponse,
  UpdateTaxRateRequest,
  UpdateTaxRateResponse,
  DeactivateTaxRateRequest,
  DeactivateTaxRateResponse,
  ActivateTaxRateRequest,
  ActivateTaxRateResponse,
  TaxRateSortBy,
  SortOrder,
} from '@procure/contracts/bff/tax-rate';

/**
 * Tax Rate BFF Controller
 *
 * UI からの API エンドポイント
 * - tenant_id / user_id を認証情報（Clerk）から解決
 * - Global prefix: /api/bff が main.ts で設定済み
 */
@Controller('master-data/tax-rate')
export class TaxRateBffController {
  constructor(private readonly taxRateService: TaxRateBffService) {}

  /**
   * GET /api/bff/master-data/tax-rate
   * 税率一覧取得
   */
  @Get()
  async listTaxRates(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('sortBy') sortBy?: TaxRateSortBy,
    @Query('sortOrder') sortOrder?: SortOrder,
    @Query('keyword') keyword?: string,
    @Query('isActive') isActive?: string,
  ): Promise<ListTaxRatesResponse> {
    this.validateAuth(tenantId, userId);

    const request: ListTaxRatesRequest = {
      page: page ? parseInt(page, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
      sortBy,
      sortOrder,
      keyword,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
    };

    return this.taxRateService.listTaxRates(tenantId, userId, request);
  }

  /**
   * GET /api/bff/master-data/tax-rate/:id
   * 税率詳細取得
   */
  @Get(':id')
  async getTaxRate(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') taxRateId: string,
  ): Promise<GetTaxRateResponse> {
    this.validateAuth(tenantId, userId);

    return this.taxRateService.getTaxRate(tenantId, userId, taxRateId);
  }

  /**
   * POST /api/bff/master-data/tax-rate
   * 税率新規登録
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createTaxRate(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Body() request: CreateTaxRateRequest,
  ): Promise<CreateTaxRateResponse> {
    this.validateAuth(tenantId, userId);

    return this.taxRateService.createTaxRate(tenantId, userId, request);
  }

  /**
   * PUT /api/bff/master-data/tax-rate/:id
   * 税率更新
   */
  @Put(':id')
  async updateTaxRate(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') taxRateId: string,
    @Body() request: UpdateTaxRateRequest,
  ): Promise<UpdateTaxRateResponse> {
    this.validateAuth(tenantId, userId);

    return this.taxRateService.updateTaxRate(tenantId, userId, taxRateId, request);
  }

  /**
   * PATCH /api/bff/master-data/tax-rate/:id/deactivate
   * 税率無効化
   */
  @Patch(':id/deactivate')
  async deactivateTaxRate(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') taxRateId: string,
    @Body() request: DeactivateTaxRateRequest,
  ): Promise<DeactivateTaxRateResponse> {
    this.validateAuth(tenantId, userId);

    return this.taxRateService.deactivateTaxRate(tenantId, userId, taxRateId, request);
  }

  /**
   * PATCH /api/bff/master-data/tax-rate/:id/activate
   * 税率有効化
   */
  @Patch(':id/activate')
  async activateTaxRate(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') taxRateId: string,
    @Body() request: ActivateTaxRateRequest,
  ): Promise<ActivateTaxRateResponse> {
    this.validateAuth(tenantId, userId);

    return this.taxRateService.activateTaxRate(tenantId, userId, taxRateId, request);
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
