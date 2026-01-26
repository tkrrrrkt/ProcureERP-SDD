import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ShipToRepository } from '../repository/ship-to.repository';
import {
  ListShipTosApiRequest,
  ListShipTosApiResponse,
  GetShipToApiResponse,
  CreateShipToApiRequest,
  CreateShipToApiResponse,
  UpdateShipToApiRequest,
  UpdateShipToApiResponse,
  DeactivateShipToApiRequest,
  DeactivateShipToApiResponse,
  ActivateShipToApiRequest,
  ActivateShipToApiResponse,
  ShipToApiDto,
} from '@procure/contracts/api/ship-to';
import {
  ShipToErrorCode,
  ShipToErrorHttpStatus,
  ShipToErrorMessage,
} from '@procure/contracts/api/errors';
import { ShipTo } from '@prisma/client';
import {
  normalizeShipToCode,
  validateEmail,
} from '../utils/normalize-ship-to-code';

/**
 * ShipTo Service
 *
 * ビジネスルールの正本
 * - 納入先コード一意性チェック（10桁英数字）
 * - 納入先コード形式チェック・正規化
 * - メールアドレス形式チェック
 * - 楽観ロック
 * - CustomerSite未実装時のガード
 * - 監査ログ記録
 */
@Injectable()
export class ShipToService {
  constructor(private readonly shipToRepository: ShipToRepository) {}

