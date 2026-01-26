# Implementation Plan: 品目マスタ (item-master)

> CCSDD / SDD 前提：**contracts-first**（bff → api → shared）を最優先し、境界違反を guard で止める。
> UI は最後。v0 は **Phase 1（統制テスト）→ Phase 2（本実装）** の二段階で扱う。

---

## 0. Design Completeness Gate（Blocking）

> Implementation MUST NOT start until all items below are checked.

- [ ] 0.1 Designの「BFF Specification（apps/bff）」が埋まっている
  - BFF endpoints（7エンドポイント）が記載されている
  - Request/Response DTO（packages/contracts/src/bff/item-master）が列挙されている
  - Paging/Sorting正規化（page/pageSize → offset/limit、defaults、clamp、whitelist、normalize、transform）が明記されている
  - 変換（api DTO → bff DTO）の方針が記載されている
  - エラー整形方針（Pass-through）が記載されている
  - tenant_id/user_id の取り回しが記載されている

- [ ] 0.2 Designの「Service Specification（Domain / apps/api）」が埋まっている
  - Usecase（List/Suggest/Get/Create/Update/Activate/Deactivate）が列挙されている
  - 主要ビジネスルール（9項目）が記載されている
  - トランザクション境界が記載されている
  - 監査ログ記録ポイントが記載されている

- [ ] 0.3 Designの「Repository Specification（apps/api）」が埋まっている
  - 取得・更新メソッド一覧が記載されている（tenant_id必須）
  - where句二重ガードの方針が記載されている
  - RLS前提が記載されている

- [ ] 0.4 Designの「Contracts Summary（This Feature）」が埋まっている
  - BFF Contracts（packages/contracts/src/bff/item-master）が列挙されている
  - API Contracts（packages/contracts/src/api/item-master）が列挙されている
  - Error Codes（packages/contracts/src/api/errors/item-master-error.ts）が列挙されている

- [ ] 0.5 Requirements Traceability が更新されている
  - 全8要件がBFF/API/Repo/Flowsに紐づいている

---

## 1. Contracts定義（BFF + API + Errors）

- [ ] 1.1 (P) API Contractsの作成
  - 品目APIのDTO定義（ItemApiDto, ItemSummaryApiDto）を作成する
  - 一覧取得のRequest/Response（ListItemsApiRequest/Response）を定義する
  - サジェスト用のRequest/Response（SuggestItemsApiRequest/Response）を定義する
  - 詳細取得のResponse（GetItemApiResponse）を定義する
  - 登録・更新のRequest/Response（Create/Update ItemApiRequest/Response）を定義する
  - 有効化・無効化のRequest/Response（Activate/Deactivate ItemApiRequest/Response）を定義する
  - ソートオプション型（ItemSortBy, SortOrder）を定義する
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 3.1, 4.1, 5.1, 5.2, 6.1_

- [ ] 1.2 (P) BFF Contractsの作成
  - 品目BFF用のDTO定義（ItemDto, ItemSummaryDto, UomSummaryDto）を作成する
  - 一覧取得のRequest/Response（ListItemsRequest/Response）を定義する（page/pageSize形式）
  - サジェスト用のRequest/Response（SuggestItemsRequest/Response）を定義する
  - 詳細取得のResponse（GetItemResponse）を定義する
  - 登録・更新のRequest/Response（Create/Update ItemRequest/Response）を定義する
  - 有効化・無効化のRequest/Response（Activate/Deactivate ItemRequest/Response）を定義する
  - ソートオプション型とページネーション項目を定義する
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.3, 3.1, 4.1, 5.1, 5.2, 6.1, 6.2_

- [ ] 1.3 (P) Error定義の作成
  - 品目マスタ用エラーコード定義（ItemMasterErrorCode）を作成する
  - エラーメッセージ定義（ItemMasterErrorMessage）を作成する
  - HTTPステータスマッピング（ItemMasterErrorHttpStatus）を作成する
  - BFF側でAPI Errorをre-exportする設定を行う
  - _Requirements: 2.2, 3.3, 3.4, 3.5, 3.6, 4.2, 4.3, 4.4, 5.3, 7.4_

