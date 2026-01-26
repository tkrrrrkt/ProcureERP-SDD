import { Injectable } from '@nestjs/common';
import { CompanyBankAccountRepository } from '../repository/company-bank-account.repository';
import {
  ListCompanyBankAccountsApiRequest,
  ListCompanyBankAccountsApiResponse,
  GetCompanyBankAccountApiResponse,
  CreateCompanyBankAccountApiRequest,
  CreateCompanyBankAccountApiResponse,
  UpdateCompanyBankAccountApiRequest,
  UpdateCompanyBankAccountApiResponse,
  DeactivateCompanyBankAccountApiRequest,
  DeactivateCompanyBankAccountApiResponse,
  ActivateCompanyBankAccountApiRequest,
  ActivateCompanyBankAccountApiResponse,
  SetDefaultCompanyBankAccountApiRequest,
  SetDefaultCompanyBankAccountApiResponse,
  CompanyBankAccountApiDto,
} from '@procure/contracts/api/company-bank-account';
import {
  CompanyBankAccountErrorCode,
  CompanyBankAccountErrorMessage,
} from '@procure/contracts/api/errors/company-bank-account-error';

/**
 * Company Bank Account Service
 *
 * 自社口座マスタのビジネスロジック層
 */
@Injectable()
export class CompanyBankAccountService {
  constructor(private readonly repository: CompanyBankAccountRepository) {}

  /**
   * 自社口座一覧取得
   */
  async listAccounts(
    tenantId: string,
    request: ListCompanyBankAccountsApiRequest,
  ): Promise<ListCompanyBankAccountsApiResponse> {
    const { offset, limit, sortBy, sortOrder, isActive } = request;

    const { items, total } = await this.repository.findMany({
      tenantId,
      offset,
      limit,
      sortBy,
      sortOrder,
      isActive,
    });

    return {
      items: items.map((item) => this.toDto(item)),
      total,
    };
  }

  /**
   * 自社口座詳細取得
   */
  async getAccount(
    tenantId: string,
    accountId: string,
  ): Promise<GetCompanyBankAccountApiResponse> {
    const account = await this.repository.findOne({ tenantId, accountId });

    if (!account) {
      throw {
        code: CompanyBankAccountErrorCode.COMPANY_BANK_ACCOUNT_NOT_FOUND,
        message:
          CompanyBankAccountErrorMessage[
            CompanyBankAccountErrorCode.COMPANY_BANK_ACCOUNT_NOT_FOUND
          ],
      };
    }

    return { account: this.toDto(account) };
  }

  /**
   * 自社口座新規作成
   */
  async createAccount(
    tenantId: string,
    userId: string,
    request: CreateCompanyBankAccountApiRequest,
  ): Promise<CreateCompanyBankAccountApiResponse> {
    // Validate account code format
    if (!this.validateAccountCode(request.accountCode)) {
      throw {
        code: CompanyBankAccountErrorCode.INVALID_ACCOUNT_CODE_FORMAT,
        message:
          CompanyBankAccountErrorMessage[
            CompanyBankAccountErrorCode.INVALID_ACCOUNT_CODE_FORMAT
          ],
      };
    }

    // Check for duplicate account code
    const existingAccount = await this.repository.findByCode({
      tenantId,
      accountCode: request.accountCode,
    });
    if (existingAccount) {
      throw {
        code: CompanyBankAccountErrorCode.ACCOUNT_CODE_DUPLICATE,
        message:
          CompanyBankAccountErrorMessage[
            CompanyBankAccountErrorCode.ACCOUNT_CODE_DUPLICATE
          ],
      };
    }

    // Validate conditional fields
    this.validateAccountData(request);

    // Normalize kana
    const accountHolderNameKana = request.accountHolderNameKana
      ? this.normalizeToHalfWidthKana(request.accountHolderNameKana)
      : undefined;

    // Normalize account number
    const accountNo = request.accountNo
      ? this.padAccountNo(request.accountNo)
      : undefined;

    // If setting as default, clear existing default
    if (request.isDefault) {
      await this.repository.clearDefaultAccount({ tenantId, userId });
    }

    const account = await this.repository.create({
      tenantId,
      accountCode: request.accountCode.toUpperCase().trim(),
      accountName: request.accountName.trim(),
      accountCategory: request.accountCategory,
      bankId: request.bankId,
      bankBranchId: request.bankBranchId,
      postOfficeSymbol: request.postOfficeSymbol,
      postOfficeNumber: request.postOfficeNumber,
      accountType: request.accountType,
      accountNo,
      accountHolderName: request.accountHolderName.trim(),
      accountHolderNameKana,
      consignorCode: request.consignorCode,
      isDefault: request.isDefault,
      notes: request.notes?.trim(),
      userId,
    });

    return { account: this.toDto(account) };
  }

