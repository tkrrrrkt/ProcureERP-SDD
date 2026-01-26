# Implementation Plan: tax-code（税コードマスタ）

> CCSDD / SDD 前提：**contracts-first**（bff → api → shared）を最優先し、境界違反を guard で止める。
> UI は最後。v0 は **Phase 1（統制テスト）→ Phase 2（本実装）** の二段階で扱う。

---

## 0. Design Completeness Gate（Blocking）

> Implementation MUST NOT start until all items below are checked.

- [x] 0.1 Designの「BFF Specification（apps/bff）」が埋まっている
  - BFF endpoints（8エンドポイント）が記載されている
  - Request/Response DTO（packages/contracts/src/bff/tax-code）が列挙されている
  - Paging/Sorting正規化が明記（page=1, pageSize=20, clamp≤200, whitelist, transform）
  - 変換（api DTO → bff DTO: 1:1マッピング）の方針が記載されている
  - エラー整形方針（Option A: Pass-through）が記載されている
  - tenant_id/user_id の取り回し（Clerk→header伝搬）が記載されている

- [x] 0.2 Designの「Service Specification（Domain / apps/api）」が埋まっている
  - Usecase（list/get/create/update/deactivate/activate + dropdown APIs）が列挙されている
  - 主要ビジネスルール（重複チェック、FK検証、イミュータブルフィールド）の所在が記載されている
  - トランザクション境界（Read/Write）が記載されている
  - 監査ログ記録ポイント（create/update/deactivate/activate）が記載されている

- [x] 0.3 Designの「Repository Specification（apps/api）」が埋まっている
  - TaxCodeRepository / TaxBusinessCategoryRepository / TaxRateRepository の取得・更新メソッド一覧が記載されている
  - where句二重ガードの方針（tenant_id常時指定）が記載されている
  - RLS前提（set_config前提）が記載されている

- [x] 0.4 Designの「Contracts Summary（This Feature）」が埋まっている
  - packages/contracts/src/bff/tax-code の追加DTOが列挙されている
  - packages/contracts/src/api/tax-code の追加DTOが列挙されている
  - Enum（TaxInOut）/ Error の配置ルールが明記されている
  - 「UIは packages/contracts/src/api を参照しない」ルールが明記されている

- [x] 0.5 Requirements Traceability が更新されている
  - 全7要件がBFF/API/Repo/Flowsに紐づいている

- [ ] 0.6 v0生成物の受入・移植ルールが確認されている（UI実装時に確認）

- [ ] 0.7 Structure / Boundary Guard がパスしている（実装完了後に確認）

---

## 1. Contracts Definition（contracts-first）

- [ ] 1.1 API Contracts 作成
  - `packages/contracts/src/api/tax-code/index.ts` を作成
  - TaxInOut enum、TaxCodeSortBy、SortOrder 型定義
  - TaxCodeApiDto、TaxBusinessCategoryApiDto、TaxRateForDropdownApiDto
  - ListTaxCodesApiRequest/Response
  - CreateTaxCodeApiRequest/Response
  - UpdateTaxCodeApiRequest/Response
  - DeactivateTaxCodeApiRequest/Response、ActivateTaxCodeApiRequest/Response
  - ListTaxBusinessCategoriesApiResponse、ListTaxRatesForDropdownApiResponse
  - _Requirements: 1.1-1.5, 2.1-2.8, 3.1-3.7, 4.1-4.4, 5.1-5.4_

- [ ] 1.2 API Error Contracts 作成 (P)
  - `packages/contracts/src/api/errors/tax-code-error.ts` を作成
  - TAX_CODE_ERROR_CODES: TAX_CODE_NOT_FOUND, TAX_CODE_DUPLICATE, TAX_BUSINESS_CATEGORY_NOT_FOUND, TAX_RATE_NOT_FOUND, VERSION_CONFLICT, IMMUTABLE_FIELD_UPDATE
  - TaxCodeErrorHttpStatus、TaxCodeErrorMessage
  - `packages/contracts/src/api/errors/index.ts` に export 追加
  - _Requirements: 2.6, 6.4_

- [ ] 1.3 BFF Contracts 作成 (P)
  - `packages/contracts/src/bff/tax-code/index.ts` を作成
  - TaxInOut enum、TaxCodeSortBy、SortOrder 型定義
  - TaxCodeDto、TaxBusinessCategoryDto、TaxRateForDropdownDto
  - ListTaxCodesRequest/Response（page/pageSize/total/totalPages）
  - GetTaxCodeResponse
  - CreateTaxCodeRequest/Response
  - UpdateTaxCodeRequest/Response
  - DeactivateTaxCodeRequest/Response、ActivateTaxCodeRequest/Response
  - ListTaxBusinessCategoriesResponse、ListTaxRatesForDropdownResponse
  - _Requirements: 1.1-1.5, 2.1-2.8, 3.1-3.7, 4.1-4.4, 5.1-5.4_

