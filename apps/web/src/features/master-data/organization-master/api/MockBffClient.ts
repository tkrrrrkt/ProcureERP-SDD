/**
 * MockBffClient - Organization Master
 *
 * 開発・テスト用のモック実装
 * BFF Contractsに準拠したレスポンスを返す
 */

import type { BffClient } from './BffClient';
import type {
  VersionSummaryDto,
  VersionDetailDto,
  DepartmentTreeNodeDto,
  DepartmentDetailDto,
  ListVersionsRequest,
  ListVersionsResponse,
  GetVersionResponse,
  CreateVersionRequest,
  CreateVersionResponse,
  CopyVersionRequest,
  CopyVersionResponse,
  UpdateVersionRequest,
  UpdateVersionResponse,
  AsOfSearchRequest,
  AsOfSearchResponse,
  ListDepartmentsTreeRequest,
  ListDepartmentsTreeResponse,
  GetDepartmentResponse,
  CreateDepartmentRequest,
  CreateDepartmentResponse,
  UpdateDepartmentRequest,
  UpdateDepartmentResponse,
  MoveDepartmentRequest,
  MoveDepartmentResponse,
  DeactivateDepartmentResponse,
  ReactivateDepartmentResponse,
} from '@contracts/bff/organization-master';
import type { BffError } from '../lib/types';

// =============================================================================
// Mock Data
// =============================================================================

const mockVersions: VersionDetailDto[] = [
  {
    id: 'v1',
    versionCode: '2024-Q4',
    versionName: '2024年度第4四半期版',
    effectiveDate: '2024-10-01',
    expiryDate: '2024-12-31',
    baseVersionId: null,
    description: '2024年度下期の組織改編を反映',
    isCurrentlyEffective: false,
    createdAt: '2024-09-15T10:00:00Z',
    updatedAt: '2024-09-15T10:00:00Z',
  },
  {
    id: 'v2',
    versionCode: '2025-Q1',
    versionName: '2025年度第1四半期版',
    effectiveDate: '2025-01-01',
    expiryDate: null,
    baseVersionId: 'v1',
    description: '2025年度上期の組織体制',
    isCurrentlyEffective: true,
    createdAt: '2024-12-01T10:00:00Z',
    updatedAt: '2024-12-01T10:00:00Z',
  },
];

