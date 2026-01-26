import { Injectable, HttpException } from '@nestjs/common';
import { BranchRepository } from '../repository/branch.repository';
import { BankRepository } from '../repository/bank.repository';
import {
  ListBranchesApiRequest,
  ListBranchesApiResponse,
  GetBranchApiResponse,
  CreateBranchApiRequest,
  CreateBranchApiResponse,
  UpdateBranchApiRequest,
  UpdateBranchApiResponse,
  DeactivateBranchApiRequest,
  DeactivateBranchApiResponse,
  ActivateBranchApiRequest,
  ActivateBranchApiResponse,
  BranchApiDto,
  WarningInfo,
} from '@procure/contracts/api/bank-master';
import {
  BankMasterErrorCode,
  BankMasterErrorHttpStatus,
  BankMasterErrorMessage,
  BankMasterWarningCode,
  BankMasterWarningMessage,
} from '@procure/contracts/api/errors';
import { BankBranch } from '@prisma/client';

/**
 * Branch Service
 *
 * ビジネスルールの正本
 * - 支店コード一意性チェック（3桁数字、銀行内でユニーク）
 * - 支店コード形式チェック
 * - 半角カナ正規化
 * - 楽観ロック
 * - 監査ログ記録
 */
@Injectable()
export class BranchService {
  constructor(
    private readonly branchRepository: BranchRepository,
    private readonly bankRepository: BankRepository,
  ) {}

