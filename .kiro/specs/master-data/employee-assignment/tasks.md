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
    - 所属一覧は社員単位での取得のため、ページングは不要（件数が限定的）
    - ソートは固定: 有効開始日（effectiveDate）降順
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
    - API: `packages/contracts/src/api/errors/employee-assignment-error.ts`
    - BFF: `packages/contracts/src/bff/errors/employee-assignment-error.ts`（API側を re-export）
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

- [ ] 0.7 Structure / Boundary Guard がパスしている
  - `npx tsx scripts/structure-guards.ts` が成功している
  - UI → Domain API の直接呼び出しが存在しない
  - UIでの直接 fetch() が存在しない（HttpBffClient 例外のみ）
  - BFFがDBへ直接アクセスしていない

---

## 1. Contracts 定義

- [x] 1.1 (P) API エラー契約を定義する
  - 所属管理に必要なエラーコード（重複主務、期間不正、楽観ロック等）を定義
  - HTTP ステータスコードとエラーメッセージの対応を設定
  - 既存の employee-master-error.ts パターンに従う
  - _Requirements: 1.4, 1.8, 3.3, 6.4_

- [x] 1.2 (P) API 契約（DTO）を定義する
  - 所属情報のAPI DTO（登録・更新・削除・一覧取得）を定義
  - 所属種別（主務/兼務）の型定義
  - 有効期間と按分率のデータ型を定義
  - 楽観ロック用の version フィールドを含める
  - _Requirements: 1.1, 1.2, 1.5, 1.6, 1.7, 3.2, 6.1, 6.2_

- [x] 1.3 BFF 契約（DTO）を定義する
  - UI向けの所属情報 DTO を定義（部門名解決済み、現在有効フラグ付き）
  - 所属種別のラベル変換（primary → 主務、secondary → 兼務）を含む
  - 有効部門選択用の DTO を定義
  - 1.2 の API 契約完成後に実施
  - _Requirements: 2.1, 2.2, 2.3, 5.1, 5.2, 5.4_

- [x] 1.4 BFF エラー契約を定義する
  - API エラー契約を re-export（Pass-through 方針）
  - 1.1 の API エラー契約完成後に実施
  - _Requirements: 1.4, 1.8, 3.3, 6.4_

- [x] 1.5 Contracts index に export を追加する
  - api/errors/index.ts に employee-assignment-error を追加
  - bff/errors/index.ts に employee-assignment-error を追加
  - 1.1〜1.4 完了後に実施
  - _Requirements: 1.4, 1.8, 3.3, 6.4_

---

## 2. DB / Migration / RLS

- [x] 2.1 Prisma スキーマに EmployeeAssignment モデルを追加する
  - 所属情報のモデル定義（テナントID、社員ID、部門 stable_id、所属種別、按分率、役職、有効期間、論理削除フラグ）
  - Employee モデルへのリレーション追加
  - インデックス定義（テナント+社員、テナント+有効開始日）
  - _Requirements: 8.1, 8.2_

- [x] 2.2 マイグレーションを作成・実行する
  - テーブル作成 SQL を生成
  - RLS ポリシー設定（tenant_isolation）
  - チェック制約（所属種別、期間整合性、按分率範囲）
  - 外部キー制約（employees への参照）
  - _Requirements: 8.1, 8.2_

---

## 3. Domain API 実装

- [x] 3.1 Repository を実装する
  - 社員別の所属一覧取得（論理削除除外）
  - 所属情報の取得・作成・更新・論理削除
  - 主務重複チェック用のメソッド
  - tenant_id による二重ガードを徹底
  - _Requirements: 2.4, 4.1, 4.2, 8.1, 8.2_

- [x] 3.2 Service を実装する
  - 所属登録（主務重複チェック、期間整合性チェック、按分率範囲チェック）
  - 所属更新（楽観ロック、主務変更時の重複チェック）
  - 所属削除（論理削除、監査ログ記録）
  - 社員・部門の存在チェック
  - _Requirements: 1.1, 1.3, 1.4, 1.5, 1.7, 1.8, 3.2, 3.3, 3.4, 4.1, 4.4, 6.3, 6.4_

