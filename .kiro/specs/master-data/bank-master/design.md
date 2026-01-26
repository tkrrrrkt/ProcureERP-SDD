# Design Document: 銀行マスタ

**Purpose**: 銀行マスタ・支店マスタの登録・照会・編集機能を実装するための設計仕様。UI要件に最適化したBFF APIと、ビジネスルールを保持するDomain APIの責務を明確化する。

## Overview

本機能は、ProcurERPにおける銀行マスタ・支店マスタの登録・照会・編集を提供する。支払先口座登録時に銀行・支店情報を参照・選択するための基盤マスタとして機能する。

銀行マスタは以下の機能を提供する：

- 銀行一覧表示（ページネーション・ソート・インクリメンタル検索対応）
- 銀行詳細表示・編集
- 銀行新規登録・論理削除（無効化/再有効化）
- 支店一覧表示（銀行詳細画面内タブ）
- 支店詳細表示・編集
- 支店新規登録・論理削除
- 銀行・支店選択モーダル（支払先口座登録時）

マルチテナント対応として、すべての操作はテナント単位で分離され、RLS（Row Level Security）により保護される。マスタ系データのため、楽観ロック（version）を採用する。

## Architecture

### Architecture Pattern & Boundary Map

**Pattern (fixed)**:

- UI（apps/web） → BFF（apps/bff） → Domain API（apps/api） → DB（PostgreSQL + RLS）
- UI直APIは禁止

**Contracts (SSoT)**:

- UI ↔ BFF: `packages/contracts/src/bff/bank-master`
- BFF ↔ Domain API: `packages/contracts/src/api/bank-master`
- Enum/Error: 原則 `packages/contracts/src/shared/**`（本Feature固有エラーは `bff/errors`, `api/errors` に定義）
- UI は `packages/contracts/src/api` を参照してはならない

## Architecture Responsibilities（Mandatory）

### BFF Specification（apps/bff）

**Purpose**

- UI要件に最適化したAPI（Read Model / ViewModel）
- Domain APIのレスポンスを集約・変換（ビジネスルールの正本は持たない）

**BFF Endpoints（UIが叩く）**

| Method | Endpoint | Purpose | Request DTO (contracts/bff) | Response DTO (contracts/bff) | Notes |
|--------|----------|---------|----------------------------|------------------------------|-------|
| GET | `/api/bff/master-data/bank-master` | 銀行一覧取得 | `ListBanksRequest` | `ListBanksResponse` | ページネーション・ソート・検索対応 |
| GET | `/api/bff/master-data/bank-master/:id` | 銀行詳細取得 | - | `GetBankResponse` | IDはUUID |
| POST | `/api/bff/master-data/bank-master` | 銀行新規登録 | `CreateBankRequest` | `CreateBankResponse` | テナントID自動設定 |
| PUT | `/api/bff/master-data/bank-master/:id` | 銀行更新 | `UpdateBankRequest` | `UpdateBankResponse` | 楽観ロック（version） |
| PATCH | `/api/bff/master-data/bank-master/:id/deactivate` | 銀行無効化 | `DeactivateBankRequest` | `DeactivateBankResponse` | is_active=false |
| PATCH | `/api/bff/master-data/bank-master/:id/activate` | 銀行再有効化 | `ActivateBankRequest` | `ActivateBankResponse` | is_active=true |
| GET | `/api/bff/master-data/bank-master/:bankId/branches` | 支店一覧取得 | `ListBranchesRequest` | `ListBranchesResponse` | 銀行配下の支店一覧 |
| GET | `/api/bff/master-data/bank-master/:bankId/branches/:id` | 支店詳細取得 | - | `GetBranchResponse` | IDはUUID |
| POST | `/api/bff/master-data/bank-master/:bankId/branches` | 支店新規登録 | `CreateBranchRequest` | `CreateBranchResponse` | bank_id自動設定 |
| PUT | `/api/bff/master-data/bank-master/:bankId/branches/:id` | 支店更新 | `UpdateBranchRequest` | `UpdateBranchResponse` | 楽観ロック（version） |
| PATCH | `/api/bff/master-data/bank-master/:bankId/branches/:id/deactivate` | 支店無効化 | `DeactivateBranchRequest` | `DeactivateBranchResponse` | is_active=false |
| PATCH | `/api/bff/master-data/bank-master/:bankId/branches/:id/activate` | 支店再有効化 | `ActivateBranchRequest` | `ActivateBranchResponse` | is_active=true |

