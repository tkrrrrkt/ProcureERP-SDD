# Design Document

---

**Purpose**: Provide sufficient detail to ensure implementation consistency across different implementers, preventing interpretation drift.

## Overview

本機能は、EPM SaaSにおける社員マスタ（Employee Master）の登録・管理機能を提供する。UI（apps/web）からBFF（apps/bff）を経由してDomain API（apps/api）にアクセスし、PostgreSQL + RLSによるマルチテナント環境下で安全に社員情報を管理する。

社員マスタは一覧検索（ページング/ソート/検索）、詳細表示、作成、更新、無効化/再有効化の基本CRUD操作を提供する。Contracts-first原則に従い、BFFでページング/ソートを正規化し、エラーハンドリングはPass-through方式を採用する。承認機能はMVP外とする。

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
| GET | `/api/bff/master-data/employee-master` | 一覧検索 | `ListEmployeeMasterRequest` | `ListEmployeeMasterResponse` | ページング/ソート/検索対応 |
| GET | `/api/bff/master-data/employee-master/:id` | 詳細取得 | - | `EmployeeMasterDetailResponse` | パスパラメータ: id |
| POST | `/api/bff/master-data/employee-master` | 作成 | `CreateEmployeeMasterRequest` | `EmployeeMasterDetailResponse` | - |
| PATCH | `/api/bff/master-data/employee-master/:id` | 更新 | `UpdateEmployeeMasterRequest` | `EmployeeMasterDetailResponse` | パスパラメータ: id |
| POST | `/api/bff/master-data/employee-master/:id/deactivate` | 無効化 | - | `EmployeeMasterDetailResponse` | パスパラメータ: id |
| POST | `/api/bff/master-data/employee-master/:id/reactivate` | 再有効化 | - | `EmployeeMasterDetailResponse` | パスパラメータ: id |

**Naming Convention（必須）**
- DTO / Contracts: camelCase（例: `employeeCode`, `employeeName`, `organizationKey`）
- DB columns: snake_case（例: `employee_code`, `employee_name`, `organization_key`）
- `sortBy` は **DTO側キー**を採用する（例: `employeeCode | employeeName`）。
- DB列名（snake_case）を UI/BFF へ露出させない。

**Paging / Sorting Normalization（必須・BFF責務）**

- UI/BFF: page / pageSize（page-based）
- Domain API: offset / limit（DB-friendly）
- BFFは必ず以下を実施する（省略禁止）：
  - defaults: page=1, pageSize=50, sortBy=employeeCode, sortOrder=asc（Requirement 10、Requirement 1に基づく）
  - clamp: pageSize <= 200（Requirement 10に基づく）
  - whitelist: sortBy は許可リストのみ（`employeeCode`, `employeeName` 等、設計で明記）
  - normalize: keyword trim、空→undefined
  - transform: offset=(page-1)*pageSize, limit=pageSize
- Domain APIに渡すのは offset/limit（page/pageSizeは渡さない）
- BFFレスポンスには page/pageSize を含める（UIへ返すのはBFF側の値）

**Transformation Rules（api DTO → bff DTO）**
- 方針：BFFとAPI DTOは共にcamelCaseで統一されているため、基本的にフィールド名は一致し、追加の変換は最小限
- BFFレスポンスに page/pageSize/totalCount を含める（UIに返すのはBFF値）
- Domain APIのエンティティID（例: `id`）はそのまま返却

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
| `list(tenantId, params)` | 一覧検索 | tenantId, offset, limit, sortBy, sortOrder, filters | `ListEmployeeMasterResponse` (api) | Read-only | - |
| `findById(tenantId, id)` | 詳細取得 | tenantId, id | `EmployeeMasterDetailResponse` (api) | Read-only | - |
| `create(tenantId, userId, dto)` | 作成 | tenantId, userId, `CreateEmployeeMasterRequest` (api) | `EmployeeMasterDetailResponse` (api) | Single transaction | create audit log |
| `update(tenantId, userId, id, dto)` | 更新 | tenantId, userId, id, `UpdateEmployeeMasterRequest` (api) | `EmployeeMasterDetailResponse` (api) | Single transaction | update audit log |
| `deactivate(tenantId, userId, id)` | 無効化 | tenantId, userId, id | `EmployeeMasterDetailResponse` (api) | Single transaction | deactivate audit log |
| `reactivate(tenantId, userId, id)` | 再有効化 | tenantId, userId, id | `EmployeeMasterDetailResponse` (api) | Single transaction | reactivate audit log |

**Business Rules（正本）**

1. **employeeCode変更不可（Requirement 4参照）**
   - 作成後のemployeeCode変更は禁止
   - 更新リクエストにemployeeCodeが含まれている場合は422エラーを返却

2. **employeeCode一意性**
   - 同一テナント内でemployeeCodeは一意
   - 作成時・更新時に重複チェックを実施（409エラー）

