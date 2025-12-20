import { Module } from '@nestjs/common'
import { ProjectMasterBffModule } from './modules/master-data/project-master/project-master.module'
import { EmployeeMasterBffModule } from './modules/master-data/employee-master/employee-master.module'

@Module({
  imports: [
    ProjectMasterBffModule,
    EmployeeMasterBffModule,
  ],
})
export class AppModule {}
