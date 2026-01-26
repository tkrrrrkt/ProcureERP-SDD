import { Module } from '@nestjs/common';
import { OrganizationMasterBffController } from './controller/organization-master.controller';
import { OrganizationMasterBffService } from './service/organization-master.service';
import { OrganizationMasterDomainApiClient } from './clients/domain-api.client';
import { OrganizationMasterMapper } from './mappers/organization-master.mapper';

/**
 * Organization Master BFF Module
 *
 * 組織マスタ BFF モジュール
 * - バージョン管理（履歴一覧、as-of検索）
 * - 部門管理（ツリー表示、ドラッグ＆ドロップ移動）
 */
@Module({
  controllers: [OrganizationMasterBffController],
  providers: [
    OrganizationMasterBffService,
    OrganizationMasterDomainApiClient,
    OrganizationMasterMapper,
  ],
  exports: [OrganizationMasterBffService, OrganizationMasterDomainApiClient],
})
export class OrganizationMasterBffModule {}
