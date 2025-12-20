import { Module } from '@nestjs/common'
import { ProjectMasterBffController } from './project-master.controller'
import { ProjectMasterBffService, DOMAIN_API_CLIENT } from './project-master.service'
import { DomainApiHttpClient } from './domain-api.client'

@Module({
  controllers: [ProjectMasterBffController],
  providers: [
    ProjectMasterBffService,
    {
      provide: DOMAIN_API_CLIENT,
      useClass: DomainApiHttpClient,
    },
  ],
  exports: [ProjectMasterBffService],
})
export class ProjectMasterBffModule {}
