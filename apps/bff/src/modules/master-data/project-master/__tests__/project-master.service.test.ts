// ProjectMasterBffService Integration Tests
// FR-LIST-10, FR-LIST-11: ページング/ソート正規化 + error pass-through
//
// テスト対象:
// - page/pageSize → offset/limit変換
// - sortBy正規化
// - Domain API呼び出し
// - エラーのPass-through

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ProjectMasterBffService, DomainApiClient } from '../project-master.service'
import { ProjectMasterEntity, ListProjectMasterResponse } from '@epm/contracts/api/project-master'

// Mock Domain API Client
const createMockApiClient = (): jest.Mocked<DomainApiClient> => ({
  list: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  deactivate: vi.fn(),
  reactivate: vi.fn(),
} as any)

// Test data factory
const createTestEntity = (overrides = {}): ProjectMasterEntity => ({
  id: 'test-id-1',
  tenantId: 'tenant-001',
  projectCode: 'PRJ001',
  projectName: 'Test Project',
  projectShortName: 'TP',
  projectKanaName: 'テストプロジェクト',
  departmentCode: 'DEPT001',
  responsibleEmployeeCode: 'EMP001',
  responsibleEmployeeName: 'Test User',
  plannedPeriodFrom: '2025-01-01T00:00:00Z',
  plannedPeriodTo: '2025-12-31T23:59:59Z',
  actualPeriodFrom: null,
  actualPeriodTo: null,
  budgetAmount: '1000000.00',
  version: 0,
  isActive: true,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  createdBy: 'system',
  updatedBy: 'system',
  ...overrides,
})

