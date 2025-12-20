# Design Document

---

**Purpose**: Provide sufficient detail to ensure implementation consistency across different implementers, preventing interpretation drift.

## Overview

本機能は、EPM SaaSにおけるプロジェクトマスタ（Project Master）の登録・管理機能を提供する。UI（apps/web）からBFF（apps/bff）を経由してDomain API（apps/api）にアクセスし、PostgreSQL + RLSによるマルチテナント環境下で安全にプロジェクト情報を管理する。

プロジェクトマスタは一覧検索（ページング/ソート/検索）、詳細表示、作成、更新、無効化/再有効化の基本CRUD操作を提供する。Contracts-first原則に従い、BFFでページング/ソートを正規化し、エラーハンドリングはPass-through方式を採用する。承認機能はMVP外とする。

---

## Architecture

### Architecture Pattern & Boundary Map

**Pattern (fixed)**:
- UI（apps/web） → BFF（apps/bff） → Domain API（apps/api） → DB（PostgreSQL + RLS）
- UI直APIは禁止

**Contracts (SSoT)**:
- UI ↔ BFF: `packages/contracts/src/bff`
- BFF ↔ Domain API: `packages/contracts/src/api`
- Enum/Error: 原則 `packages/contracts/src/shared/**`
- UI は `packages/contracts/src/api` を参照してはならない

---

## Architecture Responsibilities（Mandatory）

### BFF Specification（apps/bff）

**Purpose**
- UI要件に最適化したAPI（Read Model / ViewModel）
- Domain APIのレスポンスを集約・変換（ビジネスルールの正本は持たない）

**BFF Endpoints（UIが叩く）**

| Method | Endpoint | Purpose | Request DTO (contracts/bff) | Response DTO (contracts/bff) | Notes |
| ------ | -------- | ------- | --------------------------- | ---------------------------- | ----- |
| GET | `/api/bff/master-data/project-master` | 一覧検索 | `ListProjectMasterRequest` | `ListProjectMasterResponse` | ページング/ソート/検索対応 |
| GET | `/api/bff/master-data/project-master/:id` | 詳細取得 | - | `ProjectMasterDetailResponse` | パスパラメータ: id |
| POST | `/api/bff/master-data/project-master` | 作成 | `CreateProjectMasterRequest` | `ProjectMasterDetailResponse` | - |
| PATCH | `/api/bff/master-data/project-master/:id` | 更新 | `UpdateProjectMasterRequest` | `ProjectMasterDetailResponse` | パスパラメータ: id |
| POST | `/api/bff/master-data/project-master/:id/deactivate` | 無効化 | - | `ProjectMasterDetailResponse` | パスパラメータ: id |
| POST | `/api/bff/master-data/project-master/:id/reactivate` | 再有効化 | - | `ProjectMasterDetailResponse` | パスパラメータ: id |

**Naming Convention（必須）**
- DTO / Contracts: camelCase（例: `projectCode`, `projectName`, `departmentCode`）
- DB columns: snake_case（例: `project_code`, `project_name`, `department_code`）
- `sortBy` は **DTO側キー**を採用する（例: `projectCode | projectName | plannedPeriodFrom | budgetAmount`）。
- DB列名（snake_case）を UI/BFF へ露出させない。

**Paging / Sorting Normalization（必須・BFF責務）**

- UI/BFF: page / pageSize（page-based）
- Domain API: offset / limit（DB-friendly）
- BFFは必ず以下を実施する（省略禁止）：
  - defaults: page=1, pageSize=50, sortBy=projectCode, sortOrder=asc（Requirement 10、Requirement 1に基づく）
  - clamp: pageSize <= 200（Requirement 10に基づく）
  - whitelist: sortBy は許可リストのみ（`projectCode`, `projectName`, `projectShortName`, `plannedPeriodFrom`, `budgetAmount` 等、設計で明記）
  - normalize: keyword trim、空→undefined
  - transform: offset=(page-1)*pageSize, limit=pageSize
- Domain APIに渡すのは offset/limit（page/pageSizeは渡さない）
- BFFレスポンスには page/pageSize を含める（UIへ返すのはBFF側の値）

