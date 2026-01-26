# Requirements Document

## Introduction

本ドキュメントは、ProcureERP（購買管理SaaS）における **品目仕様属性マスタ（Item Attribute Master）** 機能の要件仕様を定義する。

### 機能概要

品目仕様属性マスタは、品目のSKU（バリエーション）を構成する仕様属性（例：色、サイズ、材質）と、その選択肢となる属性値（例：赤/青、S/M/L）を管理するマスタ機能である。

品目マスタでSKUを作成する際、本マスタで定義された仕様属性・属性値を選択してSKUの仕様を確定する。

### 対象エンティティ

- **ItemAttribute（仕様属性）**: SKUを構成する仕様の軸を定義（例：色、サイズ、材質）
- **ItemAttributeValue（属性値）**: 各仕様属性の選択肢を定義（例：色=赤/青/緑）

### 主要な設計方針

- 仕様属性はテナント内で共通定義（複数の品目で同じ属性を使用可能）
- MVPでは属性値は「選択リスト（SELECT）」形式のみ（自由入力はV2対応）
- 属性コード・値コードは原則変更禁止（移行時の例外のみ）
- 属性コード（item_attribute_code）: 英数字大文字 + `-_` のみ、1〜20文字
- 値コード（value_code）: 英数字大文字 + `-_` のみ、1〜30文字
- テナント別に管理（企業ごとに異なる仕様属性体系を許容）

### スコープ

- **MVP範囲**: ItemAttribute / ItemAttributeValue の CRUD（テナント別）、サジェスト
- **対象外（V2）**: 自由入力属性（INSTANCE_KEY）、属性のグルーピング、属性の継承

### エンティティ参照

- [06_品目関係 エンティティ定義](../../spec_doc/61_機能設計検討/02_エンティティ定義/06_品目関係.md)

### 依存マスタ

本マスタは他のマスタに依存しない独立したマスタである。
ただし、品目マスタ（item-master）がSKU作成時に本マスタを参照する。

```
[依存関係図]
item-attribute (本マスタ)
    │
    └──► item-master (後続)
           └── item_variants
               └── item_variant_attributes (本マスタの属性値を参照)
```

#### エンティティ整合チェックリスト

- [ ] item_attributes: id, tenant_id, item_attribute_code, item_attribute_name, value_type, sort_order, is_active, version, audit columns
- [ ] item_attribute_values: id, tenant_id, item_attribute_id, value_code, value_name, sort_order, is_active, version, audit columns
- [ ] UNIQUE制約: (tenant_id, item_attribute_code), (tenant_id, item_attribute_id, value_code)
- [ ] version カラム追加（楽観ロック用）

---

## Requirements

### Requirement 1: 仕様属性一覧表示

**Objective:** As a マスタ管理者, I want 仕様属性の一覧を確認したい, so that 登録済みの仕様属性を把握できる

#### Acceptance Criteria

1. When ユーザーが仕様属性一覧画面にアクセスする, the Item Attribute Service shall 当該テナントの仕様属性一覧を取得して表示する
2. When ユーザーがキーワード検索を実行する, the Item Attribute Service shall item_attribute_code または item_attribute_name に部分一致する仕様属性を絞り込み表示する
3. When ユーザーが有効/無効フィルタを選択する, the Item Attribute Service shall is_active の値に基づいて仕様属性を絞り込み表示する
4. When ユーザーがソート条件を変更する, the Item Attribute Service shall 指定されたカラム（attributeCode, attributeName, sortOrder, isActive）で昇順または降順にソートする
5. The Item Attribute Service shall ページネーション（デフォルト50件、最大200件）を提供する
6. The Item Attribute Service shall 各仕様属性の属性値件数を一覧に表示する

### Requirement 2: 仕様属性登録

**Objective:** As a マスタ管理者, I want 新しい仕様属性を登録したい, so that 品目のSKU作成時に使用する仕様軸を定義できる

#### Acceptance Criteria