  /**
   * 納入先一覧取得
   */
  async listShipTos(
    tenantId: string,
    request: ListShipTosApiRequest,
  ): Promise<ListShipTosApiResponse> {
    const { offset, limit, sortBy, sortOrder, keyword, isActive } = request;

    const result = await this.shipToRepository.findMany({
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
   * 納入先詳細取得
   */
  async getShipTo(
    tenantId: string,
    shipToId: string,
  ): Promise<GetShipToApiResponse> {
    const shipTo = await this.shipToRepository.findOne({
      tenantId,
      shipToId,
    });

    if (!shipTo) {
      throw new HttpException(
        {
          code: ShipToErrorCode.SHIP_TO_NOT_FOUND,
          message: ShipToErrorMessage[ShipToErrorCode.SHIP_TO_NOT_FOUND],
        },
        ShipToErrorHttpStatus[ShipToErrorCode.SHIP_TO_NOT_FOUND],
      );
    }

    return {
      shipTo: this.toApiDto(shipTo),
    };
  }

  /**
   * 納入先新規登録
   */
  async createShipTo(
    tenantId: string,
    userId: string,
    request: CreateShipToApiRequest,
  ): Promise<CreateShipToApiResponse> {
    // 正規化フロー（Service層で保証）:
    // 1. 入力値を正規化
    // 2. 正規化後の値で形式検証（10桁英数字）
    // 3. 検証成功後のみDBに保存
    const normalizedCode = normalizeShipToCode(request.shipToCode);

    // メールアドレス形式チェック
    validateEmail(request.email);

    // CustomerSite紐づけガード（未実装のため）
    if (request.customerSiteId) {
      throw new HttpException(
        {
          code: ShipToErrorCode.CUSTOMER_SITE_NOT_AVAILABLE,
          message: ShipToErrorMessage[ShipToErrorCode.CUSTOMER_SITE_NOT_AVAILABLE],
        },
        ShipToErrorHttpStatus[ShipToErrorCode.CUSTOMER_SITE_NOT_AVAILABLE],
      );
    }

    // 重複チェック
    const isDuplicate = await this.shipToRepository.checkShipToCodeDuplicate({
      tenantId,
      shipToCode: normalizedCode,
    });

    if (isDuplicate) {
      throw new HttpException(
        {
          code: ShipToErrorCode.SHIP_TO_CODE_DUPLICATE,
          message: ShipToErrorMessage[ShipToErrorCode.SHIP_TO_CODE_DUPLICATE],
        },
        ShipToErrorHttpStatus[ShipToErrorCode.SHIP_TO_CODE_DUPLICATE],
      );
    }

    // 登録
    const shipTo = await this.shipToRepository.create({
      tenantId,
      createdBy: userId,
      data: {
        shipToCode: normalizedCode, // 正規化後のコードを保存
        shipToName: request.shipToName,
        shipToNameKana: request.shipToNameKana,
        customerSiteId: undefined, // CustomerSite未実装
        postalCode: request.postalCode,
        prefecture: request.prefecture,
        city: request.city,
        address1: request.address1,
        address2: request.address2,
        phoneNumber: request.phoneNumber,
        faxNumber: request.faxNumber,
        email: request.email,
        contactPerson: request.contactPerson,
        remarks: request.remarks,
        isActive: request.isActive ?? true,
      },
    });

    // TODO: 監査ログ記録

    return {
      shipTo: this.toApiDto(shipTo),
    };
  }

  /**
   * 納入先更新
   */
  async updateShipTo(
    tenantId: string,
    userId: string,
    shipToId: string,
    request: UpdateShipToApiRequest,
  ): Promise<UpdateShipToApiResponse> {
    // 既存データ取得
    const existingShipTo = await this.shipToRepository.findOne({
      tenantId,
      shipToId,
    });

    if (!existingShipTo) {
      throw new HttpException(
        {
          code: ShipToErrorCode.SHIP_TO_NOT_FOUND,
          message: ShipToErrorMessage[ShipToErrorCode.SHIP_TO_NOT_FOUND],
        },
        ShipToErrorHttpStatus[ShipToErrorCode.SHIP_TO_NOT_FOUND],
      );
    }

    // メールアドレス形式チェック
    validateEmail(request.email);

    // CustomerSite紐づけガード（未実装のため）
    // customerSiteIdがnullの場合は許可（クリア操作）
    if (request.customerSiteId !== undefined && request.customerSiteId !== null) {
      throw new HttpException(
        {
          code: ShipToErrorCode.CUSTOMER_SITE_NOT_AVAILABLE,
          message: ShipToErrorMessage[ShipToErrorCode.CUSTOMER_SITE_NOT_AVAILABLE],
        },
        ShipToErrorHttpStatus[ShipToErrorCode.CUSTOMER_SITE_NOT_AVAILABLE],
      );
    }

    // 更新（楽観ロック）
    // shipToCode は更新不可（リクエストに含まれない）
    const updatedShipTo = await this.shipToRepository.update({
      tenantId,
      shipToId,
      version: request.version,
      updatedBy: userId,
      data: {
        shipToName: request.shipToName,
        shipToNameKana: request.shipToNameKana,
        customerSiteId: request.customerSiteId,
        postalCode: request.postalCode,
        prefecture: request.prefecture,
        city: request.city,
        address1: request.address1,
        address2: request.address2,
        phoneNumber: request.phoneNumber,
        faxNumber: request.faxNumber,
        email: request.email,
        contactPerson: request.contactPerson,
        remarks: request.remarks,
        isActive: request.isActive,
      },
    });

    // 楽観ロック競合
    if (!updatedShipTo) {
      throw new HttpException(
        {
          code: ShipToErrorCode.CONCURRENT_UPDATE,
          message: ShipToErrorMessage[ShipToErrorCode.CONCURRENT_UPDATE],
        },
        ShipToErrorHttpStatus[ShipToErrorCode.CONCURRENT_UPDATE],
      );
    }

    // TODO: 監査ログ記録

    return {
      shipTo: this.toApiDto(updatedShipTo),
    };
  }

  /**
   * 納入先無効化
   */
  async deactivateShipTo(
    tenantId: string,
    userId: string,
    shipToId: string,
    request: DeactivateShipToApiRequest,
  ): Promise<DeactivateShipToApiResponse> {
    // 既存データ取得
    const existingShipTo = await this.shipToRepository.findOne({
      tenantId,
      shipToId,
    });

    if (!existingShipTo) {
      throw new HttpException(
        {
          code: ShipToErrorCode.SHIP_TO_NOT_FOUND,
          message: ShipToErrorMessage[ShipToErrorCode.SHIP_TO_NOT_FOUND],
        },
        ShipToErrorHttpStatus[ShipToErrorCode.SHIP_TO_NOT_FOUND],
      );
    }

    // 無効化（楽観ロック）
    const updatedShipTo = await this.shipToRepository.update({
      tenantId,
      shipToId,
      version: request.version,
      updatedBy: userId,
      data: {
        shipToName: existingShipTo.shipToName,
        shipToNameKana: existingShipTo.shipToNameKana ?? undefined,
        customerSiteId: existingShipTo.customerSiteId,
        postalCode: existingShipTo.postalCode ?? undefined,
        prefecture: existingShipTo.prefecture ?? undefined,
        city: existingShipTo.city ?? undefined,
        address1: existingShipTo.address1 ?? undefined,
        address2: existingShipTo.address2 ?? undefined,
        phoneNumber: existingShipTo.phoneNumber ?? undefined,
        faxNumber: existingShipTo.faxNumber ?? undefined,
        email: existingShipTo.email ?? undefined,
        contactPerson: existingShipTo.contactPerson ?? undefined,
        remarks: existingShipTo.remarks ?? undefined,
        isActive: false,
      },
    });

    // 楽観ロック競合
    if (!updatedShipTo) {
      throw new HttpException(
        {
          code: ShipToErrorCode.CONCURRENT_UPDATE,
          message: ShipToErrorMessage[ShipToErrorCode.CONCURRENT_UPDATE],
        },
        ShipToErrorHttpStatus[ShipToErrorCode.CONCURRENT_UPDATE],
      );
    }

    // TODO: 監査ログ記録

    return {
      shipTo: this.toApiDto(updatedShipTo),
    };
  }

  /**
   * 納入先再有効化
   */
  async activateShipTo(
    tenantId: string,
    userId: string,
    shipToId: string,
    request: ActivateShipToApiRequest,
  ): Promise<ActivateShipToApiResponse> {
    // 既存データ取得
    const existingShipTo = await this.shipToRepository.findOne({
      tenantId,
      shipToId,
    });

    if (!existingShipTo) {
      throw new HttpException(
        {
          code: ShipToErrorCode.SHIP_TO_NOT_FOUND,
          message: ShipToErrorMessage[ShipToErrorCode.SHIP_TO_NOT_FOUND],
        },
        ShipToErrorHttpStatus[ShipToErrorCode.SHIP_TO_NOT_FOUND],
      );
    }

    // 再有効化（楽観ロック）
    const updatedShipTo = await this.shipToRepository.update({
      tenantId,
      shipToId,
      version: request.version,
      updatedBy: userId,
      data: {
        shipToName: existingShipTo.shipToName,
        shipToNameKana: existingShipTo.shipToNameKana ?? undefined,
        customerSiteId: existingShipTo.customerSiteId,
        postalCode: existingShipTo.postalCode ?? undefined,
        prefecture: existingShipTo.prefecture ?? undefined,
        city: existingShipTo.city ?? undefined,
        address1: existingShipTo.address1 ?? undefined,
        address2: existingShipTo.address2 ?? undefined,
        phoneNumber: existingShipTo.phoneNumber ?? undefined,
        faxNumber: existingShipTo.faxNumber ?? undefined,
        email: existingShipTo.email ?? undefined,
        contactPerson: existingShipTo.contactPerson ?? undefined,
        remarks: existingShipTo.remarks ?? undefined,
        isActive: true,
      },
    });

    // 楽観ロック競合
    if (!updatedShipTo) {
      throw new HttpException(
        {
          code: ShipToErrorCode.CONCURRENT_UPDATE,
          message: ShipToErrorMessage[ShipToErrorCode.CONCURRENT_UPDATE],
        },
        ShipToErrorHttpStatus[ShipToErrorCode.CONCURRENT_UPDATE],
      );
    }

    // TODO: 監査ログ記録

    return {
      shipTo: this.toApiDto(updatedShipTo),
    };
  }

  /**
   * ShipTo -> ShipToApiDto 変換
   */
  private toApiDto(shipTo: ShipTo): ShipToApiDto {
    return {
      id: shipTo.id,
      shipToCode: shipTo.shipToCode,
      shipToName: shipTo.shipToName,
      shipToNameKana: shipTo.shipToNameKana,
      customerSiteId: shipTo.customerSiteId,
      postalCode: shipTo.postalCode,
      prefecture: shipTo.prefecture,
      city: shipTo.city,
      address1: shipTo.address1,
      address2: shipTo.address2,
      phoneNumber: shipTo.phoneNumber,
      faxNumber: shipTo.faxNumber,
      email: shipTo.email,
      contactPerson: shipTo.contactPerson,
      remarks: shipTo.remarks,
      isActive: shipTo.isActive,
      version: shipTo.version,
      createdAt: shipTo.createdAt.toISOString(),
      updatedAt: shipTo.updatedAt.toISOString(),
      createdBy: shipTo.createdByLoginAccountId,
      updatedBy: shipTo.updatedByLoginAccountId,
    };
  }
}
