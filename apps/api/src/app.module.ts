import { Module } from '@nestjs/common'
import { PrismaModule } from './prisma/prisma.module'
import { EmployeeModule } from './modules/master-data/employee-master/employee.module'

// ProcurERP Domain API Modules
// Modules will be added as features are implemented following CCSDD process

@Module({
  imports: [
    PrismaModule,
    // Feature modules:
    EmployeeModule,
    // SupplierMasterModule,
    // ItemMasterModule,
    // PurchaseRequestModule,
    // etc.
  ],
})
export class AppModule {}
