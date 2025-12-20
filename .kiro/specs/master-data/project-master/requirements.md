# Requirements Document

## Introduction

本機能は、EPM SaaSにおけるプロジェクトマスタ（Project Master）の登録・管理機能を提供する。プロジェクト情報の一覧検索、詳細表示、作成、更新、無効化/再有効化を実現し、マルチテナント環境下で安全に運用可能なマスタ管理基盤を構築する。

本機能はContracts-first原則に従い、BFFでページング/ソートを正規化し、エラーハンドリングはPass-through方式を採用する。承認機能はMVP外とする。

## Decisions / Open Questions

### Decisions

**D-01**: projectCode（プロジェクトコード）は作成後に変更不可

**D-02**: ページングは page/pageSize（default page=1, pageSize=50, max=200）

**D-03**: default sort = projectCode asc

**D-04**: departmentCode（部門コード）は nullable、MVPではFK制約なし

**D-05**: responsibleEmployeeCode（担当者コード）は nullable、MVPではFK制約なし

**D-06**: プロジェクト実績From/Toは nullable（実績が確定していない場合はnull）

**D-07**: プロジェクト予算金額は DECIMAL型を使用（精度保証）

### Open Questions

**OQ-01**: 再有効化はMVPに含める → Yes

## Functional Requirements (FR) 一覧

本機能の機能要件を以下に列挙する。詳細は各 Requirement を参照のこと。

- **FR-LIST-01**: 一覧（ページング/ソート/検索/無効含むオプション） - Requirement 1 参照
- **FR-LIST-02**: 詳細 - Requirement 2 参照
- **FR-LIST-03**: 作成 - Requirement 3 参照
- **FR-LIST-04**: 更新（projectCode変更不可を含む） - Requirement 4 参照
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

### Requirement 1: プロジェクトマスタ一覧検索・表示

**Objective:** As a 経営企画担当者 or FP&A担当者, I want プロジェクトマスタの一覧を検索・表示できること, so that プロジェクト情報を効率的に確認・参照できる

#### Acceptance Criteria

1. When ユーザーがプロジェクトマスタ一覧画面にアクセスしたとき, the Project Master Service shall ページング情報とソート条件に基づいてプロジェクト一覧を返却する
2. When ユーザーが検索条件（プロジェクトコード、プロジェクト正式名、プロジェクト略名、部門コード、担当者コード等）を指定したとき, the Project Master Service shall 条件に一致するプロジェクトのみを返却する
3. When ユーザーがソート条件（プロジェクトコード、プロジェクト正式名、プロジェクト略名、予定期間From、予算金額等）を指定したとき, the BFF shall ソート条件を正規化し、Domain APIへ伝達する
4. When ユーザーがページ番号とページサイズを指定したとき, the BFF shall ページング情報を正規化し、Domain APIへ伝達する
5. While テナント境界が設定されている状態で, the Project Master Service shall 自テナントのプロジェクトのみを返却する
6. When 無効化されたプロジェクトが存在する場合, the Project Master Service shall デフォルトでは有効なプロジェクトのみを返却する（フィルタ条件で無効化プロジェクトも含めることは可能とする）

### Requirement 2: プロジェクトマスタ詳細表示

**Objective:** As a 経営企画担当者 or FP&A担当者, I want 特定のプロジェクトの詳細情報を表示できること, so that プロジェクト情報を正確に確認できる

#### Acceptance Criteria

1. When ユーザーがプロジェクトIDを指定して詳細情報を要求したとき, the Project Master Service shall 該当プロジェクトの詳細情報を返却する
2. If 指定されたプロジェクトIDが存在しない場合, the Project Master Service shall 404エラーを返却する
3. If 指定されたプロジェクトが他テナントに属する場合, the Project Master Service shall 404エラーを返却する（存在しないものとして扱う）
4. When 詳細情報が返却されたとき, the Project Master Service shall プロジェクトの有効/無効状態を含む完全な情報（プロジェクトコード、正式名、略名、カナ名、部門コード、担当者コード、担当者名、予定期間From/To、実績From/To、予算金額等）を返却する

### Requirement 3: プロジェクトマスタ作成