**Naming Convention（必須）**

- DTO / Contracts: camelCase（例: `bankCode`, `bankName`, `bankNameKana`）
- DB columns: snake_case（例: `bank_code`, `bank_name`, `bank_name_kana`）
- `sortBy` は **DTO側キー**を採用する（例: `bankCode | bankName | bankNameKana | displayOrder`）。
- DB列名（snake_case）を UI/BFF へ露出させない。

**Paging / Sorting Normalization（必須・BFF責務）**

- UI/BFF: page / pageSize（page-based）
- Domain API: offset / limit（DB-friendly）
- BFFは必ず以下を実施する（省略禁止）：
  - defaults: page=1, pageSize=50, sortBy=displayOrder, sortOrder=asc
  - clamp: pageSize <= 200
  - whitelist: sortBy は許可リストのみ
    - 銀行: `bankCode | bankName | bankNameKana | displayOrder | isActive`
    - 支店: `branchCode | branchName | branchNameKana | displayOrder | isActive`
  - normalize: keyword trim、空→undefined、半角カナへの正規化
  - transform: offset=(page-1)*pageSize, limit=pageSize
- Domain APIに渡すのは offset/limit（page/pageSizeは渡さない）
- BFFレスポンスには page/pageSize を含める（UIへ返すのはBFF側の値）

**Transformation Rules（api DTO → bff DTO）**

- 方針：field rename/omit/default の有無
  - API DTOのフィールド名をそのままBFF DTOにマッピング（camelCase統一）
  - versionフィールドはBFFレスポンスに含める（楽観ロック用）
  - 銀行名カナの検索時、BFF層で半角カナへ正規化してからAPIに渡す
- BFFレスポンスに page/pageSize を含める（UIに返すのはBFF値）

**Error Handling（contracts errorに準拠）**

**Error Policy（必須・未記載禁止）**

- この Feature における BFF の Error Policy は以下とする：
  - 採用方針：**Option A: Pass-through**
  - 採用理由：
    - 銀行マスタは比較的シンプルなCRUD操作であり、Domain APIのエラーをそのままUIに伝えることで十分
    - UI側でエラーメッセージを適切に表示できる設計とする
    - BFF側での意味的な再分類は不要
    - employee-master と同一方針で一貫性を保つ

**Option A: Pass-through（基本・推奨）**

- Domain APIのエラーを原則そのまま返す（status / code / message / details）
- BFF側での意味的な再分類・書き換えは禁止（ログ付与等の非機能は除く）
- UIは `contracts/bff/errors` に基づいて表示制御を行う

**In all cases**

- 最終拒否権限（403/404/409/422等）は Domain API が持つ

**Error Contract Definition**

- BFFは独自のエラーコードを定義せず、Domain APIのエラー定義 (`packages/contracts/src/api/errors/bank-master-error.ts`) を `packages/contracts/src/bff/errors/bank-master-error.ts` にて Re-export して使用する。
- これにより、APIとBFFでエラーコード（`BANK_CODE_DUPLICATE` 等）の完全な一致を保証する。

**Authentication / Tenant Context（tenant_id/user_id伝搬）**

- BFFは認証情報（Clerk）から `tenant_id` / `user_id` を解決する
- Domain API呼び出し時に、`tenant_id` / `user_id` をHTTPヘッダーまたはコンテキストに含めて伝搬する
- BFFは認証情報の解決に失敗した場合、401 Unauthorizedを返す

**Authorization Responsibility**

- BFF層ではAPI呼び出し前のブロッキング（権限チェック）は行わない。
- 権限チェックの正本（SSoT）はDomain APIに集約し、BFFはDomain APIから返却された `403 Forbidden` を透過的にクライアントへ返す方針とする（二重管理防止のため）。

