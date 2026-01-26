# Implementation Plan

> CCSDD / SDD 前提：**contracts-first**（bff → api → shared）を最優先し、境界違反を guard で止める。
> UI は最後。v0 は **Phase 1（統制テスト）→ Phase 2（本実装）** の二段階で扱う。

---

## 0. Design Completeness Gate（Blocking）

> Implementation MUST NOT start until all items below are checked.

- [ ] 0.1 Designの「BFF Specification（apps/bff）」が埋まっている
  - BFF endpoints（UIが叩く）が記載されている
  - Request/Response DTO（packages/contracts/src/bff）が列挙されている
  - **Paging/Sorting正規化（必須）が明記されている**
  - 変換（api DTO → bff DTO）の方針が記載されている
  - エラー整形方針（**contracts/bff/errors** に準拠）が記載されている
  - tenant_id/user_id の取り回し（解決・伝搬ルール）が記載されている

- [ ] 0.2 Designの「Service Specification（Domain / apps/api）」が埋まっている
  - Usecase（Create/Update/Inactivate等）が列挙されている
  - 主要ビジネスルールの所在（Domainに置く／置かない）が記載されている
  - トランザクション境界が記載されている
  - 監査ログ記録ポイントが記載されている

- [ ] 0.3 Designの「Repository Specification（apps/api）」が埋まっている
  - 取得・更新メソッド一覧が記載されている（tenant_id必須）
  - where句二重ガードの方針（tenant_id常時指定）が記載されている
  - RLS前提（set_config前提）が記載されている

- [ ] 0.4 Designの「Contracts Summary（This Feature）」が埋まっている
  - packages/contracts/src/bff 側の追加・変更DTOが列挙されている
  - packages/contracts/src/api 側の追加・変更DTOが列挙されている
  - **Enum / Error の配置ルールが明記されている**
  - 「UIは packages/contracts/src/api を参照しない」ルールが明記されている

- [ ] 0.5 Requirements Traceability が更新されている
  - 主要Requirementが、BFF/API/Repo/Flows等の設計要素に紐づいている

- [ ] 0.6 v0生成物の受入・移植ルールが確認されている
  - v0生成物は必ず `apps/web/_v0_drop/<context>/<feature>/src` に一次格納されている
  - v0出力はそのまま `apps/web/src` に配置されていない
  - v0_drop 配下に **layout.tsx が存在しない**（AppShell以外の殻禁止）
  - UIは MockBffClient で動作確認されている（BFF未接続状態）

- [ ] 0.7 Structure / Boundary Guard がパスしている
  - `npx tsx scripts/structure-guards.ts` が成功している
  - UI → Domain API の直接呼び出しが存在しない
  - UIでの直接 fetch() が存在しない（HttpBffClient 例外のみ）
  - BFFがDBへ直接アクセスしていない

---

## 1. Scaffold / Structure Setup

- [ ] 1. Feature骨格生成（Scaffold）
  - 実行: `npx tsx scripts/scaffold-feature.ts master-data business-partner`
  - 確認: `apps/web/src/features/master-data/business-partner` が作成されている
  - 確認: `apps/bff/src/modules/master-data/business-partner` が作成されている
  - 確認: `apps/api/src/modules/master-data/business-partner` が作成されている
  - 確認: `apps/web/_v0_drop/master-data/business-partner` が作成されている
  - _Requirements: 9.1, 9.2_

---

## 2. Contracts（BFF）

- [ ] 2. BFF契約定義（UI ↔ BFF境界）
- [ ] 2.1 (P) Party用BFF契約を定義
  - `packages/contracts/src/bff/business-partner/index.ts` に Party用の型定義を追加
  - ListPartiesRequest / ListPartiesResponse（page/pageSize: 1-based, default: page=1, pageSize=50, max: 200）
  - GetPartyResponse（単体取得）
  - CreatePartyRequest / CreatePartyResponse
  - UpdatePartyRequest / UpdatePartyResponse
  - PartySortBy type（partyCode, partyName, partyNameKana, isSupplier, isCustomer, isActive）
  - SortOrder type（asc, desc）
  - すべてcamelCase命名（partyCode, partyName等）
  - _Requirements: 1.1, 1.2, 1.9, 12.1, 12.2_

- [ ] 2.2 (P) SupplierSite用BFF契約を定義
  - `packages/contracts/src/bff/business-partner/index.ts` に SupplierSite用の型定義を追加
  - ListSupplierSitesRequest / ListSupplierSitesResponse（page/pageSize: 1-based）
  - GetSupplierSiteResponse
  - CreateSupplierSiteRequest / CreateSupplierSiteResponse
  - UpdateSupplierSiteRequest / UpdateSupplierSiteResponse
  - payeeId?: string（未指定時はPayee自動生成）
  - _Requirements: 2.1, 2.2, 2.6, 13.1, 13.2_

- [ ] 2.3 (P) Payee用BFF契約を定義
  - `packages/contracts/src/bff/business-partner/index.ts` に Payee用の型定義を追加
  - ListPayeesRequest / ListPayeesResponse（page/pageSize: 1-based）
  - GetPayeeResponse
  - CreatePayeeRequest / CreatePayeeResponse
  - UpdatePayeeRequest / UpdatePayeeResponse
  - _Requirements: 3.1, 3.2, 13.3_

- [ ] 2.4 (P) CustomerSite用BFF契約を定義（将来拡張）
  - `packages/contracts/src/bff/business-partner/index.ts` に CustomerSite用の型定義を追加
  - ListCustomerSitesRequest / ListCustomerSitesResponse
  - GetCustomerSiteResponse
  - CreateCustomerSiteRequest / CreateCustomerSiteResponse
  - UpdateCustomerSiteRequest / UpdateCustomerSiteResponse
  - MVP-1では実装なし、契約のみ先行定義
  - _Requirements: 4.1, 4.2_

