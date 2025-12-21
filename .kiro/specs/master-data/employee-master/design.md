# Design Document: 社員マスタ

**Purpose**: 社員マスタの登録・照会・編集機能を実装するための設計仕様。UI要件に最適化したBFF APIと、ビジネスルールを保持するDomain APIの責務を明確化する。

## Overview

本機能は、ProcurERPにおける社員マスタの登録・照会・編集を提供する。購買依頼や承認フローにおいて、社員情報を参照・利用するための基盤マスタとして機能する。

社員マスタは以下の機能を提供する：

- 社員一覧表示（ページネーション・ソート対応）
    
- 社員詳細表示・編集
    
- 社員新規登録
    
- 社員データのバリデーション（社員コードの一意性、メールアドレス形式、日付整合性）
    

マルチテナント対応として、すべての操作はテナント単位で分離され、RLS（Row Level Security）により保護される。マスタ系データのため、楽観ロック（version）を採用する。

## Architecture

### Architecture Pattern & Boundary Map

**Pattern (fixed)**:

- UI（apps/web） → BFF（apps/bff） → Domain API（apps/api） → DB（PostgreSQL + RLS）
    
- UI直APIは禁止
    

**Contracts (SSoT)**:

- UI ↔ BFF: `packages/contracts/src/bff/employee-master`
    
- BFF ↔ Domain API: `packages/contracts/src/api/employee-master`
    
- Enum/Error: 原則 `packages/contracts/src/shared/**`
    
- UI は `packages/contracts/src/api` を参照してはならない
    

## Architecture Responsibilities（Mandatory）

### BFF Specification（apps/bff）

**Purpose**

- UI要件に最適化したAPI（Read Model / ViewModel）
    
- Domain APIのレスポンスを集約・変換（ビジネスルールの正本は持たない）
    

**BFF Endpoints（UIが叩く）**

|   |   |   |   |   |   |
|---|---|---|---|---|---|
|**Method**|**Endpoint**|**Purpose**|**Request DTO (contracts/bff)**|**Response DTO (contracts/bff)**|**Notes**|
|GET|`/api/bff/master-data/employee-master`|社員一覧取得|`ListEmployeesRequest`|`ListEmployeesResponse`|ページネーション・ソート対応|
|GET|`/api/bff/master-data/employee-master/:id`|社員詳細取得|-|`GetEmployeeResponse`|IDはUUID|
|POST|`/api/bff/master-data/employee-master`|社員新規登録|`CreateEmployeeRequest`|`CreateEmployeeResponse`|テナントID自動設定|
|PUT|`/api/bff/master-data/employee-master/:id`|社員更新|`UpdateEmployeeRequest`|`UpdateEmployeeResponse`|楽観ロック（version）|

**Naming Convention（必須）**

- DTO / Contracts: camelCase（例: `employeeCode`, `employeeName`, `joinDate`）
    
- DB columns: snake_case（例: `employee_code`, `employee_name`, `join_date`）
    
- `sortBy` は **DTO側キー**を採用する（例: `employeeCode | employeeName | joinDate`）。
    
- DB列名（snake_case）を UI/BFF へ露出させない。
    

**Paging / Sorting Normalization（必須・BFF責務）**

- UI/BFF: page / pageSize（page-based）
    
- Domain API: offset / limit（DB-friendly）
    
- BFFは必ず以下を実施する（省略禁止）：
    
    - defaults: page=1, pageSize=50, sortBy=employeeCode, sortOrder=asc
        
    - clamp: pageSize <= 200
        
    - whitelist: sortBy は許可リストのみ（`employeeCode | employeeName | employeeKanaName | email | joinDate | retireDate | isActive`）
        
    - normalize: keyword trim、空→undefined
        
    - transform: offset=(page-1)*pageSize, limit=pageSize
        
- Domain APIに渡すのは offset/limit（page/pageSizeは渡さない）
    
- BFFレスポンスには page/pageSize を含める（UIへ返すのはBFF側の値）
    

**Transformation Rules（api DTO → bff DTO）**

- 方針：field rename/omit/default の有無
    
    - API DTOのフィールド名をそのままBFF DTOにマッピング（camelCase統一）
        
    - 日付フィールド（joinDate, retireDate）はISO 8601文字列として扱う
        
    - versionフィールドはBFFレスポンスに含める（楽観ロック用）
        