  /**
   * 自社口座更新
   */
  async updateAccount(
    tenantId: string,
    userId: string,
    accountId: string,
    request: UpdateCompanyBankAccountApiRequest,
  ): Promise<UpdateCompanyBankAccountApiResponse> {
    // Check if account exists
    const existingAccount = await this.repository.findOne({
      tenantId,
      accountId,
    });
    if (!existingAccount) {
      throw {
        code: CompanyBankAccountErrorCode.COMPANY_BANK_ACCOUNT_NOT_FOUND,
        message:
          CompanyBankAccountErrorMessage[
            CompanyBankAccountErrorCode.COMPANY_BANK_ACCOUNT_NOT_FOUND
          ],
      };
    }

    // Validate conditional fields
    this.validateAccountData(request);

    // Normalize kana
    const accountHolderNameKana = request.accountHolderNameKana
      ? this.normalizeToHalfWidthKana(request.accountHolderNameKana)
      : null;

    // Normalize account number
    const accountNo = request.accountNo
      ? this.padAccountNo(request.accountNo)
      : null;

    // If setting as default and wasn't default before, clear existing default
    if (request.isDefault && !existingAccount.isDefault) {
      await this.repository.clearDefaultAccount({ tenantId, userId });
    }

    // Cannot deactivate default account
    if (!request.isActive && existingAccount.isDefault) {
      throw {
        code: CompanyBankAccountErrorCode.CANNOT_DEACTIVATE_DEFAULT_ACCOUNT,
        message:
          CompanyBankAccountErrorMessage[
            CompanyBankAccountErrorCode.CANNOT_DEACTIVATE_DEFAULT_ACCOUNT
          ],
      };
    }

    const result = await this.repository.update({
      tenantId,
      accountId,
      accountName: request.accountName.trim(),
      accountCategory: request.accountCategory,
      bankId: request.bankId,
      bankBranchId: request.bankBranchId,
      postOfficeSymbol: request.postOfficeSymbol,
      postOfficeNumber: request.postOfficeNumber,
      accountType: request.accountType,
      accountNo,
      accountHolderName: request.accountHolderName.trim(),
      accountHolderNameKana,
      consignorCode: request.consignorCode,
      isDefault: request.isDefault,
      isActive: request.isActive,
      notes: request.notes?.trim(),
      userId,
      currentVersion: request.version,
    });

    if (result.count === 0) {
      throw {
        code: CompanyBankAccountErrorCode.CONCURRENT_UPDATE,
        message:
          CompanyBankAccountErrorMessage[
            CompanyBankAccountErrorCode.CONCURRENT_UPDATE
          ],
      };
    }

    const updatedAccount = await this.repository.findOne({
      tenantId,
      accountId,
    });
    return { account: this.toDto(updatedAccount!) };
  }

