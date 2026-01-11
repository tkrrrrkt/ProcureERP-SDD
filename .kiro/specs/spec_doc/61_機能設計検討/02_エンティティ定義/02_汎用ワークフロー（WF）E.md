
# エンティティ定義：汎用ワークフロー（WF）

本ドキュメントは、ProcureERP における汎用ワークフロー（WF）の**実装可能な完全仕様**である。  
「汎用ワークフロー（WF） 仕様概要」を前提とし、ここに記載の仕様がWF領域の正本となる。

---

## 1. 仕様の概要

### 1.1 ゴール
- PR / RFQ / PO / IR を中心に、承認（approve）・差戻（return）・却下（reject）・取消（cancel）を統一的に扱う
- 承認者を「Seat（部門×段）」で管理し、企業ごとの段数・金額閾値・上位部門承認（親参照／固定部門）を設定で表現できるようにする
- 監査・説明責任・再現性を最優先し、submit時に確定した承認者（Task assignee）を固定する

### 1.2 前提（確定）
- 固定WF：submit時に instance / tasks を生成し固定
- Seat方式：department_stable_id × slot_level_no（1..10）
- 代理：Seat代理（事前登録）を優先適用。Seat未設定は申請不可
- 金額条件：min_amount閾値方式。min_amount=0必須。min_amount最大が勝つ。重複禁止
- 差戻：Draft戻し＋再申請でWF再生成
- Cancel：PR/PO/RFQはpurpose=cancelで同一ロジック。RFQは見積登録後取消不可
- IR：Cancelを使わず赤黒（reversal/corrected）。reversal承認完了で取消成立

---

## 2. 状態モデル

### 2.1 伝票状態（WFが関与する最小概念）
- Draft：下書き（WFなし、編集可、論理削除可）
- Submitted：申請済（WF確定）
- Approved：承認済
- Rejected：却下
- Canceled：取消済（Cancel WFが承認完了）
- （補足）Closed：下流影響等で締める概念は伝票側で定義（WF外、Pending管理）

### 2.2 approval_instances.status
- in_progress / approved / rejected / canceled

### 2.3 approval_tasks.status
- pending / approved / rejected / skipped（※現仕様ではスキップ運用しないが、将来用に列挙可）

---

## 3. エンティティ定義（WF領域）

> すべてのテーブルに tenant_id を持つ（RLS境界）。  
> 型は例示（PostgreSQL想定）。IDは uuid を基本とする。

---

# 3.1 document_types（伝票種類）

## 仕様の概要
- 伝票種別は **PR / RFQ / PO / GR / IR** の固定セット。
- `document_types` は **グローバル参照**（`tenant_id` を持たない）。
- エンティティ定義の正本は「08_伝票種類・採番.md」の `document_types`。
- WF側は `document_type_id`（FK→document_types.id）を参照し、既定の承認ON/OFFとCancel可否を制御する。
- **見積（Quote）は伝票種別ではない**（RFQに紐づく概念として扱う）。

## エンティティ定義（参照）

| カラム                         | 型            | NULL | 例        | 補足 |
|------------------------------|---------------|------|-----------|------|
| id                           | uuid          | NO   | DT-...    | PK |
| document_type_key            | varchar(10)   | NO   | PR        | 固定キー（PR/RFQ/PO/GR/IR） |
| document_type_name           | varchar(100)  | NO   | 購買依頼   | 表示名 |
| is_approval_required_default | boolean       | NO   | true      | 既定承認ON/OFF |
| cancel_enabled               | boolean       | NO   | true      | PR/RFQ/POはtrue、GR/IRはfalse想定 |
| notes                        | text          | YES  |           | |
| is_active                    | boolean       | NO   | true      | |
| created_at                   | timestamptz   | NO   |           | |
| created_by_login_account_id  | uuid          | NO   | ACC-...   | FK→login_accounts |
| updated_at                   | timestamptz   | NO   |           | |
| updated_by_login_account_id  | uuid          | NO   | ACC-...   | FK→login_accounts |

## 制約条件（参照）
- UNIQUE(document_type_key)
- CHECK(document_type_key IN ('PR','RFQ','PO','GR','IR'))
- IR は cancel_enabled=false（赤黒方式で表現）

---

# 3.2 approval_routes（承認ルート）

## 仕様の概要
- document_type × purpose（approve/cancel）に対し、金額閾値（min_amount）ごとの承認ルートを定義する。

## エンティティ定義

