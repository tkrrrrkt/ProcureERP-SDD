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
import { ItemAttributeBffService } from '../service/item-attribute.service';
import {
  ListItemAttributesRequest,
  ListItemAttributesResponse,
  GetItemAttributeResponse,
  CreateItemAttributeRequest,
  CreateItemAttributeResponse,
  UpdateItemAttributeRequest,
  UpdateItemAttributeResponse,
  ActivateItemAttributeRequest,
  ActivateItemAttributeResponse,
  DeactivateItemAttributeRequest,
  DeactivateItemAttributeResponse,
  SuggestItemAttributesRequest,
  SuggestItemAttributesResponse,
  ListItemAttributeValuesRequest,
  ListItemAttributeValuesResponse,
  GetItemAttributeValueResponse,
  CreateItemAttributeValueRequest,
  CreateItemAttributeValueResponse,
  UpdateItemAttributeValueRequest,
  UpdateItemAttributeValueResponse,
  ActivateItemAttributeValueRequest,
  ActivateItemAttributeValueResponse,
  DeactivateItemAttributeValueRequest,
  DeactivateItemAttributeValueResponse,
  SuggestItemAttributeValuesRequest,
  SuggestItemAttributeValuesResponse,
  ItemAttributeSortBy,
  ItemAttributeValueSortBy,
  SortOrder,
} from '@procure/contracts/bff/item-attribute';

/**
 * Item Attribute BFF Controller
 *
 * UI からの API エンドポイント（14エンドポイント）
 * - tenant_id / user_id を認証情報（Clerk）から解決
 * - Global prefix: /api/bff が main.ts で設定済み
 */
@Controller('master-data/item-attributes')
export class ItemAttributeBffController {
  constructor(private readonly itemAttributeService: ItemAttributeBffService) {}

  // ==========================================================================
  // ItemAttribute Endpoints
  // ==========================================================================

