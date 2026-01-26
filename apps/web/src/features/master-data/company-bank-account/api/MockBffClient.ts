/**
 * Company Bank Account Mock BFF Client
 *
 * 開発・テスト用のモッククライアント
 */

import type {
  CompanyBankAccountBffClient,
  CompanyBankAccountDto,
  ListCompanyBankAccountsRequest,
  ListCompanyBankAccountsResponse,
  GetCompanyBankAccountResponse,
  CreateCompanyBankAccountRequest,
  CreateCompanyBankAccountResponse,
  UpdateCompanyBankAccountRequest,
  UpdateCompanyBankAccountResponse,
  DeactivateCompanyBankAccountRequest,
  DeactivateCompanyBankAccountResponse,
  ActivateCompanyBankAccountRequest,
  ActivateCompanyBankAccountResponse,
  SetDefaultCompanyBankAccountRequest,
  SetDefaultCompanyBankAccountResponse,
} from './BffClient';

// Mock delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Initial mock data
const initialMockData: CompanyBankAccountDto[] = [
  {
    id: '1',
    accountCode: 'ACC001',
    accountName: 'メイン出金口座',
    accountCategory: 'bank',
    bankId: 'bank-1',
    bankBranchId: 'branch-1',
    bankCode: '0001',
    bankName: 'みずほ銀行',
    branchCode: '001',
    branchName: '東京営業部',
    postOfficeSymbol: null,
    postOfficeNumber: null,
    accountType: 'ordinary',
    accountNo: '1234567',
    accountHolderName: '株式会社サンプル',
    accountHolderNameKana: 'ｶﾌﾞｼｷｶﾞｲｼﾔｻﾝﾌﾟﾙ',
    consignorCode: '1234567890',
    isDefault: true,
    isActive: true,
    notes: 'メインの出金口座として使用',
    version: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    createdBy: 'user-1',
    updatedBy: 'user-1',
  },
  {
    id: '2',
    accountCode: 'ACC002',
    accountName: 'サブ出金口座',
    accountCategory: 'bank',
    bankId: 'bank-2',
    bankBranchId: 'branch-2',
    bankCode: '0005',
    bankName: '三菱UFJ銀行',
    branchCode: '001',
    branchName: '本店',
    postOfficeSymbol: null,
    postOfficeNumber: null,
    accountType: 'current',
    accountNo: '7654321',
    accountHolderName: '株式会社サンプル',
    accountHolderNameKana: 'ｶﾌﾞｼｷｶﾞｲｼﾔｻﾝﾌﾟﾙ',
    consignorCode: null,
    isDefault: false,
    isActive: true,
    notes: null,
    version: 1,
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-01T00:00:00Z',
    createdBy: 'user-1',
    updatedBy: 'user-1',
  },
  {
    id: '3',
    accountCode: 'ACC003',
    accountName: 'ゆうちょ口座',
    accountCategory: 'post_office',
    bankId: null,
    bankBranchId: null,
    bankCode: null,
    bankName: null,
    branchCode: null,
    branchName: null,
    postOfficeSymbol: '10100',
    postOfficeNumber: '12345678',
    accountType: 'ordinary',
    accountNo: null,
    accountHolderName: '株式会社サンプル',
    accountHolderNameKana: 'ｶﾌﾞｼｷｶﾞｲｼﾔｻﾝﾌﾟﾙ',
    consignorCode: null,
    isDefault: false,
    isActive: false,
    notes: '現在使用停止中',
    version: 2,
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: '2024-06-01T00:00:00Z',
    createdBy: 'user-1',
    updatedBy: 'user-2',
  },
];

/**
 * Mock BFF Client Implementation
 */
export class MockBffClient implements CompanyBankAccountBffClient {
  private accounts: CompanyBankAccountDto[] = [...initialMockData];

