// ProjectMasterService Unit Tests
// FR-LIST-03 ~ FR-LIST-09: ビジネスルールのテスト
//
// テスト対象:
// - projectCode一意性チェック
// - 日付範囲バリデーション
// - 楽観ロック（ifMatchVersion）
// - 無効化/再有効化のステータスチェック

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Prisma } from '@prisma/client'
import { ProjectMasterService, ServiceError } from '../project-master.service'
import { ProjectMasterRepository } from '../project-master.repository'
import { ProjectMasterErrorCode } from '@epm/contracts/api/errors'

// Mock Repository
const createMockRepository = (): jest.Mocked<ProjectMasterRepository> => ({
  findMany: vi.fn(),
  findById: vi.fn(),
  findByProjectCode: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  updateStatus: vi.fn(),
} as any)

// Test data factory
const createTestProject = (overrides = {}) => ({
  id: 'test-id-1',
  tenantId: 'tenant-001',
  projectCode: 'PRJ001',
  projectName: 'Test Project',
  projectShortName: 'TP',
  projectKanaName: 'テストプロジェクト',
  departmentCode: 'DEPT001',
  responsibleEmployeeCode: 'EMP001',
  responsibleEmployeeName: 'Test User',
  plannedPeriodFrom: new Date('2025-01-01'),
  plannedPeriodTo: new Date('2025-12-31'),
  actualPeriodFrom: null,
  actualPeriodTo: null,
  budgetAmount: new Prisma.Decimal('1000000.00'),
  version: 0,
  isActive: true,
  createdAt: new Date('2025-01-01T00:00:00Z'),
  updatedAt: new Date('2025-01-01T00:00:00Z'),
  createdBy: 'system',
  updatedBy: 'system',
  ...overrides,
})

