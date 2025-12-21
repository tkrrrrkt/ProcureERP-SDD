# ロール（role）

## 定義表

| 論理名    | 物理名         | 型         | 長さ/精度 | 必須  | 既定値          | 備考                             |
| ------ | ----------- | --------- | ----- | --- | ------------ | ------------------------------ |
| ID     | id          | UUID      | -     | ○   | -            | 主キー（恒久ID）                      |
| テナントID | tenant_id   | UUID      | -     | ○   | -            |                                |
| 会社ID   | company_id  | UUID      | -     | ○   | -            |                                |
| ロールコード | role_code   | VARCHAR   | 64    | ○   | -            | 例：`PO_APPROVER_L1`。テナント＋会社内で一意 |
| ロール名   | role_name   | VARCHAR   | 120   | ○   | -            |                                |
| 説明     | description | TEXT      | -     | -   | -            |                                |
| ステータス  | status      | TEXT      | -     | ○   | ACTIVE       | ACTIVE / INACTIVE              |
| 適用開始日  | valid_from  | DATE      | -     | ○   | CURRENT_DATE |                                |
| 適用終了日  | valid_to    | DATE      | -     | -   | -            |                                |
| 備考     | notes       | TEXT      | -     | -   | -            |                                |
| 作成日時   | created_at  | TIMESTAMP | -     | ○   | now()        |                                |
| 更新日時   | updated_at  | TIMESTAMP | -     | ○   | now()        |                                |