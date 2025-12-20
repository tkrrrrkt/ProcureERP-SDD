import type { BffClient } from "./BffClient"
import type {
  ListProjectMasterRequest,
  ListProjectMasterResponse,
  ProjectMasterDetailResponse,
  ProjectMasterListItem,
  CreateProjectMasterRequest,
  UpdateProjectMasterRequest,
} from "@contracts/bff/project-master"

/**
 * Mock BFF Client for development and testing.
 * Simulates realistic EPM data and error scenarios.
 */
export class MockBffClient implements BffClient {
  private projects: ProjectMasterDetailResponse[] = [
    {
      id: "1",
      projectCode: "PRJ001",
      projectName: "新規事業開発プロジェクト",
      projectShortName: "新規事業",
      projectKanaName: "シンキジギョウカイハツプロジェクト",
      departmentCode: "SALES",
      responsibleEmployeeCode: "EMP001",
      responsibleEmployeeName: "田中 太郎",
      plannedPeriodFrom: "2024-01-01T00:00:00Z",
      plannedPeriodTo: "2024-12-31T23:59:59Z",
      actualPeriodFrom: "2024-01-15T00:00:00Z",
      actualPeriodTo: null,
      budgetAmount: "10000000.00",
      version: 1,
      isActive: true,
      createdAt: "2024-01-01T09:00:00Z",
      updatedAt: "2024-01-15T10:30:00Z",
      createdBy: "admin",
      updatedBy: "tanaka",
    },
    {
      id: "2",
      projectCode: "PRJ002",
      projectName: "既存事業拡大プロジェクト",
      projectShortName: "既存拡大",
      projectKanaName: "キゾンジギョウカクダイプロジェクト",
      departmentCode: "SALES",
      responsibleEmployeeCode: "EMP002",
      responsibleEmployeeName: "佐藤 花子",
      plannedPeriodFrom: "2024-02-01T00:00:00Z",
      plannedPeriodTo: "2024-11-30T23:59:59Z",
      actualPeriodFrom: null,
      actualPeriodTo: null,
      budgetAmount: "5000000.50",
      version: 0,
      isActive: true,
      createdAt: "2024-01-20T09:00:00Z",
      updatedAt: "2024-01-20T09:00:00Z",
      createdBy: "admin",
      updatedBy: "admin",
    },
    {
      id: "3",
      projectCode: "PRJ003",
      projectName: "システム刷新プロジェクト",
      projectShortName: "システム刷新",
      projectKanaName: "システムサッシンプロジェクト",
      departmentCode: "ENGINEERING",
      responsibleEmployeeCode: "EMP003",
      responsibleEmployeeName: "鈴木 一郎",
      plannedPeriodFrom: "2024-03-01T00:00:00Z",
      plannedPeriodTo: "2025-02-28T23:59:59Z",
      actualPeriodFrom: "2024-03-01T00:00:00Z",
      actualPeriodTo: null,
      budgetAmount: "25000000.00",
      version: 2,
      isActive: true,
      createdAt: "2024-02-15T09:00:00Z",
      updatedAt: "2024-03-15T14:20:00Z",
      createdBy: "admin",
      updatedBy: "suzuki",
    },
    {
      id: "4",
      projectCode: "PRJ004",
      projectName: "コスト削減プロジェクト",
      projectShortName: "コスト削減",
      projectKanaName: "コストサクゲンプロジェクト",
      departmentCode: "FINANCE",
      responsibleEmployeeCode: "EMP004",
      responsibleEmployeeName: "高橋 美咲",
      plannedPeriodFrom: "2024-04-01T00:00:00Z",
      plannedPeriodTo: "2024-09-30T23:59:59Z",
      actualPeriodFrom: "2024-04-01T00:00:00Z",
      actualPeriodTo: "2024-09-30T23:59:59Z",
      budgetAmount: "3000000.00",
      version: 5,
      isActive: false,
      createdAt: "2024-03-01T09:00:00Z",
      updatedAt: "2024-10-01T09:00:00Z",
      createdBy: "admin",
      updatedBy: "takahashi",
    },
    {
      id: "5",
      projectCode: "PRJ005",
      projectName: "人材育成プロジェクト",
      projectShortName: "人材育成",
      projectKanaName: "ジンザイイクセイプロジェクト",
      departmentCode: null,
      responsibleEmployeeCode: "EMP005",
      responsibleEmployeeName: "伊藤 健太",
      plannedPeriodFrom: "2024-01-01T00:00:00Z",
      plannedPeriodTo: "2024-12-31T23:59:59Z",
      actualPeriodFrom: null,
      actualPeriodTo: null,
      budgetAmount: "8000000.00",
      version: 1,
      isActive: true,
      createdAt: "2024-01-01T09:00:00Z",
      updatedAt: "2024-02-15T11:00:00Z",
      createdBy: "admin",
      updatedBy: "ito",
    },
    {
      id: "6",
      projectCode: "PRJ006",
      projectName: "マーケティング強化プロジェクト",
      projectShortName: "マーケ強化",
      projectKanaName: "マーケティングキョウカプロジェクト",
      departmentCode: "SALES",
      responsibleEmployeeCode: null,
      responsibleEmployeeName: null,
      plannedPeriodFrom: "2024-05-01T00:00:00Z",
      plannedPeriodTo: "2024-12-31T23:59:59Z",
      actualPeriodFrom: null,
      actualPeriodTo: null,
      budgetAmount: "12000000.00",
      version: 0,
      isActive: true,
      createdAt: "2024-04-15T09:00:00Z",
      updatedAt: "2024-04-15T09:00:00Z",
      createdBy: "admin",
      updatedBy: "admin",
    },
    {
      id: "7",
      projectCode: "PRJ007",
      projectName: "品質改善プロジェクト",
      projectShortName: "品質改善",
      projectKanaName: "ヒンシツカイゼンプロジェクト",
      departmentCode: "ENGINEERING",
      responsibleEmployeeCode: "EMP006",
      responsibleEmployeeName: "渡辺 直樹",
      plannedPeriodFrom: "2024-06-01T00:00:00Z",
      plannedPeriodTo: "2025-05-31T23:59:59Z",
      actualPeriodFrom: "2024-06-01T00:00:00Z",
      actualPeriodTo: null,
      budgetAmount: "7500000.00",
      version: 3,
      isActive: true,
      createdAt: "2024-05-15T09:00:00Z",
      updatedAt: "2024-07-20T16:00:00Z",
      createdBy: "admin",
      updatedBy: "watanabe",
    },
    {
      id: "8",
      projectCode: "PRJ008",
      projectName: "デジタル化推進プロジェクト",
      projectShortName: "DX推進",
      projectKanaName: "デジタルカスイシンプロジェクト",
      departmentCode: "ENGINEERING",
      responsibleEmployeeCode: "EMP007",
      responsibleEmployeeName: "山本 彩",
      plannedPeriodFrom: "2024-01-01T00:00:00Z",
      plannedPeriodTo: "2025-12-31T23:59:59Z",
      actualPeriodFrom: "2024-01-10T00:00:00Z",
      actualPeriodTo: null,
      budgetAmount: "50000000.00",
      version: 4,
      isActive: true,
      createdAt: "2023-12-15T09:00:00Z",
      updatedAt: "2024-06-01T10:00:00Z",
      createdBy: "admin",
      updatedBy: "yamamoto",
    },
    {
      id: "9",
      projectCode: "PRJ009",
      projectName: "顧客満足度向上プロジェクト",
      projectShortName: "顧客満足度",
      projectKanaName: "コキャクマンゾクドコウジョウプロジェクト",
      departmentCode: "SALES",
      responsibleEmployeeCode: "EMP008",
      responsibleEmployeeName: "中村 翔太",
      plannedPeriodFrom: "2024-07-01T00:00:00Z",
      plannedPeriodTo: "2024-12-31T23:59:59Z",
      actualPeriodFrom: null,
      actualPeriodTo: null,
      budgetAmount: "4000000.00",
      version: 0,
      isActive: true,
      createdAt: "2024-06-15T09:00:00Z",
      updatedAt: "2024-06-15T09:00:00Z",
      createdBy: "admin",
      updatedBy: "admin",
    },
    {
      id: "10",
      projectCode: "PRJ010",
      projectName: "海外展開プロジェクト",
      projectShortName: "海外展開",
      projectKanaName: "カイガイテンカイプロジェクト",
      departmentCode: "SALES",
      responsibleEmployeeCode: "EMP009",
      responsibleEmployeeName: "小林 真由美",
      plannedPeriodFrom: "2024-08-01T00:00:00Z",
      plannedPeriodTo: "2026-07-31T23:59:59Z",
      actualPeriodFrom: null,
      actualPeriodTo: null,
      budgetAmount: "100000000.00",
      version: 1,
      isActive: true,
      createdAt: "2024-07-01T09:00:00Z",
      updatedAt: "2024-07-15T14:00:00Z",
      createdBy: "admin",
      updatedBy: "kobayashi",
    },
    {
      id: "11",
      projectCode: "PRJ011",
      projectName: "セキュリティ強化プロジェクト",
      projectShortName: "セキュリティ",
      projectKanaName: "セキュリティキョウカプロジェクト",
      departmentCode: "ENGINEERING",
      responsibleEmployeeCode: "EMP010",
      responsibleEmployeeName: "加藤 優",
      plannedPeriodFrom: "2024-09-01T00:00:00Z",
      plannedPeriodTo: "2025-03-31T23:59:59Z",
      actualPeriodFrom: "2024-09-01T00:00:00Z",
      actualPeriodTo: null,
      budgetAmount: "15000000.00",
      version: 2,
      isActive: true,
      createdAt: "2024-08-01T09:00:00Z",
      updatedAt: "2024-09-15T11:30:00Z",
      createdBy: "admin",
      updatedBy: "kato",
    },
    {
      id: "12",
      projectCode: "PRJ012",
      projectName: "サプライチェーン最適化プロジェクト",
      projectShortName: "SCM最適化",
      projectKanaName: "サプライチェーンサイテキカプロジェクト",
      departmentCode: "FINANCE",
      responsibleEmployeeCode: "EMP001",
      responsibleEmployeeName: "田中 太郎",
      plannedPeriodFrom: "2024-10-01T00:00:00Z",
      plannedPeriodTo: "2025-09-30T23:59:59Z",
      actualPeriodFrom: null,
      actualPeriodTo: null,
      budgetAmount: "20000000.00",
      version: 0,
      isActive: true,
      createdAt: "2024-09-15T09:00:00Z",
      updatedAt: "2024-09-15T09:00:00Z",
      createdBy: "admin",
      updatedBy: "admin",
    },
    {
      id: "13",
      projectCode: "PRJ013",
      projectName: "レガシーシステム廃止プロジェクト",
      projectShortName: "レガシー廃止",
      projectKanaName: "レガシーシステムハイシプロジェクト",
      departmentCode: "ENGINEERING",
      responsibleEmployeeCode: "EMP003",
      responsibleEmployeeName: "鈴木 一郎",
      plannedPeriodFrom: "2023-01-01T00:00:00Z",
      plannedPeriodTo: "2023-12-31T23:59:59Z",
      actualPeriodFrom: "2023-01-15T00:00:00Z",
      actualPeriodTo: "2023-12-28T23:59:59Z",
      budgetAmount: "18000000.00",
      version: 8,
      isActive: false,
      createdAt: "2022-12-01T09:00:00Z",
      updatedAt: "2024-01-05T09:00:00Z",
      createdBy: "admin",
      updatedBy: "suzuki",
    },
    {
      id: "14",
      projectCode: "PRJ014",
      projectName: "環境対応プロジェクト",
      projectShortName: "環境対応",
      projectKanaName: "カンキョウタイオウプロジェクト",
      departmentCode: null,
      responsibleEmployeeCode: null,
      responsibleEmployeeName: null,
      plannedPeriodFrom: "2024-11-01T00:00:00Z",
      plannedPeriodTo: "2026-10-31T23:59:59Z",
      actualPeriodFrom: null,
      actualPeriodTo: null,
      budgetAmount: "30000000.00",
      version: 0,
      isActive: true,
      createdAt: "2024-10-15T09:00:00Z",
      updatedAt: "2024-10-15T09:00:00Z",
      createdBy: "admin",
      updatedBy: "admin",
    },
    {
      id: "15",
      projectCode: "PRJ015",
      projectName: "データ分析基盤構築プロジェクト",
      projectShortName: "データ分析",
      projectKanaName: "データブンセキキバンコウチクプロジェクト",
      departmentCode: "ENGINEERING",
      responsibleEmployeeCode: "EMP007",
      responsibleEmployeeName: "山本 彩",
      plannedPeriodFrom: "2024-12-01T00:00:00Z",
      plannedPeriodTo: "2025-11-30T23:59:59Z",
      actualPeriodFrom: null,
      actualPeriodTo: null,
      budgetAmount: "35000000.00",
      version: 0,
      isActive: true,
      createdAt: "2024-11-15T09:00:00Z",
      updatedAt: "2024-11-15T09:00:00Z",
      createdBy: "admin",
      updatedBy: "admin",
    },
  ]

