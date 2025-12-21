# Tech Steering
ProcurERP – 購買管理SaaS

---

## 1. 本ファイルの位置づけ

本 tech.md は、ProcurERPにおける技術的な最高位ルール（技術憲法）である。

- すべての設計・実装・AI生成コードは本ファイルに従う  
- Feature仕様（requirements / design / tasks）は本定義の下位に位置づけられる  
- 技術方針に変更が生じる場合、コードより先に本ファイルを更新する  

---

## 2. 全体アーキテクチャ方針

### 基本思想

- マルチテナントSaaSとして安全性・監査性・拡張性を最優先する
- 調達データを扱うシステムとして正本性（Single Source of Truth）を最重要視する
- AI活用を前提とした構造化データ設計を行う
- CCSDD（Specification Driven Development）による一貫性ある進化を行う  

---

## 3. 技術スタック（確定）

### フロントエンド
- Next.js（App Router）
- React
- TypeScript
- Tailwind CSS
- v0（UI生成補助。SSoTではない）

### バックエンド
- Node.js
- NestJS（モジュラーモノリス）
- TypeScript

補足（誤解防止）：
- apps/api は NestJS によるモジュラーモノリス構成とする
- apps/bff は apps/api とは別アプリケーション（別デプロイ単位）として構成する
- 両者は同一 `packages/contracts` を参照するが、責務と契約は明確に分離する

### 認証基盤

- 認証（Authentication）は外部IdPに委譲する
- ProcurERPでは Clerk を認証基盤として採用する
- ユーザーの識別子（user_id）は Clerk のIDを正とする
- 認証状態はアプリケーションの業務ロジックから分離する
- 認可（Authorization）は本システムの責務とし、Clerkに依存しない  

### データベース
- PostgreSQL
- Prisma ORM
- DECIMAL型を前提とした設計

### インフラ（論理）
- コンテナベース実行環境
- 環境分離（local / dev / staging / prod）
- CI/CDによる自動検証

## 3.1 Contracts-first（SSoT）原則（Non-Negotiable）

ProcurERPでは、API・UI・集計処理に先立ち、契約（Contracts）をSSoTとする。

- データ構造・DTO・Enum・Error定義は契約を正とする  
- 変更順序は以下を厳守する  
  1. Contracts  
  2. Backend API  
  3. Frontend UI  
- 契約に定義されていないフィールドの暗黙利用は禁止  
- any / 暗黙的な型推論による契約表現は禁止  

契約は仕様駆動開発（SDD）における境界であり、  
すべての Feature design / implementation は契約に従う。

---

## 4. マルチテナント設計（Non-Negotiable）

### 基本方針
- 1DBマルチテナント方式を採用する  
- 原則として全テーブルに tenant_id を持たせる  
- Row Level Security（RLS）を必須とする  

### アクセス原則
- アプリケーションは Repository 経由のみでDBにアクセスする  
- Repositoryは必ず tenant_id を受け取る  
- RLSは常に有効とする  
- RLS無効化は禁止（例外なし）  

### Repository原則の例外

- 原則として、すべてのDBアクセスは Repository 経由とする  
- ただし、性能要件上必要な以下の処理のみ例外を許可する  
  - 大量データの一括取込・更新（バルク処理）  
  - 集計・分析・再計算を目的とした参照処理  
- 例外処理は専用Adapter（Infrastructure層）に閉じ込める  
- Adapterは型付き入出力を持ち、tenant_id 等のスコープを明示的に受け取る  
- Repository例外の採用理由・範囲は design.md に明示し、ADRに記録する  

### 例外ルール

- 原則として全テーブルに tenant_id を持たせる  
- ただし、全テナント共通の参照専用マスタ（例：通貨コード等）のみ例外を許可する  
- 例外テーブルの追加・変更は ADR（Architecture Decision Record）に必ず記録する  

---

## 5. 経営数値データの取り扱い原則

### 数値型ポリシー（絶対遵守）

- 金額・数量・率など 精度が重要な数値 は JavaScript の number で計算しない  
- DBは 精度保証ができる型（DECIMAL/NUMERIC、必要に応じてINTEGER） を用いる  
- アプリケーションでは 任意精度の Decimal 型 を用い、DTO/契約でも number を安易に使わない  

---

## 6. 購買管理ドメイン特有の設計原則

- DB上の状態表現（enum / boolean 等）は、将来の状態追加有無・移行容易性・データ整合性への影響を評価した上で、各Featureのdesignにて選定する。contracts側では、DB表現と独立した明示的な状態Enumを定義すること。

### 伝票ステータス管理

購買プロセスの伝票（PR/RFQ/PO/GR/仕入計上等）は、以下の原則に従う。

- 伝票ステータスは明示的なEnum（例: DRAFT / SUBMITTED / APPROVED / REJECTED / CLOSED）で管理する
- ステータス遷移は Feature の design.md で定義し、許可された遷移のみを実装する
- ステータス変更は必ず監査ログを残す

### 伝票番号・採番設計

