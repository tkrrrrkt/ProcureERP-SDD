# Requirements Document

## Introduction

本ドキュメントは、ProcurERP（購買管理SaaS）における銀行マスタ・支店マスタ管理機能の要件を定義する。

銀行マスタは、支払先口座登録時に使用する銀行・支店情報を管理するための共通マスタである。購買業務において仕入先への支払処理を行う際、正確な銀行・支店情報が必要となる。本機能は、テナント単位で銀行・支店情報を管理し、全銀協コード体系に準拠した形式でデータを保持する。

### スコープ
- 銀行マスタ（banks）のCRUD操作
- 支店マスタ（bank_branches）のCRUD操作
- 支払先口座登録時の銀行・支店選択モーダル
- カナ検索（インクリメンタル）機能

### スコープ外（本Feature）
- 支払先口座（payee_bank_accounts）の管理（別Feature）
- 全銀協マスタの自動同期機能（将来対応）

## Requirements

### Requirement 1: 銀行マスタ一覧表示

**Objective:** As a テナント管理者, I want 登録済みの銀行一覧を確認できる機能, so that 銀行情報の管理状況を把握できる

#### Acceptance Criteria
1. When ユーザーが銀行一覧画面を表示する, the Bank Master Service shall 当該テナントに属する銀行一覧を表示順（display_order昇順）で取得して表示する
2. When ユーザーが検索条件を入力する, the Bank Master Service shall 銀行コード・銀行名・銀行名カナによる部分一致検索を実行する
3. When ユーザーが銀行名カナで検索する, the Bank Master Service shall インクリメンタル検索（入力中にリアルタイム絞り込み）を実行する
4. While 銀行一覧が表示されている, the Bank Master Service shall 各銀行の銀行コード・銀行名・銀行名カナ・有効/無効状態を表示する
5. If 該当する銀行が存在しない, then the Bank Master Service shall 「該当する銀行がありません」メッセージを表示する

---

### Requirement 2: 銀行マスタ新規登録

**Objective:** As a テナント管理者, I want 新しい銀行情報を登録できる機能, so that 支払先口座登録時に必要な銀行を追加できる

#### Acceptance Criteria
1. When ユーザーが銀行登録画面で必須項目（銀行コード・銀行名）を入力して保存する, the Bank Master Service shall 新規銀行レコードを作成する
2. When ユーザーが銀行コードを入力する, the Bank Master Service shall 4桁の数字形式（全銀協コード）であることを検証する
3. If 同一テナント内に同じ銀行コードが既に存在する, then the Bank Master Service shall 重複エラーを表示し登録を拒否する
4. When ユーザーが銀行名カナを入力する, the Bank Master Service shall 半角カタカナに正規化して保存する
5. When ユーザーが表示順を指定しない, the Bank Master Service shall デフォルト値（1000）を設定する
6. The Bank Master Service shall 登録時に監査情報（created_at, created_by_login_account_id）を自動記録する

---

### Requirement 3: 銀行マスタ編集

**Objective:** As a テナント管理者, I want 登録済み銀行情報を編集できる機能, so that 銀行名変更や表示順調整ができる

#### Acceptance Criteria
1. When ユーザーが銀行詳細画面で編集ボタンを押下する, the Bank Master Service shall 編集モードに切り替え、各フィールドを編集可能にする
2. While 銀行が編集モードである, the Bank Master Service shall 銀行コードを編集不可（読み取り専用）とする
3. When ユーザーが変更を保存する, the Bank Master Service shall 更新情報（updated_at, updated_by_login_account_id）を自動記録する
4. If 他のユーザーが同時に同じ銀行を編集した, then the Bank Master Service shall 楽観ロックエラーを表示し、再取得を促す

---

### Requirement 4: 銀行マスタ論理削除

**Objective:** As a テナント管理者, I want 不要な銀行を無効化できる機能, so that 使用しない銀行を一覧から除外できる

#### Acceptance Criteria
1. When ユーザーが銀行を無効化する, the Bank Master Service shall is_activeをfalseに設定する（物理削除は行わない）
2. If 無効化対象の銀行に有効な支店が紐づいている, then the Bank Master Service shall 警告を表示し、確認後に処理を継続する
3. While 銀行がis_active=falseである, the Bank Master Service shall 銀行選択モーダルの候補から除外する
4. When ユーザーが無効化された銀行を再有効化する, the Bank Master Service shall is_activeをtrueに設定する

---

### Requirement 5: 支店マスタ一覧表示

**Objective:** As a テナント管理者, I want 銀行に紐づく支店一覧を確認できる機能, so that 支店情報の管理状況を把握できる

#### Acceptance Criteria
1. When ユーザーが銀行詳細画面の「支店一覧」タブを選択する, the Bank Branch Service shall 当該銀行に属する支店一覧を表示順（display_order昇順）で取得して表示する
2. When ユーザーが検索条件を入力する, the Bank Branch Service shall 支店コード・支店名・支店名カナによる部分一致検索を実行する
3. When ユーザーが支店名カナで検索する, the Bank Branch Service shall インクリメンタル検索を実行する
4. While 支店一覧が表示されている, the Bank Branch Service shall 各支店の支店コード・支店名・支店名カナ・有効/無効状態を表示する

---

### Requirement 6: 支店マスタ新規登録

**Objective:** As a テナント管理者, I want 銀行に新しい支店を登録できる機能, so that 支払先口座登録時に必要な支店を追加できる

