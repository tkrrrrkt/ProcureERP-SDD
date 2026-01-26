/**
 * Entity Validator Service
 *
 * Polymorphic FK のエンティティ存在検証を一元的に提供
 * - entity_kind に応じた対象テーブルに entity_id が存在するかを検証
 * - DB FK制約がないため、アプリ層で検証を実施
 *
 * 配置: apps/api/src/common/validators/entity-validator.service.ts
 */

import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PartyRepository } from '../../modules/master-data/business-partner/repositories/party.repository';
import { SupplierSiteRepository } from '../../modules/master-data/business-partner/repositories/supplier-site.repository';
import { TargetEntityKind } from '@prisma/client';

@Injectable()
export class EntityValidatorService {
  constructor(
    private readonly partyRepository: PartyRepository,
    private readonly supplierSiteRepository: SupplierSiteRepository,
    // ItemRepository は item-master 実装後に追加
  ) {}

  /**
   * entity_kind に応じた対象テーブルに entity_id が存在するかを検証
   *
   * @param tenantId テナントID
   * @param entityKind エンティティ種別（ITEM / PARTY / SUPPLIER_SITE）
   * @param entityId エンティティID
   * @throws HttpException ENTITY_NOT_FOUND (404) if entity does not exist
   */
  async validateEntityExists(
    tenantId: string,
    entityKind: TargetEntityKind,
    entityId: string,
  ): Promise<void> {
    let exists = false;

    switch (entityKind) {
      case 'PARTY': {
        const party = await this.partyRepository.findById({
          tenantId,
          partyId: entityId,
        });
        exists = party !== null;
        break;
      }
      case 'SUPPLIER_SITE': {
        const supplierSite = await this.supplierSiteRepository.findById({
          tenantId,
          supplierSiteId: entityId,
        });
        exists = supplierSite !== null;
        break;
      }
      case 'ITEM': {
        // TODO: ItemRepository 実装後に追加
        // 現時点では ITEM のセグメント割当は未サポート
        throw new HttpException(
          {
            code: 'ENTITY_NOT_FOUND',
            message: 'ITEM エンティティへのセグメント割当は現在サポートされていません',
            details: { entityKind, entityId },
          },
          HttpStatus.NOT_IMPLEMENTED,
        );
      }
      default: {
        // Exhaustive check
        const _exhaustiveCheck: never = entityKind;
        throw new HttpException(
          {
            code: 'ENTITY_NOT_FOUND',
            message: `不明なエンティティ種別です: ${_exhaustiveCheck}`,
          },
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
    }

    if (!exists) {
      throw new HttpException(
        {
          code: 'ENTITY_NOT_FOUND',
          message: `参照先のエンティティが見つかりません: ${entityKind}:${entityId}`,
          details: { entityKind, entityId },
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  /**
   * エンティティ存在チェック（例外を投げない版）
   *
   * @param tenantId テナントID
   * @param entityKind エンティティ種別
   * @param entityId エンティティID
   * @returns 存在すれば true、しなければ false
   */
  async checkEntityExists(
    tenantId: string,
    entityKind: TargetEntityKind,
    entityId: string,
  ): Promise<boolean> {
    switch (entityKind) {
      case 'PARTY': {
        const party = await this.partyRepository.findById({
          tenantId,
          partyId: entityId,
        });
        return party !== null;
      }
      case 'SUPPLIER_SITE': {
        const supplierSite = await this.supplierSiteRepository.findById({
          tenantId,
          supplierSiteId: entityId,
        });
        return supplierSite !== null;
      }
      case 'ITEM': {
        // TODO: ItemRepository 実装後に追加
        return false;
      }
      default: {
        return false;
      }
    }
  }
}
