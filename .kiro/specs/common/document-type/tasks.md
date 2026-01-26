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
  - 変換（api DTO → bff DTO）の方針が記載されている
  - エラー整形方針（Pass-through）が記載されている
  - tenant_id/user_id の取り回し（解決・伝搬ルール）が記載されている

- [x] 0.2 Designの「Service Specification（Domain / apps/api）」が埋まっている
  - Usecase（listDocumentTypes, listNumberingRules, updateNumberingRule等）が列挙されている
  - 主要ビジネスルールの所在（prefix検証、楽観ロック）が記載されている
  - トランザクション境界が記載されている
  - 監査ログ記録ポイントが記載されている

- [x] 0.3 Designの「Repository Specification（apps/api）」が埋まっている
  - 取得・更新メソッド一覧が記載されている（tenant_id必須）
  - where句二重ガードの方針（tenant_id常時指定）が記載されている
  - RLS前提（set_config前提）が記載されている

- [x] 0.4 Designの「Contracts Summary（This Feature）」が埋まっている
  - packages/contracts/src/bff 側の追加・変更DTOが列挙されている
  - packages/contracts/src/api 側の追加・変更DTOが列挙されている
  - Enum / Error の配置ルールが明記されている
  - 「UIは packages/contracts/src/api を参照しない」ルールが明記されている

- [x] 0.5 Requirements Traceability（必要な場合）が更新されている
  - 主要Requirementが、BFF/API/Repo/Flows等の設計要素に紐づいている

- [ ] 0.6 v0生成物の受入・移植ルールが確認されている
  - v0生成物は必ず `apps/web/_v0_drop/<context>/<feature>/src` に一次格納されている
  - v0出力はそのまま `apps/web/src` に配置されていない
  - v0_drop 配下に **layout.tsx が存在しない**（AppShell以外の殻禁止）
  - UIは MockBffClient で動作確認されている（BFF未接続状態）

- [ ] 0.7 Structure / Boundary Guard がパスしている
  - `npx tsx scripts/structure-guards.ts` が成功している
  - UI → Domain API の直接呼び出しが存在しない

---

## Requirements Coverage

| Req ID | 要件名 | 対応タスク |
|--------|--------|-----------|
| 1 | 伝票種類マスタ（DocumentType） | 1.1, 3, 4.1 |
| 2 | 採番ルール管理（NumberingRule） | 1.2, 3, 4.2, 5.2 |
| 3 | 採番カウンタ管理（NumberCounter） | 3, 4.3 |
| 4 | 伝票番号生成（DocumentNo Generation） | 4.4 |
| 5 | 採番ルール設定UI | 5.3, 6, 7 |
| 6 | 権限・アクセス制御 | 4.2, 5.2, 7.2 |
| 7 | 監査・トレーサビリティ | 3, 4.2 |
| 8 | テナント初期セットアップ | 4.5 |

---

## Implementation Tasks

### 1. Contracts定義

- [ ] 1.1 (P) API Contracts（DocumentType）を定義する
  - 伝票種類の型定義（DocumentTypeKey union type）を作成する
  - 伝票種類DTOと一覧レスポンス型を定義する
  - グローバル参照のため tenant_id を含まない設計とする
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 1.2 (P) API Contracts（NumberingRule / NumberCounter）を定義する
  - 採番設定のEnum型（PeriodKind, SequenceScopeKind）を定義する
  - 採番ルールDTOと一覧/更新リクエスト・レスポンス型を定義する
  - 楽観ロック用のversion項目を含める
  - _Requirements: 2.1, 2.2, 2.7_

- [ ] 1.3 (P) Error Contracts を定義する
  - 伝票種類・採番ルール関連のエラーコードを定義する
  - HTTP ステータスマッピングとメッセージを定義する
  - 楽観ロック競合エラー（CONCURRENT_UPDATE）を含める
  - _Requirements: 2.5, 2.7, 6.3_

- [ ] 1.4 BFF Contracts を定義する
  - API DTOを拡張してBFF用DTOを定義する
  - 伝票種類名（documentTypeName）と採番プレビュー（numberPreview）を追加する
  - ページング情報（page, pageSize, totalPages）を含める
  - _Requirements: 5.8_

### 2. Scaffold / Structure Setup

- [ ] 2. Feature骨格を生成する
  - scaffold-feature スクリプトで common/document-type の骨格を作成する
  - contracts, api, bff, web の各ディレクトリが正しく配置されることを確認する
  - v0_drop ディレクトリが作成されることを確認する

### 3. Database / Migration

- [ ] 3.1 Prismaスキーマにモデルを追加する
  - DocumentType モデルを定義する（グローバル参照、tenant_id なし）
  - DocumentNumberingRule モデルを定義する（テナントスコープ、RLS有効）
  - DocumentNumberCounter モデルを定義する（テナントスコープ、RLS有効）
  - 各CHECK制約とUNIQUE制約を定義する
  - _Requirements: 1.1, 1.2, 2.6, 3.1, 7.3_

- [ ] 3.2 マイグレーションを実行しシードデータを投入する
  - マイグレーションファイルを生成・適用する
  - 固定5種類の伝票種類（PR/RFQ/PO/GR/IR）をシードデータとして投入する
  - 各伝票種類のワークフロー対象フラグを設定する
  - RLSポリシーを有効化する
  - _Requirements: 1.1, 1.4_

### 4. Domain API（apps/api）