#### Acceptance Criteria
1. When ユーザーが支店登録画面で必須項目（支店コード・支店名）を入力して保存する, the Bank Branch Service shall 新規支店レコードを作成する
2. When ユーザーが支店コードを入力する, the Bank Branch Service shall 3桁の数字形式（全銀協コード）であることを検証する
3. If 同一銀行内に同じ支店コードが既に存在する, then the Bank Branch Service shall 重複エラーを表示し登録を拒否する
4. When ユーザーが支店名カナを入力する, the Bank Branch Service shall 半角カタカナに正規化して保存する
5. The Bank Branch Service shall 登録時にbank_id（親銀行）を自動設定する
6. The Bank Branch Service shall 登録時に監査情報を自動記録する

---

### Requirement 7: 支店マスタ編集

**Objective:** As a テナント管理者, I want 登録済み支店情報を編集できる機能, so that 支店名変更や表示順調整ができる

#### Acceptance Criteria
1. When ユーザーが支店詳細で編集する, the Bank Branch Service shall 編集モードに切り替える
2. While 支店が編集モードである, the Bank Branch Service shall 支店コード・所属銀行を編集不可（読み取り専用）とする
3. When ユーザーが変更を保存する, the Bank Branch Service shall 更新情報を自動記録する
4. If 他のユーザーが同時に同じ支店を編集した, then the Bank Branch Service shall 楽観ロックエラーを表示し、再取得を促す

---

### Requirement 8: 支店マスタ論理削除

**Objective:** As a テナント管理者, I want 不要な支店を無効化できる機能, so that 使用しない支店を一覧から除外できる

#### Acceptance Criteria
1. When ユーザーが支店を無効化する, the Bank Branch Service shall is_activeをfalseに設定する
2. If 無効化対象の支店が支払先口座で使用されている, then the Bank Branch Service shall 警告を表示し、確認後に処理を継続する
3. While 支店がis_active=falseである, the Bank Branch Service shall 支店選択モーダルの候補から除外する
4. When ユーザーが無効化された支店を再有効化する, the Bank Branch Service shall is_activeをtrueに設定する

---

### Requirement 9: 銀行選択モーダル

**Objective:** As a 購買担当者, I want 支払先口座登録時に銀行を検索・選択できる機能, so that 正しい銀行情報を効率的に入力できる

#### Acceptance Criteria
1. When ユーザーが支払先口座登録画面で銀行選択ボタンを押下する, the Bank Master Service shall 銀行選択モーダルを表示する
2. While 銀行選択モーダルが表示されている, the Bank Master Service shall 有効な銀行（is_active=true）のみを候補として表示する
3. When ユーザーがモーダル内で銀行名カナを入力する, the Bank Master Service shall インクリメンタル検索でリアルタイムに候補を絞り込む
4. When ユーザーが銀行を選択する, the Bank Master Service shall 選択した銀行情報を呼び出し元に返却し、モーダルを閉じる
5. When ユーザーが銀行を選択する, the Bank Master Service shall 自動的に支店選択モーダルを表示する

---

### Requirement 10: 支店選択モーダル

**Objective:** As a 購買担当者, I want 銀行選択後に支店を検索・選択できる機能, so that 正しい支店情報を効率的に入力できる

#### Acceptance Criteria
1. When 銀行が選択された, the Bank Branch Service shall 当該銀行に属する有効な支店一覧を支店選択モーダルに表示する
2. While 支店選択モーダルが表示されている, the Bank Branch Service shall 有効な支店（is_active=true）のみを候補として表示する
3. When ユーザーがモーダル内で支店名カナを入力する, the Bank Branch Service shall インクリメンタル検索でリアルタイムに候補を絞り込む
4. When ユーザーが支店を選択する, the Bank Branch Service shall 選択した支店情報を呼び出し元に返却し、モーダルを閉じる
5. If 選択した銀行に支店が登録されていない, then the Bank Branch Service shall 「支店が登録されていません。管理者にお問い合わせください」メッセージを表示する

---

### Requirement 11: マルチテナント分離

**Objective:** As a システム, I want テナント間のデータ分離を保証する機能, so that 他テナントのデータにアクセスできない

#### Acceptance Criteria
1. The Bank Master Service shall すべてのデータアクセスにおいてtenant_idによるRLSフィルタを適用する
2. The Bank Branch Service shall すべてのデータアクセスにおいてtenant_idによるRLSフィルタを適用する
3. If 異なるテナントのデータへのアクセスが試行された, then the System shall アクセスを拒否し、監査ログに記録する

---

### Requirement 12: 権限制御

**Objective:** As a システム, I want 適切な権限を持つユーザーのみが操作できる機能, so that 不正な操作を防止できる

#### Acceptance Criteria
1. The Bank Master Service shall `procure.bank.read` 権限を持つユーザーのみに銀行一覧・詳細の参照を許可する
2. The Bank Master Service shall `procure.bank.create` 権限を持つユーザーのみに銀行の新規登録を許可する
3. The Bank Master Service shall `procure.bank.update` 権限を持つユーザーのみに銀行の編集・無効化・再有効化を許可する
4. The Bank Branch Service shall `procure.bank-branch.read` 権限を持つユーザーのみに支店一覧・詳細の参照を許可する
5. The Bank Branch Service shall `procure.bank-branch.create` 権限を持つユーザーのみに支店の新規登録を許可する
6. The Bank Branch Service shall `procure.bank-branch.update` 権限を持つユーザーのみに支店の編集・無効化・再有効化を許可する
7. While ユーザーが銀行・支店選択モーダルを使用する, the System shall `procure.bank.read` および `procure.bank-branch.read` 権限のみを要求する