---

### Service Specification（Domain / apps/api）

**Purpose**

- ビジネスルールの正本（BFF/UIは禁止）
- 権限・状態遷移の最終判断
- 監査ログ・整合性保証

**Usecases（銀行）**

| Usecase | Method | Purpose | Input | Output | Transaction Boundary |
|---------|--------|---------|-------|--------|---------------------|
| ListBanks | GET | 銀行一覧取得 | tenantId, offset, limit, sortBy, sortOrder, filters | Bank[], total | Read-only |
| GetBank | GET | 銀行詳細取得 | tenantId, bankId | Bank | Read-only |
| CreateBank | POST | 銀行新規登録 | tenantId, CreateBankDto | Bank | Single transaction |
| UpdateBank | PUT | 銀行更新 | tenantId, bankId, UpdateBankDto, version | Bank | Single transaction |
| DeactivateBank | PATCH | 銀行無効化 | tenantId, bankId, version | Bank | Single transaction |
| ActivateBank | PATCH | 銀行再有効化 | tenantId, bankId, version | Bank | Single transaction |

**Usecases（支店）**

| Usecase | Method | Purpose | Input | Output | Transaction Boundary |
|---------|--------|---------|-------|--------|---------------------|
| ListBranches | GET | 支店一覧取得 | tenantId, bankId, offset, limit, sortBy, sortOrder, filters | Branch[], total | Read-only |
| GetBranch | GET | 支店詳細取得 | tenantId, bankId, branchId | Branch | Read-only |
| CreateBranch | POST | 支店新規登録 | tenantId, bankId, CreateBranchDto | Branch | Single transaction |
| UpdateBranch | PUT | 支店更新 | tenantId, bankId, branchId, UpdateBranchDto, version | Branch | Single transaction |
| DeactivateBranch | PATCH | 支店無効化 | tenantId, bankId, branchId, version | Branch | Single transaction |
| ActivateBranch | PATCH | 支店再有効化 | tenantId, bankId, branchId, version | Branch | Single transaction |

**主要ビジネスルール**

1. **銀行コードの一意性チェック**
   - 同一テナント内で銀行コードは一意でなければならない
   - 新規登録時：銀行コードの重複チェックを実行
   - 銀行コードは登録後の変更不可（更新APIでは銀行コードフィールドを受け付けない）
   - 重複時は `BANK_CODE_DUPLICATE` エラーを返す

2. **銀行コード形式チェック**
   - 銀行コードは4桁の数字（全銀協コード準拠）
   - 形式不正時は `INVALID_BANK_CODE_FORMAT` エラーを返す

3. **支店コードの一意性チェック**
   - 同一銀行内で支店コードは一意でなければならない
   - 新規登録時：支店コードの重複チェックを実行
   - 支店コードは登録後の変更不可
   - 重複時は `BRANCH_CODE_DUPLICATE` エラーを返す

4. **支店コード形式チェック**
   - 支店コードは3桁の数字（全銀協コード準拠）
   - 形式不正時は `INVALID_BRANCH_CODE_FORMAT` エラーを返す

5. **銀行無効化時の支店存在チェック**
   - 銀行を無効化する際、有効な支店が存在する場合は警告情報を返す
   - 警告は `HAS_ACTIVE_BRANCHES` としてレスポンスに含める（処理は続行可能）

6. **支店無効化時の使用チェック**
   - 支店を無効化する際、支払先口座で使用されている場合は警告情報を返す
   - 警告は `BRANCH_IN_USE` としてレスポンスに含める（処理は続行可能）

7. **半角カナ正規化**
   - 銀行名カナ・支店名カナは半角カタカナに正規化して保存
   - 正規化はDomain API層で実施

8. **楽観ロック**
   - 更新時はversionフィールドを使用した楽観ロックを実装
   - 取得時のversionと更新時のversionが一致しない場合は `CONCURRENT_UPDATE` エラーを返す

