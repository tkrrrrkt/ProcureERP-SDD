import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PayeeBankAccountRepository } from '../repository/payee-bank-account.repository';
import {
  ListPayeeBankAccountsApiRequest,
  ListPayeeBankAccountsApiResponse,
  GetPayeeBankAccountApiResponse,
  CreatePayeeBankAccountApiRequest,
  CreatePayeeBankAccountApiResponse,
  UpdatePayeeBankAccountApiRequest,
  UpdatePayeeBankAccountApiResponse,
  DeactivatePayeeBankAccountApiRequest,
  DeactivatePayeeBankAccountApiResponse,
  ActivatePayeeBankAccountApiRequest,
  ActivatePayeeBankAccountApiResponse,
  SetDefaultPayeeBankAccountApiRequest,
  SetDefaultPayeeBankAccountApiResponse,
  PayeeBankAccountApiDto,
  AccountCategory,
  AccountType,
  TransferFeeBearer,
} from '@procure/contracts/api/payee-bank-account';
import {
  PayeeBankAccountErrorCode,
  PayeeBankAccountErrorMessage,
} from '@procure/contracts/api/errors';
import {
  PayeeBankAccount,
  Bank,
  BankBranch,
  AccountCategory as PrismaAccountCategory,
  AccountType as PrismaAccountType,
  TransferFeeBearer as PrismaTransferFeeBearer,
} from '@prisma/client';

type PayeeBankAccountWithRelations = PayeeBankAccount & {
  bank: Bank | null;
  bankBranch: BankBranch | null;
};

/**
 * Payee Bank Account Service
 *
 * ビジネスルール:
 * - 口座区分による条件付き必須チェック
 * - 口座番号形式チェック（7桁）
 * - ゆうちょ記号・番号形式チェック
 * - 既定口座の一意性保証
 */
@Injectable()
export class PayeeBankAccountService {
  constructor(private readonly repository: PayeeBankAccountRepository) {}

  /**
   * 支払先口座一覧取得
   */
  async listAccounts(
    tenantId: string,
    payeeId: string,
    request: ListPayeeBankAccountsApiRequest,
  ): Promise<ListPayeeBankAccountsApiResponse> {
    const { offset, limit, sortBy, sortOrder, isActive } = request;

    const result = await this.repository.findMany({
      tenantId,
      payeeId,
      offset,
      limit,
      sortBy,
      sortOrder,
      isActive,
    });

    return {
      items: result.items.map((item) =>
        this.toApiDto(item as PayeeBankAccountWithRelations),
      ),
      total: result.total,
    };
  }

