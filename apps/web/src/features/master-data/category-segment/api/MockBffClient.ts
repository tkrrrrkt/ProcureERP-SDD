/**
 * Mock BFF Client for Category-Segment Master
 * Provides realistic mock data and simulates API behavior
 */

import type {
  BffClient,
  CategoryAxisDto,
  SegmentDto,
  SegmentTreeNode,
  SegmentAssignmentDto,
  EntitySegmentInfo,
  ListCategoryAxesRequest,
  ListCategoryAxesResponse,
  GetCategoryAxisResponse,
  CreateCategoryAxisRequest,
  CreateCategoryAxisResponse,
  UpdateCategoryAxisRequest,
  UpdateCategoryAxisResponse,
  ListSegmentsRequest,
  ListSegmentsResponse,
  ListSegmentsTreeResponse,
  GetSegmentResponse,
  CreateSegmentRequest,
  CreateSegmentResponse,
  UpdateSegmentRequest,
  UpdateSegmentResponse,
  ListSegmentAssignmentsRequest,
  ListSegmentAssignmentsResponse,
  UpsertSegmentAssignmentRequest,
  UpsertSegmentAssignmentResponse,
  GetEntitySegmentsResponse,
  TargetEntityKind,
} from './BffClient';

// =============================================================================
// Mock Data: CategoryAxis
// =============================================================================

const initialMockCategoryAxes: CategoryAxisDto[] = [
  {
    id: 'axis-001',
    axisCode: 'PROD-CAT',
    axisName: '商品カテゴリ',
    targetEntityKind: 'ITEM',
    supportsHierarchy: true,
    displayOrder: 1,
    description: '商品の大分類・中分類・小分類',
    isActive: true,
    version: 1,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'axis-002',
    axisCode: 'SUPP-TYPE',
    axisName: '取引先区分',
    targetEntityKind: 'PARTY',
    supportsHierarchy: false,
    displayOrder: 2,
    description: '取引先の業種区分（製造業、卸売業など）',
    isActive: true,
    version: 1,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'axis-003',
    axisCode: 'SITE-AREA',
    axisName: '納入先エリア',
    targetEntityKind: 'SUPPLIER_SITE',
    supportsHierarchy: false,
    displayOrder: 3,
    description: '納入先サイトの地域区分',
    isActive: true,
    version: 1,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'axis-004',
    axisCode: 'COST-CTR',
    axisName: 'コストセンター',
    targetEntityKind: 'ITEM',
    supportsHierarchy: true,
    displayOrder: 4,
    description: '原価管理用のコストセンター分類',
    isActive: true,
    version: 1,
    createdAt: '2024-02-01T00:00:00.000Z',
    updatedAt: '2024-02-01T00:00:00.000Z',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'axis-005',
    axisCode: 'OLD-AXIS',
    axisName: '旧分類（廃止）',
    targetEntityKind: 'ITEM',
    supportsHierarchy: false,
    displayOrder: 99,
    description: '移行前の分類体系（廃止済み）',
    isActive: false,
    version: 2,
    createdAt: '2020-01-01T00:00:00.000Z',
    updatedAt: '2024-01-15T00:00:00.000Z',
    createdBy: 'system',
    updatedBy: 'admin',
  },
];

// =============================================================================
// Mock Data: Segment (with hierarchy for PROD-CAT)
// =============================================================================

