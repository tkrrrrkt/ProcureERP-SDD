import { Injectable } from '@nestjs/common';
import {
  OrganizationVersionApiDto,
  DepartmentApiDto,
  ListVersionsApiResponse,
  ListDepartmentsApiResponse,
  CreateVersionApiRequest as CreateVersionApiReq,
  CopyVersionApiRequest as CopyVersionApiReq,
  UpdateVersionApiRequest as UpdateVersionApiReq,
  CreateDepartmentApiRequest as CreateDepartmentApiReq,
  UpdateDepartmentApiRequest as UpdateDepartmentApiReq,
} from '@procure/contracts/api/organization-master';
import {
  VersionSummaryDto,
  VersionDetailDto,
  DepartmentTreeNodeDto,
  DepartmentDetailDto,
  ListVersionsResponse,
  ListDepartmentsTreeResponse,
  CreateVersionRequest,
  CopyVersionRequest,
  UpdateVersionRequest,
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
} from '@procure/contracts/bff/organization-master';

/**
 * Organization Master Mapper
 *
 * API DTO ↔ BFF DTO の変換
 * - VersionSummaryDto: 一覧表示用（isCurrentlyEffective, departmentCount 計算）
 * - VersionDetailDto: 詳細表示用
 * - DepartmentTreeNodeDto: ツリー表示用（children 構築）
 * - DepartmentDetailDto: 詳細パネル表示用（parentDepartmentName 結合）
 */
@Injectable()
export class OrganizationMasterMapper {
  // ===========================================================================
  // Version Mappers
  // ===========================================================================

  /**
   * API DTO → BFF VersionSummaryDto
   */
  toVersionSummary(
    apiDto: OrganizationVersionApiDto,
    departmentCount: number,
  ): VersionSummaryDto {
    const now = new Date();
    const effectiveDate = new Date(apiDto.effectiveDate);
    const expiryDate = apiDto.expiryDate ? new Date(apiDto.expiryDate) : null;

    // 現在有効かどうかを計算
    const isCurrentlyEffective =
      effectiveDate <= now && (expiryDate === null || now < expiryDate);

    return {
      id: apiDto.id,
      versionCode: apiDto.versionCode,
      versionName: apiDto.versionName,
      effectiveDate: apiDto.effectiveDate,
      expiryDate: apiDto.expiryDate,
      isCurrentlyEffective,
      departmentCount,
    };
  }

  /**
   * API DTO → BFF VersionDetailDto
   */
  toVersionDetail(apiDto: OrganizationVersionApiDto): VersionDetailDto {
    const now = new Date();
    const effectiveDate = new Date(apiDto.effectiveDate);
    const expiryDate = apiDto.expiryDate ? new Date(apiDto.expiryDate) : null;

    const isCurrentlyEffective =
      effectiveDate <= now && (expiryDate === null || now < expiryDate);

    return {
      id: apiDto.id,
      versionCode: apiDto.versionCode,
      versionName: apiDto.versionName,
      effectiveDate: apiDto.effectiveDate,
      expiryDate: apiDto.expiryDate,
      baseVersionId: apiDto.baseVersionId,
      description: apiDto.description,
      isCurrentlyEffective,
      createdAt: apiDto.createdAt,
      updatedAt: apiDto.updatedAt,
    };
  }

  /**
   * API Response → BFF ListVersionsResponse
   * 各バージョンの departmentCount は後続処理で取得
   */
  toListVersionsResponse(
    apiResponse: ListVersionsApiResponse,
    departmentCounts: Map<string, number>,
  ): ListVersionsResponse {
    return {
      items: apiResponse.items.map((v) =>
        this.toVersionSummary(v, departmentCounts.get(v.id) ?? 0),
      ),
    };
  }

  /**
   * BFF Request → API Request (バージョン新規作成)
   */
  toCreateVersionApiRequest(request: CreateVersionRequest): CreateVersionApiReq {
    return {
      versionCode: request.versionCode,
      versionName: request.versionName,
      effectiveDate: request.effectiveDate,
      expiryDate: request.expiryDate,
      description: request.description,
    };
  }

  /**
   * BFF Request → API Request (バージョンコピー)
   */
  toCopyVersionApiRequest(request: CopyVersionRequest): CopyVersionApiReq {
    return {
      versionCode: request.versionCode,
      versionName: request.versionName,
      effectiveDate: request.effectiveDate,
      expiryDate: request.expiryDate,
      description: request.description,
    };
  }

  /**
   * BFF Request → API Request (バージョン更新)
   */
  toUpdateVersionApiRequest(request: UpdateVersionRequest): UpdateVersionApiReq {
    return {
      versionCode: request.versionCode,
      versionName: request.versionName,
      effectiveDate: request.effectiveDate,
      expiryDate: request.expiryDate,
      description: request.description,
    };
  }