9. **キーワード検索仕様**
   - `keyword` パラメータが指定された場合、以下のフィールドに対して**部分一致（ILIKE %keyword%）**でフィルタリング
   - 銀行: `bankCode` OR `bankName` OR `bankNameKana`
   - 支店: `branchCode` OR `branchName` OR `branchNameKana`
   - 大文字・小文字は区別しない（Case-insensitive）

**トランザクション境界**

- CreateBank / UpdateBank / DeactivateBank / ActivateBank: 1トランザクション（操作 + 監査ログ）
- CreateBranch / UpdateBranch / DeactivateBranch / ActivateBranch: 1トランザクション（操作 + 監査ログ）
- ListBanks / GetBank / ListBranches / GetBranch: トランザクション不要（Read-only）

**監査ログ記録ポイント**

- CreateBank: 銀行データ作成時（user_id, tenant_id, bank_id, 作成内容）
- UpdateBank: 銀行データ更新時（user_id, tenant_id, bank_id, 変更前後の値）
- DeactivateBank / ActivateBank: 銀行の有効/無効切り替え時
- CreateBranch: 支店データ作成時（user_id, tenant_id, bank_id, branch_id, 作成内容）
- UpdateBranch: 支店データ更新時（user_id, tenant_id, bank_id, branch_id, 変更前後の値）
- DeactivateBranch / ActivateBranch: 支店の有効/無効切り替え時

**権限チェック**

- 銀行参照: `procure.bank.read`
- 銀行登録: `procure.bank.create`
- 銀行編集・無効化・再有効化: `procure.bank.update`
- 支店参照: `procure.bank-branch.read`
- 支店登録: `procure.bank-branch.create`
- 支店編集・無効化・再有効化: `procure.bank-branch.update`
- 権限不足時は 403 Forbidden を返す

---

### Repository Specification（apps/api）

**Purpose**

- DBアクセス（tenant_id必須）
- RLS連携
- tenant_id double-guard

**Repository Methods（銀行）**

| Method | Purpose | Input | Output | tenant_id Guard |
|--------|---------|-------|--------|-----------------|
| findMany | 銀行一覧取得 | tenantId, offset, limit, sortBy, sortOrder, filters | Bank[], total | WHERE句 + RLS |
| findOne | 銀行詳細取得 | tenantId, bankId | Bank \| null | WHERE句 + RLS |
| findByCode | 銀行コード検索 | tenantId, bankCode | Bank \| null | WHERE句 + RLS |
| create | 銀行新規登録 | tenantId, CreateBankDto | Bank | INSERT値 + RLS |
| update | 銀行更新 | tenantId, bankId, UpdateBankDto, version | Bank | WHERE句 + RLS |
| countActiveBranches | 有効支店数取得 | tenantId, bankId | number | WHERE句 + RLS |

**Repository Methods（支店）**

| Method | Purpose | Input | Output | tenant_id Guard |
|--------|---------|-------|--------|-----------------|
| findMany | 支店一覧取得 | tenantId, bankId, offset, limit, sortBy, sortOrder, filters | Branch[], total | WHERE句 + RLS |
| findOne | 支店詳細取得 | tenantId, bankId, branchId | Branch \| null | WHERE句 + RLS |
| findByCode | 支店コード検索 | tenantId, bankId, branchCode | Branch \| null | WHERE句 + RLS |
| create | 支店新規登録 | tenantId, bankId, CreateBranchDto | Branch | INSERT値 + RLS |
| update | 支店更新 | tenantId, bankId, branchId, UpdateBranchDto, version | Branch | WHERE句 + RLS |
| isInUse | 支店使用チェック | tenantId, branchId | boolean | WHERE句 + RLS |

**tenant_id double-guard（必須）**

- すべてのRepositoryメソッドは `tenant_id` を必須パラメータとして受け取る
- WHERE句に必ず `tenant_id = :tenantId` を含める
- RLSは常に有効とし、set_config による無効化は禁止
- Prismaクエリでは `where: { tenantId, ... }` を明示的に指定

**楽観ロック実装**

