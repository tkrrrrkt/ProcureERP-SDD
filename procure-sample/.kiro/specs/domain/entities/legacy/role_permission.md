# ロール権限定義（role_permission）

## 定義表

| 論理名       | 物理名            | 型         | 長さ/精度 | 必須  | 既定値    | 備考                                    |
| --------- | -------------- | --------- | ----- | --- | ------ | ------------------------------------- |
| ID        | id             | UUID      | -     | ○   | -      | 主キー                                   |
| テナントID    | tenant_id      | UUID      | -     | ○   | -      |                                       |
| 会社ID      | company_id     | UUID      | -     | ○   | -      |                                       |
| ロールID（FK） | role_id        | UUID      | -     | ○   | -      | role.id                               |
| 権限ID（FK）  | permission_id  | UUID      | -     | ○   | -      | permission.id                         |
| 効果        | effect         | TEXT      | -     | ○   | ALLOW  | ALLOW / DENY（Deny優先の運用を想定）            |
| 条件（JSON）  | condition_json | JSONB     | -     | -   | -      | 例：`{"approval_limit":{"JPY":500000}}` |
| 優先度       | priority       | SMALLINT  | -     | ○   | 1      | 同一Permissionに複数条件がある場合の評価順            |
| ステータス     | status         | TEXT      | -     | ○   | ACTIVE | ACTIVE / INACTIVE                     |
| 作成日時      | created_at     | TIMESTAMP | -     | ○   | now()  |                                       |
| 更新日時      | updated_at     | TIMESTAMP | -     | ○   | now()  |                                       |