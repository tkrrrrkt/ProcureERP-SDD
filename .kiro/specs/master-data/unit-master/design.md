# Design Document: 単位マスタ（Unit Master）

**Purpose**: 単位マスタの登録・照会・編集機能を実装するための設計仕様。UI要件に最適化したBFF APIと、ビジネスルールを保持するDomain APIの責務を明確化する。

## Overview

本機能は、ProcurERPにおける単位マスタ（UoM: Unit of Measure）および単位グループ（UoMGroup）の登録・照会・編集を提供する。品目マスタや伝票明細において数量単位を指定・管理するための基盤マスタとして機能する。

単位マスタは以下の機能を提供する：

- 単位グループ一覧表示・登録・編集・無効化
- 単位一覧表示・登録・編集・無効化
- 単位選択（サジェスト/検索）
- 基準単位（base_uom）の管理
- 単位コードのバリデーション（英数字大文字 + `-_` のみ、1〜10文字）

マルチテナント対応として、すべての操作はテナント単位で分離され、RLS（Row Level Security）により保護される。マスタ系データのため、楽観ロック（version）を採用する。

**特記事項：循環参照**

単位グループと単位は相互参照の関係にある：
- `uom_groups.base_uom_id` → `uoms.id`（単位グループは基準単位を持つ）
- `uoms.uom_group_id` → `uom_groups.id`（単位は単位グループに所属する）

この循環参照は、PostgreSQLの DEFERRABLE 制約を使用し、単一トランザクション内で両エンティティを同時に作成することで解決する。

---

## Architecture

### Architecture Pattern & Boundary Map

**Pattern (fixed)**:

- UI（apps/web） → BFF（apps/bff） → Domain API（apps/api） → DB（PostgreSQL + RLS）
- UI直APIは禁止

**Contracts (SSoT)**:

- UI ↔ BFF: `packages/contracts/src/bff/unit-master`
- BFF ↔ Domain API: `packages/contracts/src/api/unit-master`
- Error: `packages/contracts/src/api/errors/unit-master-error.ts`
- UI は `packages/contracts/src/api` を参照してはならない

---

## Architecture Responsibilities（Mandatory）

### BFF Specification（apps/bff）

**Purpose**

- UI要件に最適化したAPI（Read Model / ViewModel）
- Domain APIのレスポンスを集約・変換（ビジネスルールの正本は持たない）

**BFF Endpoints（UIが叩く）**

| Method | Endpoint | Purpose | Request DTO (contracts/bff) | Response DTO (contracts/bff) | Notes |
|--------|----------|---------|-----------------------------|-----------------------------|-------|
| GET | `/api/bff/master-data/unit-master/groups` | 単位グループ一覧取得 | `ListUomGroupsRequest` | `ListUomGroupsResponse` | ページネーション・ソート対応 |
| GET | `/api/bff/master-data/unit-master/groups/:id` | 単位グループ詳細取得 | - | `GetUomGroupResponse` | IDはUUID |
| POST | `/api/bff/master-data/unit-master/groups` | 単位グループ新規登録 | `CreateUomGroupRequest` | `CreateUomGroupResponse` | 基準単位も同時作成 |
| PUT | `/api/bff/master-data/unit-master/groups/:id` | 単位グループ更新 | `UpdateUomGroupRequest` | `UpdateUomGroupResponse` | 楽観ロック（version） |
| PATCH | `/api/bff/master-data/unit-master/groups/:id/activate` | 単位グループ有効化 | `ActivateUomGroupRequest` | `ActivateUomGroupResponse` | is_active = true |
| PATCH | `/api/bff/master-data/unit-master/groups/:id/deactivate` | 単位グループ無効化 | `DeactivateUomGroupRequest` | `DeactivateUomGroupResponse` | is_active = false |
| GET | `/api/bff/master-data/unit-master/uoms` | 単位一覧取得 | `ListUomsRequest` | `ListUomsResponse` | ページネーション・ソート対応 |
| GET | `/api/bff/master-data/unit-master/uoms/:id` | 単位詳細取得 | - | `GetUomResponse` | IDはUUID |
| POST | `/api/bff/master-data/unit-master/uoms` | 単位新規登録 | `CreateUomRequest` | `CreateUomResponse` | uom_group_id 必須 |
| PUT | `/api/bff/master-data/unit-master/uoms/:id` | 単位更新 | `UpdateUomRequest` | `UpdateUomResponse` | 楽観ロック（version） |
| PATCH | `/api/bff/master-data/unit-master/uoms/:id/activate` | 単位有効化 | `ActivateUomRequest` | `ActivateUomResponse` | is_active = true |
| PATCH | `/api/bff/master-data/unit-master/uoms/:id/deactivate` | 単位無効化 | `DeactivateUomRequest` | `DeactivateUomResponse` | is_active = false |
| GET | `/api/bff/master-data/unit-master/uoms/suggest` | 単位サジェスト | `SuggestUomsRequest` | `SuggestUomsResponse` | 最大20件 |

