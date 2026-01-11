# ProcureERP：汎用ワークフロー（WF）仕様

> 本書は、購買管理SaaS（ProcureERP）における「汎用承認ワークフロー（WF）」の仕様を定義する。
> 
> **最重要原則**：承認ルートは **submit（申請）時点で確定し固定**する（以降変更しない）。

---

## 1. 仕様の概要

### 1.1 対象

- 承認対象伝票（例：PR/PO/RFQ/Invoice 等）を汎用的に扱う
    
- 伝票種別は `document_types` で管理し、承認対象かどうかを制御する
    

### 1.2 方式（確定事項）

- **固定WF**：submit時に承認ルートを決定し、承認タスク（tasks）を生成して以後固定
    
- **Seat方式**：承認者は「人」ではなく **承認席（Seat）** として管理
    
    - Seat = `department_stable_id × level_no(1..10)`
        
- Stepは「どの部門のSeatを見るか」を定義できる
    
    - `self`（申請部門）
        
    - `ancestor(n)`（申請部門から親をn段）
        
    - `fixed(dept)`（特定部門）
        
- Seatの承認者は **固定社員／ロール** の両方を許可
    
- 代理承認
    
    - エンティティは **事前登録代理＋都度委任** を用意
        
    - MVP運用は **事前登録代理のみ**
        
- Seat代理の適用順
    
    - **Seat代理（事前登録）が優先**（存在すれば代理へ置換）
        
- Seat未設定
    
    - **申請不可（エラー）**
        
- 同一人物連続承認
    
    - **スキップしない（段として2回承認）**
        
- 承認段数
    
    - 条件で変動可能。MVPは **金額閾値のみ**で分岐
        
- 差戻し
    
    - **Draftに戻し、再submit時にWFを作り直す**
        
- 取消（決裁取り消し）
    
    - 承認済伝票の取消は、同ルートで **cancel purpose** のWFを回し、成功で **Canceled終端**
        

---

## 2. ドメイン用語

- **Draft**：下書き。編集可。承認なし。
    
- **Submitted**：申請済。ここでWFを確定・固定。
    
- **Approval Definition（定義）**：ルート／ステップ／条件／Seatなどの設定。
    
- **Approval Instance（実行）**：特定伝票に対して生成される承認案件（固定）。
    
- **Task**：各ステップの承認者に割り当たる実行タスク。
    
- **Seat**：部門×段の承認席（課長席、部長席、役員席…）。
    
- **Seat代理**：Seatに対する期間指定の代理設定。
    

---

## 3. 状態遷移（伝票・承認）

### 3.1 伝票状態（WFが関与する最小）

- Draft
    
- Submitted（申請）
    
- Approved
    
- Rejected
    
- Canceled（取消承認が通った終端）
    

### 3.2 承認インスタンス状態

- draft（未submitの保持が必要な場合のみ。通常は作らない）
    
- in_progress
    
- approved
    
- rejected
    
- canceled（差戻しで終了、取消WFでの中断など）
    

### 3.3 承認タスク状態

- pending（承認待ち）
    
- approved
    
- rejected
    
- skipped（将来用。現仕様では同一人物でもスキップしない）
    

---

## 4. エンティティ定義

> 命名は暫定。tenant_id は全テーブル必須（RLS境界）。

---

### 4.1 document_types（伝票種類）

#### 仕様の概要

- 伝票種別（PR/PO/RFQ/…）を定義し、承認対象や既定ルートを管理
    

#### エンティティ定義

|項目|型|必須|例|備考|
|---|---|--:|---|---|
|id|uuid|◯|DT-PR|PK|
|tenant_id|uuid|◯|TEN-...|RLS|
|document_type_code|varchar(50)|◯|"PR"|一意|
|document_type_name|varchar(100)|◯|"購買依頼"||
|is_approval_required_default|boolean|◯|true|既定の承認対象|
|default_approval_route_id|uuid|||AR-...|
|cancel_enabled|boolean|◯|true|取消（決裁取り消し）可否|
|is_active|boolean|◯|true||
|created_at|timestamptz|◯|||
|updated_at|timestamptz|◯|||

#### 制約事項

- UNIQUE(tenant_id, document_type_code)
    

---

### 4.2 approval_routes（承認ルート定義）

#### 仕様の概要

- 伝票種別×目的（approve/cancel）ごとにルートを定義
    

#### エンティティ定義

