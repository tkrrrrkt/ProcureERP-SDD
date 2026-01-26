# Requirements Document

## Introduction

本ドキュメントは、ProcureERP における伝票種類マスタ（DocumentType）および採番（Numbering Rule / Counter）機能の要件を定義する。

購買管理業務で使用する伝票（購買依頼/見積依頼/発注/入荷/仕入計上）の種類定義と、テナント別の採番ルール管理を提供し、伝票番号の一意性・可読性・運用柔軟性を実現する。

### 参照仕様書
- `.kiro/specs/spec_doc/61_機能設計検討/01_仕様検討/08_伝票種類・採番.md`
- `.kiro/specs/spec_doc/61_機能設計検討/02_エンティティ定義/08_伝票種類・採番.md`

---

## Requirements

### Requirement 1: 伝票種類マスタ（DocumentType）

**Objective:** As a システム管理者, I want 伝票種類を参照できる, so that 各伝票の種別やワークフロー対象可否を把握できる

#### Acceptance Criteria

1. The DocumentType API shall 以下の固定5種類の伝票種類をシードデータとして提供する：PR（購買依頼）、RFQ（見積依頼）、PO（発注）、GR（入荷）、IR（仕入計上）
2. The DocumentType API shall 各伝票種類に対して document_type_key（固定コード）、name（表示名）、description（説明）、wf_enabled（ワークフロー対象フラグ）を保持する
3. The DocumentType API shall 伝票種類をグローバル参照（tenant_id なし）として全テナントで共通利用可能とする
4. The DocumentType API shall 以下のワークフロー対象設定を固定で提供する：PR=true、RFQ=false、PO=true、GR=false、IR=true
5. The DocumentType API shall 伝票種類の追加・削除・変更をシステム管理者に許可しない（固定マスタ）
6. When 伝票種類一覧を取得するリクエストを受けた場合, the DocumentType API shall 有効な全伝票種類を返却する

---

### Requirement 2: 採番ルール管理（NumberingRule）

**Objective:** As a テナント管理者, I want 伝票種類ごとの採番ルールを設定できる, so that 自社の運用に合った伝票番号体系を構築できる

#### Acceptance Criteria

1. The NumberingRule API shall テナントごとに伝票種類単位で採番ルールを管理する
2. The NumberingRule API shall 以下の設定項目を提供する：prefix（先頭1桁英大文字）、include_department_symbol（部門記号含有）、period_kind（期間種別：NONE/YY/YYMM）、sequence_scope_kind（系列分割：COMPANY/DEPARTMENT）
3. When テナント初期セットアップ時, the NumberingRule API shall 推奨初期値で各伝票種類の採番ルールを自動作成する
4. When prefix を変更した場合, the NumberingRule API shall 以後の発番にのみ影響し、既存の伝票番号は変更しない
5. If prefix が英大文字1文字以外の場合, the NumberingRule API shall バリデーションエラーを返却する
6. The NumberingRule API shall 同一テナント・同一伝票種類の採番ルールは1件のみ許可する（UNIQUE制約）
7. The NumberingRule API shall 楽観ロック（version）により同時更新競合を検出する

---

### Requirement 3: 採番カウンタ管理（NumberCounter）

**Objective:** As a システム, I want 伝票番号の連番を系列単位で管理できる, so that 伝票番号の一意性を保証できる

#### Acceptance Criteria

1. The NumberCounter Service shall 採番カウンタを tenant × document_type_key × sequence_scope_kind × scope_id の組み合わせで一意に管理する
2. When 初回採番時にカウンタが存在しない場合, the NumberCounter Service shall カウンタを遅延作成（INSERT→ON CONFLICT）する
3. When sequence_scope_kind が COMPANY の場合, the NumberCounter Service shall scope_id に固定UUID（00000000-0000-0000-0000-000000000000）を使用する
4. When sequence_scope_kind が DEPARTMENT の場合, the NumberCounter Service shall scope_id に department_stable_id を使用する
5. The NumberCounter Service shall 同一系列の採番リクエストを同一行更新により排他制御する
6. The NumberCounter Service shall 欠番を許容する（トランザクションロールバック時等）
7. The NumberCounter Service shall next_seq_no を 1 以上の値として保持する

---

### Requirement 4: 伝票番号生成（DocumentNo Generation）

**Objective:** As a 業務ユーザー, I want 可読性のある伝票番号を自動取得できる, so that 伝票の識別・検索・外部連携が容易になる

#### Acceptance Criteria

