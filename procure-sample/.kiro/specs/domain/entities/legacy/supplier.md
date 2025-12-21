# 仕入先（supplier）
## 定義表

|論理名|物理名|型|長さ/精度|必須|既定値|備考|
|---|---|---|---|---|---|---|
|ID|id|UUID|-|○|-|主キー|
|テナントID|tenant_id|UUID|-|○|-||
|会社ID|company_id|UUID|-|○|-||
|取引先ID（親）|partner_id|UUID|-|○|-|business_partner.id|
|仕入先コード|supplier_code|VARCHAR|32|○|-|会社内一意（拠点ごとに付与）|
|仕入先名|supplier_name|VARCHAR|160|○|-||
|仕入先名（カナ）|supplier_name_kana|VARCHAR|160|-|-||
|仕入先略名|supplier_short_name|VARCHAR|80|-|-||
|本社フラグ|is_head_office|BOOLEAN|-|○|false|本社を明示したい場合に使用（検索用）|
|国コード|country_code|CHAR|2|○|JP||
|郵便番号|postal_code|VARCHAR|16|-|-||
|都道府県|region|VARCHAR|80|-|-||
|市区町村|city|VARCHAR|120|-|-||
|住所1|address1|VARCHAR|200|-|-||
|住所2|address2|VARCHAR|200|-|-||
|電話|phone|VARCHAR|40|-|-||
|既定通貨|default_currency|CHAR|3|○|JPY|ISO 4217|
|海外フラグ|is_overseas|BOOLEAN|-|○|false||
|税計算方式|tax_build_up_type|TEXT|-|○|LINE|LINE / DOCUMENT|
|既定税区分|default_tax_category_id|UUID|-|-|-|tax_category.id（任意）|
|返品税区分|return_tax_category_id|UUID|-|-|-|tax_category.id（任意）|
|発注停止フラグ|on_hold_flag|BOOLEAN|-|○|false||
|発注停止理由|on_hold_reason|TEXT|-|-|-||
|発注停止開始|on_hold_from|DATE|-|-|-||
|発注停止終了|on_hold_to|DATE|-|-|-||
|備考|notes|TEXT|-|-|-||
|ステータス|status|TEXT|-|○|ACTIVE||
|適用開始日|valid_from|DATE|-|○|CURRENT_DATE||
|適用終了日|valid_to|DATE|-|-|-||
|作成日時|created_at|TIMESTAMP|-|○|now()||
|更新日時|updated_at|TIMESTAMP|-|○|now()|