- [ ] 2.5 (P) ShipTo用BFF契約を定義（将来拡張）
  - `packages/contracts/src/bff/business-partner/index.ts` に ShipTo用の型定義を追加
  - ListShipTosRequest / ListShipTosResponse
  - GetShipToResponse
  - CreateShipToRequest / CreateShipToResponse
  - UpdateShipToRequest / UpdateShipToResponse
  - ship_to_code は独立10桁コード（CustomerSiteコードを含まない）
  - MVP-1では実装なし、契約のみ先行定義
  - _Requirements: 5.1, 5.2, 5.5_

---

## 3. Contracts（API）

- [ ] 3. API契約定義（BFF ↔ Domain API境界）
- [ ] 3.1 (P) Party用API契約を定義
  - `packages/contracts/src/api/business-partner/index.ts` に Party用の型定義を追加
  - ListPartiesApiRequest（offset/limit: 0-based）/ ListPartiesApiResponse
  - GetPartyApiResponse
  - CreatePartyApiRequest / CreatePartyApiResponse
  - UpdatePartyApiRequest / UpdatePartyApiResponse
  - すべてcamelCase命名（partyCode, partyName等）
  - _Requirements: 1.1, 1.2, 1.9, 12.1, 12.2_

- [ ] 3.2 (P) SupplierSite用API契約を定義
  - `packages/contracts/src/api/business-partner/index.ts` に SupplierSite用の型定義を追加
  - ListSupplierSitesApiRequest（offset/limit: 0-based）/ ListSupplierSitesApiResponse
  - GetSupplierSiteApiResponse
  - CreateSupplierSiteApiRequest / CreateSupplierSiteApiResponse
  - UpdateSupplierSiteApiRequest / UpdateSupplierSiteApiResponse
  - payeeId?: string（未指定時はPayee自動生成）
  - _Requirements: 2.1, 2.2, 2.6_

- [ ] 3.3 (P) Payee用API契約を定義
  - `packages/contracts/src/api/business-partner/index.ts` に Payee用の型定義を追加
  - ListPayeesApiRequest（offset/limit: 0-based）/ ListPayeesApiResponse
  - GetPayeeApiResponse
  - CreatePayeeApiRequest / CreatePayeeApiResponse
  - UpdatePayeeApiRequest / UpdatePayeeApiResponse
  - FindOrCreatePayeeApiRequest / FindOrCreatePayeeApiResponse（内部API）
  - _Requirements: 3.1, 3.2_

- [ ] 3.4 (P) CustomerSite / ShipTo用API契約を定義（将来拡張）
  - `packages/contracts/src/api/business-partner/index.ts` に CustomerSite / ShipTo用の型定義を追加
  - MVP-1では実装なし、契約のみ先行定義
  - _Requirements: 4.1, 4.2, 5.1, 5.2_

- [ ] 3.5 (P) エラーコード定義
  - `packages/contracts/src/api/errors/business-partner-error.ts` を作成
  - BusinessPartnerErrorCode 定数定義（PARTY_NOT_FOUND, PARTY_CODE_DUPLICATE, SUPPLIER_SITE_NOT_FOUND, SUPPLIER_CODE_DUPLICATE, PAYEE_NOT_FOUND, PAYEE_CODE_DUPLICATE, CUSTOMER_SITE_NOT_FOUND, CUSTOMER_CODE_DUPLICATE, SHIP_TO_NOT_FOUND, SHIP_TO_CODE_DUPLICATE, INVALID_CODE_LENGTH, REQUIRED_FIELD_MISSING, CONCURRENT_UPDATE）
  - BusinessPartnerErrorHttpStatus マッピング（404, 409, 422）
  - BusinessPartnerErrorMessage デフォルトメッセージ（日本語）
  - `packages/contracts/src/api/errors/index.ts` に export 追加
  - _Requirements: 14.1, 14.2, 14.3, 14.4_

---

## 4. Database Schema & Migration

- [ ] 4. データベーススキーマ定義
- [ ] 4.1 Prisma Schemaにテーブル定義を追加
  - `packages/db/prisma/schema.prisma` に以下のモデルを追加
  - Party model（id: uuid, tenant_id: uuid, party_code: varchar(50), party_name: varchar(255), party_name_kana: varchar(255), is_supplier: boolean, is_customer: boolean, is_active: boolean, version: int, created_by_login_account_id: uuid, updated_by_login_account_id: uuid, created_at, updated_at）
  - SupplierSite model（id: uuid, tenant_id: uuid, party_id: uuid FK, supplier_sub_code: varchar(50), supplier_code: varchar(50), supplier_name: varchar(255), supplier_name_kana: varchar(255), payee_id: uuid FK, 住所・連絡先フィールド, is_active, version, 監査列）
  - Payee model（id: uuid, tenant_id: uuid, party_id: uuid FK, payee_sub_code: varchar(50), payee_code: varchar(50), payee_name: varchar(255), payee_name_kana: varchar(255), 住所・連絡先フィールド, payment_method, currency_code, payment_terms_text, is_active, version, 監査列）
  - CustomerSite model（MVP-1未実装、スキーマのみ定義）
  - ShipTo model（MVP-1未実装、スキーマのみ定義）
  - UNIQUE制約: @@unique([tenant_id, party_code]), @@unique([tenant_id, party_id, supplier_sub_code]), @@unique([tenant_id, party_id, payee_sub_code]), @@unique([tenant_id, ship_to_code])
  - INDEX: @@index([tenant_id, party_code]), @@index([tenant_id, is_supplier]), @@index([tenant_id, is_customer]), @@index([tenant_id, is_active])
  - _Requirements: 1.2, 1.6, 1.7, 1.8, 2.2, 2.3, 2.5, 3.2, 3.5, 5.2, 5.5, 8.1, 8.2, 9.1, 10.1, 11.1, 12.5_