3. **有効/無効状態管理**
   - 作成時はデフォルトで有効状態（isActive=true）
   - 無効化は論理削除（isActive=false）
   - 無効化済みの社員を再度無効化しようとした場合は409エラー
   - 有効状態の社員を再有効化しようとした場合は409エラー

4. **権限チェック**
   - 一覧/詳細: `epm.employee-master.read` 権限必須
   - 作成: `epm.employee-master.create` 権限必須
   - 更新/無効化/再有効化: `epm.employee-master.update` 権限必須
   - 権限なしの場合は403エラー

5. **テナント境界**
   - すべての操作はtenant_idでスコープされる
   - 他テナントのデータへのアクセスは404エラー（存在しないものとして扱う）

**Transaction Boundary / Audit Points**
- 作成/更新/無効化/再有効化は単一トランザクション内で実行
- 各操作で監査ログを記録（tenant_id, user_id, 操作種別, 対象社員ID, 変更前後の値（更新時）, 日時）

---

### Repository Specification（apps/api）

**Purpose**
- DBアクセスの唯一の入口
- tenant_idによる二重ガード（アプリケーション層 + RLS）

**Repository Methods**

| Method | Purpose | Input | Output | Tenant Guard |
| ------ | ------- | ----- | ------ | ------------ |
| `findMany(tenantId, params)` | 一覧検索 | tenantId, offset, limit, sortBy, sortOrder, filters | `Employee[]` | where句 + RLS |
| `findById(tenantId, id)` | ID検索 | tenantId, id | `Employee \| null` | where句 + RLS |
| `findByEmployeeCode(tenantId, employeeCode)` | 社員コード検索 | tenantId, employeeCode | `Employee \| null` | where句 + RLS |
| `create(tenantId, data)` | 作成 | tenantId, employee data | `Employee` | insert with tenant_id |
| `update(tenantId, id, data)` | 更新 | tenantId, id, update data | `Employee` | where句 + RLS |
| `updateStatus(tenantId, id, isActive)` | 状態更新 | tenantId, id, isActive | `Employee` | where句 + RLS |

**Tenant Guard Rules（必須）**
- すべてのメソッドでtenant_idを必須パラメータとして受け取る
- すべてのクエリでwhere句に `tenant_id = ?` を追加（二重ガード）
- RLS（Row Level Security）は常に有効（set_config前提）
- RLS無効化は禁止（例外なし）

**SortBy Mapping（DTOキー → DB列名）**
- Repository層でDTOキー（camelCase）をDB列名（snake_case）に安全にマッピングする
- whitelistされたsortByのみを許可: `employeeCode` → `employee_code`, `employeeName` → `employee_name`
- 未許可のsortByが指定された場合は422エラーを返却（実装詳細はtasks.mdで定義）

**DB Schema（Prisma）**

```prisma
model Employee {
  id            String   @id @default(uuid())
  tenant_id     String   // RLS用、必須
  employee_code String   // 社員コード、テナント内で一意
  employee_name String   // 社員名
  organization_key String? // 組織キー、nullable、MVPではFK制約なし
  is_active     Boolean  @default(true) // 有効/無効フラグ
  created_at    DateTime @default(now())
  updated_at    DateTime @updatedAt
  created_by    String   // user_id（Clerk ID）
  updated_by    String   // user_id（Clerk ID）

  @@unique([tenant_id, employee_code]) // テナント内でemployee_codeは一意
  @@index([tenant_id, is_active]) // 一覧検索用インデックス
  @@index([tenant_id, employee_code]) // 社員コード検索用インデックス
}
```

**RLS Policy（PostgreSQL）**
- RLSは常に有効
- すべてのクエリで `tenant_id = current_setting('app.tenant_id')` を強制

---

### Contracts Summary（This Feature）

**DTO定義場所**
- BFF DTO: `packages/contracts/src/bff/dto/employee-master/`
- API DTO: `packages/contracts/src/api/dto/employee-master/`
- Enum/Error: `packages/contracts/src/shared/`（原則）

**BFF DTO（UI ↔ BFF）**

- `ListEmployeeMasterRequest`
  - `page?: number` (default: 1)
  - `pageSize?: number` (default: 50, max: 200)
  - `sortBy?: 'employeeCode' | 'employeeName'` (default: 'employeeCode')
  - `sortOrder?: 'asc' | 'desc'` (default: 'asc')
  - `employeeCode?: string` (検索条件)
  - `employeeName?: string` (検索条件)
  - `includeInactive?: boolean` (default: false)

- `ListEmployeeMasterResponse`
  - `items: EmployeeMasterListItem[]`
  - `page: number`
  - `pageSize: number`
  - `totalCount: number`

- `EmployeeMasterListItem`
  - `id: string`
  - `employeeCode: string`
  - `employeeName: string`
  - `organizationKey?: string | null`
  - `isActive: boolean`