**Transformation Rules（api DTO → bff DTO）**
- 方針：BFFとAPI DTOは共にcamelCaseで統一されているため、基本的にフィールド名は一致し、追加の変換は最小限
- BFFレスポンスに page/pageSize/totalCount を含める（UIに返すのはBFF値）
- Domain APIのエンティティID（例: `id`）はそのまま返却
- API DTOはwire-format（ISO 8601 string、decimal string）のため、BFFでの型変換は不要。文字列のままDomain APIへ伝達し、UIへ返却する

**Error Handling（contracts errorに準拠）**

**Error Policy（必須・未記載禁止）**
- この Feature における BFF の Error Policy は以下とする：
  - 採用方針：**Option A: Pass-through**
  - 採用理由：
    - Requirement 11（エラーハンドリングPass-through）に基づく
    - Domain APIのエラー判断を正本として維持する必要がある
    - UI表示に特別な整形が不要なため、Pass-throughで十分

**Option A: Pass-through（基本・推奨）**
- Domain APIのエラーを原則そのまま返す（status / code / message / details）
- BFF側での意味的な再分類・書き換えは禁止（ログ付与等の非機能は除く）
- UIは `contracts/bff/errors` に基づいて表示制御を行う

**In all cases**
- 最終拒否権限（403/404/409/422等）は Domain API が持つ

**Authentication / Tenant Context（tenant_id/user_id伝搬）**
- BFFは認証情報（Clerk等）から `tenant_id` / `user_id` を解決する
- Domain API呼び出し時にHTTPヘッダーまたはコンテキスト経由で `tenant_id` / `user_id` を伝搬する
- BFFはDBへ直接接続しない（Domain API経由のみ）

---

### Service Specification（Domain / apps/api）

**Purpose**
- Domainがビジネスルールの正本（BFF/UIは禁止）
- 権限チェック、バリデーション、状態遷移の最終判断を行う

**Service Methods**

| Method | Purpose | Input | Output | Transaction Boundary | Audit Points |
| ------ | ------- | ----- | ------ | -------------------- | ----------- |
| `list(tenantId, params)` | 一覧検索 | tenantId, offset, limit, sortBy, sortOrder, filters | `ListProjectMasterResponse` (api) | Read-only | - |
| `findById(tenantId, id)` | 詳細取得 | tenantId, id | `ProjectMasterDetailResponse` (api) | Read-only | - |
| `create(tenantId, userId, dto)` | 作成 | tenantId, userId, `CreateProjectMasterRequest` (api) | `ProjectMasterDetailResponse` (api) | Single transaction | create audit log |
| `update(tenantId, userId, id, dto)` | 更新 | tenantId, userId, id, `UpdateProjectMasterRequest` (api) | `ProjectMasterDetailResponse` (api) | Single transaction | update audit log |
| `deactivate(tenantId, userId, id)` | 無効化 | tenantId, userId, id | `ProjectMasterDetailResponse` (api) | Single transaction | deactivate audit log |
| `reactivate(tenantId, userId, id)` | 再有効化 | tenantId, userId, id | `ProjectMasterDetailResponse` (api) | Single transaction | reactivate audit log |

**Business Rules（正本）**

1. **projectCode変更不可（Requirement 4参照）**
   - 作成後のprojectCode変更は禁止
   - 更新リクエストにprojectCodeが含まれている場合は422エラーを返却

2. **projectCode一意性**
   - 同一テナント内でprojectCodeは一意
   - 作成時・更新時に重複チェックを実施（409エラー）

3. **日付範囲バリデーション（Requirement 3、Requirement 4参照）**
   - プロジェクト予定期間From <= プロジェクト予定期間To（422エラー）
   - プロジェクト実績Fromが指定されている場合、プロジェクト実績Toも必須
   - プロジェクト実績From <= プロジェクト実績To（422エラー）

4. **予算金額精度保証（Requirement 3、Requirement 4参照）**
   - プロジェクト予算金額はDECIMAL型で保存（精度保証）
   - DTOでもnumber型ではなく、適切な精度型を使用

5. **有効/無効状態管理**
   - 作成時はデフォルトで有効状態（isActive=true）
   - 無効化は論理削除（isActive=false）
   - 無効化済みのプロジェクトを再度無効化しようとした場合は409エラー
   - 有効状態のプロジェクトを再有効化しようとした場合は409エラー

