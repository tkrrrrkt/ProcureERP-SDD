
# 会計期間（accounting_period）

## 定義表
| 論理名    | 物理名           | 型         | 長さ/精度 | 必須  | 既定値   | 備考                                       |
| ------ | ------------- | --------- | ----- | --- | ----- | ---------------------------------------- |
| ID     | id            | UUID      | -     | ○   | -     | 主キー                                      |
| テナントID | tenant_id     | UUID      | -     | ○   | -     | RLS境界。全検索で必ず条件指定                         |
| 会社ID   | company_id    | UUID      | -     | ○   | -     | companies(tenant_id,id) への複合FK           |
| 会計年度   | fiscal_year   | INT       | -     | ○   | -     | 例：2025（FY2025）                           |
| 期間番号   | period_no     | SMALLINT  | -     | ○   | -     | `MONTH:1–12`                             |
| 期首日    | start_date    | DATE      | -     | ○   | -     |                                          |
| 期末日    | end_date      | DATE      | -     | ○   | -     | `start_date <= end_date`                 |
| 締状態    | close_status  | TEXT      | -     | ○   | OPEN  | `OPEN` / `SOFT_CLOSED` / `HARD_CLOSED`（→ |
| 締日時刻   | closed_at     | TIMESTAMP | -     | -   | -     |                                          |
| 表示ラベル  | display_label | VARCHAR   | 64    | -   | -     | 例：`FY2025 P01 / 2025-04`                 |
| 作成日時   | created_at    | TIMESTAMP | -     | ○   | now() |                                          |
| 更新日時   | updated_at    | TIMESTAMP | -     | ○   | now() |                                          |


