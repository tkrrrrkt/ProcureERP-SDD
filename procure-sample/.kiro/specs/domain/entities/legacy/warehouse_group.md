# 倉庫グループ（warehouse_group）

## 定義表

| 論理名         | 物理名             | 型         | 長さ/精度 | 必須  | 既定値          | 備考                |
| ----------- | --------------- | --------- | ----- | --- | ------------ | ----------------- |
| ID          | id              | UUID      | -     | ○   | -            | 主キー（恒久ID）         |
| テナントID      | tenant_id       | UUID      | -     | ○   | -            |                   |
| 会社ID        | company_id      | UUID      | -     | ○   | -            |                   |
| 倉庫グループコード   | group_code      | VARCHAR   | 16    | ○   | -            | テナント＋会社内で一意       |
| 倉庫グループ名     | group_name      | VARCHAR   | 80    | ○   | -            |                   |
| 倉庫グループ名（カナ） | group_name_kana | VARCHAR   | 80    | -   | -            |                   |
| 既定フラグ       | is_default      | BOOLEAN   | -     | ○   | false        | 会社内の既定グループに任意指定   |
| 説明          | description     | TEXT      | -     | -   | -            |                   |
| ステータス       | status          | TEXT      | -     | ○   | ACTIVE       | ACTIVE / INACTIVE |
| 適用開始日       | valid_from      | DATE      | -     | ○   | CURRENT_DATE |                   |
| 適用終了日       | valid_to        | DATE      | -     | -   | -            |                   |
| 備考          | notes           | TEXT      | -     | -   | -            |                   |
| 作成日時        | created_at      | TIMESTAMP | -     | ○   | now()        |                   |
| 更新日時        | updated_at      | TIMESTAMP | -     | ○   | now()        |                   |