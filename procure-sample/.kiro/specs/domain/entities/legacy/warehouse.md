# 倉庫（warehouse）

## 定義表

| 論理名          | 物理名                 | 型         | 長さ/精度 | 必須  | 既定値          | 備考                                                                |
| ------------ | ------------------- | --------- | ----- | --- | ------------ | ----------------------------------------------------------------- |
| ID           | id                  | UUID      | -     | ○   | -            | 主キー（恒久ID）                                                         |
| テナントID       | tenant_id           | UUID      | -     | ○   | -            |                                                                   |
| 会社ID         | company_id          | UUID      | -     | ○   | -            |                                                                   |
| 倉庫グループID（FK） | warehouse_group_id  | UUID      | -     | ○   | -            | warehouse_group.id                                                |
| 倉庫コード        | warehouse_code      | VARCHAR   | 16    | ○   | -            | テナント＋会社内で一意                                                       |
| 倉庫名          | warehouse_name      | VARCHAR   | 120   | ○   | -            |                                                                   |
| 倉庫名（カナ）      | warehouse_name_kana | VARCHAR   | 120   | -   | -            |                                                                   |
| 用途           | usage               | TEXT      | -     | ○   | STORAGE      | STORAGE / RECEIVING / SHIPPING / CROSS_DOCK / RETURN / QC_HOLD など |
| 仮想倉庫フラグ      | is_virtual          | BOOLEAN   | -     | ○   | false        | 物理拠点を持たない在庫区（例：仕掛・検収待ち・移動中）                                       |
| 所有形態         | ownership           | TEXT      | -     | ○   | OWNED        | OWNED / 3PL / SUPPLIER / CUSTOMER                                 |
| 国コード         | country_code        | CHAR      | 2     | ○   | JP           | ISO 3166-1                                                        |
| 郵便番号         | postal_code         | VARCHAR   | 16    | -   | -            |                                                                   |
| 都道府県         | region              | VARCHAR   | 80    | -   | -            |                                                                   |
| 市区町村         | city                | VARCHAR   | 120   | -   | -            |                                                                   |
| 住所1          | address1            | VARCHAR   | 200   | -   | -            |                                                                   |
| 住所2          | address2            | VARCHAR   | 200   | -   | -            |                                                                   |
| 電話番号         | phone               | VARCHAR   | 40    | -   | -            |                                                                   |
| タイムゾーン       | time_zone           | VARCHAR   | 64    | ○   | Asia/Tokyo   | IANA TZ（締め時刻・受付時間の計算に使用）                                          |
| 受入可否         | receiving_enabled   | BOOLEAN   | -     | ○   | true         | 入荷処理で使用                                                           |
| 出荷可否         | shipping_enabled    | BOOLEAN   | -     | ○   | true         | 出庫/払出で使用                                                          |
| 負在庫許容        | allow_negative      | BOOLEAN   | -     | ○   | false        | マイナス在庫の許容可否（通常は不可）                                                |
| ステータス        | status              | TEXT      | -     | ○   | ACTIVE       | ACTIVE / INACTIVE                                                 |
| 適用開始日        | valid_from          | DATE      | -     | ○   | CURRENT_DATE |                                                                   |
| 適用終了日        | valid_to            | DATE      | -     | -   | -            |                                                                   |
| 備考           | notes               | TEXT      | -     | -   | -            |                                                                   |
| 作成日時         | created_at          | TIMESTAMP | -     | ○   | now()        |                                                                   |
| 更新日時         | updated_at          | TIMESTAMP | -     | ○   | now()        |                                                                   |