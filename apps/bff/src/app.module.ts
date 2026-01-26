import { Module } from '@nestjs/common'
import { EmployeeBffModule } from './modules/master-data/employee-master/employee.module'
import { OrganizationMasterBffModule } from './modules/master-data/organization-master/organization-master.module'
import { BankMasterBffModule } from './modules/master-data/bank-master/bank-master.module'
import { PayeeBankAccountBffModule } from './modules/master-data/payee-bank-account/payee-bank-account.module'
import { CompanyBankAccountBffModule } from './modules/master-data/company-bank-account/company-bank-account.module'
import { BusinessPartnerBffModule } from './modules/master-data/business-partner/business-partner.module'
import { EmployeeAssignmentBffModule } from './modules/master-data/employee-assignment/employee-assignment.module'
import { ShipToBffModule } from './modules/master-data/ship-to/ship-to.module'
import { WarehouseBffModule } from './modules/master-data/warehouse/warehouse.module'
import { UnitMasterBffModule } from './modules/master-data/unit-master/unit-master.module'
import { CategorySegmentBffModule } from './modules/master-data/category-segment/category-segment-bff.module'
import { TaxRateBffModule } from './modules/master-data/tax-rate/tax-rate.module'
import { TaxCodeBffModule } from './modules/master-data/tax-code/tax-code.module'
import { ItemAttributeBffModule } from './modules/master-data/item-attribute/item-attribute.module'

// ProcurERP BFF Modules
// Modules will be added as features are implemented following CCSDD process

@Module({
  imports: [
    // Feature modules:
    EmployeeBffModule,
    OrganizationMasterBffModule,
    BankMasterBffModule,
    PayeeBankAccountBffModule,
    CompanyBankAccountBffModule,
    BusinessPartnerBffModule,
    EmployeeAssignmentBffModule,
    ShipToBffModule,
    WarehouseBffModule,
    UnitMasterBffModule,
    CategorySegmentBffModule,
    TaxRateBffModule,
    TaxCodeBffModule,
    ItemAttributeBffModule,
    // ItemMasterBffModule,
    // PurchaseRequestBffModule,
    // etc.
  ],
})
export class AppModule {}
