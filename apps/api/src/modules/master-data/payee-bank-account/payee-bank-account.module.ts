import { Module } from '@nestjs/common';
import { PayeeBankAccountController } from './controller/payee-bank-account.controller';
import { PayeeBankAccountService } from './service/payee-bank-account.service';
import { PayeeBankAccountRepository } from './repository/payee-bank-account.repository';

/**
 * Payee Bank Account Module
 *
 * 支払先口座マスタ Domain API モジュール
 */
@Module({
  controllers: [PayeeBankAccountController],
  providers: [PayeeBankAccountService, PayeeBankAccountRepository],
  exports: [PayeeBankAccountService],
})
export class PayeeBankAccountModule {}
