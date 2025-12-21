# テナント（tenant）

## 定義表

| 論理名     | 物理名           | 型         | 長さ/精度 | 必須  | 既定値          | 備考                |
| ------- | ------------- | --------- | ----- | --- | ------------ | ----------------- |
| ID      | id            | UUID      | -     | ○   | -            | 主キー（恒久ID）         |
| テナントコード | tenant_code   | VARCHAR   | 32    | ○   | -            | 全体で一意             |
| テナント名   | tenant_name   | VARCHAR   | 160   | ○   | -            |                   |
| 既定ロケール  | locale        | VARCHAR   | 16    | ○   | ja-JP        | 例：ja-JP / en-US   |
| 国コード    | country_code  | CHAR      | 2     | ○   | JP           | ISO 3166-1        |
| タイムゾーン  | time_zone     | VARCHAR   | 64    | ○   | Asia/Tokyo   | IANA TZ           |
| 既定通貨    | base_currency | CHAR      | 3     | ○   | JPY          | ISO 4217          |
| メモ      | notes         | TEXT      | -     | -   | -            | 任意                |
| ステータス   | status        | TEXT      | -     | ○   | ACTIVE       | ACTIVE / INACTIVE |
| 適用開始日   | valid_from    | DATE      | -     | ○   | CURRENT_DATE |                   |
| 適用終了日   | valid_to      | DATE      | -     | -   | -            |                   |
| 作成日時    | created_at    | TIMESTAMP | -     | ○   | now()        |                   |
| 更新日時    | updated_at    | TIMESTAMP | -     | ○   | now()        |                   |