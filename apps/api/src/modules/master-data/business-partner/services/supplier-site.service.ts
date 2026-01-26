/**
 * SupplierSite Service
 *
 * ビジネスルールの正本
 * - 仕入先コード正規化・一意性チェック
 * - Payee自動生成
 * - 派生フラグ更新
 * - 楽観ロック
 */

import { Injectable, HttpException } from '@nestjs/common';
import { SupplierSiteRepository, SupplierSiteWithPayee } from '../repositories/supplier-site.repository';
import { PartyRepository } from '../repositories/party.repository';
import { PayeeService } from './payee.service';
import { PartyService } from './party.service';
import { TenantConfigService } from '../../../common/tenant-config/tenant-config.service';
import {
  normalizeBusinessCode,
  generateDisplayCode,
} from '../../../../common/utils/normalize-business-code';
import {
  ListSupplierSitesApiRequest,
  ListSupplierSitesApiResponse,
  GetSupplierSiteApiResponse,
  CreateSupplierSiteApiRequest,
  CreateSupplierSiteApiResponse,
  UpdateSupplierSiteApiRequest,
  UpdateSupplierSiteApiResponse,
  SupplierSiteApiDto,
} from '@procure/contracts/api/business-partner';
import {
  BusinessPartnerErrorCode,
  BusinessPartnerErrorHttpStatus,
  BusinessPartnerErrorMessage,
} from '@procure/contracts/api/errors';

@Injectable()
export class SupplierSiteService {
  constructor(
    private readonly supplierSiteRepository: SupplierSiteRepository,
    private readonly partyRepository: PartyRepository,
    private readonly payeeService: PayeeService,
    private readonly partyService: PartyService,
    private readonly tenantConfigService: TenantConfigService,
  ) {}

