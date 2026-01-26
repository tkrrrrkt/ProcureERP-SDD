# Implementation Plan: tax-rate（税率マスタ）

> CCSDD / SDD 前提：**contracts-first**（bff → api → shared）を最優先し、境界違反を guard で止める。
> UI は最後。v0 は **Phase 1（統制テスト）→ Phase 2（本実装）** の二段階で扱う。

---

## 0. Design Completeness Gate（Blocking）

> Implementation MUST NOT start until all items below are checked.

- [x] 0.1 Designの「BFF Specification（apps/bff）」が埋まっている
- [x] 0.2 Designの「Service Specification（Domain / apps/api）」が埋まっている
- [x] 0.3 Designの「Repository Specification（apps/api）」が埋まっている
- [x] 0.4 Designの「Contracts Summary（This Feature）」が埋まっている
- [x] 0.5 Requirements Traceability が更新されている
- [ ] 0.6 v0生成物の受入・移植ルールが確認されている
- [ ] 0.7 Structure / Boundary Guard がパスしている

---

## 1. Contracts 定義

- [x] 1.1 (P) API Contracts を定義する
  - 税率マスタ用の API DTO（TaxRateApiDto, ListTaxRatesApiRequest/Response 等）を定義する
  - `packages/contracts/src/api/tax-rate/index.ts` を作成
  - SortBy 型、SortOrder 型を定義
  - Create/Update/Deactivate/Activate の Request/Response を定義
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 4.1, 4.2, 4.3, 4.4_

- [x] 1.2 (P) BFF Contracts を定義する
  - 税率マスタ用の BFF DTO（TaxRateDto, ListTaxRatesRequest/Response 等）を定義する
  - `packages/contracts/src/bff/tax-rate/index.ts` を作成
  - page/pageSize ベースのページネーション対応
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 4.1, 4.2, 4.3, 4.4_

- [x] 1.3 (P) Error Contracts を定義する
  - 税率マスタ用のエラーコードを定義する
  - `packages/contracts/src/api/errors/tax-rate-error.ts` を作成
  - TAX_RATE_NOT_FOUND, TAX_RATE_CODE_DUPLICATE, INVALID_DATE_RANGE, VERSION_CONFLICT, RATE_PERCENT_NOT_EDITABLE
  - `packages/contracts/src/bff/errors/tax-rate-error.ts` を作成（API エラーを re-export）
  - _Requirements: 2.4, 2.5, 3.5_

---

## 2. DB / Migration / Seed

- [x] 2.1 Prisma スキーマに TaxRate と TaxBusinessCategory モデルを追加する
  - TaxRate: id, tenantId, taxRateCode, ratePercent, validFrom, validTo, isActive, version, 監査カラム
  - TaxBusinessCategory: id, tenantId, taxBusinessCategoryCode, taxBusinessCategoryName, description, isActive, version, 監査カラム
  - UNIQUE制約（tenant_id + tax_rate_code）、（tenant_id + tax_business_category_code）
  - インデックス定義
  - _Requirements: 5.2, 5.3, 6.1, 6.3, 6.4_

- [x] 2.2 マイグレーションを実行し、RLS ポリシーを設定する
  - `npx prisma migrate dev` でマイグレーション生成・適用
  - tax_rates テーブルと tax_business_categories テーブルに RLS ポリシーを追加
  - tenant_id による行レベルセキュリティを有効化
  - _Requirements: 6.2_

- [x] 2.3 税区分のシードスクリプトを作成し実行する
  - 6種類の税区分（TAXABLE_SALES, TAXABLE_PURCHASE, COMMON_TAXABLE_PURCHASE, NON_TAXABLE, TAX_EXEMPT, OUT_OF_SCOPE）を投入
  - テナントごとにシードデータを作成する仕組み
  - `packages/db/prisma/seed/tax-business-category.seed.ts` を作成
  - _Requirements: 5.1, 5.4, 5.5_

---

## 3. Domain API（apps/api）

