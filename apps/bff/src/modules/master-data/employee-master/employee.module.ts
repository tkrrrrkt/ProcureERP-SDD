import { Module } from '@nestjs/common';
import { EmployeeBffController } from './controller/employee.controller';
import { EmployeeBffService } from './service/employee.service';
import { EmployeeDomainApiClient } from './clients/domain-api.client';
import { EmployeeMapper } from './mappers/employee.mapper';

/**
 * Employee BFF Module
 *
 * 社員マスタ BFF モジュール
 */
@Module({
  controllers: [EmployeeBffController],
  providers: [
    EmployeeBffService,
    EmployeeDomainApiClient,
    EmployeeMapper,
  ],
  exports: [EmployeeBffService],
})
export class EmployeeBffModule {}