- `EmployeeMasterDetailResponse`
  - `id: string`
  - `employeeCode: string`
  - `employeeName: string`
  - `organizationKey?: string | null`
  - `isActive: boolean`
  - `createdAt: string` (ISO 8601)
  - `updatedAt: string` (ISO 8601)
  - `createdBy: string`
  - `updatedBy: string`

- `CreateEmployeeMasterRequest`
  - `employeeCode: string` (必須)
  - `employeeName: string` (必須)
  - `organizationKey?: string | null` (optional)

- `UpdateEmployeeMasterRequest`
  - `employeeName?: string`
  - `organizationKey?: string | null`
  - ※ `employeeCode` は含めない（Requirement 4: 作成後に変更不可）

**API DTO（BFF ↔ Domain API）**

- `ListEmployeeMasterRequest` (api)
  - `offset: number`
  - `limit: number`
  - `sortBy: 'employeeCode' | 'employeeName'` (DTOキー、camelCase)
  - `sortOrder: 'asc' | 'desc'`
  - `employeeCode?: string`
  - `employeeName?: string`
  - `includeInactive?: boolean`

- `ListEmployeeMasterResponse` (api)
  - `items: EmployeeMasterEntity[]`
  - `totalCount: number`

- `EmployeeMasterEntity`
  - `id: string`
  - `tenantId: string`
  - `employeeCode: string`
  - `employeeName: string`
  - `organizationKey?: string | null`
  - `isActive: boolean`
  - `createdAt: Date`
  - `updatedAt: Date`
  - `createdBy: string`
  - `updatedBy: string`

- `CreateEmployeeMasterRequest` (api)
  - `employeeCode: string`
  - `employeeName: string`
  - `organizationKey?: string | null`

- `UpdateEmployeeMasterRequest` (api)
  - `employeeName?: string`
  - `organizationKey?: string | null`
  - ※ `employeeCode` は含めない（Requirement 4: 作成後に変更不可）

**Enum定義**

- `EmployeeMasterSortBy` (shared)
  - `EMPLOYEE_CODE = 'employeeCode'`
  - `EMPLOYEE_NAME = 'employeeName'`

**Error定義**

- `EmployeeMasterError` (shared)
  - `EMPLOYEE_NOT_FOUND` (404)
  - `EMPLOYEE_CODE_DUPLICATE` (409)
  - `EMPLOYEE_CODE_CANNOT_BE_CHANGED` (422)
  - `EMPLOYEE_ALREADY_INACTIVE` (409)
  - `EMPLOYEE_ALREADY_ACTIVE` (409)
  - `VALIDATION_ERROR` (422)

---

## Responsibility Clarification（Mandatory）

本Featureにおける責務境界を以下に明記する。
未記載の責務は実装してはならない。

### UIの責務
- 表示制御（enable/disable / 文言切替）
- フォーム入力制御・UX最適化
- ページング/ソートUIの提供（page/pageSize形式）
- ビジネス判断は禁止

### BFFの責務
- UI入力の正規化（page/pageSize → offset/limit、sortBy正規化）
- Domain API DTO ⇄ UI DTO の変換（基本的にcamelCase統一のため変換は最小限）
- ページング/ソートのデフォルト値設定（page=1, pageSize=50, sortBy=employeeCode, sortOrder=asc）
- エラーのPass-through（意味的な変更禁止）
- ビジネスルールの正本は持たない

### Domain APIの責務
- ビジネスルールの正本（employeeCode変更不可、一意性チェック、状態遷移）
- 権限・状態遷移の最終判断（403/404/409/422等）
- 監査ログ・整合性保証
- テナント境界の強制（RLS + where句）

### Repositoryの責務
- DBアクセスの唯一の入口
- tenant_idによる二重ガード（where句 + RLS）
- DTOキー（camelCase）→ DB列名（snake_case）のマッピング（sortBy等）
- トランザクション管理（Service層で制御）

---

## 設計上の重要な決定事項

### employeeCode変更不可（Requirement 4参照）
- 更新リクエストにemployeeCodeが含まれている場合は422エラーを返却
- UpdateEmployeeMasterRequest（BFF/API両方）にemployeeCodeフィールドを含めない

### ページング仕様（Requirement 10参照）
- UI/BFF: page/pageSize（default: page=1, pageSize=50, max=200）
- Domain API: offset/limit
- BFFで変換: offset=(page-1)*pageSize, limit=pageSize

### デフォルトソート（Requirement 1、Requirement 10参照）
- default sort = employeeCode asc
- BFFでデフォルト値を設定

### organizationKey（MVP決定）
- nullable、MVPではFK制約なし
- 将来の拡張を見据えた設計

### Error Policy: Pass-through（Requirement 11参照）
- BFFはDomain APIのエラーをそのまま返す
- 意味的な再分類・書き換えは禁止