|カラム|型|NULL|例|補足|
|---|---|---|---|---|
|id|uuid|NO|AR-...|PK|
|tenant_id|uuid|NO|TEN-...|RLS|
|document_type_id|uuid|NO|DT-...|FK document_types|
|purpose|varchar(20)|NO|"approve"|approve/cancel|
|route_name|varchar(200)|NO|"PR 100万以上"|表示|
|is_active|boolean|NO|true|無効は候補外|
|created_at|timestamptz|NO|||
|updated_at|timestamptz|NO|||

## 制約条件
- FK(document_type_id) → document_types(id)
- CHECK(purpose IN ('approve','cancel'))

## 補足事項
- 金額条件（min_amount）は approval_route_conditions に分離して保持する（UIは同一画面で登録）

---

# 3.3 approval_route_conditions（ルート条件：min_amount閾値）

## 仕様の概要
- 1ルートに対し **min_amount（〇円以上）** を1つ持つ（MVP確定）。税抜金額で評価する。

## エンティティ定義

|カラム|型|NULL|例|補足|
|---|---|---|---|---|
|id|uuid|NO|ARC-...|PK|
|tenant_id|uuid|NO|TEN-...|RLS|
|route_id|uuid|NO|AR-...|FK approval_routes|
|min_amount|numeric(18,2)|NO|1000000.00|税抜／閾値|
|currency_code|varchar(3)|NO|"JPY"|MVPはJPY固定でも可|
|is_active|boolean|NO|true|無効は評価外|
|created_at|timestamptz|NO|||
|updated_at|timestamptz|NO|||

## 制約条件
- FK(tenant_id, route_id) → approval_routes(tenant_id, id)
- CHECK(min_amount >= 0)
- UNIQUE(tenant_id, route_id)（1ルート1条件）
- UNIQUE(tenant_id, currency_code, min_amount, route_id)（冗長なら不要）
- **同一 tenant × document_type × purpose 内で min_amount 重複禁止**
  - 実装方法例：
    - ルート条件登録時に、対象（document_type,purpose）配下の min_amount を検索して重複チェック
    - DB制約で担保する場合は、denormalizeした一意キーを持つ（例：route_key = document_type_id + purpose + min_amount）

## 補足事項
- **min_amount=0 のルートが必須**（UI・登録時チェック）
- ルート選択は「min_amount最大が勝つ」。priorityはMVP不要（重複禁止で一意になる）

---

# 3.4 approval_route_steps（ルート段定義）

## 仕様の概要
- ルート内の承認段（Step1..N）を定義する。
- Stepは「対象部門（self/ancestor/fixed）」と「参照Seat段（slot_level_no）」で承認者を解決する。

## エンティティ定義

|カラム|型|NULL|例|補足|
|---|---|---|---|---|
|id|uuid|NO|ARS-...|PK|
|tenant_id|uuid|NO|TEN-...|RLS|
|route_id|uuid|NO|AR-...|FK approval_routes|
|step_no|int|NO|1|1..N|
|step_name|varchar(200)|YES|"一次承認"|表示|
|department_selector|varchar(20)|NO|"self"|self/ancestor/fixed|
|ancestor_level|int|YES|1|selector=ancestorのとき必須|
|fixed_department_stable_id|uuid|YES|DEPT-EXEC|selector=fixedのとき必須|
|slot_level_no|int|NO|1|1..10|
|is_active|boolean|NO|true|無効ステップは候補外（通常は使わない）|
|created_at|timestamptz|NO|||
|updated_at|timestamptz|NO|||

## 制約条件
- FK(tenant_id, route_id) → approval_routes(tenant_id, id)
- UNIQUE(tenant_id, route_id, step_no)
- CHECK(department_selector IN ('self','ancestor','fixed'))
- CHECK(slot_level_no BETWEEN 1 AND 10)
- CHECK(
  (department_selector='ancestor' AND ancestor_level IS NOT NULL AND ancestor_level >= 1 AND fixed_department_stable_id IS NULL)
  OR
  (department_selector='fixed' AND fixed_department_stable_id IS NOT NULL AND ancestor_level IS NULL)
  OR
  (department_selector='self' AND ancestor_level IS NULL AND fixed_department_stable_id IS NULL)
)

## 補足事項
- ルート編集UIで Step1..N を並べて登録する（並び替え等のUX仕様は後続）
- 「fixed部門（例：EXEC/CEO）」は組織マスタ側で stable_id を確定させる

---

# 3.5 department_approver_slots（Seat定義：部門承認スロット）

## 仕様の概要
- 部門ごとに第1〜第10承認席（Seat）を縦持ちで管理する。
- Seatの承認者は **固定社員／ロール** のいずれかで指定できる。

