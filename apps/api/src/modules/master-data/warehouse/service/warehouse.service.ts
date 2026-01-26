import { Injectable, HttpException } from '@nestjs/common';
import { WarehouseRepository } from '../repository/warehouse.repository';
import {
  ListWarehousesApiRequest,
  ListWarehousesApiResponse,
  GetWarehouseApiResponse,
  CreateWarehouseApiRequest,
  CreateWarehouseApiResponse,
  UpdateWarehouseApiRequest,
  UpdateWarehouseApiResponse,
  DeactivateWarehouseApiRequest,
  DeactivateWarehouseApiResponse,
  ActivateWarehouseApiRequest,
  ActivateWarehouseApiResponse,
  SetDefaultReceivingWarehouseApiRequest,
  SetDefaultReceivingWarehouseApiResponse,
  WarehouseApiDto,
} from '@procure/contracts/api/warehouse';
import {
  WarehouseErrorCode,
  WarehouseErrorHttpStatus,
  WarehouseErrorMessage,
} from '@procure/contracts/api/errors/warehouse-error';
import { Warehouse } from '@prisma/client';

/**
 * Warehouse Service
 *
 * ビジネスルールの正本
 * - 倉庫コード一意性チェック（10文字以内・半角英数字）
 * - 倉庫コード形式チェック
 * - 半角カナ正規化
 * - 既定受入倉庫の一意性保証
 * - 楽観ロック
 * - 監査ログ記録
 */
@Injectable()
export class WarehouseService {
  constructor(private readonly warehouseRepository: WarehouseRepository) {}

