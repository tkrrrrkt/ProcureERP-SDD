# 品目仕様（SKU）（item_variant）

|論理名|物理名|型|長/精度|必須|既定値|備考|
|---|---|---|---|---|---|---|
|ID|id|UUID|-|○|-|主キー（SKU）|
|テナントID|tenant_id|UUID|-|○|-||
|会社ID|company_id|UUID|-|○|-||
|品目ID|item_id|UUID|-|○|-|`item.id`|
|SKUコード|variant_code|VARCHAR|64|○|-|例：`TSHIRT-RED-M`|
|オプション1|option1_code|VARCHAR|32|-|-|値コード（冗長列）|
|オプション2|option2_code|VARCHAR|32|-|-|値コード（冗長列）|
|署名|variant_signature|VARCHAR|128|○|-|`slot1:RED|
|単重|unit_weight|NUMERIC|18,6|-|-|例：1 EAあたり|
|単重単位|unit_weight_uom_code|VARCHAR|16|-|KG|`uom.code`|
|副/主換算（上書き）|secondary_per_primary_override|NUMERIC|18,6|-|-|サイズ等で換算が変わる場合|
|備考|notes|TEXT|-|-|-||
|ステータス|status|TEXT|-|○|ACTIVE||
|適用開始日|valid_from|DATE|-|○|CURRENT_DATE||
|適用終了日|valid_to|DATE|-|-|-||
|作成日時|created_at|TIMESTAMP|-|○|now()||
|更新日時|updated_at|TIMESTAMP|-|○|now()||