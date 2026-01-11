import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { EmployeeRepository } from '../repository/employee.repository';
import {
  ListEmployeesApiRequest,
  ListEmployeesApiResponse,
  GetEmployeeApiResponse,
  CreateEmployeeApiRequest,
  CreateEmployeeApiResponse,
  UpdateEmployeeApiRequest,
  UpdateEmployeeApiResponse,
  EmployeeApiDto,
} from '@procure/contracts/api/employee-master';
import {
  EmployeeMasterErrorCode,
  EmployeeMasterErrorHttpStatus,
  EmployeeMasterErrorMessage,
} from '@procure/contracts/api/errors';
import { Employee } from '@prisma/client';

/**
 * Employee Service
 *
 * ビジネスルールの正本
 * - 社員コード一意性チェック
 * - メールアドレス形式チェック
 * - 日付整合性チェック
 * - 楽観ロック
 * - 監査ログ記録
 */
@Injectable()
export class EmployeeService {
  constructor(private readonly employeeRepository: EmployeeRepository) {}

  /**
   * 社員一覧取得
   */
  async listEmployees(
    tenantId: string,
    request: ListEmployeesApiRequest,
  ): Promise<ListEmployeesApiResponse> {
    const { offset, limit, sortBy, sortOrder, keyword } = request;

    const result = await this.employeeRepository.findMany({
      tenantId,
      offset,
      limit,
      sortBy,
      sortOrder,
      keyword,
    });

    return {
      items: result.items.map(this.toApiDto),
      total: result.total,
    };
  }

  /**
   * 社員詳細取得
   */
  async getEmployee(
    tenantId: string,
    employeeId: string,
  ): Promise<GetEmployeeApiResponse> {
    const employee = await this.employeeRepository.findOne({
      tenantId,
      employeeId,
    });

    if (!employee) {
      throw new HttpException(
        {
          code: EmployeeMasterErrorCode.EMPLOYEE_NOT_FOUND,
          message: EmployeeMasterErrorMessage.EMPLOYEE_NOT_FOUND,
        },
        EmployeeMasterErrorHttpStatus.EMPLOYEE_NOT_FOUND,
      );
    }

    return {
      employee: this.toApiDto(employee),
    };
  }

  /**
   * 社員新規登録
   */
  async createEmployee(
    tenantId: string,
    userId: string,
    request: CreateEmployeeApiRequest,
  ): Promise<CreateEmployeeApiResponse> {
    // バリデーション: メールアドレス形式
    if (request.email && !this.isValidEmail(request.email)) {
      throw new HttpException(
        {
          code: EmployeeMasterErrorCode.INVALID_EMAIL_FORMAT,
          message: EmployeeMasterErrorMessage.INVALID_EMAIL_FORMAT,
        },
        EmployeeMasterErrorHttpStatus.INVALID_EMAIL_FORMAT,
      );
    }

    // バリデーション: 日付整合性
    if (request.retireDate) {
      const joinDate = new Date(request.joinDate);
      const retireDate = new Date(request.retireDate);
      if (retireDate < joinDate) {
        throw new HttpException(
          {
            code: EmployeeMasterErrorCode.INVALID_DATE_RANGE,
            message: EmployeeMasterErrorMessage.INVALID_DATE_RANGE,
          },
          EmployeeMasterErrorHttpStatus.INVALID_DATE_RANGE,
        );
      }
    }

    // バリデーション: 社員コード重複チェック
    const isDuplicate = await this.employeeRepository.checkEmployeeCodeDuplicate({
      tenantId,
      employeeCode: request.employeeCode,
    });

    if (isDuplicate) {
      throw new HttpException(
        {
          code: EmployeeMasterErrorCode.EMPLOYEE_CODE_DUPLICATE,
          message: EmployeeMasterErrorMessage.EMPLOYEE_CODE_DUPLICATE,
        },
        EmployeeMasterErrorHttpStatus.EMPLOYEE_CODE_DUPLICATE,
      );
    }

    // 登録
    const employee = await this.employeeRepository.create({
      tenantId,
      createdBy: userId, // 監査列
      data: {
        employeeCode: request.employeeCode,
        employeeName: request.employeeName,
        employeeKanaName: request.employeeKanaName,
        email: request.email,
        joinDate: new Date(request.joinDate),
        retireDate: request.retireDate ? new Date(request.retireDate) : undefined,
        remarks: request.remarks,
        isActive: request.isActive ?? true,
      },
    });

    // TODO: 監査ログ記録
    // await this.auditLogService.log({
    //   action: 'CREATE',
    //   resource: 'employee',
    //   resourceId: employee.id,
    //   tenantId,
    //   userId,
    //   details: request,
    // });

    return {
      employee: this.toApiDto(employee),
    };
  }