|項目|型|必須|例|備考|
|---|---|--:|---|---|
|id|uuid|◯|AR-...|PK|
|tenant_id|uuid|◯|TEN-...|RLS|
|purpose|varchar(20)|◯|"approve"|approve/cancel|
|route_code|varchar(50)|◯|"PR_STD"|一意|
|route_name|varchar(200)|◯|"購買依頼 標準"||
|target_document_type_id|uuid|◯|DT-PR|対象伝票|
|priority|int|◯|100|小さいほど優先|
|is_active|boolean|◯|true||
|created_at|timestamptz|◯|||
|updated_at|timestamptz|◯|||

#### 制約事項

- UNIQUE(tenant_id, purpose, route_code)
    
- CHECK(purpose IN ('approve','cancel'))
    

---

### 4.3 approval_route_conditions（ルート適用条件）

#### 仕様の概要

- ルートの適用条件を定義
    
- MVPでは金額閾値のみを使用（将来：部門/セグメント拡張）
    

#### エンティティ定義

|項目|型|必須|例|備考|
|---|---|--:|---|---|
|id|uuid|◯|ARC-...|PK|
|tenant_id|uuid|◯|TEN-...|RLS|
|route_id|uuid|◯|AR-...|FK approval_routes|
|min_amount|numeric(18,2)||100000.00|NULL=下限なし|
|max_amount|numeric(18,2)||999999.99|NULL=上限なし|
|is_active|boolean|◯|true||

#### 制約事項

- CHECK(min_amount IS NULL OR max_amount IS NULL OR max_amount >= min_amount)
    

---

### 4.4 department_approver_slots（部門承認スロット：Seat定義）

#### 仕様の概要

- 部門ごとに第1〜第10承認のSeatを定義
    
- Seatの承認者は **固定社員／ロール** の両方を許可
    

#### エンティティ定義

|項目|型|必須|例|備考|
|---|---|--:|---|---|
|id|uuid|◯|DAS-...|PK|
|tenant_id|uuid|◯|TEN-...|RLS|
|department_stable_id|uuid|◯|DEPT-SALES|対象部門|
|level_no|int|◯|1|1..10|
|assignee_resolve_type|varchar(30)|◯|"fixed_employee"|fixed_employee/role_owner|
|fixed_employee_id|uuid|||EMP-...|
|role_id|uuid|||ROLE-...|
|effective_date|date|||将来有効（任意）|
|expiry_date|date|||NULL=無期限|
|is_active|boolean|◯|true||
|created_at|timestamptz|◯|||
|updated_at|timestamptz|◯|||

#### 制約事項

- CHECK(level_no BETWEEN 1 AND 10)
    
- CHECK(assignee_resolve_type IN ('fixed_employee','role_owner'))
    
- CHECK(  
    (assignee_resolve_type='fixed_employee' AND fixed_employee_id IS NOT NULL AND role_id IS NULL)  
    OR (assignee_resolve_type='role_owner' AND role_id IS NOT NULL AND fixed_employee_id IS NULL)  
    )
    
- CHECK(expiry_date IS NULL OR effective_date IS NULL OR expiry_date > effective_date)
    

---

### 4.5 department_approver_delegations（Seat代理：事前登録代理）

#### 仕様の概要

- Seat（部門×level）に対して期間指定で代理人を設定
    
- submit時のTask確定で **Seat代理を優先適用**
    

#### エンティティ定義

|項目|型|必須|例|備考|
|---|---|--:|---|---|
|id|uuid|◯|DAD-...|PK|
|tenant_id|uuid|◯|TEN-...|RLS|
|department_stable_id|uuid|◯|DEPT-SALES|対象部門|
|level_no|int|◯|1|1..10|
|delegate_employee_id|uuid|◯|EMP-...|代理人（責任者）|
|delegate_login_account_id|uuid|||ACC-...|
|effective_date|date|◯|2026-01-01|開始|
|expiry_date|date|◯|2026-01-07|終了|
|reason|text||"休暇"|任意|
|created_by_login_account_id|uuid|◯|ACC-...|監査|
|created_at|timestamptz|◯|||

#### 制約事項

- CHECK(level_no BETWEEN 1 AND 10)
    
- CHECK(expiry_date > effective_date)
    
- （推奨）同一Seatで期間重複禁止：EXCLUDE制約（PostgreSQL）
    

---

### 4.6 approval_route_steps（承認ルート段定義）

#### 仕様の概要

- ルート内の段（Step）を定義
    
- 承認者の解決方式（Resolver）を持つ
    
- 方式は **Seat参照**を基本とし、将来の上長チェーン（manager_chain）も保持可能
    

#### エンティティ定義