6. **権限チェック**
   - 一覧/詳細: `epm.project-master.read` 権限必須
   - 作成: `epm.project-master.create` 権限必須
   - 更新/無効化/再有効化: `epm.project-master.update` 権限必須
   - 権限なしの場合は403エラー

7. **テナント境界**
   - すべての操作はtenant_idでスコープされる
   - 他テナントのデータへのアクセスは404エラー（存在しないものとして扱う）

8. **楽観ロック（Optimistic Lock）**
   - `version`（number）による楽観ロックを採用する
   - 詳細レスポンスに `version` を含める
   - 更新リクエストに `ifMatchVersion` を含める（必須）
   - `ifMatchVersion` が現行 `version` と一致しない場合は409エラー（`STALE_UPDATE`）を返す

**Transaction Boundary / Audit Points**
- 作成/更新/無効化/再有効化は単一トランザクション内で実行
- 各操作で監査ログを記録（tenant_id, user_id, 操作種別, 対象プロジェクトID, 変更前後の値（更新時）, 日時）

---

### Repository Specification（apps/api）

**Purpose**
- DBアクセスの唯一の入口
- tenant_idによる二重ガード（アプリケーション層 + RLS）

**Repository Methods**

| Method | Purpose | Input | Output | Tenant Guard |
| ------ | ------- | ----- | ------ | ------------ |
| `findMany(tenantId, params)` | 一覧検索 | tenantId, offset, limit, sortBy, sortOrder, filters | `Project[]` | where句 + RLS |
| `findById(tenantId, id)` | ID検索 | tenantId, id | `Project \| null` | where句 + RLS |
| `findByProjectCode(tenantId, projectCode)` | プロジェクトコード検索 | tenantId, projectCode | `Project \| null` | where句 + RLS |
| `create(tenantId, data)` | 作成 | tenantId, project data | `Project` | insert with tenant_id |
| `update(tenantId, id, data)` | 更新 | tenantId, id, update data | `Project` | where句 + RLS |
| `updateStatus(tenantId, id, isActive)` | 状態更新 | tenantId, id, isActive | `Project` | where句 + RLS |

**Tenant Guard Rules（必須）**
- すべてのメソッドでtenant_idを必須パラメータとして受け取る
- すべてのクエリでwhere句に `tenant_id = ?` を追加（二重ガード）
- RLS（Row Level Security）は常に有効（set_config前提）
- RLS無効化は禁止（例外なし）

**SortBy Mapping（DTOキー → DB列名）**
- Repository層でDTOキー（camelCase）をDB列名（snake_case）に安全にマッピングする
- whitelistされたsortByのみを許可: `projectCode` → `project_code`, `projectName` → `project_name`, `projectShortName` → `project_short_name`, `plannedPeriodFrom` → `planned_period_from`, `budgetAmount` → `budget_amount`
- 未許可のsortByが指定された場合は422エラーを返却（実装詳細はtasks.mdで定義）

**検索条件の一致仕様（MVP）**
- `projectCode`: 完全一致（=）
- `projectName` / `projectShortName` / `projectKanaName`: 部分一致（contains、DB的には ILIKE '%...%' を想定）
- normalize: trimのみ（全半角・カナ揺れ対応はMVP外）

**DB Schema（Prisma）**

```prisma
model Project {
  id                    String    @id @default(uuid())
  tenant_id             String    // RLS用、必須
  project_code          String    // プロジェクトコード、テナント内で一意
  project_name          String    // プロジェクト正式名
  project_short_name   String?   // プロジェクト略名、nullable
  project_kana_name    String?   // プロジェクトカナ名、nullable
  department_code      String?   // 部門コード、nullable、MVPではFK制約なし
  responsible_employee_code String? // 担当者コード、nullable、MVPではFK制約なし
  responsible_employee_name String? // 担当者名、nullable
  planned_period_from  DateTime  // プロジェクト予定期間From
  planned_period_to    DateTime  // プロジェクト予定期間To
  actual_period_from   DateTime? // プロジェクト実績From、nullable
  actual_period_to     DateTime? // プロジェクト実績To、nullable
  budget_amount        Decimal   @db.Decimal(19, 2) // プロジェクト予算金額、DECIMAL型（精度保証）
  version              Int       @default(0) // 楽観ロック用バージョン
  is_active            Boolean   @default(true) // 有効/無効フラグ
  created_at           DateTime  @default(now())
  updated_at           DateTime  @updatedAt
  created_by           String    // user_id（Clerk ID）
  updated_by           String    // user_id（Clerk ID）

  @@unique([tenant_id, project_code]) // テナント内でproject_codeは一意
  @@index([tenant_id, is_active]) // 一覧検索用インデックス
  @@index([tenant_id, project_code]) // プロジェクトコード検索用インデックス
  @@index([tenant_id, planned_period_from]) // 予定期間検索用インデックス
}
```

