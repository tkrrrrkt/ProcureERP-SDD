# 09_単位（UoM）・単位グループ（UoMGroup） 仕様概要

# 1. スコープ
本ドキュメントは ProcureERP（購買管理SaaS）における以下を定義する。

- 単位グループ（UoMGroup）：互換枠（換算互換の境界）
- 単位（UoM）：数量の単位（品目・伝票明細で使用）
- 品目（Item）との紐づけ方針（base_uom / purchase_uom）
- 伝票明細で許可する単位の範囲（MVP制約）

※単位換算（Conversion）および荷姿（Package）は「2次（V2）」として本ドキュメントではエンティティ定義しない（方針のみ記載）。

# 2. 前提（不変）
- マルチテナント：1テナント = 1自社法人
- RLS境界：tenant_id
- 正本PK：UUID
- 物理削除は禁止、is_active=false による論理無効化
- 業務コード：人間可読用途（表示・検索・帳票・CSV・外部連携）
- 本ドキュメントの対象（UoMGroup/UoM）は **tenant別** とする（利用企業ごとに単位体系が異なるため）

# 3. 用語
- UoMGroup（単位グループ）：同一グループ内の単位のみが互換（将来換算可能）という「互換枠」
- UoM（単位）：数量の単位（例：PCS, BOX, KG）
- base_uom：単位グループ内の基準単位（必須）
- base_uom（Item）：品目の集計・正の単位（必須）
- purchase_uom（Item）：購買入力のデフォルト単位（任意）

# 4. 設計方針（確定）
## 4.1 単位グループは「互換枠」目的で少数（標準）
- UoMGroup は業務分類ではなく「換算互換の枠」を目的とする
- 例：COUNT / WEIGHT / LENGTH / VOLUME / AREA など（テナントが必要に応じて定義）

## 4.2 UoMGroupは base_uom_id を必須（標準ERP寄り）
- 各 UoMGroup は必ず基準単位（base_uom）を1つ持つ
- 将来の単位換算（V2）・荷姿（V2）に自然に接続できる

## 4.3 単位コード（uom_code）は連携強化のため厳格化
- uom_code：英数字大文字＋`-`/`_`のみ、1〜10文字
- 表示名（uom_name）は日本語を許容し、運用の分かりやすさは name 側で担保する

## 4.4 コード変更ポリシー（確定）
- uom_group_code / uom_code は原則変更禁止（移行時の例外のみ）
- 表示名（uom_group_name / uom_name）は変更可能

## 4.5 品目（Item）への紐づけ（確定）
- items.base_uom_id：必須（品目の正の単位／集計軸）
- items.purchase_uom_id：任意（購買入力のデフォルト単位）
  - 未設定時は base_uom を購買単位として扱う

※base_uom と purchase_uom の互換（同一UoMGroup所属）は **アプリ層**で担保する（MVP軽量）。

## 4.6 伝票明細で許可する単位（確定：MVP事故防止）
- 伝票明細の uom_id は「品目の base_uom_id / purchase_uom_id のいずれか」のみ許可する
- デフォルトは purchase_uom（未設定ならbase）
- V2（単位換算ON）以降に「同一UoMGroup内の任意単位」へ拡張可能

# 5. MVP範囲（確定）
- UoMGroup / UoM のCRUD（tenant別）
- 品目（Item）に base_uom / purchase_uom を保持（purchase任意）
- 伝票明細の単位選択は base/purchase のみに制限

# 6. 将来拡張（V2以降：方針のみ）
- 単位換算（グループ内の固定換算：kg↔g 等）
- 荷姿（品目別換算：1箱=12個 等）
- 単位の外部標準コード（UNECE等）や取引先別コードのマッピング
- 小数許容/整数強制などの単位特性（必要に応じて）

以上。