|項目|型|必須|例|備考|
|---|---|--:|---|---|
|id|uuid|◯|ARS-...|PK|
|tenant_id|uuid|◯|TEN-...|RLS|
|route_id|uuid|◯|AR-...|FK approval_routes|
|step_no|int|◯|1|1..N|
|step_name|varchar(200)|◯|"一次承認"||
|approver_resolve_type|varchar(30)|◯|"seat"|seat/fixed_employee/role_owner/manager_chain|
|resolve_params_json|jsonb||{"selector":"ancestor","ancestor_levels":1,"slot_level_no":1}|Seat参照の指定|
|fixed_employee_id|uuid|||EMP-...|
|role_id|uuid|||ROLE-...|
|is_parallel|boolean|◯|false|将来|
|is_active|boolean|◯|true||

#### resolve_params_json（Seat参照の推奨キー）

- selector：self / ancestor / fixed
    
- ancestor_levels：int（selector=ancestorのとき）
    
- fixed_department_stable_id：uuid（selector=fixedのとき）
    
- slot_level_no：int（1..10）
    

#### 制約事項

- UNIQUE(tenant_id, route_id, step_no)
    
- CHECK(approver_resolve_type IN ('seat','fixed_employee','role_owner','manager_chain'))
    

---

### 4.7 approval_instances（承認インスタンス）

#### 仕様の概要

- submit時に生成される承認の実体
    
- **purpose により承認／取消承認を同一エンジンで扱う**
    

#### エンティティ定義

|項目|型|必須|例|備考|
|---|---|--:|---|---|
|id|uuid|◯|AI-...|PK|
|tenant_id|uuid|◯|TEN-...|RLS|
|purpose|varchar(20)|◯|"approve"|approve/cancel|
|document_type_id|uuid|◯|DT-PR||
|document_id|uuid|◯|PR-...|伝票PK|
|organization_version_id|uuid|◯|ORG-2025-04|submit時の版|
|selected_route_id|uuid|◯|AR-...|決定ルート|
|parent_instance_id|uuid|||AI-...|
|status|varchar(20)|◯|"in_progress"|draft/in_progress/approved/rejected/canceled|
|submitted_at|timestamptz|◯|||
|submitted_by_login_account_id|uuid|◯|ACC-...|actor|
|created_at|timestamptz|◯|||

#### 制約事項

- UNIQUE(tenant_id, purpose, document_type_id, document_id)
    
- CHECK(purpose IN ('approve','cancel'))
    
- CHECK(status IN ('draft','in_progress','approved','rejected','canceled'))
    
- CHECK(  
    (purpose='approve' AND parent_instance_id IS NULL)  
    OR (purpose='cancel' AND parent_instance_id IS NOT NULL)  
    )
    

---

### 4.8 approval_tasks（承認タスク）

#### 仕様の概要

- 各ステップの承認者に割り当てられる実行タスク
    
- **submit時に assignee を確定保存**し、以後固定
    

#### エンティティ定義

|項目|型|必須|例|備考|
|---|---|--:|---|---|
|id|uuid|◯|AT-...|PK|
|tenant_id|uuid|◯|TEN-...|RLS|
|approval_instance_id|uuid|◯|AI-...|FK approval_instances|
|step_no|int|◯|1||
|assignee_employee_id|uuid|◯|EMP-...|責任者|
|assignee_login_account_id|uuid|◯|ACC-...|actor|
|status|varchar(20)|◯|"pending"|pending/approved/rejected/skipped|
|assigned_at|timestamptz|◯|||
|actioned_at|timestamptz||||

#### 制約事項

- CHECK(status IN ('pending','approved','rejected','skipped'))
    

---

### 4.9 approval_actions（承認アクションログ）

#### 仕様の概要

- 承認操作（approve/reject/return/cancel_submit 等）の監査ログ
    

#### エンティティ定義

|項目|型|必須|例|備考|
|---|---|--:|---|---|
|id|uuid|◯|AA-...|PK|
|tenant_id|uuid|◯|TEN-...|RLS|
|approval_task_id|uuid|◯|AT-...|FK approval_tasks|
|action_type|varchar(30)|◯|"approve"|approve/reject/return/delegate/cancel_submit|
|comment|text|||理由|
|acted_at|timestamptz|◯|||
|acted_by_login_account_id|uuid|◯|ACC-...|actor|

#### 制約事項

- CHECK(action_type IN ('approve','reject','return','delegate','cancel_submit'))
    

---

### 4.10 approval_task_delegations（承認タスク委任ログ：都度委任）

#### 仕様の概要

- 承認者が受けたタスクを別承認者へ委任した履歴
    
- MVP運用はしないが方式として用意
    

