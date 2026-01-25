# Requirements Document

## Introduction

社員所属履歴（employee_assignments）の管理機能。社員マスタから主務/兼務の所属部門を期間履歴で登録・管理する。

本機能は「組織基盤エンティティ定義（01_組織基盤エンティティ.md）」のemployee_assignmentsエンティティに準拠し、社員と部門の関係を期間付きで管理する。部門は`department_stable_id`（版非依存キー）で接続することで、組織改編に対する耐性を持つ。

### 関連エンティティ
- **employees（社員マスタ）**: 所属元の社員情報（既存実装済み）
- **departments（部門マスタ）**: 所属先の部門情報（既存実装済み）
- **organization_versions（組織バージョン）**: 部門が属する組織版（既存実装済み）

### 用語定義
- **主務（primary）**: 社員の主たる所属部門（同時期に1つのみ）
- **兼務（secondary）**: 社員の副次的所属部門（複数可）
- **stable_id**: 組織版を跨いで部門を識別する不変キー
- **按分率（allocation_ratio）**: 工数按分等に使用する割合（任意入力）

---

## Requirements

### Requirement 1: 所属情報の登録

**Objective:** As a 人事担当者, I want 社員の所属部門を期間付きで登録したい, so that 異動履歴を正確に管理できる

#### Acceptance Criteria

1. When ユーザーが所属登録画面で必須項目を入力して保存ボタンを押下した場合, the EmployeeAssignment API shall 新規の所属レコードを作成し、成功レスポンスを返却する
2. When 所属登録時に部門を選択する場合, the システム shall 現在有効な組織バージョンの部門一覧を表示し、選択された部門のstable_idを保存する
3. When 所属種別として「主務（primary）」を選択した場合, the システム shall 同一社員の同時期（有効期間が重複）に既存の主務がないか検証する
4. If 同一社員・同時期に既存の主務が存在する場合, then the API shall エラーコード DUPLICATE_PRIMARY_ASSIGNMENT を返却し、登録を拒否する
5. When 所属種別として「兼務（secondary）」を選択した場合, the システム shall 複数の兼務を許可し、同時期の重複チェックを行わない
6. The システム shall 有効開始日（effective_date）を必須項目とする
7. When 有効終了日（expiry_date）が入力された場合, the API shall 終了日が開始日より後であることを検証する
8. If 有効終了日が有効開始日以前の場合, then the API shall エラーコード INVALID_DATE_RANGE を返却する

---

### Requirement 2: 所属情報の一覧表示

**Objective:** As a 人事担当者, I want 社員の所属履歴を一覧で確認したい, so that 過去から現在までの異動状況を把握できる

#### Acceptance Criteria

1. When 社員詳細画面の所属タブを開いた場合, the BFF shall 対象社員の全所属履歴を有効開始日の降順で返却する
2. The 所属一覧 shall 以下の情報を表示する：部門名、所属種別（主務/兼務）、役職、有効開始日、有効終了日、按分率
3. When 所属レコードの有効期間が現在日を含む場合, the UI shall 「現在有効」であることを視覚的に識別可能にする
4. When 所属レコードが論理削除（is_active=false）されている場合, the BFF shall 当該レコードを一覧から除外する

---

### Requirement 3: 所属情報の編集

**Objective:** As a 人事担当者, I want 既存の所属情報を修正したい, so that 入力誤りや変更に対応できる

#### Acceptance Criteria

1. When ユーザーが所属一覧から特定のレコードを選択した場合, the UI shall 編集ダイアログを表示し、現在の値を初期表示する
2. When 編集内容を保存する場合, the API shall 楽観ロック（version）を用いて競合を検出する
3. If 他のユーザーによって既に更新されていた場合, then the API shall エラーコード OPTIMISTIC_LOCK_ERROR を返却する
4. When 主務の所属を編集して有効期間を変更した場合, the API shall 変更後も主務重複が発生しないことを検証する
5. The 編集機能 shall 部門の変更を許可する（異動として記録）

---

### Requirement 4: 所属情報の削除（論理削除）

**Objective:** As a 人事担当者, I want 誤って登録した所属情報を削除したい, so that データの正確性を維持できる

#### Acceptance Criteria

