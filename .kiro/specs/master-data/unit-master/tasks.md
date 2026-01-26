# Implementation Plan: 単位マスタ（Unit Master）

> CCSDD / SDD 前提：**contracts-first**（bff → api → shared）を最優先し、境界違反を guard で止める。
> UI は最後。v0 は **Phase 1（統制テスト）→ Phase 2（本実装）** の二段階で扱う。

---

## 0. Design Completeness Gate（Blocking）

> Implementation MUST NOT start until all items below are checked.

- [ ] 0.1 Designの「BFF Specification（apps/bff）」が埋まっている
  - BFF endpoints（13エンドポイント: groups CRUD, uoms CRUD, suggest）が記載されている
  - Request/Response DTO（packages/contracts/src/bff/unit-master）が列挙されている
  - **Paging/Sorting正規化（必須）が明記されている**
    - UI/BFF: page/pageSize、Domain API: offset/limit
    - defaults: page=1, pageSize=50, sortBy=groupCode/uomCode, sortOrder=asc
    - clamp: pageSize≤200
    - whitelist: UomGroup(groupCode|groupName|isActive), Uom(uomCode|uomName|groupCode|isActive)
    - normalize: keyword trim、空→undefined
    - transform: offset=(page-1)*pageSize, limit=pageSize
  - 変換（api DTO → bff DTO）の方針が記載されている
  - エラー整形方針（Pass-through）が記載されている
  - tenant_id/user_id の取り回しが記載されている

- [ ] 0.2 Designの「Service Specification（Domain / apps/api）」が埋まっている
  - Usecase（UomGroup: List/Get/Create/Update/Activate/Deactivate、Uom: List/Get/Create/Update/Activate/Deactivate/Suggest）が列挙されている
  - 主要ビジネスルール（11項目）が記載されている
  - トランザクション境界（CreateUomGroup: UomGroup+Uom同時作成）が記載されている
  - 監査ログ記録ポイントが記載されている

- [ ] 0.3 Designの「Repository Specification（apps/api）」が埋まっている
  - UomGroup/Uom 取得・更新メソッド一覧が記載されている（tenant_id必須）
  - where句二重ガードの方針（tenant_id常時指定）が記載されている
  - RLS前提（set_config前提）が記載されている

- [ ] 0.4 Designの「Contracts Summary（This Feature）」が埋まっている
  - packages/contracts/src/bff/unit-master のDTOが列挙されている
  - packages/contracts/src/api/unit-master のDTOが列挙されている
  - Error定義（unit-master-error.ts）が明記されている
  - 「UIは packages/contracts/src/api を参照しない」ルールが明記されている

- [ ] 0.5 Requirements Traceability が更新されている
  - 全12要件（51項目）がBFF/API/Repo/Flowsに紐づいている

- [ ] 0.6 v0生成物の受入・移植ルールが確認されている
  - v0生成物は `apps/web/_v0_drop/master-data/unit-master/src` に一次格納
  - UIは MockBffClient で動作確認

- [ ] 0.7 Structure / Boundary Guard がパスしている

---

## 1. Contracts: BFF契約定義

- [x] 1.1 (P) 単位グループ用BFF契約を定義する
  - 単位グループの一覧取得、詳細取得、登録、更新、有効化、無効化の各DTOを定義する
  - ページネーション（page/pageSize）とソート（groupCode/groupName/isActive）をサポートする
  - キーワード検索と有効/無効フィルタをサポートする
  - 基準単位情報（baseUom）を含むレスポンス構造を定義する
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 3.1, 4.1, 4.2_

- [x] 1.2 (P) 単位用BFF契約を定義する
  - 単位の一覧取得、詳細取得、登録、更新、有効化、無効化の各DTOを定義する
  - ページネーションとソート（uomCode/uomName/groupCode/isActive）をサポートする
  - グループフィルタとキーワード検索をサポートする
  - isBaseUomフラグ（基準単位かどうか）を含むレスポンス構造を定義する
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 7.1, 8.1, 8.2_