#### エンティティ定義

|項目|型|必須|例|備考|
|---|---|--:|---|---|
|id|uuid|◯|ATD-...|PK|
|tenant_id|uuid|◯|TEN-...|RLS|
|approval_task_id|uuid|◯|AT-...|対象タスク|
|from_login_account_id|uuid|◯|ACC-...|委任元|
|to_login_account_id|uuid|◯|ACC-...|委任先|
|reason|text||"多忙"|任意|
|delegated_at|timestamptz|◯|||

---

## 5. ロジック仕様（固定WF）

### 5.1 submit（申請）

**入力**：document_type_id / document_id / amount / applicant_department_stable_id / organization_version_id / actor

**処理**：

1. 伝票の状態を Draft → Submitted に遷移（submitted_at, submitted_by を記録）
    
2. document_types で承認対象判定
    
3. `approval_routes(purpose=approve, target_document_type_id)` の候補抽出
    
4. `approval_route_conditions` を amount で評価し、適用ルートを1つ選択
    
    - 優先：priority（小さいほど優先）
        
5. `approval_instances(purpose=approve)` を生成（selected_route_id固定）
    
6. ルートの `approval_route_steps` を step_no順に走査し、各Stepで承認者を解決
    
    - Stepの対象部門を selector で決定（self/ancestor/fixed）
        
    - Seatを参照：target_department_stable_id + slot_level_no
        
    - **Seat未設定なら申請失敗（エラー）**（インスタンス/タスクは生成しない）
        
    - Seat承認者を解決（固定社員 or ロール）
        
    - **Seat代理が有効なら代理を適用**
        
7. 各Stepの承認者で `approval_tasks` を生成（assignee確定）
    
8. 最初のStepタスクを pending とし、以降のタスクはアプリ側で進行制御
    

---

### 5.2 approve（承認）

1. 対象taskを pending → approved
    
2. 次stepがあれば次taskを pending（なければ instance を approved にして終了）
    
3. approval_actions を記録（actor, comment）
    

---

### 5.3 reject（却下）

1. 対象taskを pending → rejected
    
2. instance を rejected にして終了
    
3. approval_actions を記録
    

---

### 5.4 return（差戻し）

1. 対象taskで action_type=return を記録
    
2. 伝票状態を Draft に戻す
    
3. instance を canceled として終了（以後利用しない）
    
4. 再submit時に新規instanceを生成（再計算）
    

---

### 5.5 cancel（決裁取り消し）

**前提**：伝票が Approved の場合のみ、取消申請が可能

**処理**：

1. 取消申請時に approval_instances(purpose=cancel) を新規生成（parent_instance_id=元approve instance）
    
2. ルートは原則、承認（approve）と同じロジックで選定（purpose=cancel）
    
    - MVP：cancelルートをapproveルートと同一にする運用
        
3. Seat解決・Seat代理適用・タスク生成は approve と同じ
    
4. cancel purpose のインスタンスが approved になったら、伝票状態を Canceled（終端）
    

---

## 6. 制約事項

### 6.1 固定WF制約

- submit時に selected_route_id と assignee を確定し、以後変更しない
    

### 6.2 Seat未設定は申請不可

- 対象Seatが未設定／無効／期限外の場合は **申請不可**
    

### 6.3 同一人物連続承認

- スキップせず、段として複数回承認させる
    

### 6.4 代理適用

- Seat代理が有効なら代理人に置換してタスクを確定する
    

---

## 7. エラー仕様（最低限）

### 7.1 Seat未設定エラー

- コード例：WF_SEAT_NOT_CONFIGURED
    
- 付帯情報：
    
    - target_department_stable_id
        
    - slot_level_no
        
    - step_no
        
    - route_id
        

### 7.2 ルート不一致

- コード例：WF_ROUTE_NOT_FOUND
    
- 付帯情報：document_type_id, purpose, amount
    

---

## 8. UI/運用（MVPガイド）

- 管理者は以下を設定できること
    
    - document_types（承認対象、取消可否、既定ルート）
        
    - approval_routes / conditions / steps
        
    - department_approver_slots（Seat）
        
    - department_approver_delegations（Seat代理：期間指定）
        
- エンドユーザーは
    
    - Draft保存
        
    - submit（申請）
        
    - 承認（approve/reject/return）
        
    - 取消申請（Approved伝票のみ）
        

---

## 9. 実装メモ（非機能）

- すべての監査actorは login_account_id を正本とする
    
- マルチテナント：tenant_id + RLS
    
- submitは原子性（Seat未設定なら何も生成しない）