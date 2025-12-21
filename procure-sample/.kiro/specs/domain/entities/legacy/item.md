# 品目（item）

## 定義表

|論理名|物理名|型|長/精度|必須|既定値|備考|
|---|---|---|---|---|---|---|
|ID|id|UUID|-|○|-|主キー|
|テナントID|tenant_id|UUID|-|○|-||
|会社ID|company_id|UUID|-|○|-||
|品目コード|item_code|VARCHAR|32|○|-|会社内一意|
|品目名|item_name|VARCHAR|160|○|-||
|在庫単位|inventory_uom_code|VARCHAR|16|○|EA|`uom.code`|
|二単位使用|dual_uom_enabled|BOOLEAN|-|○|false|trueで副単位を使用|
|副単位|secondary_uom_code|VARCHAR|16|-|-|`uom.code`（dual時）|
|副/主換算（既定）|secondary_per_primary|NUMERIC|18,6|-|-|例：1 EA = 2.35 KG|
|換算丸め|secondary_rounding_mode|TEXT|-|-|ROUND|ROUND/FLOOR/CEIL|
|オプション1名|option1_label|VARCHAR|40|-|-|例：Color|
|オプション2名|option2_label|VARCHAR|40|-|-|例：Size（未使用ならNULL）|
|荷姿使用|packaging_enabled|BOOLEAN|-|○|true|CASE/DOZENを使うか|
|メモ|notes|TEXT|-|-|-||
|ステータス|status|TEXT|-|○|ACTIVE|ACTIVE / INACTIVE|
|適用開始日|valid_from|DATE|-|○|CURRENT_DATE||
|適用終了日|valid_to|DATE|-|-|-||
|作成日時|created_at|TIMESTAMP|-|○|now()||
|更新日時|updated_at|TIMESTAMP|-|○|now()|