**Objective:** As a 経営企画担当者 or 管理者, I want 新しいプロジェクト情報を登録できること, so that プロジェクトマスタを維持・更新できる

#### Acceptance Criteria

1. When ユーザーが必須項目を入力してプロジェクト作成を実行したとき, the Project Master Service shall 新しいプロジェクトレコードを作成し、作成されたプロジェクト情報を返却する
2. If 必須項目（プロジェクトコード、プロジェクト正式名、プロジェクト予定期間From、プロジェクト予定期間To、プロジェクト予算金額）が未入力の場合, the Project Master Service shall 422エラーを返却する
3. If プロジェクトコードが既に同一テナント内で存在する場合, the Project Master Service shall 409エラーを返却する
4. If プロジェクト予定期間Fromがプロジェクト予定期間Toより後の日付の場合, the Project Master Service shall 422エラーを返却する
5. If プロジェクト実績Fromが指定されている場合、プロジェクト実績Toも必須とし、プロジェクト実績Fromがプロジェクト実績Toより後の日付の場合, the Project Master Service shall 422エラーを返却する
6. When プロジェクトが作成されたとき, the Project Master Service shall デフォルトで有効状態として作成する
7. When プロジェクトが作成されたとき, the Project Master Service shall 作成者情報（user_id）と作成日時を記録する
8. While テナント境界が設定されている状態で, the Project Master Service shall 自テナントのプロジェクトとして作成する
9. When プロジェクト予算金額が指定されたとき, the Project Master Service shall DECIMAL型で精度を保証して保存する

### Requirement 4: プロジェクトマスタ更新

**Objective:** As a 経営企画担当者 or 管理者, I want 既存のプロジェクト情報を更新できること, so that プロジェクト情報の変更を反映できる

#### Acceptance Criteria

1. When ユーザーがプロジェクトIDと更新内容を指定して更新を実行したとき, the Project Master Service shall 該当プロジェクト情報を更新し、更新後の情報を返却する
2. If 指定されたプロジェクトIDが存在しない場合, the Project Master Service shall 404エラーを返却する
3. If 指定されたプロジェクトが他テナントに属する場合, the Project Master Service shall 404エラーを返却する
4. If 更新リクエストにprojectCodeが含まれている場合, the Project Master Service shall 422エラー（validation error）を返却する（projectCodeは作成後に変更不可）
5. If 更新後のプロジェクトコードが同一テナント内の他のプロジェクトと重複する場合, the Project Master Service shall 409エラーを返却する
6. If プロジェクト予定期間Fromがプロジェクト予定期間Toより後の日付に更新される場合, the Project Master Service shall 422エラーを返却する
7. If プロジェクト実績Fromが指定されている場合、プロジェクト実績Toも必須とし、プロジェクト実績Fromがプロジェクト実績Toより後の日付に更新される場合, the Project Master Service shall 422エラーを返却する
8. When プロジェクトが更新されたとき, the Project Master Service shall 更新者情報（user_id）と更新日時を記録する
9. While テナント境界が設定されている状態で, the Project Master Service shall 自テナントのプロジェクトのみを更新可能とする
10. When プロジェクト予算金額が更新されたとき, the Project Master Service shall DECIMAL型で精度を保証して保存する

### Requirement 5: プロジェクトマスタ無効化

**Objective:** As a 経営企画担当者 or 管理者, I want プロジェクトを無効化できること, so that 終了・中止されたプロジェクトを論理削除できる

#### Acceptance Criteria

1. When ユーザーがプロジェクトIDを指定して無効化を実行したとき, the Project Master Service shall 該当プロジェクトを無効状態に変更する
2. If 指定されたプロジェクトIDが存在しない場合, the Project Master Service shall 404エラーを返却する
3. If 指定されたプロジェクトが既に無効状態の場合, the Project Master Service shall 409エラーを返却する
4. When プロジェクトが無効化されたとき, the Project Master Service shall 無効化者情報（user_id）と無効化日時を記録する
5. While テナント境界が設定されている状態で, the Project Master Service shall 自テナントのプロジェクトのみを無効化可能とする

### Requirement 6: プロジェクトマスタ再有効化