- [ ] 4.2 Migration実行
  - 実行: `npx prisma migrate dev --name add_business_partner_tables`
  - 確認: マイグレーションファイルが `packages/db/prisma/migrations/` に作成されている
  - 確認: テーブルがローカルDBに作成されている
  - _Requirements: 9.1_

- [ ] 4.3 RLSポリシー適用
  - `packages/db/prisma/migrations/<timestamp>_add_business_partner_rls/migration.sql` を作成
  - parties / supplier_sites / payees / customer_sites / ship_tos にRLSポリシーを適用
  - ポリシー条件: `tenant_id = current_setting('app.current_tenant_id', true)::text`
  - 確認: `SELECT * FROM pg_policies WHERE tablename IN ('parties', 'supplier_sites', 'payees', 'customer_sites', 'ship_tos');` でポリシーが確認できる
  - _Requirements: 9.3, 9.4, 9.5_

---

## 5. Domain API - Utilities

- [ ] 5. 共通ユーティリティ実装
- [ ] 5.1 (P) コード正規化ユーティリティを実装
  - `apps/api/src/common/utils/normalize-business-code.ts` を作成
  - normalizeBusinessCode 関数を実装（trim, toHalfWidth, toUpperCase（英数字モード時）, パターン検証）
  - mode: 'numeric' | 'alphanumeric' を引数で受け取る
  - INVALID_CODE_LENGTH エラーをスロー（10桁でない、またはパターン不一致）
  - 単体テスト作成（apps/api/src/common/utils/normalize-business-code.spec.ts）
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 5.2 (P) TenantConfigServiceを実装（簡易版）
  - `apps/api/src/modules/common/tenant-config/tenant-config.service.ts` を作成
  - getCodeNormalizationMode(tenantId: string) メソッドを実装
  - MVP-1では環境変数 `CODE_NORMALIZATION_MODE` から取得（デフォルト: 'alphanumeric'）
  - Phase 2でテナント設定テーブルから取得に変更予定
  - _Requirements: 6.4, 6.5_

---

## 6. Domain API - Party

- [ ] 6. Party（取引先法人）機能実装
- [ ] 6.1 PartyRepositoryを実装
  - `apps/api/src/modules/master-data/business-partner/repositories/party.repository.ts` を作成
  - list(tenantId, offset, limit, sortBy, sortOrder, keyword, isSupplier, isCustomer) メソッド実装
  - findById(id, tenantId) メソッド実装
  - findByCode(tenantId, partyCode) メソッド実装（重複チェック用）
  - create(data, userId) メソッド実装
  - update(id, version, data, userId) メソッド実装
  - updateDerivedFlags(partyId, tenantId, isSupplier, isCustomer) メソッド実装
  - すべてのクエリに `WHERE tenant_id = ?` を含める（double-guard）
  - RLSコンテキスト設定: `SET app.current_tenant_id = '{tenant_id}';`
  - _Requirements: 1.2, 1.9, 7.1, 7.2, 7.3, 7.4, 9.2, 9.3, 9.4, 9.5_

- [ ] 6.2 PartyServiceを実装
  - `apps/api/src/modules/master-data/business-partner/services/party.service.ts` を作成
  - list メソッド実装（Repository呼び出し、keyword trim・空→undefined 正規化）
  - getById メソッド実装（PARTY_NOT_FOUND エラーハンドリング）
  - create メソッド実装（normalizeBusinessCode 呼び出し、重複チェック、PARTY_CODE_DUPLICATE エラーハンドリング、created_by設定）
  - update メソッド実装（version チェック、CONCURRENT_UPDATE エラーハンドリング、updated_by設定）
  - updateDerivedFlags メソッド実装（SupplierSite/CustomerSite 件数カウント → is_supplier/is_customer 更新）
  - TenantConfigService をDIして mode 取得
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.7, 1.9, 1.10, 7.5, 11.2, 11.3, 11.4_

- [ ] 6.3 PartyControllerを実装
  - `apps/api/src/modules/master-data/business-partner/controllers/party.controller.ts` を作成
  - GET /api/domain/master-data/business-partner/parties（list）
  - GET /api/domain/master-data/business-partner/parties/:id（getById）
  - POST /api/domain/master-data/business-partner/parties（create）
  - PUT /api/domain/master-data/business-partner/parties/:id（update）
  - tenant_id / user_id をリクエストから解決（JWT/session）
  - API契約（ListPartiesApiRequest/Response等）を使用
  - _Requirements: 1.1, 1.2_

- [ ] 6.4 PartyModuleを実装
  - `apps/api/src/modules/master-data/business-partner/party.module.ts` を作成
  - PartyService, PartyRepository, PartyController をモジュールに登録
  - TenantConfigService をインポート
  - _Requirements: 1.1_

---

## 7. Domain API - Payee

- [ ] 7. Payee（支払先）機能実装
- [ ] 7.1 PayeeRepositoryを実装
  - `apps/api/src/modules/master-data/business-partner/repositories/payee.repository.ts` を作成
  - list(tenantId, offset, limit, sortBy, sortOrder, keyword) メソッド実装
  - findById(id, tenantId) メソッド実装
  - findByPartyAndSubCode(tenantId, partyId, payeeSubCode) メソッド実装（Payee自動生成検索用）
  - create(data, userId) メソッド実装
  - update(id, version, data, userId) メソッド実装
  - すべてのクエリに `WHERE tenant_id = ?` を含める（double-guard）
  - _Requirements: 2.6, 2.7, 3.1, 3.2, 9.2, 9.3_