- 伝票番号は業務識別子として扱い、主キー（UUID）とは分離する
- 採番ルール（プレフィックス・年月・連番等）は伝票種類ごとに設定可能とする
- 採番ロジックはDomain Serviceに実装し、テナント単位で一意性を保証する

### 承認フロー設計

- 承認フローは PR / PO など伝票単位で適用する
- 承認ルートは条件（金額閾値・カテゴリ等）に基づいて動的に決定可能とする
- 承認・差戻し・却下は必ず監査ログを残す
- 将来的な稟議オブジェクト（複数伝票を束ねる）への拡張を考慮した設計とする  

---

## 7. 権限・認可設計

### 7.1 権限モデル

- RBAC（Role Based Access Control）を基本とする  
- ユーザーは必ず1つ以上のロールに属する  
- ロールは権限（Permission）の集合として定義する  

---

### 7.2 権限定義ルール

権限は以下の形式で定義する。

    procure.<domain>.<action>

- 権限の命名規則・構文は tech.md にて統一的に定義し、UI / API 一貫制御の原則のみを扱う
- **権限の粒度（create / update / manage 等）は Feature requirements にて確定する**
- tech.md では業務判断を伴う粒度設計は行わず、命名規則のみを責務とする

#### domain の例
- purchase-request（購買依頼）
- quotation（見積）
- purchase-order（発注）
- goods-receipt（入荷）
- purchase-booking（仕入計上）
- supplier（仕入先）
- item（品目）
- approval-route（承認ルート）
- organization（組織）
- user（ユーザー）
- role（ロール）

#### action の例
- read
- create
- update
- delete
- submit（申請）
- approve（承認）
- reject（却下）
- cancel（取消）

---

### 7.3 権限定義例

    procure.purchase-request.read
    procure.purchase-request.create
    procure.purchase-request.submit
    procure.purchase-request.approve
    procure.purchase-order.read
    procure.purchase-order.create
    procure.purchase-order.approve
    procure.purchase-order.cancel
    procure.goods-receipt.read
    procure.goods-receipt.create
    procure.supplier.read
    procure.supplier.create
    procure.supplier.update
    procure.item.read
    procure.item.create
    procure.item.update
    procure.approval-route.read
    procure.approval-route.update
    procure.organization.read
    procure.organization.update
    procure.user.read
    procure.user.update
    procure.role.assign

---

### 7.4 UI制御とAPI制御の原則

- UI制御とAPI制御は必ず一致させる  
- UIで操作できない機能はAPIでも実行できてはならない  
- APIで拒否される操作はUIでも必ず無効化されていること  
- UI都合で権限を緩めることは禁止  

---

### 7.5 権限とデータ状態の関係

- 権限を持っていても操作できない状態が存在する
- 伝票がCLOSED / CANCELLEDの場合は更新不可
- 承認済み伝票の取消は特権ロールのみ許可  

---

## 7.6 Observability（運用・監査の可視性）

ProcurERPでは、すべての重要処理を追跡可能とする。

- すべてのリクエストに request_id / trace_id を付与する
- ログには最低限以下を含める
  - tenant_id
  - user_id
  - 実行権限（permission）
  - 対象リソース
  - 結果（success / failure）
- 伝票の作成・承認・却下・取消 / マスタの重要変更 / 権限変更は必ず記録対象とする

Observabilityはデバッグ目的ではなく、
**調達プロセスの説明責任を果たすための基盤**として扱う。

---

## 8. 監査・トレーサビリティ

以下を必ず保持する。

- 誰が  
- いつ  
- 何を  
- どの値からどの値に変更したか  

- auditログの user_id は認証プロバイダID（Clerk 等）を正本とし、認証情報を持たない内部処理では service principal（例: system / service:<job>）を user_id として記録してよい  
- service principal は system または service:<job-name> の形式で記録する

対象：
- 伝票（購買依頼・見積・発注・入荷・仕入計上）
- 承認・差戻し・却下
- マスタ（取引先・仕入先・品目・承認ルート等）の重要変更
- 権限変更

---

## 8.1 データ取込・連携（Integration）原則

- 実績・計画データの取込は非同期処理を基本とする  
- 取込処理は冪等であり、再実行可能でなければならない  
- 取込結果は成功・失敗を明示し、監査ログの対象とする  
- 正本データは常にDBとし、集計・分析系は派生データと位置づける  

外部システム連携は Feature 設計事項であるが、  
**冪等性・監査性は技術憲法として必須条件**とする。

---

## 9. AI活用を前提とした技術設計

- AIは正本データのみ参照可能  
- 出力は要約・提案・仮説に限定する  
- AIによる自動確定・自動更新は禁止  

### AI入力境界ルール

- AIに渡すデータは契約で定義された Read Model のみとする  
- AI出力は Draft / Proposal として扱い、正本データではない  
- AI提案の採用・反映は必ずユーザー操作として行い、監査ログを残す  

---

## 10. CCSDD / Cursor / v0 利用ルール