const mockDepartments: Record<string, DepartmentDetailDto[]> = {
  v1: [
    {
      id: 'd1',
      versionId: 'v1',
      stableId: 's1',
      departmentCode: 'HEAD',
      departmentName: '本社',
      departmentNameShort: '本社',
      parentId: null,
      parentDepartmentName: null,
      sortOrder: 0,
      hierarchyLevel: 0,
      hierarchyPath: '/HEAD',
      isActive: true,
      postalCode: '100-0001',
      addressLine1: '東京都千代田区丸の内1-1-1',
      addressLine2: '本社ビル',
      phoneNumber: '03-1234-5678',
      description: '本社部門',
      createdAt: '2024-09-15T10:00:00Z',
      updatedAt: '2024-09-15T10:00:00Z',
    },
    {
      id: 'd2',
      versionId: 'v1',
      stableId: 's2',
      departmentCode: 'SALES',
      departmentName: '営業部',
      departmentNameShort: '営業',
      parentId: 'd1',
      parentDepartmentName: '本社',
      sortOrder: 1,
      hierarchyLevel: 1,
      hierarchyPath: '/HEAD/SALES',
      isActive: true,
      postalCode: null,
      addressLine1: null,
      addressLine2: null,
      phoneNumber: '03-1234-5679',
      description: '営業活動を担当',
      createdAt: '2024-09-15T10:00:00Z',
      updatedAt: '2024-09-15T10:00:00Z',
    },
    {
      id: 'd3',
      versionId: 'v1',
      stableId: 's3',
      departmentCode: 'SALES-1',
      departmentName: '第一営業課',
      departmentNameShort: '一営',
      parentId: 'd2',
      parentDepartmentName: '営業部',
      sortOrder: 1,
      hierarchyLevel: 2,
      hierarchyPath: '/HEAD/SALES/SALES-1',
      isActive: true,
      postalCode: null,
      addressLine1: null,
      addressLine2: null,
      phoneNumber: null,
      description: null,
      createdAt: '2024-09-15T10:00:00Z',
      updatedAt: '2024-09-15T10:00:00Z',
    },
    {
      id: 'd4',
      versionId: 'v1',
      stableId: 's4',
      departmentCode: 'SALES-2',
      departmentName: '第二営業課',
      departmentNameShort: '二営',
      parentId: 'd2',
      parentDepartmentName: '営業部',
      sortOrder: 2,
      hierarchyLevel: 2,
      hierarchyPath: '/HEAD/SALES/SALES-2',
      isActive: true,
      postalCode: null,
      addressLine1: null,
      addressLine2: null,
      phoneNumber: null,
      description: null,
      createdAt: '2024-09-15T10:00:00Z',
      updatedAt: '2024-09-15T10:00:00Z',
    },
    {
      id: 'd5',
      versionId: 'v1',
      stableId: 's5',
      departmentCode: 'DEV',
      departmentName: '開発部',
      departmentNameShort: '開発',
      parentId: 'd1',
      parentDepartmentName: '本社',
      sortOrder: 2,
      hierarchyLevel: 1,
      hierarchyPath: '/HEAD/DEV',
      isActive: true,
      postalCode: null,
      addressLine1: null,
      addressLine2: null,
      phoneNumber: '03-1234-5680',
      description: 'プロダクト開発を担当',
      createdAt: '2024-09-15T10:00:00Z',
      updatedAt: '2024-09-15T10:00:00Z',
    },
    {
      id: 'd6',
      versionId: 'v1',
      stableId: 's6',
      departmentCode: 'ADMIN',
      departmentName: '管理部',
      departmentNameShort: '管理',
      parentId: 'd1',
      parentDepartmentName: '本社',
      sortOrder: 3,
      hierarchyLevel: 1,
      hierarchyPath: '/HEAD/ADMIN',
      isActive: false,
      postalCode: null,
      addressLine1: null,
      addressLine2: null,
      phoneNumber: null,
      description: '（統合により無効化）',
      createdAt: '2024-09-15T10:00:00Z',
      updatedAt: '2024-10-01T10:00:00Z',
    },
  ],
  v2: [
    {
      id: 'd7',
      versionId: 'v2',
      stableId: 's1',
      departmentCode: 'HEAD',
      departmentName: '本社',
      departmentNameShort: '本社',
      parentId: null,
      parentDepartmentName: null,
      sortOrder: 0,
      hierarchyLevel: 0,
      hierarchyPath: '/HEAD',
      isActive: true,
      postalCode: '100-0001',
      addressLine1: '東京都千代田区丸の内1-1-1',
      addressLine2: '本社ビル',
      phoneNumber: '03-1234-5678',
      description: '本社部門',
      createdAt: '2024-12-01T10:00:00Z',
      updatedAt: '2024-12-01T10:00:00Z',
    },
    {
      id: 'd8',
      versionId: 'v2',
      stableId: 's2',
      departmentCode: 'SALES',
      departmentName: '営業本部',
      departmentNameShort: '営本',
      parentId: 'd7',
      parentDepartmentName: '本社',
      sortOrder: 1,
      hierarchyLevel: 1,
      hierarchyPath: '/HEAD/SALES',
      isActive: true,
      postalCode: null,
      addressLine1: null,
      addressLine2: null,
      phoneNumber: '03-1234-5679',
      description: '営業活動の統括',
      createdAt: '2024-12-01T10:00:00Z',
      updatedAt: '2024-12-01T10:00:00Z',
    },
    {
      id: 'd8-1',
      versionId: 'v2',
      stableId: 's2-1',
      departmentCode: 'SALES-1',
      departmentName: '第一営業部',
      departmentNameShort: '一営',
      parentId: 'd8',
      parentDepartmentName: '営業本部',
      sortOrder: 1,
      hierarchyLevel: 2,
      hierarchyPath: '/HEAD/SALES/SALES-1',
      isActive: true,
      postalCode: null,
      addressLine1: null,
      addressLine2: null,
      phoneNumber: null,
      description: '国内大手企業向け営業',
      createdAt: '2024-12-01T10:00:00Z',
      updatedAt: '2024-12-01T10:00:00Z',
    },
    {
      id: 'd8-1-1',
      versionId: 'v2',
      stableId: 's2-1-1',
      departmentCode: 'SALES-1-E',
      departmentName: '東日本営業課',
      departmentNameShort: '東営',
      parentId: 'd8-1',
      parentDepartmentName: '第一営業部',
      sortOrder: 1,
      hierarchyLevel: 3,
      hierarchyPath: '/HEAD/SALES/SALES-1/SALES-1-E',
      isActive: true,
      postalCode: null,
      addressLine1: null,
      addressLine2: null,
      phoneNumber: null,
      description: '東日本エリア担当',
      createdAt: '2024-12-01T10:00:00Z',
      updatedAt: '2024-12-01T10:00:00Z',
    },
    {
      id: 'd8-1-2',
      versionId: 'v2',
      stableId: 's2-1-2',
      departmentCode: 'SALES-1-W',
      departmentName: '西日本営業課',
      departmentNameShort: '西営',
      parentId: 'd8-1',
      parentDepartmentName: '第一営業部',
      sortOrder: 2,
      hierarchyLevel: 3,
      hierarchyPath: '/HEAD/SALES/SALES-1/SALES-1-W',
      isActive: true,
      postalCode: null,
      addressLine1: null,
      addressLine2: null,
      phoneNumber: null,
      description: '西日本エリア担当',
      createdAt: '2024-12-01T10:00:00Z',
      updatedAt: '2024-12-01T10:00:00Z',
    },
    {
      id: 'd8-2',
      versionId: 'v2',
      stableId: 's2-2',
      departmentCode: 'SALES-2',
      departmentName: '第二営業部',
      departmentNameShort: '二営',
      parentId: 'd8',
      parentDepartmentName: '営業本部',
      sortOrder: 2,
      hierarchyLevel: 2,
      hierarchyPath: '/HEAD/SALES/SALES-2',
      isActive: true,
      postalCode: null,
      addressLine1: null,
      addressLine2: null,
      phoneNumber: null,
      description: '中小企業向け営業',
      createdAt: '2024-12-01T10:00:00Z',
      updatedAt: '2024-12-01T10:00:00Z',
    },
    {
      id: 'd8-3',
      versionId: 'v2',
      stableId: 's2-3',
      departmentCode: 'SALES-OS',
      departmentName: '海外営業部',
      departmentNameShort: '海営',
      parentId: 'd8',
      parentDepartmentName: '営業本部',
      sortOrder: 3,
      hierarchyLevel: 2,
      hierarchyPath: '/HEAD/SALES/SALES-OS',
      isActive: true,
      postalCode: null,
      addressLine1: null,
      addressLine2: null,
      phoneNumber: null,
      description: '海外拠点向け営業',
      createdAt: '2024-12-01T10:00:00Z',
      updatedAt: '2024-12-01T10:00:00Z',
    },
    {
      id: 'd9',
      versionId: 'v2',
      stableId: 's5',
      departmentCode: 'DEV',
      departmentName: '技術本部',
      departmentNameShort: '技本',
      parentId: 'd7',
      parentDepartmentName: '本社',
      sortOrder: 2,
      hierarchyLevel: 1,
      hierarchyPath: '/HEAD/DEV',
      isActive: true,
      postalCode: null,
      addressLine1: null,
      addressLine2: null,
      phoneNumber: '03-1234-5680',
      description: 'プロダクト開発と技術戦略',
      createdAt: '2024-12-01T10:00:00Z',
      updatedAt: '2024-12-01T10:00:00Z',
    },
    {
      id: 'd9-1',
      versionId: 'v2',
      stableId: 's5-1',
      departmentCode: 'DEV-FE',
      departmentName: 'フロントエンド開発部',
      departmentNameShort: 'FE開発',
      parentId: 'd9',
      parentDepartmentName: '技術本部',
      sortOrder: 1,
      hierarchyLevel: 2,
      hierarchyPath: '/HEAD/DEV/DEV-FE',
      isActive: true,
      postalCode: null,
      addressLine1: null,
      addressLine2: null,
      phoneNumber: null,
      description: 'フロントエンド技術',
      createdAt: '2024-12-01T10:00:00Z',
      updatedAt: '2024-12-01T10:00:00Z',
    },
    {
      id: 'd9-2',
      versionId: 'v2',
      stableId: 's5-2',
      departmentCode: 'DEV-BE',
      departmentName: 'バックエンド開発部',
      departmentNameShort: 'BE開発',
      parentId: 'd9',
      parentDepartmentName: '技術本部',
      sortOrder: 2,
      hierarchyLevel: 2,
      hierarchyPath: '/HEAD/DEV/DEV-BE',
      isActive: true,
      postalCode: null,
      addressLine1: null,
      addressLine2: null,
      phoneNumber: null,
      description: 'バックエンド技術',
      createdAt: '2024-12-01T10:00:00Z',
      updatedAt: '2024-12-01T10:00:00Z',
    },
    {
      id: 'd9-3',
      versionId: 'v2',
      stableId: 's5-3',
      departmentCode: 'DEV-INFRA',
      departmentName: 'インフラ部',
      departmentNameShort: 'インフラ',
      parentId: 'd9',
      parentDepartmentName: '技術本部',
      sortOrder: 3,
      hierarchyLevel: 2,
      hierarchyPath: '/HEAD/DEV/DEV-INFRA',
      isActive: true,
      postalCode: null,
      addressLine1: null,
      addressLine2: null,
      phoneNumber: null,
      description: 'インフラ・SRE',
      createdAt: '2024-12-01T10:00:00Z',
      updatedAt: '2024-12-01T10:00:00Z',
    },
    {
      id: 'd10',
      versionId: 'v2',
      stableId: 's6',
      departmentCode: 'CORP',
      departmentName: '経営管理本部',
      departmentNameShort: '経管',
      parentId: 'd7',
      parentDepartmentName: '本社',
      sortOrder: 3,
      hierarchyLevel: 1,
      hierarchyPath: '/HEAD/CORP',
      isActive: true,
      postalCode: null,
      addressLine1: null,
      addressLine2: null,
      phoneNumber: '03-1234-5681',
      description: '経営管理・コーポレート機能',
      createdAt: '2024-12-01T10:00:00Z',
      updatedAt: '2024-12-01T10:00:00Z',
    },
    {
      id: 'd10-1',
      versionId: 'v2',
      stableId: 's6-1',
      departmentCode: 'CORP-HR',
      departmentName: '人事部',
      departmentNameShort: '人事',
      parentId: 'd10',
      parentDepartmentName: '経営管理本部',
      sortOrder: 1,
      hierarchyLevel: 2,
      hierarchyPath: '/HEAD/CORP/CORP-HR',
      isActive: true,
      postalCode: null,
      addressLine1: null,
      addressLine2: null,
      phoneNumber: null,
      description: '人事・採用・労務',
      createdAt: '2024-12-01T10:00:00Z',
      updatedAt: '2024-12-01T10:00:00Z',
    },
    {
      id: 'd10-2',
      versionId: 'v2',
      stableId: 's6-2',
      departmentCode: 'CORP-FIN',
      departmentName: '財務経理部',
      departmentNameShort: '財経',
      parentId: 'd10',
      parentDepartmentName: '経営管理本部',
      sortOrder: 2,
      hierarchyLevel: 2,
      hierarchyPath: '/HEAD/CORP/CORP-FIN',
      isActive: true,
      postalCode: null,
      addressLine1: null,
      addressLine2: null,
      phoneNumber: null,
      description: '財務・経理',
      createdAt: '2024-12-01T10:00:00Z',
      updatedAt: '2024-12-01T10:00:00Z',
    },
    {
      id: 'd10-3',
      versionId: 'v2',
      stableId: 's6-3',
      departmentCode: 'CORP-LEGAL',
      departmentName: '法務部',
      departmentNameShort: '法務',
      parentId: 'd10',
      parentDepartmentName: '経営管理本部',
      sortOrder: 3,
      hierarchyLevel: 2,
      hierarchyPath: '/HEAD/CORP/CORP-LEGAL',
      isActive: true,
      postalCode: null,
      addressLine1: null,
      addressLine2: null,
      phoneNumber: null,
      description: '法務・コンプライアンス',
      createdAt: '2024-12-01T10:00:00Z',
      updatedAt: '2024-12-01T10:00:00Z',
    },
  ],
};