- [ ] 7.2 PayeeServiceを実装
  - `apps/api/src/modules/master-data/business-partner/services/payee.service.ts` を作成
  - list メソッド実装
  - getById メソッド実装（PAYEE_NOT_FOUND エラーハンドリング）
  - create メソッド実装（normalizeBusinessCode 呼び出し、payee_code 生成、重複チェック、created_by設定）
  - update メソッド実装（version チェック、updated_by設定）
  - findOrCreate メソッド実装（検索条件: `WHERE tenant_id=? AND party_id=? AND payee_sub_code=?`、存在すればpayeeIdを返す、なければcreate実行）
  - TenantConfigService をDIして mode 取得
  - _Requirements: 2.6, 2.7, 2.8, 3.1, 3.2, 3.3, 3.4, 3.5, 3.8_

- [ ] 7.3 PayeeControllerを実装
  - `apps/api/src/modules/master-data/business-partner/controllers/payee.controller.ts` を作成
  - GET /api/domain/master-data/business-partner/payees（list）
  - GET /api/domain/master-data/business-partner/payees/:id（getById）
  - POST /api/domain/master-data/business-partner/payees（create）
  - PUT /api/domain/master-data/business-partner/payees/:id（update）
  - API契約を使用
  - _Requirements: 3.1, 3.2_

- [ ] 7.4 PayeeModuleを実装
  - `apps/api/src/modules/master-data/business-partner/payee.module.ts` を作成
  - PayeeService, PayeeRepository, PayeeController をモジュールに登録
  - TenantConfigService をインポート
  - _Requirements: 3.1_

---

## 8. Domain API - SupplierSite

- [ ] 8. SupplierSite（仕入先拠点）機能実装
- [ ] 8.1 SupplierSiteRepositoryを実装
  - `apps/api/src/modules/master-data/business-partner/repositories/supplier-site.repository.ts` を作成
  - list(tenantId, offset, limit, sortBy, sortOrder, keyword) メソッド実装
  - findById(id, tenantId) メソッド実装
  - create(data, userId, tx) メソッド実装（トランザクション対応）
  - update(id, version, data, userId, tx) メソッド実装（トランザクション対応）
  - delete(id, version, userId, tx) メソッド実装（論理削除、is_active=false、トランザクション対応）
  - すべてのクエリに `WHERE tenant_id = ?` を含める（double-guard）
  - _Requirements: 2.1, 2.2, 2.10, 9.2, 9.3, 10.1, 10.2_

- [ ] 8.2 SupplierSiteServiceを実装
  - `apps/api/src/modules/master-data/business-partner/services/supplier-site.service.ts` を作成
  - list メソッド実装
  - getById メソッド実装（SUPPLIER_SITE_NOT_FOUND エラーハンドリング）
  - create メソッド実装（トランザクション境界: 1. PayeeService.findOrCreate 呼び出し、2. SupplierSiteRepository.create、3. PartyService.updateDerivedFlags）
  - update メソッド実装（payee_id 変更不可）
  - delete メソッド実装（トランザクション境界: 1. SupplierSiteRepository.delete、2. PartyService.updateDerivedFlags）
  - normalizeBusinessCode 呼び出し、supplier_code 生成（party_code + "-" + supplier_sub_code）
  - PayeeService をDI
  - PartyService をDI
  - TenantConfigService をDI
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 2.11, 7.1, 7.2_

- [ ] 8.3 SupplierSiteControllerを実装
  - `apps/api/src/modules/master-data/business-partner/controllers/supplier-site.controller.ts` を作成
  - GET /api/domain/master-data/business-partner/supplier-sites（list）
  - GET /api/domain/master-data/business-partner/supplier-sites/:id（getById）
  - POST /api/domain/master-data/business-partner/supplier-sites（create）
  - PUT /api/domain/master-data/business-partner/supplier-sites/:id（update）
  - DELETE /api/domain/master-data/business-partner/supplier-sites/:id（delete）
  - API契約を使用
  - _Requirements: 2.1, 2.2_

- [ ] 8.4 SupplierSiteModuleを実装
  - `apps/api/src/modules/master-data/business-partner/supplier-site.module.ts` を作成
  - SupplierSiteService, SupplierSiteRepository, SupplierSiteController をモジュールに登録
  - PayeeService, PartyService, TenantConfigService をインポート
  - _Requirements: 2.1_

---

## 9. BFF - Paging Normalization & Mapping

- [ ] 9. BFF実装（UI ↔ Domain API 仲介）
- [ ] 9.1 BFF Paging正規化ユーティリティを実装
  - `apps/bff/src/common/utils/normalize-paging.ts` を作成
  - normalizePagingParams 関数を実装（page/pageSize → offset/limit 変換）
  - defaults: page=1, pageSize=50
  - clamp: pageSize ≤ 200
  - offset = (page - 1) * pageSize
  - transformToListResponse 関数を実装（totalPages 計算: Math.ceil(total / pageSize)）
  - 単体テスト作成
  - _Requirements: 12.1_

- [ ] 9.2 Party BFF Serviceを実装
  - `apps/bff/src/modules/master-data/business-partner/services/party-bff.service.ts` を作成
  - listParties メソッド実装（normalizePagingParams 呼び出し、Domain API Client 呼び出し、transformToListResponse）
  - getParty メソッド実装
  - createParty メソッド実装
  - updateParty メソッド実装
  - keyword trim・空→undefined 正規化
  - sortBy whitelist チェック（PartySortBy type）
  - Error Policy: Pass-through（Domain APIエラーをそのまま返す）
  - _Requirements: 1.1, 1.2, 12.1, 12.2, 12.3_