- BFFレスポンスに page/pageSize を含める（UIに返すのはBFF値）
    

**Error Handling（contracts errorに準拠）**

**Error Policy（必須・未記載禁止）**

- この Feature における BFF の Error Policy は以下とする：
    
    - 採用方針：**Option A: Pass-through**
        
    - 採用理由：
        
        - 社員マスタは比較的シンプルなCRUD操作であり、Domain APIのエラーをそのままUIに伝えることで十分
            
        - UI側でエラーメッセージを適切に表示できる設計とする
            
        - BFF側での意味的な再分類は不要
            

**Option A: Pass-through（基本・推奨）**

- Domain APIのエラーを原則そのまま返す（status / code / message / details）
    
- BFF側での意味的な再分類・書き換えは禁止（ログ付与等の非機能は除く）
    
- UIは `contracts/bff/errors` に基づいて表示制御を行う
    

**In all cases**

- 最終拒否権限（403/404/409/422等）は Domain API が持つ
    

**Error Contract Definition**

- BFFは独自のエラーコードを定義せず、Domain APIのエラー定義 (`packages/contracts/src/api/errors/employee-master-error.ts`) を `packages/contracts/src/bff/errors/employee-master-error.ts` にて Re-export して使用する。
    
- これにより、APIとBFFでエラーコード（`EMPLOYEE_CODE_DUPLICATE` 等）の完全な一致を保証する。
    

**Authentication / Tenant Context（tenant_id/user_id伝搬）**

- BFFは認証情報（Clerk）から `tenant_id` / `user_id` を解決する
    
- Domain API呼び出し時に、`tenant_id` / `user_id` をHTTPヘッダーまたはコンテキストに含めて伝搬する
    
- BFFは認証情報の解決に失敗した場合、401 Unauthorizedを返す
    

**Authorization Responsibility**

- BFF層ではAPI呼び出し前のブロッキング（権限チェック）は行わない。
    
- 権限チェックの正本（SSoT）はDomain APIに集約し、BFFはDomain APIから返却された `403 Forbidden` を透過的にクライアントへ返す方針とする（二重管理防止のため）。
    

### Service Specification（Domain / apps/api）

**Purpose**

- ビジネスルールの正本（BFF/UIは禁止）
    
- 権限・状態遷移の最終判断
    
- 監査ログ・整合性保証
    

**Usecases**

|   |   |   |   |   |   |
|---|---|---|---|---|---|
|**Usecase**|**Method**|**Purpose**|**Input**|**Output**|**Transaction Boundary**|
|ListEmployees|GET|社員一覧取得|tenantId, offset, limit, sortBy, sortOrder, filters|Employee[]|Read-only（トランザクション不要）|
|GetEmployee|GET|社員詳細取得|tenantId, employeeId|Employee|Read-only（トランザクション不要）|
|CreateEmployee|POST|社員新規登録|tenantId, CreateEmployeeDto|Employee|Single transaction（INSERT + 監査ログ）|
|UpdateEmployee|PUT|社員更新|tenantId, employeeId, UpdateEmployeeDto, version|Employee|Single transaction（UPDATE + 監査ログ）|

**主要ビジネスルール**

1. **社員コードの一意性チェック**
    
    - 同一テナント内で社員コードは一意でなければならない
        
    - 新規登録時：社員コードの重複チェックを実行
        
    - 更新時：社員コード変更がある場合のみ重複チェックを実行
        
    - 重複時は `EMPLOYEE_CODE_DUPLICATE` エラーを返す
        
2. **メールアドレス形式チェック**
    
    - メールアドレスは任意項目だが、入力された場合は有効な形式でなければならない
        
    - 形式不正時は `INVALID_EMAIL_FORMAT` エラーを返す
        
3. **日付整合性チェック**
    
    - 退社日が入社日より前の日付である場合は `INVALID_DATE_RANGE` エラーを返す
        
4. **楽観ロック**
    
    - 更新時はversionフィールドを使用した楽観ロックを実装
        
    - 取得時のversionと更新時のversionが一致しない場合は `CONCURRENT_UPDATE` エラーを返す
        
