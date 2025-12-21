# 取引先口座（supplier_bank_account）

## 定義表

| 論理名        | 物理名               | 型         | 長さ/精度 | 必須  | 既定値          | 備考                     |
| ---------- | ----------------- | --------- | ----- | --- | ------------ | ---------------------- |
| ID         | id                | UUID      | -     | ○   | -            | 主キー                    |
| テナントID     | tenant_id         | UUID      | -     | ○   | -            |                        |
| 会社ID       | company_id        | UUID      | -     | ○   | -            |                        |
| 仕入先ID（FK）  | supplier_id       | UUID      | -     | ○   | -            | supplier.id            |
| 銀行支店ID（FK） | bank_branch_id    | UUID      | -     | ○   | -            | bank_branch.id         |
| 口座種別       | account_type      | TEXT      | -     | ○   | -            | FUTSU / TOUZA / CHOKIN |
| 口座番号       | account_number    | VARCHAR   | 20    | ○   | -            |                        |
| 口座名義（カナ）   | account_name_kana | VARCHAR   | 140   | ○   | -            |                        |
| 通貨         | currency          | CHAR      | 3     | ○   | JPY          |                        |
| 代表口座フラグ    | is_default        | BOOLEAN   | -     | ○   | false        | 仕入先内での代表               |
| ステータス      | status            | TEXT      | -     | ○   | ACTIVE       | ACTIVE / INACTIVE      |
| 適用開始日      | valid_from        | DATE      | -     | ○   | CURRENT_DATE |                        |
| 適用終了日      | valid_to          | DATE      | -     | -   | -            |                        |
| 備考         | notes             | TEXT      | -     | -   | -            |                        |
| 作成日時       | created_at        | TIMESTAMP | -     | ○   | now()        |                        |
| 更新日時       | updated_at        | TIMESTAMP | -     | ○   | now()        |                        |