describe('ProjectMasterService', () => {
  let service: ProjectMasterService
  let mockRepository: jest.Mocked<ProjectMasterRepository>
  const tenantId = 'tenant-001'
  const userId = 'user-001'

  beforeEach(() => {
    mockRepository = createMockRepository()
    service = new ProjectMasterService(mockRepository)
  })

  describe('create', () => {
    it('should create a project successfully', async () => {
      mockRepository.findByProjectCode.mockResolvedValue(null)
      mockRepository.create.mockResolvedValue(createTestProject())

      const result = await service.create(tenantId, userId, {
        projectCode: 'PRJ001',
        projectName: 'Test Project',
        plannedPeriodFrom: '2025-01-01T00:00:00Z',
        plannedPeriodTo: '2025-12-31T23:59:59Z',
        budgetAmount: '1000000.00',
      })

      expect(result.projectCode).toBe('PRJ001')
      expect(mockRepository.create).toHaveBeenCalledWith(
        tenantId,
        expect.objectContaining({
          projectCode: 'PRJ001',
          createdBy: userId,
          updatedBy: userId,
        })
      )
    })

    it('should throw PROJECT_CODE_DUPLICATE when project code already exists', async () => {
      mockRepository.findByProjectCode.mockResolvedValue(createTestProject())

      await expect(
        service.create(tenantId, userId, {
          projectCode: 'PRJ001',
          projectName: 'Test Project',
          plannedPeriodFrom: '2025-01-01T00:00:00Z',
          plannedPeriodTo: '2025-12-31T23:59:59Z',
          budgetAmount: '1000000.00',
        })
      ).rejects.toMatchObject({
        error: { code: ProjectMasterErrorCode.PROJECT_CODE_DUPLICATE },
      })
    })

    it('should throw INVALID_DATE_RANGE when plannedPeriodFrom > plannedPeriodTo', async () => {
      mockRepository.findByProjectCode.mockResolvedValue(null)

      await expect(
        service.create(tenantId, userId, {
          projectCode: 'PRJ001',
          projectName: 'Test Project',
          plannedPeriodFrom: '2025-12-31T00:00:00Z',
          plannedPeriodTo: '2025-01-01T00:00:00Z',
          budgetAmount: '1000000.00',
        })
      ).rejects.toMatchObject({
        error: { code: ProjectMasterErrorCode.INVALID_DATE_RANGE },
      })
    })

    it('should throw ACTUAL_PERIOD_TO_REQUIRED when actualPeriodFrom specified but actualPeriodTo is not', async () => {
      mockRepository.findByProjectCode.mockResolvedValue(null)

      await expect(
        service.create(tenantId, userId, {
          projectCode: 'PRJ001',
          projectName: 'Test Project',
          plannedPeriodFrom: '2025-01-01T00:00:00Z',
          plannedPeriodTo: '2025-12-31T23:59:59Z',
          actualPeriodFrom: '2025-01-15T00:00:00Z',
          budgetAmount: '1000000.00',
        })
      ).rejects.toMatchObject({
        error: { code: ProjectMasterErrorCode.ACTUAL_PERIOD_TO_REQUIRED },
      })
    })
  })

  describe('update', () => {
    it('should update a project successfully with optimistic locking', async () => {
      const existingProject = createTestProject({ version: 1 })
      mockRepository.findById.mockResolvedValue(existingProject)
      mockRepository.update.mockResolvedValue(createTestProject({ version: 2 }))

      const result = await service.update(tenantId, userId, 'test-id-1', {
        ifMatchVersion: 1,
        projectName: 'Updated Name',
      })

      expect(result.version).toBe(2)
      expect(mockRepository.update).toHaveBeenCalledWith(
        tenantId,
        'test-id-1',
        expect.objectContaining({ projectName: 'Updated Name' }),
        1
      )
    })

    it('should throw PROJECT_NOT_FOUND when project does not exist', async () => {
      mockRepository.findById.mockResolvedValue(null)

      await expect(
        service.update(tenantId, userId, 'non-existent', {
          ifMatchVersion: 1,
          projectName: 'Updated Name',
        })
      ).rejects.toMatchObject({
        error: { code: ProjectMasterErrorCode.PROJECT_NOT_FOUND },
      })
    })

    it('should throw STALE_UPDATE when version mismatch', async () => {
      const existingProject = createTestProject({ version: 2 })
      mockRepository.findById.mockResolvedValue(existingProject)

      await expect(
        service.update(tenantId, userId, 'test-id-1', {
          ifMatchVersion: 1, // version mismatch
          projectName: 'Updated Name',
        })
      ).rejects.toMatchObject({
        error: { code: ProjectMasterErrorCode.STALE_UPDATE },
      })
    })
  })

  describe('deactivate', () => {
    it('should deactivate an active project', async () => {
      const existingProject = createTestProject({ isActive: true, version: 0 })
      mockRepository.findById.mockResolvedValue(existingProject)
      mockRepository.updateStatus.mockResolvedValue(
        createTestProject({ isActive: false, version: 1 })
      )

      const result = await service.deactivate(tenantId, userId, 'test-id-1', 0)

      expect(result.isActive).toBe(false)
      expect(mockRepository.updateStatus).toHaveBeenCalledWith(
        tenantId,
        'test-id-1',
        false,
        userId,
        0
      )
    })

    it('should throw PROJECT_ALREADY_INACTIVE when project is already inactive', async () => {
      const existingProject = createTestProject({ isActive: false, version: 0 })
      mockRepository.findById.mockResolvedValue(existingProject)

      await expect(
        service.deactivate(tenantId, userId, 'test-id-1', 0)
      ).rejects.toMatchObject({
        error: { code: ProjectMasterErrorCode.PROJECT_ALREADY_INACTIVE },
      })
    })
  })

  describe('reactivate', () => {
    it('should reactivate an inactive project', async () => {
      const existingProject = createTestProject({ isActive: false, version: 1 })
      mockRepository.findById.mockResolvedValue(existingProject)
      mockRepository.updateStatus.mockResolvedValue(
        createTestProject({ isActive: true, version: 2 })
      )

      const result = await service.reactivate(tenantId, userId, 'test-id-1', 1)

      expect(result.isActive).toBe(true)
      expect(mockRepository.updateStatus).toHaveBeenCalledWith(
        tenantId,
        'test-id-1',
        true,
        userId,
        1
      )
    })

    it('should throw PROJECT_ALREADY_ACTIVE when project is already active', async () => {
      const existingProject = createTestProject({ isActive: true, version: 0 })
      mockRepository.findById.mockResolvedValue(existingProject)

      await expect(
        service.reactivate(tenantId, userId, 'test-id-1', 0)
      ).rejects.toMatchObject({
        error: { code: ProjectMasterErrorCode.PROJECT_ALREADY_ACTIVE },
      })
    })
  })

  describe('findById', () => {
    it('should return project when found', async () => {
      mockRepository.findById.mockResolvedValue(createTestProject())

      const result = await service.findById(tenantId, 'test-id-1')

      expect(result.id).toBe('test-id-1')
    })

    it('should throw PROJECT_NOT_FOUND when project does not exist', async () => {
      mockRepository.findById.mockResolvedValue(null)

      await expect(
        service.findById(tenantId, 'non-existent')
      ).rejects.toMatchObject({
        error: { code: ProjectMasterErrorCode.PROJECT_NOT_FOUND },
      })
    })
  })
})
