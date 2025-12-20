import { Module } from '@nestjs/common'
import { EmployeeMasterController } from './employee-master.controller'
import { EmployeeMasterService } from './employee-master.service'
import { EmployeeMasterRepository } from './employee-master.repository'
import { PrismaModule } from '../../../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [EmployeeMasterController],
  providers: [EmployeeMasterService, EmployeeMasterRepository],
  exports: [EmployeeMasterService],
})
export class EmployeeMasterModule {}
