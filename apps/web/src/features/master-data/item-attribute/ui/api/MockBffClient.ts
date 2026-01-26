import type { BffClient } from './BffClient';
import type {
  ItemAttributeDto,
  ItemAttributeValueDto,
  ListItemAttributesRequest,
  ListItemAttributesResponse,
  GetItemAttributeResponse,
  CreateItemAttributeRequest,
  CreateItemAttributeResponse,
  UpdateItemAttributeRequest,
  UpdateItemAttributeResponse,
  ActivateItemAttributeRequest,
  ActivateItemAttributeResponse,
  DeactivateItemAttributeRequest,
  DeactivateItemAttributeResponse,
  SuggestItemAttributesRequest,
  SuggestItemAttributesResponse,
  ListItemAttributeValuesRequest,
  ListItemAttributeValuesResponse,
  GetItemAttributeValueResponse,
  CreateItemAttributeValueRequest,
  CreateItemAttributeValueResponse,
  UpdateItemAttributeValueRequest,
  UpdateItemAttributeValueResponse,
  ActivateItemAttributeValueRequest,
  ActivateItemAttributeValueResponse,
  DeactivateItemAttributeValueRequest,
  DeactivateItemAttributeValueResponse,
  SuggestItemAttributeValuesRequest,
  SuggestItemAttributeValuesResponse,
} from '../types/bff-contracts';

// =============================================================================
// Mock Data
// =============================================================================

const mockItemAttributes: ItemAttributeDto[] = [
  {
    id: 'attr-001',
    attributeCode: 'COLOR',
    attributeName: '色',
    valueType: 'SELECT',
    sortOrder: 1,
    isActive: true,
    valueCount: 5,
    version: 1,
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-15T09:00:00Z',
    createdBy: 'user-001',
    updatedBy: 'user-001',
  },
  {
    id: 'attr-002',
    attributeCode: 'SIZE',
    attributeName: 'サイズ',
    valueType: 'SELECT',
    sortOrder: 2,
    isActive: true,
    valueCount: 6,
    version: 1,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    createdBy: 'user-001',
    updatedBy: 'user-001',
  },
  {
    id: 'attr-003',
    attributeCode: 'MATERIAL',
    attributeName: '素材',
    valueType: 'SELECT',
    sortOrder: 3,
    isActive: true,
    valueCount: 4,
    version: 1,
    createdAt: '2024-01-15T11:00:00Z',
    updatedAt: '2024-01-15T11:00:00Z',
    createdBy: 'user-001',
    updatedBy: 'user-001',
  },
  {
    id: 'attr-004',
    attributeCode: 'GRADE',
    attributeName: 'グレード',
    valueType: 'SELECT',
    sortOrder: 4,
    isActive: true,
    valueCount: 3,
    version: 1,
    createdAt: '2024-01-15T12:00:00Z',
    updatedAt: '2024-01-15T12:00:00Z',
    createdBy: 'user-001',
    updatedBy: 'user-001',
  },
  {
    id: 'attr-005',
    attributeCode: 'FINISH',
    attributeName: '仕上げ',
    valueType: 'SELECT',
    sortOrder: 5,
    isActive: false,
    valueCount: 2,
    version: 1,
    createdAt: '2024-01-15T13:00:00Z',
    updatedAt: '2024-01-20T09:00:00Z',
    createdBy: 'user-001',
    updatedBy: 'user-002',
  },
];

