import type { BffClient } from './BffClient';
import type {
  UomGroupDto,
  UomDto,
  UomSummaryDto,
  ListUomGroupsRequest,
  ListUomGroupsResponse,
  GetUomGroupResponse,
  CreateUomGroupRequest,
  CreateUomGroupResponse,
  UpdateUomGroupRequest,
  UpdateUomGroupResponse,
  ActivateUomGroupRequest,
  ActivateUomGroupResponse,
  DeactivateUomGroupRequest,
  DeactivateUomGroupResponse,
  ListUomsRequest,
  ListUomsResponse,
  GetUomResponse,
  CreateUomRequest,
  CreateUomResponse,
  UpdateUomRequest,
  UpdateUomResponse,
  ActivateUomRequest,
  ActivateUomResponse,
  DeactivateUomRequest,
  DeactivateUomResponse,
  SuggestUomsRequest,
  SuggestUomsResponse,
} from '../types/bff-contracts';

// =============================================================================
// Mock Data
// =============================================================================

const mockUomGroups: UomGroupDto[] = [
  {
    id: 'group-001',
    groupCode: 'LENGTH',
    groupName: '長さ',
    description: '長さの単位グループ（メートル系）',
    baseUomId: 'uom-001',
    baseUom: { id: 'uom-001', uomCode: 'M', uomName: 'メートル' },
    isActive: true,
    version: 1,
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-15T09:00:00Z',
    createdBy: 'user-001',
    updatedBy: 'user-001',
  },
  {
    id: 'group-002',
    groupCode: 'WEIGHT',
    groupName: '重量',
    description: '重量の単位グループ（キログラム系）',
    baseUomId: 'uom-004',
    baseUom: { id: 'uom-004', uomCode: 'KG', uomName: 'キログラム' },
    isActive: true,
    version: 1,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    createdBy: 'user-001',
    updatedBy: 'user-001',
  },
  {
    id: 'group-003',
    groupCode: 'VOLUME',
    groupName: '容量',
    description: '容量の単位グループ（リットル系）',
    baseUomId: 'uom-007',
    baseUom: { id: 'uom-007', uomCode: 'L', uomName: 'リットル' },
    isActive: true,
    version: 1,
    createdAt: '2024-01-15T11:00:00Z',
    updatedAt: '2024-01-15T11:00:00Z',
    createdBy: 'user-001',
    updatedBy: 'user-001',
  },
  {
    id: 'group-004',
    groupCode: 'COUNT',
    groupName: '個数',
    description: '個数の単位グループ',
    baseUomId: 'uom-010',
    baseUom: { id: 'uom-010', uomCode: 'PCS', uomName: '個' },
    isActive: true,
    version: 1,
    createdAt: '2024-01-15T12:00:00Z',
    updatedAt: '2024-01-15T12:00:00Z',
    createdBy: 'user-001',
    updatedBy: 'user-001',
  },
  {
    id: 'group-005',
    groupCode: 'TIME',
    groupName: '時間',
    description: '時間の単位グループ（停止中）',
    baseUomId: 'uom-013',
    baseUom: { id: 'uom-013', uomCode: 'HR', uomName: '時間' },
    isActive: false,
    version: 1,
    createdAt: '2024-01-15T13:00:00Z',
    updatedAt: '2024-01-20T09:00:00Z',
    createdBy: 'user-001',
    updatedBy: 'user-002',
  },
];

