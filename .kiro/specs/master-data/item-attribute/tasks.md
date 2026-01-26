# Implementation Plan: 品目仕様属性マスタ（Item Attribute Master）

> CCSDD / SDD 前提：**contracts-first**（bff → api → shared）を最優先し、境界違反を guard で止める。
> UI は最後。v0 は **Phase 1（統制テスト）→ Phase 2（本実装）** の二段階で扱う。

---

## 0. Design Completeness Gate（Blocking）

> Implementation MUST NOT start until all items below are checked.

- [ ] 0.1 Designの「BFF Specification（apps/bff）」が埋まっている
  - BFF endpoints（14エンドポイント: attributes CRUD, values CRUD, suggest x2）が記載されている
  - Request/Response DTO（packages/contracts/src/bff/item-attribute）が列挙されている
  - **Paging/Sorting正規化（必須）が明記されている**
    - UI/BFF: page/pageSize、Domain API: offset/limit
    - defaults: page=1, pageSize=50, sortBy=sortOrder, sortOrder=asc
    - clamp: pageSize≤200
    - whitelist: ItemAttribute(attributeCode|attributeName|sortOrder|isActive), ItemAttributeValue(valueCode|valueName|sortOrder|isActive)
    - normalize: keyword trim、空→undefined
    - transform: offset=(page-1)*pageSize, limit=pageSize
  - 変換（api DTO → bff DTO）の方針が記載されている
  - エラー整形方針（Pass-through）が記載されている
  - tenant_id/user_id の取り回しが記載されている

- [ ] 0.2 Designの「Service Specification（Domain / apps/api）」が埋まっている
  - Usecase（ItemAttribute: List/Get/Create/Update/Activate/Deactivate/Suggest、ItemAttributeValue: List/Get/Create/Update/Activate/Deactivate/Suggest）が列挙されている
  - 主要ビジネスルール（10項目）が記載されている
  - トランザクション境界が記載されている
  - 監査ログ記録ポイントが記載されている

- [ ] 0.3 Designの「Repository Specification（apps/api）」が埋まっている
  - ItemAttribute/ItemAttributeValue 取得・更新メソッド一覧が記載されている（tenant_id必須）
  - where句二重ガードの方針（tenant_id常時指定）が記載されている
  - RLS前提（set_config前提）が記載されている

- [ ] 0.4 Designの「Contracts Summary（This Feature）」が埋まっている
  - packages/contracts/src/bff/item-attribute のDTOが列挙されている
  - packages/contracts/src/api/item-attribute のDTOが列挙されている
  - Error定義（item-attribute-error.ts）が明記されている
  - 「UIは packages/contracts/src/api を参照しない」ルールが明記されている

- [ ] 0.5 Requirements Traceability が更新されている
  - 全13要件がBFF/API/Repo/Flowsに紐づいている

- [ ] 0.6 v0生成物の受入・移植ルールが確認されている
  - v0生成物は `apps/web/_v0_drop/master-data/item-attribute/src` に一次格納
  - UIは MockBffClient で動作確認

- [ ] 0.7 Structure / Boundary Guard がパスしている

---

## 1. Contracts: BFF契約定義

- [x] 1.1 (P) 仕様属性用BFF契約を定義する ✅
  - 仕様属性の一覧取得、詳細取得、登録、更新、有効化、無効化の各DTOを定義する
  - ページネーション（page/pageSize）とソート（attributeCode/attributeName/sortOrder/isActive）をサポートする
  - キーワード検索と有効/無効フィルタをサポートする
  - 属性値件数（valueCount）を含むレスポンス構造を定義する
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 2.1, 3.1, 4.1, 4.2_

- [x] 1.2 (P) 属性値用BFF契約を定義する ✅
  - 属性値の一覧取得、詳細取得、登録、更新、有効化、無効化の各DTOを定義する
  - ページネーションとソート（valueCode/valueName/sortOrder/isActive）をサポートする
  - キーワード検索と有効/無効フィルタをサポートする
  - 親属性情報（attributeCode/attributeName）を含むレスポンス構造を定義する
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 6.1, 7.1, 8.1, 8.2_

- [x] 1.3 (P) サジェスト用BFF契約を定義する ✅
  - 仕様属性サジェスト（前方一致検索、最大20件）のDTOを定義する
  - 属性値サジェスト（属性指定オプション、前方一致検索、最大20件）のDTOを定義する
  - _Requirements: 9.1, 9.2, 9.3, 10.1, 10.2, 10.3, 10.4_