- [x] 1.3 (P) 単位サジェスト用BFF契約を定義する
  - キーワードによる前方一致検索をサポートする
  - グループ指定による絞り込みをサポートする
  - 最大20件制限を定義する
  - _Requirements: 9.1, 9.2, 9.3_

---

## 2. Contracts: API契約定義

- [x] 2.1 (P) 単位グループ用API契約を定義する
  - BFF契約に対応するAPI側DTOを定義する（offset/limit形式）
  - CreateUomGroupApiResponse で基準単位も返却する構造を定義する
  - 監査カラム（createdByLoginAccountId, updatedByLoginAccountId）を含める
  - _Requirements: 1.1, 2.1, 2.4, 2.5, 3.1, 3.6, 4.1, 4.2_

- [x] 2.2 (P) 単位用API契約を定義する
  - BFF契約に対応するAPI側DTOを定義する（offset/limit形式）
  - uomGroupId による所属グループ参照を含める
  - 監査カラムを含める
  - _Requirements: 5.1, 6.1, 6.5, 7.1, 7.5, 8.1, 8.2, 9.1_

- [x] 2.3 (P) エラーコード定義を作成する
  - UOM_GROUP_NOT_FOUND, UOM_NOT_FOUND（404）を定義する
  - UOM_GROUP_CODE_DUPLICATE, UOM_CODE_DUPLICATE, CONCURRENT_UPDATE（409）を定義する
  - コード形式エラー、コード変更禁止、グループ変更禁止、基準単位エラー、使用中エラー（422）を定義する
  - HTTPステータスコードとエラーメッセージ（日本語）のマッピングを定義する
  - _Requirements: 2.2, 2.3, 3.2, 3.4, 3.5, 6.2, 6.3, 7.2, 7.3, 7.4, 8.3, 8.4_

---

## 3. DB: スキーマ・マイグレーション・RLS

- [x] 3.1 Prismaスキーマを定義する
  - UomGroupモデル（id, tenantId, uomGroupCode, uomGroupName, description, baseUomId, isActive, version, 監査カラム）を定義する
  - Uomモデル（id, tenantId, uomGroupId, uomCode, uomName, uomSymbol, isActive, version, 監査カラム）を定義する
  - UomGroupとUomの相互参照リレーションを定義する
  - テナント＋コードのユニーク制約と各種インデックスを定義する
  - _Requirements: 10.1_

- [x] 3.2 マイグレーションを作成し循環参照制約を設定する
  - uom_groups, uomsテーブルを作成するマイグレーションを生成する
  - 循環参照のFK制約をDEFERRABLE INITIALLY DEFERREDで定義する
  - コード形式のCHECK制約（^[A-Z0-9_-]{1,10}$）を追加する
  - _Requirements: 2.4, 10.1_

- [x] 3.3 RLSポリシーを設定する
  - uom_groupsテーブルにテナント分離ポリシーを適用する
  - uomsテーブルにテナント分離ポリシーを適用する
  - current_setting('app.current_tenant_id')によるフィルタリングを設定する
  - _Requirements: 10.2_

---

## 4. Domain API: 単位グループ機能

- [x] 4.1 単位グループRepositoryを実装する
  - findMany（一覧取得、ソート・フィルタ対応）を実装する
  - findOne（詳細取得）を実装する
  - create（新規作成）を実装する
  - update（更新、楽観ロック対応）を実装する
  - checkCodeDuplicate（コード重複チェック）を実装する
  - すべてのメソッドでtenant_id double-guardを実装する
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 3.1, 4.1, 4.2, 10.1_

- [x] 4.2 単位グループServiceを実装する
  - 一覧取得（キーワード検索、有効/無効フィルタ）を実装する
  - 詳細取得（存在チェック、NOT_FOUNDエラー）を実装する
  - 新規登録（コード形式検証、重複チェック、基準単位同時作成）を実装する
  - 更新（コード変更禁止、基準単位整合性チェック、楽観ロック）を実装する
  - 有効化・無効化（有効単位存在警告含む）を実装する
  - 監査情報（created_by, updated_by）の記録を実装する
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 4.1, 4.2, 4.3, 4.4, 11.1, 11.2, 11.3_

