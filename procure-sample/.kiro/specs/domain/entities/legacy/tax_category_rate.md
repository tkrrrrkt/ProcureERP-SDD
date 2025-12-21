# 税区分—税率関連（tax_category_rate）

## 定義表

| 論理名       | 物理名             | 型         | 長さ/精度 | 必須  | 既定値    | 備考                |
| --------- | --------------- | --------- | ----- | --- | ------ | ----------------- |
| ID        | id              | UUID      | -     | ○   | -      | 主キー               |
| テナントID    | tenant_id       | UUID      | -     | ○   | -      |                   |
| 会社ID      | company_id      | UUID      | -     | ○   | -      |                   |
| 税区分ID（FK） | tax_category_id | UUID      | -     | ○   | -      | tax_category.id   |
| 税率ID（FK）  | tax_rate_id     | UUID      | -     | ○   | -      | tax_rate.id       |
| 適用開始日     | valid_from      | DATE      | -     | ○   | -      | この関連が有効となる開始日     |
| 適用終了日     | valid_to        | DATE      | -     | -   | -      |                   |
| 優先度       | priority        | SMALLINT  | -     | ○   | 1      | 同日複数候補がある場合の選択順   |
| ステータス     | status          | TEXT      | -     | ○   | ACTIVE | ACTIVE / INACTIVE |
| 備考        | notes           | TEXT      | -     | -   | -      |                   |
| 作成日時      | created_at      | TIMESTAMP | -     | ○   | now()  |                   |
| 更新日時      | updated_at      | TIMESTAMP | -     | ○   | now()  |                   |