  /**
   * 支店一覧取得
   */
  async listBranches(
    tenantId: string,
    bankId: string,
    request: ListBranchesApiRequest,
  ): Promise<ListBranchesApiResponse> {
    // 銀行存在チェック
    const bank = await this.bankRepository.findOne({ tenantId, bankId });
    if (!bank) {
      throw new HttpException(
        {
          code: BankMasterErrorCode.BANK_NOT_FOUND,
          message: BankMasterErrorMessage.BANK_NOT_FOUND,
        },
        BankMasterErrorHttpStatus.BANK_NOT_FOUND,
      );
    }

    const { offset, limit, sortBy, sortOrder, keyword, isActive } = request;

    const result = await this.branchRepository.findMany({
      tenantId,
      bankId,
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
   * 支店詳細取得
   */
  async getBranch(
    tenantId: string,
    bankId: string,
    branchId: string,
  ): Promise<GetBranchApiResponse> {
    // 銀行存在チェック
    const bank = await this.bankRepository.findOne({ tenantId, bankId });
    if (!bank) {
      throw new HttpException(
        {
          code: BankMasterErrorCode.BANK_NOT_FOUND,
          message: BankMasterErrorMessage.BANK_NOT_FOUND,
        },
        BankMasterErrorHttpStatus.BANK_NOT_FOUND,
      );
    }

    const branch = await this.branchRepository.findOne({
      tenantId,
      branchId,
    });

    if (!branch || branch.bankId !== bankId) {
      throw new HttpException(
        {
          code: BankMasterErrorCode.BRANCH_NOT_FOUND,
          message: BankMasterErrorMessage.BRANCH_NOT_FOUND,
        },
        BankMasterErrorHttpStatus.BRANCH_NOT_FOUND,
      );
    }

    return {
      branch: this.toApiDto(branch),
    };
  }

  /**
   * 支店新規登録
   */
  async createBranch(
    tenantId: string,
    userId: string,
    bankId: string,
    request: CreateBranchApiRequest,
  ): Promise<CreateBranchApiResponse> {
    // 銀行存在チェック
    const bank = await this.bankRepository.findOne({ tenantId, bankId });
    if (!bank) {
      throw new HttpException(
        {
          code: BankMasterErrorCode.BANK_NOT_FOUND,
          message: BankMasterErrorMessage.BANK_NOT_FOUND,
        },
        BankMasterErrorHttpStatus.BANK_NOT_FOUND,
      );
    }

    // バリデーション: 支店コード形式チェック（3桁数字）
    if (!this.isValidBranchCode(request.branchCode)) {
      throw new HttpException(
        {
          code: BankMasterErrorCode.INVALID_BRANCH_CODE_FORMAT,
          message: BankMasterErrorMessage.INVALID_BRANCH_CODE_FORMAT,
        },
        BankMasterErrorHttpStatus.INVALID_BRANCH_CODE_FORMAT,
      );
    }

    // バリデーション: 支店コード重複チェック（銀行内でユニーク）
    const isDuplicate = await this.branchRepository.checkBranchCodeDuplicate({
      tenantId,
      bankId,
      branchCode: request.branchCode,
    });

    if (isDuplicate) {
      throw new HttpException(
        {
          code: BankMasterErrorCode.BRANCH_CODE_DUPLICATE,
          message: BankMasterErrorMessage.BRANCH_CODE_DUPLICATE,
        },
        BankMasterErrorHttpStatus.BRANCH_CODE_DUPLICATE,
      );
    }

    // 半角カナ正規化
    const normalizedBranchNameKana = request.branchNameKana
      ? this.normalizeToHalfWidthKana(request.branchNameKana)
      : undefined;

    // 登録
    const branch = await this.branchRepository.create({
      tenantId,
      bankId,
      createdBy: userId,
      data: {
        branchCode: request.branchCode,
        branchName: request.branchName,
        branchNameKana: normalizedBranchNameKana,
        displayOrder: request.displayOrder ?? 1000,
        isActive: request.isActive ?? true,
      },
    });

    // TODO: 監査ログ記録

    return {
      branch: this.toApiDto(branch),
    };
  }

  /**
   * 支店更新
   */
  async updateBranch(
    tenantId: string,
    userId: string,
    bankId: string,
    branchId: string,
    request: UpdateBranchApiRequest,
  ): Promise<UpdateBranchApiResponse> {
    // 銀行存在チェック
    const bank = await this.bankRepository.findOne({ tenantId, bankId });
    if (!bank) {
      throw new HttpException(
        {
          code: BankMasterErrorCode.BANK_NOT_FOUND,
          message: BankMasterErrorMessage.BANK_NOT_FOUND,
        },
        BankMasterErrorHttpStatus.BANK_NOT_FOUND,
      );
    }

    // 既存データ取得
    const existingBranch = await this.branchRepository.findOne({
      tenantId,
      branchId,
    });

    if (!existingBranch || existingBranch.bankId !== bankId) {
      throw new HttpException(
        {
          code: BankMasterErrorCode.BRANCH_NOT_FOUND,
          message: BankMasterErrorMessage.BRANCH_NOT_FOUND,
        },
        BankMasterErrorHttpStatus.BRANCH_NOT_FOUND,
      );
    }

    // 半角カナ正規化
    const normalizedBranchNameKana = request.branchNameKana
      ? this.normalizeToHalfWidthKana(request.branchNameKana)
      : undefined;

    // 更新（楽観ロック）
    const updatedBranch = await this.branchRepository.update({
      tenantId,
      branchId,
      version: request.version,
      updatedBy: userId,
      data: {
        branchName: request.branchName,
        branchNameKana: normalizedBranchNameKana,
        displayOrder: request.displayOrder,
        isActive: request.isActive,
      },
    });

    // 楽観ロック競合
    if (!updatedBranch) {
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
      branch: this.toApiDto(updatedBranch),
    };
  }

  /**
   * 支店無効化
   */
  async deactivateBranch(
    tenantId: string,
    userId: string,
    bankId: string,
    branchId: string,
    request: DeactivateBranchApiRequest,
  ): Promise<DeactivateBranchApiResponse> {
    // 銀行存在チェック
    const bank = await this.bankRepository.findOne({ tenantId, bankId });
    if (!bank) {
      throw new HttpException(
        {
          code: BankMasterErrorCode.BANK_NOT_FOUND,
          message: BankMasterErrorMessage.BANK_NOT_FOUND,
        },
        BankMasterErrorHttpStatus.BANK_NOT_FOUND,
      );
    }

    // 既存データ取得
    const existingBranch = await this.branchRepository.findOne({
      tenantId,
      branchId,
    });

    if (!existingBranch || existingBranch.bankId !== bankId) {
      throw new HttpException(
        {
          code: BankMasterErrorCode.BRANCH_NOT_FOUND,
          message: BankMasterErrorMessage.BRANCH_NOT_FOUND,
        },
        BankMasterErrorHttpStatus.BRANCH_NOT_FOUND,
      );
    }

    // 警告チェック: 支払先口座で使用中か
    const warnings: WarningInfo[] = [];
    const isInUse = await this.branchRepository.isInUse({
      tenantId,
      branchId,
    });

    if (isInUse) {
      warnings.push({
        code: BankMasterWarningCode.BRANCH_IN_USE,
        message: BankMasterWarningMessage.BRANCH_IN_USE,
      });
    }

    // 無効化（楽観ロック）
    const updatedBranch = await this.branchRepository.update({
      tenantId,
      branchId,
      version: request.version,
      updatedBy: userId,
      data: {
        branchName: existingBranch.branchName,
        branchNameKana: existingBranch.branchNameKana ?? undefined,
        displayOrder: existingBranch.displayOrder,
        isActive: false,
      },
    });

    // 楽観ロック競合
    if (!updatedBranch) {
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
      branch: this.toApiDto(updatedBranch),
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  /**
   * 支店再有効化
   */
  async activateBranch(
    tenantId: string,
    userId: string,
    bankId: string,
    branchId: string,
    request: ActivateBranchApiRequest,
  ): Promise<ActivateBranchApiResponse> {
    // 銀行存在チェック
    const bank = await this.bankRepository.findOne({ tenantId, bankId });
    if (!bank) {
      throw new HttpException(
        {
          code: BankMasterErrorCode.BANK_NOT_FOUND,
          message: BankMasterErrorMessage.BANK_NOT_FOUND,
        },
        BankMasterErrorHttpStatus.BANK_NOT_FOUND,
      );
    }

    // 既存データ取得
    const existingBranch = await this.branchRepository.findOne({
      tenantId,
      branchId,
    });

    if (!existingBranch || existingBranch.bankId !== bankId) {
      throw new HttpException(
        {
          code: BankMasterErrorCode.BRANCH_NOT_FOUND,
          message: BankMasterErrorMessage.BRANCH_NOT_FOUND,
        },
        BankMasterErrorHttpStatus.BRANCH_NOT_FOUND,
      );
    }

    // 再有効化（楽観ロック）
    const updatedBranch = await this.branchRepository.update({
      tenantId,
      branchId,
      version: request.version,
      updatedBy: userId,
      data: {
        branchName: existingBranch.branchName,
        branchNameKana: existingBranch.branchNameKana ?? undefined,
        displayOrder: existingBranch.displayOrder,
        isActive: true,
      },
    });

    // 楽観ロック競合
    if (!updatedBranch) {
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
      branch: this.toApiDto(updatedBranch),
    };
  }

  /**
   * BankBranch -> BranchApiDto 変換
   */
  private toApiDto(branch: BankBranch): BranchApiDto {
    return {
      id: branch.id,
      bankId: branch.bankId,
      branchCode: branch.branchCode,
      branchName: branch.branchName,
      branchNameKana: branch.branchNameKana,
      displayOrder: branch.displayOrder,
      isActive: branch.isActive,
      version: branch.version,
      createdAt: branch.createdAt.toISOString(),
      updatedAt: branch.updatedAt.toISOString(),
      createdBy: branch.createdByLoginAccountId,
      updatedBy: branch.updatedByLoginAccountId,
    };
  }

  /**
   * 支店コード形式チェック（3桁数字）
   */
  private isValidBranchCode(branchCode: string): boolean {
    return /^\d{3}$/.test(branchCode);
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
