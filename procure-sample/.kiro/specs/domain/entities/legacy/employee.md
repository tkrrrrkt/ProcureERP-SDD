# 社員（employee）

## 定義表
| 論理名     | 物理名             | 型         | 長さ/精度 | 必須  | 既定値    | 備考             |
| ------- | --------------- | --------- | ----- | --- | ------ | -------------- |
| ID      | id              | UUID      | -     | ○   | -      | 主キー            |
| テナントID  | tenant_id       | UUID      | -     | ○   | -      | RLS境界          |
| 会社ID    | company_id      | UUID      | -     | ○   | -      | companies へのFK |
| 社員コード   | employee_code   | VARCHAR   | 32    | ○   | -      | 会社内で一意         |
| 氏名      | full_name       | VARCHAR   | 120   | ○   | -      | 例：山田 太郎        |
| 氏名カナ    | full_name_kana  | VARCHAR   | 240   | -   | -      | 任意             |
| メール     | email           | VARCHAR   | 255   | -   | -      |                |
| 在籍ステータス | employee_status | TEXT      | -     | ○   | ACTIVE |                |
| 入社日     | hire_date       | DATE      | -     | ○   | -      |                |
| 退職日     | leave_date      | DATE      | -     | -   | -      | 退職時に設定         |
| 備考      | notes           | TEXT      | -     | -   | -      |                |
| 作成日時    | created_at      | TIMESTAMP | -     | ○   | now()  |                |
| 更新日時    | updated_at      | TIMESTAMP | -     | ○   | now()  |                |
