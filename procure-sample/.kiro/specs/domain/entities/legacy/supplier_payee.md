# 仕入先—支払先関連（supplier_payee）

## 定義表

|論理名|物理名|型|長さ/精度|必須|既定値|備考|
|---|---|---|---|---|---|---|
|ID|id|UUID|-|○|-|主キー|
|テナントID|tenant_id|UUID|-|○|-||
|会社ID|company_id|UUID|-|○|-||
|仕入先ID|supplier_id|UUID|-|○|-|supplier.id|
|支払先ID|payee_id|UUID|-|○|-|payee.id|
|代表フラグ|is_default|BOOLEAN|-|○|true|同一期間で1件に制御|
|適用開始日|valid_from|DATE|-|○|CURRENT_DATE||
|適用終了日|valid_to|DATE|-|-|-||
|ステータス|status|TEXT|-|○|ACTIVE||
|作成/更新|created_at/updated_at|TIMESTAMP|-|○|now()||