const initialMockSegments: SegmentDto[] = [
  // PROD-CAT 階層（商品カテゴリ）
  {
    id: 'seg-001',
    categoryAxisId: 'axis-001',
    segmentCode: 'ELEC',
    segmentName: '電子部品',
    parentSegmentId: null,
    hierarchyLevel: 1,
    hierarchyPath: '/seg-001',
    displayOrder: 1,
    description: '電子部品全般',
    isActive: true,
    version: 1,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'seg-002',
    categoryAxisId: 'axis-001',
    segmentCode: 'ELEC-IC',
    segmentName: 'IC・半導体',
    parentSegmentId: 'seg-001',
    hierarchyLevel: 2,
    hierarchyPath: '/seg-001/seg-002',
    displayOrder: 1,
    description: 'IC、半導体部品',
    isActive: true,
    version: 1,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'seg-003',
    categoryAxisId: 'axis-001',
    segmentCode: 'ELEC-CAP',
    segmentName: 'コンデンサ',
    parentSegmentId: 'seg-001',
    hierarchyLevel: 2,
    hierarchyPath: '/seg-001/seg-003',
    displayOrder: 2,
    description: 'コンデンサ類',
    isActive: true,
    version: 1,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'seg-004',
    categoryAxisId: 'axis-001',
    segmentCode: 'ELEC-RES',
    segmentName: '抵抗器',
    parentSegmentId: 'seg-001',
    hierarchyLevel: 2,
    hierarchyPath: '/seg-001/seg-004',
    displayOrder: 3,
    description: '抵抗器類',
    isActive: true,
    version: 1,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'seg-005',
    categoryAxisId: 'axis-001',
    segmentCode: 'MECH',
    segmentName: '機械部品',
    parentSegmentId: null,
    hierarchyLevel: 1,
    hierarchyPath: '/seg-005',
    displayOrder: 2,
    description: '機械部品全般',
    isActive: true,
    version: 1,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'seg-006',
    categoryAxisId: 'axis-001',
    segmentCode: 'MECH-BRG',
    segmentName: 'ベアリング',
    parentSegmentId: 'seg-005',
    hierarchyLevel: 2,
    hierarchyPath: '/seg-005/seg-006',
    displayOrder: 1,
    description: 'ベアリング類',
    isActive: true,
    version: 1,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    createdBy: 'system',
    updatedBy: 'system',
  },

  // SUPP-TYPE セグメント（取引先区分）
  {
    id: 'seg-101',
    categoryAxisId: 'axis-002',
    segmentCode: 'MFG',
    segmentName: '製造業',
    parentSegmentId: null,
    hierarchyLevel: 1,
    hierarchyPath: null,
    displayOrder: 1,
    description: null,
    isActive: true,
    version: 1,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'seg-102',
    categoryAxisId: 'axis-002',
    segmentCode: 'WHOLE',
    segmentName: '卸売業',
    parentSegmentId: null,
    hierarchyLevel: 1,
    hierarchyPath: null,
    displayOrder: 2,
    description: null,
    isActive: true,
    version: 1,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'seg-103',
    categoryAxisId: 'axis-002',
    segmentCode: 'SVC',
    segmentName: 'サービス業',
    parentSegmentId: null,
    hierarchyLevel: 1,
    hierarchyPath: null,
    displayOrder: 3,
    description: null,
    isActive: true,
    version: 1,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    createdBy: 'system',
    updatedBy: 'system',
  },

  // SITE-AREA セグメント（納入先エリア）
  {
    id: 'seg-201',
    categoryAxisId: 'axis-003',
    segmentCode: 'KANTO',
    segmentName: '関東エリア',
    parentSegmentId: null,
    hierarchyLevel: 1,
    hierarchyPath: null,
    displayOrder: 1,
    description: null,
    isActive: true,
    version: 1,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'seg-202',
    categoryAxisId: 'axis-003',
    segmentCode: 'KANSAI',
    segmentName: '関西エリア',
    parentSegmentId: null,
    hierarchyLevel: 1,
    hierarchyPath: null,
    displayOrder: 2,
    description: null,
    isActive: true,
    version: 1,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    createdBy: 'system',
    updatedBy: 'system',
  },
];

// =============================================================================
// Mock Data: SegmentAssignment
// =============================================================================

const initialMockAssignments: SegmentAssignmentDto[] = [
  {
    id: 'asgn-001',
    entityKind: 'PARTY',
    entityId: 'party-001',
    categoryAxisId: 'axis-002',
    segmentId: 'seg-101',
    isActive: true,
    version: 1,
    createdAt: '2024-01-15T00:00:00.000Z',
    updatedAt: '2024-01-15T00:00:00.000Z',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'asgn-002',
    entityKind: 'SUPPLIER_SITE',
    entityId: 'site-001',
    categoryAxisId: 'axis-003',
    segmentId: 'seg-201',
    isActive: true,
    version: 1,
    createdAt: '2024-01-15T00:00:00.000Z',
    updatedAt: '2024-01-15T00:00:00.000Z',
    createdBy: 'system',
    updatedBy: 'system',
  },
];

