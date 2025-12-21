# 税区分（tax_category）

## 定義表

| 論理名    | 物理名              | 型         | 長さ/精度 | 必須  | 既定値          | 備考                                                     |
| ------ | ---------------- | --------- | ----- | --- | ------------ | ------------------------------------------------------ |
| ID     | id               | UUID      | -     | ○   | -            | 主キー（恒久ID）                                              |
| テナントID | tenant_id        | UUID      | -     | ○   | -            |                                                        |
| 会社ID   | company_id       | UUID      | -     | ○   | -            |                                                        |
| 税区分コード | category_code    | VARCHAR   | 16    | ○   | -            | 例：TAX10、TAX8R、EXEMPT、OUTSCOPE                          |
| 税区分名   | category_name    | VARCHAR   | 80    | ○   | -            | 例：課税10%、軽減8%、非課税、不課税                                   |
| 税処理区分  | treatment        | TEXT      | -     | ○   | TAXABLE      | TAXABLE / REDUCED / ZERO_RATED / EXEMPT / OUT_OF_SCOPE |
| 科目区分   | tax_subject_type | TEXT      | -     | ○   | INPUT_TAX    | 例：INPUT_TAX / NON_DEDUCTIBLE / NONE（会計連携用）             |
| 国コード   | country_code     | CHAR      | 2     | ○   | JP           | ISO 3166-1                                             |
| ステータス  | status           | TEXT      | -     | ○   | ACTIVE       | ACTIVE / INACTIVE                                      |
| 適用開始日  | valid_from       | DATE      | -     | ○   | CURRENT_DATE | 運用切替用（名称変更等も含む）                                        |
| 適用終了日  | valid_to         | DATE      | -     | -   | -            |                                                        |
| 備考     | notes            | TEXT      | -     | -   | -            |                                                        |
| 作成日時   | created_at       | TIMESTAMP | -     | ○   | now()        |                                                        |
| 更新日時   | updated_at       | TIMESTAMP | -     | ○   | now()        |                                                        |