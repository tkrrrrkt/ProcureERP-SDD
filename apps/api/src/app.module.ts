import { Module } from '@nestjs/common'
import { PrismaModule } from './prisma/prisma.module'

// ProcurERP Domain API Modules
// Modules will be added as features are implemented following CCSDD process

@Module({
  imports: [
    PrismaModule,
    // Feature modules will be added here:
    // SupplierMasterModule,
    // ItemMasterModule,
    // PurchaseRequestModule,
    // etc.
  ],
})
export class AppModule {}
