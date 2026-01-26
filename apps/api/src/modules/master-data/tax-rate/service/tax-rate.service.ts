import { Injectable, HttpException } from '@nestjs/common';
import { TaxRateRepository } from '../repository/tax-rate.repository';
import {
  ListTaxRatesApiRequest,
  ListTaxRatesApiResponse,
  GetTaxRateApiResponse,
  CreateTaxRateApiRequest,
  CreateTaxRateApiResponse,
  UpdateTaxRateApiRequest,
  UpdateTaxRateApiResponse,
  DeactivateTaxRateApiRequest,
  DeactivateTaxRateApiResponse,
  ActivateTaxRateApiRequest,
  ActivateTaxRateApiResponse,
  TaxRateApiDto,
} from '@procure/contracts/api/tax-rate';
import {
  TAX_RATE_ERROR_CODES,
  TaxRateErrorHttpStatus,
  TaxRateErrorMessage,
} from '@procure/contracts/api/errors';
import { TaxRate } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * Tax Rate Service
 *
 * ビジネスルールの正本
 * - 税率コード一意性チェック
 * - 日付範囲バリデーション（validFrom <= validTo）
 * - 税率値変更禁止
 * - 楽観ロック
 * - 監査ログ記録
 */
@Injectable()
export class TaxRateService {
  constructor(private readonly taxRateRepository: TaxRateRepository) {}