**Naming Convention（必須）**

- DTO / Contracts: camelCase（例: `groupCode`, `groupName`, `uomCode`, `uomName`）
- DB columns: snake_case（例: `uom_group_code`, `uom_group_name`, `uom_code`, `uom_name`）
- `sortBy` は **DTO側キー**を採用する（例: `groupCode | groupName | isActive`）
- DB列名（snake_case）を UI/BFF へ露出させない

**Paging / Sorting Normalization（必須・BFF責務）**

- UI/BFF: page / pageSize（page-based）
- Domain API: offset / limit（DB-friendly）
- BFFは必ず以下を実施する（省略禁止）：
  - defaults: page=1, pageSize=50, sortBy=groupCode/uomCode, sortOrder=asc
  - clamp: pageSize <= 200
  - whitelist:
    - UomGroup: sortBy は `groupCode | groupName | isActive` のみ
    - Uom: sortBy は `uomCode | uomName | groupCode | isActive` のみ
  - normalize: keyword trim、空→undefined
  - transform: offset=(page-1)*pageSize, limit=pageSize
- Domain APIに渡すのは offset/limit（page/pageSizeは渡さない）
- BFFレスポンスには page/pageSize を含める（UIへ返すのはBFF側の値）

**Transformation Rules（api DTO → bff DTO）**

- 方針：field rename/omit/default の有無
  - API DTOのフィールド名をそのままBFF DTOにマッピング（camelCase統一）
  - 日付フィールド（createdAt, updatedAt）はISO 8601文字列として扱う
  - versionフィールドはBFFレスポンスに含める（楽観ロック用）
  - isBaseUom（単位が基準単位かどうか）はBFF側で算出して付与
- BFFレスポンスに page/pageSize を含める（UIに返すのはBFF値）

**Error Handling（contracts errorに準拠）**

**Error Policy（必須・未記載禁止）**

- この Feature における BFF の Error Policy は以下とする：
  - 採用方針：**Option A: Pass-through**
  - 採用理由：
    - 単位マスタは比較的シンプルなCRUD操作であり、Domain APIのエラーをそのままUIに伝えることで十分
    - UI側でエラーメッセージを適切に表示できる設計とする
    - BFF側での意味的な再分類は不要

**Option A: Pass-through（基本・推奨）**

- Domain APIのエラーを原則そのまま返す（status / code / message / details）
- BFF側での意味的な再分類・書き換えは禁止（ログ付与等の非機能は除く）
- UIは `contracts/bff/errors` に基づいて表示制御を行う

**In all cases**

- 最終拒否権限（403/404/409/422等）は Domain API が持つ

**Error Contract Definition**

- BFFは独自のエラーコードを定義せず、Domain APIのエラー定義 (`packages/contracts/src/api/errors/unit-master-error.ts`) を `packages/contracts/src/bff/errors/unit-master-error.ts` にて Re-export して使用する。
- これにより、APIとBFFでエラーコード（`UOM_GROUP_CODE_DUPLICATE` 等）の完全な一致を保証する。

**Authentication / Tenant Context（tenant_id/user_id伝搬）**

- BFFは認証情報（Clerk）から `tenant_id` / `user_id` を解決する
- Domain API呼び出し時に、`tenant_id` / `user_id` をHTTPヘッダー（`x-tenant-id`, `x-user-id`）に含めて伝搬する
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

**Usecases - UomGroup**

| Usecase | Method | Purpose | Input | Output | Transaction Boundary |
|---------|--------|---------|-------|--------|---------------------|
| ListUomGroups | GET | 単位グループ一覧取得 | tenantId, offset, limit, sortBy, sortOrder, filters | UomGroup[] | Read-only |
| GetUomGroup | GET | 単位グループ詳細取得 | tenantId, groupId | UomGroup | Read-only |
| CreateUomGroup | POST | 単位グループ新規登録 | tenantId, userId, CreateUomGroupDto | UomGroup + Uom | Single transaction（両エンティティINSERT） |
| UpdateUomGroup | PUT | 単位グループ更新 | tenantId, userId, groupId, UpdateUomGroupDto, version | UomGroup | Single transaction |
| ActivateUomGroup | PATCH | 単位グループ有効化 | tenantId, userId, groupId, version | UomGroup | Single transaction |
| DeactivateUomGroup | PATCH | 単位グループ無効化 | tenantId, userId, groupId, version | UomGroup | Single transaction |

