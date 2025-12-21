# 組織階層（org_structure）
## 定義表
| 論理名    | 物理名            | 型         | 長さ/精度 | 必須  | 既定値    | 備考                   |
| ------ | -------------- | --------- | ----- | --- | ------ | -------------------- |
| ID     | id             | UUID      | -     | ○   | -      | 主キー                  |
| テナントID | tenant_id      | UUID      | -     | ○   | -      |                      |
| 会社ID   | company_id     | UUID      | -     | ○   | -      |                      |
| 組織ID   | dept_id        | UUID      | -     | ○   | -      | org_units 恒久ID       |
| 親組織ID  | parent_dept_id | UUID      | -     | -   | -      | ルートはNULL             |
| 組織名    | org_name       | VARCHAR   | 120   | ○   | -      | 期間中の表示名              |
| 組織種別   | org_type       | TEXT      | -     | ○   | DEPT   |                      |
| 階層レベル  | level_no       | SMALLINT  | -     | -   | -      | 任意（キャッシュ）            |
| パス     | path           | VARCHAR   | 512   | -   | -      | 任意（例：/HQ/Sales/West） |
| 有効開始日  | valid_from     | DATE      | -     | ○   | -      |                      |
| 有効終了日  | valid_to       | DATE      | -     | -   | -      | 現在有効はNULL            |
| ステータス  | status         | TEXT      | -     | ○   | ACTIVE | ACTIVE/INACTIVE      |
| 備考     | notes          | TEXT      | -     | -   | -      |                      |
| 作成日時   | created_at     | TIMESTAMP | -     | ○   | now()  |                      |
| 更新日時   | updated_at     | TIMESTAMP | -     | ○   | now()  |                      |

