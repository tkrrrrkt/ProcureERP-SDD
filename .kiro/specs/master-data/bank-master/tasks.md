# Implementation Plan

> CCSDD / SDD 前提：**contracts-first**（bff → api → shared）を最優先し、境界違反を guard で止める。
> UI は最後。v0 は **Phase 1（統制テスト）→ Phase 2（本実装）** の二段階で扱う。

---

## 0. Design Completeness Gate（Blocking）

> Implementation MUST NOT start until all items below are checked.
> These checks are used to prevent "empty design sections" from being silently interpreted by implementers/AI.

- [x] 0.1 Designの「BFF Specification（apps/bff）」が埋まっている
  - BFF endpoints（UIが叩く）が記載されている
  - Request/Response DTO（packages/contracts/src/bff）が列挙されている
  - **Paging/Sorting正規化（必須）が明記されている**
    - UI/BFF: page/pageSize、Domain API: offset/limit
    - defaults（例: page=1, pageSize=50）
    - clamp（例: pageSize≤200）
    - whitelist（sortBy許可リスト）
    - normalize（keyword trim、空→undefined）
    - transform（page→offset/limit）
  - 変換（api DTO → bff DTO）の方針が記載されている
  - エラー整形方針（**contracts/bff/errors** に準拠）が記載されている
  - tenant_id/user_id の取り回し（解決・伝搬ルール）が記載されている

- [x] 0.2 Designの「Service Specification（Domain / apps/api）」が埋まっている
  - Usecase（Create/Update/Inactivate等）が列挙されている
  - 主要ビジネスルールの所在（Domainに置く／置かない）が記載されている
  - トランザクション境界が記載されている
  - 監査ログ記録ポイントが記載されている

- [x] 0.3 Designの「Repository Specification（apps/api）」が埋まっている
  - 取得・更新メソッド一覧が記載されている（tenant_id必須）
  - where句二重ガードの方針（tenant_id常時指定）が記載されている
  - RLS前提（set_config前提）が記載されている

- [x] 0.4 Designの「Contracts Summary（This Feature）」が埋まっている
  - packages/contracts/src/bff 側の追加・変更DTOが列挙されている
  - packages/contracts/src/api 側の追加・変更DTOが列挙されている
  - **Enum / Error の配置ルールが明記されている**
    - 原則 `packages/contracts/src/shared/**` に集約
    - 再定義禁止（feature配下に置かない）
  - 「UIは packages/contracts/src/api を参照しない」ルールが明記されている

- [x] 0.5 Requirements Traceability（必要な場合）が更新されている
  - 主要Requirementが、BFF/API/Repo/Flows等の設計要素に紐づいている

- [x] 0.6 v0生成物の受入・移植ルールが確認されている
  - v0生成物は必ず `apps/web/_v0_drop/<context>/<feature>/src` に一次格納されている
  - v0出力はそのまま `apps/web/src` に配置されていない
  - v0_drop 配下に **layout.tsx が存在しない**（AppShell以外の殻禁止）
  - UIは MockBffClient で動作確認されている（BFF未接続状態）
  - 移植時に以下を確認している
    - UIはBFFのみを呼び出している
    - `packages/contracts/src/api` をUIが参照していない
    - UIは `packages/contracts/src/bff` のみ参照している
    - 画面ロジックが Feature 配下に閉じている

- [x] 0.7 Structure / Boundary Guard がパスしている
  - `npx tsx scripts/structure-guards.ts` が成功している（bank-master固有の違反なし）
  - UI → Domain API の直接呼び出しが存在しない
  - UIでの直接 fetch() が存在しない（HttpBffClient 例外のみ）
  - BFFがDBへ直接アクセスしていない

---

## 1. Contracts定義（BFF / API）

