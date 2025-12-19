# Requirements Document

## Introduction

本機能は、EPM SaaSにおける社員マスタ（Employee Master）の登録・管理機能を提供する。社員情報の一覧検索、詳細表示、作成、更新、無効化/再有効化を実現し、マルチテナント環境下で安全に運用可能なマスタ管理基盤を構築する。

本機能はContracts-first原則に従い、BFFでページング/ソートを正規化し、エラーハンドリングはPass-through方式を採用する。承認機能はMVP外とする。

## Decisions / Open Questions

### Decisions

**D-01**: employeeCode（社員コード）は作成後に変更不可

**D-02**: ページングは page/pageSize（default page=1, pageSize=50, max=200）

**D-03**: default sort = employeeCode asc

**D-04**: organizationKey は nullable、MVPではFK制約なし

### Open Questions

**OQ-04**: 再有効化はMVPに含める → Yes

## Functional Requirements (FR) 一覧

本機能の機能要件を以下に列挙する。詳細は各 Requirement を参照のこと。

- **FR-LIST-01**: 一覧（ページング/ソート/検索/無効含むオプション） - Requirement 1 参照
- **FR-LIST-02**: 詳細 - Requirement 2 参照
- **FR-LIST-03**: 作成 - Requirement 3 参照
- **FR-LIST-04**: 更新（employeeCode変更不可を含む） - Requirement 4 参照
- **FR-LIST-05**: 無効化 - Requirement 5 参照
- **FR-LIST-06**: 再有効化 - Requirement 6 参照
- **FR-LIST-07**: 権限制御 - Requirement 7 参照
- **FR-LIST-08**: テナント境界 - Requirement 8 参照
- **FR-LIST-09**: 監査ログ - Requirement 9 参照
- **FR-LIST-10**: BFF正規化 - Requirement 10 参照
- **FR-LIST-11**: Error Pass-through - Requirement 11 参照
- **FR-LIST-12**: Contracts-first - Requirement 12 参照
- **FR-LIST-13**: MVP外（承認） - Requirement 13 参照

## Requirements

### Requirement 1: 社員マスタ一覧検索・表示

**Objective:** As a 経営企画担当者 or FP&A担当者, I want 社員マスタの一覧を検索・表示できること, so that 社員情報を効率的に確認・参照できる

#### Acceptance Criteria

1. When ユーザーが社員マスタ一覧画面にアクセスしたとき, the Employee Master Service shall ページング情報とソート条件に基づいて社員一覧を返却する
2. When ユーザーが検索条件（社員コード、社員名等）を指定したとき, the Employee Master Service shall 条件に一致する社員のみを返却する
3. When ユーザーがソート条件（社員コード、社員名等）を指定したとき, the BFF shall ソート条件を正規化し、Domain APIへ伝達する
4. When ユーザーがページ番号とページサイズを指定したとき, the BFF shall ページング情報を正規化し、Domain APIへ伝達する
5. While テナント境界が設定されている状態で, the Employee Master Service shall 自テナントの社員のみを返却する
6. When 無効化された社員が存在する場合, the Employee Master Service shall デフォルトでは有効な社員のみを返却する（フィルタ条件で無効化社員も含めることは可能とする）

### Requirement 2: 社員マスタ詳細表示

**Objective:** As a 経営企画担当者 or FP&A担当者, I want 特定の社員の詳細情報を表示できること, so that 社員情報を正確に確認できる

#### Acceptance Criteria

1. When ユーザーが社員IDを指定して詳細情報を要求したとき, the Employee Master Service shall 該当社員の詳細情報を返却する
2. If 指定された社員IDが存在しない場合, the Employee Master Service shall 404エラーを返却する
3. If 指定された社員が他テナントに属する場合, the Employee Master Service shall 404エラーを返却する（存在しないものとして扱う）
4. When 詳細情報が返却されたとき, the Employee Master Service shall 社員の有効/無効状態を含む完全な情報を返却する

### Requirement 3: 社員マスタ作成

**Objective:** As a 経営企画担当者 or 管理者, I want 新しい社員情報を登録できること, so that 社員マスタを維持・更新できる

#### Acceptance Criteria

