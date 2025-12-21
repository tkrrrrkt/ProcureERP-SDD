# 理由（reason）

## 定義表

|論理名|物理名|型|長さ/精度|必須|既定値|備考|
|---|---|---|---|---|---|---|
|ID|id|UUID|-|○|-|主キー|
|テナントID|tenant_id|UUID|-|○|-||
|会社ID|company_id|UUID|-|○|-||
|理由コード|reason_code|VARCHAR|32|○|-|会社内一意（例：`CANCEL_NO_STOCK`、`RETURN_DEFECT`）|
|理由名|reason_name|VARCHAR|120|○|-||
|理由カテゴリ|reason_category|TEXT|-|○|GENERIC|CANCEL / RETURN / ADJUSTMENT / HOLD / REJECT / GENERIC|
|説明|description|TEXT|-|-|-|現場向けメモ|
|ステータス|status|TEXT|-|○|ACTIVE|ACTIVE / INACTIVE|
|適用開始日|valid_from|DATE|-|○|CURRENT_DATE||
|適用終了日|valid_to|DATE|-|-|-||
|作成日時|created_at|TIMESTAMP|-|○|now()||
|更新日時|updated_at|TIMESTAMP|-|○|now()|