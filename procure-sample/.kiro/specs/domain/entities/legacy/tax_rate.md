# 税率（tax_rate）

## 定義表

| 論理名      | 物理名                   | 型         | 長さ/精度 | 必須  | 既定値    | 備考                   |
| -------- | --------------------- | --------- | ----- | --- | ------ | -------------------- |
| ID       | id                    | UUID      | -     | ○   | -      | 主キー                  |
| テナントID   | tenant_id             | UUID      | -     | ○   | -      |                      |
| 会社ID     | company_id            | UUID      | -     | ○   | -      |                      |
| 税率コード    | rate_code             | VARCHAR   | 16    | ○   | -      | 例：JP10、JP8R          |
| 税率名      | rate_name             | VARCHAR   | 80    | ○   | -      | 例：消費税10%、軽減税率8%      |
| 国コード     | country_code          | CHAR      | 2     | ○   | JP     |                      |
| 消費税率（国税） | national_rate_percent | NUMERIC   | 5,3   | ○   | -      | 例：7.800（%）※将来変更に備え小数 |
| 地方消費税率   | local_rate_percent    | NUMERIC   | 5,3   | ○   | -      | 例：2.200（%）           |
| 適用開始日    | valid_from            | DATE      | -     | ○   | -      |                      |
| 適用終了日    | valid_to              | DATE      | -     | -   | -      |                      |
| ステータス    | status                | TEXT      | -     | ○   | ACTIVE | ACTIVE / INACTIVE    |
| 備考       | notes                 | TEXT      | -     | -   | -      |                      |
| 作成日時     | created_at            | TIMESTAMP | -     | ○   | now()  |                      |
| 更新日時     | updated_at            | TIMESTAMP | -     | ○   | now()  |                      |