import { Module } from '@nestjs/common';
import { UomGroupController } from './controller/uom-group.controller';
import { UomController } from './controller/uom.controller';
import { UomGroupService } from './service/uom-group.service';
import { UomService } from './service/uom.service';
import { UomGroupRepository } from './repository/uom-group.repository';
import { UomRepository } from './repository/uom.repository';

/**
 * Unit Master Module
 *
 * 単位マスタ Domain API モジュール
 * - UomGroup（単位グループ）のCRUD
 * - Uom（単位）のCRUD + サジェスト
 */
@Module({
  controllers: [UomGroupController, UomController],
  providers: [
    UomGroupService,
    UomService,
    UomGroupRepository,
    UomRepository,
  ],
  exports: [UomGroupService, UomService, UomRepository],
})
export class UnitMasterModule {}