  /**
   * 自社口座無効化
   */
  async deactivateAccount(
    tenantId: string,
    userId: string,
    accountId: string,
    request: DeactivateCompanyBankAccountApiRequest,
  ): Promise<DeactivateCompanyBankAccountApiResponse> {
    const existingAccount = await this.repository.findOne({
      tenantId,
      accountId,
    });
    if (!existingAccount) {
      throw {
        code: CompanyBankAccountErrorCode.COMPANY_BANK_ACCOUNT_NOT_FOUND,
        message:
          CompanyBankAccountErrorMessage[
            CompanyBankAccountErrorCode.COMPANY_BANK_ACCOUNT_NOT_FOUND
          ],
      };
    }

    // Cannot deactivate default account
    if (existingAccount.isDefault) {
      throw {
        code: CompanyBankAccountErrorCode.CANNOT_DEACTIVATE_DEFAULT_ACCOUNT,
        message:
          CompanyBankAccountErrorMessage[
            CompanyBankAccountErrorCode.CANNOT_DEACTIVATE_DEFAULT_ACCOUNT
          ],
      };
    }

    const result = await this.repository.update({
      tenantId,
      accountId,
      accountName: existingAccount.accountName,
      accountCategory: existingAccount.accountCategory as 'bank' | 'post_office',
      bankId: existingAccount.bankId,
      bankBranchId: existingAccount.bankBranchId,
      postOfficeSymbol: existingAccount.postOfficeSymbol,
      postOfficeNumber: existingAccount.postOfficeNumber,
      accountType: existingAccount.accountType as 'ordinary' | 'current' | 'savings',
      accountNo: existingAccount.accountNo,
      accountHolderName: existingAccount.accountHolderName,
      accountHolderNameKana: existingAccount.accountHolderNameKana,
      consignorCode: existingAccount.consignorCode,
      isDefault: existingAccount.isDefault,
      isActive: false,
      notes: existingAccount.notes,
      userId,
      currentVersion: request.version,
    });

    if (result.count === 0) {
      throw {
        code: CompanyBankAccountErrorCode.CONCURRENT_UPDATE,
        message:
          CompanyBankAccountErrorMessage[
            CompanyBankAccountErrorCode.CONCURRENT_UPDATE
          ],
      };
    }

    const updatedAccount = await this.repository.findOne({
      tenantId,
      accountId,
    });
    return { account: this.toDto(updatedAccount!) };
  }

  /**
   * 自社口座再有効化
   */
  async activateAccount(
    tenantId: string,
    userId: string,
    accountId: string,
    request: ActivateCompanyBankAccountApiRequest,
  ): Promise<ActivateCompanyBankAccountApiResponse> {
    const existingAccount = await this.repository.findOne({
      tenantId,
      accountId,
    });
    if (!existingAccount) {
      throw {
        code: CompanyBankAccountErrorCode.COMPANY_BANK_ACCOUNT_NOT_FOUND,
        message:
          CompanyBankAccountErrorMessage[
            CompanyBankAccountErrorCode.COMPANY_BANK_ACCOUNT_NOT_FOUND
          ],
      };
    }

    const result = await this.repository.update({
      tenantId,
      accountId,
      accountName: existingAccount.accountName,
      accountCategory: existingAccount.accountCategory as 'bank' | 'post_office',
      bankId: existingAccount.bankId,
      bankBranchId: existingAccount.bankBranchId,
      postOfficeSymbol: existingAccount.postOfficeSymbol,
      postOfficeNumber: existingAccount.postOfficeNumber,
      accountType: existingAccount.accountType as 'ordinary' | 'current' | 'savings',
      accountNo: existingAccount.accountNo,
      accountHolderName: existingAccount.accountHolderName,
      accountHolderNameKana: existingAccount.accountHolderNameKana,
      consignorCode: existingAccount.consignorCode,
      isDefault: existingAccount.isDefault,
      isActive: true,
      notes: existingAccount.notes,
      userId,
      currentVersion: request.version,
    });

    if (result.count === 0) {
      throw {
        code: CompanyBankAccountErrorCode.CONCURRENT_UPDATE,
        message:
          CompanyBankAccountErrorMessage[
            CompanyBankAccountErrorCode.CONCURRENT_UPDATE
          ],
      };
    }

    const updatedAccount = await this.repository.findOne({
      tenantId,
      accountId,
    });
    return { account: this.toDto(updatedAccount!) };
  }