**Usecases - Uom**

| Usecase | Method | Purpose | Input | Output | Transaction Boundary |
|---------|--------|---------|-------|--------|---------------------|
| ListUoms | GET | 単位一覧取得 | tenantId, offset, limit, sortBy, sortOrder, filters | Uom[] | Read-only |
| GetUom | GET | 単位詳細取得 | tenantId, uomId | Uom | Read-only |
| CreateUom | POST | 単位新規登録 | tenantId, userId, CreateUomDto | Uom | Single transaction |
| UpdateUom | PUT | 単位更新 | tenantId, userId, uomId, UpdateUomDto, version | Uom | Single transaction |
| ActivateUom | PATCH | 単位有効化 | tenantId, userId, uomId, version | Uom | Single transaction |
| DeactivateUom | PATCH | 単位無効化 | tenantId, userId, uomId, version | Uom | Single transaction |
| SuggestUoms | GET | 単位サジェスト | tenantId, keyword, groupId? | Uom[] | Read-only |

**主要ビジネスルール**

1. **単位グループコードの一意性チェック**（Req 2.3）
   - 同一テナント内で uom_group_code は一意でなければならない
   - 新規登録時：重複チェックを実行
   - 重複時は `UOM_GROUP_CODE_DUPLICATE` エラーを返す

2. **単位コードの一意性チェック**（Req 6.3）
   - 同一テナント内で uom_code は一意でなければならない
   - 新規登録時：重複チェックを実行
   - 重複時は `UOM_CODE_DUPLICATE` エラーを返す

3. **コード形式バリデーション**（Req 2.2, 6.2）
   - uom_group_code / uom_code は `^[A-Z0-9_-]{1,10}$` に合致すること
   - 形式不正時は `INVALID_UOM_GROUP_CODE_FORMAT` / `INVALID_UOM_CODE_FORMAT` エラーを返す

4. **コード変更禁止**（Req 3.2, 7.2）
   - 更新時に uom_group_code / uom_code の変更は禁止
   - 変更を試みた場合は `CODE_CHANGE_NOT_ALLOWED` エラーを返す

5. **グループ変更禁止**（Req 7.3）
   - 単位の所属グループ（uom_group_id）の変更は禁止
   - 変更を試みた場合は `GROUP_CHANGE_NOT_ALLOWED` エラーを返す

6. **基準単位の整合性チェック**（Req 3.4）
   - base_uom_id は同一 uom_group に所属する単位のみ設定可能
   - 不正な場合は `BASE_UOM_NOT_IN_GROUP` エラーを返す

7. **基準単位の無効化禁止**（Req 8.3）
   - uom_groups.base_uom_id として設定されている単位は無効化不可
   - 無効化を試みた場合は `CANNOT_DEACTIVATE_BASE_UOM` エラーを返す

8. **品目使用中の単位無効化禁止**（Req 8.4）
   - items.base_uom_id または items.purchase_uom_id で参照されている単位は無効化不可
   - 無効化を試みた場合は `UOM_IN_USE` エラーを返す

9. **単位グループ作成時の基準単位同時作成**（Req 2.4）
   - 単位グループ作成時は、同一トランザクション内で基準単位も作成
   - UUIDを事前に確定し、DEFERRABLE FK制約を使用して循環参照を解決

10. **楽観ロック**（Req 3.5, 7.4）
    - 更新時はversionフィールドを使用した楽観ロックを実装
    - version不一致時は `CONCURRENT_UPDATE` エラーを返す

11. **キーワード検索仕様**（Req 1.2, 5.3）
    - `keyword` パラメータ指定時、以下のフィールドに対して部分一致（LIKE %keyword%）でフィルタ
    - UomGroup: `groupCode` OR `groupName`
    - Uom: `uomCode` OR `uomName`
    - 大文字・小文字は区別しない（Case-insensitive）

**トランザクション境界**

- CreateUomGroup: 1トランザクション（UomGroup INSERT + Uom INSERT + 監査ログ）
- UpdateUomGroup: 1トランザクション（UPDATE + 監査ログ）
- CreateUom: 1トランザクション（INSERT + 監査ログ）
- UpdateUom: 1トランザクション（UPDATE + 監査ログ）
- Activate/Deactivate: 1トランザクション（UPDATE + 監査ログ）
- List/Get/Suggest: トランザクション不要（Read-only）

**監査ログ記録ポイント**（Req 11）