- [x] 3.1 TaxRate モジュールの骨格を作成する
  - `apps/api/src/modules/master-data/tax-rate/` ディレクトリ構成
  - tax-rate.module.ts を作成し AppModule に登録
  - Controller, Service, Repository の空ファイルを作成
  - _Requirements: 6.1_

- [x] 3.2 TaxRateRepository を実装する
  - findMany: テナント別一覧取得（フィルタ、ソート、ページネーション対応）
  - findById: ID指定での単一取得
  - findByCode: 税率コード指定での単一取得（重複チェック用）
  - create: 新規作成（tenant_id 必須）
  - update: 更新（楽観ロック対応、version チェック）
  - where句に必ず tenantId を含める
  - _Requirements: 1.1, 1.3, 1.4, 1.5, 2.6, 3.6, 6.1_

- [x] 3.3 TaxRateService を実装する
  - listTaxRates: 一覧取得（フィルタ、ソート、ページネーション）
  - getTaxRate: 詳細取得
  - createTaxRate: 新規登録（税率コード重複チェック、日付範囲バリデーション）
  - updateTaxRate: 更新（税率値変更禁止、日付範囲バリデーション、楽観ロック）
  - deactivateTaxRate: 無効化（is_active = false）
  - activateTaxRate: 有効化（is_active = true）
  - 監査ログ記録（created_by, updated_by）
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.3, 2.4, 2.5, 2.6, 2.7, 3.2, 3.3, 3.4, 3.5, 3.6, 4.1, 4.2, 6.3_

- [x] 3.4 TaxRateController を実装する
  - GET /api/master-data/tax-rate: 一覧取得
  - GET /api/master-data/tax-rate/:id: 詳細取得
  - POST /api/master-data/tax-rate: 新規登録
  - PUT /api/master-data/tax-rate/:id: 更新
  - PATCH /api/master-data/tax-rate/:id/deactivate: 無効化
  - PATCH /api/master-data/tax-rate/:id/activate: 有効化
  - 権限チェック（procure.tax-rate.read/create/update）
  - tenant_id, user_id をヘッダーから取得
  - _Requirements: 7.1, 7.2, 7.3, 7.5_

---

## 4. BFF（apps/bff）

- [x] 4.1 TaxRate BFF モジュールの骨格を作成する
  - `apps/bff/src/modules/master-data/tax-rate/` ディレクトリ構成
  - tax-rate.module.ts を作成し AppModule に登録
  - Controller, Service, Mapper の空ファイルを作成
  - _Requirements: 6.1_

- [x] 4.2 TaxRate BFF Service を実装する
  - Domain API を呼び出し、レスポンスを BFF DTO に変換
  - page/pageSize → offset/limit 変換
  - sortBy ホワイトリスト検証（taxRateCode, ratePercent, validFrom, isActive）
  - pageSize clamp（最大200）
  - keyword 正規化（trim、空→undefined）
  - _Requirements: 1.3, 1.4, 1.5_

- [x] 4.3 TaxRate BFF Controller を実装する
  - GET /api/bff/master-data/tax-rate: 一覧取得
  - GET /api/bff/master-data/tax-rate/:id: 詳細取得
  - POST /api/bff/master-data/tax-rate: 新規登録
  - PUT /api/bff/master-data/tax-rate/:id: 更新
  - PATCH /api/bff/master-data/tax-rate/:id/deactivate: 無効化
  - PATCH /api/bff/master-data/tax-rate/:id/activate: 有効化
  - Clerk認証からuser_id解決、tenant_id伝搬
  - Domain API エラーをそのまま返却（Pass-through）
  - _Requirements: 1.1, 2.1, 3.1, 4.2_

---

## 5. UI（apps/web）- Phase 1: v0 統制テスト

- [x] 5.1 Feature 骨格と Mock Client を作成する
  - `apps/web/src/features/master-data/tax-rate/` ディレクトリ構成
  - BffClient インターフェース、MockBffClient、HttpBffClient を作成
  - bff-contracts.ts で BFF DTO 型を定義
  - _Requirements: 1.1_