---

## 2. Contracts: API契約定義

- [x] 2.1 (P) 仕様属性用API契約を定義する ✅
  - BFF契約に対応するAPI側DTOを定義する（offset/limit形式）
  - 監査カラム（createdByLoginAccountId, updatedByLoginAccountId）を含める
  - _Requirements: 1.1, 2.1, 2.6, 3.1, 3.4, 4.1, 4.2_

- [x] 2.2 (P) 属性値用API契約を定義する ✅
  - BFF契約に対応するAPI側DTOを定義する（offset/limit形式）
  - itemAttributeId による親属性参照を含める
  - 監査カラムを含める
  - _Requirements: 5.1, 6.1, 6.5, 7.1, 7.4, 8.1, 8.2_

- [x] 2.3 (P) エラーコード定義を作成する ✅
  - ITEM_ATTRIBUTE_NOT_FOUND, ITEM_ATTRIBUTE_VALUE_NOT_FOUND（404）を定義する
  - ITEM_ATTRIBUTE_CODE_DUPLICATE, VALUE_CODE_DUPLICATE, CONCURRENT_UPDATE（409）を定義する
  - コード形式エラー、コード変更禁止、使用中エラー（422）を定義する
  - HTTPステータスコードとエラーメッセージ（日本語）のマッピングを定義する
  - _Requirements: 2.2, 2.3, 3.2, 3.3, 4.3, 6.2, 6.3, 7.2, 7.3, 8.3_

---

## 3. DB: スキーマ・マイグレーション・RLS

- [x] 3.1 Prismaスキーマを定義する ✅
  - ItemAttributeモデル（id, tenantId, itemAttributeCode, itemAttributeName, valueType, sortOrder, isActive, version, 監査カラム）を定義する
  - ItemAttributeValueモデル（id, tenantId, itemAttributeId, valueCode, valueName, sortOrder, isActive, version, 監査カラム）を定義する
  - ItemAttributeとItemAttributeValueのリレーションを定義する
  - テナント＋コードのユニーク制約と各種インデックスを定義する
  - _Requirements: 11.1, 11.2_

- [x] 3.2 マイグレーションを作成する ✅
  - item_attributes, item_attribute_valuesテーブルを作成するマイグレーションを生成する
  - コード形式のCHECK制約（attributeCode: ^[A-Z0-9_-]{1,20}$、valueCode: ^[A-Z0-9_-]{1,30}$）を追加する
  - _Requirements: 11.1_

- [x] 3.3 RLSポリシーを設定する ✅
  - item_attributesテーブルにテナント分離ポリシーを適用する
  - item_attribute_valuesテーブルにテナント分離ポリシーを適用する
  - current_setting('app.current_tenant_id')によるフィルタリングを設定する
  - _Requirements: 11.2_

---

## 4. Domain API: 仕様属性機能

- [x] 4.1 仕様属性Repositoryを実装する ✅
  - findMany（一覧取得、ソート・フィルタ対応）を実装する
  - findOne（詳細取得）を実装する
  - create（新規作成）を実装する
  - update（更新、楽観ロック対応）を実装する
  - checkCodeDuplicate（コード重複チェック）を実装する
  - countValues（属性値件数取得）を実装する
  - suggest（サジェスト検索、前方一致）を実装する
  - isUsedByVariants（SKU使用チェック）を実装する
  - すべてのメソッドでtenant_id double-guardを実装する
  - _Requirements: 1.1, 1.2, 1.3, 1.6, 2.1, 3.1, 4.1, 4.2, 4.3, 9.1, 9.2, 9.3, 11.1_

- [x] 4.2 仕様属性Serviceを実装する ✅
  - 一覧取得（キーワード検索、有効/無効フィルタ、属性値件数付与）を実装する
  - 詳細取得（存在チェック、NOT_FOUNDエラー）を実装する
  - 新規登録（コード形式検証、重複チェック、value_type='SELECT'固定）を実装する
  - 更新（コード変更禁止、楽観ロック）を実装する
  - 有効化・無効化（SKU使用中警告含む）を実装する
  - サジェスト（前方一致、有効のみ、最大20件）を実装する
  - 監査情報（created_by, updated_by）の記録を実装する
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 4.4, 9.1, 9.2, 9.3, 12.1, 12.2, 12.3_

