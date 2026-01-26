import { Module } from '@nestjs/common';
import { WarehouseController } from './controller/warehouse.controller';
import { WarehouseService } from './service/warehouse.service';
import { WarehouseRepository } from './repository/warehouse.repository';

/**
 * Warehouse Module
 *
 * 倉庫マスタ Domain API モジュール
 */
@Module({
  controllers: [WarehouseController],
  providers: [WarehouseService, WarehouseRepository],
  exports: [WarehouseService],
})
export class WarehouseModule {}
