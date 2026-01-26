# Requirements Document

## Introduction

本ドキュメントは、ProcureERP（購買管理SaaS）における **単位マスタ（Unit Master）** 機能の要件仕様を定義する。

### 機能概要

単位マスタは、品目や伝票明細で使用する数量単位（UoM: Unit of Measure）と、換算互換の境界を定義する単位グループ（UoMGroup）を管理するマスタ機能である。

### 対象エンティティ

- **UoMGroup（単位グループ）**: 同一グループ内の単位のみが将来的に換算可能という「互換枠」を定義
- **UoM（単位）**: 品目・伝票明細で使用する数量単位（例：PCS, BOX, KG）

### 主要な設計方針

- 単位グループは少数（COUNT / WEIGHT / LENGTH 等）を想定
- 各単位グループは必ず1つの基準単位（base_uom）を持つ
- 単位コード（uom_code / uom_group_code）は英数字大文字 + `-_` のみ、1〜10文字
- コードは原則変更禁止（移行時の例外のみ）、表示名は変更可能
- テナント別に管理（企業ごとに異なる単位体系を許容）

### スコープ

- **MVP範囲**: UoMGroup / UoM の CRUD（テナント別）
- **対象外（V2）**: 単位換算、荷姿、外部標準コードマッピング

### エンティティ参照

- [09_単位・単位グループ エンティティ定義](../../spec_doc/61_機能設計検討/02_エンティティ定義/09_単位・単位グループ.md)

#### エンティティ整合チェックリスト

- [ ] uom_groups: id, tenant_id, uom_group_code, uom_group_name, description, base_uom_id, is_active, audit columns
- [ ] uoms: id, tenant_id, uom_group_id, uom_code, uom_name, uom_symbol, is_active, audit columns
- [ ] UNIQUE制約: (tenant_id, uom_group_code), (tenant_id, uom_code)
- [ ] 循環参照: uom_groups.base_uom_id → uoms.id, uoms.uom_group_id → uom_groups.id

---

## Requirements

### Requirement 1: 単位グループ一覧表示

**Objective:** As a 購買担当者, I want 単位グループの一覧を確認したい, so that 登録済みの単位グループを把握できる

#### Acceptance Criteria

1. When ユーザーが単位グループ一覧画面にアクセスする, the Unit Master Service shall 当該テナントの単位グループ一覧を取得して表示する
2. When ユーザーがキーワード検索を実行する, the Unit Master Service shall uom_group_code または uom_group_name に部分一致する単位グループを絞り込み表示する
3. When ユーザーが有効/無効フィルタを選択する, the Unit Master Service shall is_active の値に基づいて単位グループを絞り込み表示する
4. When ユーザーがソート条件を変更する, the Unit Master Service shall 指定されたカラム（groupCode, groupName, isActive）で昇順または降順にソートする
5. The Unit Master Service shall ページネーション（デフォルト50件、最大200件）を提供する

### Requirement 2: 単位グループ登録

**Objective:** As a マスタ管理者, I want 新しい単位グループを登録したい, so that 業務で使用する単位の互換枠を定義できる

#### Acceptance Criteria

1. When ユーザーが単位グループ登録画面で必須項目（uom_group_code, uom_group_name, base_uom）を入力して保存する, the Unit Master Service shall 新しい単位グループを作成する
2. When ユーザーが uom_group_code に1〜10文字の英数字大文字または`-`/`_`以外の文字を入力する, the Unit Master Service shall バリデーションエラーを返す
3. When ユーザーが既存の uom_group_code と重複するコードを入力する, the Unit Master Service shall 重複エラーを返す
4. When 単位グループが正常に作成される, the Unit Master Service shall 同一トランザクション内で基準単位（UoM）も作成し、相互参照を確立する
5. The Unit Master Service shall 作成時に監査情報（created_at, created_by）を記録する

### Requirement 3: 単位グループ更新

**Objective:** As a マスタ管理者, I want 既存の単位グループ情報を更新したい, so that 表示名や説明を修正できる

#### Acceptance Criteria

