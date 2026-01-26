import { Module } from '@nestjs/common';
import { PayeeBankAccountBffController } from './controller/payee-bank-account.controller';
import { PayeeBankAccountBffService } from './service/payee-bank-account.service';
import { PayeeBankAccountDomainApiClient } from './clients/domain-api.client';
import { PayeeBankAccountMapper } from './mappers/payee-bank-account.mapper';

/**
 * Payee Bank Account BFF Module
 *
 * 支払先口座 BFF モジュール
 */
@Module({
  controllers: [PayeeBankAccountBffController],
  providers: [
    PayeeBankAccountBffService,
    PayeeBankAccountDomainApiClient,
    PayeeBankAccountMapper,
  ],
  exports: [PayeeBankAccountBffService],
})
export class PayeeBankAccountBffModule {}