1. When ユーザーが仕様属性登録画面で必須項目（item_attribute_code, item_attribute_name）を入力して保存する, the Item Attribute Service shall 新しい仕様属性を作成する
2. When ユーザーが item_attribute_code に1〜20文字の英数字大文字または`-`/`_`以外の文字を入力する, the Item Attribute Service shall バリデーションエラーを返す
3. When ユーザーが既存の item_attribute_code と重複するコードを入力する, the Item Attribute Service shall 重複エラーを返す
4. When ユーザーが sort_order を入力する, the Item Attribute Service shall 一覧での表示順として保存する
5. The Item Attribute Service shall value_type は MVP では 'SELECT' 固定とし、ユーザー入力不可とする
6. The Item Attribute Service shall 作成時に監査情報（created_at, created_by）を記録する

### Requirement 3: 仕様属性更新

**Objective:** As a マスタ管理者, I want 既存の仕様属性情報を更新したい, so that 表示名や表示順を修正できる

#### Acceptance Criteria

1. When ユーザーが仕様属性の item_attribute_name または sort_order を変更して保存する, the Item Attribute Service shall 仕様属性を更新する
2. When ユーザーが item_attribute_code を変更しようとする, the Item Attribute Service shall コード変更禁止エラーを返す（移行例外を除く）
3. While 他のユーザーが同一レコードを更新中, the Item Attribute Service shall 楽観ロックにより競合を検出し、競合エラーを返す
4. The Item Attribute Service shall 更新時に監査情報（updated_at, updated_by）を記録する

### Requirement 4: 仕様属性無効化

**Objective:** As a マスタ管理者, I want 不要になった仕様属性を無効化したい, so that 新規選択肢から除外できる

#### Acceptance Criteria

1. When ユーザーが仕様属性を無効化する, the Item Attribute Service shall is_active を false に設定する
2. When ユーザーが無効化された仕様属性を再有効化する, the Item Attribute Service shall is_active を true に設定する
3. If 無効化対象の仕様属性がSKU仕様（item_variant_attributes）で使用されている場合, then the Item Attribute Service shall 警告を表示し、確認後に無効化を実行する
4. The Item Attribute Service shall 物理削除は実行しない（論理削除のみ）

### Requirement 5: 属性値一覧表示

**Objective:** As a マスタ管理者, I want 仕様属性に属する属性値の一覧を確認したい, so that 登録済みの選択肢を把握できる

#### Acceptance Criteria

1. When ユーザーが仕様属性詳細画面を表示する, the Item Attribute Service shall 当該仕様属性に属する属性値一覧を sort_order 順で表示する
2. When ユーザーがキーワード検索を実行する, the Item Attribute Service shall value_code または value_name に部分一致する属性値を絞り込み表示する
3. When ユーザーが有効/無効フィルタを選択する, the Item Attribute Service shall is_active の値に基づいて属性値を絞り込み表示する
4. The Item Attribute Service shall ページネーション（デフォルト50件、最大200件）を提供する

### Requirement 6: 属性値登録

**Objective:** As a マスタ管理者, I want 仕様属性に属性値を追加したい, so that SKU作成時の選択肢を増やせる

#### Acceptance Criteria

1. When ユーザーが属性値登録画面で必須項目（value_code, value_name）を入力して保存する, the Item Attribute Service shall 新しい属性値を作成する
2. When ユーザーが value_code に1〜30文字の英数字大文字または`-`/`_`以外の文字を入力する, the Item Attribute Service shall バリデーションエラーを返す
3. When ユーザーが同一仕様属性内で既存の value_code と重複するコードを入力する, the Item Attribute Service shall 重複エラーを返す
4. When ユーザーが sort_order を入力する, the Item Attribute Service shall 一覧での表示順として保存する
5. The Item Attribute Service shall 作成時に監査情報（created_at, created_by）を記録する

### Requirement 7: 属性値更新

**Objective:** As a マスタ管理者, I want 既存の属性値情報を更新したい, so that 表示名や表示順を修正できる

#### Acceptance Criteria