- [ ] 4.1 (P) DocumentType の Repository / Service / Controller を実装する
  - グローバル参照のためtenant_idフィルタなしでクエリを実装する
  - 伝票種類一覧取得と単体取得のエンドポイントを作成する
  - is_active フィルタを適用する
  - _Requirements: 1.3, 1.5, 1.6_

- [ ] 4.2 (P) NumberingRule の Repository / Service / Controller を実装する
  - テナントスコープのCRUD操作を実装する
  - prefix形式の検証（英大文字1文字）を実装する
  - 楽観ロックによる同時更新競合検出を実装する
  - 更新時の監査ログ記録を実装する
  - 権限チェック（procure.numbering-rule.read/update）を実装する
  - _Requirements: 2.1, 2.4, 2.5, 2.6, 2.7, 6.1, 6.2, 6.3, 7.1, 7.2_

- [ ] 4.3 NumberCounter の Repository / Service を実装する
  - 採番カウンタの遅延作成（INSERT→ON CONFLICT）を実装する
  - COMPANY スコープ時の固定UUID使用を実装する
  - DEPARTMENT スコープ時の department_stable_id 使用を実装する
  - アトミックなカウンタ更新（UPDATE + RETURNING）を実装する
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

- [ ] 4.4 DocumentNo Service を実装する
  - 伝票番号生成ロジックを実装する
  - prefix + 部門記号（任意）+ 期間（任意）+ SEQ（8桁）の結合を実装する
  - 期間形式（YY/YYMM/NONE）に応じた文字列生成を実装する
  - 区切り文字なしで結合する
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

- [ ] 4.5 テナント初期セットアップ機能を実装する
  - 新規テナント作成時に推奨採番ルールを自動作成する
  - 各伝票種類の初期値（prefix, include_dept, period_kind, scope）を設定する
  - 既存テナントへの影響がないことを確認する
  - _Requirements: 8.1, 8.2_

### 5. BFF（apps/bff）

- [ ] 5.1 (P) DocumentType の Controller / Service を実装する
  - 伝票種類一覧をDomain APIから取得して返却する
  - グローバル参照のためtenant_id不要、認証のみ必須とする
  - _Requirements: 1.6_

- [ ] 5.2 NumberingRule の Controller / Service / Mapper を実装する
  - ページング正規化（page→offset/limit変換）を実装する
  - sortBy ホワイトリスト検証を実装する
  - API DTOからBFF DTOへの変換を実装する
  - documentTypeName と numberPreview を付加する
  - tenant_id / user_id をヘッダーで Domain API に伝搬する
  - エラーをPass-throughで透過する
  - _Requirements: 2.3, 5.8, 6.1, 6.2_

- [ ] 5.3 Domain API Client を実装する
  - 伝票種類一覧取得のクライアントメソッドを実装する
  - 採番ルール一覧/詳細/更新のクライアントメソッドを実装する
  - HTTPヘッダー（x-tenant-id, x-user-id）を設定する
  - _Requirements: 5.1, 5.2, 5.6_

### 6. UI Phase 1: v0統制テスト

- [ ] 6.1 MockBffClient を実装する
  - 伝票種類一覧のモックデータを返却する
  - 採番ルール一覧/詳細/更新のモックを実装する
  - 楽観ロック競合のシミュレーションを実装する
  - _Requirements: 5.1, 5.2, 5.7_

- [ ] 6.2 採番ルール一覧画面を実装する
  - 伝票種類ごとの採番ルール一覧を表示する
  - 現在の設定値（prefix, period_kind, sequence_scope_kind）を表示する
  - 採番プレビューを表示する
  - _Requirements: 5.1, 5.8_

- [ ] 6.3 採番ルール編集ダイアログを実装する
  - prefix 入力欄（英大文字1文字制限）を実装する
  - period_kind ドロップダウン（なし/年/年月）を実装する
  - sequence_scope_kind ドロップダウン（全社連番/部門別連番）を実装する
  - include_department_symbol チェックボックスを実装する
  - _Requirements: 5.2, 5.3, 5.4, 5.5_

### 7. UI Phase 2: 本実装

- [ ] 7.1 HttpBffClient を実装する
  - BFF エンドポイントへの実際のHTTP呼び出しを実装する
  - エラーハンドリングを実装する
  - _Requirements: 5.6, 5.7_

- [ ] 7.2 権限に応じたUI制御を実装する
  - 編集権限がない場合は編集ボタンを非表示にする
  - 楽観ロック競合時のエラー表示とリロード促しを実装する
  - 保存成功時のメッセージ表示を実装する
  - _Requirements: 5.6, 5.7, 6.4_

- [ ] 7.3 ナビゲーションメニューに登録する
  - 採番ルール設定画面をナビゲーションに追加する
  - 適切なカテゴリ（共通設定など）に配置する
  - _Requirements: 5.1_

### 8. Integration & Verification

- [ ] 8.1 E2E統合テストを実施する
  - 採番ルール一覧表示から編集・保存までの一連の操作を確認する
  - 楽観ロック競合時の動作を確認する
  - 権限なしユーザーでのアクセス制限を確認する
  - _Requirements: 5.6, 5.7, 6.3, 6.4_

- [ ] 8.2 Structure Guard を実行する
  - `npx tsx scripts/structure-guards.ts` を実行する
  - UI → Domain API の直接呼び出しがないことを確認する
  - UI が packages/contracts/src/api を参照していないことを確認する
