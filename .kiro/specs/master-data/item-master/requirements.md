# Requirements Document

## Introduction

品目マスタ（Item Master）は、ProcureERPにおける発注・仕入の基本単位となる品目情報を管理する機能である。品目コード、品目名、基本単位、購買単位などの基本情報を登録・照会・編集できる。品目登録時には基底SKU（variant_code='00000'）が自動生成され、default_variant_idとして参照される。

### 対象ユーザー
- 購買担当者（バイヤー）
- マスタデータ管理者
- 調達部門マネージャー

### 関連エンティティ
- items（品目）
- item_variants（SKU / バリアント）- 基底SKUのみ本機能で自動生成
- uoms（単位）- 基本単位・購買単位として参照

---

## Requirements

### Requirement 1: 品目一覧表示

**Objective:** As a 購買担当者, I want 品目の一覧を表示して検索・絞り込みができる, so that 必要な品目を素早く見つけられる

#### Acceptance Criteria
1. When ユーザーが品目一覧画面を開く, the ItemMasterService shall ページネーション付きで品目一覧を返却する
2. When ユーザーがキーワードを入力して検索する, the ItemMasterService shall 品目コードまたは品目名に部分一致する品目を返却する
3. When ユーザーがソート条件を指定する, the ItemMasterService shall 指定されたフィールド（itemCode, itemName, isActive）で昇順または降順にソートした結果を返却する
4. When ユーザーが有効/無効フィルタを指定する, the ItemMasterService shall 指定された有効状態の品目のみを返却する
5. The ItemMasterService shall デフォルトで有効な品目のみを表示する

### Requirement 2: 品目詳細表示

**Objective:** As a 購買担当者, I want 品目の詳細情報を確認できる, so that 発注・仕入に必要な品目情報を把握できる

#### Acceptance Criteria
1. When ユーザーが品目IDを指定して詳細を取得する, the ItemMasterService shall 品目の全情報（品目コード、品目名、略称、基本単位、購買単位、備考、有効状態、バージョン、作成日時、更新日時）を返却する
2. When ユーザーが存在しない品目IDを指定する, the ItemMasterService shall ITEM_NOT_FOUND エラーを返却する
3. The ItemMasterService shall 基本単位・購買単位の情報（単位コード、単位名）を含めて返却する

### Requirement 3: 品目登録

**Objective:** As a マスタデータ管理者, I want 新規品目を登録できる, so that 調達対象の品目をシステムで管理できる

#### Acceptance Criteria
1. When ユーザーが必須項目（品目コード、品目名、基本単位ID）を入力して登録する, the ItemMasterService shall 新規品目を作成する
2. When 品目が作成される, the ItemMasterService shall 基底SKU（variant_code='00000', variant_signature=''）を自動生成し、default_variant_idに設定する
3. When 既に存在する品目コードで登録しようとする, the ItemMasterService shall ITEM_CODE_ALREADY_EXISTS エラーを返却する
4. When 存在しない基本単位IDを指定する, the ItemMasterService shall BASE_UOM_NOT_FOUND エラーを返却する
5. When 購買単位IDが指定され、基本単位と同一の単位グループに属さない, the ItemMasterService shall PURCHASE_UOM_INVALID_GROUP エラーを返却する
6. The ItemMasterService shall 品目コードを5桁の数字形式（00001〜99999）で受け付ける
7. The ItemMasterService shall 作成日時、更新日時、作成者ID、更新者IDを自動設定する

### Requirement 4: 品目編集

**Objective:** As a マスタデータ管理者, I want 既存品目の情報を更新できる, so that 品目情報を最新の状態に保てる

#### Acceptance Criteria
1. When ユーザーが品目情報を更新する, the ItemMasterService shall 品目名、略称、購買単位、備考を更新する
2. When 楽観ロックのバージョンが一致しない, the ItemMasterService shall CONCURRENT_UPDATE エラーを返却する
3. When 購買単位を変更し、基本単位と同一の単位グループに属さない, the ItemMasterService shall PURCHASE_UOM_INVALID_GROUP エラーを返却する
4. The ItemMasterService shall 品目コード、基本単位の変更を許可しない（変更不可フィールド）
5. The ItemMasterService shall 更新成功時にバージョンをインクリメントする

### Requirement 5: 品目無効化・有効化

**Objective:** As a マスタデータ管理者, I want 品目を無効化・有効化できる, so that 使用しなくなった品目を発注対象から除外できる

#### Acceptance Criteria
1. When ユーザーが品目を無効化する, the ItemMasterService shall is_activeをfalseに設定する
2. When ユーザーが品目を有効化する, the ItemMasterService shall is_activeをtrueに設定する
3. When 楽観ロックのバージョンが一致しない, the ItemMasterService shall CONCURRENT_UPDATE エラーを返却する
4. The ItemMasterService shall 無効化された品目の品目コードの再利用を許可しない

### Requirement 6: 品目サジェスト

**Objective:** As a 購買担当者, I want 品目コードまたは品目名の入力時にサジェストを表示できる, so that 品目選択を効率的に行える

#### Acceptance Criteria
1. When ユーザーがキーワードを入力する, the ItemMasterService shall 品目コードまたは品目名に前方一致する有効な品目を最大20件返却する
2. The ItemMasterService shall サジェスト結果に品目ID、品目コード、品目名、基本単位情報を含める
3. The ItemMasterService shall 有効な品目（is_active=true）のみをサジェスト対象とする

### Requirement 7: 権限制御

**Objective:** As a システム, I want 品目マスタの操作に適切な権限を要求する, so that 不正な操作を防止できる

#### Acceptance Criteria
1. The ItemMasterService shall 品目の参照に `procure.item.read` 権限を要求する
2. The ItemMasterService shall 品目の登録に `procure.item.create` 権限を要求する
3. The ItemMasterService shall 品目の更新に `procure.item.update` 権限を要求する
4. If 必要な権限を持たないユーザーが操作を試みる, the ItemMasterService shall 403 Forbidden を返却する

### Requirement 8: マルチテナント対応

**Objective:** As a システム, I want テナント間のデータ分離を保証する, so that セキュリティを担保できる

#### Acceptance Criteria
1. The ItemMasterService shall すべてのDBアクセスでtenant_idを必須とする
2. The ItemMasterService shall RLSによりテナント間のデータ分離を強制する
3. The ItemMasterService shall 品目コードの一意性をテナント単位で保証する

---

## Non-Functional Requirements

### NFR-1: パフォーマンス
- 品目一覧取得: 2秒以内（P95、1000件以下）
- 品目詳細取得: 1秒以内（P95）
- 品目サジェスト: 500ms以内（P95）

### NFR-2: データ整合性
- 楽観ロックにより同時更新を検出する
- 品目作成と基底SKU作成はトランザクションで保証する

### NFR-3: 監査
- 品目の作成・更新・無効化は監査ログに記録する