## エンティティ定義

|カラム|型|NULL|例|補足|
|---|---|---|---|---|
|id|uuid|NO|DAS-...|PK|
|tenant_id|uuid|NO|TEN-...|RLS|
|department_stable_id|uuid|NO|DEPT-SALES|対象部門（stable）|
|slot_level_no|int|NO|1|1..10|
|assignee_resolve_type|varchar(20)|NO|"fixed_employee"|fixed_employee/role_owner|
|fixed_employee_id|uuid|YES|EMP-...|type=fixed_employeeで必須|
|role_id|uuid|YES|ROLE-...|type=role_ownerで必須|
|effective_date|date|YES|2026-01-01|将来有効（任意）|
|expiry_date|date|YES|2026-12-31|NULL=無期限|
|is_active|boolean|NO|true|無効は参照不可|
|created_at|timestamptz|NO|||
|updated_at|timestamptz|NO|||

## 制約条件
- UNIQUE(tenant_id, department_stable_id, slot_level_no, effective_date)（effective_date未使用なら UNIQUE(tenant_id, department_stable_id, slot_level_no)）
- CHECK(slot_level_no BETWEEN 1 AND 10)
- CHECK(assignee_resolve_type IN ('fixed_employee','role_owner'))
- CHECK(
  (assignee_resolve_type='fixed_employee' AND fixed_employee_id IS NOT NULL AND role_id IS NULL)
  OR
  (assignee_resolve_type='role_owner' AND role_id IS NOT NULL AND fixed_employee_id IS NULL)
)
- CHECK(expiry_date IS NULL OR effective_date IS NULL OR expiry_date > effective_date)

## 補足事項
- MVP運用は effective_date/expiry_date を使わず、単一設定（NULL）でもよい
- 将来、組織改編（organization_versions）に合わせた「将来有効Seat」登録を可能にするために日付を用意している

---

# 3.6 department_approver_delegations（Seat代理：事前登録）

## 仕様の概要
- Seat（部門×slot_level_no）に対して期間指定で代理承認者を設定する。
- submit時のTask確定において **Seat代理を優先適用**する（確定）。

## エンティティ定義

|カラム|型|NULL|例|補足|
|---|---|---|---|---|
|id|uuid|NO|DAD-...|PK|
|tenant_id|uuid|NO|TEN-...|RLS|
|department_stable_id|uuid|NO|DEPT-SALES|対象部門|
|slot_level_no|int|NO|1|1..10|
|delegate_employee_id|uuid|NO|EMP-...|代理人（責任者）|
|delegate_login_account_id|uuid|YES|ACC-...|代理人actor（任意）|
|effective_date|date|NO|2026-01-01|開始|
|expiry_date|date|NO|2026-01-07|終了|
|reason|text|YES|"休暇"|任意|
|created_by_login_account_id|uuid|NO|ACC-...|監査|
|created_at|timestamptz|NO|||

## 制約条件
- CHECK(slot_level_no BETWEEN 1 AND 10)
- CHECK(expiry_date > effective_date)
- （推奨）同一Seatで期間重複禁止
  - PostgreSQLなら EXCLUDE 制約を検討（tsrangeの重複排除）
- 代理人が存在しない／ログイン不可の場合の扱いはアプリ層で制御（申請不可にするか、代理設定時にバリデーション）

## 補足事項
- 代理は submit時に確定し、以後固定（固定WF原則と整合）
- 代理期間の変更は「次回申請から反映」であり、すでに生成済みTaskには反映しない

---

# 3.7 approval_instances（承認インスタンス）

## 仕様の概要
- submit時に生成される「承認案件の実体」。
- purpose により approve と cancel を区別する。

## エンティティ定義

|カラム|型|NULL|例|補足|
|---|---|---|---|---|
|id|uuid|NO|AI-...|PK|
|tenant_id|uuid|NO|TEN-...|RLS|
|document_type_id|uuid|NO|DT-PR|FK|
|document_id|uuid|NO|PR-...|伝票PK|
|purpose|varchar(20)|NO|"approve"|approve/cancel|
|selected_route_id|uuid|NO|AR-...|採用ルート|
|organization_version_id|uuid|NO|ORG-...|submit時の組織版|
|status|varchar(20)|NO|"in_progress"|in_progress/approved/rejected/canceled|
|parent_instance_id|uuid|YES|AI-...|purpose=cancelのとき元instance|
|submitted_at|timestamptz|NO|||
|submitted_by_login_account_id|uuid|NO|ACC-...|actor|
|created_at|timestamptz|NO|||

