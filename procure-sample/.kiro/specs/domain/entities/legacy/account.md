# 科目（account）

## 定義表
| 論理名        | 物理名                | 型         | 長さ/精度 | 必須  | 既定値       | 備考                                                              |
| ---------- | ------------------ | --------- | ----- | --- | --------- | --------------------------------------------------------------- |
| ID         | id                 | UUID      | -     | ○   | -         | PK                                                              |
| テナントID     | tenant_id          | UUID      | -     | ○   | -         |                                                                 |
| 会社ID       | company_id         | UUID      | -     | ○   | -         |                                                                 |
| 科目コード      | account_code       | VARCHAR   | 32    | ○   | -         | **会社内一意**                                                       |
| 科目名        | account_name       | VARCHAR   | 160   | ○   | -         | 表示名                                                             |
| **財務区分**   | **fin_stmt_class** | **TEXT**  | -     | ○   | **PL**    | **CHECK IN ('BS','PL','CF','STAT')**                            |
| **勘定要素区分** | **gl_element**     | **TEXT**  | -     | ○   | **ASSET** | **CHECK IN ('ASSET','LIABILITY','EQUITY','REVENUE','EXPENSE')** |
| 外部参照       | external_ref       | TEXT      | -     | -   | -         | 他システムコード等                                                       |
| 備考         | notes              | TEXT      | -     | -   | -         |                                                                 |
| 作成日時       | created_at         | TIMESTAMP | -     | ○   | now()     |                                                                 |
| 更新日時       | updated_at         | TIMESTAMP | -     | ○   | now()     |                                                                 |
