# Requirements Document

## Project Description (Input)
master-data/business-partner

## Introduction

本ドキュメントは、ProcureERP購買管理SaaSにおける取引先系マスタ（Business Partner Master）の要求仕様を定義する。

取引先系マスタは、以下の5つのエンティティから構成される：
- **Party（取引先法人）**: 相手方法人の基本情報
- **SupplierSite（仕入先拠点）**: 購買実務窓口となる拠点情報
- **Payee（支払先）**: 支払・請求書受領の実務単位
- **CustomerSite（得意先拠点）**: 販売実務窓口となる拠点情報（将来拡張）
- **ShipTo（納入先）**: 直送先・納入先の情報

本仕様は、QA壁打ちセッションにより確定した設計方針（コード体系、Payee自動生成ロジック、is_supplier/is_customer管理、監査列標準化、ShipTo独立コード）に基づいて記載されている。

## Requirements

### Requirement 1: Party（取引先法人）マスタ管理

**Objective:** 購買担当者・経理担当者として、取引先法人の基本情報を一元管理し、仕入先・得意先の登録基盤を提供することで、取引先情報の重複・分散を防止する

#### Acceptance Criteria

1. When 購買担当者がParty登録画面を開いた時、Business Partner Serviceは新規登録フォームを表示する
2. When 購買担当者が必須項目（party_code、party_name）を入力してPartyを登録した時、Business Partner Serviceはテナント内で一意のPartyレコードを作成する
3. When Party登録時にparty_codeが既に存在する場合、Business Partner ServiceはPARTY_CODE_DUPLICATEエラーを返す
4. When party_codeが入力された時、Business Partner Serviceは入力値をtrim・半角化・大文字統一（英数字モード時）して正規化する
5. When 正規化後のparty_codeが10桁でない場合、Business Partner ServiceはINVALID_CODE_LENGTHエラーを返す
6. The Business Partner Serviceはparty_codeをvarchar(50)型で保存し、UI上は10桁制限でバリデーションする
7. When Partyを登録・更新する時、Business Partner Serviceはcreated_by_login_account_id / updated_by_login_account_idに必ずuser_idを設定する
8. When Partyが論理削除（is_active=false）された時、Business Partner Serviceは物理削除せず is_active フラグのみを更新する
9. When Party一覧を取得する時、Business Partner Serviceはis_active=trueのレコードを優先表示し、tenant_idでRLS境界を保証する
10. The Business Partner Serviceはparty_codeの変更を原則禁止とし、変更時は派生表示コード（supplier_code等）も同時更新する

### Requirement 2: SupplierSite（仕入先拠点）マスタ管理

**Objective:** 購買担当者として、取引先法人配下の仕入先拠点情報を登録・管理し、発注・見積・納期回答の実務窓口を明確化することで、購買業務の効率化を実現する

#### Acceptance Criteria

1. When 購買担当者がSupplierSite登録画面を開いた時、Business Partner Serviceは親Partyを選択可能なフォームを表示する
2. When 購買担当者が必須項目（party_id、supplier_sub_code、supplier_name）を入力してSupplierSiteを登録した時、Business Partner Serviceはテナント内でUNIQUE(tenant_id, party_id, supplier_sub_code)制約を満たすレコードを作成する
3. When supplier_sub_codeが入力された時、Business Partner Serviceは入力値をtrim・半角化・大文字統一（英数字モード時）して正規化する
4. When 正規化後のsupplier_sub_codeが10桁でない場合、Business Partner ServiceはINVALID_CODE_LENGTHエラーを返す
5. When SupplierSite登録時にsupplier_codeが生成される時、Business Partner Serviceは「party_code + "-" + supplier_sub_code」形式（最大21文字）で自動生成してDBに保存する
6. When SupplierSite登録時にpayee_idが未指定の場合、Business Partner Serviceは同一party_id + supplier_sub_codeのPayeeが存在するかチェックする
7. When 既存Payeeが存在する場合、Business Partner Serviceは新規作成せず既存Payeeを紐づける
8. When 既存Payeeが存在しない場合、Business Partner ServiceはPayeeを自動生成し（payee_sub_code = supplier_sub_code）、住所・連絡先・名称を初回コピーする
9. When SupplierSiteが作成された時、Business Partner Serviceは親Partyのis_supplierフラグをtrueに更新する
10. When SupplierSiteが論理削除（is_active=false）され、同一Party配下に有効なSupplierSiteが残っていない場合、Business Partner Serviceは親Partyのis_supplierフラグをfalseに更新する
11. When SupplierSiteが論理削除後に同じsub_codeで再作成された場合、Business Partner Serviceは既存Payeeを再利用する