  /**
   * デフォルト口座設定
   */
  async setDefaultAccount(
    tenantId: string,
    userId: string,
    accountId: string,
    request: SetDefaultCompanyBankAccountApiRequest,
  ): Promise<SetDefaultCompanyBankAccountApiResponse> {
    const existingAccount = await this.repository.findOne({
      tenantId,
      accountId,
    });
    if (!existingAccount) {
      throw {
        code: CompanyBankAccountErrorCode.COMPANY_BANK_ACCOUNT_NOT_FOUND,
        message:
          CompanyBankAccountErrorMessage[
            CompanyBankAccountErrorCode.COMPANY_BANK_ACCOUNT_NOT_FOUND
          ],
      };
    }

    // Get current default account before clearing
    const previousDefault = await this.repository.findDefaultAccount({
      tenantId,
    });

    // Clear existing default
    await this.repository.clearDefaultAccount({ tenantId, userId });

    // Set new default
    const result = await this.repository.update({
      tenantId,
      accountId,
      accountName: existingAccount.accountName,
      accountCategory: existingAccount.accountCategory as 'bank' | 'post_office',
      bankId: existingAccount.bankId,
      bankBranchId: existingAccount.bankBranchId,
      postOfficeSymbol: existingAccount.postOfficeSymbol,
      postOfficeNumber: existingAccount.postOfficeNumber,
      accountType: existingAccount.accountType as 'ordinary' | 'current' | 'savings',
      accountNo: existingAccount.accountNo,
      accountHolderName: existingAccount.accountHolderName,
      accountHolderNameKana: existingAccount.accountHolderNameKana,
      consignorCode: existingAccount.consignorCode,
      isDefault: true,
      isActive: existingAccount.isActive,
      notes: existingAccount.notes,
      userId,
      currentVersion: request.version,
    });

    if (result.count === 0) {
      throw {
        code: CompanyBankAccountErrorCode.CONCURRENT_UPDATE,
        message:
          CompanyBankAccountErrorMessage[
            CompanyBankAccountErrorCode.CONCURRENT_UPDATE
          ],
      };
    }

    const updatedAccount = await this.repository.findOne({
      tenantId,
      accountId,
    });

    // Fetch previous default again to get updated version
    let previousDefaultDto: CompanyBankAccountApiDto | null = null;
    if (previousDefault && previousDefault.id !== accountId) {
      const prevUpdated = await this.repository.findOne({
        tenantId,
        accountId: previousDefault.id,
      });
      if (prevUpdated) {
        previousDefaultDto = this.toDto(prevUpdated);
      }
    }

    return {
      account: this.toDto(updatedAccount!),
      previousDefault: previousDefaultDto,
    };
  }

  /**
   * Validate account code format (max 10 chars, alphanumeric)
   */
  private validateAccountCode(accountCode: string): boolean {
    const code = accountCode.trim().toUpperCase();
    return /^[A-Z0-9]{1,10}$/.test(code);
  }