- updateメソッドでは、WHERE句に `version = :version` を含める
- 更新件数が0の場合は競合とみなし、`CONCURRENT_UPDATE` エラーを返す

---

### Contracts Summary（This Feature）

**BFF Contracts（packages/contracts/src/bff/bank-master）**

```typescript
// =============================================================================
// Sort Options
// =============================================================================

export type BankSortBy = 'bankCode' | 'bankName' | 'bankNameKana' | 'displayOrder' | 'isActive';
export type BranchSortBy = 'branchCode' | 'branchName' | 'branchNameKana' | 'displayOrder' | 'isActive';
export type SortOrder = 'asc' | 'desc';

// =============================================================================
// BankDto / BranchDto
// =============================================================================

export interface BankDto {
  id: string;
  bankCode: string;
  bankName: string;
  bankNameKana: string | null;
  swiftCode: string | null;
  displayOrder: number;
  isActive: boolean;
  version: number;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  createdBy: string | null;
  updatedBy: string | null;
}

export interface BranchDto {
  id: string;
  bankId: string;
  branchCode: string;
  branchName: string;
  branchNameKana: string | null;
  displayOrder: number;
  isActive: boolean;
  version: number;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  createdBy: string | null;
  updatedBy: string | null;
}

// =============================================================================
// List Banks
// =============================================================================

export interface ListBanksRequest {
  page?: number; // 1-based, default: 1
  pageSize?: number; // default: 50, max: 200
  sortBy?: BankSortBy; // default: 'displayOrder'
  sortOrder?: SortOrder; // default: 'asc'
  keyword?: string; // partial match on bankCode, bankName, bankNameKana
  isActive?: boolean; // filter by active status
}

export interface ListBanksResponse {
  items: BankDto[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// =============================================================================
// Get Bank
// =============================================================================

export interface GetBankResponse {
  bank: BankDto;
}

// =============================================================================
// Create Bank
// =============================================================================

export interface CreateBankRequest {
  bankCode: string; // 4-digit numeric
  bankName: string;
  bankNameKana?: string;
  swiftCode?: string;
  displayOrder?: number; // default: 1000
  isActive?: boolean; // default: true
}

export interface CreateBankResponse {
  bank: BankDto;
}

// =============================================================================
// Update Bank
// =============================================================================

export interface UpdateBankRequest {
  // bankCode is NOT updatable
  bankName: string;
  bankNameKana?: string;
  swiftCode?: string;
  displayOrder: number;
  isActive: boolean;
  version: number; // optimistic lock
}

export interface UpdateBankResponse {
  bank: BankDto;
}

// =============================================================================
// Deactivate / Activate Bank
// =============================================================================

export interface DeactivateBankRequest {
  version: number;
}

export interface DeactivateBankResponse {
  bank: BankDto;
  warnings?: { code: string; message: string }[]; // e.g., HAS_ACTIVE_BRANCHES
}

export interface ActivateBankRequest {
  version: number;
}

export interface ActivateBankResponse {
  bank: BankDto;
}

// =============================================================================
// List Branches
// =============================================================================

export interface ListBranchesRequest {
  page?: number;
  pageSize?: number;
  sortBy?: BranchSortBy;
  sortOrder?: SortOrder;
  keyword?: string;
  isActive?: boolean;
}

export interface ListBranchesResponse {
  items: BranchDto[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// =============================================================================
// Get Branch
// =============================================================================

export interface GetBranchResponse {
  branch: BranchDto;
}

// =============================================================================
// Create Branch
// =============================================================================

export interface CreateBranchRequest {
  branchCode: string; // 3-digit numeric
  branchName: string;
  branchNameKana?: string;
  displayOrder?: number; // default: 1000
  isActive?: boolean; // default: true
}

export interface CreateBranchResponse {
  branch: BranchDto;
}

// =============================================================================
// Update Branch
// =============================================================================

export interface UpdateBranchRequest {
  // branchCode is NOT updatable
  branchName: string;
  branchNameKana?: string;
  displayOrder: number;
  isActive: boolean;
  version: number;
}

export interface UpdateBranchResponse {
  branch: BranchDto;
}

// =============================================================================
// Deactivate / Activate Branch
// =============================================================================

export interface DeactivateBranchRequest {
  version: number;
}

export interface DeactivateBranchResponse {
  branch: BranchDto;
  warnings?: { code: string; message: string }[]; // e.g., BRANCH_IN_USE
}

export interface ActivateBranchRequest {
  version: number;
}

export interface ActivateBranchResponse {
  branch: BranchDto;
}
```

