# カンパニー（company）

## 定義表

| 論理名          | 物理名                            | 型         | 長さ/精度 | 必須  | 既定値          | 備考                                  |
| ------------ | ------------------------------ | --------- | ----- | --- | ------------ | ----------------------------------- |
| ID           | id                             | UUID      | -     | ○   | -            | 主キー                                 |
| テナントID       | tenant_id                      | UUID      | -     | ○   | -            | tenant.id                           |
| 会社コード        | company_code                   | VARCHAR   | 16    | ○   | -            | テナント内一意                             |
| 会社名          | company_name                   | VARCHAR   | 160   | ○   | -            |                                     |
| 会社名（カナ）      | company_name_kana              | VARCHAR   | 160   | -   | -            |                                     |
| 会社名（英字）      | company_name_en                | VARCHAR   | 160   | -   | -            |                                     |
| 略称           | company_short_name             | VARCHAR   | 80    | -   | -            |                                     |
| 国コード         | country_code                   | CHAR      | 2     | ○   | JP           |                                     |
| タイムゾーン       | time_zone                      | VARCHAR   | 64    | ○   | Asia/Tokyo   |                                     |
| ロケール         | locale                         | VARCHAR   | 16    | ○   | ja-JP        |                                     |
| 基軸通貨         | base_currency                  | CHAR      | 3     | ○   | JPY          |                                     |
| 会計年度開始月      | fiscal_year_start_month        | SMALLINT  | -     | ○   | 4            | 1–12（日本標準は4を既定に）                    |
| 法人番号         | corporate_number               | VARCHAR   | 13    | -   | -            | 数字13桁                               |
| 適格請求書番号      | invoice_registration_number    | VARCHAR   | 14    | -   | -            | 例：T＋13桁                             |
| 郵便番号         | postal_code                    | VARCHAR   | 16    | -   | -            |                                     |
| 都道府県         | region                         | VARCHAR   | 80    | -   | -            |                                     |
| 市区町村         | city                           | VARCHAR   | 120   | -   | -            |                                     |
| 住所1          | address1                       | VARCHAR   | 200   | -   | -            |                                     |
| 住所2          | address2                       | VARCHAR   | 200   | -   | -            |                                     |
| 電話           | phone                          | VARCHAR   | 40    | -   | -            |                                     |
| 支払：既定支払条件    | default_payment_term_id        | UUID      | -     | -   | -            | payment_term.id                     |
| 支払：既定決済方法    | default_settlement_method_code | VARCHAR   | 8     | -   | -            | settlement_method.code              |
| 支払：休日回避      | payment_holiday_avoidance      | TEXT      | -     | ○   | ROLL_FORWARD | NONE/ROLL_FORWARD/ROLL_BACK/NEAREST |
| カレンダー：社内営業日  | use_company_business_day       | BOOLEAN   | -     | ○   | true         | `company_business_day` を使う想定        |
| カレンダー：銀行営業日国 | bank_calendar_country_code     | CHAR      | 2     | ○   | JP           | `bank_business_day` の参照国            |
| 税：計算方式       | tax_build_up_type              | TEXT      | -     | ○   | LINE         | LINE / DOCUMENT                     |
| 税：端数丸め       | tax_rounding_mode              | TEXT      | -     | ○   | ROUND        | ROUND / FLOOR / CEIL                |
| 税：丸め単位       | tax_rounding_unit              | NUMERIC   | 6,3   | ○   | 1            | 例：1, 0.1                            |
| メモ           | notes                          | TEXT      | -     | -   | -            |                                     |
| ステータス        | status                         | TEXT      | -     | ○   | ACTIVE       |                                     |
| 適用開始日        | valid_from                     | DATE      | -     | ○   | CURRENT_DATE |                                     |
| 適用終了日        | valid_to                       | DATE      | -     | -   | -            |                                     |
| 作成日時         | created_at                     | TIMESTAMP | -     | ○   | now()        |                                     |
| 更新日時         | updated_at                     | TIMESTAMP | -     | ○   | now()        |                                     |