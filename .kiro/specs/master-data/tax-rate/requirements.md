# Requirements Document

## Introduction

本ドキュメントは、ProcureERP における **税率マスタ（TaxRate）** 機能の要件を定義する。

税率マスタは、消費税率を期間管理付きで保持するマスタであり、税制改定（例：8%→10%）に対応可能な設計とする。過去伝票は登録時点の税率を参照し続けるため、税率レコードは追加方式で管理し、既存レコードの税率値は変更しない。

本機能のスコープには、税率マスタの CRUD 画面に加え、**税区分（TaxBusinessCategory）エンティティの定義およびシードデータ投入**を含む。税区分は画面を持たず、初期データとして投入される参照専用マスタである。

---

## Requirements

### Requirement 1: 税率一覧表示

**Objective:** As a 購買担当者・管理者, I want 登録済みの税率を一覧で確認したい, so that 現在有効な税率や過去の税率を把握できる

#### Acceptance Criteria

1. When ユーザーが税率マスタ画面を開いた時, the 税率マスタ Service shall テナントに紐づく税率一覧を取得し表示する
2. The 税率マスタ Service shall 税率コード、税率（%）、適用開始日、適用終了日、有効フラグを一覧に表示する
3. When ユーザーが検索条件（税率コード、有効フラグ）を指定した時, the 税率マスタ Service shall 条件に合致する税率のみを表示する
4. The 税率マスタ Service shall 一覧をページネーション付きで表示する（デフォルト20件/ページ）
5. When ユーザーがソートを指定した時, the 税率マスタ Service shall 指定列（税率コード、適用開始日、税率）で昇順・降順ソートを行う

---

### Requirement 2: 税率新規登録

**Objective:** As a 管理者, I want 新しい税率を登録したい, so that 税制改定時に新しい税率を追加できる

#### Acceptance Criteria

1. When ユーザーが新規登録ボタンを押した時, the 税率マスタ Service shall 税率登録ダイアログを表示する
2. The 税率マスタ Service shall 以下の入力項目を提供する：税率コード（必須）、税率（必須、小数点以下2桁まで）、適用開始日（必須）、適用終了日（任意）
3. When ユーザーが登録を実行した時, the 税率マスタ Service shall 入力値のバリデーションを行う
4. If 税率コードが同一テナント内で重複している場合, then the 税率マスタ Service shall エラーメッセージを表示し登録を拒否する
5. If 適用終了日が適用開始日より前の場合, then the 税率マスタ Service shall エラーメッセージを表示し登録を拒否する
6. When バリデーションが成功した時, the 税率マスタ Service shall 税率レコードを作成し、一覧を更新する
7. The 税率マスタ Service shall 新規登録時は is_active = true をデフォルトとする

---

### Requirement 3: 税率編集

**Objective:** As a 管理者, I want 税率の適用期間や有効フラグを編集したい, so that 税率の適用範囲を調整できる

#### Acceptance Criteria

1. When ユーザーが一覧から税率を選択した時, the 税率マスタ Service shall 税率編集ダイアログを表示する
2. The 税率マスタ Service shall 税率コードを編集不可（読み取り専用）として表示する
3. The 税率マスタ Service shall 税率（%）を編集不可として表示する（税率値の変更は禁止、新規追加で対応）
4. The 税率マスタ Service shall 適用開始日、適用終了日、有効フラグを編集可能とする
5. If 編集後の適用終了日が適用開始日より前の場合, then the 税率マスタ Service shall エラーメッセージを表示し更新を拒否する
6. When バリデーションが成功した時, the 税率マスタ Service shall 税率レコードを更新し、一覧を更新する

---

### Requirement 4: 税率無効化

**Objective:** As a 管理者, I want 不要な税率を無効化したい, so that 伝票入力時の選択肢から除外できる

#### Acceptance Criteria

1. The 税率マスタ Service shall 物理削除を禁止し、is_active = false による論理無効化のみを許可する
2. When ユーザーが税率を無効化した時, the 税率マスタ Service shall is_active を false に更新する
3. While 税率が無効（is_active = false）の場合, the 税率マスタ Service shall 伝票入力時の税率選択肢から当該税率を除外する
4. The 税率マスタ Service shall 無効化された税率も一覧画面で表示可能とする（フィルタで切替）

---

### Requirement 5: 税区分エンティティ定義（シードデータ）

**Objective:** As a システム, I want 税区分マスタを初期データとして保持したい, so that 税コード作成時に税区分を参照できる

#### Acceptance Criteria

1. The システム shall 以下の税区分をシードデータとして投入する：
   - TAXABLE_SALES（課税売上）
   - TAXABLE_PURCHASE（課税仕入）
   - COMMON_TAXABLE_PURCHASE（共通課税仕入）
   - NON_TAXABLE（非課税取引）
   - TAX_EXEMPT（免税取引）
   - OUT_OF_SCOPE（対象外取引）
2. The 税区分エンティティ shall tenant_id, tax_business_category_code, tax_business_category_name, description, is_active を持つ
3. The システム shall UNIQUE(tenant_id, tax_business_category_code) 制約を適用する
4. The システム shall 税区分の物理削除を禁止する
5. The 税区分マスタ shall 画面を持たず、シードデータとしてのみ管理される

---

### Requirement 6: マルチテナント・監査対応

**Objective:** As a システム管理者, I want 税率データがテナント分離され監査可能であること, so that セキュリティと追跡性を確保できる

#### Acceptance Criteria

1. The 税率マスタ Service shall すべての税率レコードに tenant_id を持たせる
2. The 税率マスタ Service shall RLS（Row Level Security）により他テナントのデータを参照不可とする
3. The 税率マスタ Service shall 税率の作成・更新時に監査ログ（created_by, created_at, updated_by, updated_at）を記録する
4. The 税区分マスタ Service shall 同様に tenant_id および監査カラムを持つ

---

### Requirement 7: 権限制御

**Objective:** As a システム, I want 税率マスタの操作を権限で制御したい, so that 適切なユーザーのみが編集できる

#### Acceptance Criteria

1. The 税率マスタ Service shall `procure.tax-rate.read` 権限を持つユーザーのみ一覧表示を許可する
2. The 税率マスタ Service shall `procure.tax-rate.create` 権限を持つユーザーのみ新規登録を許可する
3. The 税率マスタ Service shall `procure.tax-rate.update` 権限を持つユーザーのみ編集・無効化を許可する
4. While ユーザーが必要な権限を持たない場合, the 税率マスタ Service shall 該当操作のUIを非表示または無効化する
5. If 権限のないユーザーがAPIを直接呼び出した場合, then the 税率マスタ Service shall 403エラーを返却する
