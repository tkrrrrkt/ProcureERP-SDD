import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { BankRepository } from '../repository/bank.repository';
import {
  ListBanksApiRequest,
  ListBanksApiResponse,
  GetBankApiResponse,
  CreateBankApiRequest,
  CreateBankApiResponse,
  UpdateBankApiRequest,
  UpdateBankApiResponse,
  DeactivateBankApiRequest,
  DeactivateBankApiResponse,
  ActivateBankApiRequest,
  ActivateBankApiResponse,
  BankApiDto,
  WarningInfo,
} from '@procure/contracts/api/bank-master';
import {
  BankMasterErrorCode,
  BankMasterErrorHttpStatus,
  BankMasterErrorMessage,
  BankMasterWarningCode,
  BankMasterWarningMessage,
} from '@procure/contracts/api/errors';
import { Bank } from '@prisma/client';

/**
 * Bank Service
 *
 * ビジネスルールの正本
 * - 銀行コード一意性チェック（4桁数字）
 * - 銀行コード形式チェック
 * - 半角カナ正規化
 * - 楽観ロック
 * - 監査ログ記録
 */
@Injectable()
export class BankService {
  constructor(private readonly bankRepository: BankRepository) {}

  /**
   * 銀行一覧取得
   */
  async listBanks(
    tenantId: string,
    request: ListBanksApiRequest,
  ): Promise<ListBanksApiResponse> {
    const { offset, limit, sortBy, sortOrder, keyword, isActive } = request;

    const result = await this.bankRepository.findMany({
      tenantId,
      offset,
      limit,
      sortBy,
      sortOrder,
      keyword,
      isActive,
    });

    return {
      items: result.items.map(this.toApiDto),
      total: result.total,
    };
  }

  /**
   * 銀行詳細取得
   */
  async getBank(tenantId: string, bankId: string): Promise<GetBankApiResponse> {
    const bank = await this.bankRepository.findOne({
      tenantId,
      bankId,
    });

    if (!bank) {
      throw new HttpException(
        {
          code: BankMasterErrorCode.BANK_NOT_FOUND,
          message: BankMasterErrorMessage.BANK_NOT_FOUND,
        },
        BankMasterErrorHttpStatus.BANK_NOT_FOUND,
      );
    }

    return {
      bank: this.toApiDto(bank),
    };
  }

  /**
   * 銀行新規登録
   */
  async createBank(
    tenantId: string,
    userId: string,
    request: CreateBankApiRequest,
  ): Promise<CreateBankApiResponse> {
    // バリデーション: 銀行コード形式チェック（4桁数字）
    if (!this.isValidBankCode(request.bankCode)) {
      throw new HttpException(
        {
          code: BankMasterErrorCode.INVALID_BANK_CODE_FORMAT,
          message: BankMasterErrorMessage.INVALID_BANK_CODE_FORMAT,
        },
        BankMasterErrorHttpStatus.INVALID_BANK_CODE_FORMAT,
      );
    }

    // バリデーション: 銀行コード重複チェック
    const isDuplicate = await this.bankRepository.checkBankCodeDuplicate({
      tenantId,
      bankCode: request.bankCode,
    });

    if (isDuplicate) {
      throw new HttpException(
        {
          code: BankMasterErrorCode.BANK_CODE_DUPLICATE,
          message: BankMasterErrorMessage.BANK_CODE_DUPLICATE,
        },
        BankMasterErrorHttpStatus.BANK_CODE_DUPLICATE,
      );
    }

    // 半角カナ正規化
    const normalizedBankNameKana = request.bankNameKana
      ? this.normalizeToHalfWidthKana(request.bankNameKana)
      : undefined;

    // 登録
    const bank = await this.bankRepository.create({
      tenantId,
      createdBy: userId,
      data: {
        bankCode: request.bankCode,
        bankName: request.bankName,
        bankNameKana: normalizedBankNameKana,
        swiftCode: request.swiftCode,
        displayOrder: request.displayOrder ?? 1000,
        isActive: request.isActive ?? true,
      },
    });

    // TODO: 監査ログ記録

    return {
      bank: this.toApiDto(bank),
    };
  }

