import { Module } from '@nestjs/common';
import { EmployeeAssignmentBffController } from './controller/employee-assignment.controller';
import { EmployeeAssignmentBffService } from './service/employee-assignment.service';
import { EmployeeAssignmentDomainApiClient } from './clients/domain-api.client';
import { EmployeeAssignmentMapper } from './mappers/assignment.mapper';
import { OrganizationMasterBffModule } from '../organization-master/organization-master.module';

/**
 * Employee Assignment BFF Module
 *
 * 社員所属履歴 BFF モジュール
 * - OrganizationMasterBffModule をインポートして部門名解決に使用
 */
@Module({
  imports: [OrganizationMasterBffModule],
  controllers: [EmployeeAssignmentBffController],
  providers: [
    EmployeeAssignmentBffService,
    EmployeeAssignmentDomainApiClient,
    EmployeeAssignmentMapper,
  ],
  exports: [EmployeeAssignmentBffService],
})
export class EmployeeAssignmentBffModule {}
