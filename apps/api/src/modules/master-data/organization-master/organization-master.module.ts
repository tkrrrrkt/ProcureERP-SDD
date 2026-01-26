import { Module } from '@nestjs/common';
import { OrganizationMasterController } from './controller/organization-master.controller';
import { OrganizationVersionService } from './service/organization-version.service';
import { DepartmentService } from './service/department.service';
import { VersionCopyService } from './service/version-copy.service';
import { OrganizationVersionRepository } from './repository/organization-version.repository';
import { DepartmentRepository } from './repository/department.repository';
import { PrismaModule } from '../../../prisma/prisma.module';

/**
 * Organization Master Module
 *
 * 組織マスタ管理モジュール
 * - バージョン管理（履歴管理、as-of検索）
 * - 部門管理（階層構造、ドラッグ＆ドロップ移動）
 */
@Module({
  imports: [PrismaModule],
  controllers: [OrganizationMasterController],
  providers: [
    // Services
    OrganizationVersionService,
    DepartmentService,
    VersionCopyService,
    // Repositories
    OrganizationVersionRepository,
    DepartmentRepository,
  ],
  exports: [
    OrganizationVersionService,
    DepartmentService,
    VersionCopyService,
  ],
})
export class OrganizationMasterModule {}