  /**
   * 社員更新
   */
  async updateEmployee(
    tenantId: string,
    userId: string,
    employeeId: string,
    request: UpdateEmployeeApiRequest,
  ): Promise<UpdateEmployeeApiResponse> {
    // 既存データ取得
    const existingEmployee = await this.employeeRepository.findOne({
      tenantId,
      employeeId,
    });

    if (!existingEmployee) {
      throw new HttpException(
        {
          code: EmployeeMasterErrorCode.EMPLOYEE_NOT_FOUND,
          message: EmployeeMasterErrorMessage.EMPLOYEE_NOT_FOUND,
        },
        EmployeeMasterErrorHttpStatus.EMPLOYEE_NOT_FOUND,
      );
    }

    // バリデーション: メールアドレス形式
    if (request.email && !this.isValidEmail(request.email)) {
      throw new HttpException(
        {
          code: EmployeeMasterErrorCode.INVALID_EMAIL_FORMAT,
          message: EmployeeMasterErrorMessage.INVALID_EMAIL_FORMAT,
        },
        EmployeeMasterErrorHttpStatus.INVALID_EMAIL_FORMAT,
      );
    }

    // バリデーション: 日付整合性
    if (request.retireDate) {
      const joinDate = new Date(request.joinDate);
      const retireDate = new Date(request.retireDate);
      if (retireDate < joinDate) {
        throw new HttpException(
          {
            code: EmployeeMasterErrorCode.INVALID_DATE_RANGE,
            message: EmployeeMasterErrorMessage.INVALID_DATE_RANGE,
          },
          EmployeeMasterErrorHttpStatus.INVALID_DATE_RANGE,
        );
      }
    }

    // バリデーション: 社員コード変更がある場合のみ重複チェック
    if (request.employeeCode !== existingEmployee.employeeCode) {
      const isDuplicate = await this.employeeRepository.checkEmployeeCodeDuplicate({
        tenantId,
        employeeCode: request.employeeCode,
        excludeEmployeeId: employeeId,
      });

      if (isDuplicate) {
        throw new HttpException(
          {
            code: EmployeeMasterErrorCode.EMPLOYEE_CODE_DUPLICATE,
            message: EmployeeMasterErrorMessage.EMPLOYEE_CODE_DUPLICATE,
          },
          EmployeeMasterErrorHttpStatus.EMPLOYEE_CODE_DUPLICATE,
        );
      }
    }

    // 更新（楽観ロック）
    const updatedEmployee = await this.employeeRepository.update({
      tenantId,
      employeeId,
      version: request.version,
      updatedBy: userId, // 監査列
      data: {
        employeeCode: request.employeeCode,
        employeeName: request.employeeName,
        employeeKanaName: request.employeeKanaName,
        email: request.email,
        joinDate: new Date(request.joinDate),
        retireDate: request.retireDate ? new Date(request.retireDate) : undefined,
        remarks: request.remarks,
        isActive: request.isActive,
      },
    });

    // 楽観ロック競合
    if (!updatedEmployee) {
      throw new HttpException(
        {
          code: EmployeeMasterErrorCode.CONCURRENT_UPDATE,
          message: EmployeeMasterErrorMessage.CONCURRENT_UPDATE,
        },
        EmployeeMasterErrorHttpStatus.CONCURRENT_UPDATE,
      );
    }

    // TODO: 監査ログ記録
    // await this.auditLogService.log({
    //   action: 'UPDATE',
    //   resource: 'employee',
    //   resourceId: employeeId,
    //   tenantId,
    //   userId,
    //   details: { before: existingEmployee, after: request },
    // });

    return {
      employee: this.toApiDto(updatedEmployee),
    };
  }

  /**
   * Employee -> EmployeeApiDto 変換
   */
  private toApiDto(employee: Employee): EmployeeApiDto {
    return {
      id: employee.id,
      employeeCode: employee.employeeCode,
      employeeName: employee.employeeName,
      employeeKanaName: employee.employeeKanaName,
      email: employee.email,
      joinDate: employee.joinDate.toISOString(),
      retireDate: employee.retireDate?.toISOString() ?? null,
      remarks: employee.remarks,
      isActive: employee.isActive,
      version: employee.version,
      createdAt: employee.createdAt.toISOString(),
      updatedAt: employee.updatedAt.toISOString(),
      createdBy: employee.createdByLoginAccountId,
      updatedBy: employee.updatedByLoginAccountId,
    };
  }

  /**
   * メールアドレス形式チェック
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