- [x] 4.3 単位グループControllerを実装する
  - 13エンドポイントのうち単位グループ関連6エンドポイントを実装する
  - 権限チェック（procure.unit.read / procure.unit.manage）を実装する
  - tenant_id/user_idのヘッダー取得を実装する
  - _Requirements: 12.1, 12.2, 12.3, 12.4_

---

## 5. Domain API: 単位機能

- [x] 5.1 単位Repositoryを実装する
  - findMany（一覧取得、グループフィルタ・ソート対応）を実装する
  - findOne（詳細取得）を実装する
  - create（新規作成）を実装する
  - update（更新、楽観ロック対応）を実装する
  - checkCodeDuplicate（コード重複チェック）を実装する
  - findByGroupId（グループ内単位取得）を実装する
  - suggest（サジェスト検索、前方一致）を実装する
  - isUsedByItems（品目使用チェック）を実装する
  - すべてのメソッドでtenant_id double-guardを実装する
  - _Requirements: 5.1, 5.2, 5.3, 6.1, 7.1, 8.1, 8.4, 9.1, 9.2, 10.1_

- [x] 5.2 単位Serviceを実装する
  - 一覧取得（グループフィルタ、キーワード検索）を実装する
  - 詳細取得（存在チェック、NOT_FOUNDエラー）を実装する
  - 新規登録（コード形式検証、重複チェック、グループ存在チェック）を実装する
  - 更新（コード変更禁止、グループ変更禁止、楽観ロック）を実装する
  - 有効化・無効化（基準単位無効化禁止、品目使用中チェック）を実装する
  - サジェスト（前方一致、グループ絞り込み、最大20件）を実装する
  - 監査情報の記録を実装する
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.2, 7.3, 7.4, 7.5, 8.1, 8.2, 8.3, 8.4, 8.5, 9.1, 9.2, 9.3, 11.1, 11.2, 11.3_

- [x] 5.3 単位Controllerを実装する
  - 単位関連7エンドポイント（List/Get/Create/Update/Activate/Deactivate/Suggest）を実装する
  - 権限チェックを実装する
  - tenant_id/user_idのヘッダー取得を実装する
  - _Requirements: 12.1, 12.2, 12.3, 12.4_

---

## 6. BFF: 単位マスタBFF実装

- [x] 6.1 BFFマッパーを実装する
  - UomGroupApiDto → UomGroupDto の変換を実装する
  - UomApiDto → UomDto の変換を実装する（isBaseUom算出含む）
  - createdByLoginAccountId → createdBy 等のフィールド名変換を実装する
  - _Requirements: 5.5_

- [x] 6.2 BFFサービスを実装する
  - page/pageSize → offset/limit の変換を実装する
  - sortByのホワイトリストチェックを実装する
  - keywordのtrim・空文字→undefined変換を実装する
  - pageSizeの上限クランプ（≤200）を実装する
  - Domain API呼び出しとレスポンス変換を実装する
  - _Requirements: 1.4, 1.5, 5.4_

- [x] 6.3 BFFコントローラーを実装する
  - 13エンドポイントをBFFとして公開する
  - 認証情報からtenant_id/user_idを解決しDomain APIに伝搬する
  - エラーをPass-throughで返却する
  - _Requirements: 10.3_

---

## 7. UI: Phase 1（v0統制テスト）

- [ ] 7.1 MockBffClientを作成する
  - 単位グループ用モックデータと操作を実装する
  - 単位用モックデータと操作を実装する
  - サジェスト用モックを実装する
  - エラーケースのモックを実装する
  - _Requirements: 1.1, 5.1, 9.1_

- [ ] 7.2 (P) 単位グループ一覧画面を作成する
  - 一覧表示（テーブル形式）を実装する
  - ページネーション制御を実装する
  - ソート機能（groupCode/groupName/isActive）を実装する
  - キーワード検索と有効/無効フィルタを実装する
  - 登録・編集ダイアログへの遷移を実装する
  - MockBffClientで動作確認する
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 7.3 (P) 単位グループ登録・編集画面を作成する
  - 登録フォーム（グループコード、グループ名、説明、基準単位情報）を実装する
  - 編集フォーム（グループ名、説明、基準単位変更）を実装する
  - コード入力制限（英数字大文字+-_、10文字以内）を実装する
  - エラー表示（重複、形式不正等）を実装する
  - 有効化・無効化ボタンを実装する
  - _Requirements: 2.1, 2.2, 3.1, 3.2, 3.3, 4.1, 4.2, 4.3_

