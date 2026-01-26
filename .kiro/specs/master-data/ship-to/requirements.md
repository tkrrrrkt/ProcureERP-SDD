# Requirements Document

## Introduction

納入先（ShipTo）マスタは、得意先が指定する「実際にモノを届ける場所」を管理するマスタ機能である。
エンドユーザー／現場／工事場所等の直送先を含む。

### 仕様変更（本実装における変更点）
- **元の仕様**: `customer_site_id` は必須FK（CustomerSite配下）
- **変更後**: `customer_site_id` はNULL許容（独立実装、後からCustomerSiteと紐づけ可能）

### 設計方針
- 納入先コード（`ship_to_code`）は**独立した10桁コード**として管理
- 親子関係（CustomerSiteとの関係）はコード上・対外上に見える形式は採用しない
- 住所・連絡先は1セットのみ（MVP）
- UI配置は**独立メニュー**（マスタ > 納入先マスタ）
- コード採番は**手入力**（10桁固定）

### 参照仕様
- 仕様概要: `.kiro/specs/spec_doc/61_機能設計検討/01_仕様検討/03_取引先系マスタ（Party SupplierSite Payee）.md`
- エンティティ定義: `.kiro/specs/spec_doc/61_機能設計検討/02_エンティティ定義/03_取引先系マスタ関係.md`

---

## Requirements

### Requirement 1: 納入先の一覧表示
**Objective:** As a 購買担当者, I want 納入先の一覧を確認したい, so that 発注時に適切な納入先を選択できる

#### Acceptance Criteria
1. When ユーザーが納入先マスタ画面を開く, the ShipTo Service shall 納入先一覧を表示する
2. The ShipTo Service shall 一覧に納入先コード、納入先名、住所、連絡先、有効/無効状態を表示する
3. When ユーザーが納入先コードまたは名称で検索する, the ShipTo Service shall 部分一致で絞り込み結果を表示する
4. When ユーザーが有効/無効フィルタを選択する, the ShipTo Service shall 選択した状態の納入先のみ表示する
5. The ShipTo Service shall 納入先コード順（昇順）をデフォルトソートとする

### Requirement 2: 納入先の新規登録
**Objective:** As a 購買担当者, I want 新しい納入先を登録したい, so that 新規の納品場所を発注に使用できる

#### Acceptance Criteria
1. When ユーザーが新規登録ボタンをクリックする, the ShipTo Service shall 納入先登録ダイアログを表示する
2. The ShipTo Service shall 以下の入力項目を提供する：
   - 納入先コード（10桁、手入力、必須）
   - 納入先名（必須）
   - 納入先名カナ（任意）
   - 得意先拠点（任意、NULL許容）
   - 郵便番号（任意）
   - 都道府県（任意）
   - 市区町村（任意）
   - 住所1（任意）
   - 住所2（任意）
   - 電話番号（任意）
   - FAX（任意）
   - メールアドレス（任意）
   - 担当者名（任意）
   - 備考（任意）
3. When ユーザーが納入先コードを入力する, the ShipTo Service shall 10桁固定・英数字のみの形式を検証する
4. When ユーザーが保存ボタンをクリックする and 入力内容が妥当である, the ShipTo Service shall 納入先を登録し一覧を更新する
5. If 同一テナント内に同じ納入先コードが既に存在する, then the ShipTo Service shall 重複エラーを表示する
6. When 登録が成功する, the ShipTo Service shall 成功メッセージを表示してダイアログを閉じる

### Requirement 3: 納入先の編集
**Objective:** As a 購買担当者, I want 既存の納入先情報を編集したい, so that 変更があった納入先の情報を最新に保てる

#### Acceptance Criteria
1. When ユーザーが一覧から納入先を選択して編集ボタンをクリックする, the ShipTo Service shall 編集ダイアログを表示する
2. The ShipTo Service shall 納入先コード以外のすべての項目を編集可能とする
3. When ユーザーが得意先拠点を設定・変更する, the ShipTo Service shall CustomerSite選択リストから選択可能とする
4. When ユーザーが得意先拠点をクリアする, the ShipTo Service shall customer_site_idをNULLに設定する
5. When 更新が成功する, the ShipTo Service shall 成功メッセージを表示して一覧を更新する
6. If 楽観ロック競合が発生する, then the ShipTo Service shall 「他のユーザーによって更新されています」エラーを表示する

### Requirement 4: 納入先の論理無効化
**Objective:** As a マスタ管理者, I want 使用しなくなった納入先を無効化したい, so that 発注時に誤って選択されることを防げる

#### Acceptance Criteria
1. When ユーザーが有効な納入先を選択して無効化ボタンをクリックする, the ShipTo Service shall 確認ダイアログを表示する
2. When ユーザーが確認ダイアログで無効化を確定する, the ShipTo Service shall is_activeをfalseに更新する
3. While 納入先が無効状態である, the ShipTo Service shall 発注画面の納入先選択候補に表示しない
4. The ShipTo Service shall 物理削除を行わず、論理無効化のみを行う
5. When ユーザーが無効な納入先を選択して有効化ボタンをクリックする, the ShipTo Service shall is_activeをtrueに復元する

### Requirement 5: コード正規化
**Objective:** As a システム, I want 入力されたコードを正規化したい, so that データの一貫性を保てる

#### Acceptance Criteria
1. When ユーザーが納入先コードを入力する, the ShipTo Service shall 以下の正規化を適用する：
   - 前後空白の除去（trim）
   - 全角→半角変換
   - 英字→大文字変換
2. If 正規化後のコードが10桁でない, then the ShipTo Service shall 桁数エラーを表示する
3. If 正規化後のコードに英数字以外の文字が含まれる, then the ShipTo Service shall 文字種エラーを表示する

### Requirement 6: マルチテナント分離
**Objective:** As a システム, I want テナント間のデータを完全に分離したい, so that セキュリティとデータ整合性を保証できる

#### Acceptance Criteria
1. The ShipTo Service shall すべてのクエリにtenant_idを含める
2. The ShipTo Service shall RLS（Row Level Security）によりテナント境界を強制する
3. When 納入先を操作する, the ShipTo Service shall 操作者のtenant_idに属するデータのみアクセス可能とする

### Requirement 7: 監査列の記録
**Objective:** As a 監査担当者, I want 誰がいつ納入先を登録・更新したかを追跡したい, so that 変更履歴を監査できる

#### Acceptance Criteria
1. When 納入先が新規登録される, the ShipTo Service shall created_at, created_by_login_account_idを記録する
2. When 納入先が更新される, the ShipTo Service shall updated_at, updated_by_login_account_idを記録する
3. The ShipTo Service shall 監査列（created_by/updated_by）を実質必須として扱う

### Requirement 8: 楽観ロック
**Objective:** As a システム, I want 同時編集による競合を検出したい, so that データの整合性を保てる

#### Acceptance Criteria
1. The ShipTo Service shall versionカラムにより楽観ロックを実装する
2. When 更新リクエストを受信する, the ShipTo Service shall version値の一致を検証する
3. If version値が一致しない, then the ShipTo Service shall CONCURRENT_UPDATEエラーを返却する

---

## 非機能要件

### パフォーマンス
- 一覧画面の初期表示: 2秒以内（P95）
- 検索・フィルタ結果の表示: 1秒以内（P95）

### ユーザビリティ
- 一覧はページネーション対応（デフォルト20件/ページ）
- 検索はリアルタイム絞り込み（debounce 300ms）

---

## 将来拡張（本実装では対象外）
- CustomerSite実装後の一括紐づけバッチ
- 納入先のインポート/エクスポート機能
- 地図連携（住所から位置情報の取得）
