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
import { ItemAttributeService } from '../service/item-attribute.service';
import {
  ListItemAttributesApiRequest,
  ListItemAttributesApiResponse,
  GetItemAttributeApiResponse,
  CreateItemAttributeApiRequest,
  CreateItemAttributeApiResponse,
  UpdateItemAttributeApiRequest,
  UpdateItemAttributeApiResponse,
  ActivateItemAttributeApiRequest,
  ActivateItemAttributeApiResponse,
  DeactivateItemAttributeApiRequest,
  DeactivateItemAttributeApiResponse,
  SuggestItemAttributesApiRequest,
  SuggestItemAttributesApiResponse,
  ItemAttributeSortBy,
  SortOrder,
} from '@procure/contracts/api/item-attribute';

/**
 * ItemAttribute Controller
 *
 * Domain API エンドポイント（品目仕様属性）
 * - BFF から呼び出される
 * - tenant_id / user_id はヘッダーから取得
 */
@Controller('master-data/item-attributes')
export class ItemAttributeController {
  constructor(private readonly itemAttributeService: ItemAttributeService) {}

  /**
   * GET /api/master-data/item-attributes
   * 仕様属性一覧取得
   */
  @Get()
  async listItemAttributes(
    @Headers('x-tenant-id') tenantId: string,
    @Query('offset') offset?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: ItemAttributeSortBy,
    @Query('sortOrder') sortOrder?: SortOrder,
    @Query('keyword') keyword?: string,
    @Query('isActive') isActive?: string,
  ): Promise<ListItemAttributesApiResponse> {
    const request: ListItemAttributesApiRequest = {
      offset: offset ? parseInt(offset, 10) : 0,
      limit: limit ? parseInt(limit, 10) : 50,
      sortBy,
      sortOrder,
      keyword: keyword?.trim() || undefined,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
    };

    return this.itemAttributeService.listItemAttributes(tenantId, request);
  }

  /**
   * GET /api/master-data/item-attributes/suggest
   * 仕様属性サジェスト（一覧取得より先にマッチさせる）
   */
  @Get('suggest')
  async suggestItemAttributes(
    @Headers('x-tenant-id') tenantId: string,
    @Query('keyword') keyword: string,
    @Query('limit') limit?: string,
  ): Promise<SuggestItemAttributesApiResponse> {
    const request: SuggestItemAttributesApiRequest = {
      keyword: keyword?.trim() || '',
      limit: limit ? parseInt(limit, 10) : 20,
    };

    return this.itemAttributeService.suggestItemAttributes(tenantId, request);
  }

  /**
   * GET /api/master-data/item-attributes/:id
   * 仕様属性詳細取得
   */
  @Get(':id')
  async getItemAttribute(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') attributeId: string,
  ): Promise<GetItemAttributeApiResponse> {
    return this.itemAttributeService.getItemAttribute(tenantId, attributeId);
  }

  /**
   * POST /api/master-data/item-attributes
   * 仕様属性新規登録
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createItemAttribute(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Body() request: CreateItemAttributeApiRequest,
  ): Promise<CreateItemAttributeApiResponse> {
    return this.itemAttributeService.createItemAttribute(tenantId, userId, request);
  }

  /**
   * PUT /api/master-data/item-attributes/:id
   * 仕様属性更新
   */
  @Put(':id')
  async updateItemAttribute(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') attributeId: string,
    @Body() request: UpdateItemAttributeApiRequest,
  ): Promise<UpdateItemAttributeApiResponse> {
    return this.itemAttributeService.updateItemAttribute(tenantId, userId, attributeId, request);
  }

  /**
   * PATCH /api/master-data/item-attributes/:id/activate
   * 仕様属性有効化
   */
  @Patch(':id/activate')
  async activateItemAttribute(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') attributeId: string,
    @Body() request: ActivateItemAttributeApiRequest,
  ): Promise<ActivateItemAttributeApiResponse> {
    return this.itemAttributeService.activateItemAttribute(tenantId, userId, attributeId, request);
  }

  /**
   * PATCH /api/master-data/item-attributes/:id/deactivate
   * 仕様属性無効化
   */
  @Patch(':id/deactivate')
  async deactivateItemAttribute(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') attributeId: string,
    @Body() request: DeactivateItemAttributeApiRequest,
  ): Promise<DeactivateItemAttributeApiResponse> {
    return this.itemAttributeService.deactivateItemAttribute(tenantId, userId, attributeId, request);
  }
}