1. When ユーザーが属性値の value_name または sort_order を変更して保存する, the Item Attribute Service shall 属性値を更新する
2. When ユーザーが value_code を変更しようとする, the Item Attribute Service shall コード変更禁止エラーを返す（移行例外を除く）
3. While 他のユーザーが同一レコードを更新中, the Item Attribute Service shall 楽観ロックにより競合を検出し、競合エラーを返す
4. The Item Attribute Service shall 更新時に監査情報（updated_at, updated_by）を記録する

### Requirement 8: 属性値無効化

**Objective:** As a マスタ管理者, I want 不要になった属性値を無効化したい, so that 新規選択肢から除外できる

#### Acceptance Criteria

1. When ユーザーが属性値を無効化する, the Item Attribute Service shall is_active を false に設定する
2. When ユーザーが無効化された属性値を再有効化する, the Item Attribute Service shall is_active を true に設定する
3. If 無効化対象の属性値がSKU仕様（item_variant_attributes）で使用されている場合, then the Item Attribute Service shall 警告を表示し、確認後に無効化を実行する
4. The Item Attribute Service shall 物理削除は実行しない（論理削除のみ）

### Requirement 9: 仕様属性サジェスト

**Objective:** As a 購買担当者, I want 品目SKU作成時に仕様属性を素早く選択したい, so that 効率的に入力できる

#### Acceptance Criteria

1. When ユーザーが仕様属性選択フィールドで文字を入力する, the Item Attribute Service shall item_attribute_code または item_attribute_name に前方一致する有効な仕様属性をサジェストする
2. The Item Attribute Service shall サジェスト結果は最大20件まで表示する
3. The Item Attribute Service shall 無効な仕様属性（is_active=false）はサジェスト対象から除外する

### Requirement 10: 属性値サジェスト

**Objective:** As a 購買担当者, I want 品目SKU作成時に属性値を素早く選択したい, so that 効率的に入力できる

#### Acceptance Criteria

1. When ユーザーが属性値選択フィールドで文字を入力する, the Item Attribute Service shall value_code または value_name に前方一致する有効な属性値をサジェストする
2. When ユーザーが特定の仕様属性を指定して検索する, the Item Attribute Service shall 指定属性内の有効な属性値のみをサジェストする
3. The Item Attribute Service shall サジェスト結果は最大20件まで表示する
4. The Item Attribute Service shall 無効な属性値（is_active=false）はサジェスト対象から除外する

### Requirement 11: マルチテナント分離

**Objective:** As a システム管理者, I want テナント間のデータが完全に分離されていることを保証したい, so that 他テナントのデータにアクセスできない

#### Acceptance Criteria

1. The Item Attribute Service shall すべてのクエリで tenant_id によるフィルタリングを実行する
2. The Item Attribute Service shall Row Level Security（RLS）により、DBレベルでテナント分離を強制する
3. If 他テナントのデータにアクセスしようとする, then the Item Attribute Service shall NOT_FOUND エラーを返す（存在を開示しない）

### Requirement 12: 監査ログ

**Objective:** As a 内部統制担当者, I want 仕様属性マスタの変更履歴を追跡したい, so that 監査対応ができる

#### Acceptance Criteria

1. When 仕様属性または属性値が作成される, the Item Attribute Service shall created_at と created_by_login_account_id を記録する
2. When 仕様属性または属性値が更新される, the Item Attribute Service shall updated_at と updated_by_login_account_id を記録する
3. The Item Attribute Service shall 監査ログには操作者（user_id）、操作日時、操作種別（create/update/activate/deactivate）を含める

### Requirement 13: 権限制御

**Objective:** As a システム管理者, I want 仕様属性マスタの操作権限を制御したい, so that 適切なユーザーのみが変更できる

#### Acceptance Criteria

1. The Item Attribute Service shall 一覧表示・詳細表示には `procure.item-attribute.read` 権限を要求する
2. The Item Attribute Service shall 登録・更新・無効化には `procure.item-attribute.manage` 権限を要求する
3. While ユーザーが必要な権限を持っていない, the Item Attribute Service shall 403 Forbidden エラーを返す
4. The Item Attribute Service shall UI制御とAPI制御を一致させる（UIで操作できない機能はAPIでも実行できない）

