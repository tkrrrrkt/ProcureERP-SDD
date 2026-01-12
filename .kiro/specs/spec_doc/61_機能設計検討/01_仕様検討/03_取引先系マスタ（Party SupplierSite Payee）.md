# 取引先系マスタ 仕様概要

本ドキュメントは、ProcureERP における取引先系マスタ（Party / SupplierSite / Payee / CustomerSite / ShipTo）の**仕様概要である。  
本書に記載された内容は、以後の設計・実装・テスト・UI/UX検討において**前提条件として固定**し、変更が生じる場合は明示的な変更管理（ADR / 仕様変更チケット）を必須とする。 

---

## 0. スコープ

### 0.1 凍結対象（本Spec Freezeの対象）
- Party（取引先法人）: `parties`
- SupplierSite（仕入先拠点）: `supplier_sites`
- Payee（支払先）: `payees`
- CustomerSite（得意先拠点）: `customer_sites`
- ShipTo（納入先）: `ship_tos`

### 0.2 非対象（未凍結 / TBD）
- なし（本ドキュメントで取引先系マスタの基本骨格を凍結する）

---

## 1. 基本思想（不変）

1. マルチテナント：**1テナント = 1自社法人**  
   - `tenant_id` をRLS境界とする 
2. 正本PKは **UUID** とする  
   - 業務コードは人間可読用途（表示・検索・帳票・外部連携）に限定する 
3. Party配下に「Site（拠点）」をぶら下げる  
   - SupplierSite / CustomerSite は Party（法人）配下の拠点概念 
4. SupplierSite と Payee は **エンティティ分離**する  
   - 一括請求（複数仕入先→1支払先）を将来扱える  
   - AP（仕入計上）～支払データ作成の正本単位はPayeeとする 
5. UIは「仕入先登録画面」で完結させる  
   - DBは分ける  
   - UIで同一/既存/新規を扱う 
6. ShipTo（納入先）は **CustomerSite配下**とする（MVP最適・推奨）  
   - 直送先（得意先が指定する納入先／エンドユーザー等）を表す  
   - 自社拠点は倉庫マスタ側で管理し、ShipToは「直送先」を中心に扱う（購買の直送にも将来転用可能）

---

## 2. 用語定義

- Party：相手方の法人（取引先）
- SupplierSite：取引先（Party）に紐づく先方拠点・部署（購買の実務窓口）
- Payee：支払・請求書受領・振込の単位（AP/支払の正本）
- CustomerSite：取引先（Party）に紐づく拠点・部署（販売の実務窓口：将来の卸/受発注統合を想定）
- ShipTo：CustomerSiteに紐づく「納入先（届け先）」拠点（エンドユーザー等を含む） 

---

## 3. コード体系（確定）

### 3.1 桁数
- `party_code`：**10桁**（UI制限）
- `sub_code`（Supplier/Payee/Customer/ShipTo）：**10桁**（UI制限）
- DB定義：varchar(50)（将来拡張の余地を確保）

### 3.2 テナント設定（コード文字種）
テナント（会社マスタ相当）で、sub_codeの文字種を選択可能とする：
- 数字のみ
- 英数字

### 3.3 入力正規化（確定）
保存時に以下を適用する：
- trim（前後空白除去）
- 半角化
- 英字は大文字に統一（英数字モード時）
- 0/O、1/I 等の誤読文字は制御しない

### 3.4 アプリケーション層バリデーション（確定）
- MVP-1では10桁を厳格にバリデーション
- 英数字のみ許可（テナント設定で数字のみも選択可）
- 正規化後の文字列長が10桁でない場合はエラー

### 3.5 表示コード（保持）
- `supplier_code` / `payee_code` / `customer_code` は **DBに保持**する（確定）
- 生成規則：
  - Supplier/Payee/Customer：`party_code + "-" + sub_code`
    例：`P000000001-0000000001`（最大21文字）
  - ShipTo：ship_to_code（独立コード、10桁）
- DB定義：varchar(50)
- ※PAY/SUP等のprefixは採用しない（対外ドキュメント配慮） 

---

## 4. UI要件（凍結）

### 4.1 仕入先登録画面での支払先指定（3択）
1. 同一（仕入先と同等の支払先）
2. 既存支払先を選択（一括請求）
3. 新規支払先を同時登録 

### 4.2 既存支払先選択の候補範囲（凍結）
- **同一 party_id の Payee のみ選択可**（MVP安全策）
- party跨ぎ（グループ会社一括等）はV2以降の拡張 

---

## 5. Payee自動生成ルール（確定）

### 5.1 自動生成の発火条件
- SupplierSite登録時に `payee_id` 未指定の場合、Payeeを自動生成または既存Payeeを紐づける

### 5.2 既存Payee確認ロジック（重要）
1. 同一 `party_id` + `payee_sub_code` のPayeeが既に存在するかチェック
2. **存在する場合**: 既存Payeeを紐づける（新規作成しない）
3. **存在しない場合**: 新規Payee作成

