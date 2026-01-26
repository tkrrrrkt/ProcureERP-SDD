import { Module } from '@nestjs/common';
import { BankBffController } from './controller/bank.controller';
import { BranchBffController } from './controller/branch.controller';
import { BankBffService } from './service/bank.service';
import { BranchBffService } from './service/branch.service';
import { BankDomainApiClient } from './clients/domain-api.client';
import { BankMasterMapper } from './mappers/bank-master.mapper';

/**
 * Bank Master BFF Module
 *
 * 銀行・支店マスタ BFF モジュール
 */
@Module({
  controllers: [BankBffController, BranchBffController],
  providers: [
    BankBffService,
    BranchBffService,
    BankDomainApiClient,
    BankMasterMapper,
  ],
  exports: [BankBffService, BranchBffService],
})
export class BankMasterBffModule {}