- [x] 4.3 仕様属性Controllerを実装する ✅
  - 仕様属性関連7エンドポイント（List/Get/Create/Update/Activate/Deactivate/Suggest）を実装する
  - 権限チェック（procure.item-attribute.read / procure.item-attribute.manage）を実装する
  - tenant_id/user_idのヘッダー取得を実装する
  - _Requirements: 13.1, 13.2, 13.3, 13.4_

---

## 5. Domain API: 属性値機能

- [x] 5.1 属性値Repositoryを実装する ✅
  - findMany（一覧取得、ソート・フィルタ対応）を実装する
  - findOne（詳細取得）を実装する
  - create（新規作成）を実装する
  - update（更新、楽観ロック対応）を実装する
  - checkCodeDuplicate（同一属性内でのコード重複チェック）を実装する
  - suggest（サジェスト検索、属性指定オプション、前方一致）を実装する
  - isUsedByVariants（SKU使用チェック）を実装する
  - すべてのメソッドでtenant_id double-guardを実装する
  - _Requirements: 5.1, 5.2, 5.3, 6.1, 7.1, 8.1, 8.3, 10.1, 10.2, 10.3, 10.4, 11.1_

- [x] 5.2 属性値Serviceを実装する ✅
  - 一覧取得（キーワード検索、有効/無効フィルタ）を実装する
  - 詳細取得（存在チェック、NOT_FOUNDエラー）を実装する
  - 新規登録（コード形式検証、同一属性内重複チェック）を実装する
  - 更新（コード変更禁止、楽観ロック）を実装する
  - 有効化・無効化（SKU使用中警告含む）を実装する
  - サジェスト（属性指定、前方一致、有効のみ、最大20件）を実装する
  - 監査情報の記録を実装する
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.2, 7.3, 7.4, 8.1, 8.2, 8.3, 8.4, 10.1, 10.2, 10.3, 10.4, 12.1, 12.2, 12.3_

- [x] 5.3 属性値Controllerを実装する ✅
  - 属性値関連7エンドポイント（List/Get/Create/Update/Activate/Deactivate/Suggest）を実装する
  - 権限チェックを実装する
  - tenant_id/user_idのヘッダー取得を実装する
  - _Requirements: 13.1, 13.2, 13.3, 13.4_

---

## 6. BFF: 品目仕様属性マスタBFF実装

- [x] 6.1 BFFマッパーを実装する ✅
  - ItemAttributeApiDto → ItemAttributeDto の変換を実装する（valueCount算出含む）
  - ItemAttributeValueApiDto → ItemAttributeValueDto の変換を実装する（親属性情報付与含む）
  - createdByLoginAccountId → createdBy 等のフィールド名変換を実装する
  - _Requirements: 1.6_

- [x] 6.2 BFFサービスを実装する ✅
  - page/pageSize → offset/limit の変換を実装する
  - sortByのホワイトリストチェックを実装する
  - keywordのtrim・空文字→undefined変換を実装する
  - pageSizeの上限クランプ（≤200）を実装する
  - Domain API呼び出しとレスポンス変換を実装する
  - _Requirements: 1.4, 1.5, 5.4_

- [x] 6.3 BFFコントローラーを実装する ✅
  - 14エンドポイントをBFFとして公開する
  - 認証情報からtenant_id/user_idを解決しDomain APIに伝搬する
  - エラーをPass-throughで返却する
  - _Requirements: 11.3_

---

## 7. UI: Phase 1（v0統制テスト）

- [x] 7.1 MockBffClientを作成する ✅
  - 仕様属性用モックデータと操作を実装する
  - 属性値用モックデータと操作を実装する
  - サジェスト用モックを実装する
  - エラーケースのモックを実装する
  - _Requirements: 1.1, 5.1, 9.1, 10.1_

- [x] 7.2 (P) 仕様属性一覧画面を作成する ✅
  - 一覧表示（テーブル形式、属性値件数表示）を実装する
  - ページネーション制御を実装する
  - ソート機能（attributeCode/attributeName/sortOrder/isActive）を実装する
  - キーワード検索と有効/無効フィルタを実装する
  - 登録ダイアログ・詳細/編集ダイアログへの遷移を実装する
  - MockBffClientで動作確認する
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