  /**
   * 銀行更新
   */
  async updateBank(
    tenantId: string,
    userId: string,
    bankId: string,
    request: UpdateBankApiRequest,
  ): Promise<UpdateBankApiResponse> {
    // 既存データ取得
    const existingBank = await this.bankRepository.findOne({
      tenantId,
      bankId,
    });

    if (!existingBank) {
      throw new HttpException(
        {
          code: BankMasterErrorCode.BANK_NOT_FOUND,
          message: BankMasterErrorMessage.BANK_NOT_FOUND,
        },
        BankMasterErrorHttpStatus.BANK_NOT_FOUND,
      );
    }

    // 半角カナ正規化
    const normalizedBankNameKana = request.bankNameKana
      ? this.normalizeToHalfWidthKana(request.bankNameKana)
      : undefined;

    // 更新（楽観ロック）
    const updatedBank = await this.bankRepository.update({
      tenantId,
      bankId,
      version: request.version,
      updatedBy: userId,
      data: {
        bankName: request.bankName,
        bankNameKana: normalizedBankNameKana,
        swiftCode: request.swiftCode,
        displayOrder: request.displayOrder,
        isActive: request.isActive,
      },
    });

    // 楽観ロック競合
    if (!updatedBank) {
      throw new HttpException(
        {
          code: BankMasterErrorCode.CONCURRENT_UPDATE,
          message: BankMasterErrorMessage.CONCURRENT_UPDATE,
        },
        BankMasterErrorHttpStatus.CONCURRENT_UPDATE,
      );
    }

    // TODO: 監査ログ記録

    return {
      bank: this.toApiDto(updatedBank),
    };
  }