// =============================================================================
// Helper Functions
// =============================================================================

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function buildTree(
  departments: DepartmentDetailDto[],
  keyword?: string,
  showInactive?: boolean
): DepartmentTreeNodeDto[] {
  // フィルタリング
  let filtered = departments;

  if (showInactive === false) {
    filtered = filtered.filter((d) => d.isActive);
  }

  if (keyword) {
    const lowerKeyword = keyword.toLowerCase();
    filtered = filtered.filter(
      (d) =>
        d.departmentCode.toLowerCase().includes(lowerKeyword) ||
        d.departmentName.toLowerCase().includes(lowerKeyword)
    );
  }

  // ツリー構築
  const nodeMap = new Map<string, DepartmentTreeNodeDto>();
  const roots: DepartmentTreeNodeDto[] = [];

  // まずノードを作成
  for (const dept of filtered) {
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

  // 親子関係を構築
  for (const dept of filtered) {
    const node = nodeMap.get(dept.id)!;
    if (dept.parentId && nodeMap.has(dept.parentId)) {
      nodeMap.get(dept.parentId)!.children.push(node);
    } else if (!dept.parentId) {
      roots.push(node);
    } else {
      // 親がフィルタで除外されている場合はルートに追加
      roots.push(node);
    }
  }

  // sortOrderでソート
  const sortNodes = (nodes: DepartmentTreeNodeDto[]): void => {
    nodes.sort((a, b) => {
      const deptA = filtered.find((d) => d.id === a.id);
      const deptB = filtered.find((d) => d.id === b.id);
      return (deptA?.sortOrder ?? 0) - (deptB?.sortOrder ?? 0);
    });
    nodes.forEach((n) => sortNodes(n.children));
  };
  sortNodes(roots);

  return roots;
}

function throwBffError(code: string, message: string): never {
  const error: BffError = { code: code as BffError['code'], message };
  throw error;
}

// =============================================================================
// MockBffClient Implementation
// =============================================================================

export class MockBffClient implements BffClient {
  private versions = [...mockVersions];
  private departments = JSON.parse(
    JSON.stringify(mockDepartments)
  ) as typeof mockDepartments;

  // ===========================================================================
  // Version Operations
  // ===========================================================================

  async listVersions(
    request: ListVersionsRequest
  ): Promise<ListVersionsResponse> {
    await delay(300);

    let items: VersionSummaryDto[] = this.versions.map((v) => ({
      id: v.id,
      versionCode: v.versionCode,
      versionName: v.versionName,
      effectiveDate: v.effectiveDate,
      expiryDate: v.expiryDate,
      isCurrentlyEffective: v.isCurrentlyEffective,
      departmentCount: this.departments[v.id]?.length ?? 0,
    }));

    // ソート
    const sortBy = request.sortBy ?? 'effectiveDate';
    const sortOrder = request.sortOrder ?? 'desc';

    items.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'effectiveDate') {
        cmp = a.effectiveDate.localeCompare(b.effectiveDate);
      } else if (sortBy === 'versionCode') {
        cmp = a.versionCode.localeCompare(b.versionCode);
      } else if (sortBy === 'versionName') {
        cmp = a.versionName.localeCompare(b.versionName);
      }
      return sortOrder === 'asc' ? cmp : -cmp;
    });

    return { items };
  }

  async getVersion(versionId: string): Promise<GetVersionResponse> {
    await delay(200);

    const version = this.versions.find((v) => v.id === versionId);
    if (!version) {
      throwBffError('VERSION_NOT_FOUND', 'バージョンが見つかりません');
    }

    return { version };
  }

  async createVersion(
    request: CreateVersionRequest
  ): Promise<CreateVersionResponse> {
    await delay(400);

    // 重複チェック
    if (this.versions.some((v) => v.versionCode === request.versionCode)) {
      throwBffError(
        'VERSION_CODE_DUPLICATE',
        '同じバージョンコードが既に存在します'
      );
    }

    const now = new Date().toISOString();
    const newVersion: VersionDetailDto = {
      id: generateId(),
      versionCode: request.versionCode,
      versionName: request.versionName,
      effectiveDate: request.effectiveDate,
      expiryDate: request.expiryDate ?? null,
      baseVersionId: null,
      description: request.description ?? null,
      isCurrentlyEffective: false,
      createdAt: now,
      updatedAt: now,
    };

    this.versions.push(newVersion);
    this.departments[newVersion.id] = [];

    return { version: newVersion };
  }

  async copyVersion(
    sourceVersionId: string,
    request: CopyVersionRequest
  ): Promise<CopyVersionResponse> {
    await delay(500);

    const sourceVersion = this.versions.find((v) => v.id === sourceVersionId);
    if (!sourceVersion) {
      throwBffError('VERSION_NOT_FOUND', 'コピー元バージョンが見つかりません');
    }

    if (this.versions.some((v) => v.versionCode === request.versionCode)) {
      throwBffError(
        'VERSION_CODE_DUPLICATE',
        '同じバージョンコードが既に存在します'
      );
    }

    const now = new Date().toISOString();
    const newVersion: VersionDetailDto = {
      id: generateId(),
      versionCode: request.versionCode,
      versionName: request.versionName,
      effectiveDate: request.effectiveDate,
      expiryDate: request.expiryDate ?? null,
      baseVersionId: sourceVersionId,
      description: request.description ?? null,
      isCurrentlyEffective: false,
      createdAt: now,
      updatedAt: now,
    };

    this.versions.push(newVersion);

    // 部門もコピー
    const sourceDepts = this.departments[sourceVersionId] ?? [];
    const idMapping = new Map<string, string>();

    const copiedDepts = sourceDepts.map((d) => {
      const newId = generateId();
      idMapping.set(d.id, newId);
      return {
        ...d,
        id: newId,
        versionId: newVersion.id,
        createdAt: now,
        updatedAt: now,
      };
    });

    // 親IDを新しいIDに変換
    copiedDepts.forEach((d) => {
      if (d.parentId && idMapping.has(d.parentId)) {
        d.parentId = idMapping.get(d.parentId)!;
      }
    });

    this.departments[newVersion.id] = copiedDepts;

    return { version: newVersion };
  }

  async updateVersion(
    versionId: string,
    request: UpdateVersionRequest
  ): Promise<UpdateVersionResponse> {
    await delay(300);

    const idx = this.versions.findIndex((v) => v.id === versionId);
    if (idx === -1) {
      throwBffError('VERSION_NOT_FOUND', 'バージョンが見つかりません');
    }

    if (
      request.versionCode &&
      this.versions.some(
        (v) => v.id !== versionId && v.versionCode === request.versionCode
      )
    ) {
      throwBffError(
        'VERSION_CODE_DUPLICATE',
        '同じバージョンコードが既に存在します'
      );
    }

    const version = this.versions[idx];
    const updated: VersionDetailDto = {
      ...version,
      versionCode: request.versionCode ?? version.versionCode,
      versionName: request.versionName ?? version.versionName,
      effectiveDate: request.effectiveDate ?? version.effectiveDate,
      expiryDate:
        request.expiryDate === null
          ? null
          : request.expiryDate ?? version.expiryDate,
      description:
        request.description === null
          ? null
          : request.description ?? version.description,
      updatedAt: new Date().toISOString(),
    };

    this.versions[idx] = updated;

    return { version: updated };
  }

  async findEffectiveAsOf(
    request: AsOfSearchRequest
  ): Promise<AsOfSearchResponse> {
    await delay(200);

    const asOfDate = new Date(request.asOfDate);

    const effectiveVersion = this.versions.find((v) => {
      const effectiveDate = new Date(v.effectiveDate);
      const expiryDate = v.expiryDate ? new Date(v.expiryDate) : null;

      const afterStart = asOfDate >= effectiveDate;
      const beforeEnd = !expiryDate || asOfDate <= expiryDate;

      return afterStart && beforeEnd;
    });

    return { version: effectiveVersion ?? null };
  }

  // ===========================================================================
  // Department Operations
  // ===========================================================================

  async listDepartmentsTree(
    versionId: string,
    request: ListDepartmentsTreeRequest
  ): Promise<ListDepartmentsTreeResponse> {
    await delay(300);

    const version = this.versions.find((v) => v.id === versionId);
    if (!version) {
      throwBffError('VERSION_NOT_FOUND', 'バージョンが見つかりません');
    }

    const departments = this.departments[versionId] ?? [];
    const showInactive = request.isActive !== true;
    const nodes = buildTree(departments, request.keyword, showInactive);

    return {
      versionId,
      versionCode: version.versionCode,
      nodes,
    };
  }

  async getDepartment(departmentId: string): Promise<GetDepartmentResponse> {
    await delay(200);

    for (const depts of Object.values(this.departments)) {
      const department = depts.find((d) => d.id === departmentId);
      if (department) {
        return { department };
      }
    }

    throwBffError('DEPARTMENT_NOT_FOUND', '部門が見つかりません');
  }

  async createDepartment(
    versionId: string,
    request: CreateDepartmentRequest
  ): Promise<CreateDepartmentResponse> {
    await delay(400);

    const version = this.versions.find((v) => v.id === versionId);
    if (!version) {
      throwBffError('VERSION_NOT_FOUND', 'バージョンが見つかりません');
    }

    const depts = this.departments[versionId] ?? [];

    if (depts.some((d) => d.departmentCode === request.departmentCode)) {
      throwBffError(
        'DEPARTMENT_CODE_DUPLICATE',
        '同じ部門コードが既に存在します'
      );
    }

    let parentDepartmentName: string | null = null;
    let hierarchyLevel = 0;
    let hierarchyPath = `/${request.departmentCode}`;

    if (request.parentId) {
      const parent = depts.find((d) => d.id === request.parentId);
      if (!parent) {
        throwBffError('PARENT_DEPARTMENT_NOT_FOUND', '親部門が見つかりません');
      }
      parentDepartmentName = parent.departmentName;
      hierarchyLevel = parent.hierarchyLevel + 1;
      hierarchyPath = `${parent.hierarchyPath}/${request.departmentCode}`;
    }

    const now = new Date().toISOString();
    const newDepartment: DepartmentDetailDto = {
      id: generateId(),
      versionId,
      stableId: generateId(),
      departmentCode: request.departmentCode,
      departmentName: request.departmentName,
      departmentNameShort: request.departmentNameShort ?? null,
      parentId: request.parentId ?? null,
      parentDepartmentName,
      sortOrder: request.sortOrder ?? 0,
      hierarchyLevel,
      hierarchyPath,
      isActive: true,
      postalCode: request.postalCode ?? null,
      addressLine1: request.addressLine1 ?? null,
      addressLine2: request.addressLine2 ?? null,
      phoneNumber: request.phoneNumber ?? null,
      description: request.description ?? null,
      createdAt: now,
      updatedAt: now,
    };

    if (!this.departments[versionId]) {
      this.departments[versionId] = [];
    }
    this.departments[versionId].push(newDepartment);

    return { department: newDepartment };
  }

  async updateDepartment(
    departmentId: string,
    request: UpdateDepartmentRequest
  ): Promise<UpdateDepartmentResponse> {
    await delay(300);

    for (const [versionId, depts] of Object.entries(this.departments)) {
      const idx = depts.findIndex((d) => d.id === departmentId);
      if (idx !== -1) {
        const dept = depts[idx];

        if (
          request.departmentCode &&
          depts.some(
            (d) =>
              d.id !== departmentId &&
              d.departmentCode === request.departmentCode
          )
        ) {
          throwBffError(
            'DEPARTMENT_CODE_DUPLICATE',
            '同じ部門コードが既に存在します'
          );
        }

        const updated: DepartmentDetailDto = {
          ...dept,
          departmentCode: request.departmentCode ?? dept.departmentCode,
          departmentName: request.departmentName ?? dept.departmentName,
          departmentNameShort:
            request.departmentNameShort === null
              ? null
              : request.departmentNameShort ?? dept.departmentNameShort,
          sortOrder: request.sortOrder ?? dept.sortOrder,
          postalCode:
            request.postalCode === null
              ? null
              : request.postalCode ?? dept.postalCode,
          addressLine1:
            request.addressLine1 === null
              ? null
              : request.addressLine1 ?? dept.addressLine1,
          addressLine2:
            request.addressLine2 === null
              ? null
              : request.addressLine2 ?? dept.addressLine2,
          phoneNumber:
            request.phoneNumber === null
              ? null
              : request.phoneNumber ?? dept.phoneNumber,
          description:
            request.description === null
              ? null
              : request.description ?? dept.description,
          updatedAt: new Date().toISOString(),
        };

        this.departments[versionId][idx] = updated;

        return { department: updated };
      }
    }

    throwBffError('DEPARTMENT_NOT_FOUND', '部門が見つかりません');
  }

  async moveDepartment(
    departmentId: string,
    request: MoveDepartmentRequest
  ): Promise<MoveDepartmentResponse> {
    await delay(400);

    for (const [versionId, depts] of Object.entries(this.departments)) {
      const idx = depts.findIndex((d) => d.id === departmentId);
      if (idx !== -1) {
        const dept = depts[idx];
        const version = this.versions.find((v) => v.id === versionId)!;

        // 循環参照チェック
        if (request.newParentId) {
          let parentId: string | null = request.newParentId;
          while (parentId) {
            if (parentId === departmentId) {
              throwBffError(
                'CIRCULAR_REFERENCE_DETECTED',
                '循環参照が検出されました'
              );
            }
            const parent = depts.find((d) => d.id === parentId);
            parentId = parent?.parentId ?? null;
          }
        }

        // 親情報を更新
        let parentDepartmentName: string | null = null;
        let hierarchyLevel = 0;
        let hierarchyPath = `/${dept.departmentCode}`;

        if (request.newParentId) {
          const newParent = depts.find((d) => d.id === request.newParentId);
          if (!newParent) {
            throwBffError(
              'PARENT_DEPARTMENT_NOT_FOUND',
              '移動先の親部門が見つかりません'
            );
          }
          parentDepartmentName = newParent.departmentName;
          hierarchyLevel = newParent.hierarchyLevel + 1;
          hierarchyPath = `${newParent.hierarchyPath}/${dept.departmentCode}`;
        }

        const updated: DepartmentDetailDto = {
          ...dept,
          parentId: request.newParentId,
          parentDepartmentName,
          hierarchyLevel,
          hierarchyPath,
          updatedAt: new Date().toISOString(),
        };

        this.departments[versionId][idx] = updated;

        // ツリーを再構築して返す
        const showInactive = true;
        const nodes = buildTree(this.departments[versionId], undefined, showInactive);

        return {
          tree: {
            versionId,
            versionCode: version.versionCode,
            nodes,
          },
        };
      }
    }

    throwBffError('DEPARTMENT_NOT_FOUND', '部門が見つかりません');
  }

  async deactivateDepartment(
    departmentId: string
  ): Promise<DeactivateDepartmentResponse> {
    await delay(300);

    for (const [versionId, depts] of Object.entries(this.departments)) {
      const idx = depts.findIndex((d) => d.id === departmentId);
      if (idx !== -1) {
        const dept = depts[idx];

        const updated: DepartmentDetailDto = {
          ...dept,
          isActive: false,
          updatedAt: new Date().toISOString(),
        };

        this.departments[versionId][idx] = updated;

        return { department: updated };
      }
    }

    throwBffError('DEPARTMENT_NOT_FOUND', '部門が見つかりません');
  }

  async reactivateDepartment(
    departmentId: string
  ): Promise<ReactivateDepartmentResponse> {
    await delay(300);

    for (const [versionId, depts] of Object.entries(this.departments)) {
      const idx = depts.findIndex((d) => d.id === departmentId);
      if (idx !== -1) {
        const dept = depts[idx];

        const updated: DepartmentDetailDto = {
          ...dept,
          isActive: true,
          updatedAt: new Date().toISOString(),
        };

        this.departments[versionId][idx] = updated;

        return { department: updated };
      }
    }

    throwBffError('DEPARTMENT_NOT_FOUND', '部門が見つかりません');
  }
}