- [x] 5.2 TaxRateList コンポーネントを作成する
  - DataTable 形式の一覧表示
  - 列: 税率コード、税率（%）、適用開始日、適用終了日、有効フラグ
  - 検索フィルタ（税率コード、有効フラグ）
  - ページネーション（デフォルト20件/ページ）
  - ソート機能（税率コード、適用開始日、税率）
  - 行クリックで編集ダイアログ表示
  - MockBffClient で動作確認
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 4.4_

- [x] 5.3 TaxRateDialog コンポーネントを作成する
  - 新規登録モード: 全フィールド入力可能
  - 編集モード: 税率コード・税率値は読み取り専用
  - 入力項目: 税率コード（必須）、税率（必須、小数点以下2桁）、適用開始日（必須）、適用終了日（任意）、有効フラグ
  - バリデーションエラー表示
  - MockBffClient で動作確認
  - _Requirements: 2.1, 2.2, 3.1, 3.2, 3.3, 3.4_

- [ ] 5.4 権限に基づく UI 制御を実装する
  - procure.tax-rate.read 権限がない場合、一覧表示不可
  - procure.tax-rate.create 権限がない場合、新規登録ボタン非表示
  - procure.tax-rate.update 権限がない場合、編集・無効化・有効化ボタン非表示
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

---

## 6. UI（apps/web）- Phase 2: 本実装

- [x] 6.1 HttpBffClient に切り替え、実 BFF 接続を行う
  - MockBffClient から HttpBffClient に切り替え
  - 実際の BFF エンドポイントを呼び出す
  - エラーハンドリング（TAX_RATE_CODE_DUPLICATE, INVALID_DATE_RANGE 等）をユーザーフレンドリーに表示
  - _Requirements: 2.4, 2.5, 3.5_

- [x] 6.2 Page コンポーネントとルーティングを設定する
  - `apps/web/src/app/master-data/tax-rate/page.tsx` を作成
  - TaxRateList と TaxRateDialog を配置
  - サイドメニューに税率マスタのリンクを追加
  - _Requirements: 1.1_

---

## 7. 統合テスト / 動作確認

- [ ] 7.1 E2E テストシナリオを実行する
  - 税率一覧表示の確認
  - 税率新規登録の確認（正常系、重複エラー、日付範囲エラー）
  - 税率編集の確認（税率値変更禁止の確認）
  - 税率無効化・有効化の確認
  - ページネーション・ソート・検索の確認
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 4.1, 4.2, 4.3, 4.4_

- [ ] 7.2 マルチテナント分離の確認
  - 異なるテナントのデータが参照できないことを確認
  - RLS ポリシーの動作確認
  - _Requirements: 6.1, 6.2_

- [ ] 7.3 権限制御の確認
  - 権限のないユーザーが API を直接呼び出した場合に 403 エラーが返却されることを確認
  - UI での権限に基づく表示制御の確認
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

---

## Requirements Coverage

| Requirement | Tasks |
|-------------|-------|
| 1.1–1.5 | 1.1, 1.2, 3.2, 3.3, 3.4, 4.2, 4.3, 5.1, 5.2, 6.2, 7.1 |
| 2.1–2.7 | 1.1, 1.2, 1.3, 3.3, 3.4, 4.3, 5.3, 6.1, 7.1 |
| 3.1–3.6 | 1.1, 1.2, 1.3, 3.3, 3.4, 4.3, 5.3, 6.1, 7.1 |
| 4.1–4.4 | 1.1, 1.2, 3.3, 3.4, 4.3, 5.2, 7.1 |
| 5.1–5.5 | 2.1, 2.3 |
| 6.1–6.4 | 2.1, 2.2, 3.1, 3.2, 3.3, 4.1, 7.2 |
| 7.1–7.5 | 3.4, 5.4, 7.3 |