- CreateUomGroup: 単位グループ・基準単位作成時
- UpdateUomGroup: 単位グループ更新時
- Activate/DeactivateUomGroup: 有効化/無効化時
- CreateUom: 単位作成時
- UpdateUom: 単位更新時
- Activate/DeactivateUom: 有効化/無効化時

**権限チェック**（Req 12）

- 一覧・詳細取得: `procure.unit.read` 権限が必要
- 登録・更新・有効化・無効化: `procure.unit.manage` 権限が必要
- 権限不足時は 403 Forbidden を返す

---

### Repository Specification（apps/api）

**Purpose**

- DBアクセス（tenant_id必須）
- RLS連携
- tenant_id double-guard

**Repository Methods - UomGroup**

| Method | Purpose | Input | Output | tenant_id Guard |
|--------|---------|-------|--------|-----------------|
| findMany | 単位グループ一覧取得 | tenantId, offset, limit, sortBy, sortOrder, filters | UomGroup[] | WHERE句 + RLS |
| findOne | 単位グループ詳細取得 | tenantId, groupId | UomGroup \| null | WHERE句 + RLS |
| create | 単位グループ新規登録 | tenantId, CreateUomGroupDto | UomGroup | INSERT値 + RLS |
| update | 単位グループ更新 | tenantId, groupId, UpdateUomGroupDto, version | UomGroup \| null | WHERE句 + RLS |
| checkCodeDuplicate | コード重複チェック | tenantId, groupCode, excludeId? | boolean | WHERE句 |

**Repository Methods - Uom**

| Method | Purpose | Input | Output | tenant_id Guard |
|--------|---------|-------|--------|-----------------|
| findMany | 単位一覧取得 | tenantId, offset, limit, sortBy, sortOrder, filters | Uom[] | WHERE句 + RLS |
| findOne | 単位詳細取得 | tenantId, uomId | Uom \| null | WHERE句 + RLS |
| create | 単位新規登録 | tenantId, CreateUomDto | Uom | INSERT値 + RLS |
| update | 単位更新 | tenantId, uomId, UpdateUomDto, version | Uom \| null | WHERE句 + RLS |
| checkCodeDuplicate | コード重複チェック | tenantId, uomCode, excludeId? | boolean | WHERE句 |
| findByGroupId | グループ内単位取得 | tenantId, groupId | Uom[] | WHERE句 + RLS |
| suggest | 単位サジェスト | tenantId, keyword, groupId?, limit | Uom[] | WHERE句 + RLS |
| isUsedByItems | 品目使用チェック | tenantId, uomId | boolean | WHERE句 |

**tenant_id double-guard（必須）**（Req 10）

- すべてのRepositoryメソッドは `tenant_id` を必須パラメータとして受け取る
- WHERE句に必ず `tenant_id = :tenantId` を含める
- RLSは常に有効とし、set_config による無効化は禁止
- Prismaクエリでは `where: { tenantId, ... }` を明示的に指定

**楽観ロック実装**

- updateメソッドでは、WHERE句に `version = :version` を含める
- 更新件数が0の場合は競合または未存在とみなし、適切なエラーを返す

---

### Contracts Summary（This Feature）

**BFF Contracts（packages/contracts/src/bff/unit-master）**