1. When 伝票番号を発番する場合, the DocumentNo Service shall 以下の順序で番号を生成する：prefix + department_symbol（任意）+ period（任意）+ SEQ（8桁ゼロ埋め）
2. When include_department_symbol が true の場合, the DocumentNo Service shall 部門記号（departments.department_symbol）を番号に含める
3. When period_kind が YY の場合, the DocumentNo Service shall document_date から西暦下2桁（例：26）を番号に含める
4. When period_kind が YYMM の場合, the DocumentNo Service shall document_date から西暦下2桁＋月2桁（例：2601）を番号に含める
5. When period_kind が NONE の場合, the DocumentNo Service shall 期間文字列を番号に含めない
6. The DocumentNo Service shall 番号の各要素を区切り文字なしで結合する
7. The DocumentNo Service shall 発番された伝票番号を凍結し、以後の変更を禁止する

---

### Requirement 5: 採番ルール設定UI

**Objective:** As a テナント管理者, I want 採番ルールを画面から設定できる, so that 専門知識なしに運用設定を変更できる

#### Acceptance Criteria

1. The UI shall 伝票種類ごとの採番ルール一覧を表示する
2. When 採番ルールを選択した場合, the UI shall 現在の設定値（prefix、include_department_symbol、period_kind、sequence_scope_kind）を編集ダイアログで表示する
3. The UI shall prefix 入力欄を英大文字1文字に制限する
4. The UI shall period_kind を「なし」「年（YY）」「年月（YYMM）」から選択可能とする
5. The UI shall sequence_scope_kind を「全社連番」「部門別連番」から選択可能とする
6. When 保存ボタンを押下した場合, the UI shall 変更内容を保存し、成功メッセージを表示する
7. If 楽観ロック競合が発生した場合, the UI shall 「他のユーザーによって更新されています」のエラーメッセージを表示する
8. The UI shall 伝票番号のプレビュー（例：P260100000001）を表示する

---

### Requirement 6: 権限・アクセス制御

**Objective:** As a システム管理者, I want 採番ルールの変更権限を制御できる, so that 意図しない設定変更を防止できる

#### Acceptance Criteria

1. The API shall 採番ルール参照に `procure.numbering-rule.read` 権限を要求する
2. The API shall 採番ルール更新に `procure.numbering-rule.update` 権限を要求する
3. When 権限を持たないユーザーがアクセスした場合, the API shall 403 Forbidden を返却する
4. The UI shall ユーザーの権限に応じて編集ボタンの表示/非表示を制御する

---

### Requirement 7: 監査・トレーサビリティ

**Objective:** As a 監査担当者, I want 採番ルールの変更履歴を追跡できる, so that 設定変更の説明責任を果たせる

#### Acceptance Criteria

1. The API shall 採番ルールの作成・更新時に created_at / created_by / updated_at / updated_by を記録する
2. The API shall 採番ルール変更時に監査ログ（誰が・いつ・何を・どの値からどの値に変更したか）を記録する
3. The API shall 論理削除（is_active=false）を採用し、物理削除を禁止する

---

### Requirement 8: テナント初期セットアップ

**Objective:** As a システム, I want テナント作成時に推奨採番ルールを自動設定できる, so that テナント管理者の初期設定負担を軽減できる

#### Acceptance Criteria

1. When 新規テナントが作成された場合, the Tenant Setup Service shall 以下の推奨値で採番ルールを自動作成する：
   - PR: prefix='R', include_dept=false, period_kind=YYMM, scope=COMPANY
   - RFQ: prefix='Q', include_dept=false, period_kind=YYMM, scope=COMPANY
   - PO: prefix='P', include_dept=true, period_kind=YYMM, scope=DEPARTMENT
   - GR: prefix='G', include_dept=false, period_kind=YYMM, scope=COMPANY
   - IR: prefix='I', include_dept=true, period_kind=YYMM, scope=DEPARTMENT
2. The Tenant Setup Service shall 自動作成された採番ルールをテナント管理者が変更可能とする

---

## Non-Functional Requirements

### NFR-1: パフォーマンス
- 採番処理は同時リクエストに対して100ms以内に応答する
- カウンタ更新の排他制御によるデッドロックを防止する

### NFR-2: データ整合性
- 同一系列での伝票番号重複を物理的に防止する
- トランザクション分離レベルを適切に設定し、ファントムリードを防止する

### NFR-3: 運用性
- 採番ルール変更は即座に反映され、サービス再起動を必要としない
- カウンタ値の手動修正機能は提供しない（データ整合性保護）