  async list(params: ListProjectMasterRequest): Promise<ListProjectMasterResponse> {
    // Simulate network delay
    await this.delay(300)

    let filtered = [...this.projects]

    // Apply filters
    if (!params.includeInactive) {
      filtered = filtered.filter((p) => p.isActive)
    }

    if (params.projectCode) {
      filtered = filtered.filter((p) => p.projectCode === params.projectCode)
    }

    if (params.projectName) {
      filtered = filtered.filter((p) => p.projectName.includes(params.projectName!))
    }

    if (params.projectShortName) {
      filtered = filtered.filter((p) => p.projectShortName && p.projectShortName.includes(params.projectShortName!))
    }

    if (params.departmentCode) {
      filtered = filtered.filter((p) => p.departmentCode === params.departmentCode)
    }

    if (params.responsibleEmployeeCode) {
      filtered = filtered.filter((p) => p.responsibleEmployeeCode === params.responsibleEmployeeCode)
    }

    // Apply sorting
    const sortBy = params.sortBy || "projectCode"
    const sortOrder = params.sortOrder || "asc"

    filtered.sort((a, b) => {
      let aVal: any
      let bVal: any

      switch (sortBy) {
        case "projectCode":
          aVal = a.projectCode
          bVal = b.projectCode
          break
        case "projectName":
          aVal = a.projectName
          bVal = b.projectName
          break
        case "projectShortName":
          aVal = a.projectShortName || ""
          bVal = b.projectShortName || ""
          break
        case "plannedPeriodFrom":
          aVal = new Date(a.plannedPeriodFrom).getTime()
          bVal = new Date(b.plannedPeriodFrom).getTime()
          break
        case "budgetAmount":
          aVal = Number(a.budgetAmount)
          bVal = Number(b.budgetAmount)
          break
        default:
          aVal = a.projectCode
          bVal = b.projectCode
      }

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1
      return 0
    })

    // Apply pagination
    const page = params.page || 1
    const pageSize = params.pageSize || 50
    const start = (page - 1) * pageSize
    const end = start + pageSize

    const items: ProjectMasterListItem[] = filtered.slice(start, end).map((p) => ({
      id: p.id,
      projectCode: p.projectCode,
      projectName: p.projectName,
      projectShortName: p.projectShortName,
      projectKanaName: p.projectKanaName,
      departmentCode: p.departmentCode,
      responsibleEmployeeCode: p.responsibleEmployeeCode,
      responsibleEmployeeName: p.responsibleEmployeeName,
      plannedPeriodFrom: p.plannedPeriodFrom,
      plannedPeriodTo: p.plannedPeriodTo,
      budgetAmount: p.budgetAmount,
      isActive: p.isActive,
    }))

    return {
      items,
      page,
      pageSize,
      totalCount: filtered.length,
    }
  }

