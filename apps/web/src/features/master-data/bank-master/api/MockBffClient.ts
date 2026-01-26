/**
 * Mock BFF Client for Bank Master
 *
 * Development/testing mock client
 * Used when BFF is not available or for unit testing
 */

import type {
  BffClient,
  BankDto,
  BranchDto,
  ListBanksRequest,
  ListBanksResponse,
  GetBankResponse,
  CreateBankRequest,
  CreateBankResponse,
  UpdateBankRequest,
  UpdateBankResponse,
  DeactivateBankRequest,
  DeactivateBankResponse,
  ActivateBankRequest,
  ActivateBankResponse,
  ListBranchesRequest,
  ListBranchesResponse,
  GetBranchResponse,
  CreateBranchRequest,
  CreateBranchResponse,
  UpdateBranchRequest,
  UpdateBranchResponse,
  DeactivateBranchRequest,
  DeactivateBranchResponse,
  ActivateBranchRequest,
  ActivateBranchResponse,
} from './BffClient';

// =============================================================================
// Mock Data
// =============================================================================

const mockBanks: BankDto[] = [
  {
    id: 'bank-001',
    bankCode: '0001',
    bankName: 'みずほ銀行',
    bankNameKana: 'ﾐｽﾞﾎｷﾞﾝｺｳ',
    swiftCode: 'MHCBJPJT',
    displayOrder: 10,
    isActive: true,
    version: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'bank-002',
    bankCode: '0005',
    bankName: '三菱UFJ銀行',
    bankNameKana: 'ﾐﾂﾋﾞｼﾕｰｴﾌｼﾞｪｲｷﾞﾝｺｳ',
    swiftCode: 'BOABORJT',
    displayOrder: 20,
    isActive: true,
    version: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'bank-003',
    bankCode: '0009',
    bankName: '三井住友銀行',
    bankNameKana: 'ﾐﾂｲｽﾐﾄﾓｷﾞﾝｺｳ',
    swiftCode: 'SMBCJPJT',
    displayOrder: 30,
    isActive: true,
    version: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'bank-004',
    bankCode: '0010',
    bankName: 'りそな銀行',
    bankNameKana: 'ﾘｿﾅｷﾞﾝｺｳ',
    swiftCode: null,
    displayOrder: 40,
    isActive: true,
    version: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'bank-005',
    bankCode: '0017',
    bankName: '埼玉りそな銀行',
    bankNameKana: 'ｻｲﾀﾏﾘｿﾅｷﾞﾝｺｳ',
    swiftCode: null,
    displayOrder: 50,
    isActive: false,
    version: 2,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-02-01T00:00:00Z',
    createdBy: 'system',
    updatedBy: 'admin',
  },
];

const mockBranches: Record<string, BranchDto[]> = {
  'bank-001': [
    {
      id: 'branch-001-001',
      bankId: 'bank-001',
      branchCode: '001',
      branchName: '本店',
      branchNameKana: 'ﾎﾝﾃﾝ',
      displayOrder: 10,
      isActive: true,
      version: 1,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      createdBy: 'system',
      updatedBy: 'system',
    },
    {
      id: 'branch-001-002',
      bankId: 'bank-001',
      branchCode: '110',
      branchName: '新宿支店',
      branchNameKana: 'ｼﾝｼﾞｭｸｼﾃﾝ',
      displayOrder: 20,
      isActive: true,
      version: 1,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      createdBy: 'system',
      updatedBy: 'system',
    },
    {
      id: 'branch-001-003',
      bankId: 'bank-001',
      branchCode: '220',
      branchName: '渋谷支店',
      branchNameKana: 'ｼﾌﾞﾔｼﾃﾝ',
      displayOrder: 30,
      isActive: true,
      version: 1,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      createdBy: 'system',
      updatedBy: 'system',
    },
  ],
  'bank-002': [
    {
      id: 'branch-002-001',
      bankId: 'bank-002',
      branchCode: '001',
      branchName: '本店',
      branchNameKana: 'ﾎﾝﾃﾝ',
      displayOrder: 10,
      isActive: true,
      version: 1,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      createdBy: 'system',
      updatedBy: 'system',
    },
    {
      id: 'branch-002-002',
      bankId: 'bank-002',
      branchCode: '100',
      branchName: '池袋支店',
      branchNameKana: 'ｲｹﾌﾞｸﾛｼﾃﾝ',
      displayOrder: 20,
      isActive: false,
      version: 2,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-02-01T00:00:00Z',
      createdBy: 'system',
      updatedBy: 'admin',
    },
  ],
};