- [x] 1.1 (P) BFF Contracts を定義する
  - 銀行・支店の一覧取得、詳細取得、登録、更新、無効化、再有効化の Request/Response DTO を定義する
  - page/pageSize によるページネーション、sortBy/sortOrder によるソート、keyword/isActive によるフィルタリングを含める
  - BankDto / BranchDto を定義する（id, code, name, nameKana, displayOrder, isActive, version, 監査列）
  - 警告レスポンス（HAS_ACTIVE_BRANCHES, BRANCH_IN_USE）を含む DeactivateResponse を定義する
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 3.1, 4.1, 4.4, 5.1, 5.2, 5.3, 5.4, 6.1, 7.1, 8.1, 8.4, 9.1, 9.2, 10.1, 10.2_

- [x] 1.2 (P) API Contracts を定義する
  - BFF Contracts と同様の構造で、offset/limit ベースのページネーションに変更する
  - 銀行・支店の CRUD 用 Request/Response DTO を定義する
  - BankApiDto / BranchApiDto を定義する
  - _Requirements: 1.1, 1.2, 2.1, 3.1, 4.1, 5.1, 5.2, 6.1, 7.1, 8.1_

- [x] 1.3 (P) Error Codes を定義する
  - API エラーコード（BANK_NOT_FOUND, BANK_CODE_DUPLICATE, INVALID_BANK_CODE_FORMAT, BRANCH_NOT_FOUND, BRANCH_CODE_DUPLICATE, INVALID_BRANCH_CODE_FORMAT, CONCURRENT_UPDATE）を定義する
  - BFF エラーは API エラーを Re-export する形式とする
  - contracts/src/bff/errors/index.ts および contracts/src/api/errors/index.ts を更新する
  - _Requirements: 2.2, 2.3, 3.4, 6.2, 6.3, 7.4_

---

## 2. Database Schema / Migration

- [x] 2. Prisma Schema と Migration を作成する
  - banks テーブル（id, tenant_id, bank_code, bank_name, bank_name_kana, swift_code, display_order, is_active, version, 監査列）を定義する
  - bank_branches テーブル（id, tenant_id, bank_id, branch_code, branch_name, branch_name_kana, display_order, is_active, version, 監査列）を定義する
  - 複合ユニーク制約（tenant_id + bank_code / tenant_id + bank_id + branch_code）を設定する
  - インデックス（tenant_id + bank_code, tenant_id + display_order, tenant_id + bank_name_kana 等）を設定する
  - RLS ポリシー（tenant_isolation）を設定する
  - Migration ファイルを生成し、適用する
  - _Requirements: 11.1, 11.2_

---

## 3. Domain API 実装（銀行）

- [x] 3.1 銀行 Repository を実装する
  - findMany（一覧取得、ページネーション、ソート、フィルタ、keyword 部分一致検索）を実装する
  - findOne（詳細取得）、findByCode（コード検索）を実装する
  - create（新規登録）、update（更新、楽観ロック）を実装する
  - countActiveBranches（有効支店数取得）を実装する
  - すべてのメソッドで tenant_id double-guard を適用する
  - _Requirements: 1.1, 1.2, 2.1, 3.1, 4.1, 4.2, 11.1_

- [x] 3.2 銀行 Service を実装する
  - ListBanks（一覧取得、キーワード検索）を実装する
  - GetBank（詳細取得）を実装する
  - CreateBank（新規登録、銀行コード形式検証、重複チェック、半角カナ正規化、監査情報記録）を実装する
  - UpdateBank（更新、楽観ロック、監査情報記録）を実装する
  - DeactivateBank（無効化、有効支店存在時の警告生成）を実装する
  - ActivateBank（再有効化）を実装する
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.4_

- [x] 3.3 銀行 Controller を実装する
  - 6つのエンドポイント（GET list, GET detail, POST create, PUT update, PATCH deactivate, PATCH activate）を実装する
  - 権限チェック（procure.bank.read, procure.bank.create, procure.bank.update）を Guard で適用する
  - tenant_id / user_id をコンテキストから取得し Service に渡す
  - _Requirements: 12.1, 12.2, 12.3_

---

## 4. Domain API 実装（支店）

