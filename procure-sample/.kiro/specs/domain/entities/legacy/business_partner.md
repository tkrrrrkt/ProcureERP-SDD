# 取引先（business_partner）
## 定義表

| 論理名        | 物理名                | 型         | 長さ/精度 | 必須  | 既定値          | 備考                |
| ---------- | ------------------ | --------- | ----- | --- | ------------ | ----------------- |
| ID         | id                 | UUID      | -     | ○   | -            | 主キー               |
| テナントID     | tenant_id          | UUID      | -     | ○   | -            |                   |
| 会社ID       | company_id         | UUID      | -     | ○   | -            |                   |
| 取引先コード     | partner_code       | VARCHAR   | 32    | ○   | -            | 会社内一意             |
| 取引先名       | partner_name       | VARCHAR   | 160   | ○   | -            |                   |
| 取引先カナ名     | partner_name_kana  | VARCHAR   | 160   | -   | -            |                   |
| 取引先英字名     | partner_name_en    | VARCHAR   | 160   | -   | -            |                   |
| 取引先略名      | partner_short_name | VARCHAR   | 80    | -   | -            |                   |
| 取引先グループコード | partner_group_code | VARCHAR   | 32    | -   | -            | 任意（将来マスタ化可）       |
| 備考         | notes              | TEXT      | -     | -   | -            |                   |
| ステータス      | status             | TEXT      | -     | ○   | ACTIVE       | ACTIVE / INACTIVE |
| 適用開始日      | valid_from         | DATE      | -     | ○   | CURRENT_DATE |                   |
| 適用終了日      | valid_to           | DATE      | -     | -   | -            |                   |
| 作成日時       | created_at         | TIMESTAMP | -     | ○   | now()        |                   |
| 更新日時       | updated_at         | TIMESTAMP | -     | ○   | now()        |                   |