import { Module } from '@nestjs/common';
import {
  ItemAttributeBffController,
  ItemAttributeValueSuggestBffController,
} from './controller/item-attribute.controller';
import { ItemAttributeBffService } from './service/item-attribute.service';
import { ItemAttributeMapper } from './mappers/item-attribute.mapper';
import { ItemAttributeDomainApiClient } from './clients/domain-api.client';

/**
 * Item Attribute BFF Module
 *
 * 品目仕様属性マスタ BFF モジュール
 * - ItemAttribute（仕様属性）のCRUD + サジェスト
 * - ItemAttributeValue（属性値）のCRUD + サジェスト
 */
@Module({
  controllers: [
    ItemAttributeBffController,
    ItemAttributeValueSuggestBffController,
  ],
  providers: [
    ItemAttributeBffService,
    ItemAttributeMapper,
    ItemAttributeDomainApiClient,
  ],
  exports: [ItemAttributeBffService],
})
export class ItemAttributeBffModule {}
