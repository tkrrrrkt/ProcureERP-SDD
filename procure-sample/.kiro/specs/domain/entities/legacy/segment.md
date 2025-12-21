# セグメント（segment）
## 定義表
| 論理名      | 物理名               | 型         | 長さ/精度 | 必須  | 既定値    | 備考                                |
| -------- | ----------------- | --------- | ----- | --- | ------ | --------------------------------- |
| ID       | id                | UUID      | -     | ○   | -      | PK                                |
| テナントID   | tenant_id         | UUID      | -     | ○   | -      |                                   |
| 会社ID     | company_id        | UUID      | -     | ○   | -      |                                   |
| カテゴリID   | category_id       | UUID      | -     | ○   | -      | categories へのFK                   |
| セグメントコード | segment_code      | VARCHAR   | 64    | ○   | -      | カテゴリ内で一意（例：科目コード・品目コード）           |
| セグメント名   | segment_name      | VARCHAR   | 160   | ○   | -      | 表示名                               |
| 親セグメントID | parent_segment_id | UUID      | -     | -   | -      | 階層（ルートはNULL）                      |
| 階層レベル    | level_no          | SMALLINT  | -     | -   | -      | 任意キャッシュ                           |
| パス       | path              | VARCHAR   | 1024  | -   | -      | 例：/売上/国内/直販                       |
| 有効開始日    | valid_from        | DATE      | -     | ○   | -      | 履歴管理（SCD2ライク）                     |
| 有効終了日    | valid_to          | DATE      | -     | -   | -      | 現在有効はNULL                         |
| 状態       | status            | TEXT      | -     | ○   | ACTIVE | **CHECK IN**('ACTIVE','INACTIVE') |
| 作成日時     | created_at        | TIMESTAMP | -     | ○   | now()  |                                   |
| 更新日時     | updated_at        | TIMESTAMP | -     | ○   | now()  |                                   |
