import { Module } from '@nestjs/common';
import { EmployeeAssignmentController } from './controller/employee-assignment.controller';
import { EmployeeAssignmentService } from './service/employee-assignment.service';
import { EmployeeAssignmentRepository } from './repository/employee-assignment.repository';

/**
 * Employee Assignment Module
 *
 * 社員所属履歴 Domain API モジュール
 */
@Module({
  controllers: [EmployeeAssignmentController],
  providers: [EmployeeAssignmentService, EmployeeAssignmentRepository],
  exports: [EmployeeAssignmentService],
})
export class EmployeeAssignmentModule {}