- .kiro/specs が仕様のSSoT  
- design.md 無しの実装は禁止  
- Cursor生成コードは必ずレビュー  
- v0はUI叩き台用途に限定  

UI状態管理（ReactにおけるServer State / Form State / UI State / URL State）の詳細方針は  
structure.md に定義し、本ファイル（tech.md）では扱わない。

---

## 11. 非ゴール

- マイクロサービス化を前提としない  
- 技術トレンド追従を目的としない  
- AIによる意思決定自動化を行わない  

---

## 12. 技術的成功の定義

- マルチテナント事故が起きない
- 金額・数量計算の誤差が発生しない
- 監査・説明責任を果たせる
- AI活用を安全に拡張できる  

---

## 13. BFF（UI専用API）運用ルール（Non-Negotiable）

ProcurERPでは、UIの変更頻度とDomainの安定性を分離し、AI実装時の逸脱を防ぐため、BFF（`apps/bff`）を採用する。

### 13.1 Contracts-first（BFFを含む変更順序）

契約（Contracts）をSSoTとし、変更順序は以下を厳守する。

1. `packages/contracts`（契約の追加・変更）
2. `apps/api`（Domain API）
3. `apps/bff`（BFF：画面向けI/Oの整形）
4. `apps/web`（UI）

契約に定義されていないフィールドや構造を、BFF/UI側で暗黙に扱うことは禁止する。

### 13.2 DTOの二系統（BFF用 / API用）

- UI ↔ BFF は `packages/contracts/src/bff` を正とする（画面最適化DTO）。
- BFF ↔ API は `packages/contracts/src/api` を正とする（Domain API DTO）。
- BFFは `api DTO` を受け取り、必要に応じて `bff DTO` へ変換してUIへ返却する。
- `sortBy` は DTO側キー（camelCase）を採用し、DB列名（snake_case）を UI/BFF に露出させない（例: `supplierCode` / `supplierName`）。

### 13.3 権限・認可（UI/BFF/APIの一貫性）

- 権限チェックは UI/BFF/API で一貫させる。
- UIで操作できない機能はBFF/APIでも実行できてはならない。
- **最終的な拒否（403等）の正本はDomain API（apps/api）** とする。
- BFFはUX向上のために早期ブロック（例：ボタン非表示に対応した拒否）を行ってよいが、APIの権限チェックを代替してはならない。

### 13.4 マルチテナント境界（BFFも必須）

- BFFは認証情報から `tenant_id` / `user_id` を解決し、Domain API 呼び出しに必ず伝搬する。
- Domain API はRLSを前提とし、tenant境界を破る実装は禁止する（既存ルールに従う）。
- BFFがDBへ直接接続することは禁止する（DBアクセスは `apps/api` の責務）。

### 13.5 v0利用ルール（実装ではなく叩き台）

- v0はUI叩き台用途に限定する。
- v0生成物はそのまま正本とせず、`design.md` と `contracts` に従って実装に取り込む。

### 13.8 Error Policy は Feature設計で必ず明記する（Non-Negotiable）

- 各 Feature の design.md では、BFFの Error Policy を必ず選択し、その理由を明記すること
  - Option A: Pass-through（原則・推奨）
  - Option B: Minimal shaping（例外）
- 未選択・未記載の Feature は「設計未完了」とみなし、実装を禁止する
- Option A の場合：Domain API エラーを意味的に再分類・書き換えることは禁止（ログ付与等の非機能は除く）
- Option B の場合：UI表示に必要な最小整形のみ許可し、整形結果は contracts/bff/errors に必ず定義する
- 最終拒否（403/404/409/422等）の正本は Domain API とする
- BFFが独自のビジネス判断を持つことは禁止する

---

## 14. 競合制御（楽観ロック・悲観ロック）

### 14.1 マスタ系：楽観ロック

- 取引先・仕入先・品目・支払条件・承認ルート等のマスタは、**楽観ロック**を基本とする
- 実装方針：
  - マスタテーブルに `version`（整数）カラムを設ける
  - 更新時には、取得時の `version` を WHERE 条件に含めて UPDATE し、更新件数が 0 の場合は競合とみなす
  - 競合時はユーザーに「他のユーザーによって更新されています」のメッセージを返し、再取得を促す

### 14.2 伝票系：悲観ロック

- 購買依頼・見積・発注・入荷・仕入などの伝票データは、編集競合を避けるため**悲観ロック**を採用する
- 方針イメージ：
  - 編集開始時に、「伝票単位の編集ロック」を取得する（DBレベルの `SELECT ... FOR UPDATE` または専用ロックテーブルを利用）
  - ロック取得済みの伝票は、同一ユーザー以外による編集操作を拒否する（閲覧は許可）
  - 一定時間操作がない場合や明示的なキャンセル／保存完了時にはロックを解放する
- 悲観ロックの具体実装は、`feature-xxx/design.md`（伝票系の設計）で詳細を詰める

---

技術は主役ではない。
調達業務を支える「信頼できる基盤」であることが価値である。
