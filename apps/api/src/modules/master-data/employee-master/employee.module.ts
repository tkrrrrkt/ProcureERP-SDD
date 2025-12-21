import { Module } from '@nestjs/common';
import { EmployeeController } from './controller/employee.controller';
import { EmployeeService } from './service/employee.service';
import { EmployeeRepository } from './repository/employee.repository';

/**
 * Employee Module
 *
 * 社員マスタ Domain API モジュール
 */
@Module({
  controllers: [EmployeeController],
  providers: [EmployeeService, EmployeeRepository],
  exports: [EmployeeService],
})
export class EmployeeModule {}