  /**
   * GET /api/bff/master-data/item-attributes
   * 仕様属性一覧取得
   */
  @Get()
  async listItemAttributes(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('sortBy') sortBy?: ItemAttributeSortBy,
    @Query('sortOrder') sortOrder?: SortOrder,
    @Query('keyword') keyword?: string,
    @Query('isActive') isActive?: string,
  ): Promise<ListItemAttributesResponse> {
    this.validateAuth(tenantId, userId);

    const request: ListItemAttributesRequest = {
      page: page ? parseInt(page, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
      sortBy,
      sortOrder,
      keyword,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
    };

    return this.itemAttributeService.listItemAttributes(tenantId, userId, request);
  }

  /**
   * GET /api/bff/master-data/item-attributes/suggest
   * 仕様属性サジェスト（一覧より先にマッチ）
   */
  @Get('suggest')
  async suggestItemAttributes(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Query('keyword') keyword: string,
    @Query('limit') limit?: string,
  ): Promise<SuggestItemAttributesResponse> {
    this.validateAuth(tenantId, userId);

    const request: SuggestItemAttributesRequest = {
      keyword: keyword || '',
      limit: limit ? parseInt(limit, 10) : undefined,
    };

    return this.itemAttributeService.suggestItemAttributes(tenantId, userId, request);
  }

  /**
   * GET /api/bff/master-data/item-attributes/:id
   * 仕様属性詳細取得
   */
  @Get(':id')
  async getItemAttribute(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') attributeId: string,
  ): Promise<GetItemAttributeResponse> {
    this.validateAuth(tenantId, userId);

    return this.itemAttributeService.getItemAttribute(tenantId, userId, attributeId);
  }

  /**
   * POST /api/bff/master-data/item-attributes
   * 仕様属性新規登録
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createItemAttribute(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Body() request: CreateItemAttributeRequest,
  ): Promise<CreateItemAttributeResponse> {
    this.validateAuth(tenantId, userId);

    return this.itemAttributeService.createItemAttribute(tenantId, userId, request);
  }

  /**
   * PUT /api/bff/master-data/item-attributes/:id
   * 仕様属性更新
   */
  @Put(':id')
  async updateItemAttribute(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') attributeId: string,
    @Body() request: UpdateItemAttributeRequest,
  ): Promise<UpdateItemAttributeResponse> {
    this.validateAuth(tenantId, userId);

    return this.itemAttributeService.updateItemAttribute(tenantId, userId, attributeId, request);
  }

  /**
   * PATCH /api/bff/master-data/item-attributes/:id/activate
   * 仕様属性有効化
   */
  @Patch(':id/activate')
  async activateItemAttribute(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') attributeId: string,
    @Body() request: ActivateItemAttributeRequest,
  ): Promise<ActivateItemAttributeResponse> {
    this.validateAuth(tenantId, userId);

    return this.itemAttributeService.activateItemAttribute(tenantId, userId, attributeId, request);
  }

  /**
   * PATCH /api/bff/master-data/item-attributes/:id/deactivate
   * 仕様属性無効化
   */
  @Patch(':id/deactivate')
  async deactivateItemAttribute(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') attributeId: string,
    @Body() request: DeactivateItemAttributeRequest,
  ): Promise<DeactivateItemAttributeResponse> {
    this.validateAuth(tenantId, userId);

    return this.itemAttributeService.deactivateItemAttribute(tenantId, userId, attributeId, request);
  }

  // ==========================================================================
  // ItemAttributeValue Endpoints
  // ==========================================================================

  /**
   * GET /api/bff/master-data/item-attributes/:attributeId/values
   * 属性値一覧取得
   */
  @Get(':attributeId/values')
  async listItemAttributeValues(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('attributeId') attributeId: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('sortBy') sortBy?: ItemAttributeValueSortBy,
    @Query('sortOrder') sortOrder?: SortOrder,
    @Query('keyword') keyword?: string,
    @Query('isActive') isActive?: string,
  ): Promise<ListItemAttributeValuesResponse> {
    this.validateAuth(tenantId, userId);

    const request: ListItemAttributeValuesRequest = {
      page: page ? parseInt(page, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
      sortBy,
      sortOrder,
      keyword,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
    };

    return this.itemAttributeService.listItemAttributeValues(tenantId, userId, attributeId, request);
  }

  /**
   * GET /api/bff/master-data/item-attributes/:attributeId/values/:id
   * 属性値詳細取得
   */
  @Get(':attributeId/values/:id')
  async getItemAttributeValue(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('attributeId') attributeId: string,
    @Param('id') valueId: string,
  ): Promise<GetItemAttributeValueResponse> {
    this.validateAuth(tenantId, userId);

    return this.itemAttributeService.getItemAttributeValue(tenantId, userId, attributeId, valueId);
  }

  /**
   * POST /api/bff/master-data/item-attributes/:attributeId/values
   * 属性値新規登録
   */
  @Post(':attributeId/values')
  @HttpCode(HttpStatus.CREATED)
  async createItemAttributeValue(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('attributeId') attributeId: string,
    @Body() request: CreateItemAttributeValueRequest,
  ): Promise<CreateItemAttributeValueResponse> {
    this.validateAuth(tenantId, userId);

    return this.itemAttributeService.createItemAttributeValue(tenantId, userId, attributeId, request);
  }

  /**
   * PUT /api/bff/master-data/item-attributes/:attributeId/values/:id
   * 属性値更新
   */
  @Put(':attributeId/values/:id')
  async updateItemAttributeValue(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('attributeId') attributeId: string,
    @Param('id') valueId: string,
    @Body() request: UpdateItemAttributeValueRequest,
  ): Promise<UpdateItemAttributeValueResponse> {
    this.validateAuth(tenantId, userId);

    return this.itemAttributeService.updateItemAttributeValue(tenantId, userId, attributeId, valueId, request);
  }

  /**
   * PATCH /api/bff/master-data/item-attributes/:attributeId/values/:id/activate
   * 属性値有効化
   */
  @Patch(':attributeId/values/:id/activate')
  async activateItemAttributeValue(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('attributeId') attributeId: string,
    @Param('id') valueId: string,
    @Body() request: ActivateItemAttributeValueRequest,
  ): Promise<ActivateItemAttributeValueResponse> {
    this.validateAuth(tenantId, userId);

    return this.itemAttributeService.activateItemAttributeValue(tenantId, userId, attributeId, valueId, request);
  }

  /**
   * PATCH /api/bff/master-data/item-attributes/:attributeId/values/:id/deactivate
   * 属性値無効化
   */
  @Patch(':attributeId/values/:id/deactivate')
  async deactivateItemAttributeValue(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('attributeId') attributeId: string,
    @Param('id') valueId: string,
    @Body() request: DeactivateItemAttributeValueRequest,
  ): Promise<DeactivateItemAttributeValueResponse> {
    this.validateAuth(tenantId, userId);

    return this.itemAttributeService.deactivateItemAttributeValue(tenantId, userId, attributeId, valueId, request);
  }

  // ==========================================================================
  // Helper Methods
  // ==========================================================================

  /**
   * 認証情報バリデーション
   */
  private validateAuth(tenantId: string, userId: string): void {
    if (!tenantId || !userId) {
      throw new HttpException(
        {
          code: 'UNAUTHORIZED',
          message: '認証情報が不足しています',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}

/**
 * Item Attribute Value Suggest Controller
 *
 * 属性値サジェストは属性を跨ぐことがあるため、別のエンドポイントを設ける
 */
@Controller('master-data/item-attribute-values')
export class ItemAttributeValueSuggestBffController {
  constructor(private readonly itemAttributeService: ItemAttributeBffService) {}

  /**
   * GET /api/bff/master-data/item-attribute-values/suggest
   * 属性値サジェスト
   */
  @Get('suggest')
  async suggestItemAttributeValues(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Query('keyword') keyword: string,
    @Query('attributeId') attributeId?: string,
    @Query('limit') limit?: string,
  ): Promise<SuggestItemAttributeValuesResponse> {
    this.validateAuth(tenantId, userId);

    const request: SuggestItemAttributeValuesRequest = {
      keyword: keyword || '',
      attributeId,
      limit: limit ? parseInt(limit, 10) : undefined,
    };

    return this.itemAttributeService.suggestItemAttributeValues(tenantId, userId, request);
  }

  /**
   * 認証情報バリデーション
   */
  private validateAuth(tenantId: string, userId: string): void {
    if (!tenantId || !userId) {
      throw new HttpException(
        {
          code: 'UNAUTHORIZED',
          message: '認証情報が不足しています',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