- [ ] 9.3 SupplierSite BFF Serviceを実装
  - `apps/bff/src/modules/master-data/business-partner/services/supplier-site-bff.service.ts` を作成
  - listSupplierSites メソッド実装（normalizePagingParams）
  - getSupplierSite メソッド実装
  - createSupplierSite メソッド実装
  - updateSupplierSite メソッド実装
  - deleteSupplierSite メソッド実装
  - Error Policy: Pass-through
  - _Requirements: 2.1, 2.2_

- [ ] 9.4 Payee BFF Serviceを実装
  - `apps/bff/src/modules/master-data/business-partner/services/payee-bff.service.ts` を作成
  - listPayees メソッド実装（normalizePagingParams）
  - getPayee メソッド実装
  - createPayee メソッド実装
  - updatePayee メソッド実装
  - Error Policy: Pass-through
  - _Requirements: 3.1, 3.2_

- [ ] 9.5 BFF Controllerを実装
  - `apps/bff/src/modules/master-data/business-partner/controllers/business-partner-bff.controller.ts` を作成
  - GET /api/bff/master-data/business-partner/parties（Party一覧）
  - GET /api/bff/master-data/business-partner/parties/:id（Party取得）
  - POST /api/bff/master-data/business-partner/parties（Party作成）
  - PUT /api/bff/master-data/business-partner/parties/:id（Party更新）
  - 同様に SupplierSite / Payee のエンドポイントを実装
  - BFF契約（ListPartiesRequest/Response等）を使用
  - _Requirements: 1.1, 2.1, 3.1_

- [ ] 9.6 BFF Moduleを実装
  - `apps/bff/src/modules/master-data/business-partner/business-partner-bff.module.ts` を作成
  - PartyBffService, SupplierSiteBffService, PayeeBffService, BusinessPartnerBffController をモジュールに登録
  - Domain API Client をインポート
  - _Requirements: 1.1_

---

## 10. UI - v0 Phase 1（統制テスト）

- [ ] 10. v0 Prompt作成
- [ ] 10.1 v0プロンプトを作成
  - `.kiro/specs/master-data/business-partner/v0-prompt.md` を作成
  - `.kiro/steering/v0-prompt-template.md` をベースに作成
  - BFF Specification（14エンドポイント）を完全記載
  - 禁止事項明記: layout.tsx生成禁止、生カラーリテラル禁止、直接fetch禁止、基盤UIコンポーネント作成禁止
  - MockBffClient 使用指示（BFF未接続状態）
  - Payee選択3択UI（同一 / 既存 / 新規）を明記
  - _Requirements: 13.1, 13.2, 13.3, 13.4_

- [ ] 10.2 v0でUI生成
  - v0.dev で v0-prompt.md の内容を貼り付け
  - Party一覧画面、Party登録画面、SupplierSite登録画面、Payee一覧画面を生成
  - MockBffClient で動作確認
  - v0 Chat URL を控える
  - _Requirements: 1.1, 2.1, 3.1, 13.1_

- [ ] 10.3 v0ファイル取得
  - 実行: `./scripts/v0-fetch.sh '<v0_url>' 'master-data/business-partner'`
  - 確認: `apps/web/_v0_drop/master-data/business-partner/src/` にファイルが格納されている
  - 確認: layout.tsx が存在しない
  - _Requirements: 1.1_

- [ ] 10.4 Structure Guard実行
  - 実行: `npx tsx scripts/structure-guards.ts`
  - 確認: UI → Domain API 直接呼び出しが存在しない
  - 確認: UIでの直接 fetch() が存在しない（MockBffClient 例外）
  - 確認: 生カラーリテラルが存在しない
  - 確認: `packages/contracts/src/api` をUIが参照していない
  - _Requirements: 1.1_

---

## 11. UI - v0 Phase 2（本実装）

- [ ] 11. UI本実装（v0移植 + BFF接続）
- [ ] 11.1 v0出力を本実装へ移植
  - 実行: `npx tsx scripts/v0-migrate.ts master-data business-partner`
  - 確認: `apps/web/src/features/master-data/business-partner/` にファイルが移植されている
  - import パス修正（`@/shared/ui` を使用）
  - DTO import 修正（`@contracts/bff/business-partner` を使用）
  - _Requirements: 1.1_

- [ ] 11.2 HttpBffClientを実装
  - `apps/web/src/features/master-data/business-partner/api/HttpBffClient.ts` を作成
  - listParties, getParty, createParty, updateParty メソッド実装
  - listSupplierSites, getSupplierSite, createSupplierSite, updateSupplierSite, deleteSupplierSite メソッド実装
  - listPayees, getPayee, createPayee, updatePayee メソッド実装
  - BFF契約を使用
  - エラーハンドリング（BusinessPartnerErrorCode 別の表示制御）
  - _Requirements: 1.1, 2.1, 3.1, 14.5_

- [ ] 11.3 App Router登録
  - `apps/web/src/app/master-data/business-partner/page.tsx` を作成
  - Party一覧画面をデフォルト表示
  - _Requirements: 1.1_

- [ ] 11.4 Navigation登録
  - `apps/web/src/shared/navigation/menu.ts` に Business Partner メニューを追加
  - マスタデータ > 取引先マスタ
  - _Requirements: 1.1_

- [ ] 11.5 URL state / debounce 実装
  - Party一覧画面: URL state でページ・ソート・検索条件を保持
  - keyword 検索: debounce（300ms）を適用
  - _Requirements: 12.1, 12.3_

---

## 12. Integration Testing

- [ ] 12. 統合テスト
- [ ] 12.1 Party CRUD統合テスト
  - Party作成 → 一覧取得 → 更新 → 論理削除 のフローを確認
  - tenant_id フィルタが効いているか確認
  - party_code 重複エラーを確認
  - version 楽観ロック競合エラーを確認
  - _Requirements: 1.1, 1.2, 1.3, 9.2, 11.2, 11.3_