### Requirement 3: Payee（支払先）マスタ管理

**Objective:** 経理担当者として、支払・請求書受領・振込の実務単位を管理し、一括請求（複数仕入先→1支払先）を将来扱えるようにすることで、支払業務の柔軟性を確保する

#### Acceptance Criteria

1. When 経理担当者がPayee登録画面を開いた時、Business Partner Serviceは親Partyを選択可能なフォームを表示する
2. When 経理担当者が必須項目（party_id、payee_sub_code、payee_name）を入力してPayeeを登録した時、Business Partner Serviceはテナント内でUNIQUE(tenant_id, party_id, payee_sub_code)制約を満たすレコードを作成する
3. When payee_sub_codeが入力された時、Business Partner Serviceは入力値をtrim・半角化・大文字統一（英数字モード時）して正規化する
4. When 正規化後のpayee_sub_codeが10桁でない場合、Business Partner ServiceはINVALID_CODE_LENGTHエラーを返す
5. When Payee登録時にpayee_codeが生成される時、Business Partner Serviceは「party_code + "-" + payee_sub_code」形式（最大21文字）で自動生成してDBに保存する
6. When SupplierSite登録画面で既存Payeeを選択する時、Business Partner Serviceは同一party_idのPayeeのみを候補として表示する
7. The Business Partner ServiceはMVP-1でpayment_method / currency_code / payment_terms_textをPayeeに保持する
8. When Payeeが作成された時、Business Partner Serviceはcreated_by_login_account_id / updated_by_login_account_idに必ずuser_idを設定する

### Requirement 4: CustomerSite（得意先拠点）マスタ管理【将来拡張】

**Objective:** 販売担当者として、取引先法人配下の得意先拠点情報を登録・管理し、将来の卸・商社・受発注統合を見据えた基盤を提供することで、販売領域への拡張を可能にする

#### Acceptance Criteria

1. When 販売担当者がCustomerSite登録画面を開いた時、Business Partner Serviceは親Partyを選択可能なフォームを表示する
2. When 販売担当者が必須項目（party_id、customer_sub_code、customer_name）を入力してCustomerSiteを登録した時、Business Partner Serviceはテナント内でUNIQUE(tenant_id, party_id, customer_sub_code)制約を満たすレコードを作成する
3. When customer_sub_codeが入力された時、Business Partner Serviceは入力値をtrim・半角化・大文字統一（英数字モード時）して正規化する
4. When 正規化後のcustomer_sub_codeが10桁でない場合、Business Partner ServiceはINVALID_CODE_LENGTHエラーを返す
5. When CustomerSite登録時にcustomer_codeが生成される時、Business Partner Serviceは「party_code + "-" + customer_sub_code」形式（最大21文字）で自動生成してDBに保存する
6. When CustomerSiteが作成された時、Business Partner Serviceは親Partyのis_customerフラグをtrueに更新する
7. When CustomerSiteが論理削除（is_active=false）され、同一Party配下に有効なCustomerSiteが残っていない場合、Business Partner Serviceは親Partyのis_customerフラグをfalseに更新する

### Requirement 5: ShipTo（納入先）マスタ管理

**Objective:** 販売担当者として、得意先が指定する納入先（直送先・エンドユーザー等）を管理し、納入先コードを独立した別コードとして管理することで、直送先の柔軟な管理と機密性確保を実現する

#### Acceptance Criteria

1. When 販売担当者がShipTo登録画面を開いた時、Business Partner Serviceは親CustomerSiteを選択可能なフォームを表示する
2. When 販売担当者が必須項目（customer_site_id、ship_to_code、ship_to_name）を入力してShipToを登録した時、Business Partner Serviceはテナント内でUNIQUE(tenant_id, ship_to_code)制約を満たすレコードを作成する
3. When ship_to_codeが入力された時、Business Partner Serviceは入力値をtrim・半角化・大文字統一（英数字モード時）して正規化する
4. When 正規化後のship_to_codeが10桁でない場合、Business Partner ServiceはINVALID_CODE_LENGTHエラーを返す
5. The Business Partner Serviceはship_to_codeを独立した10桁コードとして管理し、CustomerSiteのコードを含めない
6. When ShipToを登録・更新する時、Business Partner Serviceはcustomer_site_idとの紐づけをDB内部のみで管理し、対外的にはship_to_codeのみを表示する