- [x] 7.3 (P) 仕様属性登録ダイアログを作成する ✅
  - 登録フォーム（attributeCode, attributeName, sortOrder）を実装する
  - コード入力制限（英数字大文字+-_、20文字以内）を実装する
  - エラー表示（重複、形式不正等）を実装する
  - 保存後は詳細/編集ダイアログへ遷移する
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [x] 7.4 (P) 仕様属性詳細/編集ダイアログを作成する ✅
  - 基本情報セクション（attributeName, sortOrder編集可、attributeCode編集不可）を実装する
  - 属性値一覧セクション（テーブル形式、追加・編集・無効化操作）を実装する
  - 有効化・無効化ボタン（SKU使用中の場合は警告表示）を実装する
  - 楽観ロック競合時のエラー表示を実装する
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.3, 5.4_

- [x] 7.5 (P) 属性値登録・編集ダイアログを作成する ✅
  - 登録フォーム（valueCode, valueName, sortOrder）を実装する
  - 編集フォーム（valueName, sortOrder のみ変更可能）を実装する
  - コード入力制限（英数字大文字+-_、30文字以内）を実装する
  - エラー表示（重複、形式不正等）を実装する
  - 有効化・無効化ボタン（SKU使用中の場合は警告表示）を実装する
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.2, 7.3, 7.4, 8.1, 8.2, 8.3, 8.4_

- [x] 7.6 仕様属性サジェストコンポーネントを作成する ✅
  - テキスト入力によるサジェスト表示を実装する
  - デバウンスによる入力制御を実装する
  - 最大20件表示を実装する
  - 品目マスタSKU作成画面での利用を想定する
  - _Requirements: 9.1, 9.2, 9.3_

- [x] 7.7 属性値サジェストコンポーネントを作成する ✅
  - テキスト入力によるサジェスト表示を実装する
  - 属性指定による絞り込みをサポートする
  - デバウンスによる入力制御を実装する
  - 最大20件表示を実装する
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

---

## 8. UI: Phase 2（本実装・BFF接続）

- [x] 8.1 HttpBffClientを実装する ✅
  - 全14エンドポイントへのHTTPリクエストを実装する
  - 認証ヘッダー付与を実装する
  - エラーハンドリング（ステータスコード別）を実装する
  - _Requirements: 11.3_

- [x] 8.2 v0生成物を本番構造へ移植する ✅（※v0経由せず直接features配下に実装）
  - _v0_drop から features/master-data/item-attribute へ移植する
  - MockBffClient を HttpBffClient に差し替える
  - 不要なv0固有設定を除去する
  - _Requirements: 1.1, 5.1_

- [x] 8.3 楽観ロック競合時のUI制御を実装する ✅（ダイアログ内でCONCURRENT_UPDATEエラー表示済み）
  - 競合エラー検出時のリトライガイダンス表示を実装する
  - 最新データ再取得フローを実装する
  - _Requirements: 3.3, 7.3_

- [x] 8.4 ナビゲーション登録を行う ✅
  - shared/navigation/menu.ts に品目仕様属性マスタメニューを追加する
  - ルート定義（/master-data/item-attributes）を追加する
  - _Requirements: 1.1_

---

## 9. 結合・検証

- [ ] 9.1 E2Eテストを作成する（※MVP後に実施）
  - 仕様属性CRUDシナリオをテストする
  - 属性値CRUDシナリオをテストする
  - エラーケース（重複、形式不正、使用中無効化）をテストする
  - _Requirements: 4.3, 8.3_

- [x] 9.2 Structure / Boundary Guardを実行する ✅
  - UI → Domain API の直接呼び出しが存在しないことを確認する
  - UIでの直接 fetch() が存在しないことを確認する
  - BFFがDBへ直接アクセスしていないことを確認する
  - _Requirements: 11.1, 11.2, 11.3_

---

## Requirements Coverage