---

## Out of Scope

以下の機能は本仕様の対象外とし、V2以降で検討する：

- **自由入力属性（INSTANCE_KEY）**: テキスト入力形式の属性（ロット番号、シリアル番号等）
- **属性グルーピング**: 複数の仕様属性をグループ化して管理
- **属性の継承**: 品目カテゴリから仕様属性を継承
- **属性のソート順自動採番**: sort_order の自動インクリメント
- **属性値の一括インポート**: CSV/Excel からの一括登録

---

## UI画面構成

### 画面一覧

| 画面ID | 画面名 | パス | 概要 |
|--------|--------|------|------|
| IA-001 | 仕様属性一覧 | /master-data/item-attributes | 仕様属性の一覧表示・検索・フィルタ |
| IA-002 | 仕様属性登録ダイアログ | (ダイアログ) | 新規仕様属性の登録 |
| IA-003 | 仕様属性詳細/編集ダイアログ | (ダイアログ) | 仕様属性の詳細表示・編集・属性値管理 |
| IA-004 | 属性値登録ダイアログ | (ダイアログ) | 新規属性値の登録 |
| IA-005 | 属性値編集ダイアログ | (ダイアログ) | 属性値の編集 |

### 画面遷移

```
仕様属性一覧 (IA-001)
│
├─[新規作成ボタン] → 仕様属性登録ダイアログ (IA-002)
│                      └─[保存] → 仕様属性詳細/編集ダイアログ (IA-003)
│
└─[行クリック] → 仕様属性詳細/編集ダイアログ (IA-003)
                    │
                    ├─ 基本情報セクション（編集可能）
                    │
                    └─ 属性値一覧セクション
                        ├─[属性値追加ボタン] → 属性値登録ダイアログ (IA-004)
                        │                       └─[保存] → 属性値一覧に追加
                        │
                        └─[属性値行クリック] → 属性値編集ダイアログ (IA-005)
                                               └─[保存] → 属性値更新
```

### メニュー配置

```typescript
// apps/web/src/shared/navigation/menu.ts への追加
{
  id: "item-attribute",
  label: "Item Attributes",
  labelJa: "品目仕様属性",
  path: "/master-data/item-attributes",
  icon: Tags,  // lucide-react
}
```

---

## Appendix: エラーコード一覧

| エラーコード | 説明 | HTTP Status |
|-------------|------|-------------|
| ITEM_ATTRIBUTE_NOT_FOUND | 仕様属性が見つからない | 404 |
| ITEM_ATTRIBUTE_VALUE_NOT_FOUND | 属性値が見つからない | 404 |
| ITEM_ATTRIBUTE_CODE_DUPLICATE | 仕様属性コードが重複 | 409 |
| VALUE_CODE_DUPLICATE | 属性値コードが重複（同一属性内） | 409 |
| INVALID_ATTRIBUTE_CODE_FORMAT | 仕様属性コード形式不正 | 422 |
| INVALID_VALUE_CODE_FORMAT | 属性値コード形式不正 | 422 |
| CODE_CHANGE_NOT_ALLOWED | コード変更は許可されていない | 422 |
| ATTRIBUTE_IN_USE | 仕様属性がSKU仕様で使用中 | 422 |
| VALUE_IN_USE | 属性値がSKU仕様で使用中 | 422 |
| CONCURRENT_UPDATE | 楽観ロック競合 | 409 |

---

## Appendix: 関連エンティティとの参照関係

```
[本マスタ]
item_attributes (仕様属性)
    │
    └──► item_attribute_values (属性値)
              │
              │ [品目マスタから参照]
              ▼
         item_variant_attributes (SKU仕様)
              │
              └──► item_variants (SKU)
                       │
                       └──► items (品目)
```

### 参照先（本マスタが参照するエンティティ）

- なし（独立マスタ）

### 参照元（本マスタを参照するエンティティ）

- **item_variant_attributes**: SKU作成時に属性値を参照
- 品目マスタ（item-master）実装後に参照される