  async findById(id: string): Promise<ProjectMasterDetailResponse> {
    await this.delay(200)

    const project = this.projects.find((p) => p.id === id)

    if (!project) {
      throw { status: 404, message: "Project not found" }
    }

    return { ...project }
  }

  async create(data: CreateProjectMasterRequest): Promise<ProjectMasterDetailResponse> {
    await this.delay(500)

    // Check for duplicate project code
    const duplicate = this.projects.find((p) => p.projectCode === data.projectCode)
    if (duplicate) {
      throw {
        status: 409,
        code: "PROJECT_CODE_DUPLICATE",
        message: "Project code already exists",
      }
    }

    const newProject: ProjectMasterDetailResponse = {
      id: String(this.projects.length + 1),
      projectCode: data.projectCode,
      projectName: data.projectName,
      projectShortName: data.projectShortName,
      projectKanaName: data.projectKanaName,
      departmentCode: data.departmentCode,
      responsibleEmployeeCode: data.responsibleEmployeeCode,
      responsibleEmployeeName: data.responsibleEmployeeName,
      plannedPeriodFrom: data.plannedPeriodFrom,
      plannedPeriodTo: data.plannedPeriodTo,
      actualPeriodFrom: data.actualPeriodFrom,
      actualPeriodTo: data.actualPeriodTo,
      budgetAmount: data.budgetAmount,
      version: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: "current-user",
      updatedBy: "current-user",
    }

    this.projects.push(newProject)

    return { ...newProject }
  }