- [ ] 1.4 BFF Error Contracts 作成 (P)
  - `packages/contracts/src/bff/errors/tax-code-error.ts` を作成（Pass-through）
  - `packages/contracts/src/bff/errors/index.ts` に export 追加
  - _Requirements: 2.6_

---

## 2. Database Schema（DB Layer）

- [ ] 2.1 Prisma Schema 更新
  - `packages/db/prisma/schema.prisma` に TaxCode モデル追加
  - TaxRate モデルに `taxCodes TaxCode[]` リレーション追加
  - TaxBusinessCategory モデルに `taxCodes TaxCode[]` リレーション追加
  - _Requirements: 6.1, 6.3, 6.4_

- [ ] 2.2 Migration 生成・適用
  - `npx prisma migrate dev --name add_tax_code`
  - RLS ポリシー確認（tenant_id によるアクセス制御）
  - _Requirements: 6.2_

---

## 3. Domain API（apps/api）

- [ ] 3.1 TaxCode Module 骨格作成
  - `apps/api/src/modules/master-data/tax-code/tax-code.module.ts`
  - Controller, Service, Repository の DI 設定
  - AppModule への登録

- [ ] 3.2 TaxCode Repository 実装
  - `apps/api/src/modules/master-data/tax-code/repository/tax-code.repository.ts`
  - findMany（フィルタ、ソート、ページネーション）
  - findById、findByCode
  - create、update
  - tenant_id 二重ガード
  - _Requirements: 1.1-1.5, 6.1, 6.2_

- [ ] 3.3 TaxBusinessCategory Repository 実装 (P)
  - `apps/api/src/modules/master-data/tax-code/repository/tax-business-category.repository.ts`
  - findMany（is_active = true のみ）、findById
  - _Requirements: 5.1, 5.3_

- [ ] 3.4 TaxCode Service 実装
  - `apps/api/src/modules/master-data/tax-code/service/tax-code.service.ts`
  - listTaxCodes: フィルタ、ソート、ページネーション
  - getTaxCode: 詳細取得
  - createTaxCode: 重複チェック、FK検証、監査ログ
  - updateTaxCode: イミュータブルフィールド検証、楽観ロック、監査ログ
  - deactivateTaxCode / activateTaxCode: 論理無効化/有効化
  - listTaxBusinessCategories: 税区分ドロップダウン用
  - listTaxRatesForDropdown: 税率ドロップダウン用（既存 TaxRateRepository 利用）
  - _Requirements: 1.1-1.5, 2.1-2.8, 3.1-3.7, 4.1-4.4, 5.1-5.4_

- [ ] 3.5 TaxCode Controller 実装
  - `apps/api/src/modules/master-data/tax-code/controller/tax-code.controller.ts`
  - GET /api/master-data/tax-code（一覧）
  - GET /api/master-data/tax-code/:id（詳細）
  - POST /api/master-data/tax-code（新規登録）
  - PUT /api/master-data/tax-code/:id（更新）
  - PATCH /api/master-data/tax-code/:id/deactivate（無効化）
  - PATCH /api/master-data/tax-code/:id/activate（有効化）
  - GET /api/master-data/tax-code/tax-business-categories（税区分一覧）
  - GET /api/master-data/tax-code/tax-rates（税率一覧）
  - _Requirements: 1.1-1.5, 2.1-2.8, 3.1-3.7, 4.1-4.4, 5.1-5.4, 7.1-7.5_

- [ ] 3.6 API Mapper 実装 (P)
  - `apps/api/src/modules/master-data/tax-code/mappers/tax-code.mapper.ts`
  - Entity → ApiDto 変換

---

## 4. BFF Layer（apps/bff）

- [ ] 4.1 TaxCode Module 骨格作成
  - `apps/bff/src/modules/master-data/tax-code/tax-code.module.ts`
  - Controller, Service, DomainApiClient の DI 設定
  - AppModule への登録

- [ ] 4.2 Domain API Client 実装
  - `apps/bff/src/modules/master-data/tax-code/clients/domain-api.client.ts`
  - Domain API への HTTP 呼び出し
  - X-Tenant-ID, X-User-ID ヘッダー伝搬