- [ ] 12.2 SupplierSite + Payee自動生成統合テスト
  - SupplierSite作成（payee_id未指定）→ Payee自動生成を確認
  - 同一party_id + supplier_sub_code で2回目作成 → 既存Payee再利用を確認
  - SupplierSite作成後 → Party.is_supplier = true を確認
  - SupplierSite論理削除 → Party.is_supplier = false を確認（同一Party配下に他のSupplierSiteが存在しない場合）
  - _Requirements: 2.6, 2.7, 2.8, 2.9, 2.10, 7.1, 7.2_

- [ ] 12.3 Payee CRUD統合テスト
  - Payee作成 → 一覧取得 → 更新 のフローを確認
  - payee_code 重複エラーを確認
  - SupplierSite登録画面で既存Payee選択（同一party_idのみ表示）を確認
  - _Requirements: 3.1, 3.2, 3.6, 13.3_

- [ ] 12.4* E2Eテスト（UI統合）
  - Party一覧画面 → ページング・ソート・検索が動作することを確認
  - SupplierSite登録画面 → Payee3択（同一/既存/新規）が動作することを確認
  - エラーメッセージが適切に表示されることを確認
  - _Requirements: 1.1, 2.1, 12.1, 12.2, 12.3, 13.1, 13.2, 13.3, 13.4, 14.5_

---

## 13. PayeeBankAccount（支払先口座）with Bank Master Selection

> **追加タスク**: 銀行マスタ連携による口座選択機能

- [ ] 13. PayeeBankAccount機能実装
- [ ] 13.1 (P) PayeeBankAccount BFF契約を定義
  - `packages/contracts/src/bff/business-partner/index.ts` に PayeeBankAccount用の型定義を追加
  - ListPayeeBankAccountsRequest / ListPayeeBankAccountsResponse
  - CreatePayeeBankAccountRequest / CreatePayeeBankAccountResponse
  - UpdatePayeeBankAccountRequest / UpdatePayeeBankAccountResponse
  - PayeeBankAccountDto（accountCategory, bankId, bankCode, bankName, branchCode, branchName, accountType, accountNo, etc.）
  - AccountCategory type（'bank' | 'post_office' | 'ja_bank'）
  - AccountType type（'ordinary' | 'current' | 'savings' | 'other'）
  - TransferFeeBearer type（'sender' | 'recipient'）
  - _Requirements: 15.1, 15.2_

- [ ] 13.2 (P) 銀行・支店検索 BFF契約を定義
  - `packages/contracts/src/bff/business-partner/index.ts` に 検索API用の型定義を追加
  - SearchBanksRequest / SearchBanksResponse（keyword, limit）
  - SearchBranchesRequest / SearchBranchesResponse（bankId, keyword, limit）
  - BankSummary（id, bankCode, bankName, bankNameKana）
  - BranchSummary（id, branchCode, branchName, branchNameKana）
  - _Requirements: 15.4, 15.5, 15.6_

- [ ] 13.3 (P) PayeeBankAccount API契約を定義
  - `packages/contracts/src/api/business-partner/index.ts` に PayeeBankAccount用の型定義を追加
  - ListPayeeBankAccountsApiRequest / ListPayeeBankAccountsApiResponse
  - CreatePayeeBankAccountApiRequest / CreatePayeeBankAccountApiResponse
  - UpdatePayeeBankAccountApiRequest / UpdatePayeeBankAccountApiResponse
  - `packages/contracts/src/api/errors/business-partner-error.ts` に追加エラーコードを定義
  - PAYEE_BANK_ACCOUNT_NOT_FOUND, BANK_NOT_FOUND, BANK_BRANCH_NOT_FOUND
  - _Requirements: 15.1, 15.2, 15.9_

- [ ] 13.4 Prisma Schemaにpayee_bank_accountsテーブル定義を追加
  - `packages/db/prisma/schema.prisma` に PayeeBankAccount model を追加
  - id, tenant_id, payee_id（FK）, account_category, bank_id, bank_branch_id, bank_code, bank_name, branch_code, branch_name, post_office_symbol, post_office_number, account_type, account_no, account_holder_name, account_holder_name_kana, transfer_fee_bearer, is_default, is_active, notes, version, 監査列
  - UNIQUE制約: @@unique([tenant_id, payee_id, id])
  - INDEX: @@index([tenant_id, payee_id]), @@index([tenant_id, is_active])
  - Payee model に bankAccounts relation を追加
  - 実行: `npx prisma migrate dev --name add_payee_bank_accounts`
  - _Requirements: 15.1, 15.2, 9.1_

- [ ] 13.5 PayeeBankAccountRepositoryを実装
  - `apps/api/src/modules/master-data/business-partner/repositories/payee-bank-account.repository.ts` を作成
  - listByPayee(tenantId, payeeId, isActive?) メソッド実装
  - findById(id, tenantId) メソッド実装
  - create(data, userId) メソッド実装
  - update(id, version, data, userId) メソッド実装
  - すべてのクエリに `WHERE tenant_id = ?` を含める（double-guard）
  - _Requirements: 15.1, 15.2, 9.2, 9.3_

- [ ] 13.6 PayeeBankAccountServiceを実装
  - `apps/api/src/modules/master-data/business-partner/services/payee-bank-account.service.ts` を作成
  - listByPayee メソッド実装
  - getById メソッド実装（PAYEE_BANK_ACCOUNT_NOT_FOUND エラーハンドリング）
  - create メソッド実装:
    - Payee存在確認（PAYEE_NOT_FOUND エラーハンドリング）
    - accountCategory='bank'/'ja_bank' の場合、BankMasterService から銀行・支店情報取得
    - 銀行コード・銀行名・支店コード・支店名を非正規化してDB保存
    - isDefault=true の場合、同一Payee配下の他口座を isDefault=false に更新（同一トランザクション）
  - update メソッド実装（version チェック、CONCURRENT_UPDATE エラーハンドリング）
  - BankMasterService をDI（銀行・支店情報取得）
  - _Requirements: 15.1, 15.2, 15.4, 15.5, 15.7, 15.8_

