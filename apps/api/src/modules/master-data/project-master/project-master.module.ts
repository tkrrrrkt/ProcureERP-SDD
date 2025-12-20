import { Module } from '@nestjs/common'
import { ProjectMasterController } from './project-master.controller'
import { ProjectMasterService } from './project-master.service'
import { ProjectMasterRepository } from './project-master.repository'
import { PrismaModule } from '../../../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [ProjectMasterController],
  providers: [ProjectMasterService, ProjectMasterRepository],
  exports: [ProjectMasterService],
})
export class ProjectMasterModule {}
