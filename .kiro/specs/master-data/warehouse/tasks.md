# Implementation Plan: 倉庫マスタ (Warehouse Master)

> CCSDD / SDD 前提：**contracts-first**（bff → api → shared）を最優先し、境界違反を guard で止める。
> UI は最後。v0 は **Phase 1（統制テスト）→ Phase 2（本実装）** の二段階で扱う。

---

## 0. Design Completeness Gate（Blocking）

> Implementation MUST NOT start until all items below are checked.

- [x] 0.1 Designの「BFF Specification（apps/bff）」が埋まっている
  - BFF endpoints が記載されている
  - Request/Response DTO が列挙されている
  - Paging/Sorting正規化が明記されている
  - 変換（api DTO → bff DTO）の方針が記載されている
  - エラー整形方針（Pass-through）が記載されている
  - tenant_id/user_id の取り回しが記載されている

- [x] 0.2 Designの「Service Specification（Domain / apps/api）」が埋まっている
  - Usecase が列挙されている
  - ビジネスルールの所在が記載されている
  - トランザクション境界が記載されている
  - 監査ログ記録ポイントが記載されている

- [x] 0.3 Designの「Repository Specification（apps/api）」が埋まっている
  - 取得・更新メソッド一覧が記載されている
  - where句二重ガードの方針が記載されている
  - RLS前提が記載されている

- [x] 0.4 Designの「Contracts Summary（This Feature）」が埋まっている
  - packages/contracts/src/bff 側のDTOが列挙されている
  - packages/contracts/src/api 側のDTOが列挙されている
  - 「UIは packages/contracts/src/api を参照しない」ルールが明記されている

- [x] 0.5 Requirements Traceability が更新されている

- [ ] 0.6 v0生成物の受入・移植ルールが確認されている（UI実装時に確認）

- [ ] 0.7 Structure / Boundary Guard がパスしている（実装完了時に確認）

---

## 1. Contracts 確認・補完

- [x] 1.1 BFF契約の確認
  - `packages/contracts/src/bff/warehouse/index.ts` が存在し、設計と整合していることを確認
  - ListWarehousesRequest/Response, CreateWarehouseRequest/Response 等が定義済み
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 3.1, 4.1, 5.1_

- [x] 1.2 API契約の確認
  - `packages/contracts/src/api/warehouse/index.ts` が存在し、設計と整合していることを確認
  - offset/limit ベースのリクエスト形式
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 3.1, 4.1, 5.1_

- [x] 1.3 エラー定義の確認
  - `packages/contracts/src/api/errors/warehouse-error.ts` が存在
  - `packages/contracts/src/bff/errors/warehouse-error.ts` が存在
  - エラーコード、HTTPステータス、メッセージが定義済み
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

---

## 2. DB / Migration

- [x] 2.1 Prismaスキーマの確認
  - `packages/db/prisma/schema.prisma` に Warehouse, WarehouseGroup モデルが定義済み
  - tenant_id、監査列、楽観ロック用 version が含まれている
  - インデックス（warehouseCode, warehouseName, warehouseNameKana, displayOrder, isActive）が定義済み
  - _Requirements: 7.1, 7.2, 7.3_

- [ ] 2.2 マイグレーション実行
  - `prisma migrate dev` でマイグレーションを生成・適用
  - テーブル warehouses, warehouse_groups が作成されることを確認
  - _Requirements: 7.1_

---

## 3. Domain API（apps/api）

- [ ] 3.1 (P) Repository 実装
  - 倉庫データのCRUD操作を提供する Repository を実装
  - findMany: 一覧取得（キーワード検索、ソート、ページング対応）
  - findOne: 単一取得
  - findByCode: コードによる検索
  - findDefaultReceiving: 既定受入倉庫の取得
  - create: 新規登録
  - update: 更新（楽観ロック）
  - checkCodeDuplicate: コード重複チェック
  - 全メソッドで tenant_id を必須パラメータとし、WHERE句に含める（二重ガード）
  - _Requirements: 7.1, 7.2, 7.3_