### Requirement 6: コード正規化・バリデーション

**Objective:** システム管理者として、業務コードの入力揺れを防止し、一貫した形式でコードを管理することで、データ品質を維持する

#### Acceptance Criteria

1. When 業務コード（party_code / sub_code / ship_to_code）が入力された時、Business Partner Serviceは前後空白を除去（trim）する
2. When 業務コードが入力された時、Business Partner Serviceは全角文字を半角に変換する
3. When 英数字モードでコードが入力された時、Business Partner Serviceは英字を大文字に統一する
4. When 数字のみモードでコードが入力された時、Business Partner Serviceは`^[0-9]{10}$`パターンでバリデーションする
5. When 英数字モードでコードが入力された時、Business Partner Serviceは`^[0-9A-Z]{10}$`パターンでバリデーションする
6. The Business Partner Serviceは0/O、1/I等の誤読文字を特別に制御しない（運用でカバー）

### Requirement 7: 派生フラグ（is_supplier / is_customer）管理

**Objective:** システム管理者として、Party一覧での絞り込み・検索を高速化し、「仕入先として登録済み」「得意先として登録済み」を即座に判定できるようにすることで、ユーザー体験を向上させる

#### Acceptance Criteria

1. When SupplierSiteが作成された時、Business Partner Serviceは親Partyのis_supplierフラグをtrueに更新する
2. When SupplierSiteが論理削除され、同一Party配下に有効なSupplierSite（is_active=true）が残っていない場合、Business Partner Serviceは親Partyのis_supplierフラグをfalseに更新する
3. When CustomerSiteが作成された時、Business Partner Serviceは親Partyのis_customerフラグをtrueに更新する
4. When CustomerSiteが論理削除され、同一Party配下に有効なCustomerSite（is_active=true）が残っていない場合、Business Partner Serviceは親Partyのis_customerフラグをfalseに更新する
5. The Business Partner Serviceはis_supplier / is_customerフラグの更新をアプリケーション層（Service層）で明示的に行い、トランザクション内で整合性を担保する
6. The Business Partner Serviceは週次バッチで派生フラグとSiteの実態を照合し、不整合があれば自動修正してログに記録する

### Requirement 8: 監査列・トレーサビリティ

**Objective:** 監査担当者として、誰がいつ取引先マスタを登録・更新したかを追跡し、J-SOX対応・内部統制報告制度に準拠することで、説明責任を果たす

#### Acceptance Criteria

1. When Party / SupplierSite / Payee / CustomerSite / ShipToを新規作成する時、Business Partner Serviceはcreated_by_login_account_idにuser_idを設定する
2. When Party / SupplierSite / Payee / CustomerSite / ShipToを更新する時、Business Partner Serviceはupdated_by_login_account_idにuser_idを設定する
3. The Business Partner Serviceはcreated_by_login_account_id / updated_by_login_account_idをDB上NULL許容とするが、アプリケーション層で実質必須化する
4. When login_accountsが未実装の場合（MVP-1）、Business Partner ServiceはFK制約なしでUUID参照のみを保持する
5. When login_accountsが実装された時（Phase 2）、Business Partner Serviceは監査列にFK制約を追加する

### Requirement 9: マルチテナント分離・RLS

**Objective:** システム管理者として、1DB内で複数テナントのデータを安全に分離し、テナント間のデータ混入を防止することで、SaaSの信頼性を確保する

#### Acceptance Criteria

1. The Business Partner Serviceは全テーブル（parties / supplier_sites / payees / customer_sites / ship_tos）にtenant_idカラムを必須で持つ
2. The Business Partner ServiceはすべてのクエリのWHERE句にtenant_idを明示する（アプリケーション層ガード）
3. The Business Partner ServiceはRow Level Security（RLS）ポリシーをすべてのテーブルに適用する
4. When RLSポリシーが定義される時、Business Partner Serviceは`tenant_id = current_setting('app.current_tenant_id', true)::text`を使用する
5. The Business Partner Serviceは接続時に`SET app.current_tenant_id = '{tenant_id}';`を実行してRLSコンテキストを設定する

