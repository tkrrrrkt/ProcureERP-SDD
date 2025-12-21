# 取引条件分割（supplier_payee_terms_split）

## 定義表

|論理名|物理名|型|長さ/精度|必須|既定値|備考|
|---|---|---|---|---|---|---|
|ID|id|UUID|-|○|-|主キー|
|テナントID|tenant_id|UUID|-|○|-||
|会社ID|company_id|UUID|-|○|-||
|取引条件ID|terms_id|UUID|-|○|-|supplier_payee_terms.id|
|行番号|line_no|SMALLINT|-|○|1|1..n|
|決済方法|settlement_method_code|VARCHAR|8|○|-||
|割合（%）|ratio_percent|NUMERIC|5,2|-|-|0–100（合計=100想定）|
|固定金額|fixed_amount|NUMERIC|18,2|-|-|固定額優先時に使用（未設定なら比率）|
|備考|notes|TEXT|-|-|-||
|ステータス|status|TEXT|-|○|ACTIVE||
|作成/更新|created_at/updated_at|TIMESTAMP|-|○|now()|