- [ ] 3.2 (P) Service 実装
  - 倉庫マスタのビジネスロジックを実装
  - 一覧取得: Repository呼び出し、DTO変換
  - 詳細取得: 存在チェック、DTO変換
  - 新規登録: コードバリデーション（形式・長さ・文字種・重複）、監査情報設定
  - 更新: コード変更禁止、楽観ロック、監査情報更新
  - 無効化: 既定受入倉庫の無効化禁止チェック
  - 有効化: 状態更新
  - 既定受入倉庫設定: 既存既定の解除と新規設定を1トランザクションで実行
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.3, 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 3.3 Controller 実装
  - RESTエンドポイントを実装（Service依存）
  - GET /api/master-data/warehouses: 一覧取得
  - GET /api/master-data/warehouses/:id: 詳細取得
  - POST /api/master-data/warehouses: 新規登録
  - PUT /api/master-data/warehouses/:id: 更新
  - POST /api/master-data/warehouses/:id/deactivate: 無効化
  - POST /api/master-data/warehouses/:id/activate: 有効化
  - POST /api/master-data/warehouses/:id/set-default-receiving: 既定設定
  - tenant_id/user_id をヘッダーから取得してServiceに伝搬
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1_

- [ ] 3.4 Module登録
  - WarehouseModule を作成し、AppModule に登録
  - Controller, Service, Repository を Provider として登録
  - _Requirements: N/A（インフラ）_

---

## 4. BFF（apps/bff）

- [ ] 4.1 (P) Mapper 実装
  - API DTO → BFF DTO の変換ロジックを実装
  - WarehouseApiDto → WarehouseDto のマッピング
  - totalPages の計算（Math.ceil(total / pageSize)）
  - _Requirements: 1.4_

- [ ] 4.2 (P) Service 実装
  - Domain API 呼び出しとレスポンス変換を実装
  - page/pageSize → offset/limit 変換
  - sortBy whitelist 検証
  - keyword 正規化（trim、空→undefined）
  - pageSize clamp（max 200）
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 4.3 Controller 実装
  - UI向けエンドポイントを実装（Service依存）
  - GET /api/bff/master-data/warehouses: 一覧取得
  - GET /api/bff/master-data/warehouses/:id: 詳細取得
  - POST /api/bff/master-data/warehouses: 新規登録
  - PUT /api/bff/master-data/warehouses/:id: 更新
  - POST /api/bff/master-data/warehouses/:id/deactivate: 無効化
  - POST /api/bff/master-data/warehouses/:id/activate: 有効化
  - POST /api/bff/master-data/warehouses/:id/set-default-receiving: 既定設定
  - tenant_id/user_id をClerk JWTから解決してDomain APIに伝搬
  - エラーは Pass-through でそのまま返却
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1_

- [ ] 4.4 Module登録
  - WarehouseModule を作成し、AppModule に登録
  - _Requirements: N/A（インフラ）_

---

## 5. UI Phase 1: MockBffClient 動作確認

- [ ] 5.1 (P) BffClient インターフェース定義
  - 倉庫マスタ用のBffClientインターフェースを定義
  - listWarehouses, getWarehouse, createWarehouse, updateWarehouse, deactivateWarehouse, activateWarehouse, setDefaultReceivingWarehouse
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1_

- [ ] 5.2 (P) MockBffClient 実装
  - モックデータによる動作確認用クライアントを実装
  - 一覧取得: ページング、ソート、キーワード検索のシミュレーション
  - CRUD操作: 成功/エラーのシミュレーション
  - 既定受入倉庫設定: 既存既定の自動解除をシミュレーション
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 3.1, 4.1, 5.1, 5.2_

- [ ] 5.3 倉庫一覧画面の実装
  - 倉庫一覧を表示するページコンポーネントを実装
  - カナ検索（インクリメンタル、デバウンス200ms）
  - ソート（倉庫コード、倉庫名、表示順、有効/無効）
  - 「無効を含む」フィルタ
  - 既定受入倉庫フラグの表示
  - 新規登録ボタン、編集ボタン、無効化/有効化ボタン、既定設定ボタン
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 5.4 倉庫登録・編集ダイアログの実装
  - 倉庫の登録・編集用ダイアログコンポーネントを実装
  - 入力フィールド: 倉庫コード（登録時のみ編集可）、倉庫名、倉庫名カナ、住所（分割形式）、電話番号、表示順、備考、既定受入倉庫フラグ
  - バリデーション: 必須チェック、コード形式チェック
  - 保存・キャンセルボタン
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 6.1, 6.2, 6.6, 6.7_

- [ ] 5.5 MockBffClient での動作確認
  - 一覧表示、検索、ソートが動作することを確認
  - 登録・編集・無効化・有効化が動作することを確認
  - 既定受入倉庫設定が動作することを確認
  - エラー表示（コード重複、競合更新）が動作することを確認
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 6.3_

---

## 6. UI Phase 2: 本実装

- [ ] 6.1 HttpBffClient 実装
  - 実際のBFF APIを呼び出すクライアントを実装
  - エラーハンドリング（エラーコードからメッセージへの変換）
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1_