  /**
   * 税率一覧取得
   */
  async listTaxRates(
    tenantId: string,
    request: ListTaxRatesApiRequest,
  ): Promise<ListTaxRatesApiResponse> {
    const { offset, limit, sortBy, sortOrder, keyword, isActive } = request;

    const result = await this.taxRateRepository.findMany({
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
   * 税率詳細取得
   */
  async getTaxRate(
    tenantId: string,
    taxRateId: string,
  ): Promise<GetTaxRateApiResponse> {
    const taxRate = await this.taxRateRepository.findById({
      tenantId,
      taxRateId,
    });

    if (!taxRate) {
      throw new HttpException(
        {
          code: TAX_RATE_ERROR_CODES.TAX_RATE_NOT_FOUND,
          message: TaxRateErrorMessage[TAX_RATE_ERROR_CODES.TAX_RATE_NOT_FOUND],
        },
        TaxRateErrorHttpStatus[TAX_RATE_ERROR_CODES.TAX_RATE_NOT_FOUND],
      );
    }

    return {
      taxRate: this.toApiDto(taxRate),
    };
  }

  /**
   * 税率新規登録
   */
  async createTaxRate(
    tenantId: string,
    userId: string,
    request: CreateTaxRateApiRequest,
  ): Promise<CreateTaxRateApiResponse> {
    // バリデーション: 日付範囲
    if (request.validTo) {
      const validFrom = new Date(request.validFrom);
      const validTo = new Date(request.validTo);
      if (validTo < validFrom) {
        throw new HttpException(
          {
            code: TAX_RATE_ERROR_CODES.INVALID_DATE_RANGE,
            message: TaxRateErrorMessage[TAX_RATE_ERROR_CODES.INVALID_DATE_RANGE],
          },
          TaxRateErrorHttpStatus[TAX_RATE_ERROR_CODES.INVALID_DATE_RANGE],
        );
      }
    }

    // バリデーション: 税率コード重複チェック
    const isDuplicate = await this.taxRateRepository.checkTaxRateCodeDuplicate({
      tenantId,
      taxRateCode: request.taxRateCode,
    });

    if (isDuplicate) {
      throw new HttpException(
        {
          code: TAX_RATE_ERROR_CODES.TAX_RATE_CODE_DUPLICATE,
          message: TaxRateErrorMessage[TAX_RATE_ERROR_CODES.TAX_RATE_CODE_DUPLICATE],
        },
        TaxRateErrorHttpStatus[TAX_RATE_ERROR_CODES.TAX_RATE_CODE_DUPLICATE],
      );
    }

    // 登録
    const taxRate = await this.taxRateRepository.create({
      tenantId,
      createdBy: userId,
      data: {
        taxRateCode: request.taxRateCode,
        ratePercent: request.ratePercent,
        validFrom: new Date(request.validFrom),
        validTo: request.validTo ? new Date(request.validTo) : undefined,
        isActive: request.isActive ?? true,
      },
    });

    return {
      taxRate: this.toApiDto(taxRate),
    };
  }

  /**
   * 税率更新
   * Note: taxRateCode と ratePercent は変更不可
   */
  async updateTaxRate(
    tenantId: string,
    userId: string,
    taxRateId: string,
    request: UpdateTaxRateApiRequest,
  ): Promise<UpdateTaxRateApiResponse> {
    // 既存データ取得
    const existingTaxRate = await this.taxRateRepository.findById({
      tenantId,
      taxRateId,
    });

    if (!existingTaxRate) {
      throw new HttpException(
        {
          code: TAX_RATE_ERROR_CODES.TAX_RATE_NOT_FOUND,
          message: TaxRateErrorMessage[TAX_RATE_ERROR_CODES.TAX_RATE_NOT_FOUND],
        },
        TaxRateErrorHttpStatus[TAX_RATE_ERROR_CODES.TAX_RATE_NOT_FOUND],
      );
    }

    // バリデーション: 日付範囲
    if (request.validTo) {
      const validFrom = new Date(request.validFrom);
      const validTo = new Date(request.validTo);
      if (validTo < validFrom) {
        throw new HttpException(
          {
            code: TAX_RATE_ERROR_CODES.INVALID_DATE_RANGE,
            message: TaxRateErrorMessage[TAX_RATE_ERROR_CODES.INVALID_DATE_RANGE],
          },
          TaxRateErrorHttpStatus[TAX_RATE_ERROR_CODES.INVALID_DATE_RANGE],
        );
      }
    }

    // 更新（楽観ロック）
    const updatedTaxRate = await this.taxRateRepository.update({
      tenantId,
      taxRateId,
      version: request.version,
      updatedBy: userId,
      data: {
        validFrom: new Date(request.validFrom),
        validTo: request.validTo ? new Date(request.validTo) : undefined,
        isActive: request.isActive,
      },
    });

    // 楽観ロック競合
    if (!updatedTaxRate) {
      throw new HttpException(
        {
          code: TAX_RATE_ERROR_CODES.VERSION_CONFLICT,
          message: TaxRateErrorMessage[TAX_RATE_ERROR_CODES.VERSION_CONFLICT],
        },
        TaxRateErrorHttpStatus[TAX_RATE_ERROR_CODES.VERSION_CONFLICT],
      );
    }

    return {
      taxRate: this.toApiDto(updatedTaxRate),
    };
  }

  /**
   * 税率無効化
   */
  async deactivateTaxRate(
    tenantId: string,
    userId: string,
    taxRateId: string,
    request: DeactivateTaxRateApiRequest,
  ): Promise<DeactivateTaxRateApiResponse> {
    // 既存データ取得
    const existingTaxRate = await this.taxRateRepository.findById({
      tenantId,
      taxRateId,
    });

    if (!existingTaxRate) {
      throw new HttpException(
        {
          code: TAX_RATE_ERROR_CODES.TAX_RATE_NOT_FOUND,
          message: TaxRateErrorMessage[TAX_RATE_ERROR_CODES.TAX_RATE_NOT_FOUND],
        },
        TaxRateErrorHttpStatus[TAX_RATE_ERROR_CODES.TAX_RATE_NOT_FOUND],
      );
    }

    // 無効化（楽観ロック）
    const deactivatedTaxRate = await this.taxRateRepository.deactivate({
      tenantId,
      taxRateId,
      version: request.version,
      updatedBy: userId,
    });

    // 楽観ロック競合
    if (!deactivatedTaxRate) {
      throw new HttpException(
        {
          code: TAX_RATE_ERROR_CODES.VERSION_CONFLICT,
          message: TaxRateErrorMessage[TAX_RATE_ERROR_CODES.VERSION_CONFLICT],
        },
        TaxRateErrorHttpStatus[TAX_RATE_ERROR_CODES.VERSION_CONFLICT],
      );
    }

    return {
      taxRate: this.toApiDto(deactivatedTaxRate),
    };
  }

  /**
   * 税率有効化
   */
  async activateTaxRate(
    tenantId: string,
    userId: string,
    taxRateId: string,
    request: ActivateTaxRateApiRequest,
  ): Promise<ActivateTaxRateApiResponse> {
    // 既存データ取得
    const existingTaxRate = await this.taxRateRepository.findById({
      tenantId,
      taxRateId,
    });

    if (!existingTaxRate) {
      throw new HttpException(
        {
          code: TAX_RATE_ERROR_CODES.TAX_RATE_NOT_FOUND,
          message: TaxRateErrorMessage[TAX_RATE_ERROR_CODES.TAX_RATE_NOT_FOUND],
        },
        TaxRateErrorHttpStatus[TAX_RATE_ERROR_CODES.TAX_RATE_NOT_FOUND],
      );
    }

    // 有効化（楽観ロック）
    const activatedTaxRate = await this.taxRateRepository.activate({
      tenantId,
      taxRateId,
      version: request.version,
      updatedBy: userId,
    });

    // 楽観ロック競合
    if (!activatedTaxRate) {
      throw new HttpException(
        {
          code: TAX_RATE_ERROR_CODES.VERSION_CONFLICT,
          message: TaxRateErrorMessage[TAX_RATE_ERROR_CODES.VERSION_CONFLICT],
        },
        TaxRateErrorHttpStatus[TAX_RATE_ERROR_CODES.VERSION_CONFLICT],
      );
    }

    return {
      taxRate: this.toApiDto(activatedTaxRate),
    };
  }

  /**
   * TaxRate -> TaxRateApiDto 変換
   */
  private toApiDto(taxRate: TaxRate): TaxRateApiDto {
    return {
      id: taxRate.id,
      taxRateCode: taxRate.taxRateCode,
      ratePercent: taxRate.ratePercent.toString(),
      validFrom: taxRate.validFrom.toISOString().split('T')[0], // Date only
      validTo: taxRate.validTo?.toISOString().split('T')[0] ?? null,
      isActive: taxRate.isActive,
      version: taxRate.version,
      createdAt: taxRate.createdAt.toISOString(),
      updatedAt: taxRate.updatedAt.toISOString(),
      createdBy: taxRate.createdByLoginAccountId,
      updatedBy: taxRate.updatedByLoginAccountId,
    };
  }
}