```typescript
// === Sort Options ===
export type UomGroupSortBy = 'groupCode' | 'groupName' | 'isActive';
export type UomSortBy = 'uomCode' | 'uomName' | 'groupCode' | 'isActive';
export type SortOrder = 'asc' | 'desc';

// === UomGroup DTOs ===
export interface UomGroupDto {
  id: string;
  groupCode: string;
  groupName: string;
  description: string | null;
  baseUomId: string;
  baseUom: UomSummaryDto | null;  // 基準単位の概要情報
  isActive: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
}

export interface UomSummaryDto {
  id: string;
  uomCode: string;
  uomName: string;
}

export interface ListUomGroupsRequest {
  page?: number;
  pageSize?: number;
  sortBy?: UomGroupSortBy;
  sortOrder?: SortOrder;
  keyword?: string;
  isActive?: boolean;
}

export interface ListUomGroupsResponse {
  items: UomGroupDto[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface GetUomGroupResponse {
  group: UomGroupDto;
}

export interface CreateUomGroupRequest {
  groupCode: string;
  groupName: string;
  description?: string;
  baseUomCode: string;   // 基準単位のコード（同時作成）
  baseUomName: string;   // 基準単位の名称（同時作成）
  baseUomSymbol?: string;
}

export interface CreateUomGroupResponse {
  group: UomGroupDto;
}

export interface UpdateUomGroupRequest {
  groupName: string;
  description?: string;
  baseUomId?: string;  // 同一グループ内の別単位に変更可能
  version: number;
}

export interface UpdateUomGroupResponse {
  group: UomGroupDto;
}

export interface ActivateUomGroupRequest {
  version: number;
}

export interface ActivateUomGroupResponse {
  group: UomGroupDto;
}

export interface DeactivateUomGroupRequest {
  version: number;
}

export interface DeactivateUomGroupResponse {
  group: UomGroupDto;
}

// === Uom DTOs ===
export interface UomDto {
  id: string;
  uomCode: string;
  uomName: string;
  uomSymbol: string | null;
  groupId: string;
  groupCode: string;
  groupName: string;
  isBaseUom: boolean;  // この単位が基準単位かどうか（BFF算出）
  isActive: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
}

export interface ListUomsRequest {
  page?: number;
  pageSize?: number;
  sortBy?: UomSortBy;
  sortOrder?: SortOrder;
  keyword?: string;
  groupId?: string;
  isActive?: boolean;
}

export interface ListUomsResponse {
  items: UomDto[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface GetUomResponse {
  uom: UomDto;
}

export interface CreateUomRequest {
  uomCode: string;
  uomName: string;
  uomSymbol?: string;
  groupId: string;
}

export interface CreateUomResponse {
  uom: UomDto;
}

export interface UpdateUomRequest {
  uomName: string;
  uomSymbol?: string;
  version: number;
}

export interface UpdateUomResponse {
  uom: UomDto;
}

export interface ActivateUomRequest {
  version: number;
}

export interface ActivateUomResponse {
  uom: UomDto;
}

export interface DeactivateUomRequest {
  version: number;
}

export interface DeactivateUomResponse {
  uom: UomDto;
}

export interface SuggestUomsRequest {
  keyword: string;
  groupId?: string;
  limit?: number;  // default: 20, max: 20
}

export interface SuggestUomsResponse {
  items: UomDto[];
}
```

**API Contracts（packages/contracts/src/api/unit-master）**

```typescript
// === Sort Options（BFFと同一） ===
export type UomGroupSortBy = 'groupCode' | 'groupName' | 'isActive';
export type UomSortBy = 'uomCode' | 'uomName' | 'groupCode' | 'isActive';
export type SortOrder = 'asc' | 'desc';

// === UomGroup API DTOs ===
export interface UomGroupApiDto {
  id: string;
  groupCode: string;
  groupName: string;
  description: string | null;
  baseUomId: string;
  isActive: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
  createdByLoginAccountId: string | null;
  updatedByLoginAccountId: string | null;
}

export interface ListUomGroupsApiRequest {
  offset: number;
  limit: number;
  sortBy?: UomGroupSortBy;
  sortOrder?: SortOrder;
  keyword?: string;
  isActive?: boolean;
}

export interface ListUomGroupsApiResponse {
  items: UomGroupApiDto[];
  total: number;
}

export interface GetUomGroupApiResponse {
  group: UomGroupApiDto;
}

export interface CreateUomGroupApiRequest {
  groupCode: string;
  groupName: string;
  description?: string;
  baseUomCode: string;
  baseUomName: string;
  baseUomSymbol?: string;
}

export interface CreateUomGroupApiResponse {
  group: UomGroupApiDto;
  baseUom: UomApiDto;
}

export interface UpdateUomGroupApiRequest {
  groupName: string;
  description?: string;
  baseUomId?: string;
  version: number;
}

export interface UpdateUomGroupApiResponse {
  group: UomGroupApiDto;
}

// === Uom API DTOs ===
export interface UomApiDto {
  id: string;
  uomCode: string;
  uomName: string;
  uomSymbol: string | null;
  uomGroupId: string;
  isActive: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
  createdByLoginAccountId: string | null;
  updatedByLoginAccountId: string | null;
}

export interface ListUomsApiRequest {
  offset: number;
  limit: number;
  sortBy?: UomSortBy;
  sortOrder?: SortOrder;
  keyword?: string;
  groupId?: string;
  isActive?: boolean;
}

export interface ListUomsApiResponse {
  items: UomApiDto[];
  total: number;
}

export interface GetUomApiResponse {
  uom: UomApiDto;
}

export interface CreateUomApiRequest {
  uomCode: string;
  uomName: string;
  uomSymbol?: string;
  groupId: string;
}

export interface CreateUomApiResponse {
  uom: UomApiDto;
}

export interface UpdateUomApiRequest {
  uomName: string;
  uomSymbol?: string;
  version: number;
}

export interface UpdateUomApiResponse {
  uom: UomApiDto;
}

export interface SuggestUomsApiRequest {
  keyword: string;
  groupId?: string;
  limit: number;
}

export interface SuggestUomsApiResponse {
  items: UomApiDto[];
}
```

