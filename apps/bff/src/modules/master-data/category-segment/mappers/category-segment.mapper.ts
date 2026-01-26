import { Injectable } from '@nestjs/common';
import {
  CategoryAxisApiDto,
  ListCategoryAxesApiResponse,
  SegmentApiDto,
  ListSegmentsApiResponse,
  SegmentAssignmentApiDto,
  ListSegmentAssignmentsByEntityApiResponse,
  SegmentTreeNode as ApiSegmentTreeNode,
  ListSegmentsTreeApiResponse,
  EntitySegmentInfo as ApiEntitySegmentInfo,
  GetEntitySegmentsApiResponse,
  CreateCategoryAxisApiRequest,
  UpdateCategoryAxisApiRequest,
  CreateSegmentApiRequest,
  UpdateSegmentApiRequest,
  UpsertSegmentAssignmentApiRequest,
} from '@procure/contracts/api/category-segment';
import {
  CategoryAxisDto,
  ListCategoryAxesResponse,
  SegmentDto,
  ListSegmentsResponse,
  SegmentAssignmentDto,
  ListSegmentAssignmentsResponse,
  SegmentTreeNode,
  ListSegmentsTreeResponse,
  EntitySegmentInfo,
  GetEntitySegmentsResponse,
  CreateCategoryAxisRequest,
  UpdateCategoryAxisRequest,
  CreateSegmentRequest,
  UpdateSegmentRequest,
  UpsertSegmentAssignmentRequest,
} from '@procure/contracts/bff/category-segment';

/**
 * Category-Segment Mapper
 *
 * API DTO ↔ BFF DTO の変換
 */
@Injectable()
export class CategorySegmentMapper {
  // =============================================================================
  // CategoryAxis Mappers
  // =============================================================================

  /**
   * API DTO → BFF DTO (CategoryAxis)
   */
  toCategoryAxisDto(apiDto: CategoryAxisApiDto): CategoryAxisDto {
    return {
      id: apiDto.id,
      axisCode: apiDto.axisCode,
      axisName: apiDto.axisName,
      targetEntityKind: apiDto.targetEntityKind,
      supportsHierarchy: apiDto.supportsHierarchy,
      displayOrder: apiDto.displayOrder,
      description: apiDto.description,
      isActive: apiDto.isActive,
      version: apiDto.version,
      createdAt: apiDto.createdAt,
      updatedAt: apiDto.updatedAt,
      createdBy: apiDto.createdBy,
      updatedBy: apiDto.updatedBy,
    };
  }

  /**
   * API Response → BFF Response (CategoryAxis 一覧)
   * page/pageSize/totalPages を追加
   */
  toCategoryAxisListResponse(
    apiResponse: ListCategoryAxesApiResponse,
    page: number,
    pageSize: number,
  ): ListCategoryAxesResponse {
    const totalPages = Math.ceil(apiResponse.total / pageSize);

    return {
      items: apiResponse.items.map((item) => this.toCategoryAxisDto(item)),
      page,
      pageSize,
      total: apiResponse.total,
      totalPages,
    };
  }

  /**
   * BFF Request → API Request (CategoryAxis 新規登録)
   */
  toCreateCategoryAxisApiRequest(
    request: CreateCategoryAxisRequest,
  ): CreateCategoryAxisApiRequest {
    return {
      axisCode: request.axisCode,
      axisName: request.axisName,
      targetEntityKind: request.targetEntityKind,
      supportsHierarchy: request.supportsHierarchy,
      displayOrder: request.displayOrder,
      description: request.description,
    };
  }

  /**
   * BFF Request → API Request (CategoryAxis 更新)
   */
  toUpdateCategoryAxisApiRequest(
    request: UpdateCategoryAxisRequest,
  ): UpdateCategoryAxisApiRequest {
    return {
      axisName: request.axisName,
      displayOrder: request.displayOrder,
      description: request.description,
      isActive: request.isActive,
      version: request.version,
    };
  }

  // =============================================================================
  // Segment Mappers
  // =============================================================================

  /**
   * API DTO → BFF DTO (Segment)
   */
  toSegmentDto(apiDto: SegmentApiDto): SegmentDto {
    return {
      id: apiDto.id,
      categoryAxisId: apiDto.categoryAxisId,
      segmentCode: apiDto.segmentCode,
      segmentName: apiDto.segmentName,
      parentSegmentId: apiDto.parentSegmentId,
      hierarchyLevel: apiDto.hierarchyLevel,
      hierarchyPath: apiDto.hierarchyPath,
      displayOrder: apiDto.displayOrder,
      description: apiDto.description,
      isActive: apiDto.isActive,
      version: apiDto.version,
      createdAt: apiDto.createdAt,
      updatedAt: apiDto.updatedAt,
      createdBy: apiDto.createdBy,
      updatedBy: apiDto.updatedBy,
    };
  }

