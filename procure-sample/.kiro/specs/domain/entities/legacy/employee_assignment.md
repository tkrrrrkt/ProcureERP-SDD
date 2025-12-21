# 社員所属（employee_assignment）

## 定義表
| 論理名    | 物理名             | 型         | 長さ/精度 | 必須  | 既定値     | 備考                       |
| ------ | --------------- | --------- | ----- | --- | ------- | ------------------------ |
| ID     | id              | UUID      | -     | ○   | -       | 主キー                      |
| テナントID | tenant_id       | UUID      | -     | ○   | -       |                          |
| 社員ID   | employee_id     | UUID      | -     | ○   | -       | employees へのFK           |
| 会社ID   | company_id      | UUID      | -     | ○   | -       | companies へのFK（検索性能用に保持） |
| 組織ID   | dept_id         | UUID      | -     | ○   | -       | org_units へのFK           |
| 所属種別   | assignment_type | TEXT      | -     | ○   | PRIMARY | PRIMARY/SECONDARY        |
| 役職/職位  | position_title  | VARCHAR   | 80    | -   | -       | 任意                       |
| 稼働率    | fte_ratio       | NUMERIC   | 5,2   | ○   | 1.00    | 0.00〜1.00                |
| 管理者フラグ | is_manager      | BOOLEAN   | -     | ○   | false   |                          |
| 開始日    | start_date      | DATE      | -     | ○   | -       |                          |
| 終了日    | end_date        | DATE      | -     | -   | -       | 現在在籍はNULL                |
| 備考     | notes           | TEXT      | -     | -   | -       |                          |
| 作成日時   | created_at      | TIMESTAMP | -     | ○   | now()   |                          |
| 更新日時   | updated_at      | TIMESTAMP | -     | ○   | now()   |                          |
