import { Module } from '@nestjs/common';
import { BankController } from './controller/bank.controller';
import { BranchController } from './controller/branch.controller';
import { BankService } from './service/bank.service';
import { BranchService } from './service/branch.service';
import { BankRepository } from './repository/bank.repository';
import { BranchRepository } from './repository/branch.repository';

/**
 * Bank Module
 *
 * 銀行・支店マスタ Domain API モジュール
 */
@Module({
  controllers: [BankController, BranchController],
  providers: [BankService, BranchService, BankRepository, BranchRepository],
  exports: [BankService, BranchService],
})
export class BankModule {}
