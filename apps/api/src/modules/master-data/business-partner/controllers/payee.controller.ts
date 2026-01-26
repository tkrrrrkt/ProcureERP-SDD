/**
 * Payee Controller
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
import { PayeeService } from '../services/payee.service';
import {
  ListPayeesApiRequest,
  ListPayeesApiResponse,
  GetPayeeApiResponse,
  CreatePayeeApiRequest,
  CreatePayeeApiResponse,
  UpdatePayeeApiRequest,
  UpdatePayeeApiResponse,
  PayeeSortBy,
  SortOrder,
} from '@procure/contracts/api/business-partner';

const DEFAULT_TENANT_ID = 'default-tenant';
const DEFAULT_USER_ID = 'default-user';

@Controller('api/domain/master-data/business-partner/payees')
export class PayeeController {
  constructor(private readonly payeeService: PayeeService) {}

  /**
   * 支払先一覧取得
   */
  @Get()
  async listPayees(
    @Query('partyId') partyId: string,
    @Query('offset') offset?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: PayeeSortBy,
    @Query('sortOrder') sortOrder?: SortOrder,
    @Query('keyword') keyword?: string,
    @Headers('x-tenant-id') tenantId?: string,
  ): Promise<ListPayeesApiResponse> {
    const request: ListPayeesApiRequest = {
      partyId,
      offset: offset ? parseInt(offset, 10) : 0,
      limit: limit ? parseInt(limit, 10) : 50,
      sortBy,
      sortOrder,
      keyword,
    };

    return this.payeeService.listPayees(
      tenantId || DEFAULT_TENANT_ID,
      request,
    );
  }

  /**
   * 支払先詳細取得
   */
  @Get(':id')
  async getPayee(
    @Param('id') payeeId: string,
    @Headers('x-tenant-id') tenantId?: string,
  ): Promise<GetPayeeApiResponse> {
    return this.payeeService.getPayee(
      tenantId || DEFAULT_TENANT_ID,
      payeeId,
    );
  }

  /**
   * 支払先新規登録
   */
  @Post()
  async createPayee(
    @Body() request: CreatePayeeApiRequest,
    @Headers('x-tenant-id') tenantId?: string,
    @Headers('x-user-id') userId?: string,
  ): Promise<CreatePayeeApiResponse> {
    return this.payeeService.createPayee(
      tenantId || DEFAULT_TENANT_ID,
      userId || DEFAULT_USER_ID,
      request,
    );
  }

  /**
   * 支払先更新
   */
  @Put(':id')
  async updatePayee(
    @Param('id') payeeId: string,
    @Body() request: UpdatePayeeApiRequest,
    @Headers('x-tenant-id') tenantId?: string,
    @Headers('x-user-id') userId?: string,
  ): Promise<UpdatePayeeApiResponse> {
    return this.payeeService.updatePayee(
      tenantId || DEFAULT_TENANT_ID,
      userId || DEFAULT_USER_ID,
      payeeId,
      request,
    );
  }
}
