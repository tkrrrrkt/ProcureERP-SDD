import { Module } from '@nestjs/common'
import { PrismaModule } from './prisma/prisma.module'
import { TenantConfigModule } from './modules/common/tenant-config/tenant-config.module'
import { EmployeeModule } from './modules/master-data/employee-master/employee.module'
import { OrganizationMasterModule } from './modules/master-data/organization-master/organization-master.module'
import { BankModule } from './modules/master-data/bank-master/bank.module'
import { PayeeBankAccountModule } from './modules/master-data/payee-bank-account/payee-bank-account.module'
import { CompanyBankAccountModule } from './modules/master-data/company-bank-account/company-bank-account.module'
import { BusinessPartnerModule } from './modules/master-data/business-partner/business-partner.module'
import { EmployeeAssignmentModule } from './modules/master-data/employee-assignment/employee-assignment.module'
import { ShipToModule } from './modules/master-data/ship-to/ship-to.module'
import { WarehouseModule } from './modules/master-data/warehouse/warehouse.module'
import { UnitMasterModule } from './modules/master-data/unit-master/unit-master.module'
import { CategorySegmentModule } from './modules/master-data/category-segment/category-segment.module'
import { TaxRateModule } from './modules/master-data/tax-rate/tax-rate.module'
import { TaxCodeModule } from './modules/master-data/tax-code/tax-code.module'
import { ItemAttributeModule } from './modules/master-data/item-attribute/item-attribute.module'

// ProcurERP Domain API Modules
// Modules will be added as features are implemented following CCSDD process

@Module({
  imports: [
    PrismaModule,
    TenantConfigModule,
    // Feature modules:
    EmployeeModule,
    OrganizationMasterModule,
    BankModule,
    PayeeBankAccountModule,
    CompanyBankAccountModule,
    BusinessPartnerModule,
    EmployeeAssignmentModule,
    ShipToModule,
    WarehouseModule,
    UnitMasterModule,
    CategorySegmentModule,
    TaxRateModule,
    TaxCodeModule,
    ItemAttributeModule,
    // ItemMasterModule,
    // PurchaseRequestModule,
    // etc.
  ],
})
export class AppModule {}
