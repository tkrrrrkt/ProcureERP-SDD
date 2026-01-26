import { Module } from '@nestjs/common';
import { ShipToBffController } from './controller/ship-to.controller';
import { ShipToBffService } from './service/ship-to.service';
import { ShipToDomainApiClient } from './clients/domain-api.client';
import { ShipToMapper } from './mappers/ship-to.mapper';

/**
 * ShipTo BFF Module
 *
 * 納入先マスタ BFF モジュール
 */
@Module({
  controllers: [ShipToBffController],
  providers: [ShipToBffService, ShipToDomainApiClient, ShipToMapper],
  exports: [ShipToBffService],
})
export class ShipToBffModule {}
