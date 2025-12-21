# 支払先（payee）
## 定義表

| 論理名        | 物理名                        | 型         | 長さ/精度 | 必須  | 既定値          | 備考                                  |
| ---------- | -------------------------- | --------- | ----- | --- | ------------ | ----------------------------------- |
| ID         | id                         | UUID      | -     | ○   | -            | 主キー                                 |
| テナントID     | tenant_id                  | UUID      | -     | ○   | -            |                                     |
| 会社ID       | company_id                 | UUID      | -     | ○   | -            |                                     |
| 支払先コード     | payee_code                 | VARCHAR   | 32    | ○   | -            | 会社内一意                               |
| 支払先名       | payee_name                 | VARCHAR   | 160   | ○   | -            |                                     |
| 取引先ID（任意）  | partner_id                 | UUID      | -     | -   | -            | 同一企業グループを示すための関連                    |
| 適格請求書番号    | qualified_invoice_number   | VARCHAR   | 14    | -   | -            | 例：T+13桁（日本）                         |
| 法人番号       | corporate_number           | VARCHAR   | 13    | -   | -            | 任意                                  |
| 支払条件       | payment_term_id            | UUID      | -     | ○   | -            | payment_term.id                     |
| 決済方法（既定）   | settlement_method_code     | VARCHAR   | 8     | ○   | -            | settlement_method.code              |
| 休日回避       | holiday_avoidance          | TEXT      | -     | ○   | ROLL_FORWARD | NONE/ROLL_FORWARD/ROLL_BACK/NEAREST |
| 手数料負担      | fee_bearer                 | TEXT      | -     | ○   | PAYER        | PAYER / PAYEE / SPLIT               |
| 税計算方式（上書き） | tax_build_up_type_override | TEXT      | -     | -   | -            | 未設定は会社 or 仕入先既定                     |
| 税端数丸め（上書き） | tax_rounding_mode_override | TEXT      | -     | -   | -            |                                     |
| 支払保留フラグ    | on_hold_flag               | BOOLEAN   | -     | ○   | false        |                                     |
| 支払保留理由     | on_hold_reason             | TEXT      | -     | -   | -            |                                     |
| 支払保留開始     | on_hold_from               | DATE      | -     | -   | -            |                                     |
| 支払保留終了     | on_hold_to                 | DATE      | -     | -   | -            |                                     |
| 備考         | notes                      | TEXT      | -     | -   | -            |                                     |
| ステータス      | status                     | TEXT      | -     | ○   | ACTIVE       |                                     |
| 適用開始日      | valid_from                 | DATE      | -     | ○   | CURRENT_DATE |                                     |
| 適用終了日      | valid_to                   | DATE      | -     | -   | -            |                                     |
| 作成日時       | created_at                 | TIMESTAMP | -     | ○   | now()        |                                     |
| 更新日時       | updated_at                 | TIMESTAMP | -     | ○   | now()        |                                     |