  async listAccounts(
    request: ListCompanyBankAccountsRequest,
  ): Promise<ListCompanyBankAccountsResponse> {
    await delay(300);

    let filtered = [...this.accounts];

    // Filter by isActive
    if (request.isActive !== undefined) {
      filtered = filtered.filter((a) => a.isActive === request.isActive);
    }

    // Sort
    const sortBy = request.sortBy || 'accountCode';
    const sortOrder = request.sortOrder || 'asc';
    filtered.sort((a, b) => {
      let aVal: string | number | boolean = '';
      let bVal: string | number | boolean = '';

      switch (sortBy) {
        case 'accountCode':
          aVal = a.accountCode;
          bVal = b.accountCode;
          break;
        case 'accountName':
          aVal = a.accountName;
          bVal = b.accountName;
          break;
        case 'isDefault':
          aVal = a.isDefault ? 1 : 0;
          bVal = b.isDefault ? 1 : 0;
          break;
        case 'isActive':
          aVal = a.isActive ? 1 : 0;
          bVal = b.isActive ? 1 : 0;
          break;
        case 'createdAt':
          aVal = a.createdAt;
          bVal = b.createdAt;
          break;
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    // Pagination
    const page = request.page || 1;
    const pageSize = request.pageSize || 50;
    const startIndex = (page - 1) * pageSize;
    const items = filtered.slice(startIndex, startIndex + pageSize);

    return {
      items,
      total: filtered.length,
      page,
      pageSize,
      totalPages: Math.ceil(filtered.length / pageSize),
    };
  }

  async getAccount(id: string): Promise<GetCompanyBankAccountResponse> {
    await delay(300);

    const account = this.accounts.find((a) => a.id === id);
    if (!account) {
      throw { code: 'COMPANY_BANK_ACCOUNT_NOT_FOUND', message: '自社口座が見つかりません' };
    }

    return { account };
  }

  async createAccount(
    request: CreateCompanyBankAccountRequest,
  ): Promise<CreateCompanyBankAccountResponse> {
    await delay(300);

    // Check duplicate account code
    if (this.accounts.some((a) => a.accountCode === request.accountCode)) {
      throw { code: 'ACCOUNT_CODE_DUPLICATE', message: 'この口座コードは既に使用されています' };
    }

    // If setting as default, clear existing default
    if (request.isDefault) {
      this.accounts = this.accounts.map((a) => ({ ...a, isDefault: false }));
    }

    const newAccount: CompanyBankAccountDto = {
      id: `${Date.now()}`,
      accountCode: request.accountCode,
      accountName: request.accountName,
      accountCategory: request.accountCategory,
      bankId: request.bankId || null,
      bankBranchId: request.bankBranchId || null,
      bankCode: request.accountCategory === 'bank' ? '0001' : null,
      bankName: request.accountCategory === 'bank' ? 'サンプル銀行' : null,
      branchCode: request.accountCategory === 'bank' ? '001' : null,
      branchName: request.accountCategory === 'bank' ? 'サンプル支店' : null,
      postOfficeSymbol: request.postOfficeSymbol || null,
      postOfficeNumber: request.postOfficeNumber || null,
      accountType: request.accountType,
      accountNo: request.accountNo || null,
      accountHolderName: request.accountHolderName,
      accountHolderNameKana: request.accountHolderNameKana || null,
      consignorCode: request.consignorCode || null,
      isDefault: request.isDefault || false,
      isActive: true,
      notes: request.notes || null,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'user-1',
      updatedBy: 'user-1',
    };

    this.accounts.push(newAccount);

    return { account: newAccount };
  }

  async updateAccount(
    id: string,
    request: UpdateCompanyBankAccountRequest,
  ): Promise<UpdateCompanyBankAccountResponse> {
    await delay(300);

    const index = this.accounts.findIndex((a) => a.id === id);
    if (index === -1) {
      throw { code: 'COMPANY_BANK_ACCOUNT_NOT_FOUND', message: '自社口座が見つかりません' };
    }

    const existing = this.accounts[index];
    if (existing.version !== request.version) {
      throw {
        code: 'CONCURRENT_UPDATE',
        message: 'データが更新されています。再読み込みしてください。',
      };
    }

    // If setting as default, clear existing default
    if (request.isDefault && !existing.isDefault) {
      this.accounts = this.accounts.map((a) =>
        a.id !== id ? { ...a, isDefault: false } : a,
      );
    }

    const updated: CompanyBankAccountDto = {
      ...existing,
      accountName: request.accountName,
      accountCategory: request.accountCategory,
      bankId: request.bankId || null,
      bankBranchId: request.bankBranchId || null,
      postOfficeSymbol: request.postOfficeSymbol || null,
      postOfficeNumber: request.postOfficeNumber || null,
      accountType: request.accountType,
      accountNo: request.accountNo || null,
      accountHolderName: request.accountHolderName,
      accountHolderNameKana: request.accountHolderNameKana || null,
      consignorCode: request.consignorCode || null,
      isDefault: request.isDefault,
      isActive: request.isActive,
      notes: request.notes || null,
      version: existing.version + 1,
      updatedAt: new Date().toISOString(),
      updatedBy: 'user-1',
    };

    this.accounts[index] = updated;

    return { account: updated };
  }

  async deactivateAccount(
    id: string,
    request: DeactivateCompanyBankAccountRequest,
  ): Promise<DeactivateCompanyBankAccountResponse> {
    await delay(300);

    const index = this.accounts.findIndex((a) => a.id === id);
    if (index === -1) {
      throw { code: 'COMPANY_BANK_ACCOUNT_NOT_FOUND', message: '自社口座が見つかりません' };
    }

    const existing = this.accounts[index];
    if (existing.version !== request.version) {
      throw {
        code: 'CONCURRENT_UPDATE',
        message: 'データが更新されています。再読み込みしてください。',
      };
    }

    if (existing.isDefault) {
      throw {
        code: 'CANNOT_DEACTIVATE_DEFAULT_ACCOUNT',
        message: '既定口座は無効化できません。先に別の口座を既定に設定してください。',
      };
    }

    const updated: CompanyBankAccountDto = {
      ...existing,
      isActive: false,
      version: existing.version + 1,
      updatedAt: new Date().toISOString(),
      updatedBy: 'user-1',
    };

    this.accounts[index] = updated;

    return { account: updated };
  }

  async activateAccount(
    id: string,
    request: ActivateCompanyBankAccountRequest,
  ): Promise<ActivateCompanyBankAccountResponse> {
    await delay(300);

    const index = this.accounts.findIndex((a) => a.id === id);
    if (index === -1) {
      throw { code: 'COMPANY_BANK_ACCOUNT_NOT_FOUND', message: '自社口座が見つかりません' };
    }

    const existing = this.accounts[index];
    if (existing.version !== request.version) {
      throw {
        code: 'CONCURRENT_UPDATE',
        message: 'データが更新されています。再読み込みしてください。',
      };
    }

    const updated: CompanyBankAccountDto = {
      ...existing,
      isActive: true,
      version: existing.version + 1,
      updatedAt: new Date().toISOString(),
      updatedBy: 'user-1',
    };

    this.accounts[index] = updated;

    return { account: updated };
  }

  async setDefaultAccount(
    id: string,
    request: SetDefaultCompanyBankAccountRequest,
  ): Promise<SetDefaultCompanyBankAccountResponse> {
    await delay(300);

    const index = this.accounts.findIndex((a) => a.id === id);
    if (index === -1) {
      throw { code: 'COMPANY_BANK_ACCOUNT_NOT_FOUND', message: '自社口座が見つかりません' };
    }

    const existing = this.accounts[index];
    if (existing.version !== request.version) {
      throw {
        code: 'CONCURRENT_UPDATE',
        message: 'データが更新されています。再読み込みしてください。',
      };
    }

    // Find previous default
    const previousDefault = this.accounts.find((a) => a.isDefault && a.id !== id);

    // Clear existing default
    this.accounts = this.accounts.map((a) => ({
      ...a,
      isDefault: a.id === id,
      version: a.id === id || a.isDefault ? a.version + 1 : a.version,
      updatedAt: a.id === id || a.isDefault ? new Date().toISOString() : a.updatedAt,
    }));

    const updated = this.accounts.find((a) => a.id === id)!;
    const prevDefaultUpdated = previousDefault
      ? this.accounts.find((a) => a.id === previousDefault.id)!
      : null;

    return {
      account: updated,
      previousDefault: prevDefaultUpdated,
    };
  }
}
