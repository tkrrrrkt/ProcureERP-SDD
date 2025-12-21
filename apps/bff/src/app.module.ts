import { Module } from '@nestjs/common'
import { EmployeeBffModule } from './modules/master-data/employee-master/employee.module'

// ProcurERP BFF Modules
// Modules will be added as features are implemented following CCSDD process

@Module({
  imports: [
    // Feature modules:
    EmployeeBffModule,
    // SupplierMasterBffModule,
    // ItemMasterBffModule,
    // PurchaseRequestBffModule,
    // etc.
  ],
})
export class AppModule {}
