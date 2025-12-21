# 決済方法（settlement_method）

## 定義表

| 論理名     | 物理名                   | 型         | 長さ/精度 | 必須  | 既定値    | 備考                                |
| ------- | --------------------- | --------- | ----- | --- | ------ | --------------------------------- |
| コード     | code                  | VARCHAR   | 8     | ○   | -      | 主キー相当（会社内一意）                      |
| テナントID  | tenant_id             | UUID      | -     | ○   | -      |                                   |
| 会社ID    | company_id            | UUID      | -     | ○   | -      |                                   |
| 決済方法名   | name                  | VARCHAR   | 80    | ○   | -      |                                   |
| 決済区分    | kind                  | TEXT      | -     | ○   | R      | C:現金 / R:振込 / N:手形 / D:期日 / O:その他 |
| 支払で使用   | payment_use           | BOOLEAN   | -     | ○   | true   |                                   |
| 支払台帳管理  | payment_ledger        | BOOLEAN   | -     | ○   | true   |                                   |
| 海外フラグ   | overseas              | BOOLEAN   | -     | ○   | false  |                                   |
| 海外決済条件名 | overseas_terms_name   | VARCHAR   | 120   | -   | -      | 任意                                |
| ステータス   | status                | TEXT      | -     | ○   | ACTIVE |                                   |
| 作成/更新   | created_at/updated_at | TIMESTAMP | -     | ○   | now()  |                                   |