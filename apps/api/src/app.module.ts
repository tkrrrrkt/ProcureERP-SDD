import { Module } from '@nestjs/common'
import { PrismaModule } from './prisma/prisma.module'
import { ProjectMasterModule } from './modules/master-data/project-master/project-master.module'
import { EmployeeMasterModule } from './modules/master-data/employee-master/employee-master.module'

@Module({
  imports: [
    PrismaModule,
    ProjectMasterModule,
    EmployeeMasterModule,
  ],
})
export class AppModule {}
