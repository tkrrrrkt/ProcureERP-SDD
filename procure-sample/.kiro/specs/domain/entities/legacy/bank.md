# 銀行（bank）

## 定義表

|論理名|物理名|型|長さ/精度|必須|既定値|備考|
|---|---|---|---|---|---|---|
|ID|id|UUID|-|○|-|主キー（恒久ID）|
|テナントID|tenant_id|UUID|-|○|-||
|会社ID|company_id|UUID|-|○|-||
|銀行コード|bank_code|VARCHAR|4|○|-|国内：4桁金融機関コード|
|銀行名|bank_name|VARCHAR|120|○|-||
|銀行名（カナ）|bank_name_kana|VARCHAR|120|-|-||
|国コード|country_code|CHAR|2|○|JP|ISO 3166-1|
|SWIFT/BIC|swift_bic|VARCHAR|11|-|-|海外送金時|
|ステータス|status|TEXT|-|○|ACTIVE|ACTIVE / INACTIVE|
|適用開始日|valid_from|DATE|-|○|CURRENT_DATE||
|適用終了日|valid_to|DATE|-|-|-||
|備考|notes|TEXT|-|-|-||
|作成日時|created_at|TIMESTAMP|-|○|now()||
|更新日時|updated_at|TIMESTAMP|-|○|now()||