**RLS Policy（PostgreSQL）**
- RLSは常に有効
- すべてのクエリで `tenant_id = current_setting('app.tenant_id')` を強制

---

### Contracts Summary（This Feature）

**DTO定義場所**
- BFF DTO: `packages/contracts/src/bff/dto/project-master/`
- API DTO: `packages/contracts/src/api/dto/project-master/`
- Enum/Error: `packages/contracts/src/shared/`（原則）

**BFF DTO（UI ↔ BFF）**

- `ListProjectMasterRequest`
  - `page?: number` (default: 1)
  - `pageSize?: number` (default: 50, max: 200)
  - `sortBy?: 'projectCode' | 'projectName' | 'projectShortName' | 'plannedPeriodFrom' | 'budgetAmount'` (default: 'projectCode')
  - `sortOrder?: 'asc' | 'desc'` (default: 'asc')
  - `projectCode?: string` (検索条件)
  - `projectName?: string` (検索条件)
  - `projectShortName?: string` (検索条件)
  - `departmentCode?: string` (検索条件)
  - `responsibleEmployeeCode?: string` (検索条件)
  - `includeInactive?: boolean` (default: false)

- `ListProjectMasterResponse`
  - `items: ProjectMasterListItem[]`
  - `page: number`
  - `pageSize: number`
  - `totalCount: number`

- `ProjectMasterListItem`
  - `id: string`
  - `projectCode: string`
  - `projectName: string`
  - `projectShortName?: string | null`
  - `projectKanaName?: string | null`
  - `departmentCode?: string | null`
  - `responsibleEmployeeCode?: string | null`
  - `responsibleEmployeeName?: string | null`
  - `plannedPeriodFrom: string` (ISO 8601)
  - `plannedPeriodTo: string` (ISO 8601)
  - `budgetAmount: string` (DECIMAL型を文字列として表現、精度保証)
  - `isActive: boolean`

- `ProjectMasterDetailResponse`
  - `id: string`
  - `projectCode: string`
  - `projectName: string`
  - `projectShortName?: string | null`
  - `projectKanaName?: string | null`
  - `departmentCode?: string | null`
  - `responsibleEmployeeCode?: string | null`
  - `responsibleEmployeeName?: string | null`
  - `plannedPeriodFrom: string` (ISO 8601)
  - `plannedPeriodTo: string` (ISO 8601)
  - `actualPeriodFrom?: string | null` (ISO 8601)
  - `actualPeriodTo?: string | null` (ISO 8601)
  - `budgetAmount: string` (DECIMAL型を文字列として表現、精度保証)
  - `version: number` (楽観ロック用バージョン)
  - `isActive: boolean`
  - `createdAt: string` (ISO 8601)
  - `updatedAt: string` (ISO 8601)
  - `createdBy: string`
  - `updatedBy: string`

- `CreateProjectMasterRequest`
  - `projectCode: string` (必須)
  - `projectName: string` (必須)
  - `projectShortName?: string | null` (optional)
  - `projectKanaName?: string | null` (optional)
  - `departmentCode?: string | null` (optional)
  - `responsibleEmployeeCode?: string | null` (optional)
  - `responsibleEmployeeName?: string | null` (optional)
  - `plannedPeriodFrom: string` (必須、ISO 8601)
  - `plannedPeriodTo: string` (必須、ISO 8601)
  - `actualPeriodFrom?: string | null` (optional、ISO 8601)
  - `actualPeriodTo?: string | null` (optional、ISO 8601)
  - `budgetAmount: string` (必須、DECIMAL型を文字列として表現、精度保証)