**API Contracts（packages/contracts/src/api/bank-master）**

- BFF Contractsと同様の構造
- 違い: page/pageSize → offset/limit

**Error Codes（packages/contracts/src/api/errors/bank-master-error.ts）**

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `BANK_NOT_FOUND` | 404 | 指定された銀行が見つからない |
| `BANK_CODE_DUPLICATE` | 409 | 銀行コードが重複している |
| `INVALID_BANK_CODE_FORMAT` | 422 | 銀行コードの形式が不正（4桁数字でない） |
| `BRANCH_NOT_FOUND` | 404 | 指定された支店が見つからない |
| `BRANCH_CODE_DUPLICATE` | 409 | 支店コードが重複している |
| `INVALID_BRANCH_CODE_FORMAT` | 422 | 支店コードの形式が不正（3桁数字でない） |
| `CONCURRENT_UPDATE` | 409 | 楽観ロックによる競合 |

**Warning Codes（レスポンスに含まれる警告）**

| Code | Description |
|------|-------------|
| `HAS_ACTIVE_BRANCHES` | 銀行無効化時、有効な支店が存在する |
| `BRANCH_IN_USE` | 支店無効化時、支払先口座で使用されている |

---

## Data Model

### Prisma Schema

```prisma
model Bank {
  id            String   @id @default(uuid())
  tenantId      String   @map("tenant_id")
  bankCode      String   @map("bank_code") @db.VarChar(4)
  bankName      String   @map("bank_name") @db.VarChar(100)
  bankNameKana  String?  @map("bank_name_kana") @db.VarChar(150)
  swiftCode     String?  @map("swift_code") @db.VarChar(11)
  displayOrder  Int      @default(1000) @map("display_order")
  isActive      Boolean  @default(true) @map("is_active")
  version       Int      @default(1)
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")
  createdBy     String?  @map("created_by_login_account_id")
  updatedBy     String?  @map("updated_by_login_account_id")

  branches      BankBranch[]

  @@unique([tenantId, bankCode])
  @@index([tenantId, bankCode])
  @@index([tenantId, displayOrder])
  @@index([tenantId, isActive])
  @@index([tenantId, bankNameKana])
  @@map("banks")
}

model BankBranch {
  id              String   @id @default(uuid())
  tenantId        String   @map("tenant_id")
  bankId          String   @map("bank_id")
  branchCode      String   @map("branch_code") @db.VarChar(3)
  branchName      String   @map("branch_name") @db.VarChar(100)
  branchNameKana  String?  @map("branch_name_kana") @db.VarChar(150)
  displayOrder    Int      @default(1000) @map("display_order")
  isActive        Boolean  @default(true) @map("is_active")
  version         Int      @default(1)
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")
  createdBy       String?  @map("created_by_login_account_id")
  updatedBy       String?  @map("updated_by_login_account_id")

  bank            Bank     @relation(fields: [bankId], references: [id])

  @@unique([tenantId, bankId, branchCode])
  @@index([tenantId, bankId, branchCode])
  @@index([tenantId, bankId, displayOrder])
  @@index([tenantId, bankId, isActive])
  @@index([tenantId, bankId, branchNameKana])
  @@map("bank_branches")
}
```

**RLS Policy（PostgreSQL）**

```sql
-- RLS有効化
ALTER TABLE "banks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "bank_branches" ENABLE ROW LEVEL SECURITY;

-- ポリシー: テナント単位でアクセス制御
CREATE POLICY "tenant_isolation" ON "banks"
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::text);

CREATE POLICY "tenant_isolation" ON "bank_branches"
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::text);
```

