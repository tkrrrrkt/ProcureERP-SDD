import { Module } from '@nestjs/common'
import { EmployeeMasterBffController } from './employee-master.controller'
import { EmployeeMasterBffService, DOMAIN_API_CLIENT } from './employee-master.service'
import { DomainApiHttpClient } from './domain-api.client'

@Module({
  controllers: [EmployeeMasterBffController],
  providers: [
    EmployeeMasterBffService,
    {
      provide: DOMAIN_API_CLIENT,
      useClass: DomainApiHttpClient,
    },
  ],
  exports: [EmployeeMasterBffService],
})
export class EmployeeMasterBffModule {}
