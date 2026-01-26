/**
 * Business Partner Module
 *
 * 取引先マスタ関連モジュール（Party / SupplierSite / Payee）
 */

import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../prisma/prisma.module';
import { TenantConfigModule } from '../../common/tenant-config/tenant-config.module';

// Party
import { PartyRepository } from './repositories/party.repository';
import { PartyService } from './services/party.service';
import { PartyController } from './controllers/party.controller';

// Payee
import { PayeeRepository } from './repositories/payee.repository';
import { PayeeService } from './services/payee.service';
import { PayeeController } from './controllers/payee.controller';

// SupplierSite
import { SupplierSiteRepository } from './repositories/supplier-site.repository';
import { SupplierSiteService } from './services/supplier-site.service';
import { SupplierSiteController } from './controllers/supplier-site.controller';

@Module({
  imports: [
    PrismaModule,
    TenantConfigModule,
  ],
  controllers: [
    PartyController,
    PayeeController,
    SupplierSiteController,
  ],
  providers: [
    // Party
    PartyRepository,
    PartyService,
    // Payee
    PayeeRepository,
    PayeeService,
    // SupplierSite
    SupplierSiteRepository,
    SupplierSiteService,
  ],
  exports: [
    // Services
    PartyService,
    PayeeService,
    SupplierSiteService,
    // Repositories (EntityValidatorService 用)
    PartyRepository,
    SupplierSiteRepository,
  ],
})
export class BusinessPartnerModule {}