**Error Codes（packages/contracts/src/api/errors/unit-master-error.ts）**

```typescript
export const UnitMasterErrorCode = {
  UOM_GROUP_NOT_FOUND: 'UOM_GROUP_NOT_FOUND',
  UOM_NOT_FOUND: 'UOM_NOT_FOUND',
  UOM_GROUP_CODE_DUPLICATE: 'UOM_GROUP_CODE_DUPLICATE',
  UOM_CODE_DUPLICATE: 'UOM_CODE_DUPLICATE',
  INVALID_UOM_GROUP_CODE_FORMAT: 'INVALID_UOM_GROUP_CODE_FORMAT',
  INVALID_UOM_CODE_FORMAT: 'INVALID_UOM_CODE_FORMAT',
  CODE_CHANGE_NOT_ALLOWED: 'CODE_CHANGE_NOT_ALLOWED',
  GROUP_CHANGE_NOT_ALLOWED: 'GROUP_CHANGE_NOT_ALLOWED',
  BASE_UOM_NOT_IN_GROUP: 'BASE_UOM_NOT_IN_GROUP',
  CANNOT_DEACTIVATE_BASE_UOM: 'CANNOT_DEACTIVATE_BASE_UOM',
  UOM_IN_USE: 'UOM_IN_USE',
  CONCURRENT_UPDATE: 'CONCURRENT_UPDATE',
} as const;

export type UnitMasterErrorCode = typeof UnitMasterErrorCode[keyof typeof UnitMasterErrorCode];

export const UnitMasterErrorHttpStatus: Record<UnitMasterErrorCode, number> = {
  UOM_GROUP_NOT_FOUND: 404,
  UOM_NOT_FOUND: 404,
  UOM_GROUP_CODE_DUPLICATE: 409,
  UOM_CODE_DUPLICATE: 409,
  INVALID_UOM_GROUP_CODE_FORMAT: 422,
  INVALID_UOM_CODE_FORMAT: 422,
  CODE_CHANGE_NOT_ALLOWED: 422,
  GROUP_CHANGE_NOT_ALLOWED: 422,
  BASE_UOM_NOT_IN_GROUP: 422,
  CANNOT_DEACTIVATE_BASE_UOM: 422,
  UOM_IN_USE: 422,
  CONCURRENT_UPDATE: 409,
};

export const UnitMasterErrorMessage: Record<UnitMasterErrorCode, string> = {
  UOM_GROUP_NOT_FOUND: '指定された単位グループが見つかりません',
  UOM_NOT_FOUND: '指定された単位が見つかりません',
  UOM_GROUP_CODE_DUPLICATE: '単位グループコードが既に使用されています',
  UOM_CODE_DUPLICATE: '単位コードが既に使用されています',
  INVALID_UOM_GROUP_CODE_FORMAT: '単位グループコードは英数字大文字と-_のみ、1〜10文字で入力してください',
  INVALID_UOM_CODE_FORMAT: '単位コードは英数字大文字と-_のみ、1〜10文字で入力してください',
  CODE_CHANGE_NOT_ALLOWED: 'コードの変更は許可されていません',
  GROUP_CHANGE_NOT_ALLOWED: '所属グループの変更は許可されていません',
  BASE_UOM_NOT_IN_GROUP: '基準単位は同一グループ内の単位を指定してください',
  CANNOT_DEACTIVATE_BASE_UOM: '基準単位として使用中のため無効化できません',
  UOM_IN_USE: '品目で使用中のため無効化できません',
  CONCURRENT_UPDATE: '他のユーザーによって更新されています。最新データを取得してください',
};
```

---

## Data Model

### Prisma Schema

