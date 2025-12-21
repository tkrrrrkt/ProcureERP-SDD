# 納入先（ship_to）

## 定義表

| 論理名         | 物理名                 | 型         | 長さ/精度 | 必須  | 既定値          | 備考                                                |
| ----------- | ------------------- | --------- | ----- | --- | ------------ | ------------------------------------------------- |
| ID          | id                  | UUID      | -     | ○   | -            | 主キー（恒久ID）                                         |
| テナントID      | tenant_id           | UUID      | -     | ○   | -            |                                                   |
| 会社ID        | company_id          | UUID      | -     | ○   | -            |                                                   |
| 納入先コード      | ship_to_code        | VARCHAR   | 32    | ○   | -            | 会社内一意                                             |
| 納入先名        | ship_to_name        | VARCHAR   | 160   | ○   | -            |                                                   |
| 納入先名（カナ）    | ship_to_name_kana   | VARCHAR   | 160   | -   | -            |                                                   |
| 納入先略名       | ship_to_short_name  | VARCHAR   | 80    | -   | -            |                                                   |
| 納入先種別       | ship_to_type        | TEXT      | -     | ○   | WAREHOUSE    | WAREHOUSE / CUSTOMER / PROJECT / OTHER            |
| 所有区分        | ownership           | TEXT      | -     | ○   | INTERNAL     | INTERNAL（自社）/ EXTERNAL（他社・顧客等）                    |
| 倉庫ID（任意）    | warehouse_id        | UUID      | -     | -   | -            | `ship_to_type=WAREHOUSE` のとき自社倉庫を参照（warehouse.id） |
| 取引先ID（任意）   | partner_id          | UUID      | -     | -   | -            | 直送先の企業が自社の取引先マスタにある場合に紐付け（business_partner.id）    |
| 国コード        | country_code        | CHAR      | 2     | ○   | JP           | ISO 3166-1                                        |
| 郵便番号        | postal_code         | VARCHAR   | 16    | -   | -            |                                                   |
| 都道府県        | region              | VARCHAR   | 80    | -   | -            |                                                   |
| 市区町村        | city                | VARCHAR   | 120   | -   | -            |                                                   |
| 住所1         | address1            | VARCHAR   | 200   | -   | -            |                                                   |
| 住所2         | address2            | VARCHAR   | 200   | -   | -            |                                                   |
| 電話          | phone               | VARCHAR   | 40    | -   | -            |                                                   |
| 連絡先メール      | email               | VARCHAR   | 160   | -   | -            |                                                   |
| 受入担当（宛名）    | attention           | VARCHAR   | 120   | -   | -            |                                                   |
| 受入時間帯       | receiving_hours     | TEXT      | -     | -   | -            | 例：平日 9:00–17:00（昼休12:00–13:00）                    |
| 休業曜日        | closed_weekdays     | TEXT      | -     | -   | -            | 例：SAT,SUN／祝日は別カレンダーで管理可                           |
| タイムゾーン      | time_zone           | VARCHAR   | 64    | ○   | Asia/Tokyo   | IANA TZ                                           |
| 目安リードタイム（日） | lead_time_days_hint | SMALLINT  | -     | -   | -            | 計画用ヒント（正規の所要計算は別）                                 |
| 緯度          | geo_lat             | NUMERIC   | 10,6  | -   | -            | ルート最適化等の将来拡張                                      |
| 経度          | geo_lng             | NUMERIC   | 10,6  | -   | -            | 〃                                                 |
| 納入停止フラグ     | on_hold_flag        | BOOLEAN   | -     | ○   | false        | 直送も含む全納入を一時停止                                     |
| 納入停止理由      | on_hold_reason      | TEXT      | -     | -   | -            |                                                   |
| 停止開始        | on_hold_from        | DATE      | -     | -   | -            |                                                   |
| 停止終了        | on_hold_to          | DATE      | -     | -   | -            |                                                   |
| 備考          | notes               | TEXT      | -     | -   | -            | 配送手順・搬入条件（ゲート/フォークリフト有無 等）                        |
| ステータス       | status              | TEXT      | -     | ○   | ACTIVE       | ACTIVE / INACTIVE                                 |
| 適用開始日       | valid_from          | DATE      | -     | ○   | CURRENT_DATE |                                                   |
| 適用終了日       | valid_to            | DATE      | -     | -   | -            |                                                   |
| 作成日時        | created_at          | TIMESTAMP | -     | ○   | now()        |                                                   |
| 更新日時        | updated_at          | TIMESTAMP | -     | ○   | now()        |                                                   |