5. **キーワード検索仕様**
    
    - `keyword` パラメータが指定された場合、以下のフィールドに対して**部分一致（Partial Match / LIKE %keyword%）**でフィルタリングを行う。
        
    - 対象フィールド: `employeeCode` OR `employeeName` OR `employeeKanaName`
        
    - 大文字・小文字は区別しない（Case-insensitive）。
        

**トランザクション境界**

- CreateEmployee: 1トランザクション（INSERT + 監査ログ）
    
- UpdateEmployee: 1トランザクション（UPDATE + 監査ログ）
    
- ListEmployees / GetEmployee: トランザクション不要（Read-only）
    

**監査ログ記録ポイント**

- CreateEmployee: 社員データ作成時（user_id, tenant_id, employee_id, 作成内容）
    
- UpdateEmployee: 社員データ更新時（user_id, tenant_id, employee_id, 変更前後の値）
    

**権限チェック**

- すべての操作には `procure.employee-master.read` / `procure.employee-master.create` / `procure.employee-master.update` 権限が必要
    
- 権限不足時は 403 Forbidden を返す
    

### Repository Specification（apps/api）

**Purpose**

- DBアクセス（tenant_id必須）
    
- RLS連携
    
- tenant_id double-guard
    

**Repository Methods**

|   |   |   |   |   |
|---|---|---|---|---|
|**Method**|**Purpose**|**Input**|**Output**|**tenant_id Guard**|
|findMany|社員一覧取得|tenantId, offset, limit, sortBy, sortOrder, filters|Employee[]|WHERE句 + RLS|
|findOne|社員詳細取得|tenantId, employeeId|Employee|null|
|create|社員新規登録|tenantId, CreateEmployeeDto|Employee|INSERT値 + RLS|
|update|社員更新|tenantId, employeeId, UpdateEmployeeDto, version|Employee|WHERE句 + RLS|

**tenant_id double-guard（必須）**

- すべてのRepositoryメソッドは `tenant_id` を必須パラメータとして受け取る
    
- WHERE句に必ず `tenant_id = :tenantId` を含める
    
- RLSは常に有効とし、set_config による無効化は禁止
    
- Prismaクエリでは `where: { tenantId, ... }` を明示的に指定
    

**楽観ロック実装**

- updateメソッドでは、WHERE句に `version = :version` を含める
    
- 更新件数が0の場合は競合とみなし、`CONCURRENT_UPDATE` エラーを返す
    

### Contracts Summary（This Feature）

**BFF Contracts（packages/contracts/src/bff/employee-master）**

- `ListEmployeesRequest`
    
    - page: number (1-based)
        
    - pageSize: number
        
    - sortBy?: 'employeeCode' | 'employeeName' | 'employeeKanaName' | 'email' | 'joinDate' | 'retireDate' | 'isActive'
        
    - sortOrder?: 'asc' | 'desc'
        
    - keyword?: string (社員コード・氏名・カナ名の部分一致検索)
        
- `ListEmployeesResponse`
    
    - items: EmployeeDto[]
        
    - page: number
        
    - pageSize: number
        
    - total: number
        
    - totalPages: number
        
- `GetEmployeeResponse`
    
    - employee: EmployeeDto
        
- `CreateEmployeeRequest`
    
    - employeeCode: string
        
    - employeeName: string
        
    - employeeKanaName: string
        
    - email?: string
        
    - joinDate: string (ISO 8601)
        
    - retireDate?: string (ISO 8601)
        
    - remarks?: string
        
    - isActive: boolean
        
- `CreateEmployeeResponse`
    
    - employee: EmployeeDto
        
- `UpdateEmployeeRequest`
    
    - employeeCode: string
        
    - employeeName: string
        
    - employeeKanaName: string
        
    - email?: string
        
    - joinDate: string (ISO 8601)
        
    - retireDate?: string (ISO 8601)
        
    - remarks?: string
        
    - isActive: boolean
        
    - version: number (楽観ロック用)
        
- `UpdateEmployeeResponse`
    
    - employee: EmployeeDto
        