1. When ユーザーが必須項目を入力して社員作成を実行したとき, the Employee Master Service shall 新しい社員レコードを作成し、作成された社員情報を返却する
2. If 必須項目が未入力の場合, the Employee Master Service shall 422エラーを返却する
3. If 社員コードが既に同一テナント内で存在する場合, the Employee Master Service shall 409エラーを返却する
4. When 社員が作成されたとき, the Employee Master Service shall デフォルトで有効状態として作成する
5. When 社員が作成されたとき, the Employee Master Service shall 作成者情報（user_id）と作成日時を記録する
6. While テナント境界が設定されている状態で, the Employee Master Service shall 自テナントの社員として作成する

### Requirement 4: 社員マスタ更新

**Objective:** As a 経営企画担当者 or 管理者, I want 既存の社員情報を更新できること, so that 社員情報の変更を反映できる

#### Acceptance Criteria

1. When ユーザーが社員IDと更新内容を指定して更新を実行したとき, the Employee Master Service shall 該当社員情報を更新し、更新後の情報を返却する
2. If 指定された社員IDが存在しない場合, the Employee Master Service shall 404エラーを返却する
3. If 指定された社員が他テナントに属する場合, the Employee Master Service shall 404エラーを返却する
4. If 更新リクエストにemployeeCodeが含まれている場合, the Employee Master Service shall 422エラー（validation error）を返却する（employeeCodeは作成後に変更不可）
5. If 更新後の社員コードが同一テナント内の他の社員と重複する場合, the Employee Master Service shall 409エラーを返却する
6. When 社員が更新されたとき, the Employee Master Service shall 更新者情報（user_id）と更新日時を記録する
7. While テナント境界が設定されている状態で, the Employee Master Service shall 自テナントの社員のみを更新可能とする

### Requirement 5: 社員マスタ無効化

**Objective:** As a 経営企画担当者 or 管理者, I want 社員を無効化できること, so that 退職者等の社員を論理削除できる

#### Acceptance Criteria

1. When ユーザーが社員IDを指定して無効化を実行したとき, the Employee Master Service shall 該当社員を無効状態に変更する
2. If 指定された社員IDが存在しない場合, the Employee Master Service shall 404エラーを返却する
3. If 指定された社員が既に無効状態の場合, the Employee Master Service shall 409エラーを返却する
4. When 社員が無効化されたとき, the Employee Master Service shall 無効化者情報（user_id）と無効化日時を記録する
5. While テナント境界が設定されている状態で, the Employee Master Service shall 自テナントの社員のみを無効化可能とする

### Requirement 6: 社員マスタ再有効化

**Objective:** As a 経営企画担当者 or 管理者, I want 無効化された社員を再有効化できること, so that 誤って無効化した社員を復元できる

#### Acceptance Criteria

1. When ユーザーが無効化された社員IDを指定して再有効化を実行したとき, the Employee Master Service shall 該当社員を有効状態に変更する
2. If 指定された社員IDが存在しない場合, the Employee Master Service shall 404エラーを返却する
3. If 指定された社員が既に有効状態の場合, the Employee Master Service shall 409エラーを返却する
4. When 社員が再有効化されたとき, the Employee Master Service shall 再有効化者情報（user_id）と再有効化日時を記録する
5. While テナント境界が設定されている状態で, the Employee Master Service shall 自テナントの社員のみを再有効化可能とする

### Requirement 7: 権限・認可制御

**Objective:** As a システム管理者, I want 社員マスタ操作に適切な権限制御を実装すること, so that 不正な操作を防止できる

#### Acceptance Criteria

1. When ユーザーが社員マスタ一覧を参照しようとしたとき, the Employee Master Service shall `epm.employee-master.read` 権限をチェックする
2. When ユーザーが社員マスタ詳細を参照しようとしたとき, the Employee Master Service shall `epm.employee-master.read` 権限をチェックする
3. When ユーザーが社員マスタを作成しようとしたとき, the Employee Master Service shall `epm.employee-master.create` 権限をチェックする
4. When ユーザーが社員マスタを更新しようとしたとき, the Employee Master Service shall `epm.employee-master.update` 権限をチェックする
5. When ユーザーが社員マスタを無効化しようとしたとき, the Employee Master Service shall `epm.employee-master.update` 権限をチェックする
6. When ユーザーが社員マスタを再有効化しようとしたとき, the Employee Master Service shall `epm.employee-master.update` 権限をチェックする
7. If ユーザーが必要な権限を持たない場合, the Employee Master Service shall 403エラーを返却する
8. The UI制御とAPI制御は必ず一致させること（UIで操作できない機能はAPIでも実行できてはならない）

