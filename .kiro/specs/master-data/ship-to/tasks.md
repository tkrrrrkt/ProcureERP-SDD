# Implementation Plan: 納入先マスタ（ship-to）

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

## 1. Contracts定義（BFF / API）

- [x] 1. Contracts定義（BFF / API境界の型定義）

- [x] 1.1 (P) BFF Contracts定義
  - 納入先の一覧取得・詳細取得・登録・更新・無効化・有効化に必要なリクエスト/レスポンス型を定義
  - ShipToDto、ListShipTosRequest/Response、CreateShipToRequest/Response等
  - ソートキー（shipToCode, shipToName, shipToNameKana, prefecture, isActive）の型定義
  - ページネーション（page, pageSize, total, totalPages）の型定義
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.2, 3.2_

- [x] 1.2 (P) API Contracts定義
  - Domain API用のリクエスト/レスポンス型を定義
  - BFFとの違い: page/pageSize → offset/limit
  - ShipToApiDto、ListShipTosApiRequest/Response等
  - _Requirements: 1.1, 2.4, 3.2, 4.2, 4.5_

- [x] 1.3 (P) エラーコード定義
  - ship-to-error.ts を API errors に作成
  - SHIP_TO_NOT_FOUND, SHIP_TO_CODE_DUPLICATE, INVALID_SHIP_TO_CODE_FORMAT等
  - INVALID_SHIP_TO_CODE_LENGTH, INVALID_SHIP_TO_CODE_CHARS
  - INVALID_EMAIL_FORMAT, CUSTOMER_SITE_NOT_AVAILABLE, CONCURRENT_UPDATE
  - BFF errors にて Re-export
  - _Requirements: 2.3, 2.5, 3.6, 5.4, 5.5, 8.3_

---

## 2. データベース（Prisma Schema / Migration）

- [x] 2. データベース定義（Prismaスキーマ・マイグレーション）

- [x] 2.1 Prisma Schema定義
  - ShipToモデルを追加（ship_tosテーブル）
  - 全カラム定義（id, tenantId, shipToCode, shipToName, shipToNameKana, customerSiteId, 住所項目, 連絡先項目, isActive, version, 監査列）
  - 複合ユニーク制約（tenantId + shipToCode）
  - インデックス定義（tenantId + shipToCode, tenantId + shipToName, tenantId + isActive, tenantId + customerSiteId）
  - _Requirements: 6.1, 6.2, 7.1, 7.2, 8.1_

- [x] 2.2 マイグレーション実行
  - prisma migrate dev でマイグレーション生成・適用
  - RLSポリシーの設定（tenant_isolation）
  - 動作確認（テーブル作成、インデックス確認）
  - _Requirements: 6.2_

---

## 3. Domain API（Repository / Service / Controller）

- [x] 3. Domain API実装（ビジネスロジック層）

- [x] 3.1 Repository実装
  - ShipToRepositoryを作成
  - findMany（一覧取得、ページネーション・ソート・フィルタ対応）
  - findOne（単一取得）、findByCode（コード検索、重複チェック用）
  - create（新規登録）、update（更新、楽観ロック付き）
  - すべてのメソッドでtenant_id必須、WHERE句二重ガード
  - _Requirements: 6.1, 6.3, 8.1_

- [x] 3.2 コード正規化ユーティリティ
  - 納入先コードの正規化関数を実装
  - trim処理、全角→半角変換、英字→大文字変換
  - 正規化後の形式検証（10桁英数字チェック）
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 3.3 Service実装（CRUD操作）
  - ShipToServiceを作成
  - listShipTos: 一覧取得（キーワード検索、有効/無効フィルタ対応）
  - getShipTo: 詳細取得（存在しない場合はSHIP_TO_NOT_FOUND）
  - createShipTo: 新規登録（コード正規化→重複チェック→保存）
  - updateShipTo: 更新（楽観ロック検証、コード変更不可）
  - _Requirements: 1.1, 1.3, 1.4, 2.3, 2.4, 2.5, 3.2, 3.6, 5.1, 5.2, 5.3_

- [x] 3.4 Service実装（無効化・有効化・監査）
  - deactivateShipTo: 無効化（is_active=false、楽観ロック検証）
  - activateShipTo: 有効化（is_active=true、楽観ロック検証）
  - 監査ログ記録（created_by, updated_by設定）
  - メールアドレス形式チェック
  - _Requirements: 4.2, 4.4, 4.5, 7.1, 7.2, 7.3, 8.2, 8.3_

- [x] 3.5 Controller実装
  - ShipToControllerを作成
  - 6エンドポイント（GET一覧, GET詳細, POST登録, PUT更新, PATCH無効化, PATCH有効化）
  - tenant_id/user_idのヘッダーからの取得・伝搬
  - 権限チェック（procure.ship-to.read/create/update）
  - _Requirements: 1.1, 2.4, 3.2, 4.2, 4.5, 6.3_

- [x] 3.6 Domain APIモジュール登録
  - ShipToModuleを作成しAppModuleに登録
  - 依存関係の注入設定
  - _Requirements: 1.1_

---

## 4. BFF（Controller / Mapper）

- [x] 4. BFF実装（UI向けAPI層）

- [x] 4.1 BFF Mapper実装
  - API DTOとBFF DTOの変換ロジック
  - page/pageSize ↔ offset/limit の変換
  - totalPagesの算出（Math.ceil(total / pageSize)）
  - _Requirements: 1.1, 1.5_

