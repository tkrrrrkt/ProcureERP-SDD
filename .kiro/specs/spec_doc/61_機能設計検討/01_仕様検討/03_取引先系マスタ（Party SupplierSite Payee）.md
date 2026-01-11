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

## 3. コード体系（凍結）

### 3.1 桁数
- `party_code`：**5桁**（採番ルールはテナント運用）
- `sub_code`（Supplier/Payee/Customer/ShipTo）：**5桁固定**（将来拡張はvarcharで吸収） 

### 3.2 テナント設定（コード文字種）
テナント（会社マスタ相当）で、sub_codeの文字種を選択可能とする：
- 数字のみ
- 英数字 

### 3.3 入力正規化（凍結）
保存時に以下を適用する：
- trim（前後空白除去）
- 半角化
- 英字は大文字に統一（英数字モード時）
- 0/O、1/I 等の誤読文字は制御しない 

### 3.4 表示コード（保持）
- `supplier_code` / `payee_code` / `customer_code` / `ship_to_code` は **DBに保持**する（凍結）
- 生成規則：
  - Supplier/Payee/Customer：`party_code + "-" + sub_code`  
    例：`P00001-00001`
  - ShipTo：ship_to_code（独立コード）
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

## 5. Payee自動生成ルール（凍結）

### 5.1 自動生成の発火条件
- SupplierSite登録時に `payee_id` 未指定の場合、Payeeを自動生成して紐づける 

### 5.2 sub_codeの採番（凍結）
- 自動生成Payeeの `payee_sub_code` は **元SupplierSiteの `supplier_sub_code` と同一** 

### 5.3 初期コピー範囲（凍結）
- SupplierSite → Payee へのコピーは **初回のみ**
- コピー対象：
  - 住所（postal/prefecture/city/address_line1/line2）
  - 連絡先（phone/fax/email/contact_name）
- 以後は独立し、同期しない（凍結） 

---

## 6. 支払条件（V1方針凍結）

V1（MVP）はPayeeに以下で保持する：
- `payment_method`
- `currency_code`（ISO 4217）
- `payment_terms_text`（自由記入：締日・支払条件など）

V2以降で `payment_terms` を別テーブル化し、`default_payment_term_id` に移行する（方針のみ固定） 

---
## 7. ShipTo（納入先）の扱い（凍結）
- ShipTo は CustomerSite 配下（DB上は customer_site_id で参照）
- ただし、納入先コード（ship_to_code）は独立した別コードとして管理する
  - 得意先コードの含有や親子関係が外部に見える形式は採用しない
- 自社倉庫は ShipTo では扱わない（倉庫マスタで管理）
- 直送先（エンドユーザー・現場）は ShipTo として登録
- 住所・連絡先は 1セットのみ（MVP）
  
---

## 8. 参照整合・削除方針（凍結）

- 物理削除は原則禁止
- `is_active=false` は新規選択不可。ただし既存取引参照は維持する 

---

## 9. QA壁打ち（ここから先の進め方：凍結後の残論点を潰す）

※このセクションはSpec Freeze範囲外の「将来検討メモ」であり、正本仕様ではない（実装の前提にしない）。

※本領域のマスタ設計は Spec Freeze 済み（凍結）。変更はADR/仕様変更チケット必須。

本Spec Freeze以後は、以下をQA形式で確定していく（例）：
- Partyの`party_code`採番運用（自動採番／手入力／既存ERP連携）
- CustomerSite/ShipToの「購買側での使い道」（直送・請求先表現・EDI）
- ShipToのコード二段化（`customer_code + "-" + ship_to_sub_code`）の運用妥当性
- 住所・連絡先（1セット）で足りるか（将来multi-contact化の余地）
- 外部連携（会計/ERP/EDI）時のマッピング方針