- `EmployeeDto`
    
    - id: string (UUID)
        
    - employeeCode: string
        
    - employeeName: string
        
    - employeeKanaName: string
        
    - email?: string
        
    - joinDate: string (ISO 8601)
        
    - retireDate?: string | null (ISO 8601)
        
    - remarks?: string | null
        
    - isActive: boolean
        
    - version: number
        
    - createdAt: string (ISO 8601)
        
    - updatedAt: string (ISO 8601)
        

**API Contracts（packages/contracts/src/api/employee-master）**

- `ListEmployeesApiRequest`
    
    - offset: number (0-based)
        
    - limit: number
        
    - sortBy?: 'employeeCode' | 'employeeName' | 'employeeKanaName' | 'email' | 'joinDate' | 'retireDate' | 'isActive'
        
    - sortOrder?: 'asc' | 'desc'
        
    - keyword?: string
        
- `ListEmployeesApiResponse`
    
    - items: EmployeeApiDto[]
        
    - total: number
        
- `GetEmployeeApiResponse`
    
    - employee: EmployeeApiDto
        
- `CreateEmployeeApiRequest`
    
    - employeeCode: string
        
    - employeeName: string
        
    - employeeKanaName: string
        
    - email?: string
        
    - joinDate: string (ISO 8601)
        
    - retireDate?: string (ISO 8601)
        
    - remarks?: string
        
    - isActive: boolean
        
- `CreateEmployeeApiResponse`
    
    - employee: EmployeeApiDto
        
- `UpdateEmployeeApiRequest`
    
    - employeeCode: string
        
    - employeeName: string
        
    - employeeKanaName: string
        
    - email?: string
        
    - joinDate: string (ISO 8601)
        
    - retireDate?: string (ISO 8601)
        
    - remarks?: string
        
    - isActive: boolean
        
    - version: number
        
- `UpdateEmployeeApiResponse`
    
    - employee: EmployeeApiDto
        
- `EmployeeApiDto`
    
    - id: string (UUID)
        
    - employeeCode: string
        
    - employeeName: string
        
    - employeeKanaName: string
        
    - email?: string | null
        
    - joinDate: string (ISO 8601)
        
    - retireDate?: string | null (ISO 8601)
        
    - remarks?: string | null
        
    - isActive: boolean
        
    - version: number
        
    - createdAt: string (ISO 8601)
        
    - updatedAt: string (ISO 8601)
        

**Error Codes（packages/contracts/src/api/errors/employee-master-error.ts）**

- `EMPLOYEE_NOT_FOUND` (404): 指定された社員が見つからない
    
- `EMPLOYEE_CODE_DUPLICATE` (409): 社員コードが重複している
    
- `INVALID_EMAIL_FORMAT` (422): メールアドレスの形式が不正
    
- `INVALID_DATE_RANGE` (422): 退社日が入社日より前
    
- `CONCURRENT_UPDATE` (409): 楽観ロックによる競合
    

## Data Model

### Prisma Schema

```
model Employee {
  id             String   @id @default(uuid())
  tenantId       String
  employeeCode String
  employeeName String
  employeeKanaName String
  email          String?
  joinDate       DateTime
  retireDate     DateTime?
  remarks        String?
  isActive       Boolean  @default(true)
  version        Int      @default(1)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@unique([tenantId, employeeCode])
  @@index([tenantId, employeeCode])
  @@index([tenantId, isActive])
  @@index([tenantId, joinDate])
}
```

**RLS Policy（PostgreSQL）**

```
-- RLS有効化
ALTER TABLE "Employee" ENABLE ROW LEVEL SECURITY;

-- ポリシー: テナント単位でアクセス制御
CREATE POLICY "tenant_isolation" ON "Employee"
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::text);
```

## Responsibility Clarification（Mandatory）

本Featureにおける責務境界を以下に明記する。

未記載の責務は実装してはならない。

### UIの責務

- 表示制御（enable/disable / 文言切替）
    
- フォーム入力制御・UX最適化
    
- バリデーション表示（エラーメッセージの表示）
    
- ページネーションUI制御
    
- ソートUI制御
    
- ビジネス判断は禁止
    

### BFFの責務

- UI入力の正規化（paging / sorting / filtering）
    
- Domain API DTO ⇄ UI DTO の変換
    
- エラーの透過（Pass-through）
    
- ビジネスルールの正本は持たない
    

### Domain APIの責務