- [ ] 13.7 PayeeBankAccountControllerを実装
  - `apps/api/src/modules/master-data/business-partner/controllers/payee-bank-account.controller.ts` を作成
  - GET /api/domain/master-data/business-partner/payees/:payeeId/bank-accounts（listByPayee）
  - POST /api/domain/master-data/business-partner/payees/:payeeId/bank-accounts（create）
  - PUT /api/domain/master-data/business-partner/payee-bank-accounts/:id（update）
  - API契約を使用
  - _Requirements: 15.1, 15.2_

- [ ] 13.8 PayeeBankAccountModuleを実装
  - `apps/api/src/modules/master-data/business-partner/payee-bank-account.module.ts` を作成
  - PayeeBankAccountService, PayeeBankAccountRepository, PayeeBankAccountController をモジュールに登録
  - BankMasterModule をインポート（銀行・支店情報取得）
  - _Requirements: 15.1_

- [ ] 13.9 BankSearchController（BFF）を実装
  - `apps/bff/src/modules/master-data/business-partner/controllers/bank-search.controller.ts` を作成
  - GET /api/bff/master-data/business-partner/banks/search（searchBanks）
  - GET /api/bff/master-data/business-partner/banks/:bankId/branches/search（searchBranches）
  - BankMasterAPI Client を呼び出し
  - 検索結果は最大10件（limit）に制限
  - BFF契約（SearchBanksRequest/Response等）を使用
  - _Requirements: 15.4, 15.5, 15.6_

- [ ] 13.10 PayeeBankAccount BFF Serviceを実装
  - `apps/bff/src/modules/master-data/business-partner/services/payee-bank-account-bff.service.ts` を作成
  - listPayeeBankAccounts メソッド実装
  - createPayeeBankAccount メソッド実装
  - updatePayeeBankAccount メソッド実装
  - Error Policy: Pass-through
  - _Requirements: 15.1, 15.2_

- [ ] 13.11 PayeeBankAccount BFF Controllerエンドポイント追加
  - `apps/bff/src/modules/master-data/business-partner/controllers/business-partner-bff.controller.ts` に追加
  - GET /api/bff/master-data/business-partner/payees/:payeeId/bank-accounts
  - POST /api/bff/master-data/business-partner/payees/:payeeId/bank-accounts
  - PUT /api/bff/master-data/business-partner/payee-bank-accounts/:id
  - BFF契約を使用
  - _Requirements: 15.1, 15.2_

- [ ] 13.12 UI: BffClientに銀行・支店検索API追加
  - `apps/web/src/features/master-data/business-partner/ui/api/BffClient.ts` に追加
  - searchBanks(request: SearchBanksRequest): Promise<SearchBanksResponse>
  - searchBranches(request: SearchBranchesRequest): Promise<SearchBranchesResponse>
  - `apps/web/src/features/master-data/business-partner/ui/types/bff-contracts.ts` に型定義追加
  - MockBffClient / HttpBffClient に実装追加
  - _Requirements: 15.4, 15.5, 15.6_

- [ ] 13.13 UI: PayeeDialogに銀行・支店選択UI実装
  - `apps/web/src/features/master-data/business-partner/ui/components/PayeeDialog.tsx` を修正
  - 口座区分セレクター（銀行/ゆうちょ/農協）を実装
  - 銀行サジェスト入力（BankSuggestInput）を実装:
    - 2文字以上入力で searchBanks API 呼び出し（debounce 300ms）
    - ドロップダウンで候補表示（最大10件）
    - 選択時に bankId を内部保持、表示は「銀行名 (銀行コード)」
  - 支店サジェスト入力（BranchSuggestInput）を実装:
    - 銀行未選択時は disabled
    - 銀行選択後に有効化、searchBranches API 呼び出し
    - 選択時に bankBranchId を内部保持
  - ゆうちょ選択時は記号・番号入力フィールドを表示
  - フォーム送信時に bankId / bankBranchId を送信（コード・名称はAPI側で解決）
  - _Requirements: 15.4, 15.5, 15.6, 15.7_

- [ ] 13.14 PayeeBankAccount統合テスト
  - PayeeBankAccount作成（銀行選択）→ 銀行コード・銀行名が自動取得されていることを確認
  - PayeeBankAccount作成（ゆうちょ）→ 記号・番号が保存されていることを確認
  - isDefault=true 設定 → 同一Payee配下の他口座が isDefault=false になることを確認
  - 存在しない銀行ID/支店ID でエラー（BANK_NOT_FOUND, BANK_BRANCH_NOT_FOUND）を確認
  - _Requirements: 15.1, 15.2, 15.4, 15.5, 15.7, 15.8, 15.9_

---

## 14. Payeeデフォルト出金口座設定（Requirement 16）

> **追加タスク**: 支払先ごとにデフォルト出金口座（自社口座）を設定

- [ ] 14. Payeeデフォルト出金口座機能実装
- [ ] 14.1 Prisma SchemaにPayee.defaultCompanyBankAccountIdを追加
  - `packages/db/prisma/schema.prisma` の Payee model に追加
  - `defaultCompanyBankAccountId String? @map("default_company_bank_account_id")`
  - FK制約は設定しない（company_bank_accountsが別ドメインのため、参照整合性はアプリ層で担保）
  - 実行: `npx prisma migrate dev --name add_payee_default_company_bank_account`
  - _Requirements: 16.3_