- [ ] 7.4 (P) 単位一覧画面を作成する
  - 一覧表示（テーブル形式、基準単位マーク付き）を実装する
  - ページネーション制御を実装する
  - ソート機能（uomCode/uomName/groupCode/isActive）を実装する
  - グループフィルタとキーワード検索を実装する
  - 登録・編集ダイアログへの遷移を実装する
  - MockBffClientで動作確認する
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 7.5 (P) 単位登録・編集画面を作成する
  - 登録フォーム（単位コード、単位名、記号、所属グループ選択）を実装する
  - 編集フォーム（単位名、記号のみ変更可能）を実装する
  - コード入力制限を実装する
  - エラー表示を実装する
  - 有効化・無効化ボタン（基準単位・使用中は無効化不可表示）を実装する
  - _Requirements: 6.1, 6.2, 6.4, 7.1, 7.2, 8.1, 8.2, 8.3, 8.4_

- [ ] 7.6 単位選択コンポーネント（サジェスト）を作成する
  - テキスト入力によるサジェスト表示を実装する
  - デバウンスによる入力制御を実装する
  - グループ指定による絞り込みをサポートする
  - 最大20件表示を実装する
  - _Requirements: 9.1, 9.2, 9.3_

---

## 8. UI: Phase 2（本実装・BFF接続）

- [ ] 8.1 HttpBffClientを実装する
  - 全13エンドポイントへのHTTPリクエストを実装する
  - 認証ヘッダー付与を実装する
  - エラーハンドリング（ステータスコード別）を実装する
  - _Requirements: 10.3_

- [ ] 8.2 v0生成物を本番構造へ移植する
  - _v0_drop から features/master-data/unit-master へ移植する
  - MockBffClient を HttpBffClient に差し替える
  - 不要なv0固有設定を除去する
  - _Requirements: 1.1, 5.1_

- [ ] 8.3 楽観ロック競合時のUI制御を実装する
  - 競合エラー検出時のリトライガイダンス表示を実装する
  - 最新データ再取得フローを実装する
  - _Requirements: 3.5, 7.4_

- [ ] 8.4 ナビゲーション登録を行う
  - shared/navigation/menu.ts に単位マスタメニューを追加する
  - ルート定義を追加する
  - _Requirements: 1.1, 5.1_

---

## 9. 結合・検証

- [ ] 9.1 E2Eテストを作成する
  - 単位グループCRUDシナリオをテストする
  - 単位CRUDシナリオをテストする
  - 循環参照（グループ＋基準単位同時作成）をテストする
  - エラーケース（重複、形式不正、使用中無効化）をテストする
  - _Requirements: 2.4, 8.3, 8.4_

- [ ] 9.2 Structure / Boundary Guardを実行する
  - UI → Domain API の直接呼び出しが存在しないことを確認する
  - UIでの直接 fetch() が存在しないことを確認する
  - BFFがDBへ直接アクセスしていないことを確認する
  - _Requirements: 10.1, 10.2, 10.3_

---

## Requirements Coverage

