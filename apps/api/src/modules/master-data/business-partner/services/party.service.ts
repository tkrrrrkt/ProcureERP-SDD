/**
 * Party Service
 *
 * ビジネスルールの正本
 * - 取引先コード正規化・一意性チェック
 * - 派生フラグ更新
 * - 楽観ロック
 * - 監査ログ記録
 */

import { Injectable, HttpException } from '@nestjs/common';
import { PartyRepository } from '../repositories/party.repository';
import { TenantConfigService } from '../../../common/tenant-config/tenant-config.service';
import {
  normalizeBusinessCode,
} from '../../../../common/utils/normalize-business-code';
import {
  ListPartiesApiRequest,
  ListPartiesApiResponse,
  GetPartyApiResponse,
  CreatePartyApiRequest,
  CreatePartyApiResponse,
  UpdatePartyApiRequest,
  UpdatePartyApiResponse,
  PartyApiDto,
} from '@procure/contracts/api/business-partner';
import {
  BusinessPartnerErrorCode,
  BusinessPartnerErrorHttpStatus,
  BusinessPartnerErrorMessage,
} from '@procure/contracts/api/errors';
import { Party } from '@prisma/client';

@Injectable()
export class PartyService {
  constructor(
    private readonly partyRepository: PartyRepository,
    private readonly tenantConfigService: TenantConfigService,
  ) {}

  /**
   * 取引先一覧取得
   */
  async listParties(
    tenantId: string,
    request: ListPartiesApiRequest,
  ): Promise<ListPartiesApiResponse> {
    const { offset, limit, sortBy, sortOrder, keyword, isSupplier, isCustomer } = request;

    // keyword正規化: trim・空→undefined
    const normalizedKeyword = keyword?.trim() || undefined;

    const result = await this.partyRepository.findMany({
      tenantId,
      offset,
      limit,
      sortBy,
      sortOrder,
      keyword: normalizedKeyword,
      isSupplier,
      isCustomer,
    });

    return {
      items: result.items.map(this.toApiDto),
      total: result.total,
    };
  }

