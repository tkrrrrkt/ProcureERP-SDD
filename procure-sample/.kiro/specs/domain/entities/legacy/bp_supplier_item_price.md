# BP仕入先品目価格（bp_supplier_item_price）　※数量段階・期間管理

## 定義表

| 論理名       | 物理名                     | 型         | 長さ/精度 | 必須    | 既定値          | 備考                      |
| --------- | ----------------------- | --------- | ----- | ----- | ------------ | ----------------------- |
| ID        | id                      | UUID      | -     | ○     | -            | 主キー                     |
| テナントID    | tenant_id               | UUID      | -     | ○     | -            |                         |
| 会社ID      | company_id              | UUID      | -     | ○     | -            |                         |
| BP仕入先品目ID | bp_supplier_item_id     | UUID      | -     | ○     | -            | bp_supplier_item.id     |
| 通貨        | currency                | CHAR      | 3     | ○     | JPY          | ISO 4217                |
| 最小数量      | min_qty                 | NUMERIC   | 18,3  | ○     | 1            | この数量以上で適用（段階の起点）        |
| 単価（税抜）    | unit_price              | NUMERIC   | 18,6  | ○     | -            | 発注単位あたり（purchase_uom基準） |
| 税区分（任意）   | tax_category_id         | UUID      | -     | -     | -            | 未設定は上位（仕入先/会社）継承        |
| 価格メモ      | price_note              | TEXT      | -     | -     | -            | 例：スポット・キャンペーン           |
| 適用開始/終了   | valid_from / valid_to   | DATE      | -     | ○ / - | CURRENT_DATE |                         |
| ステータス     | status                  | TEXT      | -     | ○     | ACTIVE       |                         |
| 作成/更新     | created_at / updated_at | TIMESTAMP | -     | ○     | now()        |                         |