**Objective:** As a 経営企画担当者 or 管理者, I want 無効化されたプロジェクトを再有効化できること, so that 誤って無効化したプロジェクトを復元できる

#### Acceptance Criteria

1. When ユーザーが無効化されたプロジェクトIDを指定して再有効化を実行したとき, the Project Master Service shall 該当プロジェクトを有効状態に変更する
2. If 指定されたプロジェクトIDが存在しない場合, the Project Master Service shall 404エラーを返却する
3. If 指定されたプロジェクトが既に有効状態の場合, the Project Master Service shall 409エラーを返却する
4. When プロジェクトが再有効化されたとき, the Project Master Service shall 再有効化者情報（user_id）と再有効化日時を記録する
5. While テナント境界が設定されている状態で, the Project Master Service shall 自テナントのプロジェクトのみを再有効化可能とする

### Requirement 7: 権限・認可制御

**Objective:** As a システム管理者, I want プロジェクトマスタ操作に適切な権限制御を実装すること, so that 不正な操作を防止できる

#### Acceptance Criteria

1. When ユーザーがプロジェクトマスタ一覧を参照しようとしたとき, the Project Master Service shall `epm.project-master.read` 権限をチェックする
2. When ユーザーがプロジェクトマスタ詳細を参照しようとしたとき, the Project Master Service shall `epm.project-master.read` 権限をチェックする
3. When ユーザーがプロジェクトマスタを作成しようとしたとき, the Project Master Service shall `epm.project-master.create` 権限をチェックする
4. When ユーザーがプロジェクトマスタを更新しようとしたとき, the Project Master Service shall `epm.project-master.update` 権限をチェックする
5. When ユーザーがプロジェクトマスタを無効化しようとしたとき, the Project Master Service shall `epm.project-master.update` 権限をチェックする
6. When ユーザーがプロジェクトマスタを再有効化しようとしたとき, the Project Master Service shall `epm.project-master.update` 権限をチェックする
7. If ユーザーが必要な権限を持たない場合, the Project Master Service shall 403エラーを返却する
8. The UI制御とAPI制御は必ず一致させること（UIで操作できない機能はAPIでも実行できてはならない）

### Requirement 8: マルチテナント境界

**Objective:** As a SaaS運用者, I want テナント間でデータが分離されること, so that データの安全性とプライバシーを保証できる

#### Acceptance Criteria

1. The Project Master Service shall すべてのプロジェクトレコードにtenant_idを持たせる
2. When プロジェクトマスタ操作が実行されたとき, the Project Master Service shall 認証情報からtenant_idを解決し、操作対象をテナント境界内に限定する
3. The Repository shall すべてのDBアクセスでtenant_idを必須パラメータとして受け取る
4. The RLS（Row Level Security）は常に有効とし、テナント境界を強制する
5. When 他テナントのプロジェクトIDが指定された場合, the Project Master Service shall 404エラーを返却する（存在しないものとして扱う）

### Requirement 9: 監査・トレーサビリティ

**Objective:** As a 監査担当者, I want プロジェクトマスタ操作の履歴を追跡できること, so that 変更の説明責任を果たせる

#### Acceptance Criteria

1. When プロジェクトが作成されたとき, the Project Master Service shall 監査ログに以下を記録する: tenant_id, user_id, 操作種別（create）, 対象プロジェクトID, 作成日時
2. When プロジェクトが更新されたとき, the Project Master Service shall 監査ログに以下を記録する: tenant_id, user_id, 操作種別（update）, 対象プロジェクトID, 変更前後の値（主要項目）, 更新日時
3. When プロジェクトが無効化されたとき, the Project Master Service shall 監査ログに以下を記録する: tenant_id, user_id, 操作種別（deactivate）, 対象プロジェクトID, 無効化日時
4. When プロジェクトが再有効化されたとき, the Project Master Service shall 監査ログに以下を記録する: tenant_id, user_id, 操作種別（reactivate）, 対象プロジェクトID, 再有効化日時
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

1. The プロジェクトマスタの作成・更新・無効化・再有効化に承認ワークフローは含めない
2. The 承認機能は将来の拡張として設計に含めない（MVP外）


