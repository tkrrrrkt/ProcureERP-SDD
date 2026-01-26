/**
 * Tenant Config Module
 *
 * テナント設定を提供するモジュール
 */

import { Module, Global } from '@nestjs/common';
import { TenantConfigService } from './tenant-config.service';

@Global() // 全モジュールから参照可能
@Module({
  providers: [TenantConfigService],
  exports: [TenantConfigService],
})
export class TenantConfigModule {}
