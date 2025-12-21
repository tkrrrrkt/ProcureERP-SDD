# 自社カレンダー日（company_business_day）

## 定義表

| 論理名    | 物理名             | 型         | 長さ/精度 | 必須  | 既定値    | 備考                    |
| ------ | --------------- | --------- | ----- | --- | ------ | --------------------- |
| ID     | id              | UUID      | -     | ○   | -      | 主キー                   |
| テナントID | tenant_id       | UUID      | -     | ○   | -      |                       |
| 会社ID   | company_id      | UUID      | -     | ○   | -      |                       |
| 日付     | biz_date        | DATE      | -     | ○   | -      | 1日1行                  |
| 営業日フラグ | is_business_day | BOOLEAN   | -     | ○   | true   | true=営業日 / false=非営業日 |
| 事由（任意） | reason          | VARCHAR   | 120   | -   | -      | 例：棚卸休業、特別稼働           |
| メモ     | notes           | TEXT      | -     | -   | -      | 任意                    |
| ステータス  | status          | TEXT      | -     | ○   | ACTIVE | レコード自体の有効/無効          |
| 作成日時   | created_at      | TIMESTAMP | -     | ○   | now()  |                       |
| 更新日時   | updated_at      | TIMESTAMP | -     | ○   | now()  |                       |