describe('ProjectMasterBffService', () => {
  let service: ProjectMasterBffService
  let mockApiClient: jest.Mocked<DomainApiClient>
  const tenantId = 'tenant-001'
  const userId = 'user-001'

  beforeEach(() => {
    mockApiClient = createMockApiClient()
    service = new ProjectMasterBffService(mockApiClient)
  })

  describe('list', () => {
    it('should convert page/pageSize to offset/limit', async () => {
      const apiResponse: ListProjectMasterResponse = {
        items: [createTestEntity()],
        totalCount: 1,
      }
      mockApiClient.list.mockResolvedValue(apiResponse)

      const result = await service.list(tenantId, userId, {
        page: 2,
        pageSize: 10,
      })

      expect(mockApiClient.list).toHaveBeenCalledWith(
        tenantId,
        userId,
        expect.objectContaining({
          offset: 10, // (page-1) * pageSize = (2-1) * 10 = 10
          limit: 10,
        })
      )
      expect(result.page).toBe(2)
      expect(result.pageSize).toBe(10)
    })

    it('should use default values when page/pageSize not provided', async () => {
      const apiResponse: ListProjectMasterResponse = {
        items: [],
        totalCount: 0,
      }
      mockApiClient.list.mockResolvedValue(apiResponse)

      const result = await service.list(tenantId, userId, {})

      expect(mockApiClient.list).toHaveBeenCalledWith(
        tenantId,
        userId,
        expect.objectContaining({
          offset: 0, // default page=1 -> (1-1)*50 = 0
          limit: 50, // default pageSize=50
          sortBy: 'projectCode', // default sortBy
          sortOrder: 'asc', // default sortOrder
        })
      )
      expect(result.page).toBe(1)
      expect(result.pageSize).toBe(50)
    })

    it('should clamp pageSize to max 200', async () => {
      const apiResponse: ListProjectMasterResponse = {
        items: [],
        totalCount: 0,
      }
      mockApiClient.list.mockResolvedValue(apiResponse)

      const result = await service.list(tenantId, userId, {
        pageSize: 500, // exceeds max
      })

      expect(mockApiClient.list).toHaveBeenCalledWith(
        tenantId,
        userId,
        expect.objectContaining({
          limit: 200, // clamped to max
        })
      )
      expect(result.pageSize).toBe(200)
    })

    it('should use default sortBy when invalid sortBy provided', async () => {
      const apiResponse: ListProjectMasterResponse = {
        items: [],
        totalCount: 0,
      }
      mockApiClient.list.mockResolvedValue(apiResponse)

      await service.list(tenantId, userId, {
        sortBy: 'invalidField' as any,
      })

      expect(mockApiClient.list).toHaveBeenCalledWith(
        tenantId,
        userId,
        expect.objectContaining({
          sortBy: 'projectCode', // falls back to default
        })
      )
    })

    it('should trim search keywords', async () => {
      const apiResponse: ListProjectMasterResponse = {
        items: [],
        totalCount: 0,
      }
      mockApiClient.list.mockResolvedValue(apiResponse)

      await service.list(tenantId, userId, {
        projectName: '  Test  ',
        projectCode: '  PRJ001  ',
      })

      expect(mockApiClient.list).toHaveBeenCalledWith(
        tenantId,
        userId,
        expect.objectContaining({
          projectName: 'Test',
          projectCode: 'PRJ001',
        })
      )
    })

    it('should convert empty strings to undefined', async () => {
      const apiResponse: ListProjectMasterResponse = {
        items: [],
        totalCount: 0,
      }
      mockApiClient.list.mockResolvedValue(apiResponse)

      await service.list(tenantId, userId, {
        projectName: '   ',
        projectCode: '',
      })

      expect(mockApiClient.list).toHaveBeenCalledWith(
        tenantId,
        userId,
        expect.objectContaining({
          projectName: undefined,
          projectCode: undefined,
        })
      )
    })

    it('should map API entity to BFF list item correctly', async () => {
      const apiResponse: ListProjectMasterResponse = {
        items: [createTestEntity()],
        totalCount: 1,
      }
      mockApiClient.list.mockResolvedValue(apiResponse)

      const result = await service.list(tenantId, userId, {})

      expect(result.items[0]).toEqual({
        id: 'test-id-1',
        projectCode: 'PRJ001',
        projectName: 'Test Project',
        projectShortName: 'TP',
        projectKanaName: 'テストプロジェクト',
        departmentCode: 'DEPT001',
        responsibleEmployeeCode: 'EMP001',
        responsibleEmployeeName: 'Test User',
        plannedPeriodFrom: '2025-01-01T00:00:00Z',
        plannedPeriodTo: '2025-12-31T23:59:59Z',
        budgetAmount: '1000000.00',
        isActive: true,
      })
      // Should not include version, createdAt, updatedAt etc. in list item
      expect(result.items[0]).not.toHaveProperty('version')
      expect(result.items[0]).not.toHaveProperty('tenantId')
    })
  })

  describe('findById', () => {
    it('should return detail response with all fields', async () => {
      mockApiClient.findById.mockResolvedValue(createTestEntity())

      const result = await service.findById(tenantId, userId, 'test-id-1')

      expect(result).toMatchObject({
        id: 'test-id-1',
        projectCode: 'PRJ001',
        version: 0,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      })
      // Should not include tenantId in BFF response
      expect(result).not.toHaveProperty('tenantId')
    })
  })

  describe('error pass-through', () => {
    it('should pass through errors from Domain API without modification', async () => {
      const domainError = {
        code: 'PROJECT_NOT_FOUND',
        message: 'Project not found: test-id-1',
      }
      mockApiClient.findById.mockRejectedValue(domainError)

      await expect(
        service.findById(tenantId, userId, 'test-id-1')
      ).rejects.toEqual(domainError)
    })
  })

  describe('create', () => {
    it('should pass create request to Domain API and return detail response', async () => {
      mockApiClient.create.mockResolvedValue(createTestEntity())

      const result = await service.create(tenantId, userId, {
        projectCode: 'PRJ001',
        projectName: 'Test Project',
        plannedPeriodFrom: '2025-01-01T00:00:00Z',
        plannedPeriodTo: '2025-12-31T23:59:59Z',
        budgetAmount: '1000000.00',
      })

      expect(mockApiClient.create).toHaveBeenCalledWith(
        tenantId,
        userId,
        expect.objectContaining({
          projectCode: 'PRJ001',
          projectName: 'Test Project',
        })
      )
      expect(result.id).toBe('test-id-1')
    })
  })

  describe('update', () => {
    it('should pass update request to Domain API with ifMatchVersion', async () => {
      mockApiClient.update.mockResolvedValue(createTestEntity({ version: 1 }))

      const result = await service.update(tenantId, userId, 'test-id-1', {
        ifMatchVersion: 0,
        projectName: 'Updated Name',
      })

      expect(mockApiClient.update).toHaveBeenCalledWith(
        tenantId,
        userId,
        'test-id-1',
        expect.objectContaining({
          ifMatchVersion: 0,
          projectName: 'Updated Name',
        })
      )
      expect(result.version).toBe(1)
    })
  })

  describe('deactivate', () => {
    it('should call Domain API deactivate with ifMatchVersion', async () => {
      mockApiClient.deactivate.mockResolvedValue(
        createTestEntity({ isActive: false, version: 1 })
      )

      const result = await service.deactivate(tenantId, userId, 'test-id-1', 0)

      expect(mockApiClient.deactivate).toHaveBeenCalledWith(
        tenantId,
        userId,
        'test-id-1',
        0
      )
      expect(result.isActive).toBe(false)
    })
  })

  describe('reactivate', () => {
    it('should call Domain API reactivate with ifMatchVersion', async () => {
      mockApiClient.reactivate.mockResolvedValue(
        createTestEntity({ isActive: true, version: 2 })
      )

      const result = await service.reactivate(tenantId, userId, 'test-id-1', 1)

      expect(mockApiClient.reactivate).toHaveBeenCalledWith(
        tenantId,
        userId,
        'test-id-1',
        1
      )
      expect(result.isActive).toBe(true)
    })
  })
})
