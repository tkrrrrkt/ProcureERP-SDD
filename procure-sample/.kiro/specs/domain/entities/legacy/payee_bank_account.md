# 支払先口座（payee_bank_account）

## 定義表

|論理名|物理名|型|長さ/精度|必須|既定値|備考|
|---|---|---|---|---|---|---|
|ID|id|UUID|-|○|-|主キー|
|テナントID|tenant_id|UUID|-|○|-||
|会社ID|company_id|UUID|-|○|-||
|支払先ID|payee_id|UUID|-|○|-|payee.id|
|銀行支店ID|bank_branch_id|UUID|-|○|-|bank_branch.id|
|口座種別|account_type|TEXT|-|○|-|FUTSU / TOUZA / …|
|口座番号|account_number|VARCHAR|20|○|-||
|口座名義（カナ）|account_name_kana|VARCHAR|140|○|-||
|通貨|currency|CHAR|3|○|JPY||
|代表口座|is_default|BOOLEAN|-|○|false|通貨単位で1件|
|適用開始/終了|valid_from/valid_to|DATE|-|○/ -|CURRENT_DATE||
|ステータス|status|TEXT|-|○|ACTIVE||
|作成/更新|created_at/updated_at|TIMESTAMP|-|○|now()||