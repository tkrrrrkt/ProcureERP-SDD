import { Module } from '@nestjs/common';
import { TaxRateBffController } from './controller/tax-rate.controller';
import { TaxRateBffService } from './service/tax-rate.service';
import { TaxRateDomainApiClient } from './clients/domain-api.client';
import { TaxRateMapper } from './mappers/tax-rate.mapper';

/**
 * Tax Rate BFF Module
 *
 * 税率マスタ BFF モジュール
 */
@Module({
  controllers: [TaxRateBffController],
  providers: [
    TaxRateBffService,
    TaxRateDomainApiClient,
    TaxRateMapper,
  ],
  exports: [TaxRateBffService],
})
export class TaxRateBffModule {}
