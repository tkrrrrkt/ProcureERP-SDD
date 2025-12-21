# 品目オプション値（item_option_value）

## 定義表

|論理名|物理名|型|長/精度|必須|既定値|備考|
|---|---|---|---|---|---|---|
|ID|id|UUID|-|○|-|主キー|
|テナントID|tenant_id|UUID|-|○|-||
|会社ID|company_id|UUID|-|○|-||
|品目ID|item_id|UUID|-|○|-|`item.id`|
|オプション枠|option_slot|SMALLINT|-|○|1|1 or 2|
|値コード|option_value_code|VARCHAR|32|○|-|例：RED, M|
|値名|option_value_name|VARCHAR|80|○|-|表示用|
|並び順|display_order|SMALLINT|-|○|100||
|ステータス|status|TEXT|-|○|ACTIVE||
|作成日時|created_at|TIMESTAMP|-|○|now()||
|更新日時|updated_at|TIMESTAMP|-|○|now()|