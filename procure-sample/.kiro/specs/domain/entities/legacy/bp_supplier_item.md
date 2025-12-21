# BP仕入先品目（bp_supplier_item）

## 定義表

| 論理名       | 物理名                     | 型         | 長さ/精度 | 必須    | 既定値          | 備考                  |
| --------- | ----------------------- | --------- | ----- | ----- | ------------ | ------------------- |
| ID        | id                      | UUID      | -     | ○     | -            | 主キー                 |
| テナントID    | tenant_id               | UUID      | -     | ○     | -            |                     |
| 会社ID      | company_id              | UUID      | -     | ○     | -            |                     |
| 取引先ID（BP） | partner_id              | UUID      | -     | ○     | -            | business_partner.id |
| 品目ID      | item_id                 | UUID      | -     | ○     | -            | item.id             |
| 取引先品目コード  | supplier_item_code      | VARCHAR   | 64    | -     | -            | ベンダ型番（企業全体で共通）      |
| 取引先品目名    | supplier_item_name      | VARCHAR   | 160   | -     | -            | 任意                  |
| 発注単位      | purchase_uom            | VARCHAR   | 16    | ○     | -            | 例：EA, BOX           |
| 在庫単位換算係数  | conv_to_inventory       | NUMERIC   | 18,6  | ○     | 1            | 1発注単位＝何在庫単位か        |
| 最低発注数量    | min_order_qty           | NUMERIC   | 18,3  | -     | -            | MOQ                 |
| 発注単位倍数    | order_multiple          | NUMERIC   | 18,3  | -     | -            | 箱発注など               |
| 標準パック数量   | std_pack_qty            | NUMERIC   | 18,3  | -     | -            |                     |
| 標準LT（日）   | lead_time_days          | SMALLINT  | -     | -     | -            | 企業全体の目安（拠点差は今回は見ない） |
| 原産国       | origin_country          | CHAR      | 2     | -     | -            | JP, CN…             |
| 検査要否      | inspection_required     | BOOLEAN   | -     | ○     | false        |                     |
| 証明書要否     | certificate_required    | BOOLEAN   | -     | ○     | false        | RoHS/材証など           |
| 備考        | notes                   | TEXT      | -     | -     | -            |                     |
| ステータス     | status                  | TEXT      | -     | ○     | ACTIVE       | ACTIVE / INACTIVE   |
| 適用開始/終了   | valid_from / valid_to   | DATE      | -     | ○ / - | CURRENT_DATE |                     |
| 作成/更新     | created_at / updated_at | TIMESTAMP | -     | ○     | now()        |                     |