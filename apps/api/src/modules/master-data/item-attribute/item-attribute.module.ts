import { Module } from '@nestjs/common';
import { ItemAttributeController } from './controller/item-attribute.controller';
import {
  ItemAttributeValueController,
  ItemAttributeValueSuggestController,
} from './controller/item-attribute-value.controller';
import { ItemAttributeService } from './service/item-attribute.service';
import { ItemAttributeValueService } from './service/item-attribute-value.service';
import { ItemAttributeRepository } from './repository/item-attribute.repository';
import { ItemAttributeValueRepository } from './repository/item-attribute-value.repository';

/**
 * Item Attribute Module
 *
 * 品目仕様属性マスタ Domain API モジュール
 * - ItemAttribute（仕様属性）のCRUD + サジェスト
 * - ItemAttributeValue（属性値）のCRUD + サジェスト
 */
@Module({
  controllers: [
    ItemAttributeController,
    ItemAttributeValueController,
    ItemAttributeValueSuggestController,
  ],
  providers: [
    ItemAttributeService,
    ItemAttributeValueService,
    ItemAttributeRepository,
    ItemAttributeValueRepository,
  ],
  exports: [
    ItemAttributeService,
    ItemAttributeValueService,
    ItemAttributeRepository,
    ItemAttributeValueRepository,
  ],
})
export class ItemAttributeModule {}