- `UpdateProjectMasterRequest`
  - `ifMatchVersion: number` (必須、楽観ロック用バージョン)
  - `projectName?: string`
  - `projectShortName?: string | null`
  - `projectKanaName?: string | null`
  - `departmentCode?: string | null`
  - `responsibleEmployeeCode?: string | null`
  - `responsibleEmployeeName?: string | null`
  - `plannedPeriodFrom?: string` (ISO 8601)
  - `plannedPeriodTo?: string` (ISO 8601)
  - `actualPeriodFrom?: string | null` (ISO 8601)
  - `actualPeriodTo?: string | null` (ISO 8601)
  - `budgetAmount?: string` (DECIMAL型を文字列として表現、精度保証)
  - ※ `projectCode` は含めない（Requirement 4: 作成後に変更不可）

**API DTO（BFF ↔ Domain API）**

- `ListProjectMasterRequest` (api)
  - `offset: number`
  - `limit: number`
  - `sortBy: 'projectCode' | 'projectName' | 'projectShortName' | 'plannedPeriodFrom' | 'budgetAmount'` (DTOキー、camelCase)
  - `sortOrder: 'asc' | 'desc'`
  - `projectCode?: string`
  - `projectName?: string`
  - `projectShortName?: string`
  - `departmentCode?: string`
  - `responsibleEmployeeCode?: string`
  - `includeInactive?: boolean`

- `ListProjectMasterResponse` (api)
  - `items: ProjectMasterEntity[]`
  - `totalCount: number`

- `ProjectMasterEntity`
  - `id: string`
  - `tenantId: string`
  - `projectCode: string`
  - `projectName: string`
  - `projectShortName?: string | null`
  - `projectKanaName?: string | null`
  - `departmentCode?: string | null`
  - `responsibleEmployeeCode?: string | null`
  - `responsibleEmployeeName?: string | null`
  - `plannedPeriodFrom: string` (ISO 8601、wire-format)
  - `plannedPeriodTo: string` (ISO 8601、wire-format)
  - `actualPeriodFrom?: string | null` (ISO 8601、wire-format)
  - `actualPeriodTo?: string | null` (ISO 8601、wire-format)
  - `budgetAmount: string` (decimal string、wire-format、精度保証)
  - `version: number` (楽観ロック用バージョン)
  - `isActive: boolean`
  - `createdAt: string` (ISO 8601、wire-format)
  - `updatedAt: string` (ISO 8601、wire-format)
  - `createdBy: string`
  - `updatedBy: string`

- `CreateProjectMasterRequest` (api)
  - `projectCode: string`
  - `projectName: string`
  - `projectShortName?: string | null`
  - `projectKanaName?: string | null`
  - `departmentCode?: string | null`
  - `responsibleEmployeeCode?: string | null`
  - `responsibleEmployeeName?: string | null`
  - `plannedPeriodFrom: string` (ISO 8601、wire-format)
  - `plannedPeriodTo: string` (ISO 8601、wire-format)
  - `actualPeriodFrom?: string | null` (ISO 8601、wire-format)
  - `actualPeriodTo?: string | null` (ISO 8601、wire-format)
  - `budgetAmount: string` (decimal string、wire-format、精度保証)

- `UpdateProjectMasterRequest` (api)
  - `ifMatchVersion: number` (必須、楽観ロック用バージョン)
  - `projectName?: string`
  - `projectShortName?: string | null`
  - `projectKanaName?: string | null`
  - `departmentCode?: string | null`
  - `responsibleEmployeeCode?: string | null`
  - `responsibleEmployeeName?: string | null`
  - `plannedPeriodFrom?: string` (ISO 8601、wire-format)
  - `plannedPeriodTo?: string` (ISO 8601、wire-format)
  - `actualPeriodFrom?: string | null` (ISO 8601、wire-format)
  - `actualPeriodTo?: string | null` (ISO 8601、wire-format)
  - `budgetAmount?: string` (decimal string、wire-format、精度保証)
  - ※ `projectCode` は含めない（Requirement 4: 作成後に変更不可）

**Enum定義**

- `ProjectMasterSortBy` (shared)
  - `PROJECT_CODE = 'projectCode'`
  - `PROJECT_NAME = 'projectName'`
  - `PROJECT_SHORT_NAME = 'projectShortName'`
  - `PLANNED_PERIOD_FROM = 'plannedPeriodFrom'`
  - `BUDGET_AMOUNT = 'budgetAmount'`

**Error定義**