  /**
   * Validate conditional fields based on account category
   */
  private validateAccountData(
    data: CreateCompanyBankAccountApiRequest | UpdateCompanyBankAccountApiRequest,
  ): void {
    if (data.accountCategory === 'bank') {
      if (!data.bankId) {
        throw {
          code: CompanyBankAccountErrorCode.BANK_REQUIRED_FOR_BANK_ACCOUNT,
          message:
            CompanyBankAccountErrorMessage[
              CompanyBankAccountErrorCode.BANK_REQUIRED_FOR_BANK_ACCOUNT
            ],
        };
      }
      if (!data.bankBranchId) {
        throw {
          code: CompanyBankAccountErrorCode.BRANCH_REQUIRED_FOR_BANK_ACCOUNT,
          message:
            CompanyBankAccountErrorMessage[
              CompanyBankAccountErrorCode.BRANCH_REQUIRED_FOR_BANK_ACCOUNT
            ],
        };
      }
      if (!data.accountNo) {
        throw {
          code: CompanyBankAccountErrorCode.ACCOUNT_NO_REQUIRED_FOR_BANK_ACCOUNT,
          message:
            CompanyBankAccountErrorMessage[
              CompanyBankAccountErrorCode.ACCOUNT_NO_REQUIRED_FOR_BANK_ACCOUNT
            ],
        };
      }
      // Validate account number format (7 digits)
      if (!/^\d{1,7}$/.test(data.accountNo)) {
        throw {
          code: CompanyBankAccountErrorCode.INVALID_ACCOUNT_NO_FORMAT,
          message:
            CompanyBankAccountErrorMessage[
              CompanyBankAccountErrorCode.INVALID_ACCOUNT_NO_FORMAT
            ],
        };
      }
    }

    if (data.accountCategory === 'post_office') {
      if (!data.postOfficeSymbol) {
        throw {
          code: CompanyBankAccountErrorCode.POST_OFFICE_SYMBOL_REQUIRED,
          message:
            CompanyBankAccountErrorMessage[
              CompanyBankAccountErrorCode.POST_OFFICE_SYMBOL_REQUIRED
            ],
        };
      }
      if (!data.postOfficeNumber) {
        throw {
          code: CompanyBankAccountErrorCode.POST_OFFICE_NUMBER_REQUIRED,
          message:
            CompanyBankAccountErrorMessage[
              CompanyBankAccountErrorCode.POST_OFFICE_NUMBER_REQUIRED
            ],
        };
      }
      // Validate post office symbol format (5 digits)
      if (!/^\d{5}$/.test(data.postOfficeSymbol)) {
        throw {
          code: CompanyBankAccountErrorCode.INVALID_POST_OFFICE_SYMBOL_FORMAT,
          message:
            CompanyBankAccountErrorMessage[
              CompanyBankAccountErrorCode.INVALID_POST_OFFICE_SYMBOL_FORMAT
            ],
        };
      }
      // Validate post office number format (up to 8 digits)
      if (!/^\d{1,8}$/.test(data.postOfficeNumber)) {
        throw {
          code: CompanyBankAccountErrorCode.INVALID_POST_OFFICE_NUMBER_FORMAT,
          message:
            CompanyBankAccountErrorMessage[
              CompanyBankAccountErrorCode.INVALID_POST_OFFICE_NUMBER_FORMAT
            ],
        };
      }
    }

    // Validate consignor code if provided (10 digits)
    if (data.consignorCode && !/^\d{10}$/.test(data.consignorCode)) {
      throw {
        code: CompanyBankAccountErrorCode.INVALID_CONSIGNOR_CODE_FORMAT,
        message:
          CompanyBankAccountErrorMessage[
            CompanyBankAccountErrorCode.INVALID_CONSIGNOR_CODE_FORMAT
          ],
      };
    }
  }

