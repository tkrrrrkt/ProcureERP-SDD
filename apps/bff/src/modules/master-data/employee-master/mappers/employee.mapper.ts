import { Injectable } from '@nestjs/common';
import {
  EmployeeApiDto,
  ListEmployeesApiResponse,
  CreateEmployeeApiRequest as CreateApiReq,
  UpdateEmployeeApiRequest as UpdateApiReq,
} from '@procure/contracts/api/employee-master';
import {
  EmployeeDto,
  ListEmployeesResponse,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
} from '@procure/contracts/bff/employee-master';

/**
 * Employee Mapper
 *
 * API DTO ↔ BFF DTO の変換
 */
@Injectable()
export class EmployeeMapper {
  /**
   * API DTO → BFF DTO (単体)
   */
  toDto(apiDto: EmployeeApiDto): EmployeeDto {
    return {
      id: apiDto.id,
      employeeCode: apiDto.employeeCode,
      employeeName: apiDto.employeeName,
      employeeKanaName: apiDto.employeeKanaName,
      email: apiDto.email,
      joinDate: apiDto.joinDate,
      retireDate: apiDto.retireDate,
      remarks: apiDto.remarks,
      isActive: apiDto.isActive,
      version: apiDto.version,
      createdAt: apiDto.createdAt,
      updatedAt: apiDto.updatedAt,
      createdBy: apiDto.createdBy,
      updatedBy: apiDto.updatedBy,
    };
  }

  /**
   * API Response → BFF Response (一覧)
   * page/pageSize を追加
   */
  toListResponse(
    apiResponse: ListEmployeesApiResponse,
    page: number,
    pageSize: number,
  ): ListEmployeesResponse {
    const totalPages = Math.ceil(apiResponse.total / pageSize);

    return {
      items: apiResponse.items.map((item) => this.toDto(item)),
      page,
      pageSize,
      total: apiResponse.total,
      totalPages,
    };
  }

  /**
   * BFF Request → API Request (新規登録)
   */
  toCreateApiRequest(request: CreateEmployeeRequest): CreateApiReq {
    return {
      employeeCode: request.employeeCode,
      employeeName: request.employeeName,
      employeeKanaName: request.employeeKanaName,
      email: request.email,
      joinDate: request.joinDate,
      retireDate: request.retireDate,
      remarks: request.remarks,
      isActive: request.isActive,
    };
  }

  /**
   * BFF Request → API Request (更新)
   */
  toUpdateApiRequest(request: UpdateEmployeeRequest): UpdateApiReq {
    return {
      employeeCode: request.employeeCode,
      employeeName: request.employeeName,
      employeeKanaName: request.employeeKanaName,
      email: request.email,
      joinDate: request.joinDate,
      retireDate: request.retireDate,
      remarks: request.remarks,
      isActive: request.isActive,
      version: request.version,
    };
  }
}