- ビジネスルールの正本（社員コード一意性、メール形式、日付整合性）
    
- 権限・状態遷移の最終判断
    
- 監査ログ・整合性保証
    
- 楽観ロックの実装
    

### Repositoryの責務

- DBアクセス（tenant_id必須）
    
- RLS連携
    
- tenant_id double-guard
    

## Requirements Traceability

|   |   |   |   |
|---|---|---|---|
|**Requirement ID**|**Requirement**|**Components**|**Interfaces**|
|REQ-1.1|社員一覧表示|BFF: ListEmployees, API: ListEmployees|GET /api/bff/master-data/employee-master|
|REQ-1.2|一覧表示フィールド|EmployeeDto|EmployeeDto|
|REQ-1.3|テナント単位フィルタリング|Repository: findMany|WHERE tenantId|
|REQ-1.4|ローディング状態|UI|-|
|REQ-1.5|エラーメッセージ表示|BFF: Error handling|Error DTO|
|REQ-2.1|社員詳細取得|BFF: GetEmployee, API: GetEmployee|GET /api/bff/master-data/employee-master/:id|
|REQ-2.2|編集画面フィールド|EmployeeDto|EmployeeDto|
|REQ-2.3|フィールド変更反映|UI|-|
|REQ-2.4|バリデーション実行|API: UpdateEmployee|Validation logic|
|REQ-2.5|バリデーションエラー表示|BFF: Error handling|Error DTO|
|REQ-2.6|社員データ更新|BFF: UpdateEmployee, API: UpdateEmployee|PUT /api/bff/master-data/employee-master/:id|
|REQ-2.7|更新成功時の画面遷移|UI|-|
|REQ-2.8|更新失敗時のエラー表示|BFF: Error handling|Error DTO|
|REQ-2.9|テナント単位データ取得・更新|Repository: findOne, update|WHERE tenantId|
|REQ-3.1|新規登録画面表示|UI|-|
|REQ-3.2|新規登録画面フィールド|CreateEmployeeRequest|CreateEmployeeRequest|
|REQ-3.3|フィールド初期化|UI|-|
|REQ-3.4|入力内容反映|UI|-|
|REQ-3.5|バリデーション実行|API: CreateEmployee|Validation logic|
|REQ-3.6|バリデーションエラー表示|BFF: Error handling|Error DTO|
|REQ-3.7|社員データ登録|BFF: CreateEmployee, API: CreateEmployee|POST /api/bff/master-data/employee-master|
|REQ-3.8|登録成功時の画面遷移|UI|-|
|REQ-3.9|登録失敗時のエラー表示|BFF: Error handling|Error DTO|
|REQ-3.10|テナントID自動設定|API: CreateEmployee|tenantId injection|
|REQ-4.1|社員コード必須|API: Validation|Validation logic|
|REQ-4.2|社員氏名必須|API: Validation|Validation logic|
|REQ-4.3|社員カナ名必須|API: Validation|Validation logic|
|REQ-4.4|メールアドレス任意|API: Validation|Validation logic|
|REQ-4.5|メールアドレス形式チェック|API: Validation|Validation logic|
|REQ-4.6|入社日必須|API: Validation|Validation logic|
|REQ-4.7|退社日任意|API: Validation|Validation logic|
|REQ-4.8|日付整合性チェック|API: Validation|Validation logic|
|REQ-4.9|備考任意|API: Validation|Validation logic|
|REQ-4.10|有効フラグデフォルト値|API: CreateEmployee|Default value|
|REQ-4.11|社員コード一意性保証|API: CreateEmployee, UpdateEmployee|Unique constraint|
|REQ-4.12|社員コード重複エラー|API: Validation|Error DTO|

## 非機能要件

### パフォーマンス

- 一覧取得はページネーションを必須とし、デフォルト50件、最大200件まで
    
- インデックス: tenantId + employeeCode, tenantId + isActive, tenantId + joinDate
    

### セキュリティ

- すべての操作はテナント単位で分離（RLS + Repository double-guard）
    
- 権限チェック: procure.employee-master.read / create / update
    

### 監査

- 作成・更新操作は監査ログに記録（user_id, tenant_id, employee_id, 変更内容）
    

### 可用性

- 楽観ロックによる同時更新の競合制御
    

（以上）