const mockUoms: UomDto[] = [
  // LENGTH group
  {
    id: 'uom-001',
    uomCode: 'M',
    uomName: 'メートル',
    uomSymbol: 'm',
    uomGroupId: 'group-001',
    groupId: 'group-001',
    groupCode: 'LENGTH',
    groupName: '長さ',
    conversionFactor: 1,
    isBaseUom: true,
    isActive: true,
    version: 1,
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-15T09:00:00Z',
    createdBy: 'user-001',
    updatedBy: 'user-001',
  },
  {
    id: 'uom-002',
    uomCode: 'CM',
    uomName: 'センチメートル',
    uomSymbol: 'cm',
    uomGroupId: 'group-001',
    groupId: 'group-001',
    groupCode: 'LENGTH',
    groupName: '長さ',
    conversionFactor: 0.01,
    isBaseUom: false,
    isActive: true,
    version: 1,
    createdAt: '2024-01-15T09:01:00Z',
    updatedAt: '2024-01-15T09:01:00Z',
    createdBy: 'user-001',
    updatedBy: 'user-001',
  },
  {
    id: 'uom-003',
    uomCode: 'MM',
    uomName: 'ミリメートル',
    uomSymbol: 'mm',
    uomGroupId: 'group-001',
    groupId: 'group-001',
    groupCode: 'LENGTH',
    groupName: '長さ',
    conversionFactor: 0.001,
    isBaseUom: false,
    isActive: true,
    version: 1,
    createdAt: '2024-01-15T09:02:00Z',
    updatedAt: '2024-01-15T09:02:00Z',
    createdBy: 'user-001',
    updatedBy: 'user-001',
  },
  // WEIGHT group
  {
    id: 'uom-004',
    uomCode: 'KG',
    uomName: 'キログラム',
    uomSymbol: 'kg',
    uomGroupId: 'group-002',
    groupId: 'group-002',
    groupCode: 'WEIGHT',
    groupName: '重量',
    conversionFactor: 1,
    isBaseUom: true,
    isActive: true,
    version: 1,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    createdBy: 'user-001',
    updatedBy: 'user-001',
  },
  {
    id: 'uom-005',
    uomCode: 'G',
    uomName: 'グラム',
    uomSymbol: 'g',
    uomGroupId: 'group-002',
    groupId: 'group-002',
    groupCode: 'WEIGHT',
    groupName: '重量',
    conversionFactor: 0.001,
    isBaseUom: false,
    isActive: true,
    version: 1,
    createdAt: '2024-01-15T10:01:00Z',
    updatedAt: '2024-01-15T10:01:00Z',
    createdBy: 'user-001',
    updatedBy: 'user-001',
  },
  {
    id: 'uom-006',
    uomCode: 'T',
    uomName: 'トン',
    uomSymbol: 't',
    uomGroupId: 'group-002',
    groupId: 'group-002',
    groupCode: 'WEIGHT',
    groupName: '重量',
    conversionFactor: 1000,
    isBaseUom: false,
    isActive: true,
    version: 1,
    createdAt: '2024-01-15T10:02:00Z',
    updatedAt: '2024-01-15T10:02:00Z',
    createdBy: 'user-001',
    updatedBy: 'user-001',
  },
  // VOLUME group
  {
    id: 'uom-007',
    uomCode: 'L',
    uomName: 'リットル',
    uomSymbol: 'L',
    uomGroupId: 'group-003',
    groupId: 'group-003',
    groupCode: 'VOLUME',
    groupName: '容量',
    conversionFactor: 1,
    isBaseUom: true,
    isActive: true,
    version: 1,
    createdAt: '2024-01-15T11:00:00Z',
    updatedAt: '2024-01-15T11:00:00Z',
    createdBy: 'user-001',
    updatedBy: 'user-001',
  },
  {
    id: 'uom-008',
    uomCode: 'ML',
    uomName: 'ミリリットル',
    uomSymbol: 'mL',
    uomGroupId: 'group-003',
    groupId: 'group-003',
    groupCode: 'VOLUME',
    groupName: '容量',
    conversionFactor: 0.001,
    isBaseUom: false,
    isActive: true,
    version: 1,
    createdAt: '2024-01-15T11:01:00Z',
    updatedAt: '2024-01-15T11:01:00Z',
    createdBy: 'user-001',
    updatedBy: 'user-001',
  },
  {
    id: 'uom-009',
    uomCode: 'M3',
    uomName: '立方メートル',
    uomSymbol: 'm³',
    uomGroupId: 'group-003',
    groupId: 'group-003',
    groupCode: 'VOLUME',
    groupName: '容量',
    conversionFactor: 1000,
    isBaseUom: false,
    isActive: true,
    version: 1,
    createdAt: '2024-01-15T11:02:00Z',
    updatedAt: '2024-01-15T11:02:00Z',
    createdBy: 'user-001',
    updatedBy: 'user-001',
  },
  // COUNT group
  {
    id: 'uom-010',
    uomCode: 'PCS',
    uomName: '個',
    uomSymbol: '個',
    uomGroupId: 'group-004',
    groupId: 'group-004',
    groupCode: 'COUNT',
    groupName: '個数',
    conversionFactor: 1,
    isBaseUom: true,
    isActive: true,
    version: 1,
    createdAt: '2024-01-15T12:00:00Z',
    updatedAt: '2024-01-15T12:00:00Z',
    createdBy: 'user-001',
    updatedBy: 'user-001',
  },
  {
    id: 'uom-011',
    uomCode: 'BOX',
    uomName: '箱',
    uomSymbol: '箱',
    uomGroupId: 'group-004',
    groupId: 'group-004',
    groupCode: 'COUNT',
    groupName: '個数',
    conversionFactor: 12,
    isBaseUom: false,
    isActive: true,
    version: 1,
    createdAt: '2024-01-15T12:01:00Z',
    updatedAt: '2024-01-15T12:01:00Z',
    createdBy: 'user-001',
    updatedBy: 'user-001',
  },
  {
    id: 'uom-012',
    uomCode: 'SET',
    uomName: 'セット',
    uomSymbol: 'SET',
    uomGroupId: 'group-004',
    groupId: 'group-004',
    groupCode: 'COUNT',
    groupName: '個数',
    conversionFactor: 1,
    isBaseUom: false,
    isActive: true,
    version: 1,
    createdAt: '2024-01-15T12:02:00Z',
    updatedAt: '2024-01-15T12:02:00Z',
    createdBy: 'user-001',
    updatedBy: 'user-001',
  },
  // TIME group (inactive)
  {
    id: 'uom-013',
    uomCode: 'HR',
    uomName: '時間',
    uomSymbol: 'h',
    uomGroupId: 'group-005',
    groupId: 'group-005',
    groupCode: 'TIME',
    groupName: '時間',
    conversionFactor: 1,
    isBaseUom: true,
    isActive: false,
    version: 1,
    createdAt: '2024-01-15T13:00:00Z',
    updatedAt: '2024-01-20T09:00:00Z',
    createdBy: 'user-001',
    updatedBy: 'user-002',
  },
];