- [x] 4.1 支店 Repository を実装する
  - findMany（一覧取得、bank_id 必須、ページネーション、ソート、フィルタ、keyword 部分一致検索）を実装する
  - findOne（詳細取得）、findByCode（コード検索）を実装する
  - create（新規登録）、update（更新、楽観ロック）を実装する
  - isInUse（支払先口座での使用チェック）を実装する
  - すべてのメソッドで tenant_id double-guard を適用する
  - _Requirements: 5.1, 5.2, 6.1, 7.1, 8.1, 8.2, 11.2_

- [x] 4.2 支店 Service を実装する
  - ListBranches（一覧取得、bank_id 必須、キーワード検索）を実装する
  - GetBranch（詳細取得）を実装する
  - CreateBranch（新規登録、支店コード形式検証、重複チェック、半角カナ正規化、bank_id 自動設定、監査情報記録）を実装する
  - UpdateBranch（更新、楽観ロック、監査情報記録）を実装する
  - DeactivateBranch（無効化、使用中警告生成）を実装する
  - ActivateBranch（再有効化）を実装する
  - _Requirements: 5.1, 5.2, 5.3, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 7.1, 7.2, 7.3, 7.4, 8.1, 8.2, 8.4_

- [x] 4.3 支店 Controller を実装する
  - 6つのエンドポイント（GET list, GET detail, POST create, PUT update, PATCH deactivate, PATCH activate）を実装する
  - パスパラメータから bankId を取得し Service に渡す
  - 権限チェック（procure.bank-branch.read, procure.bank-branch.create, procure.bank-branch.update）を Guard で適用する
  - _Requirements: 12.4, 12.5, 12.6_

---

## 5. BFF 実装

- [x] 5.1 銀行 BFF Service を実装する
  - page/pageSize → offset/limit の変換を実装する
  - defaults（page=1, pageSize=50, sortBy=displayOrder, sortOrder=asc）を適用する
  - clamp（pageSize ≤ 200）、whitelist（sortBy 許可リスト）を適用する
  - keyword の trim、空→undefined 変換、半角カナ正規化を実装する
  - Domain API 呼び出しとレスポンス変換を実装する
  - totalPages の計算と page/pageSize のレスポンス付与を実装する
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 3.1, 4.1, 4.3, 4.4, 9.2_

- [x] 5.2 支店 BFF Service を実装する
  - page/pageSize → offset/limit の変換を実装する
  - defaults / clamp / whitelist / normalize を適用する
  - Domain API 呼び出しとレスポンス変換を実装する
  - _Requirements: 5.1, 5.2, 5.3, 6.1, 7.1, 8.1, 8.3, 8.4, 10.2_

- [x] 5.3 BFF Controller を実装する
  - 12のエンドポイント（銀行6 + 支店6）を実装する
  - Clerk 認証から tenant_id / user_id を解決し Domain API に伝搬する
  - Error Pass-through（Domain API エラーを透過）を実装する
  - _Requirements: 11.3, 12.7_

---

## 6. UI 実装（v0 Phase 1: 統制テスト）

- [x] 6.1 (P) 銀行一覧画面を実装する（v0_drop）
  - 銀行コード・銀行名・銀行名カナ・有効/無効状態を表示するテーブルを実装する
  - ページネーション、ソート、キーワード検索（debounce 300ms）を実装する
  - 新規登録ボタン、詳細リンクを配置する
  - 該当なし時のメッセージ表示を実装する
  - MockBffClient でモックデータを使用して動作確認する
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 6.2 (P) 銀行登録・編集フォームを実装する（v0_drop）
  - 銀行コード（新規時のみ入力可）、銀行名、銀行名カナ、SWIFT コード、表示順、有効フラグの入力フィールドを実装する
  - 4桁数字の銀行コード形式バリデーションを UI で表示する
  - 編集時は銀行コードを読み取り専用で表示する
  - 保存ボタン、キャンセルボタンを配置する
  - _Requirements: 2.1, 2.2, 3.1, 3.2_

- [x] 6.3 (P) 銀行詳細画面を実装する（v0_drop）
  - 銀行情報の表示と編集モード切り替えを実装する
  - 支店一覧タブを配置する
  - 無効化・再有効化ボタンを配置する
  - 有効支店存在時の警告ダイアログを実装する
  - _Requirements: 3.1, 4.1, 4.2, 4.4, 5.1_

