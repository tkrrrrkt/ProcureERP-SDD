/**
 * Payee Service
 *
 * ビジネスルールの正本
 * - 支払先コード正規化・一意性チェック
 * - Payee自動生成（findOrCreate）
 * - 楽観ロック
 */

import { Injectable, HttpException } from '@nestjs/common';
import { PayeeRepository, PayeeWithRelations } from '../repositories/payee.repository';
import { PartyRepository } from '../repositories/party.repository';
import { TenantConfigService } from '../../../common/tenant-config/tenant-config.service';
import {
  normalizeBusinessCode,
  generateDisplayCode,
} from '../../../../common/utils/normalize-business-code';
import {
  ListPayeesApiRequest,
  ListPayeesApiResponse,
  GetPayeeApiResponse,
  CreatePayeeApiRequest,
  CreatePayeeApiResponse,
  UpdatePayeeApiRequest,
  UpdatePayeeApiResponse,
  PayeeApiDto,
} from '@procure/contracts/api/business-partner';
import {
  BusinessPartnerErrorCode,
  BusinessPartnerErrorHttpStatus,
  BusinessPartnerErrorMessage,
} from '@procure/contracts/api/errors';
import { Payee } from '@prisma/client';

@Injectable()
export class PayeeService {
  constructor(
    private readonly payeeRepository: PayeeRepository,
    private readonly partyRepository: PartyRepository,
    private readonly tenantConfigService: TenantConfigService,
  ) {}

  /**
   * 支払先一覧取得
   */
  async listPayees(
    tenantId: string,
    request: ListPayeesApiRequest,
  ): Promise<ListPayeesApiResponse> {
    const { partyId, offset, limit, sortBy, sortOrder, keyword } = request;

    const normalizedKeyword = keyword?.trim() || undefined;

    const result = await this.payeeRepository.findMany({
      tenantId,
      partyId,
      offset,
      limit,
      sortBy,
      sortOrder,
      keyword: normalizedKeyword,
    });

    return {
      items: result.items.map(this.toApiDto),
      total: result.total,
    };
  }

  /**
   * 支払先詳細取得
   */
  async getPayee(
    tenantId: string,
    payeeId: string,
  ): Promise<GetPayeeApiResponse> {
    const payee = await this.payeeRepository.findById({
      tenantId,
      payeeId,
    });

    if (!payee) {
      throw new HttpException(
        {
          code: BusinessPartnerErrorCode.PAYEE_NOT_FOUND,
          message: BusinessPartnerErrorMessage.PAYEE_NOT_FOUND,
        },
        BusinessPartnerErrorHttpStatus.PAYEE_NOT_FOUND,
      );
    }

    return {
      payee: this.toApiDto(payee),
    };
  }

  /**
   * 支払先新規登録
   */
  async createPayee(
    tenantId: string,
    userId: string,
    request: CreatePayeeApiRequest,
  ): Promise<CreatePayeeApiResponse> {
    // Party存在確認
    const party = await this.partyRepository.findById({
      tenantId,
      partyId: request.partyId,
    });

    if (!party) {
      throw new HttpException(
        {
          code: BusinessPartnerErrorCode.PARTY_NOT_FOUND,
          message: BusinessPartnerErrorMessage.PARTY_NOT_FOUND,
        },
        BusinessPartnerErrorHttpStatus.PARTY_NOT_FOUND,
      );
    }

    // コード正規化
    const mode = this.tenantConfigService.getCodeNormalizationMode(tenantId);
    const normalizedSubCode = normalizeBusinessCode(request.payeeSubCode, {
      mode,
      fieldName: '支払先枝番コード',
    });

    // 表示用コード生成
    const payeeCode = generateDisplayCode(party.partyCode, normalizedSubCode);

    // 重複チェック（payeeCode）
    const existingPayee = await this.payeeRepository.findByCode({
      tenantId,
      payeeCode,
    });

    if (existingPayee) {
      throw new HttpException(
        {
          code: BusinessPartnerErrorCode.PAYEE_CODE_DUPLICATE,
          message: BusinessPartnerErrorMessage.PAYEE_CODE_DUPLICATE,
        },
        BusinessPartnerErrorHttpStatus.PAYEE_CODE_DUPLICATE,
      );
    }

    // 登録
    const payee = await this.payeeRepository.create({
      tenantId,
      createdBy: userId,
      data: {
        partyId: request.partyId,
        payeeSubCode: normalizedSubCode,
        payeeCode,
        payeeName: request.payeeName,
        payeeNameKana: request.payeeNameKana,
        postalCode: request.postalCode,
        prefecture: request.prefecture,
        city: request.city,
        addressLine1: request.addressLine1,
        addressLine2: request.addressLine2,
        phone: request.phone,
        fax: request.fax,
        email: request.email,
        contactName: request.contactName,
        paymentMethod: request.paymentMethod,
        currencyCode: request.currencyCode,
        paymentTermsText: request.paymentTermsText,
        defaultCompanyBankAccountId: request.defaultCompanyBankAccountId,
        notes: request.notes,
      },
    });

    // 詳細情報を取得して返す
    const payeeWithRelations = await this.payeeRepository.findById({
      tenantId,
      payeeId: payee.id,
    });

    return {
      payee: this.toApiDto(payeeWithRelations!),
    };
  }