- [ ] 4.3 BFF Service 実装
  - `apps/bff/src/modules/master-data/tax-code/service/tax-code.service.ts`
  - page/pageSize → offset/limit 変換
  - sortBy ホワイトリスト検証
  - キーワード正規化
  - Domain API 呼び出し・レスポンス変換

- [ ] 4.4 BFF Controller 実装
  - `apps/bff/src/modules/master-data/tax-code/controller/tax-code.controller.ts`
  - GET /api/bff/master-data/tax-code
  - GET /api/bff/master-data/tax-code/:id
  - POST /api/bff/master-data/tax-code
  - PUT /api/bff/master-data/tax-code/:id
  - PATCH /api/bff/master-data/tax-code/:id/deactivate
  - PATCH /api/bff/master-data/tax-code/:id/activate
  - GET /api/bff/master-data/tax-code/tax-business-categories
  - GET /api/bff/master-data/tax-code/tax-rates
  - _Requirements: 1.1-1.5, 2.1-2.8, 3.1-3.7, 4.1-4.4, 5.1-5.4_

- [ ] 4.5 BFF Mapper 実装 (P)
  - `apps/bff/src/modules/master-data/tax-code/mappers/tax-code.mapper.ts`
  - ApiDto → BffDto 変換（1:1）
  - page/pageSize/total/totalPages 計算

---

## 5. UI Layer（apps/web）

- [ ] 5.1 Feature 骨格作成
  - `apps/web/src/features/master-data/tax-code/` ディレクトリ作成
  - index.ts、types/、api/、hooks/、components/ 作成

- [ ] 5.2 BFF Client 実装
  - `apps/web/src/features/master-data/tax-code/ui/api/BffClient.ts`（インターフェース）
  - `apps/web/src/features/master-data/tax-code/ui/api/HttpBffClient.ts`（実装）
  - `apps/web/src/features/master-data/tax-code/ui/api/MockBffClient.ts`（モック）

- [ ] 5.3 TaxCodeList コンポーネント実装
  - `apps/web/src/features/master-data/tax-code/ui/components/TaxCodeList.tsx`
  - DataTable 形式（税コード、税区分名、税率%、内税/外税、有効フラグ）
  - 検索、フィルタ（税区分、有効フラグ）、ソート、ページネーション
  - 行クリックで編集ダイアログ
  - 権限に基づくボタン表示制御
  - _Requirements: 1.1-1.5, 7.1, 7.4_

- [ ] 5.4 TaxCodeDialog コンポーネント実装
  - `apps/web/src/features/master-data/tax-code/ui/components/TaxCodeDialog.tsx`
  - 新規登録: 税コード入力、税区分ドロップダウン、税率ドロップダウン、内税/外税ラジオ
  - 編集: 税コード・税区分・税率・内税外税は読み取り専用、有効フラグのみ編集可
  - バリデーション、エラー表示
  - _Requirements: 2.1-2.8, 3.1-3.7, 7.2, 7.3, 7.4_

- [ ] 5.5 Page コンポーネント実装
  - `apps/web/src/app/master-data/tax-code/page.tsx`
  - TaxCodeList + TaxCodeDialog 配置
  - URL state 管理（検索、ページ、ソート）

- [ ] 5.6 Navigation Menu 追加
  - `apps/web/src/shared/navigation/menu.ts` に税コードマスタ追加
  - パス: `/master-data/tax-code`

---

## 6. Integration & Testing

- [ ] 6.1 API 結合テスト
  - Domain API エンドポイントの動作確認
  - 権限チェック（403）、重複チェック（409）、楽観ロック（409）
  - _Requirements: 2.6, 6.4, 7.5_

- [ ] 6.2 BFF 結合テスト
  - BFF エンドポイントの動作確認
  - page/pageSize 変換、エラー透過

- [ ] 6.3 UI 動作確認
  - MockBffClient での動作確認
  - HttpBffClient での結合確認
  - 権限による表示制御確認
  - _Requirements: 7.4_

- [ ] 6.4 Structure Guard 確認
  - `npx tsx scripts/structure-guards.ts` 実行
  - UI → Domain API 直接呼び出しなし
  - UI での直接 fetch() なし

---

## 7. Completion Checklist

- [ ] 7.1 全 Contracts が定義されている
- [ ] 7.2 Migration が適用されている
- [ ] 7.3 Domain API が動作している
- [ ] 7.4 BFF が動作している
- [ ] 7.5 UI が動作している
- [ ] 7.6 Structure Guard がパスしている
- [ ] 7.7 spec.json の `ready_for_implementation` が true になっている
