# Requirements Document

## Introduction
本要件は、ProcureERP（購買管理SaaS）における**倉庫マスタ**機能を定義する。
倉庫は自社の受入・保管場所を管理し、発注・入荷時に受入倉庫として指定するための基盤マスタである。

### 対象範囲（MVP）
- 倉庫（Warehouse）の CRUD 操作
- 既定受入倉庫の設定（テナントにつき1倉庫のみ）
- カナ検索によるインクリメンタル検索

### 対象外（V2以降）
- 倉庫グループ管理UI（エンティティのみ作成）
- 在庫ロケーション（棚番）管理
- 在庫残高・入出庫管理

---

## Requirements

### Requirement 1: 倉庫一覧表示
**Objective:** As a 購買担当者, I want 登録済み倉庫を一覧で確認できること, so that 受入倉庫の選択や倉庫情報の管理ができる

#### Acceptance Criteria
1. When ユーザーが倉庫一覧画面にアクセスする, the 倉庫マスタ shall 自テナントの有効な倉庫一覧を display_order の昇順で表示する
2. When ユーザーが倉庫名カナで検索する, the 倉庫マスタ shall warehouse_name_kana に対してインクリメンタル検索を実行し、部分一致する倉庫を表示する
3. When ユーザーが「無効を含む」を選択する, the 倉庫マスタ shall is_active = false の倉庫も一覧に含めて表示する
4. The 倉庫マスタ shall 一覧に倉庫コード、倉庫名、住所（都道府県＋市区町村）、既定受入フラグ、有効/無効状態を表示する

---

### Requirement 2: 倉庫登録
**Objective:** As a マスタ管理者, I want 新しい倉庫を登録できること, so that 発注・入荷で使用する受入先を増やせる

#### Acceptance Criteria
1. When ユーザーが必須項目（倉庫コード、倉庫名）を入力して保存する, the 倉庫マスタ shall 新規倉庫レコードを作成する
2. When ユーザーが住所情報（郵便番号、都道府県、市区町村、住所1、住所2、電話番号）を入力する, the 倉庫マスタ shall 各フィールドを分割形式で保存する
3. When ユーザーが倉庫名カナを入力する, the 倉庫マスタ shall 入力値を半角カナに正規化して warehouse_name_kana に保存する
4. When ユーザーが表示順を指定しない, the 倉庫マスタ shall display_order にデフォルト値 1000 を設定する
5. The 倉庫マスタ shall 作成時に version = 1、is_active = true を設定する
6. The 倉庫マスタ shall 作成時に監査情報（created_at, created_by, updated_at, updated_by）を記録する

---

### Requirement 3: 倉庫編集
**Objective:** As a マスタ管理者, I want 登録済み倉庫の情報を更新できること, so that 住所変更や名称変更に対応できる

#### Acceptance Criteria
1. When ユーザーが倉庫詳細画面で情報を変更して保存する, the 倉庫マスタ shall 更新されたフィールドを保存し、updated_at と updated_by を更新する
2. When ユーザーが倉庫コードを変更しようとする, the 倉庫マスタ shall 倉庫コードの変更を禁止する（表示のみ）
3. When 他のユーザーが先に同一レコードを更新している, the 倉庫マスタ shall 楽観ロック（version 照合）により更新を拒否し、CONCURRENT_UPDATE エラーを返す
4. The 倉庫マスタ shall 更新成功時に version をインクリメントする

---

### Requirement 4: 倉庫無効化
**Objective:** As a マスタ管理者, I want 使用しなくなった倉庫を無効化できること, so that 誤選択を防ぎつつ履歴データを保持できる

