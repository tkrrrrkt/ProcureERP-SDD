import { Injectable } from '@nestjs/common';
import { EmployeeAssignmentDomainApiClient } from '../clients/domain-api.client';
import { OrganizationMasterDomainApiClient } from '../../organization-master/clients/domain-api.client';
import { EmployeeAssignmentMapper, DepartmentInfo } from '../mappers/assignment.mapper';
import {
  ListAssignmentsResponse,
  CreateAssignmentRequest,
  CreateAssignmentResponse,
  UpdateAssignmentRequest,
  UpdateAssignmentResponse,
  DeleteAssignmentResponse,
  ListActiveDepartmentsResponse,
  DepartmentOptionDto,
  EmployeeAssignmentDto,
} from '@procure/contracts/bff/employee-assignment';
import { EmployeeAssignmentApiDto } from '@procure/contracts/api/employee-assignment';

/**
 * Employee Assignment BFF Service
 *
 * UI入力の正規化、Domain API呼び出し、DTO変換
 * - 部門名解決（stable_id → departmentCode, departmentName）
 * - エラーは Pass-through（Domain API のエラーをそのまま返す）
 */
@Injectable()
export class EmployeeAssignmentBffService {
  constructor(
    private readonly assignmentApiClient: EmployeeAssignmentDomainApiClient,
    private readonly orgApiClient: OrganizationMasterDomainApiClient,
    private readonly mapper: EmployeeAssignmentMapper,
  ) {}

  /**
   * 所属一覧取得
   */
  async listAssignments(
    tenantId: string,
    userId: string,
    employeeId: string,
  ): Promise<ListAssignmentsResponse> {
    // Domain API 呼び出し（ソートは固定: effectiveDate desc）
    const apiResponse = await this.assignmentApiClient.listAssignments(
      tenantId,
      userId,
      employeeId,
      { sortBy: 'effectiveDate', sortOrder: 'desc' },
    );

    // 部門名解決マップを構築
    const departmentMap = await this.buildDepartmentMap(tenantId, userId);

    // BFF DTO に変換（部門名解決）
    const items: EmployeeAssignmentDto[] = apiResponse.items.map((item) =>
      this.mapper.toDto(item, this.resolveDepartmentInfo(item.departmentStableId, departmentMap)),
    );

    return { items };
  }

  /**
   * 所属登録
   */
  async createAssignment(
    tenantId: string,
    userId: string,
    employeeId: string,
    request: CreateAssignmentRequest,
  ): Promise<CreateAssignmentResponse> {
    const apiRequest = this.mapper.toCreateApiRequest(request);

    const apiResponse = await this.assignmentApiClient.createAssignment(
      tenantId,
      userId,
      employeeId,
      apiRequest,
    );

    // 部門名解決
    const departmentMap = await this.buildDepartmentMap(tenantId, userId);
    const departmentInfo = this.resolveDepartmentInfo(
      apiResponse.assignment.departmentStableId,
      departmentMap,
    );

    return {
      assignment: this.mapper.toDto(apiResponse.assignment, departmentInfo),
    };
  }

  /**
   * 所属更新
   */
  async updateAssignment(
    tenantId: string,
    userId: string,
    employeeId: string,
    assignmentId: string,
    request: UpdateAssignmentRequest,
  ): Promise<UpdateAssignmentResponse> {
    const apiRequest = this.mapper.toUpdateApiRequest(request);

    const apiResponse = await this.assignmentApiClient.updateAssignment(
      tenantId,
      userId,
      employeeId,
      assignmentId,
      apiRequest,
    );

    // 部門名解決
    const departmentMap = await this.buildDepartmentMap(tenantId, userId);
    const departmentInfo = this.resolveDepartmentInfo(
      apiResponse.assignment.departmentStableId,
      departmentMap,
    );

    return {
      assignment: this.mapper.toDto(apiResponse.assignment, departmentInfo),
    };
  }

  /**
   * 所属削除
   */
  async deleteAssignment(
    tenantId: string,
    userId: string,
    employeeId: string,
    assignmentId: string,
    version: number,
  ): Promise<DeleteAssignmentResponse> {
    const apiResponse = await this.assignmentApiClient.deleteAssignment(
      tenantId,
      userId,
      employeeId,
      assignmentId,
      { version },
    );

    return { success: apiResponse.success };
  }

  /**
   * 有効部門一覧取得
   * 現在有効版の部門ツリーを返す
   */
  async listActiveDepartments(
    tenantId: string,
    userId: string,
  ): Promise<ListActiveDepartmentsResponse> {
    try {
      // 現在有効なバージョンを取得
      const today = new Date().toISOString().split('T')[0];
      const versionResponse = await this.orgApiClient.findEffectiveAsOf(tenantId, userId, {
        asOfDate: today,
      });

      if (!versionResponse.version) {
        return { items: [] };
      }

      // 部門一覧を取得
      const departmentsResponse = await this.orgApiClient.listDepartments(
        tenantId,
        userId,
        versionResponse.version.id,
        { isActive: true },
      );

      // id → stableId のマップを作成（parentId を parentStableId に変換するため）
      const idToStableId = new Map<string, string>();
      for (const dept of departmentsResponse.items) {
        idToStableId.set(dept.id, dept.stableId);
      }

      // DepartmentOptionDto に変換
      const items: DepartmentOptionDto[] = departmentsResponse.items.map((dept) => ({
        stableId: dept.stableId,
        departmentCode: dept.departmentCode,
        departmentName: dept.departmentName,
        hierarchyPath: dept.hierarchyPath ?? null,
        hierarchyLevel: dept.hierarchyLevel,
        parentStableId: dept.parentId ? (idToStableId.get(dept.parentId) ?? null) : null,
      }));

      return { items };
    } catch {
      // エラー時は空配列を返す（部門選択UIで対応）
      return { items: [] };
    }
  }

  /**
   * 部門名解決マップを構築
   * stableId → { departmentCode, departmentName }
   */
  private async buildDepartmentMap(
    tenantId: string,
    userId: string,
  ): Promise<Map<string, DepartmentInfo>> {
    const map = new Map<string, DepartmentInfo>();

    try {
      // 現在有効なバージョンを取得
      const today = new Date().toISOString().split('T')[0];
      const versionResponse = await this.orgApiClient.findEffectiveAsOf(tenantId, userId, {
        asOfDate: today,
      });

      if (!versionResponse.version) {
        return map;
      }

      // 部門一覧を取得
      const departmentsResponse = await this.orgApiClient.listDepartments(
        tenantId,
        userId,
        versionResponse.version.id,
        {},
      );

      // マップに登録
      for (const dept of departmentsResponse.items) {
        map.set(dept.stableId, {
          departmentCode: dept.departmentCode,
          departmentName: dept.departmentName,
        });
      }
    } catch {
      // エラー時は空マップを返す（フォールバック処理で対応）
    }

    return map;
  }

  /**
   * 部門情報を解決
   * マップにない場合はフォールバック値を返す
   */
  private resolveDepartmentInfo(
    stableId: string,
    departmentMap: Map<string, DepartmentInfo>,
  ): DepartmentInfo {
    const info = departmentMap.get(stableId);

    if (info) {
      return info;
    }

    // フォールバック: stable_id を表示（組織改編で部門が見つからない場合）
    return {
      departmentCode: '-',
      departmentName: `（部門情報なし: ${stableId.substring(0, 8)}...）`,
    };
  }
}