- [ ] 1.4 Contracts indexエクスポートの更新
  - packages/contracts/src/api/index.ts に item-master を追加する
  - packages/contracts/src/bff/index.ts に item-master を追加する
  - packages/contracts/src/api/errors/index.ts に item-master-error を追加する
  - packages/contracts/src/bff/errors/index.ts でre-exportを設定する
  - _Requirements: 7.1, 7.2, 7.3, 8.1_

---

## 2. DB / Prisma Schema

- [ ] 2.1 Prismaスキーマの更新
  - Itemモデルを定義する（tenant_id, item_code, item_name, item_short_name, base_uom_id, purchase_uom_id, default_variant_id, notes, is_active, version, 監査列）
  - ItemVariantモデルを定義する（tenant_id, item_id, variant_code, variant_name, variant_signature, is_active, 監査列）
  - Uomモデルとのリレーション（baseUom, purchaseUom）を設定する
  - Item ↔ ItemVariant間のリレーション（defaultVariant, variants）を設定する
  - 複合一意制約（tenant_id + item_code、tenant_id + item_id + variant_code、tenant_id + item_id + variant_signature）を設定する
  - インデックス（tenant_id + item_code、tenant_id + is_active）を設定する
  - _Requirements: 3.2, 8.3_

- [ ] 2.2 マイグレーションの実行
  - Prismaマイグレーションを生成する
  - RLSポリシー（items, item_variants）を設定するSQLを追加する
  - マイグレーションを適用し、テーブルが正しく作成されることを確認する
  - _Requirements: 8.2_

---

## 3. Domain API（apps/api）

- [ ] 3.1 Repositoryの実装
  - ItemRepositoryを作成し、tenant_id必須のCRUDメソッドを実装する
  - findMany（一覧取得：offset/limit、sortBy、sortOrder、filters）を実装する
  - suggest（サジェスト：前方一致、is_active=true、limit=20）を実装する
  - findById（詳細取得）を実装する
  - findByCode（品目コード検索）を実装する
  - create（新規登録）を実装する
  - update（更新：楽観ロックのversion条件）を実装する
  - ItemVariantRepositoryを作成し、createBaseVariant（基底SKU作成）を実装する
  - 全メソッドでtenant_id double-guardを適用する
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 3.1, 4.1, 5.1, 5.2, 6.1, 6.3, 8.1, 8.3_

- [ ] 3.2 Serviceの実装（ビジネスルール）
  - ItemServiceを作成する
  - listItems（一覧取得：デフォルトis_active=trueフィルタ）を実装する
  - suggestItems（サジェスト：前方一致、有効品目のみ、最大20件）を実装する
  - getItem（詳細取得：ITEM_NOT_FOUNDエラー）を実装する
  - createItem（新規登録）を実装する
    - 品目コード形式チェック（5桁数字）
    - 品目コード重複チェック
    - 基本単位存在チェック
    - 購買単位の単位グループ検証
    - 基底SKU自動生成（variant_code='00000', variant_signature=''）
    - トランザクション（Item + ItemVariant）
  - updateItem（更新）を実装する
    - 楽観ロックチェック
    - 変更不可フィールド（itemCode, baseUomId）の検証
    - 購買単位の単位グループ検証
  - activateItem / deactivateItem（有効化・無効化：楽観ロック）を実装する
  - 監査ログ記録を各操作に追加する
  - _Requirements: 1.5, 2.2, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 6.2, 6.3_

- [ ] 3.3 Controllerの実装
  - ItemControllerを作成する
  - GET /api/master-data/items（一覧取得）を実装する
  - GET /api/master-data/items/suggest（サジェスト）を実装する
  - GET /api/master-data/items/:id（詳細取得）を実装する
  - POST /api/master-data/items（新規登録）を実装する
  - PUT /api/master-data/items/:id（更新）を実装する
  - PATCH /api/master-data/items/:id/activate（有効化）を実装する
  - PATCH /api/master-data/items/:id/deactivate（無効化）を実装する
  - 権限チェック（procure.item.read/create/update）をGuardで実装する
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ] 3.4 Domain APIモジュールの登録
  - ItemModuleを作成し、Controller/Service/Repositoryを登録する
  - AppModuleにItemModuleをインポートする
  - _Requirements: 8.1_

---

## 4. BFF（apps/bff）