  /**
   * 仕入先拠点一覧取得
   */
  async listSupplierSites(
    tenantId: string,
    request: ListSupplierSitesApiRequest,
  ): Promise<ListSupplierSitesApiResponse> {
    const { partyId, offset, limit, sortBy, sortOrder, keyword } = request;

    const normalizedKeyword = keyword?.trim() || undefined;

    const result = await this.supplierSiteRepository.findMany({
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
   * 仕入先拠点詳細取得
   */
  async getSupplierSite(
    tenantId: string,
    supplierSiteId: string,
  ): Promise<GetSupplierSiteApiResponse> {
    const supplierSite = await this.supplierSiteRepository.findById({
      tenantId,
      supplierSiteId,
    });

    if (!supplierSite) {
      throw new HttpException(
        {
          code: BusinessPartnerErrorCode.SUPPLIER_SITE_NOT_FOUND,
          message: BusinessPartnerErrorMessage.SUPPLIER_SITE_NOT_FOUND,
        },
        BusinessPartnerErrorHttpStatus.SUPPLIER_SITE_NOT_FOUND,
      );
    }

    return {
      supplierSite: this.toApiDto(supplierSite),
    };
  }

  /**
   * 仕入先拠点新規登録
   *
   * トランザクション:
   * 1. Payee findOrCreate
   * 2. SupplierSite create
   * 3. Party.isSupplier 更新
   */
  async createSupplierSite(
    tenantId: string,
    userId: string,
    request: CreateSupplierSiteApiRequest,
  ): Promise<CreateSupplierSiteApiResponse> {
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
    const normalizedSubCode = normalizeBusinessCode(request.supplierSubCode, {
      mode,
      fieldName: '仕入先枝番コード',
    });

    // 表示用コード生成
    const supplierCode = generateDisplayCode(party.partyCode, normalizedSubCode);

    // 重複チェック
    const existingSupplierSite = await this.supplierSiteRepository.findByCode({
      tenantId,
      supplierCode,
    });

    if (existingSupplierSite) {
      throw new HttpException(
        {
          code: BusinessPartnerErrorCode.SUPPLIER_CODE_DUPLICATE,
          message: BusinessPartnerErrorMessage.SUPPLIER_CODE_DUPLICATE,
        },
        BusinessPartnerErrorHttpStatus.SUPPLIER_CODE_DUPLICATE,
      );
    }

    // Payee処理（既存指定 or 自動生成）
    let payeeId: string;

    if (request.payeeId) {
      // 既存Payee使用
      payeeId = request.payeeId;
    } else {
      // Payee自動生成
      const payeeSubCode = request.payeeSubCode || normalizedSubCode;
      const normalizedPayeeSubCode = normalizeBusinessCode(payeeSubCode, {
        mode,
        fieldName: '支払先枝番コード',
      });

      const payee = await this.payeeService.findOrCreate({
        tenantId,
        userId,
        partyId: request.partyId,
        partyCode: party.partyCode,
        payeeSubCode: normalizedPayeeSubCode,
        payeeName: request.payeeName || request.supplierName,
        payeeNameKana: request.payeeNameKana || request.supplierNameKana,
        paymentMethod: request.paymentMethod,
        currencyCode: request.currencyCode,
        paymentTermsText: request.paymentTermsText,
      });

      payeeId = payee.id;
    }

    // SupplierSite登録
    const supplierSite = await this.supplierSiteRepository.create({
      tenantId,
      createdBy: userId,
      data: {
        partyId: request.partyId,
        supplierSubCode: normalizedSubCode,
        supplierCode,
        supplierName: request.supplierName,
        supplierNameKana: request.supplierNameKana,
        postalCode: request.postalCode,
        prefecture: request.prefecture,
        city: request.city,
        addressLine1: request.addressLine1,
        addressLine2: request.addressLine2,
        phone: request.phone,
        fax: request.fax,
        email: request.email,
        contactName: request.contactName,
        payeeId,
        notes: request.notes,
      },
    });

    // 派生フラグ更新
    await this.partyService.updateDerivedFlags(tenantId, request.partyId);

    // 詳細情報を取得して返す
    const supplierSiteWithPayee = await this.supplierSiteRepository.findById({
      tenantId,
      supplierSiteId: supplierSite.id,
    });

    return {
      supplierSite: this.toApiDto(supplierSiteWithPayee!),
    };
  }

  /**
   * 仕入先拠点更新
   */
  async updateSupplierSite(
    tenantId: string,
    userId: string,
    supplierSiteId: string,
    request: UpdateSupplierSiteApiRequest,
  ): Promise<UpdateSupplierSiteApiResponse> {
    // 既存データ確認
    const existingSupplierSite = await this.supplierSiteRepository.findById({
      tenantId,
      supplierSiteId,
    });

    if (!existingSupplierSite) {
      throw new HttpException(
        {
          code: BusinessPartnerErrorCode.SUPPLIER_SITE_NOT_FOUND,
          message: BusinessPartnerErrorMessage.SUPPLIER_SITE_NOT_FOUND,
        },
        BusinessPartnerErrorHttpStatus.SUPPLIER_SITE_NOT_FOUND,
      );
    }

    // 更新（楽観ロック）
    const updatedSupplierSite = await this.supplierSiteRepository.update({
      tenantId,
      supplierSiteId,
      version: request.version,
      updatedBy: userId,
      data: {
        supplierName: request.supplierName,
        supplierNameKana: request.supplierNameKana,
        postalCode: request.postalCode,
        prefecture: request.prefecture,
        city: request.city,
        addressLine1: request.addressLine1,
        addressLine2: request.addressLine2,
        phone: request.phone,
        fax: request.fax,
        email: request.email,
        contactName: request.contactName,
        payeeId: request.payeeId,
        notes: request.notes,
        isActive: request.isActive,
      },
    });

    if (!updatedSupplierSite) {
      throw new HttpException(
        {
          code: BusinessPartnerErrorCode.CONCURRENT_UPDATE,
          message: BusinessPartnerErrorMessage.CONCURRENT_UPDATE,
        },
        BusinessPartnerErrorHttpStatus.CONCURRENT_UPDATE,
      );
    }

    // is_active変更がある場合、派生フラグ更新
    if (request.isActive !== undefined && request.isActive !== existingSupplierSite.isActive) {
      await this.partyService.updateDerivedFlags(tenantId, existingSupplierSite.partyId);
    }

    return {
      supplierSite: this.toApiDto(updatedSupplierSite),
    };
  }

  /**
   * SupplierSite -> SupplierSiteApiDto 変換
   */
  private toApiDto(supplierSite: SupplierSiteWithPayee): SupplierSiteApiDto {
    return {
      id: supplierSite.id,
      partyId: supplierSite.partyId,
      supplierSubCode: supplierSite.supplierSubCode,
      supplierCode: supplierSite.supplierCode,
      supplierName: supplierSite.supplierName,
      supplierNameKana: supplierSite.supplierNameKana,
      postalCode: supplierSite.postalCode,
      prefecture: supplierSite.prefecture,
      city: supplierSite.city,
      addressLine1: supplierSite.addressLine1,
      addressLine2: supplierSite.addressLine2,
      phone: supplierSite.phone,
      fax: supplierSite.fax,
      email: supplierSite.email,
      contactName: supplierSite.contactName,
      payeeId: supplierSite.payeeId || '',
      isActive: supplierSite.isActive,
      notes: supplierSite.notes,
      version: supplierSite.version,
      createdAt: supplierSite.createdAt.toISOString(),
      updatedAt: supplierSite.updatedAt.toISOString(),
      createdBy: supplierSite.createdByLoginAccountId,
      updatedBy: supplierSite.updatedByLoginAccountId,
    };
  }
}
