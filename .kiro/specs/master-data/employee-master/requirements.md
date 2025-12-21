# Requirements Document

## Introduction

本機能は、ProcurERPにおける社員マスタの登録・照会・編集を提供する。購買依頼や承認フローにおいて、社員情報を参照・利用するための基盤マスタとして機能する。

## Requirements

### Requirement 1: 社員一覧表示機能

**Objective:** As a 管理者, I want 社員一覧を表示できること, so that 登録されている社員情報を一覧で確認できる

# Employee Master Requirements

#### Validations (検証)
1. When ユーザーが保存ボタンを押下した時, the System shall 入力値が `EmployeeSchema` (必須、型、最大長) に適合するか検証する
2. When ユーザーが保存ボタンを押下した時, the System shall 社員コード(EmployeeID)の重複をチェックする

#### Persistence (保存)
1. When バリデーションと重複チェックに成功した時, the System shall 社員データを永続化層(DB)に保存する
2. When 保存が完了した時, the System shall 完了トースト通知を表示し、一覧画面へ遷移する

#### Error Handling (エラー処理)
1. When バリデーションエラーが発生した時, the System shall エラー箇所を赤枠で強調表示する
2. When サーバー内部エラーが発生した時, the System shall "予期せぬエラーが発生しました" とトースト通知を表示する

#### Acceptance Criteria

1. When ユーザーが社員マスタ画面にアクセスした時, the Employee Master Service shall 登録されている社員データの一覧を取得し、画面に表示する
2. The Employee Master Service shall 一覧表示において、社員コード、社員氏名、社員カナ名、メールアドレス、入社日、退社日、有効フラグを表示する
3. The Employee Master Service shall テナント単位で社員データをフィルタリングし、他テナントのデータを表示しない
4. While 一覧データの取得中である間, the Employee Master Service shall ローディング状態を表示する
5. If 一覧データの取得に失敗した場合, the Employee Master Service shall エラーメッセージを表示する

### Requirement 2: 社員詳細表示・編集機能

**Objective:** As a 管理者, I want 社員データをクリックして編集できること, so that 既存の社員情報を更新できる

#### Acceptance Criteria

1. When ユーザーが一覧画面で社員データの行をクリックした時, the Employee Master Service shall 該当社員の詳細情報を取得し、編集画面を表示する
2. The Employee Master Service shall 編集画面において、社員コード、社員氏名、社員カナ名、メールアドレス、入社日、退社日、備考、有効フラグの各フィールドを表示する
3. When ユーザーが編集画面で各フィールドの値を変更した時, the Employee Master Service shall 変更内容を画面に反映する
4. When ユーザーが編集画面で保存ボタンを押下した時, the Employee Master Service shall 入力値のバリデーションを実行する
5. If バリデーションエラーが存在する場合, the Employee Master Service shall エラーメッセージを表示し、保存処理をブロックする
6. When バリデーションが成功し、保存ボタンが押下された時, the Employee Master Service shall 社員データを更新する
7. When 社員データの更新が成功した時, the Employee Master Service shall 一覧画面に戻り、更新された内容を反映する
8. If 社員データの更新に失敗した場合, the Employee Master Service shall エラーメッセージを表示する
9. The Employee Master Service shall 編集画面において、テナント単位でデータを取得・更新し、他テナントのデータにアクセスできないことを保証する

### Requirement 3: 社員新規登録機能

**Objective:** As a 管理者, I want 新規ボタンで社員を登録できること, so that 新しい社員情報を追加できる

#### Acceptance Criteria

1. When ユーザーが一覧画面で新規ボタンを押下した時, the Employee Master Service shall 新規登録画面を表示する
2. The Employee Master Service shall 新規登録画面において、編集画面と同じ構成（社員コード、社員氏名、社員カナ名、メールアドレス、入社日、退社日、備考、有効フラグ）のフィールドを表示する
3. The Employee Master Service shall 新規登録画面において、各フィールドを空の状態で初期化する
4. When ユーザーが新規登録画面で各フィールドに値を入力した時, the Employee Master Service shall 入力内容を画面に反映する
5. When ユーザーが新規登録画面で保存ボタンを押下した時, the Employee Master Service shall 入力値のバリデーションを実行する
6. If バリデーションエラーが存在する場合, the Employee Master Service shall エラーメッセージを表示し、保存処理をブロックする
7. When バリデーションが成功し、保存ボタンが押下された時, the Employee Master Service shall 新規社員データを登録する
8. When 社員データの登録が成功した時, the Employee Master Service shall 一覧画面に戻り、新規登録された社員を一覧に表示する
9. If 社員データの登録に失敗した場合, the Employee Master Service shall エラーメッセージを表示する
10. The Employee Master Service shall 新規登録において、現在のテナントIDを自動的に設定する

### Requirement 4: 社員データの属性定義

**Objective:** As a システム, I want 社員データが適切な属性を持つこと, so that 社員情報を正確に管理できる

#### Acceptance Criteria

1. The Employee Master Service shall 社員コードを必須項目として扱う
2. The Employee Master Service shall 社員氏名を必須項目として扱う
3. The Employee Master Service shall 社員カナ名を必須項目として扱う
4. The Employee Master Service shall メールアドレスは任意項目として扱う
5. If メールアドレスの形式が不正な場合, the Employee Master Service shall バリデーションエラーを返す
6. The Employee Master Service shall 入社日を必須項目として扱う
7. The Employee Master Service shall 退社日を任意項目として扱う
8. If 退社日が入社日より前の日付である場合, the Employee Master Service shall バリデーションエラーを返す
9. The Employee Master Service shall 備考を任意項目として扱う
10. The Employee Master Service shall 有効フラグを必須項目として扱い、デフォルト値を有効（true）とする
11. The Employee Master Service shall 社員コードが同一テナント内で一意であることを保証する
12. If 同一テナント内で社員コードが重複している場合, the Employee Master Service shall バリデーションエラーを返す


