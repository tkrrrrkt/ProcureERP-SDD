# 採番ポリシー（doc_numbering_policy）

## 定義表

| 論理名        | 物理名               | 型         | 長さ/精度 | 必須  | 既定値                          | 備考                                                                    |
| ---------- | ----------------- | --------- | ----- | --- | ---------------------------- | --------------------------------------------------------------------- |
| ID         | id                | UUID      | -     | ○   | -                            | 主キー（恒久ID）                                                             |
| テナントID     | tenant_id         | UUID      | -     | ○   | -                            |                                                                       |
| 会社ID       | company_id        | UUID      | -     | ○   | -                            |                                                                       |
| 伝票種別ID     | doc_type_id       | UUID      | -     | ○   | -                            | doc_type へのFK                                                         |
| 採番スコープ     | scope             | TEXT      | -     | ○   | COMPANY                      | TENANT/COMPANY/DEPT                                                   |
| リセット周期     | reset_policy      | TEXT      | -     | ○   | YEARLY                       | NEVER/YEARLY/MONTHLY/DAILY                                            |
| 表示フォーマット   | format_pattern    | TEXT      | -     | ○   | {PREFIX}-{YYYY}-{DEPT}-{SEQ} | 例：`{PREFIX}-{YYYY}{MM}-{SEQ}`／使用可：PREFIX, YYYY, YY, MM, DD, DEPT, SEQ |
| 接頭語        | prefix            | VARCHAR   | 16    | ○   | -                            | 例：PR/RFQ/PO/RCV/AP                                                    |
| 桁数         | number_width      | SMALLINT  | -     | ○   | 6                            | 3〜12 を推奨                                                              |
| 部門コード挿入    | include_dept_code | BOOLEAN   | -     | ○   | false                        | true の場合、DEPTをフォーマットに反映                                               |
| 区切り記号      | separator         | VARCHAR   | 1     | ○   | -                            | 例：`-`                                                                 |
| 適用部門ID（任意） | dept_id           | UUID      | -     | -   | -                            | 部門別に上書きする場合に指定（DEPTスコープ時は必須運用を想定）                                     |
| 適用開始日      | valid_from        | DATE      | -     | ○   | CURRENT_DATE                 | 日付基準でポリシーの切替管理                                                        |
| 備考         | notes             | TEXT      | -     | -   | -                            |                                                                       |
| 作成日時       | created_at        | TIMESTAMP | -     | ○   | now()                        |                                                                       |
| 更新日時       | updated_at        | TIMESTAMP | -     | ○   | now()                        |                                                                       |