- [x] 3.3 Controller を実装する
  - 所属一覧取得エンドポイント（社員ID指定）
  - 所属登録エンドポイント
  - 所属更新エンドポイント
  - 所属削除エンドポイント
  - _Requirements: 1.1, 2.1, 3.1, 4.1_

- [x] 3.4 Module を登録する
  - EmployeeAssignmentModule を作成
  - AppModule に登録
  - _Requirements: 1.1_

---

## 4. BFF 実装

- [x] 4.1 Domain API Client を実装する
  - Domain API への HTTP クライアント
  - tenant_id / user_id のヘッダー伝搬
  - _Requirements: 8.2_

- [x] 4.2 Mapper を実装する
  - API DTO から BFF DTO への変換
  - 部門 stable_id から部門名・部門コードの解決
  - 所属種別のラベル変換（primary → 主務、secondary → 兼務）
  - 現在有効フラグ（isCurrent）の計算
  - _Requirements: 2.2, 2.3, 5.4_

- [x] 4.3 Service を実装する
  - 所属一覧取得（部門名解決を含む）
  - 所属登録・更新・削除の中継
  - 有効部門一覧取得（組織マスタ API 連携）
  - _Requirements: 2.1, 5.1, 5.3_

- [x] 4.4 Controller を実装する
  - 社員別所属一覧取得エンドポイント
  - 所属登録エンドポイント
  - 所属更新エンドポイント
  - 所属削除エンドポイント
  - 有効部門一覧取得エンドポイント
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1_

- [x] 4.5 Module を登録する
  - EmployeeAssignmentModule を作成
  - AppModule に登録
  - _Requirements: 1.1_

---

## 5. UI 実装

- [x] 5.1 BffClient インターフェースに所属 API を追加する
  - 所属一覧取得メソッド
  - 所属登録・更新・削除メソッド
  - 有効部門一覧取得メソッド
  - _Requirements: 7.2, 7.3, 7.5_

- [x] 5.2 (P) MockBffClient を実装する
  - 所属一覧のモックデータ
  - 登録・更新・削除のモック応答
  - 有効部門一覧のモックデータ
  - 開発時の動作確認用
  - _Requirements: 7.2, 7.3, 7.5_

- [x] 5.3 HttpBffClient を実装する
  - BFF エンドポイントへの実際の HTTP 呼び出し
  - 5.1 のインターフェース実装
  - _Requirements: 7.2, 7.3, 7.5_

- [x] 5.4 社員詳細ダイアログを作成する
  - タブ構造（基本情報タブ、所属情報タブ）
  - 既存の EmployeeFormDialog をベースに拡張
  - EmployeeDetailDialog.tsx, BasicInfoTab.tsx, AssignmentTab.tsx を作成
  - _Requirements: 7.1, 7.2_

- [x] 5.5 所属一覧コンポーネントを作成する
  - 所属履歴の一覧表示（部門名、所属種別、役職、有効期間、按分率）
  - 有効開始日降順でソート
  - 現在有効レコードの視覚的識別（バッジ表示）
  - 新規登録ボタン、編集・削除ボタン
  - AssignmentList.tsx を作成
  - _Requirements: 2.1, 2.2, 2.3, 7.2, 7.3, 7.5_

- [x] 5.6 所属登録/編集ダイアログを作成する
  - 部門選択（ツリー形式）
  - 所属種別選択（主務/兼務）
  - 有効開始日・終了日入力
  - 役職・按分率入力
  - バリデーション（必須項目、日付整合性、按分率範囲）
  - AssignmentFormDialog.tsx を作成
  - _Requirements: 1.1, 1.2, 1.5, 1.6, 3.1, 3.5, 5.2, 5.3, 6.1, 6.2_