- [x] 4.2 BFF Controller実装
  - ShipToBffControllerを作成
  - 6エンドポイント（UIが叩くBFF API）
  - パラメータ正規化（defaults, clamp, whitelist, normalize, transform）
  - Domain APIへのリクエスト転送・レスポンス変換
  - エラーのPass-through
  - _Requirements: 1.1, 1.3, 1.4, 1.5, 2.4, 3.2, 4.2, 4.5_

- [x] 4.3 BFFモジュール登録
  - ShipToBffModuleを作成しAppModuleに登録
  - Domain API呼び出し用HttpClientの設定
  - _Requirements: 1.1_

---

## 5. UI実装（Phase 1: MockBffClient）

- [ ] 5. UI実装 Phase 1（MockBffClientによる動作確認）

- [ ] 5.1 Feature骨格生成
  - scaffold-feature.ts を実行して配置先を確定
  - apps/web/src/features/master-data/ship-to 配下の構造作成
  - MockBffClient / HttpBffClient / BffClientインターフェース作成
  - _Requirements: 1.1_

- [ ] 5.2 MockBffClient実装
  - 一覧取得（ページネーション・ソート・検索のモック）
  - 詳細取得・登録・更新・無効化・有効化のモック
  - モックデータでUI動作確認可能な状態にする
  - _Requirements: 1.1, 1.3, 1.4, 2.4, 3.2, 4.2, 4.5_

- [ ] 5.3 一覧画面コンポーネント
  - ShipToListページ / ShipToTableコンポーネント
  - 納入先コード・名・住所・連絡先・有効状態の表示
  - ページネーションコントロール
  - ソートヘッダー（コード順デフォルト）
  - 検索入力（debounce 300ms）
  - 有効/無効フィルタ
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 5.4 登録・編集ダイアログ
  - ShipToDialogコンポーネント（新規/編集兼用）
  - 入力項目（コード・名・カナ・住所・連絡先・備考）
  - 納入先コードは新規時のみ入力可、編集時は読み取り専用
  - customerSiteIdは入力不可（将来拡張）
  - バリデーションエラー表示
  - 登録/更新成功時のメッセージ・ダイアログ閉じる
  - _Requirements: 2.1, 2.2, 2.6, 3.1, 3.2, 3.5_

- [ ] 5.5 無効化・有効化機能
  - 無効化確認ダイアログ
  - 有効化ボタン（無効状態の納入先に表示）
  - 楽観ロックエラー表示（「他のユーザーによって更新されています」）
  - _Requirements: 4.1, 4.5, 3.6_

---

## 6. UI実装（Phase 2: BFF接続・統合）

- [ ] 6. UI実装 Phase 2（実BFF接続・E2E統合）

- [ ] 6.1 HttpBffClient実装
  - 実際のBFF APIへの接続実装
  - エラーハンドリング（エラーコードに応じたメッセージ表示）
  - _Requirements: 1.1, 2.4, 3.2, 4.2, 4.5_

- [ ] 6.2 URL State連携
  - 検索キーワード・ページ・ソート順をURL stateで管理
  - ブラウザバック・リロード時の状態復元
  - _Requirements: 1.3, 1.4, 1.5_

- [ ] 6.3 メニュー・ルーティング統合
  - 納入先マスタを独立メニューに追加（マスタ > 納入先マスタ）
  - ルーティング設定（/master-data/ship-to）
  - _Requirements: 1.1_

---

## 7. 統合テスト・境界ガード

- [ ] 7. 統合テスト・境界ガード確認

- [ ] 7.1 Structure Guard確認
  - npx tsx scripts/structure-guards.ts の実行・パス確認
  - UI → Domain API 直接呼び出しがないことを確認
  - UIでの直接 fetch() がないことを確認
  - BFFがDBへ直接アクセスしていないことを確認
  - _Requirements: 6.1, 6.2_

- [ ] 7.2 E2Eテスト（基本フロー）
  - 一覧表示 → 新規登録 → 編集 → 無効化 → 有効化 の一連フロー確認
  - 検索・フィルタ・ページネーション動作確認
  - 楽観ロックエラーの再現確認
  - _Requirements: 1.1, 2.4, 3.2, 4.2, 4.5, 8.3_

---

## Requirements Coverage Summary

| Requirement | Tasks |
|-------------|-------|
| 1.1-1.5 (一覧表示) | 1.1, 1.2, 3.1, 3.3, 4.1, 4.2, 5.3, 6.1, 6.2, 6.3 |
| 2.1-2.6 (新規登録) | 1.1, 1.3, 3.2, 3.3, 5.2, 5.4 |
| 3.1-3.6 (編集) | 1.1, 1.2, 3.3, 3.4, 5.4, 5.5 |
| 4.1-4.5 (無効化) | 1.2, 3.4, 5.2, 5.5 |
| 5.1-5.5 (コード正規化) | 1.3, 3.2 |
| 6.1-6.3 (マルチテナント) | 2.1, 3.1, 3.5, 7.1 |
| 7.1-7.3 (監査列) | 2.1, 3.4 |
| 8.1-8.3 (楽観ロック) | 2.1, 3.1, 3.4, 7.2 |

---

## 実装順序（推奨）

1. **Contracts定義** (1.1, 1.2, 1.3) - 並列実行可能
2. **DB定義** (2.1, 2.2) - 順次実行
3. **Domain API** (3.1 → 3.2 → 3.3 → 3.4 → 3.5 → 3.6)
4. **BFF** (4.1 → 4.2 → 4.3)
5. **UI Phase 1** (5.1 → 5.2 → 5.3 → 5.4 → 5.5)
6. **UI Phase 2** (6.1 → 6.2 → 6.3)
7. **統合テスト** (7.1, 7.2)

---

（以上）
