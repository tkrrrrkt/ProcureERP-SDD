import { Module } from '@nestjs/common';
import { UnitMasterBffController } from './controller/unit-master.controller';
import { UnitMasterBffService } from './service/unit-master.service';
import { UnitMasterDomainApiClient } from './clients/domain-api.client';
import { UnitMasterMapper } from './mappers/unit-master.mapper';

/**
 * Unit Master BFF Module
 *
 * 単位マスタ BFF モジュール
 * - 13エンドポイント（groups 6 + uoms 7）
 * - Domain API クライアント
 * - DTO マッパー
 */
@Module({
  controllers: [UnitMasterBffController],
  providers: [UnitMasterBffService, UnitMasterDomainApiClient, UnitMasterMapper],
  exports: [UnitMasterBffService],
})
export class UnitMasterBffModule {}
