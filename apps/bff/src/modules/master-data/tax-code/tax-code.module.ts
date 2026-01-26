import { Module } from '@nestjs/common';
import { TaxCodeBffController } from './controller/tax-code.controller';
import { TaxCodeBffService } from './service/tax-code.service';
import { TaxCodeDomainApiClient } from './clients/domain-api.client';
import { TaxCodeMapper } from './mappers/tax-code.mapper';

/**
 * Tax Code BFF Module
 *
 * 税コードマスタ BFF モジュール
 */
@Module({
  controllers: [TaxCodeBffController],
  providers: [
    TaxCodeBffService,
    TaxCodeDomainApiClient,
    TaxCodeMapper,
  ],
  exports: [TaxCodeBffService],
})
export class TaxCodeBffModule {}