1. When ユーザーが単位グループの uom_group_name または description を変更して保存する, the Unit Master Service shall 単位グループを更新する
2. When ユーザーが uom_group_code を変更しようとする, the Unit Master Service shall コード変更禁止エラーを返す（移行例外を除く）
3. When ユーザーが基準単位（base_uom）を同一グループ内の別単位に変更する, the Unit Master Service shall base_uom_id を更新する
4. If 選択された基準単位が同一 uom_group に所属していない, then the Unit Master Service shall バリデーションエラーを返す
5. While 他のユーザーが同一レコードを更新中, the Unit Master Service shall 楽観ロックにより競合を検出し、競合エラーを返す
6. The Unit Master Service shall 更新時に監査情報（updated_at, updated_by）を記録する

### Requirement 4: 単位グループ無効化

**Objective:** As a マスタ管理者, I want 不要になった単位グループを無効化したい, so that 新規選択肢から除外できる

#### Acceptance Criteria

1. When ユーザーが単位グループを無効化する, the Unit Master Service shall is_active を false に設定する
2. When ユーザーが無効化された単位グループを再有効化する, the Unit Master Service shall is_active を true に設定する
3. If 無効化対象の単位グループに所属する有効な単位が存在する, then the Unit Master Service shall 警告を表示し、確認後に無効化を実行する
4. The Unit Master Service shall 物理削除は実行しない（論理削除のみ）

### Requirement 5: 単位一覧表示

**Objective:** As a 購買担当者, I want 単位の一覧を確認したい, so that 登録済みの単位を把握できる

#### Acceptance Criteria

1. When ユーザーが単位一覧画面にアクセスする, the Unit Master Service shall 当該テナントの単位一覧を取得して表示する
2. When ユーザーが特定の単位グループでフィルタする, the Unit Master Service shall 指定グループに所属する単位のみを表示する
3. When ユーザーがキーワード検索を実行する, the Unit Master Service shall uom_code または uom_name に部分一致する単位を絞り込み表示する
4. When ユーザーがソート条件を変更する, the Unit Master Service shall 指定されたカラム（uomCode, uomName, groupCode, isActive）で昇順または降順にソートする
5. The Unit Master Service shall 各単位が基準単位（base_uom）かどうかを表示する

### Requirement 6: 単位登録

**Objective:** As a マスタ管理者, I want 新しい単位を登録したい, so that 品目や伝票で使用する数量単位を追加できる

#### Acceptance Criteria

1. When ユーザーが単位登録画面で必須項目（uom_code, uom_name, uom_group_id）を入力して保存する, the Unit Master Service shall 新しい単位を作成する
2. When ユーザーが uom_code に1〜10文字の英数字大文字または`-`/`_`以外の文字を入力する, the Unit Master Service shall バリデーションエラーを返す
3. When ユーザーが既存の uom_code と重複するコードを入力する, the Unit Master Service shall 重複エラーを返す
4. When ユーザーが uom_symbol（任意）を入力する, the Unit Master Service shall 帳票表示用の記号として保存する
5. The Unit Master Service shall 作成時に監査情報（created_at, created_by）を記録する

### Requirement 7: 単位更新

**Objective:** As a マスタ管理者, I want 既存の単位情報を更新したい, so that 表示名や記号を修正できる

#### Acceptance Criteria

1. When ユーザーが単位の uom_name または uom_symbol を変更して保存する, the Unit Master Service shall 単位を更新する
2. When ユーザーが uom_code を変更しようとする, the Unit Master Service shall コード変更禁止エラーを返す（移行例外を除く）
3. When ユーザーが所属グループ（uom_group_id）を変更しようとする, the Unit Master Service shall グループ変更禁止エラーを返す
4. While 他のユーザーが同一レコードを更新中, the Unit Master Service shall 楽観ロックにより競合を検出し、競合エラーを返す
5. The Unit Master Service shall 更新時に監査情報（updated_at, updated_by）を記録する

### Requirement 8: 単位無効化

**Objective:** As a マスタ管理者, I want 不要になった単位を無効化したい, so that 新規選択肢から除外できる

#### Acceptance Criteria

1. When ユーザーが単位を無効化する, the Unit Master Service shall is_active を false に設定する
2. When ユーザーが無効化された単位を再有効化する, the Unit Master Service shall is_active を true に設定する
3. If 無効化対象の単位が単位グループの基準単位（base_uom）として設定されている, then the Unit Master Service shall 無効化を禁止し、エラーを返す
4. If 無効化対象の単位が品目の base_uom_id または purchase_uom_id として使用されている, then the Unit Master Service shall 無効化を禁止し、使用中エラーを返す
5. The Unit Master Service shall 物理削除は実行しない（論理削除のみ）

