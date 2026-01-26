/**
 * SupplierSite Controller
 *
 * Domain API エンドポイント
 */

import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  Headers,
} from '@nestjs/common';
import { SupplierSiteService } from '../services/supplier-site.service';
import {
  ListSupplierSitesApiRequest,
  ListSupplierSitesApiResponse,
  GetSupplierSiteApiResponse,
  CreateSupplierSiteApiRequest,
  CreateSupplierSiteApiResponse,
  UpdateSupplierSiteApiRequest,
  UpdateSupplierSiteApiResponse,
  SupplierSiteSortBy,
  SortOrder,
} from '@procure/contracts/api/business-partner';

const DEFAULT_TENANT_ID = 'default-tenant';
const DEFAULT_USER_ID = 'default-user';

@Controller('api/domain/master-data/business-partner/supplier-sites')
export class SupplierSiteController {
  constructor(private readonly supplierSiteService: SupplierSiteService) {}

  /**
   * 仕入先拠点一覧取得
   */
  @Get()
  async listSupplierSites(
    @Query('partyId') partyId: string,
    @Query('offset') offset?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: SupplierSiteSortBy,
    @Query('sortOrder') sortOrder?: SortOrder,
    @Query('keyword') keyword?: string,
    @Headers('x-tenant-id') tenantId?: string,
  ): Promise<ListSupplierSitesApiResponse> {
    const request: ListSupplierSitesApiRequest = {
      partyId,
      offset: offset ? parseInt(offset, 10) : 0,
      limit: limit ? parseInt(limit, 10) : 50,
      sortBy,
      sortOrder,
      keyword,
    };

    return this.supplierSiteService.listSupplierSites(
      tenantId || DEFAULT_TENANT_ID,
      request,
    );
  }

  /**
   * 仕入先拠点詳細取得
   */
  @Get(':id')
  async getSupplierSite(
    @Param('id') supplierSiteId: string,
    @Headers('x-tenant-id') tenantId?: string,
  ): Promise<GetSupplierSiteApiResponse> {
    return this.supplierSiteService.getSupplierSite(
      tenantId || DEFAULT_TENANT_ID,
      supplierSiteId,
    );
  }

  /**
   * 仕入先拠点新規登録
   */
  @Post()
  async createSupplierSite(
    @Body() request: CreateSupplierSiteApiRequest,
    @Headers('x-tenant-id') tenantId?: string,
    @Headers('x-user-id') userId?: string,
  ): Promise<CreateSupplierSiteApiResponse> {
    return this.supplierSiteService.createSupplierSite(
      tenantId || DEFAULT_TENANT_ID,
      userId || DEFAULT_USER_ID,
      request,
    );
  }

  /**
   * 仕入先拠点更新
   */
  @Put(':id')
  async updateSupplierSite(
    @Param('id') supplierSiteId: string,
    @Body() request: UpdateSupplierSiteApiRequest,
    @Headers('x-tenant-id') tenantId?: string,
    @Headers('x-user-id') userId?: string,
  ): Promise<UpdateSupplierSiteApiResponse> {
    return this.supplierSiteService.updateSupplierSite(
      tenantId || DEFAULT_TENANT_ID,
      userId || DEFAULT_USER_ID,
      supplierSiteId,
      request,
    );
  }
}