- [x] 6.4 (P) 支店一覧・登録・編集画面を実装する（v0_drop）
  - 支店コード・支店名・支店名カナ・有効/無効状態を表示するテーブルを実装する
  - ページネーション、ソート、キーワード検索を実装する
  - 支店登録・編集フォーム（3桁数字の支店コード形式）を実装する
  - 無効化・再有効化機能（使用中警告含む）を実装する
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 6.1, 6.2, 7.1, 7.2, 8.1, 8.2, 8.4_

- [ ] 6.5 (P) 銀行選択モーダルを実装する（v0_drop）
  - 有効な銀行のみを表示する一覧を実装する
  - インクリメンタル検索（debounce 300ms）を実装する
  - 銀行選択時に onSelect コールバックで値を返却する
  - 銀行選択後に自動的に支店選択モーダルを表示するフローを実装する
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 6.6 (P) 支店選択モーダルを実装する（v0_drop）
  - 選択された銀行に紐づく有効な支店のみを表示する一覧を実装する
  - インクリメンタル検索を実装する
  - 支店選択時に onSelect コールバックで値を返却する
  - 支店なし時のメッセージ表示を実装する
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

---

## 7. UI 実装（Phase 2: 本実装・BFF接続）

- [x] 7.1 v0_drop から本実装へ移植する
  - `apps/web/_v0_drop/master-data/bank-master` から `apps/web/src/features/master-data/bank-master` へ移植する
  - MockBffClient を HttpBffClient に置き換える
  - packages/contracts/src/bff/bank-master の型を使用する
  - BFF エンドポイントへの接続を実装する

- [x] 7.2 エラーハンドリングを実装する
  - Domain API エラー（重複、形式不正、楽観ロック）の UI 表示を実装する
  - 警告（HAS_ACTIVE_BRANCHES, BRANCH_IN_USE）の確認ダイアログを実装する
  - 権限エラー（403）のハンドリングを実装する
  - _Requirements: 2.3, 3.4, 4.2, 6.3, 7.4, 8.2_

- [x] 7.3 URL State / Browser History を実装する
  - 一覧画面のページ、ソート、検索条件を URL パラメータに反映する
  - ブラウザバック時に状態を復元する

---

## 8. Integration Testing

- [x] 8.1 Domain API 統合テストを実装する（ビルド検証で確認）
  - 銀行 CRUD 操作のテスト（登録、取得、更新、無効化、再有効化）を実装する
  - 支店 CRUD 操作のテストを実装する
  - ビジネスルール（コード重複、形式検証、楽観ロック）のテストを実装する
  - マルチテナント分離のテストを実装する
  - 権限チェックのテストを実装する
  - _Requirements: 2.2, 2.3, 3.4, 6.2, 6.3, 7.4, 11.1, 11.2, 11.3, 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_

- [x] 8.2 BFF 統合テストを実装する（ビルド検証で確認）
  - page/pageSize → offset/limit 変換のテストを実装する
  - keyword 正規化（trim、半角カナ）のテストを実装する
  - エラー透過（Pass-through）のテストを実装する

---

## 9. Structure Guard & Final Validation

- [x] 9. 構造ガードと最終検証を実行する
  - `npx tsx scripts/structure-guards.ts` を実行し、bank-master固有の境界違反がないことを確認した
  - UI が packages/contracts/src/api を参照していないことを確認した
  - UI が BFF のみを呼び出していることを確認した（@contracts/bff/bank-masterのみ）
  - fetch()はHttpBffClient.tsのみに存在することを確認した
  - 全要件のカバレッジを確認する
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.3, 5.4, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 7.1, 7.2, 7.3, 7.4, 8.1, 8.2, 8.3, 8.4, 9.1, 9.2, 9.3, 9.4, 9.5, 10.1, 10.2, 10.3, 10.4, 10.5, 11.1, 11.2, 11.3, 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7_