1. When ユーザーが所属レコードの削除を実行した場合, the API shall is_active を false に更新する（論理削除）
2. The API shall 物理削除を行わない
3. When 削除対象が唯一の主務である場合, the UI shall 警告メッセージを表示し、確認を求める
4. When 削除を確定した場合, the API shall 削除操作を監査ログに記録する

---

### Requirement 5: 部門選択（組織版連携）

**Objective:** As a 人事担当者, I want 最新の組織構造から部門を選択したい, so that 正確な部門情報を登録できる

#### Acceptance Criteria

1. When 部門選択UIを開いた場合, the BFF shall 現在有効な組織バージョンの部門ツリーを返却する
2. The 部門選択UI shall 部門を階層構造（ツリー）で表示する
3. When 部門が選択された場合, the システム shall departments.stable_id を employee_assignments.department_stable_id として保存する
4. The 所属一覧表示 shall stable_id から現在有効版の部門名を解決して表示する
5. When 組織改編により部門が新版に移行した場合, the システム shall stable_id を通じて継続的に部門を追跡可能とする

---

### Requirement 6: 役職・按分率の管理

**Objective:** As a 人事担当者, I want 所属に紐づく役職や按分率を管理したい, so that 組織構成を詳細に記録できる

#### Acceptance Criteria

1. The 所属登録/編集画面 shall 役職（title）入力欄を提供する（任意項目、最大100文字）
2. The 所属登録/編集画面 shall 按分率（allocation_ratio）入力欄を提供する（任意項目、0.00〜100.00の範囲）
3. When 按分率が入力された場合, the API shall 数値が0.00〜100.00の範囲内であることを検証する
4. If 按分率が範囲外の場合, then the API shall エラーコード INVALID_ALLOCATION_RATIO を返却する
5. The システム shall 按分率の合計が100%であることを強制しない（運用任意）

---

### Requirement 7: 社員マスタUIからの操作

**Objective:** As a ユーザー, I want 社員マスタ画面から所属情報にアクセスしたい, so that 社員情報と所属情報を一元的に管理できる

#### Acceptance Criteria

1. The 社員マスタ詳細画面 shall 「所属情報」タブを提供する
2. When 所属情報タブを選択した場合, the UI shall 当該社員の所属履歴一覧を表示する
3. The 所属情報タブ shall 新規登録ボタンを提供する
4. When 新規登録ボタンを押下した場合, the UI shall 所属登録ダイアログを表示する（社員IDは自動設定）
5. The 所属情報タブ shall 各レコードに対する編集・削除操作を提供する

---

### Requirement 8: マルチテナント・監査

**Objective:** As a システム管理者, I want テナント分離と操作履歴が保証されていることを確認したい, so that セキュリティと監査要件を満たせる

#### Acceptance Criteria

1. The employee_assignments テーブル shall tenant_id カラムを持ち、RLS（Row Level Security）を有効化する
2. The API shall すべてのデータアクセスにおいてtenant_idによるフィルタリングを適用する
3. When 所属情報が作成された場合, the システム shall created_at, created_by を記録する
4. When 所属情報が更新された場合, the システム shall updated_at, updated_by を記録する
5. The 監査ログ shall 所属の作成・更新・削除操作を記録する

---

### Requirement 9: 権限制御

**Objective:** As a システム管理者, I want 所属情報の操作権限を制御したい, so that 不正な変更を防止できる

#### Acceptance Criteria

1. The システム shall 以下の権限を定義する：
   - `procure.employee-assignment.read`: 所属情報の参照
   - `procure.employee-assignment.create`: 所属情報の登録
   - `procure.employee-assignment.update`: 所属情報の編集
   - `procure.employee-assignment.delete`: 所属情報の削除
2. If ユーザーが必要な権限を持たない場合, then the API shall 403 Forbidden を返却する
3. The UI shall 権限に応じて操作ボタンの表示/非表示を制御する

---

## Non-Functional Requirements

### Performance
- 所属一覧取得は1000件以下で1秒以内にレスポンスすること
- 部門ツリー取得は500件以下で1秒以内にレスポンスすること

### Data Integrity
- employee_assignments.department_stable_id は departments.stable_id への参照整合性を持つこと
- 有効期間の整合性（expiry_date > effective_date）はDB制約で保証すること