- [x] 5.7 部門選択コンポーネントを作成する
  - 有効部門のドロップダウン表示（階層インデント付き）
  - 部門選択時の stable_id 取得
  - DepartmentSelector.tsx を作成
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 5.8 削除確認ダイアログを実装する
  - 削除対象の詳細情報を表示
  - 削除確定時のAPI呼び出し
  - AssignmentTab.tsx 内に AlertDialog として実装
  - _Requirements: 4.3_

- [x] 5.9 エラーハンドリングを実装する
  - APIエラーの表示（Alert コンポーネント）
  - バリデーションエラーの表示
  - toast による成功/失敗通知
  - _Requirements: 1.4, 1.8, 3.3, 6.4_

- [ ] 5.10 権限に応じた UI 制御を実装する
  - 権限に応じた操作ボタンの表示/非表示
  - read/create/update/delete 権限の確認
  - _Requirements: 9.1, 9.2, 9.3_

---

## 6. 統合・検証

- [ ] 6.1 Structure Guard を実行する
  - `npx tsx scripts/structure-guards.ts` の実行
  - 境界違反がないことを確認
  - _Requirements: 8.1, 8.2_

- [ ] 6.2 動作確認を実施する
  - 所属一覧の表示
  - 所属の登録・編集・削除
  - 主務重複エラーの確認
  - 楽観ロックエラーの確認
  - tenant_id によるデータ分離の確認
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 8.1, 8.2_

---

## Requirements Coverage

| Requirement | Tasks |
|-------------|-------|
| 1.1 | 1.2, 3.2, 3.3, 3.4, 4.4, 4.5, 5.6 |
| 1.2 | 1.2, 5.6 |
| 1.3 | 3.2 |
| 1.4 | 1.1, 1.4, 3.2, 5.9 |
| 1.5 | 1.2, 3.2, 5.6 |
| 1.6 | 1.2, 5.6 |
| 1.7 | 1.2, 3.2 |
| 1.8 | 1.1, 1.4, 3.2, 5.9 |
| 2.1 | 1.3, 4.3, 4.4, 5.5, 6.2 |
| 2.2 | 1.3, 4.2, 5.5 |
| 2.3 | 1.3, 4.2, 5.5 |
| 2.4 | 3.1 |
| 3.1 | 3.3, 4.4, 5.6, 6.2 |
| 3.2 | 1.2, 3.2 |
| 3.3 | 1.1, 1.4, 3.2, 5.9 |
| 3.4 | 3.2 |
| 3.5 | 5.6 |
| 4.1 | 3.1, 3.3, 4.4, 6.2 |
| 4.2 | 3.1 |
| 4.3 | 5.8 |
| 4.4 | 3.2 |
| 5.1 | 1.3, 4.3, 4.4, 5.7 |
| 5.2 | 1.3, 5.6, 5.7 |
| 5.3 | 4.3, 5.6, 5.7 |
| 5.4 | 1.3, 4.2 |
| 5.5 | - |
| 6.1 | 1.2, 5.6 |
| 6.2 | 1.2, 5.6 |
| 6.3 | 3.2 |
| 6.4 | 1.1, 1.4, 3.2, 5.9 |
| 6.5 | - |
| 7.1 | 5.4 |
| 7.2 | 5.1, 5.2, 5.3, 5.4, 5.5 |
| 7.3 | 5.1, 5.2, 5.3, 5.5 |
| 7.4 | 5.6 |
| 7.5 | 5.1, 5.2, 5.3, 5.5 |
| 8.1 | 2.1, 2.2, 3.1, 6.1, 6.2 |
| 8.2 | 2.1, 2.2, 3.1, 4.1, 6.1, 6.2 |
| 8.3 | 3.2 |
| 8.4 | 3.2 |
| 8.5 | 3.2 |
| 9.1 | 5.10 |
| 9.2 | 5.10 |
| 9.3 | 5.10 |