- [ ] 6.2 BffClient切り替え
  - MockBffClient → HttpBffClient に切り替え
  - 環境変数またはフラグによる切り替え対応
  - _Requirements: N/A（インフラ）_

- [ ] 6.3 ナビゲーションメニュー登録
  - `apps/web/src/shared/navigation/menu.ts` に倉庫マスタを追加
  - パス: /master-data/warehouse
  - アイコン: Warehouse（lucide-react）
  - _Requirements: N/A（UX）_

- [ ] 6.4 ルーティング設定
  - `apps/web/src/app/master-data/warehouse/page.tsx` を作成
  - WarehousePage コンポーネントをレンダリング
  - _Requirements: N/A（インフラ）_

---

## 7. 統合テスト・検証

- [ ] 7.1 E2E動作確認
  - Web → BFF → API → DB の全レイヤーを通した動作確認
  - 一覧取得、検索、ソート、ページング
  - 登録、編集、無効化、有効化
  - 既定受入倉庫設定（既存既定の自動解除を含む）
  - 楽観ロックによる競合エラー
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.3_

- [ ] 7.2 テナント分離確認
  - 異なるテナントのデータが混在しないことを確認
  - tenant_id による RLS フィルタが正しく動作することを確認
  - _Requirements: 7.1, 7.2, 7.3_

- [ ] 7.3 Structure Guard 実行
  - `npx tsx scripts/structure-guards.ts` を実行
  - UI → Domain API の直接呼び出しがないことを確認
  - UIでの直接 fetch() がないことを確認
  - BFFがDBへ直接アクセスしていないことを確認
  - _Requirements: N/A（品質保証）_

---

## Requirements Coverage Matrix

| Requirement | Tasks |
|-------------|-------|
| 1.1 | 1.1, 1.2, 3.1, 3.2, 3.3, 4.2, 4.3, 5.1, 5.2, 5.3, 6.1, 7.1 |
| 1.2 | 1.1, 1.2, 4.2, 5.2, 5.3, 7.1 |
| 1.3 | 1.1, 1.2, 4.2, 5.3, 7.1 |
| 1.4 | 1.1, 1.2, 4.1, 5.2, 5.3, 7.1 |
| 2.1 | 1.1, 1.2, 3.2, 3.3, 4.3, 5.1, 5.2, 5.4, 6.1, 7.1 |
| 2.2 | 1.1, 1.2, 3.2, 5.4, 7.1 |
| 2.3 | 1.1, 1.2, 3.2, 5.4, 7.1 |
| 2.4 | 3.2, 5.4, 7.1 |
| 2.5 | 3.2, 7.1 |
| 2.6 | 3.2, 7.1 |
| 3.1 | 1.1, 1.2, 3.2, 3.3, 4.3, 5.1, 5.2, 5.4, 6.1, 7.1 |
| 3.2 | 3.2, 5.4, 7.1 |
| 3.3 | 3.2, 7.1 |
| 3.4 | 3.2, 7.1 |
| 4.1 | 1.1, 1.2, 3.2, 3.3, 4.3, 5.1, 5.2, 5.5, 6.1, 7.1 |
| 4.2 | 3.2, 7.1 |
| 4.3 | 7.1 |
| 4.4 | 3.2, 7.1 |
| 5.1 | 1.1, 1.2, 3.2, 3.3, 4.3, 5.1, 5.2, 5.5, 6.1, 7.1 |
| 5.2 | 3.2, 5.2, 7.1 |
| 5.3 | 3.2, 7.1 |
| 5.4 | N/A（発注機能スコープ、将来実装） |
| 5.5 | N/A（発注機能スコープ、将来実装） |
| 6.1 | 1.3, 3.2, 5.4 |
| 6.2 | 1.3, 3.2, 5.4 |
| 6.3 | 1.3, 3.2, 5.5 |
| 6.4 | 1.3, 3.2 |
| 6.5 | 1.3, 3.2 |
| 6.6 | 5.4 |
| 6.7 | 5.4 |
| 7.1 | 2.1, 3.1, 7.2 |
| 7.2 | 3.1, 7.2 |
| 7.3 | 3.1, 7.2 |

---

## Deferred Requirements

| Requirement | Reason |
|-------------|--------|
| 5.4 | 発注登録画面での既定受入倉庫自動設定は、発注機能（procurement-flow/purchase-order）の実装時に対応 |
| 5.5 | 発注登録画面での既定未設定時の表示は、発注機能の実装時に対応 |
