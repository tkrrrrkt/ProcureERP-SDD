# 銀行支店（bank_branch）

## 定義表

| 論理名      | 物理名              | 型         | 長さ/精度 | 必須  | 既定値          | 備考                |
| -------- | ---------------- | --------- | ----- | --- | ------------ | ----------------- |
| ID       | id               | UUID      | -     | ○   | -            | 主キー               |
| テナントID   | tenant_id        | UUID      | -     | ○   | -            |                   |
| 会社ID     | company_id       | UUID      | -     | ○   | -            |                   |
| 銀行ID（FK） | bank_id          | UUID      | -     | ○   | -            | bank.id           |
| 支店コード    | branch_code      | VARCHAR   | 3     | ○   | -            | 国内：3桁             |
| 支店名      | branch_name      | VARCHAR   | 120   | ○   | -            |                   |
| 支店名（カナ）  | branch_name_kana | VARCHAR   | 120   | -   | -            |                   |
| ステータス    | status           | TEXT      | -     | ○   | ACTIVE       | ACTIVE / INACTIVE |
| 適用開始日    | valid_from       | DATE      | -     | ○   | CURRENT_DATE |                   |
| 適用終了日    | valid_to         | DATE      | -     | -   | -            |                   |
| 備考       | notes            | TEXT      | -     | -   | -            |                   |
| 作成日時     | created_at       | TIMESTAMP | -     | ○   | now()        |                   |
| 更新日時     | updated_at       | TIMESTAMP | -     | ○   | now()        |                   |