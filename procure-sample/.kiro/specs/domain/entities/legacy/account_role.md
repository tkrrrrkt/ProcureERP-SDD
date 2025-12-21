# アカウントロール付与（account_role）

## 定義表

| 論理名         | 物理名          | 型         | 長さ/精度 | 必須  | 既定値          | 備考                                           |
| ----------- | ------------ | --------- | ----- | --- | ------------ | -------------------------------------------- |
| ID          | id           | UUID      | -     | ○   | -            | 主キー                                          |
| テナントID      | tenant_id    | UUID      | -     | ○   | -            |                                              |
| 会社ID        | company_id   | UUID      | -     | ○   | -            |                                              |
| アカウントID（FK） | account_id   | UUID      | -     | ○   | -            | `login_account.id`                           |
| ロールID（FK）   | role_id      | UUID      | -     | ○   | -            | role.id                                      |
| スコープ種別      | scope_type   | TEXT      | -     | ○   | COMPANY      | COMPANY / DEPT / WAREHOUSE（DEPTは子孫継承の運用）     |
| スコープID（任意）  | scope_id     | UUID      | -     | -   | -            | `scope_type`に応じ `dept.id` または `warehouse.id` |
| 適用開始日       | valid_from   | DATE      | -     | ○   | CURRENT_DATE |                                              |
| 適用終了日       | valid_to     | DATE      | -     | -   | -            |                                              |
| 代理付与フラグ     | is_delegated | BOOLEAN   | -     | ○   | false        | 期限付き代行など                                     |
| ステータス       | status       | TEXT      | -     | ○   | ACTIVE       | ACTIVE / INACTIVE                            |
| 備考          | notes        | TEXT      | -     | -   | -            |                                              |
| 作成日時        | created_at   | TIMESTAMP | -     | ○   | now()        |                                              |
| 更新日時        | updated_at   | TIMESTAMP | -     | ○   | now()        |                                              |