| Req | Summary | Tasks |
|-----|---------|-------|
| 1.1 | 仕様属性一覧表示 | 1.1, 2.1, 4.1, 4.2, 6.2, 7.1, 7.2, 8.2, 8.4 |
| 1.2 | キーワード検索（属性） | 1.1, 4.1, 4.2, 7.2 |
| 1.3 | 有効/無効フィルタ | 1.1, 4.1, 4.2, 7.2 |
| 1.4 | ソート（属性） | 1.1, 6.2, 7.2 |
| 1.5 | ページネーション | 1.1, 6.2, 7.2 |
| 1.6 | 属性値件数表示 | 1.1, 4.1, 6.1, 7.2 |
| 2.1 | 仕様属性登録 | 1.1, 2.1, 4.1, 4.2, 7.3 |
| 2.2 | 属性コード形式検証 | 2.3, 4.2, 7.3 |
| 2.3 | 属性コード重複検証 | 2.3, 4.2, 7.3 |
| 2.4 | sort_order登録 | 4.2, 7.3 |
| 2.5 | value_type固定 | 4.2, 7.3 |
| 2.6 | 監査情報記録（作成） | 2.1, 4.2 |
| 3.1 | 仕様属性更新 | 1.1, 2.1, 4.1, 4.2, 7.4 |
| 3.2 | 属性コード変更禁止 | 2.3, 4.2, 7.4 |
| 3.3 | 楽観ロック（属性） | 2.3, 4.2, 8.3 |
| 3.4 | 監査情報記録（更新） | 2.1, 4.2 |
| 4.1 | 仕様属性無効化 | 1.1, 2.1, 4.1, 4.2, 7.4 |
| 4.2 | 仕様属性有効化 | 1.1, 2.1, 4.1, 4.2, 7.4 |
| 4.3 | 使用中警告（属性） | 4.1, 4.2, 7.4, 9.1 |
| 4.4 | 物理削除禁止 | 4.2 |
| 5.1 | 属性値一覧表示 | 1.2, 2.2, 5.1, 5.2, 6.2, 7.1, 7.4, 8.2 |
| 5.2 | キーワード検索（値） | 1.2, 5.1, 5.2, 7.4 |
| 5.3 | 有効/無効フィルタ | 1.2, 5.1, 5.2, 7.4 |
| 5.4 | ページネーション | 1.2, 6.2, 7.4 |
| 6.1 | 属性値登録 | 1.2, 2.2, 5.1, 5.2, 7.5 |
| 6.2 | 値コード形式検証 | 2.3, 5.2, 7.5 |
| 6.3 | 値コード重複検証 | 2.3, 5.2 |
| 6.4 | sort_order登録 | 5.2, 7.5 |
| 6.5 | 監査情報記録（作成） | 2.2, 5.2 |
| 7.1 | 属性値更新 | 1.2, 2.2, 5.1, 5.2, 7.5 |
| 7.2 | 値コード変更禁止 | 2.3, 5.2, 7.5 |
| 7.3 | 楽観ロック（値） | 2.3, 5.2, 8.3 |
| 7.4 | 監査情報記録（更新） | 2.2, 5.2 |
| 8.1 | 属性値無効化 | 1.2, 2.2, 5.1, 5.2, 7.5 |
| 8.2 | 属性値有効化 | 1.2, 2.2, 5.1, 5.2, 7.5 |
| 8.3 | 使用中警告（値） | 5.1, 5.2, 7.5, 9.1 |
| 8.4 | 物理削除禁止 | 5.2 |
| 9.1 | 仕様属性サジェスト | 1.3, 2.1, 4.1, 4.2, 7.1, 7.6 |
| 9.2 | 最大20件制限 | 1.3, 4.2, 7.6 |
| 9.3 | 無効除外 | 1.3, 4.2, 7.6 |
| 10.1 | 属性値サジェスト | 1.3, 2.2, 5.1, 5.2, 7.1, 7.7 |
| 10.2 | 属性指定サジェスト | 1.3, 5.1, 5.2, 7.7 |
| 10.3 | 最大20件制限 | 1.3, 5.2, 7.7 |
| 10.4 | 無効除外 | 1.3, 5.2, 7.7 |
| 11.1 | tenant_idフィルタ | 3.1, 3.2, 4.1, 5.1, 9.2 |
| 11.2 | RLS強制 | 3.3, 9.2 |
| 11.3 | 他テナントアクセス拒否 | 6.3, 8.1, 9.2 |
| 12.1 | 監査情報記録（作成） | 4.2, 5.2 |
| 12.2 | 監査情報記録（更新） | 4.2, 5.2 |
| 12.3 | 監査ログ内容 | 4.2, 5.2 |
| 13.1 | 読取権限チェック | 4.3, 5.3 |
| 13.2 | 管理権限チェック | 4.3, 5.3 |
| 13.3 | 権限不足時エラー | 4.3, 5.3 |
| 13.4 | UI/API権限一致 | 4.3, 5.3 |

---

（以上）