// =============================================================================
// Mock BFF Client Implementation
// =============================================================================

export class MockBffClient implements BffClient {
  private categoryAxes: CategoryAxisDto[] = [...initialMockCategoryAxes];
  private segments: SegmentDto[] = [...initialMockSegments];
  private assignments: SegmentAssignmentDto[] = [...initialMockAssignments];

  /**
   * Simulate API delay
   */
  private async delay(ms = 500): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Generate new UUID
   */
  private generateId(): string {
    return `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // ===========================================================================
  // CategoryAxis Methods
  // ===========================================================================

  async listCategoryAxes(request: ListCategoryAxesRequest): Promise<ListCategoryAxesResponse> {
    await this.delay(400);

    let filtered = [...this.categoryAxes];

    // Filter by keyword
    if (request.keyword) {
      const keyword = request.keyword.toLowerCase();
      filtered = filtered.filter(
        (axis) =>
          axis.axisCode.toLowerCase().includes(keyword) ||
          axis.axisName.toLowerCase().includes(keyword)
      );
    }

    // Filter by targetEntityKind
    if (request.targetEntityKind) {
      filtered = filtered.filter((axis) => axis.targetEntityKind === request.targetEntityKind);
    }

    // Filter by isActive
    if (request.isActive !== undefined) {
      filtered = filtered.filter((axis) => axis.isActive === request.isActive);
    }

    // Sort
    const sortBy = request.sortBy || 'displayOrder';
    const sortOrder = request.sortOrder || 'asc';
    filtered.sort((a, b) => {
      const aValue = a[sortBy as keyof CategoryAxisDto];
      const bValue = b[sortBy as keyof CategoryAxisDto];
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    // Pagination
    const page = request.page ?? 1;
    const pageSize = request.pageSize ?? 50;
    const total = filtered.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);

    return { items, page, pageSize, total, totalPages };
  }

  async getCategoryAxis(id: string): Promise<GetCategoryAxisResponse> {
    await this.delay(300);

    const categoryAxis = this.categoryAxes.find((axis) => axis.id === id);
    if (!categoryAxis) {
      throw new Error('カテゴリ軸が見つかりません (CATEGORY_AXIS_NOT_FOUND)');
    }

    return { categoryAxis };
  }

  async createCategoryAxis(request: CreateCategoryAxisRequest): Promise<CreateCategoryAxisResponse> {
    await this.delay(600);

    // Validate duplicate code
    const duplicate = this.categoryAxes.find(
      (axis) => axis.axisCode.toUpperCase() === request.axisCode.toUpperCase()
    );
    if (duplicate) {
      throw new Error('軸コードが重複しています (AXIS_CODE_DUPLICATE)');
    }

    // Validate hierarchy support (only ITEM can have hierarchy)
    if (request.supportsHierarchy && request.targetEntityKind !== 'ITEM') {
      throw new Error('階層構造は品目マスタのみ対応しています (HIERARCHY_NOT_SUPPORTED)');
    }

    const now = new Date().toISOString();
    const categoryAxis: CategoryAxisDto = {
      id: this.generateId(),
      axisCode: request.axisCode.toUpperCase(),
      axisName: request.axisName,
      targetEntityKind: request.targetEntityKind,
      supportsHierarchy: request.supportsHierarchy ?? false,
      displayOrder: request.displayOrder ?? 999,
      description: request.description ?? null,
      isActive: true,
      version: 1,
      createdAt: now,
      updatedAt: now,
      createdBy: 'demo-user',
      updatedBy: 'demo-user',
    };

    this.categoryAxes.push(categoryAxis);
    return { categoryAxis };
  }

  async updateCategoryAxis(
    id: string,
    request: UpdateCategoryAxisRequest
  ): Promise<UpdateCategoryAxisResponse> {
    await this.delay(600);

    const index = this.categoryAxes.findIndex((axis) => axis.id === id);
    if (index === -1) {
      throw new Error('カテゴリ軸が見つかりません (CATEGORY_AXIS_NOT_FOUND)');
    }

    const existing = this.categoryAxes[index];

    // Optimistic lock check
    if (existing.version !== request.version) {
      throw new Error('他のユーザーによって更新されています (CONCURRENT_UPDATE)');
    }

    const categoryAxis: CategoryAxisDto = {
      ...existing,
      axisName: request.axisName,
      displayOrder: request.displayOrder ?? existing.displayOrder,
      description: request.description ?? existing.description,
      isActive: request.isActive ?? existing.isActive,
      version: existing.version + 1,
      updatedAt: new Date().toISOString(),
      updatedBy: 'demo-user',
    };

    this.categoryAxes[index] = categoryAxis;
    return { categoryAxis };
  }

  // ===========================================================================
  // Segment Methods
  // ===========================================================================

  async listSegments(request: ListSegmentsRequest): Promise<ListSegmentsResponse> {
    await this.delay(400);

    let filtered = this.segments.filter((seg) => seg.categoryAxisId === request.categoryAxisId);

    // Filter by keyword
    if (request.keyword) {
      const keyword = request.keyword.toLowerCase();
      filtered = filtered.filter(
        (seg) =>
          seg.segmentCode.toLowerCase().includes(keyword) ||
          seg.segmentName.toLowerCase().includes(keyword)
      );
    }

    // Filter by isActive
    if (request.isActive !== undefined) {
      filtered = filtered.filter((seg) => seg.isActive === request.isActive);
    }

    // Sort
    const sortBy = request.sortBy || 'displayOrder';
    const sortOrder = request.sortOrder || 'asc';
    filtered.sort((a, b) => {
      const aValue = a[sortBy as keyof SegmentDto];
      const bValue = b[sortBy as keyof SegmentDto];
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    // Pagination
    const page = request.page ?? 1;
    const pageSize = request.pageSize ?? 50;
    const total = filtered.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);

    return { items, page, pageSize, total, totalPages };
  }

  async listSegmentsTree(categoryAxisId: string): Promise<ListSegmentsTreeResponse> {
    await this.delay(400);

    const axisSegments = this.segments.filter(
      (seg) => seg.categoryAxisId === categoryAxisId && seg.isActive
    );

    // Build tree structure
    const buildTree = (parentId: string | null): SegmentTreeNode[] => {
      return axisSegments
        .filter((seg) => seg.parentSegmentId === parentId)
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map((seg) => ({
          id: seg.id,
          segmentCode: seg.segmentCode,
          segmentName: seg.segmentName,
          hierarchyLevel: seg.hierarchyLevel,
          children: buildTree(seg.id),
        }));
    };

    const tree = buildTree(null);
    return { tree, total: axisSegments.length };
  }

  async getSegment(id: string): Promise<GetSegmentResponse> {
    await this.delay(300);

    const segment = this.segments.find((seg) => seg.id === id);
    if (!segment) {
      throw new Error('セグメントが見つかりません (SEGMENT_NOT_FOUND)');
    }

    return { segment };
  }

  async createSegment(request: CreateSegmentRequest): Promise<CreateSegmentResponse> {
    await this.delay(600);

    // Validate axis exists
    const axis = this.categoryAxes.find((a) => a.id === request.categoryAxisId);
    if (!axis) {
      throw new Error('カテゴリ軸が見つかりません (CATEGORY_AXIS_NOT_FOUND)');
    }

    // Validate duplicate code within axis
    const duplicate = this.segments.find(
      (seg) =>
        seg.categoryAxisId === request.categoryAxisId &&
        seg.segmentCode.toUpperCase() === request.segmentCode.toUpperCase()
    );
    if (duplicate) {
      throw new Error('セグメントコードが重複しています (SEGMENT_CODE_DUPLICATE)');
    }

    // Validate parent segment
    let hierarchyLevel = 1;
    let hierarchyPath: string | null = null;

    if (request.parentSegmentId) {
      if (!axis.supportsHierarchy) {
        throw new Error('この軸は階層構造をサポートしていません (HIERARCHY_NOT_SUPPORTED)');
      }

      const parent = this.segments.find((seg) => seg.id === request.parentSegmentId);
      if (!parent) {
        throw new Error('親セグメントが見つかりません (PARENT_SEGMENT_NOT_FOUND)');
      }
      if (parent.categoryAxisId !== request.categoryAxisId) {
        throw new Error('親セグメントは同一軸内である必要があります (PARENT_NOT_IN_SAME_AXIS)');
      }

      hierarchyLevel = parent.hierarchyLevel + 1;
      if (hierarchyLevel > 5) {
        throw new Error('階層の深さは5階層までです (HIERARCHY_DEPTH_EXCEEDED)');
      }
    }

    const now = new Date().toISOString();
    const segmentId = this.generateId();

    // Calculate hierarchy path after getting ID
    if (request.parentSegmentId) {
      const parent = this.segments.find((seg) => seg.id === request.parentSegmentId);
      hierarchyPath = `${parent!.hierarchyPath}/${segmentId}`;
    } else if (axis.supportsHierarchy) {
      hierarchyPath = `/${segmentId}`;
    }

    const segment: SegmentDto = {
      id: segmentId,
      categoryAxisId: request.categoryAxisId,
      segmentCode: request.segmentCode.toUpperCase(),
      segmentName: request.segmentName,
      parentSegmentId: request.parentSegmentId ?? null,
      hierarchyLevel,
      hierarchyPath,
      displayOrder: request.displayOrder ?? 999,
      description: request.description ?? null,
      isActive: true,
      version: 1,
      createdAt: now,
      updatedAt: now,
      createdBy: 'demo-user',
      updatedBy: 'demo-user',
    };

    this.segments.push(segment);
    return { segment };
  }

  async updateSegment(id: string, request: UpdateSegmentRequest): Promise<UpdateSegmentResponse> {
    await this.delay(600);

    const index = this.segments.findIndex((seg) => seg.id === id);
    if (index === -1) {
      throw new Error('セグメントが見つかりません (SEGMENT_NOT_FOUND)');
    }

    const existing = this.segments[index];

    // Optimistic lock check
    if (existing.version !== request.version) {
      throw new Error('他のユーザーによって更新されています (CONCURRENT_UPDATE)');
    }

    // Validate parent change
    let hierarchyLevel = existing.hierarchyLevel;
    let hierarchyPath = existing.hierarchyPath;

    if (request.parentSegmentId !== undefined && request.parentSegmentId !== existing.parentSegmentId) {
      const axis = this.categoryAxes.find((a) => a.id === existing.categoryAxisId);

      if (request.parentSegmentId === null) {
        // Remove parent
        hierarchyLevel = 1;
        hierarchyPath = axis?.supportsHierarchy ? `/${id}` : null;
      } else {
        // Validate new parent
        if (!axis?.supportsHierarchy) {
          throw new Error('この軸は階層構造をサポートしていません (HIERARCHY_NOT_SUPPORTED)');
        }

        // Check for circular reference
        if (request.parentSegmentId === id) {
          throw new Error('自分自身を親にすることはできません (CIRCULAR_REFERENCE)');
        }

        const parent = this.segments.find((seg) => seg.id === request.parentSegmentId);
        if (!parent) {
          throw new Error('親セグメントが見つかりません (PARENT_SEGMENT_NOT_FOUND)');
        }
        if (parent.categoryAxisId !== existing.categoryAxisId) {
          throw new Error('親セグメントは同一軸内である必要があります (PARENT_NOT_IN_SAME_AXIS)');
        }

        // Check if new parent is a descendant of this segment
        if (parent.hierarchyPath?.includes(`/${id}/`)) {
          throw new Error('循環参照が発生します (CIRCULAR_REFERENCE)');
        }

        hierarchyLevel = parent.hierarchyLevel + 1;
        if (hierarchyLevel > 5) {
          throw new Error('階層の深さは5階層までです (HIERARCHY_DEPTH_EXCEEDED)');
        }

        hierarchyPath = `${parent.hierarchyPath}/${id}`;
      }
    }

    const segment: SegmentDto = {
      ...existing,
      segmentName: request.segmentName,
      parentSegmentId: request.parentSegmentId ?? existing.parentSegmentId,
      hierarchyLevel,
      hierarchyPath,
      displayOrder: request.displayOrder ?? existing.displayOrder,
      description: request.description ?? existing.description,
      isActive: request.isActive ?? existing.isActive,
      version: existing.version + 1,
      updatedAt: new Date().toISOString(),
      updatedBy: 'demo-user',
    };

    this.segments[index] = segment;
    return { segment };
  }

  // ===========================================================================
  // SegmentAssignment Methods
  // ===========================================================================

  async listSegmentAssignments(
    request: ListSegmentAssignmentsRequest
  ): Promise<ListSegmentAssignmentsResponse> {
    await this.delay(300);

    const items = this.assignments.filter(
      (a) =>
        a.entityKind === request.entityKind &&
        a.entityId === request.entityId &&
        a.isActive
    );

    return { items };
  }

  async upsertSegmentAssignment(
    request: UpsertSegmentAssignmentRequest
  ): Promise<UpsertSegmentAssignmentResponse> {
    await this.delay(500);

    // Validate axis exists and matches entity kind
    const axis = this.categoryAxes.find((a) => a.id === request.categoryAxisId);
    if (!axis) {
      throw new Error('カテゴリ軸が見つかりません (CATEGORY_AXIS_NOT_FOUND)');
    }
    if (axis.targetEntityKind !== request.entityKind) {
      throw new Error('エンティティ種別と軸の対象が一致しません (INVALID_ENTITY_KIND)');
    }

    // Validate segment exists and belongs to axis
    const segment = this.segments.find((s) => s.id === request.segmentId);
    if (!segment) {
      throw new Error('セグメントが見つかりません (SEGMENT_NOT_FOUND)');
    }
    if (segment.categoryAxisId !== request.categoryAxisId) {
      throw new Error('セグメントが指定された軸に属していません (SEGMENT_NOT_IN_AXIS)');
    }

    // Find existing assignment for this entity + axis (1軸1値)
    const existingIndex = this.assignments.findIndex(
      (a) =>
        a.entityKind === request.entityKind &&
        a.entityId === request.entityId &&
        a.categoryAxisId === request.categoryAxisId &&
        a.isActive
    );

    const now = new Date().toISOString();

    if (existingIndex >= 0) {
      // Update existing
      const existing = this.assignments[existingIndex];
      const assignment: SegmentAssignmentDto = {
        ...existing,
        segmentId: request.segmentId,
        version: existing.version + 1,
        updatedAt: now,
        updatedBy: 'demo-user',
      };
      this.assignments[existingIndex] = assignment;
      return { assignment };
    } else {
      // Create new
      const assignment: SegmentAssignmentDto = {
        id: this.generateId(),
        entityKind: request.entityKind,
        entityId: request.entityId,
        categoryAxisId: request.categoryAxisId,
        segmentId: request.segmentId,
        isActive: true,
        version: 1,
        createdAt: now,
        updatedAt: now,
        createdBy: 'demo-user',
        updatedBy: 'demo-user',
      };
      this.assignments.push(assignment);
      return { assignment };
    }
  }

  async deleteSegmentAssignment(id: string): Promise<void> {
    await this.delay(400);

    const index = this.assignments.findIndex((a) => a.id === id && a.isActive);
    if (index === -1) {
      throw new Error('セグメント割当が見つかりません (ASSIGNMENT_NOT_FOUND)');
    }

    // Soft delete
    this.assignments[index] = {
      ...this.assignments[index],
      isActive: false,
      version: this.assignments[index].version + 1,
      updatedAt: new Date().toISOString(),
      updatedBy: 'demo-user',
    };
  }

  async getEntitySegments(
    entityKind: TargetEntityKind,
    entityId: string
  ): Promise<GetEntitySegmentsResponse> {
    await this.delay(300);

    const entityAssignments = this.assignments.filter(
      (a) => a.entityKind === entityKind && a.entityId === entityId && a.isActive
    );

    const segments: EntitySegmentInfo[] = entityAssignments.map((a) => {
      const axis = this.categoryAxes.find((ax) => ax.id === a.categoryAxisId);
      const seg = this.segments.find((s) => s.id === a.segmentId);

      return {
        categoryAxisId: a.categoryAxisId,
        categoryAxisName: axis?.axisName ?? '',
        segmentId: a.segmentId,
        segmentCode: seg?.segmentCode ?? '',
        segmentName: seg?.segmentName ?? '',
      };
    });

    return { segments };
  }
}

// Singleton instance for convenience
export const mockBffClient = new MockBffClient();