  async update(id: string, data: UpdateProjectMasterRequest): Promise<ProjectMasterDetailResponse> {
    await this.delay(500)

    const project = this.projects.find((p) => p.id === id)

    if (!project) {
      throw { status: 404, message: "Project not found" }
    }

    // Simulate optimistic lock conflict (10% chance)
    if (Math.random() < 0.1 || project.version !== data.ifMatchVersion) {
      throw {
        status: 409,
        code: "STALE_UPDATE",
        message: "Optimistic lock conflict",
      }
    }

    // Update project
    if (data.projectName !== undefined) project.projectName = data.projectName
    if (data.projectShortName !== undefined) project.projectShortName = data.projectShortName
    if (data.projectKanaName !== undefined) project.projectKanaName = data.projectKanaName
    if (data.departmentCode !== undefined) project.departmentCode = data.departmentCode
    if (data.responsibleEmployeeCode !== undefined) project.responsibleEmployeeCode = data.responsibleEmployeeCode
    if (data.responsibleEmployeeName !== undefined) project.responsibleEmployeeName = data.responsibleEmployeeName
    if (data.plannedPeriodFrom !== undefined) project.plannedPeriodFrom = data.plannedPeriodFrom
    if (data.plannedPeriodTo !== undefined) project.plannedPeriodTo = data.plannedPeriodTo
    if (data.actualPeriodFrom !== undefined) project.actualPeriodFrom = data.actualPeriodFrom
    if (data.actualPeriodTo !== undefined) project.actualPeriodTo = data.actualPeriodTo
    if (data.budgetAmount !== undefined) project.budgetAmount = data.budgetAmount

    project.version += 1
    project.updatedAt = new Date().toISOString()
    project.updatedBy = "current-user"

    return { ...project }
  }

