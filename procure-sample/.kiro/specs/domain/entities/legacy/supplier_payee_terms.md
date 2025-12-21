# 仕入先—支払先 取引条件（supplier_payee_terms）

## 定義表

|論理名|物理名|型|長さ/精度|必須|既定値|備考|
|---|---|---|---|---|---|---|
|ID|id|UUID|-|○|-|主キー|
|テナントID|tenant_id|UUID|-|○|-||
|会社ID|company_id|UUID|-|○|-||
|仕入先ID|supplier_id|UUID|-|○|-|supplier.id（拠点＝発注/入荷の相手）|
|支払先ID|payee_id|UUID|-|○|-|payee.id（締・支払の相手）|
|支払条件|payment_term_id|UUID|-|○|-|payment_term.id（末締翌月末等）|
|決済方法（既定）|settlement_method_code|VARCHAR|8|○|-|settlement_method.code（振込/手形/でんさい等）|
|サイト（日数）|sight_days|SMALLINT|-|-|-|例：検収日+30日（手形・外貨で使用）|
|休日回避|holiday_avoidance|TEXT|-|○|ROLL_FORWARD|NONE/ROLL_FORWARD/ROLL_BACK/NEAREST|
|手数料負担|fee_bearer|TEXT|-|○|PAYER|PAYER / PAYEE / SPLIT|
|支払書発行|payment_slip_issue|BOOLEAN|-|○|false||
|支払書フォーム|payment_slip_form_type|TEXT|-|-|-||
|税計算方式（上書き）|tax_build_up_type_override|TEXT|-|-|-|LINE / DOCUMENT（未設定=上位継承）|
|税端数丸め（上書き）|tax_rounding_mode_override|TEXT|-|-|-|ROUND/FLOOR/CEIL 等|
|仕入税区分（上書き）|tax_category_id_override|UUID|-|-|-|tax_category.id（未設定=上位継承）|
|取引条件メモ|terms_note|TEXT|-|-|-|現場向け備考|
|適用開始日|valid_from|DATE|-|○|CURRENT_DATE||
|適用終了日|valid_to|DATE|-|-|-||
|ステータス|status|TEXT|-|○|ACTIVE||
|作成/更新|created_at/updated_at|TIMESTAMP|-|○|now()|