  /**
   * 取引先詳細取得
   */
  async getParty(
    tenantId: string,
    partyId: string,
  ): Promise<GetPartyApiResponse> {
    const party = await this.partyRepository.findById({
      tenantId,
      partyId,
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

    return {
      party: this.toApiDto(party),
    };
  }

  /**
   * 取引先新規登録
   */
  async createParty(
    tenantId: string,
    userId: string,
    request: CreatePartyApiRequest,
  ): Promise<CreatePartyApiResponse> {
    // コード正規化モード取得
    const mode = this.tenantConfigService.getCodeNormalizationMode(tenantId);

    // コード正規化（10桁、パターンチェック）
    const normalizedCode = normalizeBusinessCode(request.partyCode, {
      mode,
      fieldName: '取引先コード',
    });

    // 重複チェック
    const existingParty = await this.partyRepository.findByCode({
      tenantId,
      partyCode: normalizedCode,
    });

    if (existingParty) {
      throw new HttpException(
        {
          code: BusinessPartnerErrorCode.PARTY_CODE_DUPLICATE,
          message: BusinessPartnerErrorMessage.PARTY_CODE_DUPLICATE,
        },
        BusinessPartnerErrorHttpStatus.PARTY_CODE_DUPLICATE,
      );
    }

    // 登録
    const party = await this.partyRepository.create({
      tenantId,
      createdBy: userId,
      data: {
        partyCode: normalizedCode,
        partyName: request.partyName,
        partyNameKana: request.partyNameKana,
        partyShortName: request.partyShortName,
        countryCode: request.countryCode,
        postalCode: request.postalCode,
        prefecture: request.prefecture,
        city: request.city,
        addressLine1: request.addressLine1,
        addressLine2: request.addressLine2,
        phone: request.phone,
        fax: request.fax,
        websiteUrl: request.websiteUrl,
        corporateNumber: request.corporateNumber,
        invoiceRegistrationNo: request.invoiceRegistrationNo,
        notes: request.notes,
        isActive: request.isActive ?? true,
      },
    });

    return {
      party: this.toApiDto(party),
    };
  }

  /**
   * 取引先更新
   */
  async updateParty(
    tenantId: string,
    userId: string,
    partyId: string,
    request: UpdatePartyApiRequest,
  ): Promise<UpdatePartyApiResponse> {
    // 既存データ確認
    const existingParty = await this.partyRepository.findById({
      tenantId,
      partyId,
    });

    if (!existingParty) {
      throw new HttpException(
        {
          code: BusinessPartnerErrorCode.PARTY_NOT_FOUND,
          message: BusinessPartnerErrorMessage.PARTY_NOT_FOUND,
        },
        BusinessPartnerErrorHttpStatus.PARTY_NOT_FOUND,
      );
    }

    // 更新（楽観ロック）
    const updatedParty = await this.partyRepository.update({
      tenantId,
      partyId,
      version: request.version,
      updatedBy: userId,
      data: {
        partyName: request.partyName,
        partyNameKana: request.partyNameKana,
        partyShortName: request.partyShortName,
        countryCode: request.countryCode,
        postalCode: request.postalCode,
        prefecture: request.prefecture,
        city: request.city,
        addressLine1: request.addressLine1,
        addressLine2: request.addressLine2,
        phone: request.phone,
        fax: request.fax,
        websiteUrl: request.websiteUrl,
        corporateNumber: request.corporateNumber,
        invoiceRegistrationNo: request.invoiceRegistrationNo,
        notes: request.notes,
        isActive: request.isActive,
      },
    });

    // 楽観ロック競合
    if (!updatedParty) {
      throw new HttpException(
        {
          code: BusinessPartnerErrorCode.CONCURRENT_UPDATE,
          message: BusinessPartnerErrorMessage.CONCURRENT_UPDATE,
        },
        BusinessPartnerErrorHttpStatus.CONCURRENT_UPDATE,
      );
    }

    return {
      party: this.toApiDto(updatedParty),
    };
  }

  /**
   * 派生フラグ更新（SupplierSite/CustomerSite作成・削除時に呼び出し）
   */
  async updateDerivedFlags(
    tenantId: string,
    partyId: string,
  ): Promise<void> {
    // SupplierSite件数カウント（isActive=true のみ）
    const supplierSiteCount = await this.partyRepository.countSupplierSites({
      tenantId,
      partyId,
      isActive: true,
    });

    // 派生フラグ更新
    await this.partyRepository.updateDerivedFlags({
      tenantId,
      partyId,
      isSupplier: supplierSiteCount > 0,
      // isCustomer は CustomerSite 実装時に追加
    });
  }

  /**
   * Party -> PartyApiDto 変換
   */
  private toApiDto(party: Party): PartyApiDto {
    return {
      id: party.id,
      partyCode: party.partyCode,
      partyName: party.partyName,
      partyNameKana: party.partyNameKana,
      partyShortName: party.partyShortName,
      countryCode: party.countryCode,
      postalCode: party.postalCode,
      prefecture: party.prefecture,
      city: party.city,
      addressLine1: party.addressLine1,
      addressLine2: party.addressLine2,
      phone: party.phone,
      fax: party.fax,
      websiteUrl: party.websiteUrl,
      corporateNumber: party.corporateNumber,
      invoiceRegistrationNo: party.invoiceRegistrationNo,
      isSupplier: party.isSupplier,
      isCustomer: party.isCustomer,
      isActive: party.isActive,
      notes: party.notes,
      version: party.version,
      createdAt: party.createdAt.toISOString(),
      updatedAt: party.updatedAt.toISOString(),
      createdBy: party.createdByLoginAccountId,
      updatedBy: party.updatedByLoginAccountId,
    };
  }
}
