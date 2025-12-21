# 銀行カレンダー日（bank_business_day）

## 定義表

| 論理名         | 物理名                  | 型         | 長さ/精度 | 必須  | 既定値    | 備考                     |
| ----------- | -------------------- | --------- | ----- | --- | ------ | ---------------------- |
| ID          | id                   | UUID      | -     | ○   | -      | 主キー                    |
| 国コード        | country_code         | CHAR      | 2     | ○   | JP     | ISO 3166-1（日本の銀行営業日）   |
| 日付          | biz_date             | DATE      | -     | ○   | -      | 1日1行                   |
| 銀行営業日フラグ    | is_bank_business_day | BOOLEAN   | -     | ○   | true   | true=銀行営業日 / false=休業日 |
| 祝日/勘定日名（任意） | holiday_name         | VARCHAR   | 120   | -   | -      | 例：振替休日、年末休業            |
| メモ          | notes                | TEXT      | -     | -   | -      | 任意                     |
| ステータス       | status               | TEXT      | -     | ○   | ACTIVE | レコード自体の有効/無効           |
| 作成日時        | created_at           | TIMESTAMP | -     | ○   | now()  |                        |
| 更新日時        | updated_at           | TIMESTAMP | -     | ○   | now()  |                        |