// =============================================================================
// Helper Functions
// =============================================================================

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// =============================================================================
// MockBffClient Implementation
// =============================================================================

export class MockBffClient implements BffClient {
  // ==========================================================================
  // UomGroup Methods
  // ==========================================================================

  async listUomGroups(request: ListUomGroupsRequest): Promise<ListUomGroupsResponse> {
    await delay(300);

    let filtered = [...mockUomGroups];

    // Filter by keyword
    if (request.keyword) {
      const keyword = request.keyword.toLowerCase();
      filtered = filtered.filter(
        (g) =>
          g.groupCode.toLowerCase().includes(keyword) ||
          g.groupName.toLowerCase().includes(keyword),
      );
    }

    // Filter by isActive
    if (request.isActive !== undefined) {
      filtered = filtered.filter((g) => g.isActive === request.isActive);
    }

    // Sort
    if (request.sortBy) {
      filtered.sort((a, b) => {
        let aVal: string | boolean;
        let bVal: string | boolean;

        switch (request.sortBy) {
          case 'groupCode':
            aVal = a.groupCode;
            bVal = b.groupCode;
            break;
          case 'groupName':
            aVal = a.groupName;
            bVal = b.groupName;
            break;
          case 'isActive':
            aVal = a.isActive;
            bVal = b.isActive;
            break;
          default:
            return 0;
        }

        if (aVal < bVal) return request.sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return request.sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    // Pagination
    const page = request.page || 1;
    const pageSize = Math.min(request.pageSize || 50, 200);
    const total = filtered.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const items = filtered.slice(start, end);

    return {
      items,
      page,
      pageSize,
      total,
      totalPages,
    };
  }

  async getUomGroup(id: string): Promise<GetUomGroupResponse> {
    await delay(200);
    const group = mockUomGroups.find((g) => g.id === id);
    if (!group) {
      throw new Error('UOM_GROUP_NOT_FOUND');
    }
    return { group };
  }

  async createUomGroup(request: CreateUomGroupRequest): Promise<CreateUomGroupResponse> {
    await delay(500);

    // Check duplicate group code
    const duplicateGroup = mockUomGroups.find(
      (g) => g.groupCode.toUpperCase() === request.groupCode.toUpperCase(),
    );
    if (duplicateGroup) {
      throw new Error('UOM_GROUP_CODE_DUPLICATE');
    }

    // Check duplicate uom code
    const duplicateUom = mockUoms.find(
      (u) => u.uomCode.toUpperCase() === request.baseUomCode.toUpperCase(),
    );
    if (duplicateUom) {
      throw new Error('UOM_CODE_DUPLICATE');
    }

    // Validate code format
    const codeRegex = /^[A-Z0-9_-]{1,10}$/;
    if (!codeRegex.test(request.groupCode.toUpperCase())) {
      throw new Error('INVALID_UOM_GROUP_CODE_FORMAT');
    }
    if (!codeRegex.test(request.baseUomCode.toUpperCase())) {
      throw new Error('INVALID_UOM_CODE_FORMAT');
    }

    const groupId = `group-${Date.now()}`;
    const uomId = `uom-${Date.now()}`;
    const now = new Date().toISOString();

    // Create base uom
    const newUom: UomDto = {
      id: uomId,
      uomCode: request.baseUomCode.toUpperCase(),
      uomName: request.baseUomName,
      uomSymbol: request.baseUomSymbol || null,
      groupId,
      groupCode: request.groupCode.toUpperCase(),
      groupName: request.groupName,
      isBaseUom: true,
      isActive: true,
      version: 1,
      createdAt: now,
      updatedAt: now,
      createdBy: 'current-user',
      updatedBy: 'current-user',
    };
    mockUoms.push(newUom);

    // Create group
    const baseUomSummary: UomSummaryDto = {
      id: uomId,
      uomCode: request.baseUomCode.toUpperCase(),
      uomName: request.baseUomName,
    };

    const newGroup: UomGroupDto = {
      id: groupId,
      groupCode: request.groupCode.toUpperCase(),
      groupName: request.groupName,
      description: request.description || null,
      baseUomId: uomId,
      baseUom: baseUomSummary,
      isActive: true,
      version: 1,
      createdAt: now,
      updatedAt: now,
      createdBy: 'current-user',
      updatedBy: 'current-user',
    };
    mockUomGroups.push(newGroup);

    return { group: newGroup };
  }

  async updateUomGroup(id: string, request: UpdateUomGroupRequest): Promise<UpdateUomGroupResponse> {
    await delay(500);

    const index = mockUomGroups.findIndex((g) => g.id === id);
    if (index === -1) {
      throw new Error('UOM_GROUP_NOT_FOUND');
    }

    const group = mockUomGroups[index];
    if (group.version !== request.version) {
      throw new Error('CONCURRENT_UPDATE');
    }

    // Check baseUomId if changing
    let baseUom = group.baseUom;
    if (request.baseUomId && request.baseUomId !== group.baseUomId) {
      const newBaseUom = mockUoms.find((u) => u.id === request.baseUomId);
      if (!newBaseUom) {
        throw new Error('UOM_NOT_FOUND');
      }
      if (newBaseUom.groupId !== id) {
        throw new Error('BASE_UOM_NOT_IN_GROUP');
      }
      baseUom = {
        id: newBaseUom.id,
        uomCode: newBaseUom.uomCode,
        uomName: newBaseUom.uomName,
      };
    }

    const updated: UomGroupDto = {
      ...group,
      groupName: request.groupName,
      description: request.description || null,
      baseUomId: request.baseUomId || group.baseUomId,
      baseUom,
      version: group.version + 1,
      updatedAt: new Date().toISOString(),
      updatedBy: 'current-user',
    };

    mockUomGroups[index] = updated;
    return { group: updated };
  }

  async activateUomGroup(
    id: string,
    request: ActivateUomGroupRequest,
  ): Promise<ActivateUomGroupResponse> {
    await delay(300);

    const index = mockUomGroups.findIndex((g) => g.id === id);
    if (index === -1) {
      throw new Error('UOM_GROUP_NOT_FOUND');
    }

    const group = mockUomGroups[index];
    if (group.version !== request.version) {
      throw new Error('CONCURRENT_UPDATE');
    }

    const updated: UomGroupDto = {
      ...group,
      isActive: true,
      version: group.version + 1,
      updatedAt: new Date().toISOString(),
      updatedBy: 'current-user',
    };

    mockUomGroups[index] = updated;
    return { group: updated };
  }

  async deactivateUomGroup(
    id: string,
    request: DeactivateUomGroupRequest,
  ): Promise<DeactivateUomGroupResponse> {
    await delay(300);

    const index = mockUomGroups.findIndex((g) => g.id === id);
    if (index === -1) {
      throw new Error('UOM_GROUP_NOT_FOUND');
    }

    const group = mockUomGroups[index];
    if (group.version !== request.version) {
      throw new Error('CONCURRENT_UPDATE');
    }

    const updated: UomGroupDto = {
      ...group,
      isActive: false,
      version: group.version + 1,
      updatedAt: new Date().toISOString(),
      updatedBy: 'current-user',
    };

    mockUomGroups[index] = updated;
    return { group: updated };
  }

  // ==========================================================================
  // Uom Methods
  // ==========================================================================

  async listUoms(request: ListUomsRequest): Promise<ListUomsResponse> {
    await delay(300);

    let filtered = [...mockUoms];

    // Filter by groupId
    if (request.groupId) {
      filtered = filtered.filter((u) => u.groupId === request.groupId);
    }

    // Filter by keyword
    if (request.keyword) {
      const keyword = request.keyword.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.uomCode.toLowerCase().includes(keyword) || u.uomName.toLowerCase().includes(keyword),
      );
    }

    // Filter by isActive
    if (request.isActive !== undefined) {
      filtered = filtered.filter((u) => u.isActive === request.isActive);
    }

    // Sort
    if (request.sortBy) {
      filtered.sort((a, b) => {
        let aVal: string | boolean;
        let bVal: string | boolean;

        switch (request.sortBy) {
          case 'uomCode':
            aVal = a.uomCode;
            bVal = b.uomCode;
            break;
          case 'uomName':
            aVal = a.uomName;
            bVal = b.uomName;
            break;
          case 'groupCode':
            aVal = a.groupCode;
            bVal = b.groupCode;
            break;
          case 'isActive':
            aVal = a.isActive;
            bVal = b.isActive;
            break;
          default:
            return 0;
        }

        if (aVal < bVal) return request.sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return request.sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    // Pagination
    const page = request.page || 1;
    const pageSize = Math.min(request.pageSize || 50, 200);
    const total = filtered.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const items = filtered.slice(start, end);

    return {
      items,
      page,
      pageSize,
      total,
      totalPages,
    };
  }

  async getUom(id: string): Promise<GetUomResponse> {
    await delay(200);
    const uom = mockUoms.find((u) => u.id === id);
    if (!uom) {
      throw new Error('UOM_NOT_FOUND');
    }
    return { uom };
  }

  async createUom(request: CreateUomRequest): Promise<CreateUomResponse> {
    await delay(500);

    // Check group exists
    const group = mockUomGroups.find((g) => g.id === request.uomGroupId);
    if (!group) {
      throw new Error('UOM_GROUP_NOT_FOUND');
    }

    // Check duplicate uom code
    const duplicate = mockUoms.find(
      (u) => u.uomCode.toUpperCase() === request.uomCode.toUpperCase(),
    );
    if (duplicate) {
      throw new Error('UOM_CODE_DUPLICATE');
    }

    // Validate code format
    const codeRegex = /^[A-Z0-9_-]{1,10}$/;
    if (!codeRegex.test(request.uomCode.toUpperCase())) {
      throw new Error('INVALID_UOM_CODE_FORMAT');
    }

    const now = new Date().toISOString();
    const newUom: UomDto = {
      id: `uom-${Date.now()}`,
      uomCode: request.uomCode.toUpperCase(),
      uomName: request.uomName,
      uomSymbol: request.uomSymbol || null,
      uomGroupId: request.uomGroupId,
      groupId: request.uomGroupId,
      groupCode: group.groupCode,
      groupName: group.groupName,
      conversionFactor: request.conversionFactor,
      isBaseUom: false,
      isActive: true,
      version: 1,
      createdAt: now,
      updatedAt: now,
      createdBy: 'current-user',
      updatedBy: 'current-user',
    };

    mockUoms.push(newUom);
    return { uom: newUom };
  }

  async updateUom(id: string, request: UpdateUomRequest): Promise<UpdateUomResponse> {
    await delay(500);

    const index = mockUoms.findIndex((u) => u.id === id);
    if (index === -1) {
      throw new Error('UOM_NOT_FOUND');
    }

    const uom = mockUoms[index];
    if (uom.version !== request.version) {
      throw new Error('CONCURRENT_UPDATE');
    }

    const updated: UomDto = {
      ...uom,
      uomName: request.uomName,
      uomSymbol: request.uomSymbol || null,
      conversionFactor: request.conversionFactor,
      version: uom.version + 1,
      updatedAt: new Date().toISOString(),
      updatedBy: 'current-user',
    };

    mockUoms[index] = updated;
    return { uom: updated };
  }

  async activateUom(id: string, request: ActivateUomRequest): Promise<ActivateUomResponse> {
    await delay(300);

    const index = mockUoms.findIndex((u) => u.id === id);
    if (index === -1) {
      throw new Error('UOM_NOT_FOUND');
    }

    const uom = mockUoms[index];
    if (uom.version !== request.version) {
      throw new Error('CONCURRENT_UPDATE');
    }

    const updated: UomDto = {
      ...uom,
      isActive: true,
      version: uom.version + 1,
      updatedAt: new Date().toISOString(),
      updatedBy: 'current-user',
    };

    mockUoms[index] = updated;
    return { uom: updated };
  }

  async deactivateUom(id: string, request: DeactivateUomRequest): Promise<DeactivateUomResponse> {
    await delay(300);

    const index = mockUoms.findIndex((u) => u.id === id);
    if (index === -1) {
      throw new Error('UOM_NOT_FOUND');
    }

    const uom = mockUoms[index];
    if (uom.version !== request.version) {
      throw new Error('CONCURRENT_UPDATE');
    }

    // Check if base uom
    if (uom.isBaseUom) {
      throw new Error('CANNOT_DEACTIVATE_BASE_UOM');
    }

    const updated: UomDto = {
      ...uom,
      isActive: false,
      version: uom.version + 1,
      updatedAt: new Date().toISOString(),
      updatedBy: 'current-user',
    };

    mockUoms[index] = updated;
    return { uom: updated };
  }

  async suggestUoms(request: SuggestUomsRequest): Promise<SuggestUomsResponse> {
    await delay(200);

    const keyword = request.keyword.toLowerCase();
    const limit = Math.min(request.limit || 20, 20);

    let filtered = mockUoms.filter((u) => u.isActive);

    // Filter by groupId
    if (request.groupId) {
      filtered = filtered.filter((u) => u.groupId === request.groupId);
    }

    // Filter by keyword (prefix match)
    if (keyword) {
      filtered = filtered.filter(
        (u) =>
          u.uomCode.toLowerCase().startsWith(keyword) ||
          u.uomName.toLowerCase().startsWith(keyword),
      );
    }

    // Sort by uomCode
    filtered.sort((a, b) => a.uomCode.localeCompare(b.uomCode));

    // Limit results
    const items = filtered.slice(0, limit);

    return { items };
  }
}
