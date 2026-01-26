import { Injectable, HttpException } from '@nestjs/common';
import { TaxCodeRepository, TaxCodeWithRelations } from '../repository/tax-code.repository';
import { TaxBusinessCategoryRepository } from '../repository/tax-business-category.repository';
import { PrismaService } from '../../../../prisma/prisma.service';
import { TaxRate, TaxBusinessCategory } from '@prisma/client';
import {
  ListTaxCodesApiRequest,
  ListTaxCodesApiResponse,
  GetTaxCodeApiResponse,
  CreateTaxCodeApiRequest,
  CreateTaxCodeApiResponse,
  UpdateTaxCodeApiRequest,
  UpdateTaxCodeApiResponse,
  DeactivateTaxCodeApiRequest,
  DeactivateTaxCodeApiResponse,
  ActivateTaxCodeApiRequest,
  ActivateTaxCodeApiResponse,
  TaxCodeApiDto,
  TaxBusinessCategoryApiDto,
  TaxRateForDropdownApiDto,
  ListTaxBusinessCategoriesApiResponse,
  ListTaxRatesForDropdownApiResponse,
  TaxInOut,
} from '@procure/contracts/api/tax-code';
import {
  TAX_CODE_ERROR_CODES,
  TaxCodeErrorHttpStatus,
  TaxCodeErrorMessage,
} from '@procure/contracts/api/errors';

/**
 * Tax Code Service
 *
 * ビジネスルールの正本
 * - 税コード一意性チェック
 * - 税区分ID・税率ID存在チェック
 * - イミュータブルフィールド（taxCode, taxBusinessCategoryId, taxRateId, taxInOut）
 * - 楽観ロック
 * - 監査ログ記録
 */