  /**
   * 支払先更新
   */
  async updatePayee(
    tenantId: string,
    userId: string,
    payeeId: string,
    request: UpdatePayeeApiRequest,
  ): Promise<UpdatePayeeApiResponse> {
    // 既存データ確認
    const existingPayee = await this.payeeRepository.findById({
      tenantId,
      payeeId,
    });

    if (!existingPayee) {
      throw new HttpException(
        {
          code: BusinessPartnerErrorCode.PAYEE_NOT_FOUND,
          message: BusinessPartnerErrorMessage.PAYEE_NOT_FOUND,
        },
        BusinessPartnerErrorHttpStatus.PAYEE_NOT_FOUND,
      );
    }

    // 更新（楽観ロック）
    const updatedPayee = await this.payeeRepository.update({
      tenantId,
      payeeId,
      version: request.version,
      updatedBy: userId,
      data: {
        payeeName: request.payeeName,
        payeeNameKana: request.payeeNameKana,
        postalCode: request.postalCode,
        prefecture: request.prefecture,
        city: request.city,
        addressLine1: request.addressLine1,
        addressLine2: request.addressLine2,
        phone: request.phone,
        fax: request.fax,
        email: request.email,
        contactName: request.contactName,
        paymentMethod: request.paymentMethod,
        currencyCode: request.currencyCode,
        paymentTermsText: request.paymentTermsText,
        defaultCompanyBankAccountId: request.defaultCompanyBankAccountId,
        notes: request.notes,
        isActive: request.isActive,
      },
    });

    if (!updatedPayee) {
      throw new HttpException(
        {
          code: BusinessPartnerErrorCode.CONCURRENT_UPDATE,
          message: BusinessPartnerErrorMessage.CONCURRENT_UPDATE,
        },
        BusinessPartnerErrorHttpStatus.CONCURRENT_UPDATE,
      );
    }

    return {
      payee: this.toApiDto(updatedPayee),
    };
  }

  /**
   * Payee検索または作成（SupplierSite自動生成用）
   *
   * 同一 party_id + payee_sub_code のPayeeが存在すれば返し、なければ作成
   */
  async findOrCreate(params: {
    tenantId: string;
    userId: string;
    partyId: string;
    partyCode: string;
    payeeSubCode: string;
    payeeName: string;
    payeeNameKana?: string;
    paymentMethod?: string;
    currencyCode?: string;
    paymentTermsText?: string;
  }): Promise<Payee> {
    const {
      tenantId,
      userId,
      partyId,
      partyCode,
      payeeSubCode,
      payeeName,
      payeeNameKana,
      paymentMethod,
      currencyCode,
      paymentTermsText,
    } = params;

    // 既存Payee検索
    const existingPayee = await this.payeeRepository.findByPartyAndSubCode({
      tenantId,
      partyId,
      payeeSubCode,
    });

    if (existingPayee) {
      return existingPayee;
    }

    // 新規作成
    const payeeCode = generateDisplayCode(partyCode, payeeSubCode);

    return this.payeeRepository.create({
      tenantId,
      createdBy: userId,
      data: {
        partyId,
        payeeSubCode,
        payeeCode,
        payeeName,
        payeeNameKana,
        paymentMethod,
        currencyCode,
        paymentTermsText,
      },
    });
  }

  /**
   * Payee -> PayeeApiDto 変換
   */
  private toApiDto(payee: PayeeWithRelations): PayeeApiDto {
    return {
      id: payee.id,
      partyId: payee.partyId,
      payeeSubCode: payee.payeeSubCode,
      payeeCode: payee.payeeCode,
      payeeName: payee.payeeName,
      payeeNameKana: payee.payeeNameKana,
      postalCode: payee.payeePostalCode,
      prefecture: payee.payeePrefecture,
      city: payee.payeeCity,
      addressLine1: payee.payeeAddressLine1,
      addressLine2: payee.payeeAddressLine2,
      phone: payee.payeePhone,
      fax: payee.payeeFax,
      email: payee.payeeEmail,
      contactName: payee.payeeContactName,
      paymentMethod: payee.paymentMethod,
      currencyCode: payee.currencyCode,
      paymentTermsText: payee.paymentTermsText,
      defaultCompanyBankAccountId: payee.defaultCompanyBankAccountId,
      isActive: payee.isActive,
      notes: payee.notes,
      version: payee.version,
      createdAt: payee.createdAt.toISOString(),
      updatedAt: payee.updatedAt.toISOString(),
      createdBy: payee.createdByLoginAccountId,
      updatedBy: payee.updatedByLoginAccountId,
    };
  }
}
