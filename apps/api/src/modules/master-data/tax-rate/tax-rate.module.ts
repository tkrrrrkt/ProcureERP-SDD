import { Module } from '@nestjs/common';
import { TaxRateController } from './controller/tax-rate.controller';
import { TaxRateService } from './service/tax-rate.service';
import { TaxRateRepository } from './repository/tax-rate.repository';

/**
 * Tax Rate Module
 *
 * 税率マスタ Domain API モジュール
 */
@Module({
  controllers: [TaxRateController],
  providers: [TaxRateService, TaxRateRepository],
  exports: [TaxRateService],
})
export class TaxRateModule {}