### 5.3 sub_codeの採番（確定）
- 自動生成Payeeの `payee_sub_code` は **元SupplierSiteの `supplier_sub_code` と同一**

### 5.4 初期コピー範囲（確定）
- SupplierSite → Payee へのコピーは **初回作成時のみ**
- コピー対象：
  - 住所（postal/prefecture/city/address_line1/line2）
  - 連絡先（phone/fax/email/contact_name）
  - 名称（payee_name = supplier_name）
- 以後は独立し、同期しない（確定）

### 5.5 論理削除後の再利用ケース
- SupplierSiteを論理削除（is_active=false）後、同じsub_codeで再作成した場合
- → 既存Payeeが再利用される（新規作成されない）
- → Payeeの is_active 状態に関わらず紐づけ可能 

---

## 6. 支払条件（V1方針凍結）

V1（MVP）はPayeeに以下で保持する：
- `payment_method`
- `currency_code`（ISO 4217）
- `payment_terms_text`（自由記入：締日・支払条件など）

V2以降で `payment_terms` を別テーブル化し、`default_payment_term_id` に移行する（方針のみ固定） 

---
## 7. ShipTo（納入先）の扱い（確定）

### 7.1 基本方針
- ShipTo は CustomerSite 配下（DB上は customer_site_id で参照）
- ただし、納入先コード（ship_to_code）は**独立した別コードとして管理**する（10桁）
  - 得意先コードの含有や親子関係が外部に見える形式は採用しない
  - CustomerSiteとの紐づけは内部のみ（帳票・EDI等には独立コードとして表示）

### 7.2 対象範囲
- 自社倉庫は ShipTo では扱わない（倉庫マスタで管理）
- 直送先（エンドユーザー・現場・工事場所等）は ShipTo として登録
- 住所・連絡先は 1セットのみ（MVP）

### 7.3 独立コード方針の理由
- 直送先の柔軟な管理（CustomerSiteとの紐づけ変更に対応）
- 納入先の機密性確保（得意先との関係を対外に見せない）
- 将来的な購買側の直送対応（発注先から直送先への納品）
  
---

## 8. 参照整合・削除方針（確定）

- 物理削除は原則禁止
- `is_active=false` は新規選択不可。ただし既存取引参照は維持する

---

## 9. is_supplier / is_customer 派生フラグの管理（確定）

### 9.1 目的
- Party一覧での絞り込み・検索の高速化
- 「仕入先として登録済み」「得意先として登録済み」の即座な判定

### 9.2 更新タイミング

#### is_supplier の更新
1. **SupplierSite作成時**: `is_supplier = true` に更新
2. **SupplierSite削除時**:
   - 同一Party配下に有効なSupplierSite（is_active=true）が残っているかチェック
   - なければ `is_supplier = false` に更新

#### is_customer の更新
1. **CustomerSite作成時**: `is_customer = true` に更新
2. **CustomerSite削除時**:
   - 同一Party配下に有効なCustomerSite（is_active=true）が残っているかチェック
   - なければ `is_customer = false` に更新

### 9.3 実装方針
- アプリケーション層（Service層）で明示的に更新
- トランザクション内で整合性を担保

### 9.4 整合性チェック
- 週次バッチで派生フラグとSiteの実態を照合
- 不整合があれば自動修正
- ログに記録して運用監視

---

## 10. 監査列の標準化（確定）

### 10.1 方針
- **created_by_login_account_id / updated_by_login_account_id は実質必須**
- DB定義: NULL許容（login_accounts未実装のため）
- アプリケーション層: Service層で必ずuserIdを設定
- バリデーション: NULLを許容するが、新規作成・更新時は必須

### 10.2 Phase 1（MVP-1）
- FK制約なし（UUID参照のみ）
- アプリケーション層で実質的に必須化

### 10.3 Phase 2（将来）
- login_accounts実装後にFK制約を追加
- 既存データの監査列を埋める移行処理を実施

### 10.4 対象エンティティ
- parties
- supplier_sites
- payees
- customer_sites
- ship_tos

---

## 11. QA壁打ち完了（実装可能）

QA壁打ちセッションにより、以下の項目が確定しました：

### 確定事項
- ✅ Q-001: コード体系の桁数 → 10桁（UI制限）/ varchar(50)（DB）
- ✅ Q-002: Payee自動生成ロジック → 既存Payeeを紐づける
- ✅ Q-003: is_supplier/is_customer管理 → アプリ層で明示的に更新
- ✅ Q-004: 監査列の扱い → 実質必須（社員マスタと統一）
- ✅ Q-005: ShipToのコード体系 → 独立コード維持

### 残存する将来検討事項
- Partyの`party_code`採番運用（自動採番／手入力／既存ERP連携）
- 住所・連絡先（1セット）で足りるか（将来multi-contact化の余地）
- 外部連携（会計/ERP/EDI）時のマッピング方針

上記は実装後に運用フィードバックを得てから判断
