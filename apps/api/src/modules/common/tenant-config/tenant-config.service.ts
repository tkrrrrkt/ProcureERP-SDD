/**
 * Tenant Config Service
 *
 * テナント設定取得サービス（MVP-1: 環境変数から取得）
 *
 * Phase 2でテナント設定テーブルから取得に変更予定
 */

import { Injectable } from '@nestjs/common';
import { CodeNormalizationMode } from '../../../common/utils/normalize-business-code';

@Injectable()
export class TenantConfigService {
  /**
   * コード正規化モード取得
   *
   * MVP-1: 環境変数 CODE_NORMALIZATION_MODE から取得
   * Phase 2: テナント設定テーブルから取得
   *
   * @param tenantId テナントID（Phase 2で使用）
   * @returns 正規化モード（'numeric' | 'alphanumeric'）
   */
  getCodeNormalizationMode(tenantId: string): CodeNormalizationMode {
    // MVP-1: 環境変数から取得（テナントIDは未使用）
    const mode = process.env.CODE_NORMALIZATION_MODE || 'alphanumeric';

    if (mode === 'numeric' || mode === 'alphanumeric') {
      return mode;
    }

    // デフォルト: alphanumeric
    return 'alphanumeric';
  }

  /**
   * デフォルト通貨コード取得
   *
   * @param tenantId テナントID
   * @returns 通貨コード
   */
  getDefaultCurrencyCode(tenantId: string): string {
    return process.env.DEFAULT_CURRENCY_CODE || 'JPY';
  }

  /**
   * デフォルト国コード取得
   *
   * @param tenantId テナントID
   * @returns 国コード（ISO 2文字）
   */
  getDefaultCountryCode(tenantId: string): string {
    return process.env.DEFAULT_COUNTRY_CODE || 'JP';
  }
}