  /**
   * Normalize to half-width katakana for Zengin FB compatibility
   */
  private normalizeToHalfWidthKana(input: string): string {
    // Full-width to half-width katakana conversion map
    const kanaMap: Record<string, string> = {
      'ア': 'ｱ', 'イ': 'ｲ', 'ウ': 'ｳ', 'エ': 'ｴ', 'オ': 'ｵ',
      'カ': 'ｶ', 'キ': 'ｷ', 'ク': 'ｸ', 'ケ': 'ｹ', 'コ': 'ｺ',
      'サ': 'ｻ', 'シ': 'ｼ', 'ス': 'ｽ', 'セ': 'ｾ', 'ソ': 'ｿ',
      'タ': 'ﾀ', 'チ': 'ﾁ', 'ツ': 'ﾂ', 'テ': 'ﾃ', 'ト': 'ﾄ',
      'ナ': 'ﾅ', 'ニ': 'ﾆ', 'ヌ': 'ﾇ', 'ネ': 'ﾈ', 'ノ': 'ﾉ',
      'ハ': 'ﾊ', 'ヒ': 'ﾋ', 'フ': 'ﾌ', 'ヘ': 'ﾍ', 'ホ': 'ﾎ',
      'マ': 'ﾏ', 'ミ': 'ﾐ', 'ム': 'ﾑ', 'メ': 'ﾒ', 'モ': 'ﾓ',
      'ヤ': 'ﾔ', 'ユ': 'ﾕ', 'ヨ': 'ﾖ',
      'ラ': 'ﾗ', 'リ': 'ﾘ', 'ル': 'ﾙ', 'レ': 'ﾚ', 'ロ': 'ﾛ',
      'ワ': 'ﾜ', 'ヲ': 'ｦ', 'ン': 'ﾝ',
      'ガ': 'ｶﾞ', 'ギ': 'ｷﾞ', 'グ': 'ｸﾞ', 'ゲ': 'ｹﾞ', 'ゴ': 'ｺﾞ',
      'ザ': 'ｻﾞ', 'ジ': 'ｼﾞ', 'ズ': 'ｽﾞ', 'ゼ': 'ｾﾞ', 'ゾ': 'ｿﾞ',
      'ダ': 'ﾀﾞ', 'ヂ': 'ﾁﾞ', 'ヅ': 'ﾂﾞ', 'デ': 'ﾃﾞ', 'ド': 'ﾄﾞ',
      'バ': 'ﾊﾞ', 'ビ': 'ﾋﾞ', 'ブ': 'ﾌﾞ', 'ベ': 'ﾍﾞ', 'ボ': 'ﾎﾞ',
      'パ': 'ﾊﾟ', 'ピ': 'ﾋﾟ', 'プ': 'ﾌﾟ', 'ペ': 'ﾍﾟ', 'ポ': 'ﾎﾟ',
      'ァ': 'ｧ', 'ィ': 'ｨ', 'ゥ': 'ｩ', 'ェ': 'ｪ', 'ォ': 'ｫ',
      'ッ': 'ｯ', 'ャ': 'ｬ', 'ュ': 'ｭ', 'ョ': 'ｮ',
      'ー': 'ｰ', '。': '｡', '「': '｢', '」': '｣', '、': '､', '・': '･',
    };

    return input
      .split('')
      .map((char) => kanaMap[char] || char)
      .join('');
  }

  /**
   * Pad account number to 7 digits with leading zeros
   */
  private padAccountNo(accountNo: string): string {
    return accountNo.padStart(7, '0');
  }

  /**
   * Convert Prisma model to DTO
   */
  private toDto(account: {
    id: string;
    tenantId: string;
    accountCode: string;
    accountName: string;
    accountCategory: string;
    bankId: string | null;
    bankBranchId: string | null;
    postOfficeSymbol: string | null;
    postOfficeNumber: string | null;
    accountType: string;
    accountNo: string | null;
    accountHolderName: string;
    accountHolderNameKana: string | null;
    consignorCode: string | null;
    isDefault: boolean;
    isActive: boolean;
    notes: string | null;
    version: number;
    createdAt: Date;
    updatedAt: Date;
    createdByLoginAccountId: string | null;
    updatedByLoginAccountId: string | null;
    bank?: { bankCode: string; bankName: string } | null;
    bankBranch?: { branchCode: string; branchName: string } | null;
  }): CompanyBankAccountApiDto {
    return {
      id: account.id,
      accountCode: account.accountCode,
      accountName: account.accountName,
      accountCategory: account.accountCategory as 'bank' | 'post_office',
      bankId: account.bankId,
      bankBranchId: account.bankBranchId,
      bankCode: account.bank?.bankCode ?? null,
      bankName: account.bank?.bankName ?? null,
      branchCode: account.bankBranch?.branchCode ?? null,
      branchName: account.bankBranch?.branchName ?? null,
      postOfficeSymbol: account.postOfficeSymbol,
      postOfficeNumber: account.postOfficeNumber,
      accountType: account.accountType as 'ordinary' | 'current' | 'savings',
      accountNo: account.accountNo,
      accountHolderName: account.accountHolderName,
      accountHolderNameKana: account.accountHolderNameKana,
      consignorCode: account.consignorCode,
      isDefault: account.isDefault,
      isActive: account.isActive,
      notes: account.notes,
      version: account.version,
      createdAt: account.createdAt.toISOString(),
      updatedAt: account.updatedAt.toISOString(),
      createdBy: account.createdByLoginAccountId,
      updatedBy: account.updatedByLoginAccountId,
    };
  }
}