### Requirement 10: 論理削除・参照整合

**Objective:** 購買担当者として、誤って削除した取引先情報を復元可能にし、既存取引の参照整合性を維持することで、データ喪失リスクを低減する

#### Acceptance Criteria

1. The Business Partner Serviceは物理削除を原則禁止とし、is_active=falseによる論理無効化のみを許可する
2. When is_active=falseのレコードが存在する場合、Business Partner Serviceは新規選択候補から除外する
3. When 既存取引（発注・入荷・仕入等）が論理削除されたレコードを参照している場合、Business Partner Serviceは参照を維持する
4. When 論理削除されたレコードを再活性化する時、Business Partner Serviceは同一レコードのis_activeをtrueに戻す（コード再利用は禁止）

### Requirement 11: 楽観ロック（version）

**Objective:** 購買担当者として、複数ユーザーが同時に同一マスタを編集した際の更新衝突を検出し、後勝ちによるデータ喪失を防止することで、データ整合性を保証する

#### Acceptance Criteria

1. The Business Partner Serviceは全マスタテーブル（parties / supplier_sites / payees / customer_sites / ship_tos）にversionフィールド（int, NOT NULL, DEFAULT 1）を持つ
2. When マスタを更新する時、Business Partner Serviceは取得時のversionをWHERE条件に含めてUPDATEする
3. When 更新件数が0の場合、Business Partner ServiceはCONCURRENT_UPDATEエラーを返す
4. When マスタ更新が成功した時、Business Partner Serviceはversionフィールドをインクリメントする

### Requirement 12: 一覧取得・検索・ソート

**Objective:** 購買担当者として、取引先マスタを一覧表示・検索・ソートし、目的の取引先を迅速に見つけることで、業務効率を向上させる

#### Acceptance Criteria

1. When 購買担当者がParty一覧画面を開いた時、Business Partner Serviceはページング（page / pageSize）をサポートした一覧を返す
2. When 一覧取得時にソート条件（sortBy / sortOrder）が指定された時、Business Partner ServiceはDTOキー（camelCase）でソートする
3. When キーワード検索が指定された時、Business Partner Serviceはparty_code / party_name / party_name_kanaを対象にあいまい検索する
4. When is_supplier / is_customerフラグでフィルタが指定された時、Business Partner Serviceは該当するPartyのみを返す
5. The Business Partner Serviceは一覧取得時にINDEX(tenant_id, party_code) / INDEX(tenant_id, is_active)を活用して高速化する

### Requirement 13: Payee自動生成UI統合

**Objective:** 購買担当者として、仕入先登録画面で支払先を「同一」「既存選択」「新規登録」の3択で指定し、UIで完結した登録を実現することで、入力の手間を削減する

#### Acceptance Criteria

1. When 購買担当者がSupplierSite登録画面を開いた時、Business Partner Serviceは支払先指定オプション（同一 / 既存 / 新規）を表示する
2. When 「同一」が選択された時、Business Partner Serviceはpayee_idを未指定として処理し、Payeeを自動生成または既存を紐づける
3. When 「既存選択」が選択された時、Business Partner Serviceは同一party_idのPayee候補を表示する
4. When 「新規登録」が選択された時、Business Partner Serviceはpayee_sub_codeとPayee基本情報を同時入力可能にする

### Requirement 14: エラーハンドリング・ユーザーフィードバック

**Objective:** 購買担当者として、入力エラー・重複エラー・競合エラーを明確なメッセージで通知され、適切な対処方法を理解することで、スムーズな業務遂行を実現する

#### Acceptance Criteria

1. When party_code / supplier_sub_code等が重複した時、Business Partner ServiceはPARTY_CODE_DUPLICATE / SUPPLIER_CODE_DUPLICATEエラーを返す
2. When コード長が10桁でない場合、Business Partner ServiceはINVALID_CODE_LENGTHエラーを返す
3. When 楽観ロック競合が発生した時、Business Partner ServiceはCONCURRENT_UPDATEエラーを返す
4. When 必須項目が未入力の場合、Business Partner ServiceはREQUIRED_FIELD_MISSINGエラーを返す
5. The Business Partner Serviceはエラーレスポンスに`code` / `message` / `details`を含め、UIで適切な表示を可能にする
