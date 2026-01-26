/**
 * SupplierSite BFF Controller
 *
 * UI からの API エンドポイント
 * - tenant_id / user_id を認証情報（Clerk）から解決
 * - Global prefix: /api/bff が main.ts で設定済み
 */

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
import { SupplierSiteBffService } from '../services/supplier-site.service';
import {
  ListSupplierSitesRequest,
  ListSupplierSitesResponse,
  GetSupplierSiteResponse,
  CreateSupplierSiteRequest,
  CreateSupplierSiteResponse,
  UpdateSupplierSiteRequest,
  UpdateSupplierSiteResponse,
  SupplierSiteSortBy,
  SortOrder,
} from '@procure/contracts/bff/business-partner';

@Controller('master-data/business-partner/supplier-sites')
export class SupplierSiteBffController {
  constructor(private readonly supplierSiteService: SupplierSiteBffService) {}

  /**
   * GET /api/bff/master-data/business-partner/supplier-sites
   * 仕入先拠点一覧取得
   */
  @Get()
  async listSupplierSites(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Query('partyId') partyId: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('sortBy') sortBy?: SupplierSiteSortBy,
    @Query('sortOrder') sortOrder?: SortOrder,
    @Query('keyword') keyword?: string,
  ): Promise<ListSupplierSitesResponse> {
    this.validateAuth(tenantId, userId);

    const request: ListSupplierSitesRequest = {
      partyId,
      page: page ? parseInt(page, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
      sortBy,
      sortOrder,
      keyword,
    };

    return this.supplierSiteService.listSupplierSites(tenantId, userId, request);
  }

  /**
   * GET /api/bff/master-data/business-partner/supplier-sites/:id
   * 仕入先拠点詳細取得
   */
  @Get(':id')
  async getSupplierSite(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') supplierSiteId: string,
  ): Promise<GetSupplierSiteResponse> {
    this.validateAuth(tenantId, userId);

    return this.supplierSiteService.getSupplierSite(tenantId, userId, supplierSiteId);
  }

  /**
   * POST /api/bff/master-data/business-partner/supplier-sites
   * 仕入先拠点新規登録
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createSupplierSite(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Body() request: CreateSupplierSiteRequest,
  ): Promise<CreateSupplierSiteResponse> {
    this.validateAuth(tenantId, userId);

    return this.supplierSiteService.createSupplierSite(tenantId, userId, request);
  }

  /**
   * PUT /api/bff/master-data/business-partner/supplier-sites/:id
   * 仕入先拠点更新
   */
  @Put(':id')
  async updateSupplierSite(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') supplierSiteId: string,
    @Body() request: UpdateSupplierSiteRequest,
  ): Promise<UpdateSupplierSiteResponse> {
    this.validateAuth(tenantId, userId);

    return this.supplierSiteService.updateSupplierSite(tenantId, userId, supplierSiteId, request);
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