  /**
   * 支払先口座詳細取得
   */
  async getAccount(
    tenantId: string,
    accountId: string,
  ): Promise<GetPayeeBankAccountApiResponse> {
    const account = await this.repository.findOne({ tenantId, accountId });

    if (!account) {
      throw new HttpException(
        {
          code: PayeeBankAccountErrorCode.PAYEE_BANK_ACCOUNT_NOT_FOUND,
          message:
            PayeeBankAccountErrorMessage.PAYEE_BANK_ACCOUNT_NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return {
      account: this.toApiDto(account as PayeeBankAccountWithRelations),
    };
  }

  /**
   * 支払先口座新規登録
   */
  async createAccount(
    tenantId: string,
    userId: string,
    payeeId: string,
    request: CreatePayeeBankAccountApiRequest,
  ): Promise<CreatePayeeBankAccountApiResponse> {
    // バリデーション
    this.validateAccountData(request);

    // 既定口座設定時は既存の既定を解除
    if (request.isDefault) {
      await this.repository.clearDefaultAccount({ tenantId, payeeId });
    }

    // 口座名義人カナの正規化
    const accountHolderNameKana = request.accountHolderNameKana
      ? this.normalizeToHalfWidthKana(request.accountHolderNameKana)
      : undefined;

    // 登録
    const account = await this.repository.create({
      tenantId,
      createdBy: userId,
      data: {
        payeeId,
        accountCategory: this.toPrismaAccountCategory(request.accountCategory),
        bankId: request.bankId,
        bankBranchId: request.bankBranchId,
        postOfficeSymbol: request.postOfficeSymbol,
        postOfficeNumber: request.postOfficeNumber,
        accountType: this.toPrismaAccountType(request.accountType),
        accountNo: request.accountNo
          ? this.padAccountNo(request.accountNo)
          : undefined,
        accountHolderName: this.normalizeToFullWidthKana(
          request.accountHolderName,
        ),
        accountHolderNameKana,
        transferFeeBearer: this.toPrismaTransferFeeBearer(
          request.transferFeeBearer,
        ),
        isDefault: request.isDefault,
        notes: request.notes,
      },
    });

    return {
      account: this.toApiDto(account as PayeeBankAccountWithRelations),
    };
  }

  /**
   * 支払先口座更新
   */
  async updateAccount(
    tenantId: string,
    userId: string,
    accountId: string,
    request: UpdatePayeeBankAccountApiRequest,
  ): Promise<UpdatePayeeBankAccountApiResponse> {
    // 既存データ取得
    const existingAccount = await this.repository.findOne({
      tenantId,
      accountId,
    });

    if (!existingAccount) {
      throw new HttpException(
        {
          code: PayeeBankAccountErrorCode.PAYEE_BANK_ACCOUNT_NOT_FOUND,
          message:
            PayeeBankAccountErrorMessage.PAYEE_BANK_ACCOUNT_NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    // バリデーション
    this.validateAccountData(request);

    // 既定口座設定時は既存の既定を解除
    if (request.isDefault && !existingAccount.isDefault) {
      await this.repository.clearDefaultAccount({
        tenantId,
        payeeId: existingAccount.payeeId,
        excludeAccountId: accountId,
      });
    }

    // 口座名義人カナの正規化
    const accountHolderNameKana = request.accountHolderNameKana
      ? this.normalizeToHalfWidthKana(request.accountHolderNameKana)
      : undefined;

    // 更新
    const updatedAccount = await this.repository.update({
      tenantId,
      accountId,
      version: request.version,
      updatedBy: userId,
      data: {
        accountCategory: this.toPrismaAccountCategory(request.accountCategory),
        bankId: request.bankId,
        bankBranchId: request.bankBranchId,
        postOfficeSymbol: request.postOfficeSymbol,
        postOfficeNumber: request.postOfficeNumber,
        accountType: this.toPrismaAccountType(request.accountType),
        accountNo: request.accountNo
          ? this.padAccountNo(request.accountNo)
          : undefined,
        accountHolderName: this.normalizeToFullWidthKana(
          request.accountHolderName,
        ),
        accountHolderNameKana,
        transferFeeBearer: this.toPrismaTransferFeeBearer(
          request.transferFeeBearer,
        ),
        isDefault: request.isDefault,
        isActive: request.isActive,
        notes: request.notes,
      },
    });

    if (!updatedAccount) {
      throw new HttpException(
        {
          code: PayeeBankAccountErrorCode.CONCURRENT_UPDATE,
          message: PayeeBankAccountErrorMessage.CONCURRENT_UPDATE,
        },
        HttpStatus.CONFLICT,
      );
    }

    return {
      account: this.toApiDto(updatedAccount as PayeeBankAccountWithRelations),
    };
  }

  /**
   * 支払先口座無効化
   */
  async deactivateAccount(
    tenantId: string,
    userId: string,
    accountId: string,
    request: DeactivatePayeeBankAccountApiRequest,
  ): Promise<DeactivatePayeeBankAccountApiResponse> {
    const existingAccount = await this.repository.findOne({
      tenantId,
      accountId,
    });

    if (!existingAccount) {
      throw new HttpException(
        {
          code: PayeeBankAccountErrorCode.PAYEE_BANK_ACCOUNT_NOT_FOUND,
          message:
            PayeeBankAccountErrorMessage.PAYEE_BANK_ACCOUNT_NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    // 既定口座は無効化不可
    if (existingAccount.isDefault) {
      throw new HttpException(
        {
          code: PayeeBankAccountErrorCode.CANNOT_DEACTIVATE_DEFAULT_ACCOUNT,
          message:
            PayeeBankAccountErrorMessage.CANNOT_DEACTIVATE_DEFAULT_ACCOUNT,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const updatedAccount = await this.repository.update({
      tenantId,
      accountId,
      version: request.version,
      updatedBy: userId,
      data: {
        accountCategory: existingAccount.accountCategory,
        bankId: existingAccount.bankId ?? undefined,
        bankBranchId: existingAccount.bankBranchId ?? undefined,
        postOfficeSymbol: existingAccount.postOfficeSymbol ?? undefined,
        postOfficeNumber: existingAccount.postOfficeNumber ?? undefined,
        accountType: existingAccount.accountType,
        accountNo: existingAccount.accountNo ?? undefined,
        accountHolderName: existingAccount.accountHolderName,
        accountHolderNameKana:
          existingAccount.accountHolderNameKana ?? undefined,
        transferFeeBearer: existingAccount.transferFeeBearer,
        isDefault: existingAccount.isDefault,
        isActive: false,
        notes: existingAccount.notes ?? undefined,
      },
    });

    if (!updatedAccount) {
      throw new HttpException(
        {
          code: PayeeBankAccountErrorCode.CONCURRENT_UPDATE,
          message: PayeeBankAccountErrorMessage.CONCURRENT_UPDATE,
        },
        HttpStatus.CONFLICT,
      );
    }

    return {
      account: this.toApiDto(updatedAccount as PayeeBankAccountWithRelations),
    };
  }

  /**
   * 支払先口座有効化
   */
  async activateAccount(
    tenantId: string,
    userId: string,
    accountId: string,
    request: ActivatePayeeBankAccountApiRequest,
  ): Promise<ActivatePayeeBankAccountApiResponse> {
    const existingAccount = await this.repository.findOne({
      tenantId,
      accountId,
    });

    if (!existingAccount) {
      throw new HttpException(
        {
          code: PayeeBankAccountErrorCode.PAYEE_BANK_ACCOUNT_NOT_FOUND,
          message:
            PayeeBankAccountErrorMessage.PAYEE_BANK_ACCOUNT_NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const updatedAccount = await this.repository.update({
      tenantId,
      accountId,
      version: request.version,
      updatedBy: userId,
      data: {
        accountCategory: existingAccount.accountCategory,
        bankId: existingAccount.bankId ?? undefined,
        bankBranchId: existingAccount.bankBranchId ?? undefined,
        postOfficeSymbol: existingAccount.postOfficeSymbol ?? undefined,
        postOfficeNumber: existingAccount.postOfficeNumber ?? undefined,
        accountType: existingAccount.accountType,
        accountNo: existingAccount.accountNo ?? undefined,
        accountHolderName: existingAccount.accountHolderName,
        accountHolderNameKana:
          existingAccount.accountHolderNameKana ?? undefined,
        transferFeeBearer: existingAccount.transferFeeBearer,
        isDefault: existingAccount.isDefault,
        isActive: true,
        notes: existingAccount.notes ?? undefined,
      },
    });

    if (!updatedAccount) {
      throw new HttpException(
        {
          code: PayeeBankAccountErrorCode.CONCURRENT_UPDATE,
          message: PayeeBankAccountErrorMessage.CONCURRENT_UPDATE,
        },
        HttpStatus.CONFLICT,
      );
    }

    return {
      account: this.toApiDto(updatedAccount as PayeeBankAccountWithRelations),
    };
  }

  /**
   * 既定口座設定
   */
  async setDefaultAccount(
    tenantId: string,
    userId: string,
    accountId: string,
    request: SetDefaultPayeeBankAccountApiRequest,
  ): Promise<SetDefaultPayeeBankAccountApiResponse> {
    const existingAccount = await this.repository.findOne({
      tenantId,
      accountId,
    });

    if (!existingAccount) {
      throw new HttpException(
        {
          code: PayeeBankAccountErrorCode.PAYEE_BANK_ACCOUNT_NOT_FOUND,
          message:
            PayeeBankAccountErrorMessage.PAYEE_BANK_ACCOUNT_NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    // 既存の既定口座を解除
    await this.repository.clearDefaultAccount({
      tenantId,
      payeeId: existingAccount.payeeId,
      excludeAccountId: accountId,
    });

    // 既定口座に設定
    const updatedAccount = await this.repository.update({
      tenantId,
      accountId,
      version: request.version,
      updatedBy: userId,
      data: {
        accountCategory: existingAccount.accountCategory,
        bankId: existingAccount.bankId ?? undefined,
        bankBranchId: existingAccount.bankBranchId ?? undefined,
        postOfficeSymbol: existingAccount.postOfficeSymbol ?? undefined,
        postOfficeNumber: existingAccount.postOfficeNumber ?? undefined,
        accountType: existingAccount.accountType,
        accountNo: existingAccount.accountNo ?? undefined,
        accountHolderName: existingAccount.accountHolderName,
        accountHolderNameKana:
          existingAccount.accountHolderNameKana ?? undefined,
        transferFeeBearer: existingAccount.transferFeeBearer,
        isDefault: true,
        isActive: existingAccount.isActive,
        notes: existingAccount.notes ?? undefined,
      },
    });

    if (!updatedAccount) {
      throw new HttpException(
        {
          code: PayeeBankAccountErrorCode.CONCURRENT_UPDATE,
          message: PayeeBankAccountErrorMessage.CONCURRENT_UPDATE,
        },
        HttpStatus.CONFLICT,
      );
    }

    return {
      account: this.toApiDto(updatedAccount as PayeeBankAccountWithRelations),
      previousDefault: null, // Simplified for now
    };
  }

  /**
   * バリデーション
   */
  private validateAccountData(
    data: CreatePayeeBankAccountApiRequest | UpdatePayeeBankAccountApiRequest,
  ): void {
    const category = data.accountCategory;

    // 銀行/農協の場合
    if (category === 'bank' || category === 'ja_bank') {
      if (!data.bankId) {
        throw new HttpException(
          {
            code: PayeeBankAccountErrorCode.BANK_REQUIRED_FOR_BANK_ACCOUNT,
            message:
              PayeeBankAccountErrorMessage.BANK_REQUIRED_FOR_BANK_ACCOUNT,
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      if (!data.bankBranchId) {
        throw new HttpException(
          {
            code: PayeeBankAccountErrorCode.BRANCH_REQUIRED_FOR_BANK_ACCOUNT,
            message:
              PayeeBankAccountErrorMessage.BRANCH_REQUIRED_FOR_BANK_ACCOUNT,
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      if (!data.accountNo) {
        throw new HttpException(
          {
            code: PayeeBankAccountErrorCode.ACCOUNT_NO_REQUIRED_FOR_BANK_ACCOUNT,
            message:
              PayeeBankAccountErrorMessage.ACCOUNT_NO_REQUIRED_FOR_BANK_ACCOUNT,
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      // 口座番号形式チェック（7桁以内の数字）
      if (!/^\d{1,7}$/.test(data.accountNo)) {
        throw new HttpException(
          {
            code: PayeeBankAccountErrorCode.INVALID_ACCOUNT_NO_FORMAT,
            message: PayeeBankAccountErrorMessage.INVALID_ACCOUNT_NO_FORMAT,
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    // ゆうちょ銀行の場合
    if (category === 'post_office') {
      if (!data.postOfficeSymbol) {
        throw new HttpException(
          {
            code: PayeeBankAccountErrorCode.POST_OFFICE_SYMBOL_REQUIRED,
            message: PayeeBankAccountErrorMessage.POST_OFFICE_SYMBOL_REQUIRED,
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      if (!data.postOfficeNumber) {
        throw new HttpException(
          {
            code: PayeeBankAccountErrorCode.POST_OFFICE_NUMBER_REQUIRED,
            message: PayeeBankAccountErrorMessage.POST_OFFICE_NUMBER_REQUIRED,
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      // ゆうちょ記号形式チェック（5桁数字）
      if (!/^\d{5}$/.test(data.postOfficeSymbol)) {
        throw new HttpException(
          {
            code: PayeeBankAccountErrorCode.INVALID_POST_OFFICE_SYMBOL_FORMAT,
            message:
              PayeeBankAccountErrorMessage.INVALID_POST_OFFICE_SYMBOL_FORMAT,
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      // ゆうちょ番号形式チェック（1-8桁数字）
      if (!/^\d{1,8}$/.test(data.postOfficeNumber)) {
        throw new HttpException(
          {
            code: PayeeBankAccountErrorCode.INVALID_POST_OFFICE_NUMBER_FORMAT,
            message:
              PayeeBankAccountErrorMessage.INVALID_POST_OFFICE_NUMBER_FORMAT,
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  }

  /**
   * DTO変換
   */
  private toApiDto(
    account: PayeeBankAccountWithRelations,
  ): PayeeBankAccountApiDto {
    return {
      id: account.id,
      payeeId: account.payeeId,
      accountCategory: account.accountCategory as AccountCategory,
      bankId: account.bankId,
      bankBranchId: account.bankBranchId,
      bankCode: account.bank?.bankCode ?? null,
      bankName: account.bank?.bankName ?? null,
      branchCode: account.bankBranch?.branchCode ?? null,
      branchName: account.bankBranch?.branchName ?? null,
      postOfficeSymbol: account.postOfficeSymbol,
      postOfficeNumber: account.postOfficeNumber,
      accountType: account.accountType as AccountType,
      accountNo: account.accountNo,
      accountHolderName: account.accountHolderName,
      accountHolderNameKana: account.accountHolderNameKana,
      transferFeeBearer: account.transferFeeBearer as TransferFeeBearer,
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

  /**
   * 型変換: API -> Prisma
   */
  private toPrismaAccountCategory(
    category: AccountCategory,
  ): PrismaAccountCategory {
    return category as PrismaAccountCategory;
  }

  private toPrismaAccountType(type: AccountType): PrismaAccountType {
    return type as PrismaAccountType;
  }

  private toPrismaTransferFeeBearer(
    bearer: TransferFeeBearer,
  ): PrismaTransferFeeBearer {
    return bearer as PrismaTransferFeeBearer;
  }

  /**
   * 口座番号を7桁にゼロ埋め
   */
  private padAccountNo(accountNo: string): string {
    return accountNo.padStart(7, '0');
  }

  /**
   * 半角カナに正規化
   */
  private normalizeToHalfWidthKana(input: string): string {
    const fullToHalf: { [key: string]: string } = {
      ア: 'ｱ', イ: 'ｲ', ウ: 'ｳ', エ: 'ｴ', オ: 'ｵ',
      カ: 'ｶ', キ: 'ｷ', ク: 'ｸ', ケ: 'ｹ', コ: 'ｺ',
      サ: 'ｻ', シ: 'ｼ', ス: 'ｽ', セ: 'ｾ', ソ: 'ｿ',
      タ: 'ﾀ', チ: 'ﾁ', ツ: 'ﾂ', テ: 'ﾃ', ト: 'ﾄ',
      ナ: 'ﾅ', ニ: 'ﾆ', ヌ: 'ﾇ', ネ: 'ﾈ', ノ: 'ﾉ',
      ハ: 'ﾊ', ヒ: 'ﾋ', フ: 'ﾌ', ヘ: 'ﾍ', ホ: 'ﾎ',
      マ: 'ﾏ', ミ: 'ﾐ', ム: 'ﾑ', メ: 'ﾒ', モ: 'ﾓ',
      ヤ: 'ﾔ', ユ: 'ﾕ', ヨ: 'ﾖ',
      ラ: 'ﾗ', リ: 'ﾘ', ル: 'ﾙ', レ: 'ﾚ', ロ: 'ﾛ',
      ワ: 'ﾜ', ヲ: 'ｦ', ン: 'ﾝ',
      ァ: 'ｧ', ィ: 'ｨ', ゥ: 'ｩ', ェ: 'ｪ', ォ: 'ｫ',
      ッ: 'ｯ', ャ: 'ｬ', ュ: 'ｭ', ョ: 'ｮ',
      ガ: 'ｶﾞ', ギ: 'ｷﾞ', グ: 'ｸﾞ', ゲ: 'ｹﾞ', ゴ: 'ｺﾞ',
      ザ: 'ｻﾞ', ジ: 'ｼﾞ', ズ: 'ｽﾞ', ゼ: 'ｾﾞ', ゾ: 'ｿﾞ',
      ダ: 'ﾀﾞ', ヂ: 'ﾁﾞ', ヅ: 'ﾂﾞ', デ: 'ﾃﾞ', ド: 'ﾄﾞ',
      バ: 'ﾊﾞ', ビ: 'ﾋﾞ', ブ: 'ﾌﾞ', ベ: 'ﾍﾞ', ボ: 'ﾎﾞ',
      パ: 'ﾊﾟ', ピ: 'ﾋﾟ', プ: 'ﾌﾟ', ペ: 'ﾍﾟ', ポ: 'ﾎﾟ',
      ヴ: 'ｳﾞ', ー: 'ｰ', '　': ' ',
    };

    let result = input.replace(/[\u3041-\u3096]/g, (char) =>
      String.fromCharCode(char.charCodeAt(0) + 0x60),
    );

    result = result
      .split('')
      .map((char) => fullToHalf[char] || char)
      .join('');

    return result;
  }

  /**
   * 全角カナに正規化（口座名義人用）
   */
  private normalizeToFullWidthKana(input: string): string {
    const halfToFull: { [key: string]: string } = {
      'ｱ': 'ア', 'ｲ': 'イ', 'ｳ': 'ウ', 'ｴ': 'エ', 'ｵ': 'オ',
      'ｶ': 'カ', 'ｷ': 'キ', 'ｸ': 'ク', 'ｹ': 'ケ', 'ｺ': 'コ',
      'ｻ': 'サ', 'ｼ': 'シ', 'ｽ': 'ス', 'ｾ': 'セ', 'ｿ': 'ソ',
      'ﾀ': 'タ', 'ﾁ': 'チ', 'ﾂ': 'ツ', 'ﾃ': 'テ', 'ﾄ': 'ト',
      'ﾅ': 'ナ', 'ﾆ': 'ニ', 'ﾇ': 'ヌ', 'ﾈ': 'ネ', 'ﾉ': 'ノ',
      'ﾊ': 'ハ', 'ﾋ': 'ヒ', 'ﾌ': 'フ', 'ﾍ': 'ヘ', 'ﾎ': 'ホ',
      'ﾏ': 'マ', 'ﾐ': 'ミ', 'ﾑ': 'ム', 'ﾒ': 'メ', 'ﾓ': 'モ',
      'ﾔ': 'ヤ', 'ﾕ': 'ユ', 'ﾖ': 'ヨ',
      'ﾗ': 'ラ', 'ﾘ': 'リ', 'ﾙ': 'ル', 'ﾚ': 'レ', 'ﾛ': 'ロ',
      'ﾜ': 'ワ', 'ｦ': 'ヲ', 'ﾝ': 'ン',
      'ｧ': 'ァ', 'ｨ': 'ィ', 'ｩ': 'ゥ', 'ｪ': 'ェ', 'ｫ': 'ォ',
      'ｯ': 'ッ', 'ｬ': 'ャ', 'ｭ': 'ュ', 'ｮ': 'ョ',
      'ｰ': 'ー',
    };

    // Handle voiced/semi-voiced marks
    let result = input
      .replace(/ｶﾞ/g, 'ガ').replace(/ｷﾞ/g, 'ギ').replace(/ｸﾞ/g, 'グ')
      .replace(/ｹﾞ/g, 'ゲ').replace(/ｺﾞ/g, 'ゴ')
      .replace(/ｻﾞ/g, 'ザ').replace(/ｼﾞ/g, 'ジ').replace(/ｽﾞ/g, 'ズ')
      .replace(/ｾﾞ/g, 'ゼ').replace(/ｿﾞ/g, 'ゾ')
      .replace(/ﾀﾞ/g, 'ダ').replace(/ﾁﾞ/g, 'ヂ').replace(/ﾂﾞ/g, 'ヅ')
      .replace(/ﾃﾞ/g, 'デ').replace(/ﾄﾞ/g, 'ド')
      .replace(/ﾊﾞ/g, 'バ').replace(/ﾋﾞ/g, 'ビ').replace(/ﾌﾞ/g, 'ブ')
      .replace(/ﾍﾞ/g, 'ベ').replace(/ﾎﾞ/g, 'ボ')
      .replace(/ﾊﾟ/g, 'パ').replace(/ﾋﾟ/g, 'ピ').replace(/ﾌﾟ/g, 'プ')
      .replace(/ﾍﾟ/g, 'ペ').replace(/ﾎﾟ/g, 'ポ')
      .replace(/ｳﾞ/g, 'ヴ');

    result = result
      .split('')
      .map((char) => halfToFull[char] || char)
      .join('');

    return result;
  }
}