| Req | Summary | Tasks |
|-----|---------|-------|
| 1.1 | 単位グループ一覧表示 | 1.1, 2.1, 4.1, 4.2, 6.2, 7.1, 7.2, 8.2, 8.4 |
| 1.2 | キーワード検索（グループ） | 1.1, 4.1, 4.2, 7.2 |
| 1.3 | 有効/無効フィルタ | 1.1, 4.1, 4.2, 7.2 |
| 1.4 | ソート（グループ） | 1.1, 6.2, 7.2 |
| 1.5 | ページネーション | 1.1, 6.2, 7.2 |
| 2.1 | 単位グループ登録 | 1.1, 2.1, 4.1, 4.2, 7.3 |
| 2.2 | グループコード形式検証 | 2.3, 4.2, 7.3 |
| 2.3 | グループコード重複検証 | 2.3, 4.2, 7.3 |
| 2.4 | 基準単位同時作成 | 2.1, 3.2, 4.2, 9.1 |
| 2.5 | 監査情報記録（作成） | 2.1, 4.2 |
| 3.1 | 単位グループ更新 | 1.1, 2.1, 4.1, 4.2, 7.3 |
| 3.2 | グループコード変更禁止 | 2.3, 4.2, 7.3 |
| 3.3 | 基準単位変更 | 4.2, 7.3 |
| 3.4 | 基準単位グループ整合性 | 2.3, 4.2 |
| 3.5 | 楽観ロック（グループ） | 2.3, 4.2, 8.3 |
| 3.6 | 監査情報記録（更新） | 2.1, 4.2 |
| 4.1 | 単位グループ無効化 | 1.1, 2.1, 4.1, 4.2, 7.3 |
| 4.2 | 単位グループ有効化 | 1.1, 2.1, 4.1, 4.2, 7.3 |
| 4.3 | 無効化時警告 | 4.2, 7.3 |
| 4.4 | 物理削除禁止 | 4.2 |
| 5.1 | 単位一覧表示 | 1.2, 2.2, 5.1, 5.2, 6.2, 7.1, 7.4, 8.2, 8.4 |
| 5.2 | グループフィルタ | 1.2, 5.1, 5.2, 7.4 |
| 5.3 | キーワード検索（単位） | 1.2, 5.1, 5.2, 7.4 |
| 5.4 | ソート（単位） | 1.2, 6.2, 7.4 |
| 5.5 | 基準単位表示 | 1.2, 5.2, 6.1, 7.4 |
| 6.1 | 単位登録 | 1.2, 2.2, 5.1, 5.2, 7.5 |
| 6.2 | 単位コード形式検証 | 2.3, 5.2, 7.5 |
| 6.3 | 単位コード重複検証 | 2.3, 5.2 |
| 6.4 | 記号（任意）登録 | 5.2, 7.5 |
| 6.5 | 監査情報記録（作成） | 2.2, 5.2 |
| 7.1 | 単位更新 | 1.2, 2.2, 5.1, 5.2, 7.5 |
| 7.2 | 単位コード変更禁止 | 2.3, 5.2, 7.5 |
| 7.3 | グループ変更禁止 | 2.3, 5.2 |
| 7.4 | 楽観ロック（単位） | 2.3, 5.2, 8.3 |
| 7.5 | 監査情報記録（更新） | 2.2, 5.2 |
| 8.1 | 単位無効化 | 1.2, 2.2, 5.1, 5.2, 7.5 |
| 8.2 | 単位有効化 | 1.2, 2.2, 5.1, 5.2, 7.5 |
| 8.3 | 基準単位無効化禁止 | 2.3, 5.2, 7.5, 9.1 |
| 8.4 | 品目使用中無効化禁止 | 2.3, 5.1, 5.2, 7.5, 9.1 |
| 8.5 | 物理削除禁止 | 5.2 |
| 9.1 | 単位サジェスト | 1.3, 2.2, 5.1, 5.2, 7.1, 7.6 |
| 9.2 | グループ指定サジェスト | 1.3, 5.1, 5.2, 7.6 |
| 9.3 | 最大20件制限 | 1.3, 5.2, 7.6 |
| 10.1 | tenant_idフィルタ | 3.1, 3.2, 4.1, 5.1, 9.2 |
| 10.2 | RLS強制 | 3.3, 9.2 |
| 10.3 | 他テナントアクセス拒否 | 6.3, 8.1, 9.2 |
| 11.1 | 監査情報記録（作成） | 4.2, 5.2 |
| 11.2 | 監査情報記録（更新） | 4.2, 5.2 |
| 11.3 | 監査ログ内容 | 4.2, 5.2 |
| 12.1 | 読取権限チェック | 4.3, 5.3 |
| 12.2 | 管理権限チェック | 4.3, 5.3 |
| 12.3 | 権限不足時エラー | 4.3, 5.3 |
| 12.4 | UI/API権限一致 | 4.3, 5.3 |

---

（以上）