- `ProjectMasterError` (shared)
  - `PROJECT_NOT_FOUND` (404)
  - `PROJECT_CODE_DUPLICATE` (409)
  - `PROJECT_CODE_CANNOT_BE_CHANGED` (422)
  - `PROJECT_ALREADY_INACTIVE` (409)
  - `PROJECT_ALREADY_ACTIVE` (409)
  - `STALE_UPDATE` (409) - 楽観ロック競合（ifMatchVersionが現行versionと不一致）
  - `INVALID_DATE_RANGE` (422) - 予定期間From > To、または実績From > To
  - `ACTUAL_PERIOD_TO_REQUIRED` (422) - 実績Fromが指定されているが実績Toが未指定
  - `VALIDATION_ERROR` (422)

---

## Responsibility Clarification（Mandatory）

本Featureにおける責務境界を以下に明記する。
未記載の責務は実装してはならない。

### UIの責務
- 表示制御（enable/disable / 文言切替）
- フォーム入力制御・UX最適化
- ページング/ソートUIの提供（page/pageSize形式）
- 日付範囲入力のUI制御（予定期間From <= To、実績From <= To）
- ビジネス判断は禁止

### BFFの責務
- UI入力の正規化（page/pageSize → offset/limit、sortBy正規化）
- Domain API DTO ⇄ UI DTO の変換（基本的にcamelCase統一のため変換は最小限）
- ページング/ソートのデフォルト値設定（page=1, pageSize=50, sortBy=projectCode, sortOrder=asc）
- API DTOはwire-format（ISO 8601 string、decimal string）のため、型変換は不要。文字列のままDomain APIへ伝達し、UIへ返却する
- エラーのPass-through（意味的な変更禁止）
- ビジネスルールの正本は持たない

### Domain APIの責務
- ビジネスルールの正本（projectCode変更不可、一意性チェック、日付範囲バリデーション、状態遷移）
- 権限・状態遷移の最終判断（403/404/409/422等）
- 監査ログ・整合性保証
- テナント境界の強制（RLS + where句）
- 予算金額の精度保証（DECIMAL型での保存）
- wire-format（ISO 8601 string、decimal string）からDomain内部型（Date、Decimal）へのparse

### Repositoryの責務
- DBアクセスの唯一の入口
- tenant_idによる二重ガード（where句 + RLS）
- DTOキー（camelCase）→ DB列名（snake_case）のマッピング（sortBy等）
- トランザクション管理（Service層で制御）
- DECIMAL型の適切な保存（精度保証）

---

## 設計上の重要な決定事項

### projectCode変更不可（Requirement 4参照）
- 更新リクエストにprojectCodeが含まれている場合は422エラーを返却
- UpdateProjectMasterRequest（BFF/API両方）にprojectCodeフィールドを含めない

### ページング仕様（Requirement 10参照）
- UI/BFF: page/pageSize（default: page=1, pageSize=50, max=200）
- Domain API: offset/limit
- BFFで変換: offset=(page-1)*pageSize, limit=pageSize

### デフォルトソート（Requirement 1、Requirement 10参照）
- default sort = projectCode asc
- BFFでデフォルト値を設定

### 日付範囲バリデーション（Requirement 3、Requirement 4参照）
- プロジェクト予定期間From <= プロジェクト予定期間To（必須チェック）
- プロジェクト実績Fromが指定されている場合、プロジェクト実績Toも必須
- プロジェクト実績From <= プロジェクト実績To（必須チェック）
- Domain APIでバリデーションを実施（422エラー）

### 予算金額精度保証（Requirement 3、Requirement 4、D-07参照）
- DB: DECIMAL(19, 2)型を使用
- DTO: 文字列として表現（JSONでの精度保証）
- Domain API: Decimal型（任意精度）を使用
- JavaScriptのnumber型は使用しない

### departmentCode / responsibleEmployeeCode（MVP決定）
- nullable、MVPではFK制約なし
- 将来の拡張を見据えた設計

### Error Policy: Pass-through（Requirement 11参照）
- BFFはDomain APIのエラーをそのまま返す
- 意味的な再分類・書き換えは禁止

### 楽観ロック（Optimistic Lock）
- `version`（number）による楽観ロックを採用する
- 詳細レスポンスに `version` を含める
- 更新リクエストに `ifMatchVersion` を含める（必須）
- `ifMatchVersion` が現行 `version` と一致しない場合は409エラー（`STALE_UPDATE`）を返す

