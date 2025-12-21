# 荷姿（item_variant_pack）

## 定義表

|論理名|物理名|型|長/精度|必須|既定値|備考|
|---|---|---|---|---|---|---|
|ID|id|UUID|-|○|-|主キー|
|テナントID|tenant_id|UUID|-|○|-||
|会社ID|company_id|UUID|-|○|-||
|品目仕様ID|item_variant_id|UUID|-|○|-|`item_variant.id`|
|荷姿種別|pack_type|TEXT|-|○|CASE|CASE / DOZEN|
|荷姿単位|pack_uom_code|VARCHAR|16|○|-|例：`CS`/`DOZEN`（`uom.code`）|
|入数（主単位）|qty_in_primary|NUMERIC|18,3|○|-|例：DOZEN=12|
|倍数発注|enforce_multiple|BOOLEAN|-|○|false|true=入数の倍数のみ許容|
|代表フラグ|is_default|BOOLEAN|-|○|false|同一`pack_type`で1件まで|
|ステータス|status|TEXT|-|○|ACTIVE||
|適用開始日|valid_from|DATE|-|○|CURRENT_DATE||
|適用終了日|valid_to|DATE|-|-|-||
|作成日時|created_at|TIMESTAMP|-|○|now()||
|更新日時|updated_at|TIMESTAMP|-|○|now()|