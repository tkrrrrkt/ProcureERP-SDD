# 支払条件（payment_term）

## 定義表

| 論理名     | 物理名                   | 型         | 長さ/精度 | 必須  | 既定値    | 備考           |
| ------- | --------------------- | --------- | ----- | --- | ------ | ------------ |
| ID      | id                    | UUID      | -     | ○   | -      | 主キー          |
| テナントID  | tenant_id             | UUID      | -     | ○   | -      |              |
| 会社ID    | company_id            | UUID      | -     | ○   | -      |              |
| 支払条件コード | payment_term_code     | VARCHAR   | 16    | ○   | -      | 会社内一意        |
| 名称      | name                  | VARCHAR   | 80    | ○   | -      | 例：末締翌月末      |
| 説明      | description           | TEXT      | -     | -   | -      |              |
| 締日      | closing_day           | SMALLINT  | -     | -   | 99     | 1–31 / 99=月末 |
| 支払日     | pay_day               | SMALLINT  | -     | -   | 99     | 1–31 / 99=月末 |
| 支払月繰り   | pay_month_offset      | SMALLINT  | -     | ○   | 1      | 0–3（例：翌月=1）  |
| ステータス   | status                | TEXT      | -     | ○   | ACTIVE |              |
| 作成/更新   | created_at/updated_at | TIMESTAMP | -     | ○   | now()  |              |