  async deactivate(id: string, ifMatchVersion: number): Promise<ProjectMasterDetailResponse> {
    await this.delay(300)

    const project = this.projects.find((p) => p.id === id)

    if (!project) {
      throw { status: 404, message: "Project not found" }
    }

    if (project.version !== ifMatchVersion) {
      throw {
        status: 409,
        code: "STALE_UPDATE",
        message: "Optimistic lock conflict",
      }
    }

    if (!project.isActive) {
      throw {
        status: 409,
        code: "PROJECT_ALREADY_INACTIVE",
        message: "Project is already inactive",
      }
    }

    project.isActive = false
    project.version += 1
    project.updatedAt = new Date().toISOString()
    project.updatedBy = "current-user"

    return { ...project }
  }

  async reactivate(id: string, ifMatchVersion: number): Promise<ProjectMasterDetailResponse> {
    await this.delay(300)

    const project = this.projects.find((p) => p.id === id)

    if (!project) {
      throw { status: 404, message: "Project not found" }
    }

    if (project.version !== ifMatchVersion) {
      throw {
        status: 409,
        code: "STALE_UPDATE",
        message: "Optimistic lock conflict",
      }
    }

    if (project.isActive) {
      throw {
        status: 409,
        code: "PROJECT_ALREADY_ACTIVE",
        message: "Project is already active",
      }
    }

    project.isActive = true
    project.version += 1
    project.updatedAt = new Date().toISOString()
    project.updatedBy = "current-user"

    return { ...project }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