### Requirement 9: 単位選択（サジェスト/検索）

**Objective:** As a 購買担当者, I want 品目登録時に単位を素早く選択したい, so that 効率的に入力できる

#### Acceptance Criteria

1. When ユーザーが単位選択フィールドで文字を入力する, the Unit Master Service shall uom_code または uom_name に前方一致する有効な単位をサジェストする
2. When ユーザーが特定の単位グループを指定して検索する, the Unit Master Service shall 指定グループ内の有効な単位のみをサジェストする
3. The Unit Master Service shall サジェスト結果は最大20件まで表示する

### Requirement 10: マルチテナント分離

**Objective:** As a システム管理者, I want テナント間のデータが完全に分離されていることを保証したい, so that 他テナントのデータにアクセスできない

#### Acceptance Criteria

1. The Unit Master Service shall すべてのクエリで tenant_id によるフィルタリングを実行する
2. The Unit Master Service shall Row Level Security（RLS）により、DBレベルでテナント分離を強制する
3. If 他テナントのデータにアクセスしようとする, then the Unit Master Service shall NOT_FOUND エラーを返す（存在を開示しない）

### Requirement 11: 監査ログ

**Objective:** As a 内部統制担当者, I want 単位マスタの変更履歴を追跡したい, so that 監査対応ができる

#### Acceptance Criteria

1. When 単位グループまたは単位が作成される, the Unit Master Service shall created_at と created_by_login_account_id を記録する
2. When 単位グループまたは単位が更新される, the Unit Master Service shall updated_at と updated_by_login_account_id を記録する
3. The Unit Master Service shall 監査ログには操作者（user_id）、操作日時、操作種別（create/update/activate/deactivate）を含める

### Requirement 12: 権限制御

**Objective:** As a システム管理者, I want 単位マスタの操作権限を制御したい, so that 適切なユーザーのみが変更できる

#### Acceptance Criteria

1. The Unit Master Service shall 一覧表示・詳細表示には `procure.unit.read` 権限を要求する
2. The Unit Master Service shall 登録・更新・無効化には `procure.unit.manage` 権限を要求する
3. While ユーザーが必要な権限を持っていない, the Unit Master Service shall 403 Forbidden エラーを返す
4. The Unit Master Service shall UI制御とAPI制御を一致させる（UIで操作できない機能はAPIでも実行できない）

---

## Out of Scope

以下の機能は本仕様の対象外とし、V2以降で検討する：

- **単位換算（UoM Conversion）**: 同一グループ内の固定換算（kg ↔ g 等）
- **荷姿（Package）**: 品目別換算（1箱 = 12個 等）
- **外部標準コード**: UNECE等の外部標準コードマッピング
- **取引先別コード**: 取引先ごとの単位コードマッピング
- **小数許容/整数強制**: 単位ごとの数量特性設定
- **品目マスタ連携**: items.base_uom_id / purchase_uom_id の設定（品目マスタ機能として実装）
- **伝票明細の単位制限**: 伝票機能側で実装

---

## Appendix: エラーコード一覧（想定）

| エラーコード | 説明 | HTTP Status |
|-------------|------|-------------|
| UOM_GROUP_NOT_FOUND | 単位グループが見つからない | 404 |
| UOM_NOT_FOUND | 単位が見つからない | 404 |
| UOM_GROUP_CODE_DUPLICATE | 単位グループコードが重複 | 409 |
| UOM_CODE_DUPLICATE | 単位コードが重複 | 409 |
| INVALID_UOM_GROUP_CODE_FORMAT | 単位グループコード形式不正 | 422 |
| INVALID_UOM_CODE_FORMAT | 単位コード形式不正 | 422 |
| CODE_CHANGE_NOT_ALLOWED | コード変更は許可されていない | 422 |
| GROUP_CHANGE_NOT_ALLOWED | グループ変更は許可されていない | 422 |
| BASE_UOM_NOT_IN_GROUP | 基準単位が同一グループに属していない | 422 |
| CANNOT_DEACTIVATE_BASE_UOM | 基準単位は無効化できない | 422 |
| UOM_IN_USE | 単位が品目で使用中のため無効化できない | 422 |
| CONCURRENT_UPDATE | 楽観ロック競合 | 409 |