#### Acceptance Criteria
1. When ユーザーが倉庫を無効化する, the 倉庫マスタ shall is_active = false に更新する（物理削除は行わない）
2. If ユーザーが既定受入倉庫（is_default_receiving = true）を無効化しようとする, then the 倉庫マスタ shall CANNOT_DEACTIVATE_DEFAULT_RECEIVING エラーを返し、無効化を拒否する
3. When 無効化された倉庫がある, the 倉庫マスタ shall 発注・入荷画面の倉庫選択で当該倉庫を選択肢から除外する
4. The 倉庫マスタ shall 無効化時に監査情報（updated_at, updated_by）を記録する

---

### Requirement 5: 既定受入倉庫設定
**Objective:** As a 購買担当者, I want 既定の受入倉庫を設定できること, so that 発注時に毎回倉庫を選択する手間を省ける

#### Acceptance Criteria
1. When ユーザーが倉庫を既定受入倉庫に設定する, the 倉庫マスタ shall 当該倉庫の is_default_receiving を true に設定する
2. When 既に既定受入倉庫が設定されている状態で別の倉庫を既定に設定する, the 倉庫マスタ shall 既存の既定倉庫の is_default_receiving を false に変更してから、新しい倉庫を既定に設定する
3. The 倉庫マスタ shall テナントにつき is_default_receiving = true の倉庫を最大1つに制限する（部分一意制約）
4. While 発注登録画面で受入倉庫が未選択, the 発注機能 shall 既定受入倉庫を自動で初期値として設定する
5. If 既定受入倉庫が1件も設定されていない状態で発注登録画面を開く, then the 発注機能 shall 受入倉庫を空欄で表示し、ユーザーに選択を促す

---

### Requirement 6: 入力バリデーション
**Objective:** As a システム, I want 不正なデータ入力を防止すること, so that データの整合性を保持できる

#### Acceptance Criteria
1. If 倉庫コードが10文字を超える, then the 倉庫マスタ shall INVALID_WAREHOUSE_CODE_LENGTH エラーを返す
2. If 倉庫コードに半角英数字以外の文字が含まれる, then the 倉庫マスタ shall INVALID_WAREHOUSE_CODE_CHARS エラーを返す
3. If 同一テナント内に同じ倉庫コードが既に存在する, then the 倉庫マスタ shall WAREHOUSE_CODE_DUPLICATE エラーを返す
4. If 存在しない倉庫IDでアクセスする, then the 倉庫マスタ shall WAREHOUSE_NOT_FOUND エラーを返す
5. If 存在しない倉庫グループIDを指定する, then the 倉庫マスタ shall WAREHOUSE_GROUP_NOT_FOUND エラーを返す
6. The 倉庫マスタ shall 郵便番号を「XXX-XXXX」形式で許容する
7. The 倉庫マスタ shall 電話番号を「XX-XXXX-XXXX」形式で許容する

---

### Requirement 7: テナント分離
**Objective:** As a SaaS運用者, I want テナント間のデータを完全に分離すること, so that セキュリティとプライバシーを確保できる

#### Acceptance Criteria
1. The 倉庫マスタ shall すべてのデータアクセスに tenant_id による RLS（Row Level Security）フィルタを適用する
2. The 倉庫マスタ shall 他テナントの倉庫データに対するアクセスを一切許可しない
3. When 倉庫コードの一意性を検証する, the 倉庫マスタ shall 同一テナント内でのみ重複チェックを行う

---

## Non-Functional Requirements

### NFR-1: パフォーマンス
- 倉庫一覧検索は 100件以下で 500ms 以内に応答すること
- カナ検索は入力後 200ms 以内に結果を返すこと（デバウンス処理適用）

### NFR-2: データ保持
- 物理削除は行わず、論理削除（is_active = false）で履歴を保持すること
- 監査列により作成・更新の追跡が可能であること

---

## 参照仕様
- 仕様概要: `.kiro/specs/spec_doc/61_機能設計検討/01_仕様検討/04_共通・銀行・倉庫 仕様概要.md`
- エンティティ定義: `.kiro/specs/spec_doc/61_機能設計検討/02_エンティティ定義/04_共通・銀行・倉庫.md`
