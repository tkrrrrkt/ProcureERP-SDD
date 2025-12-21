# 権限（permission）

## 定義表

| 論理名    | 物理名             | 型         | 長さ/精度 | 必須  | 既定値    | 備考                                                       |
| ------ | --------------- | --------- | ----- | --- | ------ | -------------------------------------------------------- |
| ID     | id              | UUID      | -     | ○   | -      | 主キー                                                      |
| テナントID | tenant_id       | UUID      | -     | ○   | -      |                                                          |
| 会社ID   | company_id      | UUID      | -     | ○   | -      |                                                          |
| 権限コード  | permission_code | VARCHAR   | 128   | ○   | -      | 例：`po.approve` / `ui.screen.po:list:view`（不変・小文字・ドット区切り） |
| リソース   | resource        | VARCHAR   | 80    | ○   | -      | 例：`purchase_order`                                       |
| アクション  | action          | VARCHAR   | 40    | ○   | -      | 例：`approve` / `view` / `create`                          |
| 説明     | description     | TEXT      | -     | -   | -      |                                                          |
| ステータス  | status          | TEXT      | -     | ○   | ACTIVE | ACTIVE / INACTIVE                                        |
| 作成日時   | created_at      | TIMESTAMP | -     | ○   | now()  |                                                          |
| 更新日時   | updated_at      | TIMESTAMP | -     | ○   | now()  |                                                          |