- [ ] 14.2 PayeeDto / CreatePayeeRequest / UpdatePayeeRequest を更新
  - `packages/contracts/src/bff/business-partner/index.ts` に追加
  - PayeeDto: `defaultCompanyBankAccountId?: string | null`
  - CreatePayeeRequest: `defaultCompanyBankAccountId?: string`
  - UpdatePayeeRequest: `defaultCompanyBankAccountId?: string | null`
  - _Requirements: 16.1, 16.3_

- [ ] 14.3 PayeeRepository / PayeeService を更新
  - create / update メソッドで `defaultCompanyBankAccountId` を保存
  - 存在チェックはオプション（自社口座マスタが別ドメインのため）
  - _Requirements: 16.3, 16.4_

- [ ] 14.4 BFF: 自社口座一覧取得エンドポイント追加
  - `apps/bff/src/modules/master-data/business-partner/controllers/business-partner-bff.controller.ts` に追加
  - GET /api/bff/master-data/business-partner/company-bank-accounts
  - CompanyBankAccountModule のAPIを呼び出し、isActive=trueのみ返す
  - Response: `{ items: CompanyBankAccountSummary[] }`
  - _Requirements: 16.2_

- [ ] 14.5 UI: bff-contracts.ts に CompanyBankAccountSummary 型追加
  - `apps/web/src/features/master-data/business-partner/ui/types/bff-contracts.ts` に追加
  - `CompanyBankAccountSummary { id, accountName, bankName, branchName, accountType, accountNo }`
  - `ListCompanyBankAccountsResponse { items: CompanyBankAccountSummary[] }`
  - _Requirements: 16.2_

- [ ] 14.6 UI: BffClient に listCompanyBankAccounts メソッド追加
  - `apps/web/src/features/master-data/business-partner/ui/api/BffClient.ts` に追加
  - MockBffClient / HttpBffClient に実装追加
  - _Requirements: 16.2_

- [ ] 14.7 UI: PayeeDialogにデフォルト出金口座選択UIを追加
  - `apps/web/src/features/master-data/business-partner/ui/components/PayeeDialog.tsx` を修正
  - 「支払設定」セクションに「デフォルト出金口座」ドロップダウンを追加
  - ダイアログ表示時に自社口座一覧を取得
  - 選択肢: （未設定）+ isActive=true の自社口座
  - 表示形式: `{銀行名} {支店名} {口座種別} {口座番号} {口座名称}`
  - 保存時に `defaultCompanyBankAccountId` を送信
  - _Requirements: 16.1, 16.2, 16.6_

- [ ] 14.8 デフォルト出金口座統合テスト
  - Payee作成時にdefaultCompanyBankAccountId設定 → 保存・取得確認
  - Payee更新時にdefaultCompanyBankAccountId変更 → 更新・取得確認
  - 存在しない自社口座IDで登録 → エラーまたは警告の動作確認
  - _Requirements: 16.1, 16.3, 16.4, 16.5_

---

## Requirements Coverage Matrix

| Requirement | Tasks |
|-------------|-------|
| 1.1 - 1.10 | 2.1, 3.1, 6.1, 6.2, 6.3, 6.4, 9.2, 9.5, 9.6, 10.1, 10.2, 10.3, 10.4, 11.1, 11.2, 11.3, 11.4, 12.1 |
| 2.1 - 2.11 | 2.2, 3.2, 4.1, 8.1, 8.2, 8.3, 8.4, 9.3, 9.5, 10.1, 10.2, 11.2, 12.2 |
| 3.1 - 3.8 | 2.3, 3.3, 4.1, 7.1, 7.2, 7.3, 7.4, 9.4, 9.5, 10.2, 11.2, 12.3 |
| 4.1 - 4.7 | 2.4, 3.4, 4.1 |
| 5.1 - 5.6 | 2.5, 3.4, 4.1 |
| 6.1 - 6.6 | 5.1, 5.2 |
| 7.1 - 7.6 | 6.1, 6.2, 8.2, 12.2 |
| 8.1 - 8.5 | 4.1 |
| 9.1 - 9.5 | 1, 4.1, 4.2, 4.3, 6.1, 7.1, 8.1, 12.1 |
| 10.1 - 10.4 | 4.1, 8.1 |
| 11.1 - 11.4 | 4.1, 6.2, 12.1 |
| 12.1 - 12.5 | 2.1, 3.1, 4.1, 9.1, 9.2, 11.5, 12.4 |
| 13.1 - 13.4 | 2.2, 10.1, 10.2, 12.3, 12.4 |
| 14.1 - 14.5 | 3.5, 11.2, 12.4 |
| 15.1 - 15.10 | 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7, 13.8, 13.9, 13.10, 13.11, 13.12, 13.13, 13.14 |
| 16.1 - 16.6 | 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.7, 14.8 |

---

## Notes

- **MVP-1スコープ**: Party, SupplierSite, Payee の3エンティティを優先実装
- **将来拡張**: CustomerSite, ShipTo は契約のみ定義し、実装はPhase 2以降
- **テナント設定**: TenantConfigService は簡易版（環境変数）を実装、Phase 2でテナント設定テーブルから取得に変更予定
- **週次バッチ**: 派生フラグ整合性チェックバッチはPhase 2で検討（MVP-1ではService層制御のみ）
- **並列実行**: (P) マーカーが付いたタスクは並列実行可能（Contracts定義、Repository/Service実装等）
- **オプショナルタスク**: 12.4（E2Eテスト）は `*` マーク付き。MVP-1では統合テスト（12.1-12.3）で受入基準を満たし、E2Eテストは後回し可能