### Requirement 8: マルチテナント境界

**Objective:** As a SaaS運用者, I want テナント間でデータが分離されること, so that データの安全性とプライバシーを保証できる

#### Acceptance Criteria

1. The Employee Master Service shall すべての社員レコードにtenant_idを持たせる
2. When 社員マスタ操作が実行されたとき, the Employee Master Service shall 認証情報からtenant_idを解決し、操作対象をテナント境界内に限定する
3. The Repository shall すべてのDBアクセスでtenant_idを必須パラメータとして受け取る
4. The RLS（Row Level Security）は常に有効とし、テナント境界を強制する
5. When 他テナントの社員IDが指定された場合, the Employee Master Service shall 404エラーを返却する（存在しないものとして扱う）

### Requirement 9: 監査・トレーサビリティ

**Objective:** As a 監査担当者, I want 社員マスタ操作の履歴を追跡できること, so that 変更の説明責任を果たせる

#### Acceptance Criteria

1. When 社員が作成されたとき, the Employee Master Service shall 監査ログに以下を記録する: tenant_id, user_id, 操作種別（create）, 対象社員ID, 作成日時
2. When 社員が更新されたとき, the Employee Master Service shall 監査ログに以下を記録する: tenant_id, user_id, 操作種別（update）, 対象社員ID, 変更前後の値（主要項目）, 更新日時
3. When 社員が無効化されたとき, the Employee Master Service shall 監査ログに以下を記録する: tenant_id, user_id, 操作種別（deactivate）, 対象社員ID, 無効化日時
4. When 社員が再有効化されたとき, the Employee Master Service shall 監査ログに以下を記録する: tenant_id, user_id, 操作種別（reactivate）, 対象社員ID, 再有効化日時
5. The 監査ログのuser_idは認証プロバイダID（Clerk等）を正本とする

### Requirement 10: BFFによるページング・ソート正規化

**Objective:** As a UI開発者, I want BFFがページング・ソートを正規化すること, so that UIとDomain APIの責務を分離できる

#### Acceptance Criteria

1. When UIからページング情報（page, pageSize）が送信されたとき, the BFF shall これをDomain API向けの形式（offset, limit等）に正規化する
2. When UIからソート条件（sortBy, sortOrder）が送信されたとき, the BFF shall DTO側キー（camelCase）を採用し、DB列名（snake_case）をDomain APIへ露出させない
3. The BFFはページング・ソートの正規化のみを行い、ビジネスロジックの判断は行わない

### Requirement 11: エラーハンドリング（Pass-through）

**Objective:** As a システム設計者, I want BFFがエラーをPass-throughすること, so that Domain APIのエラー判断を正本として維持できる

#### Acceptance Criteria

1. When Domain APIからエラーが返却されたとき, the BFF shall エラーを意味的に再分類・書き換えることなく、そのままUIへ返却する
2. The BFFはログ付与等の非機能的な処理は許可するが、エラーの意味的な変更は禁止する
3. The 最終的な拒否（403/404/409/422等）の正本はDomain APIとする
4. The BFFが独自のビジネス判断を持つことは禁止する

### Requirement 12: Contracts-first原則

**Objective:** As a システム設計者, I want Contracts-first原則に従うこと, so that API・UI・AI間の契約を明確にできる

#### Acceptance Criteria

1. The データ構造・DTO・Enum・Error定義は契約（packages/contracts）を正本とする
2. The 変更順序は以下を厳守する: 1) Contracts, 2) Backend API, 3) BFF, 4) Frontend UI
3. The 契約に定義されていないフィールドの暗黙利用は禁止する
4. The UIはpackages/contracts/src/bffのみを参照し、packages/contracts/src/apiを直接参照してはならない

### Requirement 13: 承認機能（MVP外）

**Objective:** As a プロダクトオーナー, I want 承認機能をMVP外とすること, so that 初期リリースを簡素化できる

#### Acceptance Criteria

1. The 社員マスタの作成・更新・無効化・再有効化に承認ワークフローは含めない
2. The 承認機能は将来の拡張として設計に含めない（MVP外）
