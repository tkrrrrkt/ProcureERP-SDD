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
import { ItemAttributeValueService } from '../service/item-attribute-value.service';
import {
  ListItemAttributeValuesApiRequest,
  ListItemAttributeValuesApiResponse,
  GetItemAttributeValueApiResponse,
  CreateItemAttributeValueApiRequest,
  CreateItemAttributeValueApiResponse,
  UpdateItemAttributeValueApiRequest,
  UpdateItemAttributeValueApiResponse,
  ActivateItemAttributeValueApiRequest,
  ActivateItemAttributeValueApiResponse,
  DeactivateItemAttributeValueApiRequest,
  DeactivateItemAttributeValueApiResponse,
  SuggestItemAttributeValuesApiRequest,
  SuggestItemAttributeValuesApiResponse,
  ItemAttributeValueSortBy,
  SortOrder,
} from '@procure/contracts/api/item-attribute';

/**
 * ItemAttributeValue Controller
 *
 * Domain API エンドポイント（品目仕様属性値）
 * - BFF から呼び出される
 * - tenant_id / user_id はヘッダーから取得
 */
@Controller('master-data/item-attributes/:attributeId/values')
export class ItemAttributeValueController {
  constructor(private readonly itemAttributeValueService: ItemAttributeValueService) {}

  /**
   * GET /api/master-data/item-attributes/:attributeId/values
   * 属性値一覧取得
   */
  @Get()
  async listItemAttributeValues(
    @Headers('x-tenant-id') tenantId: string,
    @Param('attributeId') attributeId: string,
    @Query('offset') offset?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: ItemAttributeValueSortBy,
    @Query('sortOrder') sortOrder?: SortOrder,
    @Query('keyword') keyword?: string,
    @Query('isActive') isActive?: string,
  ): Promise<ListItemAttributeValuesApiResponse> {
    const request: ListItemAttributeValuesApiRequest = {
      offset: offset ? parseInt(offset, 10) : 0,
      limit: limit ? parseInt(limit, 10) : 50,
      sortBy,
      sortOrder,
      keyword: keyword?.trim() || undefined,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
    };

    return this.itemAttributeValueService.listItemAttributeValues(tenantId, attributeId, request);
  }

  /**
   * GET /api/master-data/item-attributes/:attributeId/values/:id
   * 属性値詳細取得
   */
  @Get(':id')
  async getItemAttributeValue(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') valueId: string,
  ): Promise<GetItemAttributeValueApiResponse> {
    return this.itemAttributeValueService.getItemAttributeValue(tenantId, valueId);
  }

  /**
   * POST /api/master-data/item-attributes/:attributeId/values
   * 属性値新規登録
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createItemAttributeValue(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('attributeId') attributeId: string,
    @Body() request: CreateItemAttributeValueApiRequest,
  ): Promise<CreateItemAttributeValueApiResponse> {
    return this.itemAttributeValueService.createItemAttributeValue(tenantId, userId, attributeId, request);
  }

  /**
   * PUT /api/master-data/item-attributes/:attributeId/values/:id
   * 属性値更新
   */
  @Put(':id')
  async updateItemAttributeValue(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') valueId: string,
    @Body() request: UpdateItemAttributeValueApiRequest,
  ): Promise<UpdateItemAttributeValueApiResponse> {
    return this.itemAttributeValueService.updateItemAttributeValue(tenantId, userId, valueId, request);
  }

  /**
   * PATCH /api/master-data/item-attributes/:attributeId/values/:id/activate
   * 属性値有効化
   */
  @Patch(':id/activate')
  async activateItemAttributeValue(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') valueId: string,
    @Body() request: ActivateItemAttributeValueApiRequest,
  ): Promise<ActivateItemAttributeValueApiResponse> {
    return this.itemAttributeValueService.activateItemAttributeValue(tenantId, userId, valueId, request);
  }

  /**
   * PATCH /api/master-data/item-attributes/:attributeId/values/:id/deactivate
   * 属性値無効化
   */
  @Patch(':id/deactivate')
  async deactivateItemAttributeValue(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') valueId: string,
    @Body() request: DeactivateItemAttributeValueApiRequest,
  ): Promise<DeactivateItemAttributeValueApiResponse> {
    return this.itemAttributeValueService.deactivateItemAttributeValue(tenantId, userId, valueId, request);
  }
}

/**
 * ItemAttributeValue Suggest Controller
 *
 * 属性値サジェストは属性を跨ぐことがあるため、別のエンドポイントを設ける
 */
@Controller('master-data/item-attribute-values')
export class ItemAttributeValueSuggestController {
  constructor(private readonly itemAttributeValueService: ItemAttributeValueService) {}

  /**
   * GET /api/master-data/item-attribute-values/suggest
   * 属性値サジェスト
   */
  @Get('suggest')
  async suggestItemAttributeValues(
    @Headers('x-tenant-id') tenantId: string,
    @Query('keyword') keyword: string,
    @Query('attributeId') attributeId?: string,
    @Query('limit') limit?: string,
  ): Promise<SuggestItemAttributeValuesApiResponse> {
    const request: SuggestItemAttributeValuesApiRequest = {
      keyword: keyword?.trim() || '',
      attributeId: attributeId || undefined,
      limit: limit ? parseInt(limit, 10) : 20,
    };

    return this.itemAttributeValueService.suggestItemAttributeValues(tenantId, request);
  }
}