## 制約条件
- UNIQUE(tenant_id, document_type_id, document_id, purpose)
- CHECK(purpose IN ('approve','cancel'))
- CHECK(status IN ('in_progress','approved','rejected','canceled'))
- CHECK(
  (purpose='approve' AND parent_instance_id IS NULL)
  OR
  (purpose='cancel' AND parent_instance_id IS NOT NULL)
)
- FK(document_type_id) → document_types(id)
- FK(tenant_id, selected_route_id) → approval_routes(tenant_id, id)

## 補足事項
- 差戻（return）時は status=canceled として終了させ、再submitで新規instanceを作る
- Seat未設定エラーの場合は **instance自体を生成しない（原子性）** とする（実装指針）

---

# 3.8 approval_tasks（承認タスク）

## 仕様の概要
- 各Stepの承認者に割り当てられる実行タスク。
- **submit時に assignee を確定保存**し、以後固定する。

## エンティティ定義

|カラム|型|NULL|例|補足|
|---|---|---|---|---|
|id|uuid|NO|AT-...|PK|
|tenant_id|uuid|NO|TEN-...|RLS|
|approval_instance_id|uuid|NO|AI-...|FK|
|step_no|int|NO|1|段番号|
|assignee_employee_id|uuid|NO|EMP-...|承認者（責任者）|
|assignee_login_account_id|uuid|NO|ACC-...|承認者（actor）|
|status|varchar(20)|NO|"pending"|pending/approved/rejected/skipped|
|assigned_at|timestamptz|NO||生成時|
|actioned_at|timestamptz|YES||最終操作時刻|
|created_at|timestamptz|NO|||

## 制約条件
- FK(tenant_id, approval_instance_id) → approval_instances(tenant_id, id)
- UNIQUE(tenant_id, approval_instance_id, step_no)
- CHECK(status IN ('pending','approved','rejected','skipped'))

## 補足事項
- 同一人物が複数stepのassigneeになる場合でも、Taskは段数分生成し、スキップしない
- pendingの制御（次段をいつpendingにするか）はアプリ層で管理（逐次承認）

---

# 3.9 approval_actions（承認操作ログ）

## 仕様の概要
- 承認者の操作（approve/reject/return 等）を監査として記録する。

## エンティティ定義

|カラム|型|NULL|例|補足|
|---|---|---|---|---|
|id|uuid|NO|AA-...|PK|
|tenant_id|uuid|NO|TEN-...|RLS|
|approval_task_id|uuid|NO|AT-...|FK|
|action_type|varchar(30)|NO|"approve"|approve/reject/return/delegate/cancel_submit|
|comment|text|YES||理由・指摘|
|acted_at|timestamptz|NO|||
|acted_by_login_account_id|uuid|NO|ACC-...|actor|
|created_at|timestamptz|NO|||

## 制約条件
- FK(tenant_id, approval_task_id) → approval_tasks(tenant_id, id)
- CHECK(action_type IN ('approve','reject','return','delegate','cancel_submit'))

## 補足事項
- cancel_submit は「取消申請ボタン押下」のイベントを表す（必要ならinstance生成側で記録）
- 差戻は action_type=return を必須とし、理由入力を推奨（MVPは必須でもよい）

---

# 3.10 approval_task_delegations（都度委任ログ：将来運用）

## 仕様の概要
- 承認者が受けたタスクを別の承認者へ委任した履歴（将来運用）。
- Spec Freeze上、MVPではUI運用しないが、エンティティは用意する。

## エンティティ定義

|カラム|型|NULL|例|補足|
|---|---|---|---|---|
|id|uuid|NO|ATD-...|PK|
|tenant_id|uuid|NO|TEN-...|RLS|
|approval_task_id|uuid|NO|AT-...|対象タスク|
|from_login_account_id|uuid|NO|ACC-...|委任元|
|to_login_account_id|uuid|NO|ACC-...|委任先|
|reason|text|YES||任意|
|delegated_at|timestamptz|NO|||
|created_at|timestamptz|NO|||

## 制約条件
- FK(tenant_id, approval_task_id) → approval_tasks(tenant_id, id)
- （将来）pending時のみ委任可／理由必須等はアプリ層制御

## 補足事項
- 本ログは「Seat代理」とは別概念（Seat代理＝事前登録、都度委任＝実行時の移譲）

---

# 3.11 audit_logs（汎用監査ログ）

## 仕様の概要
- WF以外を含む重要イベント（Draft削除等）も含めた汎用監査ログ。
- Draft削除は「伝票のdeleted_*」と「audit_logs」の併用が方針。