@Injectable()
export class TaxCodeService {
  constructor(
    private readonly taxCodeRepository: TaxCodeRepository,
    private readonly taxBusinessCategoryRepository: TaxBusinessCategoryRepository,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * 税コード一覧取得
   */
  async listTaxCodes(
    tenantId: string,
    request: ListTaxCodesApiRequest,
  ): Promise<ListTaxCodesApiResponse> {
    const { offset, limit, sortBy, sortOrder, keyword, taxBusinessCategoryId, isActive } =
      request;

    const result = await this.taxCodeRepository.findMany({
      tenantId,
      offset,
      limit,
      sortBy,
      sortOrder,
      keyword,
      taxBusinessCategoryId,
      isActive,
    });

    return {
      items: result.items.map(this.toApiDto),
      total: result.total,
    };
  }

  /**
   * 税コード詳細取得
   */
  async getTaxCode(
    tenantId: string,
    taxCodeId: string,
  ): Promise<GetTaxCodeApiResponse> {
    const taxCode = await this.taxCodeRepository.findById({
      tenantId,
      taxCodeId,
    });

    if (!taxCode) {
      throw new HttpException(
        {
          code: TAX_CODE_ERROR_CODES.TAX_CODE_NOT_FOUND,
          message: TaxCodeErrorMessage[TAX_CODE_ERROR_CODES.TAX_CODE_NOT_FOUND],
        },
        TaxCodeErrorHttpStatus[TAX_CODE_ERROR_CODES.TAX_CODE_NOT_FOUND],
      );
    }

    return {
      taxCode: this.toApiDto(taxCode),
    };
  }

  /**
   * 税コード新規登録
   */
  async createTaxCode(
    tenantId: string,
    userId: string,
    request: CreateTaxCodeApiRequest,
  ): Promise<CreateTaxCodeApiResponse> {
    // バリデーション: 税コード重複チェック
    const isDuplicate = await this.taxCodeRepository.checkTaxCodeDuplicate({
      tenantId,
      taxCode: request.taxCode,
    });

    if (isDuplicate) {
      throw new HttpException(
        {
          code: TAX_CODE_ERROR_CODES.TAX_CODE_DUPLICATE,
          message: TaxCodeErrorMessage[TAX_CODE_ERROR_CODES.TAX_CODE_DUPLICATE],
        },
        TaxCodeErrorHttpStatus[TAX_CODE_ERROR_CODES.TAX_CODE_DUPLICATE],
      );
    }

    // バリデーション: 税区分ID存在チェック
    const taxBusinessCategory = await this.taxBusinessCategoryRepository.findById({
      tenantId,
      taxBusinessCategoryId: request.taxBusinessCategoryId,
    });

    if (!taxBusinessCategory) {
      throw new HttpException(
        {
          code: TAX_CODE_ERROR_CODES.TAX_BUSINESS_CATEGORY_NOT_FOUND,
          message: TaxCodeErrorMessage[TAX_CODE_ERROR_CODES.TAX_BUSINESS_CATEGORY_NOT_FOUND],
        },
        TaxCodeErrorHttpStatus[TAX_CODE_ERROR_CODES.TAX_BUSINESS_CATEGORY_NOT_FOUND],
      );
    }

    // バリデーション: 税率ID存在チェック
    const taxRate = await this.prisma.taxRate.findFirst({
      where: {
        id: request.taxRateId,
        tenantId,
      },
    });

    if (!taxRate) {
      throw new HttpException(
        {
          code: TAX_CODE_ERROR_CODES.TAX_RATE_NOT_FOUND,
          message: TaxCodeErrorMessage[TAX_CODE_ERROR_CODES.TAX_RATE_NOT_FOUND],
        },
        TaxCodeErrorHttpStatus[TAX_CODE_ERROR_CODES.TAX_RATE_NOT_FOUND],
      );
    }

    // 登録
    const taxCode = await this.taxCodeRepository.create({
      tenantId,
      createdBy: userId,
      data: {
        taxCode: request.taxCode,
        taxBusinessCategoryId: request.taxBusinessCategoryId,
        taxRateId: request.taxRateId,
        taxInOut: request.taxInOut,
        isActive: request.isActive ?? true,
      },
    });

    return {
      taxCode: this.toApiDto(taxCode),
    };
  }

  /**
   * 税コード更新
   * Note: taxCode, taxBusinessCategoryId, taxRateId, taxInOut は変更不可
   */
  async updateTaxCode(
    tenantId: string,
    userId: string,
    taxCodeId: string,
    request: UpdateTaxCodeApiRequest,
  ): Promise<UpdateTaxCodeApiResponse> {
    // 既存データ取得
    const existingTaxCode = await this.taxCodeRepository.findById({
      tenantId,
      taxCodeId,
    });

    if (!existingTaxCode) {
      throw new HttpException(
        {
          code: TAX_CODE_ERROR_CODES.TAX_CODE_NOT_FOUND,
          message: TaxCodeErrorMessage[TAX_CODE_ERROR_CODES.TAX_CODE_NOT_FOUND],
        },
        TaxCodeErrorHttpStatus[TAX_CODE_ERROR_CODES.TAX_CODE_NOT_FOUND],
      );
    }

    // 更新（楽観ロック）
    const updatedTaxCode = await this.taxCodeRepository.update({
      tenantId,
      taxCodeId,
      version: request.version,
      updatedBy: userId,
      data: {
        isActive: request.isActive,
      },
    });

    // 楽観ロック競合
    if (!updatedTaxCode) {
      throw new HttpException(
        {
          code: TAX_CODE_ERROR_CODES.VERSION_CONFLICT,
          message: TaxCodeErrorMessage[TAX_CODE_ERROR_CODES.VERSION_CONFLICT],
        },
        TaxCodeErrorHttpStatus[TAX_CODE_ERROR_CODES.VERSION_CONFLICT],
      );
    }

    return {
      taxCode: this.toApiDto(updatedTaxCode),
    };
  }

  /**
   * 税コード無効化
   */
  async deactivateTaxCode(
    tenantId: string,
    userId: string,
    taxCodeId: string,
    request: DeactivateTaxCodeApiRequest,
  ): Promise<DeactivateTaxCodeApiResponse> {
    // 既存データ取得
    const existingTaxCode = await this.taxCodeRepository.findById({
      tenantId,
      taxCodeId,
    });

    if (!existingTaxCode) {
      throw new HttpException(
        {
          code: TAX_CODE_ERROR_CODES.TAX_CODE_NOT_FOUND,
          message: TaxCodeErrorMessage[TAX_CODE_ERROR_CODES.TAX_CODE_NOT_FOUND],
        },
        TaxCodeErrorHttpStatus[TAX_CODE_ERROR_CODES.TAX_CODE_NOT_FOUND],
      );
    }

    // 無効化（楽観ロック）
    const deactivatedTaxCode = await this.taxCodeRepository.deactivate({
      tenantId,
      taxCodeId,
      version: request.version,
      updatedBy: userId,
    });

    // 楽観ロック競合
    if (!deactivatedTaxCode) {
      throw new HttpException(
        {
          code: TAX_CODE_ERROR_CODES.VERSION_CONFLICT,
          message: TaxCodeErrorMessage[TAX_CODE_ERROR_CODES.VERSION_CONFLICT],
        },
        TaxCodeErrorHttpStatus[TAX_CODE_ERROR_CODES.VERSION_CONFLICT],
      );
    }

    return {
      taxCode: this.toApiDto(deactivatedTaxCode),
    };
  }

  /**
   * 税コード有効化
   */
  async activateTaxCode(
    tenantId: string,
    userId: string,
    taxCodeId: string,
    request: ActivateTaxCodeApiRequest,
  ): Promise<ActivateTaxCodeApiResponse> {
    // 既存データ取得
    const existingTaxCode = await this.taxCodeRepository.findById({
      tenantId,
      taxCodeId,
    });

    if (!existingTaxCode) {
      throw new HttpException(
        {
          code: TAX_CODE_ERROR_CODES.TAX_CODE_NOT_FOUND,
          message: TaxCodeErrorMessage[TAX_CODE_ERROR_CODES.TAX_CODE_NOT_FOUND],
        },
        TaxCodeErrorHttpStatus[TAX_CODE_ERROR_CODES.TAX_CODE_NOT_FOUND],
      );
    }

    // 有効化（楽観ロック）
    const activatedTaxCode = await this.taxCodeRepository.activate({
      tenantId,
      taxCodeId,
      version: request.version,
      updatedBy: userId,
    });

    // 楽観ロック競合
    if (!activatedTaxCode) {
      throw new HttpException(
        {
          code: TAX_CODE_ERROR_CODES.VERSION_CONFLICT,
          message: TaxCodeErrorMessage[TAX_CODE_ERROR_CODES.VERSION_CONFLICT],
        },
        TaxCodeErrorHttpStatus[TAX_CODE_ERROR_CODES.VERSION_CONFLICT],
      );
    }

    return {
      taxCode: this.toApiDto(activatedTaxCode),
    };
  }

  /**
   * 税区分一覧取得（ドロップダウン用）
   */
  async listTaxBusinessCategories(
    tenantId: string,
  ): Promise<ListTaxBusinessCategoriesApiResponse> {
    const items = await this.taxBusinessCategoryRepository.findManyActive({
      tenantId,
    });

    return {
      items: items.map(this.toTaxBusinessCategoryApiDto),
    };
  }

  /**
   * 税率一覧取得（ドロップダウン用）
   */
  async listTaxRatesForDropdown(
    tenantId: string,
  ): Promise<ListTaxRatesForDropdownApiResponse> {
    const items = await this.prisma.taxRate.findMany({
      where: {
        tenantId,
        isActive: true,
      },
      orderBy: {
        taxRateCode: 'asc',
      },
    });

    return {
      items: items.map(this.toTaxRateForDropdownApiDto),
    };
  }

  /**
   * TaxCodeWithRelations -> TaxCodeApiDto 変換
   */
  private toApiDto(taxCode: TaxCodeWithRelations): TaxCodeApiDto {
    return {
      id: taxCode.id,
      taxCode: taxCode.taxCode,
      taxBusinessCategoryId: taxCode.taxBusinessCategoryId,
      taxBusinessCategoryCode: taxCode.taxBusinessCategory.taxBusinessCategoryCode,
      taxBusinessCategoryName: taxCode.taxBusinessCategory.taxBusinessCategoryName,
      taxRateId: taxCode.taxRateId,
      taxRateCode: taxCode.taxRate.taxRateCode,
      ratePercent: taxCode.taxRate.ratePercent.toString(),
      taxInOut: taxCode.taxInOut as TaxInOut,
      isActive: taxCode.isActive,
      version: taxCode.version,
      createdAt: taxCode.createdAt.toISOString(),
      updatedAt: taxCode.updatedAt.toISOString(),
      createdBy: taxCode.createdByLoginAccountId,
      updatedBy: taxCode.updatedByLoginAccountId,
    };
  }

  /**
   * TaxBusinessCategory -> TaxBusinessCategoryApiDto 変換
   */
  private toTaxBusinessCategoryApiDto(
    category: TaxBusinessCategory,
  ): TaxBusinessCategoryApiDto {
    return {
      id: category.id,
      taxBusinessCategoryCode: category.taxBusinessCategoryCode,
      taxBusinessCategoryName: category.taxBusinessCategoryName,
    };
  }

  /**
   * TaxRate -> TaxRateForDropdownApiDto 変換
   */
  private toTaxRateForDropdownApiDto(taxRate: TaxRate): TaxRateForDropdownApiDto {
    return {
      id: taxRate.id,
      taxRateCode: taxRate.taxRateCode,
      ratePercent: taxRate.ratePercent.toString(),
      validFrom: taxRate.validFrom.toISOString().split('T')[0],
      validTo: taxRate.validTo?.toISOString().split('T')[0] ?? null,
    };
  }
}
