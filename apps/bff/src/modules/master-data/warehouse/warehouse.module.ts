import { Module } from '@nestjs/common';
import { WarehouseBffController } from './controller/warehouse.controller';
import { WarehouseBffService } from './service/warehouse.service';
import { WarehouseDomainApiClient } from './clients/domain-api.client';
import { WarehouseMapper } from './mappers/warehouse.mapper';

/**
 * Warehouse BFF Module
 *
 * 倉庫マスタ BFF モジュール
 */
@Module({
  controllers: [WarehouseBffController],
  providers: [WarehouseBffService, WarehouseDomainApiClient, WarehouseMapper],
  exports: [WarehouseBffService],
})
export class WarehouseBffModule {}