- [ ] 4.1 Mapperの実装
  - ItemMapperを作成する
  - API DTO → BFF DTO の変換を実装する（ItemApiDto → ItemDto）
  - 単位情報（baseUom, purchaseUom）の展開ロジックを実装する
  - サマリDTO変換（ItemSummaryApiDto → ItemSummaryDto）を実装する
  - BFF Request → API Request の変換を実装する
  - _Requirements: 2.3_

- [ ] 4.2 Serviceの実装
  - ItemBffServiceを作成する
  - Paging/Sorting正規化を実装する
    - defaults: page=1, pageSize=50, sortBy=itemCode, sortOrder=asc
    - clamp: pageSize <= 200
    - whitelist: sortBy（itemCode, itemName, isActive）
    - normalize: keyword trim、空→undefined
    - transform: offset=(page-1)*pageSize, limit=pageSize
  - Domain API呼び出しとレスポンス変換を実装する
  - tenant_id/user_idの解決・伝搬を実装する
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 6.1_

- [ ] 4.3 Controllerの実装
  - ItemBffControllerを作成する
  - GET /api/bff/master-data/items（一覧取得）を実装する
  - GET /api/bff/master-data/items/suggest（サジェスト）を実装する
  - GET /api/bff/master-data/items/:id（詳細取得）を実装する
  - POST /api/bff/master-data/items（新規登録）を実装する
  - PUT /api/bff/master-data/items/:id（更新）を実装する
  - PATCH /api/bff/master-data/items/:id/activate（有効化）を実装する
  - PATCH /api/bff/master-data/items/:id/deactivate（無効化）を実装する
  - エラーの透過（Pass-through）を実装する
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 5.2, 6.1, 7.4_

- [ ] 4.4 BFFモジュールの登録
  - ItemBffModuleを作成し、Controller/Service/Mapperを登録する
  - AppModuleにItemBffModuleをインポートする
  - _Requirements: 8.1_

---

## 5. UI実装（Phase 1: v0統制テスト）

- [ ] 5.1 BffClient インターフェースの定義
  - ItemBffClientインターフェースを定義する
  - 品目一覧取得、サジェスト、詳細取得、登録、更新、有効化、無効化のメソッドを定義する
  - MockBffClientを実装し、モックデータを返す
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 5.2, 6.1_

- [ ] 5.2 品目一覧画面の作成
  - 品目一覧テーブルを作成する（品目コード、品目名、基本単位、有効状態）
  - ページネーションUIを実装する
  - ソート機能（品目コード、品目名、有効状態）を実装する
  - キーワード検索UIを実装する
  - 有効/無効フィルタUIを実装する
  - 詳細画面への導線を設置する
  - 新規登録ボタンを配置する
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 5.3 品目詳細・登録・編集ダイアログの作成
  - 品目詳細表示ダイアログを作成する（全項目表示）
  - 品目登録フォームを作成する（品目コード、品目名、略称、基本単位、購買単位、備考）
  - 品目編集フォームを作成する（品目名、略称、購買単位、備考、version）
  - 基本単位・購買単位のサジェスト選択UIを実装する
  - 品目コード形式（5桁数字）のクライアントバリデーションを実装する
  - エラーメッセージ表示を実装する
  - _Requirements: 2.1, 2.3, 3.1, 3.6, 4.1, 4.4_

- [ ] 5.4 品目有効化・無効化UIの作成
  - 有効化・無効化ボタンを配置する
  - 確認ダイアログを実装する
  - 楽観ロックエラー時の再取得促進UIを実装する
  - _Requirements: 5.1, 5.2, 5.3_

- [ ] 5.5 v0統制テストの実行
  - MockBffClientで全画面の動作を確認する
  - structure-guardsを実行し、境界違反がないことを確認する
  - apps/web/_v0_drop配下で隔離されていることを確認する
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 5.2, 6.1_

---

## 6. UI実装（Phase 2: 本実装・BFF接続）

- [ ] 6.1 HttpBffClientの実装
  - HttpBffClientを実装し、実際のBFFエンドポイントを呼び出す
  - BffClientの切り替え機構を実装する（環境変数による切り替え）
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 5.2, 6.1_

- [ ] 6.2 featuresへの移植
  - v0_dropからapps/web/src/features/master-data/item-master/へ移植する
  - UIがBFFのみを呼び出していることを確認する
  - packages/contracts/src/apiを参照していないことを確認する
  - _Requirements: 8.1_