const mockItemAttributeValues: ItemAttributeValueDto[] = [
  // COLOR attribute values
  {
    id: 'val-001',
    attributeId: 'attr-001',
    attributeCode: 'COLOR',
    attributeName: '色',
    valueCode: 'RED',
    valueName: '赤',
    sortOrder: 1,
    isActive: true,
    version: 1,
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-15T09:00:00Z',
    createdBy: 'user-001',
    updatedBy: 'user-001',
  },
  {
    id: 'val-002',
    attributeId: 'attr-001',
    attributeCode: 'COLOR',
    attributeName: '色',
    valueCode: 'BLUE',
    valueName: '青',
    sortOrder: 2,
    isActive: true,
    version: 1,
    createdAt: '2024-01-15T09:01:00Z',
    updatedAt: '2024-01-15T09:01:00Z',
    createdBy: 'user-001',
    updatedBy: 'user-001',
  },
  {
    id: 'val-003',
    attributeId: 'attr-001',
    attributeCode: 'COLOR',
    attributeName: '色',
    valueCode: 'GREEN',
    valueName: '緑',
    sortOrder: 3,
    isActive: true,
    version: 1,
    createdAt: '2024-01-15T09:02:00Z',
    updatedAt: '2024-01-15T09:02:00Z',
    createdBy: 'user-001',
    updatedBy: 'user-001',
  },
  {
    id: 'val-004',
    attributeId: 'attr-001',
    attributeCode: 'COLOR',
    attributeName: '色',
    valueCode: 'WHITE',
    valueName: '白',
    sortOrder: 4,
    isActive: true,
    version: 1,
    createdAt: '2024-01-15T09:03:00Z',
    updatedAt: '2024-01-15T09:03:00Z',
    createdBy: 'user-001',
    updatedBy: 'user-001',
  },
  {
    id: 'val-005',
    attributeId: 'attr-001',
    attributeCode: 'COLOR',
    attributeName: '色',
    valueCode: 'BLACK',
    valueName: '黒',
    sortOrder: 5,
    isActive: true,
    version: 1,
    createdAt: '2024-01-15T09:04:00Z',
    updatedAt: '2024-01-15T09:04:00Z',
    createdBy: 'user-001',
    updatedBy: 'user-001',
  },
  // SIZE attribute values
  {
    id: 'val-006',
    attributeId: 'attr-002',
    attributeCode: 'SIZE',
    attributeName: 'サイズ',
    valueCode: 'XS',
    valueName: 'XS',
    sortOrder: 1,
    isActive: true,
    version: 1,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    createdBy: 'user-001',
    updatedBy: 'user-001',
  },
  {
    id: 'val-007',
    attributeId: 'attr-002',
    attributeCode: 'SIZE',
    attributeName: 'サイズ',
    valueCode: 'S',
    valueName: 'S',
    sortOrder: 2,
    isActive: true,
    version: 1,
    createdAt: '2024-01-15T10:01:00Z',
    updatedAt: '2024-01-15T10:01:00Z',
    createdBy: 'user-001',
    updatedBy: 'user-001',
  },
  {
    id: 'val-008',
    attributeId: 'attr-002',
    attributeCode: 'SIZE',
    attributeName: 'サイズ',
    valueCode: 'M',
    valueName: 'M',
    sortOrder: 3,
    isActive: true,
    version: 1,
    createdAt: '2024-01-15T10:02:00Z',
    updatedAt: '2024-01-15T10:02:00Z',
    createdBy: 'user-001',
    updatedBy: 'user-001',
  },
  {
    id: 'val-009',
    attributeId: 'attr-002',
    attributeCode: 'SIZE',
    attributeName: 'サイズ',
    valueCode: 'L',
    valueName: 'L',
    sortOrder: 4,
    isActive: true,
    version: 1,
    createdAt: '2024-01-15T10:03:00Z',
    updatedAt: '2024-01-15T10:03:00Z',
    createdBy: 'user-001',
    updatedBy: 'user-001',
  },
  {
    id: 'val-010',
    attributeId: 'attr-002',
    attributeCode: 'SIZE',
    attributeName: 'サイズ',
    valueCode: 'XL',
    valueName: 'XL',
    sortOrder: 5,
    isActive: true,
    version: 1,
    createdAt: '2024-01-15T10:04:00Z',
    updatedAt: '2024-01-15T10:04:00Z',
    createdBy: 'user-001',
    updatedBy: 'user-001',
  },
  {
    id: 'val-011',
    attributeId: 'attr-002',
    attributeCode: 'SIZE',
    attributeName: 'サイズ',
    valueCode: 'XXL',
    valueName: 'XXL',
    sortOrder: 6,
    isActive: true,
    version: 1,
    createdAt: '2024-01-15T10:05:00Z',
    updatedAt: '2024-01-15T10:05:00Z',
    createdBy: 'user-001',
    updatedBy: 'user-001',
  },
  // MATERIAL attribute values
  {
    id: 'val-012',
    attributeId: 'attr-003',
    attributeCode: 'MATERIAL',
    attributeName: '素材',
    valueCode: 'COTTON',
    valueName: 'コットン',
    sortOrder: 1,
    isActive: true,
    version: 1,
    createdAt: '2024-01-15T11:00:00Z',
    updatedAt: '2024-01-15T11:00:00Z',
    createdBy: 'user-001',
    updatedBy: 'user-001',
  },
  {
    id: 'val-013',
    attributeId: 'attr-003',
    attributeCode: 'MATERIAL',
    attributeName: '素材',
    valueCode: 'POLYESTER',
    valueName: 'ポリエステル',
    sortOrder: 2,
    isActive: true,
    version: 1,
    createdAt: '2024-01-15T11:01:00Z',
    updatedAt: '2024-01-15T11:01:00Z',
    createdBy: 'user-001',
    updatedBy: 'user-001',
  },
  {
    id: 'val-014',
    attributeId: 'attr-003',
    attributeCode: 'MATERIAL',
    attributeName: '素材',
    valueCode: 'WOOL',
    valueName: 'ウール',
    sortOrder: 3,
    isActive: true,
    version: 1,
    createdAt: '2024-01-15T11:02:00Z',
    updatedAt: '2024-01-15T11:02:00Z',
    createdBy: 'user-001',
    updatedBy: 'user-001',
  },
  {
    id: 'val-015',
    attributeId: 'attr-003',
    attributeCode: 'MATERIAL',
    attributeName: '素材',
    valueCode: 'SILK',
    valueName: 'シルク',
    sortOrder: 4,
    isActive: true,
    version: 1,
    createdAt: '2024-01-15T11:03:00Z',
    updatedAt: '2024-01-15T11:03:00Z',
    createdBy: 'user-001',
    updatedBy: 'user-001',
  },
  // GRADE attribute values
  {
    id: 'val-016',
    attributeId: 'attr-004',
    attributeCode: 'GRADE',
    attributeName: 'グレード',
    valueCode: 'STANDARD',
    valueName: 'スタンダード',
    sortOrder: 1,
    isActive: true,
    version: 1,
    createdAt: '2024-01-15T12:00:00Z',
    updatedAt: '2024-01-15T12:00:00Z',
    createdBy: 'user-001',
    updatedBy: 'user-001',
  },
  {
    id: 'val-017',
    attributeId: 'attr-004',
    attributeCode: 'GRADE',
    attributeName: 'グレード',
    valueCode: 'PREMIUM',
    valueName: 'プレミアム',
    sortOrder: 2,
    isActive: true,
    version: 1,
    createdAt: '2024-01-15T12:01:00Z',
    updatedAt: '2024-01-15T12:01:00Z',
    createdBy: 'user-001',
    updatedBy: 'user-001',
  },
  {
    id: 'val-018',
    attributeId: 'attr-004',
    attributeCode: 'GRADE',
    attributeName: 'グレード',
    valueCode: 'LUXURY',
    valueName: 'ラグジュアリー',
    sortOrder: 3,
    isActive: true,
    version: 1,
    createdAt: '2024-01-15T12:02:00Z',
    updatedAt: '2024-01-15T12:02:00Z',
    createdBy: 'user-001',
    updatedBy: 'user-001',
  },
  // FINISH attribute values (inactive parent)
  {
    id: 'val-019',
    attributeId: 'attr-005',
    attributeCode: 'FINISH',
    attributeName: '仕上げ',
    valueCode: 'MATTE',
    valueName: 'マット',
    sortOrder: 1,
    isActive: false,
    version: 1,
    createdAt: '2024-01-15T13:00:00Z',
    updatedAt: '2024-01-20T09:00:00Z',
    createdBy: 'user-001',
    updatedBy: 'user-002',
  },
  {
    id: 'val-020',
    attributeId: 'attr-005',
    attributeCode: 'FINISH',
    attributeName: '仕上げ',
    valueCode: 'GLOSSY',
    valueName: 'グロッシー',
    sortOrder: 2,
    isActive: false,
    version: 1,
    createdAt: '2024-01-15T13:01:00Z',
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
  // ItemAttribute Methods
  // ==========================================================================

  async listItemAttributes(request: ListItemAttributesRequest): Promise<ListItemAttributesResponse> {
    await delay(300);

    let filtered = [...mockItemAttributes];

    // Filter by keyword
    if (request.keyword) {
      const keyword = request.keyword.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.attributeCode.toLowerCase().includes(keyword) ||
          a.attributeName.toLowerCase().includes(keyword),
      );
    }

    // Filter by isActive
    if (request.isActive !== undefined) {
      filtered = filtered.filter((a) => a.isActive === request.isActive);
    }

    // Sort
    const sortBy = request.sortBy || 'sortOrder';
    const sortOrder = request.sortOrder || 'asc';
    filtered.sort((a, b) => {
      let aVal: string | number | boolean;
      let bVal: string | number | boolean;

      switch (sortBy) {
        case 'attributeCode':
          aVal = a.attributeCode;
          bVal = b.attributeCode;
          break;
        case 'attributeName':
          aVal = a.attributeName;
          bVal = b.attributeName;
          break;
        case 'sortOrder':
          aVal = a.sortOrder;
          bVal = b.sortOrder;
          break;
        case 'isActive':
          aVal = a.isActive ? 1 : 0;
          bVal = b.isActive ? 1 : 0;
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

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

  async getItemAttribute(id: string): Promise<GetItemAttributeResponse> {
    await delay(200);
    const attribute = mockItemAttributes.find((a) => a.id === id);
    if (!attribute) {
      throw new Error('ITEM_ATTRIBUTE_NOT_FOUND');
    }
    return { attribute };
  }

  async createItemAttribute(request: CreateItemAttributeRequest): Promise<CreateItemAttributeResponse> {
    await delay(500);

    // Check duplicate code
    const duplicate = mockItemAttributes.find(
      (a) => a.attributeCode.toUpperCase() === request.attributeCode.toUpperCase(),
    );
    if (duplicate) {
      throw new Error('ITEM_ATTRIBUTE_CODE_DUPLICATE');
    }

    // Validate code format
    const codeRegex = /^[A-Z0-9_-]{1,20}$/;
    if (!codeRegex.test(request.attributeCode.toUpperCase())) {
      throw new Error('INVALID_ATTRIBUTE_CODE_FORMAT');
    }

    const now = new Date().toISOString();
    const newAttribute: ItemAttributeDto = {
      id: `attr-${Date.now()}`,
      attributeCode: request.attributeCode.toUpperCase(),
      attributeName: request.attributeName,
      valueType: 'SELECT',
      sortOrder: request.sortOrder || 0,
      isActive: true,
      valueCount: 0,
      version: 1,
      createdAt: now,
      updatedAt: now,
      createdBy: 'current-user',
      updatedBy: 'current-user',
    };

    mockItemAttributes.push(newAttribute);
    return { attribute: newAttribute };
  }

  async updateItemAttribute(id: string, request: UpdateItemAttributeRequest): Promise<UpdateItemAttributeResponse> {
    await delay(500);

    const index = mockItemAttributes.findIndex((a) => a.id === id);
    if (index === -1) {
      throw new Error('ITEM_ATTRIBUTE_NOT_FOUND');
    }

    const attribute = mockItemAttributes[index];
    if (attribute.version !== request.version) {
      throw new Error('CONCURRENT_UPDATE');
    }

    const updated: ItemAttributeDto = {
      ...attribute,
      attributeName: request.attributeName,
      sortOrder: request.sortOrder ?? attribute.sortOrder,
      version: attribute.version + 1,
      updatedAt: new Date().toISOString(),
      updatedBy: 'current-user',
    };

    mockItemAttributes[index] = updated;
    return { attribute: updated };
  }

  async activateItemAttribute(
    id: string,
    request: ActivateItemAttributeRequest,
  ): Promise<ActivateItemAttributeResponse> {
    await delay(300);

    const index = mockItemAttributes.findIndex((a) => a.id === id);
    if (index === -1) {
      throw new Error('ITEM_ATTRIBUTE_NOT_FOUND');
    }

    const attribute = mockItemAttributes[index];
    if (attribute.version !== request.version) {
      throw new Error('CONCURRENT_UPDATE');
    }

    const updated: ItemAttributeDto = {
      ...attribute,
      isActive: true,
      version: attribute.version + 1,
      updatedAt: new Date().toISOString(),
      updatedBy: 'current-user',
    };

    mockItemAttributes[index] = updated;
    return { attribute: updated };
  }

  async deactivateItemAttribute(
    id: string,
    request: DeactivateItemAttributeRequest,
  ): Promise<DeactivateItemAttributeResponse> {
    await delay(300);

    const index = mockItemAttributes.findIndex((a) => a.id === id);
    if (index === -1) {
      throw new Error('ITEM_ATTRIBUTE_NOT_FOUND');
    }

    const attribute = mockItemAttributes[index];
    if (attribute.version !== request.version) {
      throw new Error('CONCURRENT_UPDATE');
    }

    // Mock: simulate in-use warning (not forced)
    const usageCount = 3; // Mock usage count
    if (!request.force && usageCount > 0) {
      // Return warning without actually deactivating
      return {
        attribute,
        warning: {
          code: 'ATTRIBUTE_IN_USE',
          message: `この仕様属性は${usageCount}件のSKU仕様で使用されています`,
          usageCount,
        },
      };
    }

    const updated: ItemAttributeDto = {
      ...attribute,
      isActive: false,
      version: attribute.version + 1,
      updatedAt: new Date().toISOString(),
      updatedBy: 'current-user',
    };

    mockItemAttributes[index] = updated;
    return { attribute: updated };
  }

  async suggestItemAttributes(request: SuggestItemAttributesRequest): Promise<SuggestItemAttributesResponse> {
    await delay(200);

    const keyword = request.keyword.toLowerCase();
    const limit = Math.min(request.limit || 20, 20);

    let filtered = mockItemAttributes.filter((a) => a.isActive);

    // Filter by keyword (prefix match)
    if (keyword) {
      filtered = filtered.filter(
        (a) =>
          a.attributeCode.toLowerCase().startsWith(keyword) ||
          a.attributeName.toLowerCase().startsWith(keyword),
      );
    }

    // Sort by sortOrder
    filtered.sort((a, b) => a.sortOrder - b.sortOrder);

    // Limit results
    const items = filtered.slice(0, limit);

    return { items };
  }

  // ==========================================================================
  // ItemAttributeValue Methods
  // ==========================================================================

  async listItemAttributeValues(
    attributeId: string,
    request: ListItemAttributeValuesRequest,
  ): Promise<ListItemAttributeValuesResponse> {
    await delay(300);

    // Check attribute exists
    const attribute = mockItemAttributes.find((a) => a.id === attributeId);
    if (!attribute) {
      throw new Error('ITEM_ATTRIBUTE_NOT_FOUND');
    }

    let filtered = mockItemAttributeValues.filter((v) => v.attributeId === attributeId);

    // Filter by keyword
    if (request.keyword) {
      const keyword = request.keyword.toLowerCase();
      filtered = filtered.filter(
        (v) =>
          v.valueCode.toLowerCase().includes(keyword) ||
          v.valueName.toLowerCase().includes(keyword),
      );
    }

    // Filter by isActive
    if (request.isActive !== undefined) {
      filtered = filtered.filter((v) => v.isActive === request.isActive);
    }

    // Sort
    const sortBy = request.sortBy || 'sortOrder';
    const sortOrder = request.sortOrder || 'asc';
    filtered.sort((a, b) => {
      let aVal: string | number | boolean;
      let bVal: string | number | boolean;

      switch (sortBy) {
        case 'valueCode':
          aVal = a.valueCode;
          bVal = b.valueCode;
          break;
        case 'valueName':
          aVal = a.valueName;
          bVal = b.valueName;
          break;
        case 'sortOrder':
          aVal = a.sortOrder;
          bVal = b.sortOrder;
          break;
        case 'isActive':
          aVal = a.isActive ? 1 : 0;
          bVal = b.isActive ? 1 : 0;
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

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

  async getItemAttributeValue(attributeId: string, valueId: string): Promise<GetItemAttributeValueResponse> {
    await delay(200);

    const attribute = mockItemAttributes.find((a) => a.id === attributeId);
    if (!attribute) {
      throw new Error('ITEM_ATTRIBUTE_NOT_FOUND');
    }

    const value = mockItemAttributeValues.find((v) => v.id === valueId && v.attributeId === attributeId);
    if (!value) {
      throw new Error('ITEM_ATTRIBUTE_VALUE_NOT_FOUND');
    }

    return { value };
  }

  async createItemAttributeValue(
    attributeId: string,
    request: CreateItemAttributeValueRequest,
  ): Promise<CreateItemAttributeValueResponse> {
    await delay(500);

    const attribute = mockItemAttributes.find((a) => a.id === attributeId);
    if (!attribute) {
      throw new Error('ITEM_ATTRIBUTE_NOT_FOUND');
    }

    // Check duplicate code within attribute
    const duplicate = mockItemAttributeValues.find(
      (v) =>
        v.attributeId === attributeId &&
        v.valueCode.toUpperCase() === request.valueCode.toUpperCase(),
    );
    if (duplicate) {
      throw new Error('VALUE_CODE_DUPLICATE');
    }

    // Validate code format
    const codeRegex = /^[A-Z0-9_-]{1,30}$/;
    if (!codeRegex.test(request.valueCode.toUpperCase())) {
      throw new Error('INVALID_VALUE_CODE_FORMAT');
    }

    const now = new Date().toISOString();
    const newValue: ItemAttributeValueDto = {
      id: `val-${Date.now()}`,
      attributeId,
      attributeCode: attribute.attributeCode,
      attributeName: attribute.attributeName,
      valueCode: request.valueCode.toUpperCase(),
      valueName: request.valueName,
      sortOrder: request.sortOrder || 0,
      isActive: true,
      version: 1,
      createdAt: now,
      updatedAt: now,
      createdBy: 'current-user',
      updatedBy: 'current-user',
    };

    mockItemAttributeValues.push(newValue);

    // Update parent valueCount
    const attrIndex = mockItemAttributes.findIndex((a) => a.id === attributeId);
    if (attrIndex !== -1) {
      mockItemAttributes[attrIndex] = {
        ...mockItemAttributes[attrIndex],
        valueCount: mockItemAttributes[attrIndex].valueCount + 1,
      };
    }

    return { value: newValue };
  }

  async updateItemAttributeValue(
    attributeId: string,
    valueId: string,
    request: UpdateItemAttributeValueRequest,
  ): Promise<UpdateItemAttributeValueResponse> {
    await delay(500);

    const attribute = mockItemAttributes.find((a) => a.id === attributeId);
    if (!attribute) {
      throw new Error('ITEM_ATTRIBUTE_NOT_FOUND');
    }

    const index = mockItemAttributeValues.findIndex(
      (v) => v.id === valueId && v.attributeId === attributeId,
    );
    if (index === -1) {
      throw new Error('ITEM_ATTRIBUTE_VALUE_NOT_FOUND');
    }

    const value = mockItemAttributeValues[index];
    if (value.version !== request.version) {
      throw new Error('CONCURRENT_UPDATE');
    }

    const updated: ItemAttributeValueDto = {
      ...value,
      valueName: request.valueName,
      sortOrder: request.sortOrder ?? value.sortOrder,
      version: value.version + 1,
      updatedAt: new Date().toISOString(),
      updatedBy: 'current-user',
    };

    mockItemAttributeValues[index] = updated;
    return { value: updated };
  }

  async activateItemAttributeValue(
    attributeId: string,
    valueId: string,
    request: ActivateItemAttributeValueRequest,
  ): Promise<ActivateItemAttributeValueResponse> {
    await delay(300);

    const attribute = mockItemAttributes.find((a) => a.id === attributeId);
    if (!attribute) {
      throw new Error('ITEM_ATTRIBUTE_NOT_FOUND');
    }

    const index = mockItemAttributeValues.findIndex(
      (v) => v.id === valueId && v.attributeId === attributeId,
    );
    if (index === -1) {
      throw new Error('ITEM_ATTRIBUTE_VALUE_NOT_FOUND');
    }

    const value = mockItemAttributeValues[index];
    if (value.version !== request.version) {
      throw new Error('CONCURRENT_UPDATE');
    }

    const updated: ItemAttributeValueDto = {
      ...value,
      isActive: true,
      version: value.version + 1,
      updatedAt: new Date().toISOString(),
      updatedBy: 'current-user',
    };

    mockItemAttributeValues[index] = updated;
    return { value: updated };
  }

  async deactivateItemAttributeValue(
    attributeId: string,
    valueId: string,
    request: DeactivateItemAttributeValueRequest,
  ): Promise<DeactivateItemAttributeValueResponse> {
    await delay(300);

    const attribute = mockItemAttributes.find((a) => a.id === attributeId);
    if (!attribute) {
      throw new Error('ITEM_ATTRIBUTE_NOT_FOUND');
    }

    const index = mockItemAttributeValues.findIndex(
      (v) => v.id === valueId && v.attributeId === attributeId,
    );
    if (index === -1) {
      throw new Error('ITEM_ATTRIBUTE_VALUE_NOT_FOUND');
    }

    const value = mockItemAttributeValues[index];
    if (value.version !== request.version) {
      throw new Error('CONCURRENT_UPDATE');
    }

    // Mock: simulate in-use warning (not forced)
    const usageCount = 2; // Mock usage count
    if (!request.force && usageCount > 0) {
      return {
        value,
        warning: {
          code: 'VALUE_IN_USE',
          message: `この属性値は${usageCount}件のSKU仕様で使用されています`,
          usageCount,
        },
      };
    }

    const updated: ItemAttributeValueDto = {
      ...value,
      isActive: false,
      version: value.version + 1,
      updatedAt: new Date().toISOString(),
      updatedBy: 'current-user',
    };

    mockItemAttributeValues[index] = updated;
    return { value: updated };
  }

  async suggestItemAttributeValues(
    request: SuggestItemAttributeValuesRequest,
  ): Promise<SuggestItemAttributeValuesResponse> {
    await delay(200);

    const keyword = request.keyword.toLowerCase();
    const limit = Math.min(request.limit || 20, 20);

    let filtered = mockItemAttributeValues.filter((v) => v.isActive);

    // Filter by attributeId if specified
    if (request.attributeId) {
      filtered = filtered.filter((v) => v.attributeId === request.attributeId);
    }

    // Filter by keyword (prefix match)
    if (keyword) {
      filtered = filtered.filter(
        (v) =>
          v.valueCode.toLowerCase().startsWith(keyword) ||
          v.valueName.toLowerCase().startsWith(keyword),
      );
    }

    // Sort by sortOrder
    filtered.sort((a, b) => a.sortOrder - b.sortOrder);

    // Limit results
    const items = filtered.slice(0, limit);

    return { items };
  }
}