  /**
   * 倉庫一覧取得
   */
  async listWarehouses(
    tenantId: string,
    request: ListWarehousesApiRequest,
  ): Promise<ListWarehousesApiResponse> {
    const { offset, limit, sortBy, sortOrder, keyword, isActive } = request;

    const result = await this.warehouseRepository.findMany({
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
   * 倉庫詳細取得
   */
  async getWarehouse(
    tenantId: string,
    warehouseId: string,
  ): Promise<GetWarehouseApiResponse> {
    const warehouse = await this.warehouseRepository.findOne({
      tenantId,
      warehouseId,
    });

    if (!warehouse) {
      throw new HttpException(
        {
          code: WarehouseErrorCode.WAREHOUSE_NOT_FOUND,
          message: WarehouseErrorMessage.WAREHOUSE_NOT_FOUND,
        },
        WarehouseErrorHttpStatus.WAREHOUSE_NOT_FOUND,
      );
    }

    return {
      warehouse: this.toApiDto(warehouse),
    };
  }

  /**
   * 倉庫新規登録
   */
  async createWarehouse(
    tenantId: string,
    userId: string,
    request: CreateWarehouseApiRequest,
  ): Promise<CreateWarehouseApiResponse> {
    // バリデーション: 倉庫コード長チェック（10文字以内）
    if (request.warehouseCode.length > 10) {
      throw new HttpException(
        {
          code: WarehouseErrorCode.INVALID_WAREHOUSE_CODE_LENGTH,
          message: WarehouseErrorMessage.INVALID_WAREHOUSE_CODE_LENGTH,
        },
        WarehouseErrorHttpStatus.INVALID_WAREHOUSE_CODE_LENGTH,
      );
    }

    // バリデーション: 倉庫コード形式チェック（半角英数字のみ）
    if (!this.isValidWarehouseCode(request.warehouseCode)) {
      throw new HttpException(
        {
          code: WarehouseErrorCode.INVALID_WAREHOUSE_CODE_CHARS,
          message: WarehouseErrorMessage.INVALID_WAREHOUSE_CODE_CHARS,
        },
        WarehouseErrorHttpStatus.INVALID_WAREHOUSE_CODE_CHARS,
      );
    }

    // バリデーション: 倉庫コード重複チェック
    const isDuplicate = await this.warehouseRepository.checkCodeDuplicate({
      tenantId,
      warehouseCode: request.warehouseCode,
    });

    if (isDuplicate) {
      throw new HttpException(
        {
          code: WarehouseErrorCode.WAREHOUSE_CODE_DUPLICATE,
          message: WarehouseErrorMessage.WAREHOUSE_CODE_DUPLICATE,
        },
        WarehouseErrorHttpStatus.WAREHOUSE_CODE_DUPLICATE,
      );
    }

    // バリデーション: 倉庫グループ存在チェック
    if (request.warehouseGroupId) {
      const groupExists =
        await this.warehouseRepository.checkWarehouseGroupExists({
          tenantId,
          warehouseGroupId: request.warehouseGroupId,
        });

      if (!groupExists) {
        throw new HttpException(
          {
            code: WarehouseErrorCode.WAREHOUSE_GROUP_NOT_FOUND,
            message: WarehouseErrorMessage.WAREHOUSE_GROUP_NOT_FOUND,
          },
          WarehouseErrorHttpStatus.WAREHOUSE_GROUP_NOT_FOUND,
        );
      }
    }

    // 半角カナ正規化
    const normalizedWarehouseNameKana = request.warehouseNameKana
      ? this.normalizeToHalfWidthKana(request.warehouseNameKana)
      : undefined;

    // 登録
    const warehouse = await this.warehouseRepository.create({
      tenantId,
      createdBy: userId,
      data: {
        warehouseCode: request.warehouseCode,
        warehouseName: request.warehouseName,
        warehouseNameKana: normalizedWarehouseNameKana,
        warehouseGroupId: request.warehouseGroupId,
        postalCode: request.postalCode,
        prefecture: request.prefecture,
        city: request.city,
        address1: request.address1,
        address2: request.address2,
        phoneNumber: request.phoneNumber,
        isDefaultReceiving: request.isDefaultReceiving ?? false,
        displayOrder: request.displayOrder ?? 1000,
        notes: request.notes,
        isActive: request.isActive ?? true,
      },
    });

    // TODO: 監査ログ記録

    return {
      warehouse: this.toApiDto(warehouse),
    };
  }

  /**
   * 倉庫更新
   */
  async updateWarehouse(
    tenantId: string,
    userId: string,
    warehouseId: string,
    request: UpdateWarehouseApiRequest,
  ): Promise<UpdateWarehouseApiResponse> {
    // 既存データ取得
    const existingWarehouse = await this.warehouseRepository.findOne({
      tenantId,
      warehouseId,
    });

    if (!existingWarehouse) {
      throw new HttpException(
        {
          code: WarehouseErrorCode.WAREHOUSE_NOT_FOUND,
          message: WarehouseErrorMessage.WAREHOUSE_NOT_FOUND,
        },
        WarehouseErrorHttpStatus.WAREHOUSE_NOT_FOUND,
      );
    }

    // バリデーション: 倉庫グループ存在チェック
    if (request.warehouseGroupId) {
      const groupExists =
        await this.warehouseRepository.checkWarehouseGroupExists({
          tenantId,
          warehouseGroupId: request.warehouseGroupId,
        });

      if (!groupExists) {
        throw new HttpException(
          {
            code: WarehouseErrorCode.WAREHOUSE_GROUP_NOT_FOUND,
            message: WarehouseErrorMessage.WAREHOUSE_GROUP_NOT_FOUND,
          },
          WarehouseErrorHttpStatus.WAREHOUSE_GROUP_NOT_FOUND,
        );
      }
    }

    // 半角カナ正規化
    const normalizedWarehouseNameKana = request.warehouseNameKana
      ? this.normalizeToHalfWidthKana(request.warehouseNameKana)
      : undefined;

    // 更新（楽観ロック）
    const updatedWarehouse = await this.warehouseRepository.update({
      tenantId,
      warehouseId,
      version: request.version,
      updatedBy: userId,
      data: {
        warehouseName: request.warehouseName,
        warehouseNameKana: normalizedWarehouseNameKana,
        warehouseGroupId: request.warehouseGroupId,
        postalCode: request.postalCode,
        prefecture: request.prefecture,
        city: request.city,
        address1: request.address1,
        address2: request.address2,
        phoneNumber: request.phoneNumber,
        isDefaultReceiving: request.isDefaultReceiving,
        displayOrder: request.displayOrder,
        notes: request.notes,
        isActive: request.isActive,
      },
    });

    // 楽観ロック競合
    if (!updatedWarehouse) {
      throw new HttpException(
        {
          code: WarehouseErrorCode.CONCURRENT_UPDATE,
          message: WarehouseErrorMessage.CONCURRENT_UPDATE,
        },
        WarehouseErrorHttpStatus.CONCURRENT_UPDATE,
      );
    }

    // TODO: 監査ログ記録

    return {
      warehouse: this.toApiDto(updatedWarehouse),
    };
  }

  /**
   * 倉庫無効化
   */
  async deactivateWarehouse(
    tenantId: string,
    userId: string,
    warehouseId: string,
    request: DeactivateWarehouseApiRequest,
  ): Promise<DeactivateWarehouseApiResponse> {
    // 既存データ取得
    const existingWarehouse = await this.warehouseRepository.findOne({
      tenantId,
      warehouseId,
    });

    if (!existingWarehouse) {
      throw new HttpException(
        {
          code: WarehouseErrorCode.WAREHOUSE_NOT_FOUND,
          message: WarehouseErrorMessage.WAREHOUSE_NOT_FOUND,
        },
        WarehouseErrorHttpStatus.WAREHOUSE_NOT_FOUND,
      );
    }

    // 既定受入倉庫の無効化を禁止
    if (existingWarehouse.isDefaultReceiving) {
      throw new HttpException(
        {
          code: WarehouseErrorCode.CANNOT_DEACTIVATE_DEFAULT_RECEIVING,
          message: WarehouseErrorMessage.CANNOT_DEACTIVATE_DEFAULT_RECEIVING,
        },
        WarehouseErrorHttpStatus.CANNOT_DEACTIVATE_DEFAULT_RECEIVING,
      );
    }

    // 無効化（楽観ロック）
    const updatedWarehouse = await this.warehouseRepository.update({
      tenantId,
      warehouseId,
      version: request.version,
      updatedBy: userId,
      data: {
        warehouseName: existingWarehouse.warehouseName,
        warehouseNameKana: existingWarehouse.warehouseNameKana ?? undefined,
        warehouseGroupId: existingWarehouse.warehouseGroupId,
        postalCode: existingWarehouse.postalCode ?? undefined,
        prefecture: existingWarehouse.prefecture ?? undefined,
        city: existingWarehouse.city ?? undefined,
        address1: existingWarehouse.address1 ?? undefined,
        address2: existingWarehouse.address2 ?? undefined,
        phoneNumber: existingWarehouse.phoneNumber ?? undefined,
        isDefaultReceiving: existingWarehouse.isDefaultReceiving,
        displayOrder: existingWarehouse.displayOrder,
        notes: existingWarehouse.notes ?? undefined,
        isActive: false,
      },
    });

    // 楽観ロック競合
    if (!updatedWarehouse) {
      throw new HttpException(
        {
          code: WarehouseErrorCode.CONCURRENT_UPDATE,
          message: WarehouseErrorMessage.CONCURRENT_UPDATE,
        },
        WarehouseErrorHttpStatus.CONCURRENT_UPDATE,
      );
    }

    // TODO: 監査ログ記録

    return {
      warehouse: this.toApiDto(updatedWarehouse),
    };
  }

  /**
   * 倉庫再有効化
   */
  async activateWarehouse(
    tenantId: string,
    userId: string,
    warehouseId: string,
    request: ActivateWarehouseApiRequest,
  ): Promise<ActivateWarehouseApiResponse> {
    // 既存データ取得
    const existingWarehouse = await this.warehouseRepository.findOne({
      tenantId,
      warehouseId,
    });

    if (!existingWarehouse) {
      throw new HttpException(
        {
          code: WarehouseErrorCode.WAREHOUSE_NOT_FOUND,
          message: WarehouseErrorMessage.WAREHOUSE_NOT_FOUND,
        },
        WarehouseErrorHttpStatus.WAREHOUSE_NOT_FOUND,
      );
    }

    // 再有効化（楽観ロック）
    const updatedWarehouse = await this.warehouseRepository.update({
      tenantId,
      warehouseId,
      version: request.version,
      updatedBy: userId,
      data: {
        warehouseName: existingWarehouse.warehouseName,
        warehouseNameKana: existingWarehouse.warehouseNameKana ?? undefined,
        warehouseGroupId: existingWarehouse.warehouseGroupId,
        postalCode: existingWarehouse.postalCode ?? undefined,
        prefecture: existingWarehouse.prefecture ?? undefined,
        city: existingWarehouse.city ?? undefined,
        address1: existingWarehouse.address1 ?? undefined,
        address2: existingWarehouse.address2 ?? undefined,
        phoneNumber: existingWarehouse.phoneNumber ?? undefined,
        isDefaultReceiving: existingWarehouse.isDefaultReceiving,
        displayOrder: existingWarehouse.displayOrder,
        notes: existingWarehouse.notes ?? undefined,
        isActive: true,
      },
    });

    // 楽観ロック競合
    if (!updatedWarehouse) {
      throw new HttpException(
        {
          code: WarehouseErrorCode.CONCURRENT_UPDATE,
          message: WarehouseErrorMessage.CONCURRENT_UPDATE,
        },
        WarehouseErrorHttpStatus.CONCURRENT_UPDATE,
      );
    }

    // TODO: 監査ログ記録

    return {
      warehouse: this.toApiDto(updatedWarehouse),
    };
  }

  /**
   * 既定受入倉庫設定
   */
  async setDefaultReceivingWarehouse(
    tenantId: string,
    userId: string,
    warehouseId: string,
    request: SetDefaultReceivingWarehouseApiRequest,
  ): Promise<SetDefaultReceivingWarehouseApiResponse> {
    // 既存データ取得
    const existingWarehouse = await this.warehouseRepository.findOne({
      tenantId,
      warehouseId,
    });

    if (!existingWarehouse) {
      throw new HttpException(
        {
          code: WarehouseErrorCode.WAREHOUSE_NOT_FOUND,
          message: WarehouseErrorMessage.WAREHOUSE_NOT_FOUND,
        },
        WarehouseErrorHttpStatus.WAREHOUSE_NOT_FOUND,
      );
    }

    // 既定受入倉庫設定（トランザクション）
    const result = await this.warehouseRepository.setDefaultReceiving({
      tenantId,
      warehouseId,
      version: request.version,
      updatedBy: userId,
    });

    // 楽観ロック競合
    if (!result.updated) {
      throw new HttpException(
        {
          code: WarehouseErrorCode.CONCURRENT_UPDATE,
          message: WarehouseErrorMessage.CONCURRENT_UPDATE,
        },
        WarehouseErrorHttpStatus.CONCURRENT_UPDATE,
      );
    }

    // TODO: 監査ログ記録

    return {
      warehouse: this.toApiDto(result.updated),
      previousDefault: result.previousDefault
        ? this.toApiDto(result.previousDefault)
        : null,
    };
  }

  /**
   * Warehouse -> WarehouseApiDto 変換
   */
  private toApiDto(warehouse: Warehouse): WarehouseApiDto {
    return {
      id: warehouse.id,
      warehouseCode: warehouse.warehouseCode,
      warehouseName: warehouse.warehouseName,
      warehouseNameKana: warehouse.warehouseNameKana,
      warehouseGroupId: warehouse.warehouseGroupId,
      postalCode: warehouse.postalCode,
      prefecture: warehouse.prefecture,
      city: warehouse.city,
      address1: warehouse.address1,
      address2: warehouse.address2,
      phoneNumber: warehouse.phoneNumber,
      isDefaultReceiving: warehouse.isDefaultReceiving,
      displayOrder: warehouse.displayOrder,
      notes: warehouse.notes,
      isActive: warehouse.isActive,
      version: warehouse.version,
      createdAt: warehouse.createdAt.toISOString(),
      updatedAt: warehouse.updatedAt.toISOString(),
      createdBy: warehouse.createdByLoginAccountId,
      updatedBy: warehouse.updatedByLoginAccountId,
    };
  }

  /**
   * 倉庫コード形式チェック（半角英数字のみ）
   */
  private isValidWarehouseCode(warehouseCode: string): boolean {
    return /^[A-Za-z0-9]+$/.test(warehouseCode);
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