- [ ] 6.3 ナビゲーション・ルーティングの設定
  - shared/navigation/menu.tsに品目マスタを追加する
  - app/master-data/item-master/page.tsxを作成する
  - _Requirements: 1.1_

- [ ] 6.4 統合テスト
  - API → BFF → UI の疎通確認を行う
  - 品目の登録・更新・無効化の一連フローを確認する
  - エラーケース（重複コード、単位グループ不整合、楽観ロック競合）の動作を確認する
  - _Requirements: 1.1, 2.1, 2.2, 3.1, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 5.1, 5.2, 5.3, 6.1, 7.4, 8.1, 8.2_

---

## Requirements Coverage Matrix

| Req ID | Description | Tasks |
|--------|-------------|-------|
| 1.1 | 品目一覧ページネーション | 1.1, 1.2, 3.1, 4.2, 4.3, 5.2, 6.1, 6.3, 6.4 |
| 1.2 | キーワード検索 | 1.1, 1.2, 3.1, 4.2, 5.2 |
| 1.3 | ソート機能 | 1.1, 1.2, 3.1, 4.2, 5.2 |
| 1.4 | 有効/無効フィルタ | 1.1, 1.2, 3.1, 4.2, 5.2 |
| 1.5 | デフォルト有効品目表示 | 1.2, 3.2, 4.2 |
| 2.1 | 品目詳細取得 | 1.1, 1.2, 3.1, 4.3, 5.1, 5.3, 6.1, 6.4 |
| 2.2 | 品目未発見エラー | 1.3, 3.2, 6.4 |
| 2.3 | 単位情報展開 | 1.2, 4.1, 5.3 |
| 3.1 | 品目新規登録 | 1.1, 1.2, 3.1, 3.2, 4.3, 5.1, 5.3, 6.1, 6.4 |
| 3.2 | 基底SKU自動生成 | 2.1, 3.2 |
| 3.3 | 品目コード重複エラー | 1.3, 3.2, 6.4 |
| 3.4 | 基本単位存在チェック | 1.3, 3.2, 6.4 |
| 3.5 | 購買単位グループ検証 | 1.3, 3.2, 6.4 |
| 3.6 | 品目コード形式検証 | 1.3, 3.2, 5.3 |
| 3.7 | 監査情報自動設定 | 3.2 |
| 4.1 | 品目更新 | 1.1, 1.2, 3.1, 3.2, 4.3, 5.1, 5.3, 6.1, 6.4 |
| 4.2 | 楽観ロック | 1.3, 3.2, 6.4 |
| 4.3 | 購買単位変更時検証 | 1.3, 3.2, 6.4 |
| 4.4 | 変更不可フィールド制御 | 1.3, 3.2, 5.3 |
| 4.5 | バージョンインクリメント | 3.2 |
| 5.1 | 品目無効化 | 1.1, 1.2, 3.1, 3.2, 4.3, 5.1, 5.4, 6.1, 6.4 |
| 5.2 | 品目有効化 | 1.1, 1.2, 3.1, 3.2, 4.3, 5.1, 5.4, 6.1, 6.4 |
| 5.3 | 無効化時楽観ロック | 1.3, 3.2, 5.4, 6.4 |
| 5.4 | 品目コード再利用禁止 | 3.2 |
| 6.1 | 品目サジェスト | 1.1, 1.2, 3.1, 4.2, 4.3, 5.1, 5.5, 6.1, 6.4 |
| 6.2 | サジェスト結果内容 | 3.2 |
| 6.3 | 有効品目のみ対象 | 3.1, 3.2 |
| 7.1 | 参照権限 | 1.4, 3.3 |
| 7.2 | 登録権限 | 1.4, 3.3 |
| 7.3 | 更新権限 | 1.4, 3.3 |
| 7.4 | 権限不足エラー | 1.3, 3.3, 4.3, 6.4 |
| 8.1 | tenant_id必須 | 1.4, 3.1, 3.4, 4.4, 6.2, 6.4 |
| 8.2 | RLSによる分離 | 2.2, 6.4 |
| 8.3 | 品目コードテナント単位一意 | 2.1, 3.1 |