// =============================================================================
// Mock Client Implementation
// =============================================================================

export class MockBffClient implements BffClient {
  private banks: BankDto[] = [...mockBanks];
  private branches: Record<string, BranchDto[]> = JSON.parse(JSON.stringify(mockBranches));
  private delay = 300;

  private async simulateDelay(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, this.delay));
  }

  // =============================================================================
  // Bank APIs
  // =============================================================================

  async listBanks(request: ListBanksRequest): Promise<ListBanksResponse> {
    await this.simulateDelay();

    let filtered = [...this.banks];

    if (request.isActive !== undefined) {
      filtered = filtered.filter((b) => b.isActive === request.isActive);
    }

    if (request.keyword) {
      const kw = request.keyword.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.bankCode.toLowerCase().includes(kw) ||
          b.bankName.toLowerCase().includes(kw) ||
          (b.bankNameKana && b.bankNameKana.toLowerCase().includes(kw)),
      );
    }

    const sortBy = request.sortBy || 'displayOrder';
    const sortOrder = request.sortOrder || 'asc';
    filtered.sort((a, b) => {
      const aVal = a[sortBy as keyof BankDto] ?? '';
      const bVal = b[sortBy as keyof BankDto] ?? '';
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    const page = request.page || 1;
    const pageSize = request.pageSize || 50;
    const total = filtered.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);

    return { items, page, pageSize, total, totalPages };
  }

  async getBank(id: string): Promise<GetBankResponse> {
    await this.simulateDelay();
    const bank = this.banks.find((b) => b.id === id);
    if (!bank) {
      throw new Error('銀行が見つかりません');
    }
    return { bank };
  }

  async createBank(request: CreateBankRequest): Promise<CreateBankResponse> {
    await this.simulateDelay();
    const newBank: BankDto = {
      id: `bank-${Date.now()}`,
      bankCode: request.bankCode,
      bankName: request.bankName,
      bankNameKana: request.bankNameKana || null,
      swiftCode: request.swiftCode || null,
      displayOrder: request.displayOrder || 1000,
      isActive: request.isActive ?? true,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'demo-user',
      updatedBy: 'demo-user',
    };
    this.banks.push(newBank);
    this.branches[newBank.id] = [];
    return { bank: newBank };
  }

  async updateBank(id: string, request: UpdateBankRequest): Promise<UpdateBankResponse> {
    await this.simulateDelay();
    const idx = this.banks.findIndex((b) => b.id === id);
    if (idx === -1) {
      throw new Error('銀行が見つかりません');
    }
    if (this.banks[idx].version !== request.version) {
      throw new Error('データが更新されています。再読み込みしてください。');
    }
    this.banks[idx] = {
      ...this.banks[idx],
      bankName: request.bankName,
      bankNameKana: request.bankNameKana || null,
      swiftCode: request.swiftCode || null,
      displayOrder: request.displayOrder,
      isActive: request.isActive,
      version: request.version + 1,
      updatedAt: new Date().toISOString(),
      updatedBy: 'demo-user',
    };
    return { bank: this.banks[idx] };
  }

  async deactivateBank(id: string, request: DeactivateBankRequest): Promise<DeactivateBankResponse> {
    await this.simulateDelay();
    const idx = this.banks.findIndex((b) => b.id === id);
    if (idx === -1) {
      throw new Error('銀行が見つかりません');
    }
    if (this.banks[idx].version !== request.version) {
      throw new Error('データが更新されています。再読み込みしてください。');
    }

    const activeBranches = (this.branches[id] || []).filter((br) => br.isActive);
    const warnings =
      activeBranches.length > 0
        ? [{ code: 'HAS_ACTIVE_BRANCHES', message: `有効な支店が${activeBranches.length}件あります` }]
        : undefined;

    this.banks[idx] = {
      ...this.banks[idx],
      isActive: false,
      version: request.version + 1,
      updatedAt: new Date().toISOString(),
      updatedBy: 'demo-user',
    };
    return { bank: this.banks[idx], warnings };
  }

  async activateBank(id: string, request: ActivateBankRequest): Promise<ActivateBankResponse> {
    await this.simulateDelay();
    const idx = this.banks.findIndex((b) => b.id === id);
    if (idx === -1) {
      throw new Error('銀行が見つかりません');
    }
    if (this.banks[idx].version !== request.version) {
      throw new Error('データが更新されています。再読み込みしてください。');
    }
    this.banks[idx] = {
      ...this.banks[idx],
      isActive: true,
      version: request.version + 1,
      updatedAt: new Date().toISOString(),
      updatedBy: 'demo-user',
    };
    return { bank: this.banks[idx] };
  }

  // =============================================================================
  // Branch APIs
  // =============================================================================

  async listBranches(bankId: string, request: ListBranchesRequest): Promise<ListBranchesResponse> {
    await this.simulateDelay();

    let filtered = [...(this.branches[bankId] || [])];

    if (request.isActive !== undefined) {
      filtered = filtered.filter((b) => b.isActive === request.isActive);
    }

    if (request.keyword) {
      const kw = request.keyword.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.branchCode.toLowerCase().includes(kw) ||
          b.branchName.toLowerCase().includes(kw) ||
          (b.branchNameKana && b.branchNameKana.toLowerCase().includes(kw)),
      );
    }

    const sortBy = request.sortBy || 'displayOrder';
    const sortOrder = request.sortOrder || 'asc';
    filtered.sort((a, b) => {
      const aVal = a[sortBy as keyof BranchDto] ?? '';
      const bVal = b[sortBy as keyof BranchDto] ?? '';
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    const page = request.page || 1;
    const pageSize = request.pageSize || 50;
    const total = filtered.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);

    return { items, page, pageSize, total, totalPages };
  }

  async getBranch(bankId: string, branchId: string): Promise<GetBranchResponse> {
    await this.simulateDelay();
    const branch = (this.branches[bankId] || []).find((b) => b.id === branchId);
    if (!branch) {
      throw new Error('支店が見つかりません');
    }
    return { branch };
  }

  async createBranch(bankId: string, request: CreateBranchRequest): Promise<CreateBranchResponse> {
    await this.simulateDelay();
    if (!this.branches[bankId]) {
      this.branches[bankId] = [];
    }
    const newBranch: BranchDto = {
      id: `branch-${Date.now()}`,
      bankId,
      branchCode: request.branchCode,
      branchName: request.branchName,
      branchNameKana: request.branchNameKana || null,
      displayOrder: request.displayOrder || 1000,
      isActive: request.isActive ?? true,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'demo-user',
      updatedBy: 'demo-user',
    };
    this.branches[bankId].push(newBranch);
    return { branch: newBranch };
  }

  async updateBranch(
    bankId: string,
    branchId: string,
    request: UpdateBranchRequest,
  ): Promise<UpdateBranchResponse> {
    await this.simulateDelay();
    const branches = this.branches[bankId] || [];
    const idx = branches.findIndex((b) => b.id === branchId);
    if (idx === -1) {
      throw new Error('支店が見つかりません');
    }
    if (branches[idx].version !== request.version) {
      throw new Error('データが更新されています。再読み込みしてください。');
    }
    branches[idx] = {
      ...branches[idx],
      branchName: request.branchName,
      branchNameKana: request.branchNameKana || null,
      displayOrder: request.displayOrder,
      isActive: request.isActive,
      version: request.version + 1,
      updatedAt: new Date().toISOString(),
      updatedBy: 'demo-user',
    };
    return { branch: branches[idx] };
  }

  async deactivateBranch(
    bankId: string,
    branchId: string,
    request: DeactivateBranchRequest,
  ): Promise<DeactivateBranchResponse> {
    await this.simulateDelay();
    const branches = this.branches[bankId] || [];
    const idx = branches.findIndex((b) => b.id === branchId);
    if (idx === -1) {
      throw new Error('支店が見つかりません');
    }
    if (branches[idx].version !== request.version) {
      throw new Error('データが更新されています。再読み込みしてください。');
    }
    branches[idx] = {
      ...branches[idx],
      isActive: false,
      version: request.version + 1,
      updatedAt: new Date().toISOString(),
      updatedBy: 'demo-user',
    };
    return { branch: branches[idx] };
  }

  async activateBranch(
    bankId: string,
    branchId: string,
    request: ActivateBranchRequest,
  ): Promise<ActivateBranchResponse> {
    await this.simulateDelay();
    const branches = this.branches[bankId] || [];
    const idx = branches.findIndex((b) => b.id === branchId);
    if (idx === -1) {
      throw new Error('支店が見つかりません');
    }
    if (branches[idx].version !== request.version) {
      throw new Error('データが更新されています。再読み込みしてください。');
    }
    branches[idx] = {
      ...branches[idx],
      isActive: true,
      version: request.version + 1,
      updatedAt: new Date().toISOString(),
      updatedBy: 'demo-user',
    };
    return { branch: branches[idx] };
  }
}