---

## Responsibility Clarification（Mandatory）

本Featureにおける責務境界を以下に明記する。
未記載の責務は実装してはならない。

### UIの責務

- 表示制御（enable/disable / 文言切替）
- フォーム入力制御・UX最適化
- バリデーション表示（エラーメッセージの表示）
- ページネーションUI制御
- ソートUI制御
- インクリメンタル検索のdebounce制御（300ms推奨）
- 銀行選択モーダル / 支店選択モーダルの表示制御
- ビジネス判断は禁止

### BFFの責務

- UI入力の正規化（paging / sorting / filtering / keyword正規化）
- 半角カナへの正規化（keyword）
- Domain API DTO ⇄ UI DTO の変換
- エラーの透過（Pass-through）
- ビジネスルールの正本は持たない

### Domain APIの責務

- ビジネスルールの正本（コード一意性、形式チェック、半角カナ正規化）
- 権限・状態遷移の最終判断
- 監査ログ・整合性保証
- 楽観ロックの実装
- 無効化時の警告生成（HAS_ACTIVE_BRANCHES, BRANCH_IN_USE）

### Repositoryの責務

- DBアクセス（tenant_id必須）
- RLS連携
- tenant_id double-guard

---

## Requirements Traceability

| Requirement ID | Requirement | Components | Interfaces |
|----------------|-------------|------------|------------|
| 1.1 | 銀行一覧表示（表示順ソート） | BFF: ListBanks, API: ListBanks | GET /api/bff/master-data/bank-master |
| 1.2 | 銀行検索（コード・名前・カナ） | BFF: ListBanks, API: ListBanks | ListBanksRequest.keyword |
| 1.3 | インクリメンタル検索 | UI: debounce, BFF: normalize | ListBanksRequest.keyword |
| 1.4 | 銀行一覧表示項目 | BankDto | BankDto |
| 1.5 | 該当なしメッセージ | UI | - |
| 2.1 | 銀行新規登録 | BFF: CreateBank, API: CreateBank | POST /api/bff/master-data/bank-master |
| 2.2 | 銀行コード形式検証（4桁数字） | API: Validation | INVALID_BANK_CODE_FORMAT |
| 2.3 | 銀行コード重複チェック | API: CreateBank | BANK_CODE_DUPLICATE |
| 2.4 | 銀行名カナ正規化 | API: CreateBank | 半角カナ変換 |
| 2.5 | 表示順デフォルト値 | API: CreateBank | displayOrder=1000 |
| 2.6 | 監査情報自動記録 | API: CreateBank | createdAt, createdBy |
| 3.1 | 銀行編集モード | UI | - |
| 3.2 | 銀行コード編集不可 | UI, API: UpdateBank | bankCode省略 |
| 3.3 | 銀行更新時監査情報 | API: UpdateBank | updatedAt, updatedBy |
| 3.4 | 楽観ロックエラー | API: UpdateBank | CONCURRENT_UPDATE |
| 4.1 | 銀行無効化 | BFF: DeactivateBank, API: DeactivateBank | PATCH .../deactivate |
| 4.2 | 有効支店存在時の警告 | API: DeactivateBank | HAS_ACTIVE_BRANCHES |
| 4.3 | 無効銀行のモーダル除外 | BFF: ListBanks | isActive=true filter |
| 4.4 | 銀行再有効化 | BFF: ActivateBank, API: ActivateBank | PATCH .../activate |
| 5.1 | 支店一覧表示（銀行詳細タブ） | BFF: ListBranches, API: ListBranches | GET .../branches |
| 5.2 | 支店検索 | BFF: ListBranches, API: ListBranches | ListBranchesRequest.keyword |
| 5.3 | 支店インクリメンタル検索 | UI: debounce, BFF: normalize | - |
| 5.4 | 支店一覧表示項目 | BranchDto | BranchDto |
| 6.1 | 支店新規登録 | BFF: CreateBranch, API: CreateBranch | POST .../branches |
| 6.2 | 支店コード形式検証（3桁数字） | API: Validation | INVALID_BRANCH_CODE_FORMAT |
| 6.3 | 支店コード重複チェック | API: CreateBranch | BRANCH_CODE_DUPLICATE |
| 6.4 | 支店名カナ正規化 | API: CreateBranch | 半角カナ変換 |
| 6.5 | bank_id自動設定 | API: CreateBranch | パスパラメータから取得 |
| 6.6 | 支店監査情報自動記録 | API: CreateBranch | createdAt, createdBy |
| 7.1 | 支店編集モード | UI | - |
| 7.2 | 支店コード・所属銀行編集不可 | UI, API: UpdateBranch | branchCode, bankId省略 |
| 7.3 | 支店更新時監査情報 | API: UpdateBranch | updatedAt, updatedBy |
| 7.4 | 支店楽観ロックエラー | API: UpdateBranch | CONCURRENT_UPDATE |
| 8.1 | 支店無効化 | BFF: DeactivateBranch, API: DeactivateBranch | PATCH .../deactivate |
| 8.2 | 支払先口座使用時の警告 | API: DeactivateBranch | BRANCH_IN_USE |
| 8.3 | 無効支店のモーダル除外 | BFF: ListBranches | isActive=true filter |
| 8.4 | 支店再有効化 | BFF: ActivateBranch, API: ActivateBranch | PATCH .../activate |
| 9.1 | 銀行選択モーダル表示 | UI: BankSelectModal | - |
| 9.2 | 有効銀行のみ表示 | BFF: ListBanks | isActive=true filter |
| 9.3 | モーダル内インクリメンタル検索 | UI: debounce, BFF: normalize | - |
| 9.4 | 銀行選択時の値返却 | UI: BankSelectModal | onSelect callback |
| 9.5 | 銀行選択後の支店モーダル自動表示 | UI: BranchSelectModal | - |
| 10.1 | 支店選択モーダル表示 | UI: BranchSelectModal | - |
| 10.2 | 有効支店のみ表示 | BFF: ListBranches | isActive=true filter |
| 10.3 | モーダル内インクリメンタル検索 | UI: debounce, BFF: normalize | - |
| 10.4 | 支店選択時の値返却 | UI: BranchSelectModal | onSelect callback |
| 10.5 | 支店なしメッセージ | UI: BranchSelectModal | - |
| 11.1 | 銀行RLSフィルタ | Repository: Bank | WHERE tenantId + RLS |
| 11.2 | 支店RLSフィルタ | Repository: Branch | WHERE tenantId + RLS |
| 11.3 | 不正アクセス拒否・監査ログ | API: AuthGuard | 403 + audit log |
| 12.1 | procure.bank.read | API: AuthGuard | 403 Forbidden |
| 12.2 | procure.bank.create | API: AuthGuard | 403 Forbidden |
| 12.3 | procure.bank.update | API: AuthGuard | 403 Forbidden |
| 12.4 | procure.bank-branch.read | API: AuthGuard | 403 Forbidden |
| 12.5 | procure.bank-branch.create | API: AuthGuard | 403 Forbidden |
| 12.6 | procure.bank-branch.update | API: AuthGuard | 403 Forbidden |
| 12.7 | モーダル使用時はread権限のみ | API: AuthGuard | procure.bank.read, procure.bank-branch.read |

---

## 非機能要件

### パフォーマンス

- 一覧取得はページネーションを必須とし、デフォルト50件、最大200件まで
- インデックス: tenantId + bankCode, tenantId + displayOrder, tenantId + bankNameKana, tenantId + isActive
- インクリメンタル検索のdebounce: 300ms（UI側）

### セキュリティ

- すべての操作はテナント単位で分離（RLS + Repository double-guard）
- 権限チェック: procure.bank.read / create / update, procure.bank-branch.read / create / update

### 監査

- 作成・更新・無効化・再有効化操作は監査ログに記録（user_id, tenant_id, entity_id, 変更内容）

### 可用性

- 楽観ロックによる同時更新の競合制御

---

（以上）