```prisma
model UomGroup {
  id                        String    @id @default(uuid())
  tenantId                  String    @map("tenant_id")
  uomGroupCode              String    @map("uom_group_code") @db.VarChar(10)
  uomGroupName              String    @map("uom_group_name") @db.VarChar(100)
  description               String?   @db.Text
  baseUomId                 String    @map("base_uom_id")
  isActive                  Boolean   @default(true) @map("is_active")
  version                   Int       @default(1)
  createdAt                 DateTime  @default(now()) @map("created_at")
  updatedAt                 DateTime  @updatedAt @map("updated_at")
  createdByLoginAccountId   String?   @map("created_by_login_account_id")
  updatedByLoginAccountId   String?   @map("updated_by_login_account_id")

  // Relations
  baseUom                   Uom       @relation("GroupBaseUom", fields: [baseUomId], references: [id])
  uoms                      Uom[]     @relation("GroupUoms")

  @@unique([tenantId, uomGroupCode])
  @@index([tenantId])
  @@index([tenantId, uomGroupCode])
  @@index([tenantId, isActive])
  @@map("uom_groups")
}

model Uom {
  id                        String     @id @default(uuid())
  tenantId                  String     @map("tenant_id")
  uomGroupId                String     @map("uom_group_id")
  uomCode                   String     @map("uom_code") @db.VarChar(10)
  uomName                   String     @map("uom_name") @db.VarChar(100)
  uomSymbol                 String?    @map("uom_symbol") @db.VarChar(20)
  isActive                  Boolean    @default(true) @map("is_active")
  version                   Int        @default(1)
  createdAt                 DateTime   @default(now()) @map("created_at")
  updatedAt                 DateTime   @updatedAt @map("updated_at")
  createdByLoginAccountId   String?    @map("created_by_login_account_id")
  updatedByLoginAccountId   String?    @map("updated_by_login_account_id")

  // Relations
  uomGroup                  UomGroup   @relation("GroupUoms", fields: [uomGroupId], references: [id])
  asGroupBaseUom            UomGroup[] @relation("GroupBaseUom")

  @@unique([tenantId, uomCode])
  @@index([tenantId])
  @@index([tenantId, uomGroupId])
  @@index([tenantId, uomCode])
  @@index([tenantId, isActive])
  @@map("uoms")
}
```

**RLS Policy（PostgreSQL）**

```sql
-- uom_groups RLS
ALTER TABLE "uom_groups" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_uom_groups" ON "uom_groups"
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::text);

-- uoms RLS
ALTER TABLE "uoms" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_uoms" ON "uoms"
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::text);
```

**DEFERRABLE FK Constraint（循環参照対応）**

