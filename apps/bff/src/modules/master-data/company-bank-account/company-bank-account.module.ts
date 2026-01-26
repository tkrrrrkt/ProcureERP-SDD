import { Module } from '@nestjs/common';
import { CompanyBankAccountBffController } from './controller/company-bank-account.controller';
import { CompanyBankAccountBffService } from './service/company-bank-account.service';
import { CompanyBankAccountDomainApiClient } from './clients/domain-api.client';
import { CompanyBankAccountMapper } from './mappers/company-bank-account.mapper';

/**
 * Company Bank Account BFF Module
 *
 * 自社口座 BFF モジュール
 */
@Module({
  controllers: [CompanyBankAccountBffController],
  providers: [
    CompanyBankAccountBffService,
    CompanyBankAccountDomainApiClient,
    CompanyBankAccountMapper,
  ],
  exports: [CompanyBankAccountBffService],
})
export class CompanyBankAccountBffModule {}