  /**
   * 銀行無効化
   */
  async deactivateBank(
    tenantId: string,
    userId: string,
    bankId: string,
    request: DeactivateBankApiRequest,
  ): Promise<DeactivateBankApiResponse> {
    // 既存データ取得
    const existingBank = await this.bankRepository.findOne({
      tenantId,
      bankId,
    });

    if (!existingBank) {
      throw new HttpException(
        {
          code: BankMasterErrorCode.BANK_NOT_FOUND,
          message: BankMasterErrorMessage.BANK_NOT_FOUND,
        },
        BankMasterErrorHttpStatus.BANK_NOT_FOUND,
      );
    }

    // 警告チェック: 有効な支店が存在するか
    const warnings: WarningInfo[] = [];
    const activeBranchCount = await this.bankRepository.countActiveBranches({
      tenantId,
      bankId,
    });

    if (activeBranchCount > 0) {
      warnings.push({
        code: BankMasterWarningCode.HAS_ACTIVE_BRANCHES,
        message: BankMasterWarningMessage.HAS_ACTIVE_BRANCHES,
      });
    }

    // 無効化（楽観ロック）
    const updatedBank = await this.bankRepository.update({
      tenantId,
      bankId,
      version: request.version,
      updatedBy: userId,
      data: {
        bankName: existingBank.bankName,
        bankNameKana: existingBank.bankNameKana ?? undefined,
        swiftCode: existingBank.swiftCode ?? undefined,
        displayOrder: existingBank.displayOrder,
        isActive: false,
      },
    });

    // 楽観ロック競合
    if (!updatedBank) {
      throw new HttpException(
        {
          code: BankMasterErrorCode.CONCURRENT_UPDATE,
          message: BankMasterErrorMessage.CONCURRENT_UPDATE,
        },
        BankMasterErrorHttpStatus.CONCURRENT_UPDATE,
      );
    }

    // TODO: 監査ログ記録

    return {
      bank: this.toApiDto(updatedBank),
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  /**
   * 銀行再有効化
   */
  async activateBank(
    tenantId: string,
    userId: string,
    bankId: string,
    request: ActivateBankApiRequest,
  ): Promise<ActivateBankApiResponse> {
    // 既存データ取得
    const existingBank = await this.bankRepository.findOne({
      tenantId,
      bankId,
    });

    if (!existingBank) {
      throw new HttpException(
        {
          code: BankMasterErrorCode.BANK_NOT_FOUND,
          message: BankMasterErrorMessage.BANK_NOT_FOUND,
        },
        BankMasterErrorHttpStatus.BANK_NOT_FOUND,
      );
    }

    // 再有効化（楽観ロック）
    const updatedBank = await this.bankRepository.update({
      tenantId,
      bankId,
      version: request.version,
      updatedBy: userId,
      data: {
        bankName: existingBank.bankName,
        bankNameKana: existingBank.bankNameKana ?? undefined,
        swiftCode: existingBank.swiftCode ?? undefined,
        displayOrder: existingBank.displayOrder,
        isActive: true,
      },
    });

    // 楽観ロック競合
    if (!updatedBank) {
      throw new HttpException(
        {
          code: BankMasterErrorCode.CONCURRENT_UPDATE,
          message: BankMasterErrorMessage.CONCURRENT_UPDATE,
        },
        BankMasterErrorHttpStatus.CONCURRENT_UPDATE,
      );
    }

    // TODO: 監査ログ記録

    return {
      bank: this.toApiDto(updatedBank),
    };
  }

  /**
   * Bank -> BankApiDto 変換
   */
  private toApiDto(bank: Bank): BankApiDto {
    return {
      id: bank.id,
      bankCode: bank.bankCode,
      bankName: bank.bankName,
      bankNameKana: bank.bankNameKana,
      swiftCode: bank.swiftCode,
      displayOrder: bank.displayOrder,
      isActive: bank.isActive,
      version: bank.version,
      createdAt: bank.createdAt.toISOString(),
      updatedAt: bank.updatedAt.toISOString(),
      createdBy: bank.createdByLoginAccountId,
      updatedBy: bank.updatedByLoginAccountId,
    };
  }

  /**
   * 銀行コード形式チェック（4桁数字）
   */
  private isValidBankCode(bankCode: string): boolean {
    return /^\d{4}$/.test(bankCode);
  }

  /**
   * 全角カナ・ひらがなを半角カナに正規化
   */
  private normalizeToHalfWidthKana(input: string): string {
    // 全角カタカナ → 半角カタカナ変換マップ
    const fullToHalf: { [key: string]: string } = {
      ア: 'ｱ',
      イ: 'ｲ',
      ウ: 'ｳ',
      エ: 'ｴ',
      オ: 'ｵ',
      カ: 'ｶ',
      キ: 'ｷ',
      ク: 'ｸ',
      ケ: 'ｹ',
      コ: 'ｺ',
      サ: 'ｻ',
      シ: 'ｼ',
      ス: 'ｽ',
      セ: 'ｾ',
      ソ: 'ｿ',
      タ: 'ﾀ',
      チ: 'ﾁ',
      ツ: 'ﾂ',
      テ: 'ﾃ',
      ト: 'ﾄ',
      ナ: 'ﾅ',
      ニ: 'ﾆ',
      ヌ: 'ﾇ',
      ネ: 'ﾈ',
      ノ: 'ﾉ',
      ハ: 'ﾊ',
      ヒ: 'ﾋ',
      フ: 'ﾌ',
      ヘ: 'ﾍ',
      ホ: 'ﾎ',
      マ: 'ﾏ',
      ミ: 'ﾐ',
      ム: 'ﾑ',
      メ: 'ﾒ',
      モ: 'ﾓ',
      ヤ: 'ﾔ',
      ユ: 'ﾕ',
      ヨ: 'ﾖ',
      ラ: 'ﾗ',
      リ: 'ﾘ',
      ル: 'ﾙ',
      レ: 'ﾚ',
      ロ: 'ﾛ',
      ワ: 'ﾜ',
      ヲ: 'ｦ',
      ン: 'ﾝ',
      ァ: 'ｧ',
      ィ: 'ｨ',
      ゥ: 'ｩ',
      ェ: 'ｪ',
      ォ: 'ｫ',
      ッ: 'ｯ',
      ャ: 'ｬ',
      ュ: 'ｭ',
      ョ: 'ｮ',
      ガ: 'ｶﾞ',
      ギ: 'ｷﾞ',
      グ: 'ｸﾞ',
      ゲ: 'ｹﾞ',
      ゴ: 'ｺﾞ',
      ザ: 'ｻﾞ',
      ジ: 'ｼﾞ',
      ズ: 'ｽﾞ',
      ゼ: 'ｾﾞ',
      ゾ: 'ｿﾞ',
      ダ: 'ﾀﾞ',
      ヂ: 'ﾁﾞ',
      ヅ: 'ﾂﾞ',
      デ: 'ﾃﾞ',
      ド: 'ﾄﾞ',
      バ: 'ﾊﾞ',
      ビ: 'ﾋﾞ',
      ブ: 'ﾌﾞ',
      ベ: 'ﾍﾞ',
      ボ: 'ﾎﾞ',
      パ: 'ﾊﾟ',
      ピ: 'ﾋﾟ',
      プ: 'ﾌﾟ',
      ペ: 'ﾍﾟ',
      ポ: 'ﾎﾟ',
      ヴ: 'ｳﾞ',
      ー: 'ｰ',
      '　': ' ',
    };

    // ひらがな → 全角カタカナ変換（先に行う）
    let result = input.replace(/[\u3041-\u3096]/g, (char) =>
      String.fromCharCode(char.charCodeAt(0) + 0x60),
    );

    // 全角カタカナ → 半角カタカナ変換
    result = result
      .split('')
      .map((char) => fullToHalf[char] || char)
      .join('');

    return result;
  }
}
