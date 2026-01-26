/**
 * Business Partner BFF Module
 *
 * 取引先マスタ BFF モジュール（Party / SupplierSite / Payee）
 */

import { Module } from '@nestjs/common';

// Controllers
import { PartyBffController } from './controllers/party.controller';
import { PayeeBffController } from './controllers/payee.controller';
import { SupplierSiteBffController } from './controllers/supplier-site.controller';

// Services
import { PartyBffService } from './services/party.service';
import { PayeeBffService } from './services/payee.service';
import { SupplierSiteBffService } from './services/supplier-site.service';

// Domain API Clients
import { PartyDomainApiClient } from './clients/party-domain-api.client';
import { PayeeDomainApiClient } from './clients/payee-domain-api.client';
import { SupplierSiteDomainApiClient } from './clients/supplier-site-domain-api.client';

// Mappers
import { PartyMapper } from './mappers/party.mapper';
import { PayeeMapper } from './mappers/payee.mapper';
import { SupplierSiteMapper } from './mappers/supplier-site.mapper';

@Module({
  controllers: [
    PartyBffController,
    PayeeBffController,
    SupplierSiteBffController,
  ],
  providers: [
    // Services
    PartyBffService,
    PayeeBffService,
    SupplierSiteBffService,
    // Domain API Clients
    PartyDomainApiClient,
    PayeeDomainApiClient,
    SupplierSiteDomainApiClient,
    // Mappers
    PartyMapper,
    PayeeMapper,
    SupplierSiteMapper,
  ],
  exports: [
    PartyBffService,
    PayeeBffService,
    SupplierSiteBffService,
  ],
})
export class BusinessPartnerBffModule {}
