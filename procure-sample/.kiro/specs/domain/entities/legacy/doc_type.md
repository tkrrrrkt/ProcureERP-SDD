# 伝票種別（doc_type）

## 定義表

| 論理名     | 物理名        | 型         | 長さ/精度 | 必須  | 既定値    | 備考                                |
| ------- | ---------- | --------- | ----- | --- | ------ | --------------------------------- |
| ID      | id         | UUID      | -     | ○   | -      | 主キー（恒久ID）                         |
| テナントID  | tenant_id  | UUID      | -     | ○   | -      |                                   |
| 会社ID    | company_id | UUID      | -     | ○   | -      |                                   |
| 伝票種別コード | code       | VARCHAR   | 16    | ○   | -      | 例：PR/RFQ/PO/RCV/APINV。テナント・会社内で一意 |
| 伝票種別名   | name       | VARCHAR   | 80    | ○   | -      | 日本語名                              |
| ステータス   | status     | TEXT      | -     | ○   | ACTIVE | ACTIVE/INACTIVE                   |
| 備考      | notes      | TEXT      | -     | -   | -      |                                   |
| 作成日時    | created_at | TIMESTAMP | -     | ○   | now()  |                                   |
| 更新日時    | updated_at | TIMESTAMP | -     | ○   | now()  |                                   |