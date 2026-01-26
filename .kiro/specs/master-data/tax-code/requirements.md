# Requirements Document

## Introduction

本ドキュメントは、ProcureERP における **税コードマスタ（TaxCode）** 機能の要件を定義する。

税コードは、税区分（TaxBusinessCategory）と税率（TaxRate）を関連付けた **税計算および伝票保持の正本キー** である。伝票明細は税コードを直接参照し、税額計算・会計処理・税申告集計の基点として使用する。

税コードは以下の3要素を組み合わせて構成される：
- 税区分（TaxBusinessCategory）：税務・会計上の分類
- 税率（TaxRate）：消費税率（期間管理付き）
- 内税/外税区分（TaxInOut）：INCLUSIVE（内税）/ EXCLUSIVE（外税）

---

## Requirements

### Requirement 1: 税コード一覧表示

**Objective:** As a 購買担当者・管理者, I want 登録済みの税コードを一覧で確認したい, so that 伝票入力時に使用可能な税コードを把握できる

#### Acceptance Criteria

1. When ユーザーが税コードマスタ画面を開いた時, the 税コードマスタ Service shall テナントに紐づく税コード一覧を取得し表示する
2. The 税コードマスタ Service shall 税コード、税区分名、税率（%）、内税/外税、有効フラグを一覧に表示する
3. When ユーザーが検索条件（税コード、税区分、有効フラグ）を指定した時, the 税コードマスタ Service shall 条件に合致する税コードのみを表示する
4. The 税コードマスタ Service shall 一覧をページネーション付きで表示する（デフォルト20件/ページ）
5. When ユーザーがソートを指定した時, the 税コードマスタ Service shall 指定列（税コード、税区分名、税率）で昇順・降順ソートを行う

---

### Requirement 2: 税コード新規登録

**Objective:** As a 管理者, I want 新しい税コードを登録したい, so that 税区分と税率の組み合わせを伝票で使用できるようにする

#### Acceptance Criteria

1. When ユーザーが新規登録ボタンを押した時, the 税コードマスタ Service shall 税コード登録ダイアログを表示する
2. The 税コードマスタ Service shall 以下の入力項目を提供する：
   - 税コード（必須、手入力）
   - 税区分（必須、ドロップダウン選択）
   - 税率（必須、ドロップダウン選択）
   - 内税/外税区分（必須、ラジオボタン選択：内税/外税）
3. The 税コードマスタ Service shall 税区分ドロップダウンに有効な税区分（is_active = true）のみを表示する
4. The 税コードマスタ Service shall 税率ドロップダウンに有効な税率（is_active = true）のみを表示する
5. When ユーザーが登録を実行した時, the 税コードマスタ Service shall 入力値のバリデーションを行う
6. If 税コードが同一テナント内で重複している場合, then the 税コードマスタ Service shall エラーメッセージを表示し登録を拒否する
7. When バリデーションが成功した時, the 税コードマスタ Service shall 税コードレコードを作成し、一覧を更新する
8. The 税コードマスタ Service shall 新規登録時は is_active = true をデフォルトとする

---

### Requirement 3: 税コード編集

**Objective:** As a 管理者, I want 税コードの有効フラグを編集したい, so that 税コードの使用可否を調整できる

#### Acceptance Criteria

1. When ユーザーが一覧から税コードを選択した時, the 税コードマスタ Service shall 税コード編集ダイアログを表示する
2. The 税コードマスタ Service shall 税コードを編集不可（読み取り専用）として表示する
3. The 税コードマスタ Service shall 税区分を編集不可として表示する（税区分の変更は禁止、新規追加で対応）
4. The 税コードマスタ Service shall 税率を編集不可として表示する（税率の変更は禁止、新規追加で対応）
5. The 税コードマスタ Service shall 内税/外税区分を編集不可として表示する
6. The 税コードマスタ Service shall 有効フラグのみを編集可能とする
7. When バリデーションが成功した時, the 税コードマスタ Service shall 税コードレコードを更新し、一覧を更新する

---

### Requirement 4: 税コード無効化

**Objective:** As a 管理者, I want 不要な税コードを無効化したい, so that 伝票入力時の選択肢から除外できる

#### Acceptance Criteria

1. The 税コードマスタ Service shall 物理削除を禁止し、is_active = false による論理無効化のみを許可する
2. When ユーザーが税コードを無効化した時, the 税コードマスタ Service shall is_active を false に更新する
3. While 税コードが無効（is_active = false）の場合, the 税コードマスタ Service shall 伝票入力時の税コード選択肢から当該税コードを除外する
4. The 税コードマスタ Service shall 無効化された税コードも一覧画面で表示可能とする（フィルタで切替）

---

### Requirement 5: 税区分・税率参照API

**Objective:** As a 税コードマスタUI, I want 税区分と税率の一覧を取得したい, so that ドロップダウン選択肢を表示できる

#### Acceptance Criteria

1. The 税コードマスタ Service shall 有効な税区分一覧を取得するAPIを提供する
2. The 税コードマスタ Service shall 有効な税率一覧を取得するAPIを提供する
3. The 税区分一覧API shall 税区分コード、税区分名を返却する
4. The 税率一覧API shall 税率コード、税率（%）、適用開始日、適用終了日を返却する

---

### Requirement 6: マルチテナント・監査対応

**Objective:** As a システム管理者, I want 税コードデータがテナント分離され監査可能であること, so that セキュリティと追跡性を確保できる

#### Acceptance Criteria

1. The 税コードマスタ Service shall すべての税コードレコードに tenant_id を持たせる
2. The 税コードマスタ Service shall RLS（Row Level Security）により他テナントのデータを参照不可とする
3. The 税コードマスタ Service shall 税コードの作成・更新時に監査ログ（created_by, created_at, updated_by, updated_at）を記録する
4. The 税コードマスタ Service shall 楽観ロック（version）を実装し、同時更新を検知する

---

### Requirement 7: 権限制御

**Objective:** As a システム, I want 税コードマスタの操作を権限で制御したい, so that 適切なユーザーのみが編集できる

#### Acceptance Criteria

1. The 税コードマスタ Service shall `procure.tax-code.read` 権限を持つユーザーのみ一覧表示を許可する
2. The 税コードマスタ Service shall `procure.tax-code.create` 権限を持つユーザーのみ新規登録を許可する
3. The 税コードマスタ Service shall `procure.tax-code.update` 権限を持つユーザーのみ編集・無効化を許可する
4. While ユーザーが必要な権限を持たない場合, the 税コードマスタ Service shall 該当操作のUIを非表示または無効化する
5. If 権限のないユーザーがAPIを直接呼び出した場合, then the 税コードマスタ Service shall 403エラーを返却する