  // ===========================================================================
  // Department Mappers
  // ===========================================================================

  /**
   * API DTO → BFF DepartmentDetailDto
   */
  toDepartmentDetail(
    apiDto: DepartmentApiDto,
    parentDepartmentName: string | null,
  ): DepartmentDetailDto {
    return {
      id: apiDto.id,
      versionId: apiDto.versionId,
      stableId: apiDto.stableId,
      departmentCode: apiDto.departmentCode,
      departmentName: apiDto.departmentName,
      departmentNameShort: apiDto.departmentNameShort,
      parentId: apiDto.parentId,
      parentDepartmentName,
      sortOrder: apiDto.sortOrder,
      hierarchyLevel: apiDto.hierarchyLevel,
      hierarchyPath: apiDto.hierarchyPath,
      isActive: apiDto.isActive,
      postalCode: apiDto.postalCode,
      addressLine1: apiDto.addressLine1,
      addressLine2: apiDto.addressLine2,
      phoneNumber: apiDto.phoneNumber,
      description: apiDto.description,
      createdAt: apiDto.createdAt,
      updatedAt: apiDto.updatedAt,
    };
  }

  /**
   * API Response → BFF ListDepartmentsTreeResponse
   * フラットリストをツリー構造に変換
   */
  toListDepartmentsTreeResponse(
    apiResponse: ListDepartmentsApiResponse,
    versionId: string,
    versionCode: string,
  ): ListDepartmentsTreeResponse {
    const nodes = this.buildDepartmentTree(apiResponse.items);

    return {
      versionId,
      versionCode,
      nodes,
    };
  }

  /**
   * フラットリスト → ツリー構造変換
   */
  private buildDepartmentTree(departments: DepartmentApiDto[]): DepartmentTreeNodeDto[] {
    // ID -> 部門マップ作成
    const deptMap = new Map<string, DepartmentApiDto>();
    for (const dept of departments) {
      deptMap.set(dept.id, dept);
    }

    // ID -> TreeNode マップ作成
    const nodeMap = new Map<string, DepartmentTreeNodeDto>();
    for (const dept of departments) {
      nodeMap.set(dept.id, {
        id: dept.id,
        departmentCode: dept.departmentCode,
        departmentName: dept.departmentName,
        departmentNameShort: dept.departmentNameShort,
        isActive: dept.isActive,
        hierarchyLevel: dept.hierarchyLevel,
        children: [],
      });
    }

    // ツリー構築
    const rootNodes: DepartmentTreeNodeDto[] = [];

    for (const dept of departments) {
      const node = nodeMap.get(dept.id)!;

      if (dept.parentId === null) {
        // ルートノード
        rootNodes.push(node);
      } else {
        // 親ノードに追加
        const parentNode = nodeMap.get(dept.parentId);
        if (parentNode) {
          parentNode.children.push(node);
        } else {
          // 親がフィルタリングで除外されている場合はルートに
          rootNodes.push(node);
        }
      }
    }

    // sortOrder でソート
    this.sortTreeNodes(rootNodes, departments);

    return rootNodes;
  }

  /**
   * ツリーノードを sortOrder でソート（再帰的）
   */
  private sortTreeNodes(nodes: DepartmentTreeNodeDto[], allDepts: DepartmentApiDto[]): void {
    const getSortOrder = (nodeId: string) => {
      const dept = allDepts.find((d) => d.id === nodeId);
      return dept?.sortOrder ?? 0;
    };

    nodes.sort((a, b) => getSortOrder(a.id) - getSortOrder(b.id));

    for (const node of nodes) {
      if (node.children.length > 0) {
        this.sortTreeNodes(node.children, allDepts);
      }
    }
  }

  /**
   * BFF Request → API Request (部門新規作成)
   */
  toCreateDepartmentApiRequest(request: CreateDepartmentRequest): CreateDepartmentApiReq {
    return {
      departmentCode: request.departmentCode,
      departmentName: request.departmentName,
      departmentNameShort: request.departmentNameShort,
      parentId: request.parentId,
      sortOrder: request.sortOrder,
      postalCode: request.postalCode,
      addressLine1: request.addressLine1,
      addressLine2: request.addressLine2,
      phoneNumber: request.phoneNumber,
      description: request.description,
    };
  }

  /**
   * BFF Request → API Request (部門更新)
   */
  toUpdateDepartmentApiRequest(request: UpdateDepartmentRequest): UpdateDepartmentApiReq {
    return {
      departmentCode: request.departmentCode,
      departmentName: request.departmentName,
      departmentNameShort: request.departmentNameShort,
      parentId: request.parentId,
      sortOrder: request.sortOrder,
      postalCode: request.postalCode,
      addressLine1: request.addressLine1,
      addressLine2: request.addressLine2,
      phoneNumber: request.phoneNumber,
      description: request.description,
    };
  }
}
