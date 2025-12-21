# 単位（uom）

## 定義表

|論理名|物理名|型|長/精度|必須|既定値|備考|
|---|---|---|---|---|---|---|
|コード|code|VARCHAR|16|○|-|主キー相当（例：EA/CS/DOZEN/KG）|
|名称|name|VARCHAR|80|○|-|表示名|
|次元|dimension|TEXT|○|COUNT|COUNT/WEIGHT/LENGTH/AREA/VOLUME||
|ステータス|status|TEXT|○|ACTIVE|||
|作成日時|created_at|TIMESTAMP|-|○|now()||
|更新日時|updated_at|TIMESTAMP|-|○|now()||