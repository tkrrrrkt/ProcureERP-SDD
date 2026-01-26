import { Module } from '@nestjs/common';
import { CompanyBankAccountController } from './controller/company-bank-account.controller';
import { CompanyBankAccountService } from './service/company-bank-account.service';
import { CompanyBankAccountRepository } from './repository/company-bank-account.repository';

/**
 * Company Bank Account Module
 *
 * 自社口座マスタ Domain API モジュール
 */
@Module({
  controllers: [CompanyBankAccountController],
  providers: [CompanyBankAccountService, CompanyBankAccountRepository],
  exports: [CompanyBankAccountService],
})
export class CompanyBankAccountModule {}
