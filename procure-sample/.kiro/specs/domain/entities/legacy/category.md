# カテゴリ（category）

## 定義表
| 論理名     | 物理名             | 型         | 長さ/精度 | 必須  | 既定値    | 備考                                                  |
| ------- | --------------- | --------- | ----- | --- | ------ | --------------------------------------------------- |
| ID      | id              | UUID      | -     | ○   | -      | PK                                                  |
| テナントID  | tenant_id       | UUID      | -     | ○   | -      |                                                     |
| 会社ID    | company_id      | UUID      | -     | ○   | -      |                                                     |
| カテゴリコード | category_code   | VARCHAR   | 32    | ○   | -      | 会社内一意                                               |
| カテゴリ名   | category_name   | VARCHAR   | 120   | ○   | -      | 表示名                                                 |
| 説明      | description     | TEXT      | -     | -   | -      |                                                     |
| 状態      | status          | TEXT      | -     | ○   | ACTIVE | **CHECK IN**('ACTIVE','INACTIVE')                   |
| 備考      | notes           | TEXT      | -     | -   | -      |                                                     |
| 作成日時    | created_at      | TIMESTAMP | -     | ○   | now()  |                                                     |
| 更新日時    | updated_at      | TIMESTAMP | -     | ○   | now()  |                                                     |