```sql
-- 循環参照のFK制約はDEFERRABLEで定義
ALTER TABLE "uom_groups"
  ADD CONSTRAINT "uom_groups_base_uom_id_fkey"
  FOREIGN KEY ("base_uom_id") REFERENCES "uoms"("id")
  DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "uoms"
  ADD CONSTRAINT "uoms_uom_group_id_fkey"
  FOREIGN KEY ("uom_group_id") REFERENCES "uom_groups"("id")
  DEFERRABLE INITIALLY DEFERRED;
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
- サジェストUI制御（デバウンス含む）
- ビジネス判断は禁止

### BFFの責務

- UI入力の正規化（paging / sorting / filtering）
- Domain API DTO ⇄ UI DTO の変換
- isBaseUom フラグの算出（groupの baseUomId と比較）
- エラーの透過（Pass-through）
- ビジネスルールの正本は持たない

### Domain APIの責務

- ビジネスルールの正本（コード一意性、形式チェック、コード変更禁止、グループ変更禁止、基準単位整合性、使用中チェック）
- 権限・状態遷移の最終判断
- 監査ログ・整合性保証
- 楽観ロックの実装
- 循環参照を含むトランザクション管理

### Repositoryの責務

- DBアクセス（tenant_id必須）
- RLS連携
- tenant_id double-guard
- 品目使用状況チェック（isUsedByItems）

---

## Requirements Traceability

| Req | Summary | Components | Interfaces |
|-----|---------|------------|------------|
| 1.1 | 単位グループ一覧表示 | BFF: ListUomGroups, API: ListUomGroups | GET /groups |
| 1.2 | キーワード検索（グループ） | API: Service keyword filter | ListUomGroupsRequest.keyword |
| 1.3 | 有効/無効フィルタ | API: Service isActive filter | ListUomGroupsRequest.isActive |
| 1.4 | ソート（グループ） | BFF: sortBy whitelist | UomGroupSortBy |
| 1.5 | ページネーション | BFF: page/pageSize normalization | ListUomGroupsResponse |
| 2.1 | 単位グループ登録 | BFF: CreateUomGroup, API: CreateUomGroup | POST /groups |
| 2.2 | グループコード形式検証 | API: Service validation | INVALID_UOM_GROUP_CODE_FORMAT |
| 2.3 | グループコード重複検証 | API: Repository checkCodeDuplicate | UOM_GROUP_CODE_DUPLICATE |
| 2.4 | 基準単位同時作成 | API: Service transaction | CreateUomGroupApiResponse |
| 2.5 | 監査情報記録（作成） | API: Service audit | created_at, created_by |
| 3.1 | 単位グループ更新 | BFF: UpdateUomGroup, API: UpdateUomGroup | PUT /groups/:id |
| 3.2 | グループコード変更禁止 | API: Service validation | CODE_CHANGE_NOT_ALLOWED |
| 3.3 | 基準単位変更 | API: Service baseUomId update | UpdateUomGroupRequest.baseUomId |
| 3.4 | 基準単位グループ整合性 | API: Service validation | BASE_UOM_NOT_IN_GROUP |
| 3.5 | 楽観ロック（グループ） | API: Repository version check | CONCURRENT_UPDATE |
| 3.6 | 監査情報記録（更新） | API: Service audit | updated_at, updated_by |
| 4.1 | 単位グループ無効化 | BFF: DeactivateUomGroup | PATCH /groups/:id/deactivate |
| 4.2 | 単位グループ有効化 | BFF: ActivateUomGroup | PATCH /groups/:id/activate |
| 4.3 | 無効化時警告（有効単位存在） | UI: confirmation dialog | - |
| 4.4 | 物理削除禁止 | API: Service is_active update | - |
| 5.1 | 単位一覧表示 | BFF: ListUoms, API: ListUoms | GET /uoms |
| 5.2 | グループフィルタ | API: Service groupId filter | ListUomsRequest.groupId |
| 5.3 | キーワード検索（単位） | API: Service keyword filter | ListUomsRequest.keyword |
| 5.4 | ソート（単位） | BFF: sortBy whitelist | UomSortBy |
| 5.5 | 基準単位表示 | BFF: isBaseUom flag | UomDto.isBaseUom |
| 6.1 | 単位登録 | BFF: CreateUom, API: CreateUom | POST /uoms |
| 6.2 | 単位コード形式検証 | API: Service validation | INVALID_UOM_CODE_FORMAT |
| 6.3 | 単位コード重複検証 | API: Repository checkCodeDuplicate | UOM_CODE_DUPLICATE |
| 6.4 | 記号（任意）登録 | API: Service uomSymbol | CreateUomRequest.uomSymbol |
| 6.5 | 監査情報記録（作成） | API: Service audit | created_at, created_by |
| 7.1 | 単位更新 | BFF: UpdateUom, API: UpdateUom | PUT /uoms/:id |
| 7.2 | 単位コード変更禁止 | API: Service validation | CODE_CHANGE_NOT_ALLOWED |
| 7.3 | グループ変更禁止 | API: Service validation | GROUP_CHANGE_NOT_ALLOWED |
| 7.4 | 楽観ロック（単位） | API: Repository version check | CONCURRENT_UPDATE |
| 7.5 | 監査情報記録（更新） | API: Service audit | updated_at, updated_by |
| 8.1 | 単位無効化 | BFF: DeactivateUom | PATCH /uoms/:id/deactivate |
| 8.2 | 単位有効化 | BFF: ActivateUom | PATCH /uoms/:id/activate |
| 8.3 | 基準単位無効化禁止 | API: Service validation | CANNOT_DEACTIVATE_BASE_UOM |
| 8.4 | 品目使用中無効化禁止 | API: Repository isUsedByItems | UOM_IN_USE |
| 8.5 | 物理削除禁止 | API: Service is_active update | - |
| 9.1 | 単位サジェスト | BFF: SuggestUoms, API: SuggestUoms | GET /uoms/suggest |
| 9.2 | グループ指定サジェスト | API: Service groupId filter | SuggestUomsRequest.groupId |
| 9.3 | 最大20件制限 | BFF/API: limit clamp | SuggestUomsRequest.limit |
| 10.1 | tenant_idフィルタ | Repository: all methods | WHERE tenant_id |
| 10.2 | RLS強制 | DB: RLS policy | tenant_isolation |
| 10.3 | 他テナントアクセス拒否 | API: NOT_FOUND返却 | 404 |
| 11.1 | 監査情報記録（作成） | API: Service | created_at, created_by |
| 11.2 | 監査情報記録（更新） | API: Service | updated_at, updated_by |
| 11.3 | 監査ログ内容 | API: Service audit log | user_id, tenant_id, operation |
| 12.1 | 読取権限チェック | API: Guard procure.unit.read | 403 Forbidden |
| 12.2 | 管理権限チェック | API: Guard procure.unit.manage | 403 Forbidden |
| 12.3 | 権限不足時エラー | API: Guard | 403 Forbidden |
| 12.4 | UI/API権限一致 | API: Guard | - |

---

## 非機能要件

### パフォーマンス

- 一覧取得はページネーションを必須とし、デフォルト50件、最大200件まで
- サジェストは最大20件
- インデックス: tenantId + uomGroupCode, tenantId + uomCode, tenantId + isActive

### セキュリティ

- すべての操作はテナント単位で分離（RLS + Repository double-guard）
- 権限チェック: procure.unit.read / procure.unit.manage

### 監査

- 作成・更新・有効化・無効化操作は監査ログに記録

### 可用性

- 楽観ロックによる同時更新の競合制御

---

（以上）
