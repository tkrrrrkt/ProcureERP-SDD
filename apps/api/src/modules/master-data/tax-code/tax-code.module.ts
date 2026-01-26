import { Module } from '@nestjs/common';
import { TaxCodeController } from './controller/tax-code.controller';
import { TaxCodeService } from './service/tax-code.service';
import { TaxCodeRepository } from './repository/tax-code.repository';
import { TaxBusinessCategoryRepository } from './repository/tax-business-category.repository';

/**
 * Tax Code Module
 *
 * 税コードマスタ Domain API モジュール
 */
@Module({
  controllers: [TaxCodeController],
  providers: [TaxCodeService, TaxCodeRepository, TaxBusinessCategoryRepository],
  exports: [TaxCodeService],
})
export class TaxCodeModule {}
