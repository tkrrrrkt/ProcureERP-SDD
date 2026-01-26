import { Module } from '@nestjs/common';
import { ShipToController } from './controller/ship-to.controller';
import { ShipToService } from './service/ship-to.service';
import { ShipToRepository } from './repository/ship-to.repository';

/**
 * ShipTo Module
 *
 * 納入先マスタ Domain API モジュール
 */
@Module({
  controllers: [ShipToController],
  providers: [ShipToService, ShipToRepository],
  exports: [ShipToService],
})
export class ShipToModule {}