  /**
   * API Response → BFF Response (Segment 一覧・フラット形式)
   */
  toSegmentListResponse(
    apiResponse: ListSegmentsApiResponse,
    page: number,
    pageSize: number,
  ): ListSegmentsResponse {
    const totalPages = Math.ceil(apiResponse.total / pageSize);

    return {
      items: apiResponse.items.map((item) => this.toSegmentDto(item)),
      page,
      pageSize,
      total: apiResponse.total,
      totalPages,
    };
  }

  /**
   * API TreeNode → BFF TreeNode (再帰)
   */
  toSegmentTreeNode(apiNode: ApiSegmentTreeNode): SegmentTreeNode {
    return {
      id: apiNode.id,
      segmentCode: apiNode.segmentCode,
      segmentName: apiNode.segmentName,
      hierarchyLevel: apiNode.hierarchyLevel,
      children: apiNode.children.map((child) => this.toSegmentTreeNode(child)),
    };
  }

  /**
   * API Response → BFF Response (Segment ツリー形式)
   */
  toSegmentTreeResponse(
    apiResponse: ListSegmentsTreeApiResponse,
  ): ListSegmentsTreeResponse {
    return {
      tree: apiResponse.tree.map((node) => this.toSegmentTreeNode(node)),
      total: apiResponse.total,
    };
  }

  /**
   * BFF Request → API Request (Segment 新規登録)
   */
  toCreateSegmentApiRequest(
    request: CreateSegmentRequest,
  ): CreateSegmentApiRequest {
    return {
      categoryAxisId: request.categoryAxisId,
      segmentCode: request.segmentCode,
      segmentName: request.segmentName,
      parentSegmentId: request.parentSegmentId,
      displayOrder: request.displayOrder,
      description: request.description,
    };
  }

  /**
   * BFF Request → API Request (Segment 更新)
   */
  toUpdateSegmentApiRequest(
    request: UpdateSegmentRequest,
  ): UpdateSegmentApiRequest {
    return {
      segmentName: request.segmentName,
      parentSegmentId: request.parentSegmentId,
      displayOrder: request.displayOrder,
      description: request.description,
      isActive: request.isActive,
      version: request.version,
    };
  }

  // =============================================================================
  // SegmentAssignment Mappers
  // =============================================================================

  /**
   * API DTO → BFF DTO (SegmentAssignment)
   */
  toSegmentAssignmentDto(apiDto: SegmentAssignmentApiDto): SegmentAssignmentDto {
    return {
      id: apiDto.id,
      entityKind: apiDto.entityKind,
      entityId: apiDto.entityId,
      categoryAxisId: apiDto.categoryAxisId,
      segmentId: apiDto.segmentId,
      isActive: apiDto.isActive,
      version: apiDto.version,
      createdAt: apiDto.createdAt,
      updatedAt: apiDto.updatedAt,
      createdBy: apiDto.createdBy,
      updatedBy: apiDto.updatedBy,
    };
  }

  /**
   * API Response → BFF Response (SegmentAssignment 一覧)
   */
  toSegmentAssignmentListResponse(
    apiResponse: ListSegmentAssignmentsByEntityApiResponse,
  ): ListSegmentAssignmentsResponse {
    return {
      items: apiResponse.items.map((item) => this.toSegmentAssignmentDto(item)),
    };
  }

  /**
   * BFF Request → API Request (SegmentAssignment Upsert)
   */
  toUpsertSegmentAssignmentApiRequest(
    request: UpsertSegmentAssignmentRequest,
  ): UpsertSegmentAssignmentApiRequest {
    return {
      entityKind: request.entityKind,
      entityId: request.entityId,
      categoryAxisId: request.categoryAxisId,
      segmentId: request.segmentId,
    };
  }

  // =============================================================================
  // EntitySegmentInfo Mappers
  // =============================================================================

  /**
   * API EntitySegmentInfo → BFF EntitySegmentInfo
   */
  toEntitySegmentInfo(apiInfo: ApiEntitySegmentInfo): EntitySegmentInfo {
    return {
      categoryAxisId: apiInfo.categoryAxisId,
      categoryAxisName: apiInfo.categoryAxisName,
      segmentId: apiInfo.segmentId,
      segmentCode: apiInfo.segmentCode,
      segmentName: apiInfo.segmentName,
    };
  }

  /**
   * API Response → BFF Response (Entity Segments)
   */
  toGetEntitySegmentsResponse(
    apiResponse: GetEntitySegmentsApiResponse,
  ): GetEntitySegmentsResponse {
    return {
      segments: apiResponse.segments.map((info) => this.toEntitySegmentInfo(info)),
    };
  }
}