## エンティティ定義

|カラム|型|NULL|例|補足|
|---|---|---|---|---|
|id|uuid|NO|AUD-...|PK|
|tenant_id|uuid|NO|TEN-...|RLS|
|event_type|varchar(50)|NO|"PR_DRAFT_DELETE"|種別|
|entity_type|varchar(50)|NO|"PR"|対象種別|
|entity_id|uuid|NO|PR-...|対象ID|
|occurred_at|timestamptz|NO|||
|actor_login_account_id|uuid|NO|ACC-...|actor|
|details_json|jsonb|YES|{...}|理由、Seat情報、旧→新など|
|created_at|timestamptz|NO|||

## 制約条件
- CHECK(event_type <> '')
- INDEX(tenant_id, entity_type, entity_id)
- INDEX(tenant_id, occurred_at)

## 補足事項
- event_type例：
  - WF_SUBMIT / WF_APPROVE / WF_REJECT / WF_RETURN / WF_CANCEL_SUBMIT / WF_CANCEL_APPROVE
  - DRAFT_DELETE
- approval_actions と audit_logs は役割が近いが、
  - approval_actions：WF操作ログの正本（WFタスクに紐づく）
  - audit_logs：全体監査（伝票・設定変更・削除等を含む）

---

## 4. 主要ロジック仕様（固定WF）

### 4.1 submit（申請：approve purpose）

#### 入力（概念）
- tenant_id
- document_type_id / document_id
- amount_excl_tax（税抜）
- applicant_department_stable_id
- organization_version_id
- actor_login_account_id

#### 処理
1. document_types により承認対象判定（is_approval_required_default=true の場合のみWF生成）
2. ルート候補抽出（document_type_id, purpose=approve）
3. ルート条件評価（amount>=min_amount を満たす中で min_amount最大）
4. Seat未設定検知のため、先に steps を評価し、各Stepで以下を実行
   - 대상部門解決（self / ancestor(n) / fixed）
   - Seat解決（department_stable_id + slot_level_no）  
     - 未設定／無効／期限外 → **申請不可（エラー）**
   - Seat承認者解決（固定社員 or ロール）
   - Seat代理が有効なら代理人へ置換
5. すべて解決できたら approval_instances を生成（status=in_progress）
6. approval_tasks を step_no順で生成（assignee確定保存）
7. 最初のtaskを pending とする（次段は逐次で開く）

#### エラー
- WF_ROUTE_NOT_FOUND：ルートが0件
- WF_SEAT_NOT_CONFIGURED：Seat未設定
- WF_SEAT_INACTIVE：Seat無効または期限外
- WF_ASSIGNEE_NOT_RESOLVED：Seat承認者が解決不能（ロール該当者なし等）

---

### 4.2 approve（承認）
1. 対象 task.status を approved に更新
2. approval_actions(action_type=approve) を記録
3. 次段があれば次taskを pending にする
4. 最終段なら instance.status を approved にして終了

---

### 4.3 reject（却下）
1. task.status を rejected に更新
2. approval_actions(action_type=reject) 記録
3. instance.status を rejected にして終了

---

### 4.4 return（差戻）
1. approval_actions(action_type=return) 記録（理由推奨）
2. instance.status を canceled にして終了
3. 伝票状態を Draft に戻す（伝票側）
4. 再submitで新規instance生成（再評価）

---

### 4.5 cancel（取消：purpose=cancel）
対象：PR / PO / RFQ（cancel_enabled=true）

- 取消申請ボタン押下：
  1. purpose=cancel の approval_instances を新規生成（parent_instance_id=approve instance）
  2. ルート選択・Seat解決・代理適用・tasks生成は approve と同一
  3. cancel instance が approved になったら、伝票状態を Canceled にする

RFQ固有：
- **見積が1件でも登録されたら取消不可**
  - 取消申請ボタン自体を非活性化、またはサーバ側で拒否（RFQ_CANCEL_NOT_ALLOWED）

---

## 5. IR（仕入計上）赤黒（WF観点の整理）

### 5.1 方針
- IRは cancel_enabled=false（Cancel WFは使わない）
- 訂正・取消は IR伝票を追加起票（reversal / corrected）して承認で統制する

### 5.2 最低限のIR属性（WF連携に必要な概念）
- ir_kind：original / reversal / corrected
- ir_group_id：同一訂正系列を束ねる
- reverses_ir_id：reversalが打ち消す対象
- corrects_ir_id：correctedが修正する対象
- reason（訂正理由）
- （金額は符号で表現：reversalはマイナス）

---

（以上）
