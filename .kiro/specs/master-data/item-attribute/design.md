# Design Document: 品目仕様属性マスタ（Item Attribute Master）

**Purpose**: 品目仕様属性マスタの登録・照会・編集機能を実装するための設計仕様。UI要件に最適化したBFF APIと、ビジネスルールを保持するDomain APIの責務を明確化する。

## Overview

本機能は、ProcurERPにおける品目仕様属性（ItemAttribute）および属性値（ItemAttributeValue）の登録・照会・編集を提供する。品目マスタにおいてSKU（バリエーション）を作成する際に、仕様属性と属性値を選択してSKUの仕様を確定するための基盤マスタとして機能する。

品目仕様属性マスタは以下の機能を提供する：

- 仕様属性一覧表示・登録・編集・無効化
- 属性値一覧表示・登録・編集・無効化
- 仕様属性サジェスト（品目SKU作成時）
- 属性値サジェスト（品目SKU作成時）
- 属性コードのバリデーション（英数字大文字 + `-_` のみ、1〜20文字）
- 値コードのバリデーション（英数字大文字 + `-_` のみ、1〜30文字）

マルチテナント対応として、すべての操作はテナント単位で分離され、RLS（Row Level Security）により保護される。マスタ系データのため、楽観ロック（version）を採用する。

---

## Architecture

### Architecture Pattern & Boundary Map

**Pattern (fixed)**:

- UI（apps/web） → BFF（apps/bff） → Domain API（apps/api） → DB（PostgreSQL + RLS）
- UI直APIは禁止

**Contracts (SSoT)**:

- UI ↔ BFF: `packages/contracts/src/bff/item-attribute`
- BFF ↔ Domain API: `packages/contracts/src/api/item-attribute`
- Error: `packages/contracts/src/api/errors/item-attribute-error.ts`
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
| GET | `/api/bff/master-data/item-attribute/attributes` | 仕様属性一覧取得 | `ListItemAttributesRequest` | `ListItemAttributesResponse` | ページネーション・ソート対応 |
| GET | `/api/bff/master-data/item-attribute/attributes/:id` | 仕様属性詳細取得 | - | `GetItemAttributeResponse` | IDはUUID |
| POST | `/api/bff/master-data/item-attribute/attributes` | 仕様属性新規登録 | `CreateItemAttributeRequest` | `CreateItemAttributeResponse` | |
| PUT | `/api/bff/master-data/item-attribute/attributes/:id` | 仕様属性更新 | `UpdateItemAttributeRequest` | `UpdateItemAttributeResponse` | 楽観ロック（version） |
| PATCH | `/api/bff/master-data/item-attribute/attributes/:id/activate` | 仕様属性有効化 | `ActivateItemAttributeRequest` | `ActivateItemAttributeResponse` | is_active = true |
| PATCH | `/api/bff/master-data/item-attribute/attributes/:id/deactivate` | 仕様属性無効化 | `DeactivateItemAttributeRequest` | `DeactivateItemAttributeResponse` | is_active = false |
| GET | `/api/bff/master-data/item-attribute/attributes/:id/values` | 属性値一覧取得 | `ListItemAttributeValuesRequest` | `ListItemAttributeValuesResponse` | 仕様属性配下の値一覧 |
| POST | `/api/bff/master-data/item-attribute/attributes/:id/values` | 属性値新規登録 | `CreateItemAttributeValueRequest` | `CreateItemAttributeValueResponse` | |
| GET | `/api/bff/master-data/item-attribute/values/:id` | 属性値詳細取得 | - | `GetItemAttributeValueResponse` | |
| PUT | `/api/bff/master-data/item-attribute/values/:id` | 属性値更新 | `UpdateItemAttributeValueRequest` | `UpdateItemAttributeValueResponse` | 楽観ロック（version） |
| PATCH | `/api/bff/master-data/item-attribute/values/:id/activate` | 属性値有効化 | `ActivateItemAttributeValueRequest` | `ActivateItemAttributeValueResponse` | is_active = true |
| PATCH | `/api/bff/master-data/item-attribute/values/:id/deactivate` | 属性値無効化 | `DeactivateItemAttributeValueRequest` | `DeactivateItemAttributeValueResponse` | is_active = false |
| GET | `/api/bff/master-data/item-attribute/attributes/suggest` | 仕様属性サジェスト | `SuggestItemAttributesRequest` | `SuggestItemAttributesResponse` | 最大20件 |
| GET | `/api/bff/master-data/item-attribute/values/suggest` | 属性値サジェスト | `SuggestItemAttributeValuesRequest` | `SuggestItemAttributeValuesResponse` | 最大20件 |

**Naming Convention（必須）**

- DTO / Contracts: camelCase（例: `attributeCode`, `attributeName`, `valueCode`, `valueName`）
- DB columns: snake_case（例: `item_attribute_code`, `item_attribute_name`, `value_code`, `value_name`）
- `sortBy` は **DTO側キー**を採用する（例: `attributeCode | attributeName | sortOrder | isActive`）
- DB列名（snake_case）を UI/BFF へ露出させない

**Paging / Sorting Normalization（必須・BFF責務）**

- UI/BFF: page / pageSize（page-based）
- Domain API: offset / limit（DB-friendly）
- BFFは必ず以下を実施する（省略禁止）：
  - defaults: page=1, pageSize=50, sortBy=sortOrder, sortOrder=asc
  - clamp: pageSize <= 200
  - whitelist:
    - ItemAttribute: sortBy は `attributeCode | attributeName | sortOrder | isActive` のみ
    - ItemAttributeValue: sortBy は `valueCode | valueName | sortOrder | isActive` のみ
  - normalize: keyword trim、空→undefined
  - transform: offset=(page-1)*pageSize, limit=pageSize
- Domain APIに渡すのは offset/limit（page/pageSizeは渡さない）
- BFFレスポンスには page/pageSize を含める（UIへ返すのはBFF側の値）

**Transformation Rules（api DTO → bff DTO）**

- 方針：field rename/omit/default の有無
  - API DTOのフィールド名をそのままBFF DTOにマッピング（camelCase統一）
  - 日付フィールド（createdAt, updatedAt）はISO 8601文字列として扱う
  - versionフィールドはBFFレスポンスに含める（楽観ロック用）
  - valueCount（属性値件数）はBFF側で算出して付与
- BFFレスポンスに page/pageSize を含める（UIに返すのはBFF値）

**Error Handling（contracts errorに準拠）**

**Error Policy（必須・未記載禁止）**

- この Feature における BFF の Error Policy は以下とする：
  - 採用方針：**Option A: Pass-through**
  - 採用理由：
    - 品目仕様属性マスタは比較的シンプルなCRUD操作であり、Domain APIのエラーをそのままUIに伝えることで十分
    - UI側でエラーメッセージを適切に表示できる設計とする
    - BFF側での意味的な再分類は不要

**Option A: Pass-through（基本・推奨）**

- Domain APIのエラーを原則そのまま返す（status / code / message / details）
- BFF側での意味的な再分類・書き換えは禁止（ログ付与等の非機能は除く）
- UIは `contracts/bff/errors` に基づいて表示制御を行う

**In all cases**

- 最終拒否権限（403/404/409/422等）は Domain API が持つ

**Error Contract Definition**

- BFFは独自のエラーコードを定義せず、Domain APIのエラー定義 (`packages/contracts/src/api/errors/item-attribute-error.ts`) を `packages/contracts/src/bff/errors/item-attribute-error.ts` にて Re-export して使用する。
- これにより、APIとBFFでエラーコード（`ITEM_ATTRIBUTE_CODE_DUPLICATE` 等）の完全な一致を保証する。

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

**Usecases - ItemAttribute**

| Usecase | Method | Purpose | Input | Output | Transaction Boundary |
|---------|--------|---------|-------|--------|---------------------|
| ListItemAttributes | GET | 仕様属性一覧取得 | tenantId, offset, limit, sortBy, sortOrder, filters | ItemAttribute[] | Read-only |
| GetItemAttribute | GET | 仕様属性詳細取得 | tenantId, attributeId | ItemAttribute | Read-only |
| CreateItemAttribute | POST | 仕様属性新規登録 | tenantId, userId, CreateItemAttributeDto | ItemAttribute | Single transaction |
| UpdateItemAttribute | PUT | 仕様属性更新 | tenantId, userId, attributeId, UpdateItemAttributeDto, version | ItemAttribute | Single transaction |
| ActivateItemAttribute | PATCH | 仕様属性有効化 | tenantId, userId, attributeId, version | ItemAttribute | Single transaction |
| DeactivateItemAttribute | PATCH | 仕様属性無効化 | tenantId, userId, attributeId, version | ItemAttribute | Single transaction |
| SuggestItemAttributes | GET | 仕様属性サジェスト | tenantId, keyword | ItemAttribute[] | Read-only |

**Usecases - ItemAttributeValue**

| Usecase | Method | Purpose | Input | Output | Transaction Boundary |
|---------|--------|---------|-------|--------|---------------------|
| ListItemAttributeValues | GET | 属性値一覧取得 | tenantId, attributeId, offset, limit, sortBy, sortOrder, filters | ItemAttributeValue[] | Read-only |
| GetItemAttributeValue | GET | 属性値詳細取得 | tenantId, valueId | ItemAttributeValue | Read-only |
| CreateItemAttributeValue | POST | 属性値新規登録 | tenantId, userId, attributeId, CreateItemAttributeValueDto | ItemAttributeValue | Single transaction |
| UpdateItemAttributeValue | PUT | 属性値更新 | tenantId, userId, valueId, UpdateItemAttributeValueDto, version | ItemAttributeValue | Single transaction |
| ActivateItemAttributeValue | PATCH | 属性値有効化 | tenantId, userId, valueId, version | ItemAttributeValue | Single transaction |
| DeactivateItemAttributeValue | PATCH | 属性値無効化 | tenantId, userId, valueId, version | ItemAttributeValue | Single transaction |
| SuggestItemAttributeValues | GET | 属性値サジェスト | tenantId, attributeId?, keyword | ItemAttributeValue[] | Read-only |

**主要ビジネスルール**

1. **仕様属性コードの一意性チェック**（Req 2.3）
   - 同一テナント内で item_attribute_code は一意でなければならない
   - 新規登録時：重複チェックを実行
   - 重複時は `ITEM_ATTRIBUTE_CODE_DUPLICATE` エラーを返す

2. **属性値コードの一意性チェック**（Req 6.3）
   - 同一テナント・同一仕様属性内で value_code は一意でなければならない
   - 新規登録時：重複チェックを実行
   - 重複時は `VALUE_CODE_DUPLICATE` エラーを返す

3. **属性コード形式バリデーション**（Req 2.2）
   - item_attribute_code は `^[A-Z0-9_-]{1,20}$` に合致すること
   - 形式不正時は `INVALID_ATTRIBUTE_CODE_FORMAT` エラーを返す

4. **値コード形式バリデーション**（Req 6.2）
   - value_code は `^[A-Z0-9_-]{1,30}$` に合致すること
   - 形式不正時は `INVALID_VALUE_CODE_FORMAT` エラーを返す

5. **コード変更禁止**（Req 3.2, 7.2）
   - 更新時に item_attribute_code / value_code の変更は禁止
   - 変更を試みた場合は `CODE_CHANGE_NOT_ALLOWED` エラーを返す

6. **使用中チェック（仕様属性無効化時）**（Req 4.3）
   - item_variant_attributes で参照されている仕様属性は警告表示後に無効化可能
   - 使用中の場合は `ATTRIBUTE_IN_USE` 警告を返す（確認後続行可）

7. **使用中チェック（属性値無効化時）**（Req 8.3）
   - item_variant_attributes で参照されている属性値は警告表示後に無効化可能
   - 使用中の場合は `VALUE_IN_USE` 警告を返す（確認後続行可）

8. **楽観ロック**（Req 3.3, 7.3）
   - 更新時はversionフィールドを使用した楽観ロックを実装
   - version不一致時は `CONCURRENT_UPDATE` エラーを返す

9. **キーワード検索仕様**（Req 1.2, 5.2）
   - `keyword` パラメータ指定時、以下のフィールドに対して部分一致（LIKE %keyword%）でフィルタ
   - ItemAttribute: `attributeCode` OR `attributeName`
   - ItemAttributeValue: `valueCode` OR `valueName`
   - 大文字・小文字は区別しない（Case-insensitive）

10. **value_type 固定**（Req 2.5）
    - MVPでは value_type は 'SELECT' 固定
    - 登録時に自動設定、更新時に変更不可

**トランザクション境界**

- CreateItemAttribute: 1トランザクション（INSERT + 監査ログ）
- UpdateItemAttribute: 1トランザクション（UPDATE + 監査ログ）
- CreateItemAttributeValue: 1トランザクション（INSERT + 監査ログ）
- UpdateItemAttributeValue: 1トランザクション（UPDATE + 監査ログ）
- Activate/Deactivate: 1トランザクション（UPDATE + 監査ログ）
- List/Get/Suggest: トランザクション不要（Read-only）

**監査ログ記録ポイント**（Req 12）

- CreateItemAttribute: 仕様属性作成時
- UpdateItemAttribute: 仕様属性更新時
- Activate/DeactivateItemAttribute: 有効化/無効化時
- CreateItemAttributeValue: 属性値作成時
- UpdateItemAttributeValue: 属性値更新時
- Activate/DeactivateItemAttributeValue: 有効化/無効化時

**権限チェック**（Req 13）

- 一覧・詳細取得: `procure.item-attribute.read` 権限が必要
- 登録・更新・有効化・無効化: `procure.item-attribute.manage` 権限が必要
- 権限不足時は 403 Forbidden を返す

---

### Repository Specification（apps/api）

**Purpose**

- DBアクセス（tenant_id必須）
- RLS連携
- tenant_id double-guard

**Repository Methods - ItemAttribute**

| Method | Purpose | Input | Output | tenant_id Guard |
|--------|---------|-------|--------|-----------------|
| findMany | 仕様属性一覧取得 | tenantId, offset, limit, sortBy, sortOrder, filters | ItemAttribute[] | WHERE句 + RLS |
| findOne | 仕様属性詳細取得 | tenantId, attributeId | ItemAttribute \| null | WHERE句 + RLS |
| create | 仕様属性新規登録 | tenantId, CreateItemAttributeDto | ItemAttribute | INSERT値 + RLS |
| update | 仕様属性更新 | tenantId, attributeId, UpdateItemAttributeDto, version | ItemAttribute \| null | WHERE句 + RLS |
| checkCodeDuplicate | コード重複チェック | tenantId, attributeCode, excludeId? | boolean | WHERE句 |
| countValues | 属性値件数取得 | tenantId, attributeId | number | WHERE句 |
| suggest | 仕様属性サジェスト | tenantId, keyword, limit | ItemAttribute[] | WHERE句 + RLS |
| isUsedByVariants | SKU使用チェック | tenantId, attributeId | boolean | WHERE句 |

**Repository Methods - ItemAttributeValue**

| Method | Purpose | Input | Output | tenant_id Guard |
|--------|---------|-------|--------|-----------------|
| findMany | 属性値一覧取得 | tenantId, attributeId, offset, limit, sortBy, sortOrder, filters | ItemAttributeValue[] | WHERE句 + RLS |
| findOne | 属性値詳細取得 | tenantId, valueId | ItemAttributeValue \| null | WHERE句 + RLS |
| create | 属性値新規登録 | tenantId, CreateItemAttributeValueDto | ItemAttributeValue | INSERT値 + RLS |
| update | 属性値更新 | tenantId, valueId, UpdateItemAttributeValueDto, version | ItemAttributeValue \| null | WHERE句 + RLS |
| checkCodeDuplicate | コード重複チェック | tenantId, attributeId, valueCode, excludeId? | boolean | WHERE句 |
| suggest | 属性値サジェスト | tenantId, attributeId?, keyword, limit | ItemAttributeValue[] | WHERE句 + RLS |
| isUsedByVariants | SKU使用チェック | tenantId, valueId | boolean | WHERE句 |

**tenant_id double-guard（必須）**（Req 11）

- すべてのRepositoryメソッドは `tenant_id` を必須パラメータとして受け取る
- WHERE句に必ず `tenant_id = :tenantId` を含める
- RLSは常に有効とし、set_config による無効化は禁止
- Prismaクエリでは `where: { tenantId, ... }` を明示的に指定

**楽観ロック実装**

- updateメソッドでは、WHERE句に `version = :version` を含める
- 更新件数が0の場合は競合または未存在とみなし、適切なエラーを返す

---

### Contracts Summary（This Feature）

**BFF Contracts（packages/contracts/src/bff/item-attribute）**

```typescript
// === Sort Options ===
export type ItemAttributeSortBy = 'attributeCode' | 'attributeName' | 'sortOrder' | 'isActive';
export type ItemAttributeValueSortBy = 'valueCode' | 'valueName' | 'sortOrder' | 'isActive';
export type SortOrder = 'asc' | 'desc';

// === ItemAttribute DTOs ===
export interface ItemAttributeDto {
  id: string;
  attributeCode: string;
  attributeName: string;
  valueType: string;
  sortOrder: number;
  isActive: boolean;
  valueCount: number;  // 属性値件数（BFF算出）
  version: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
}

export interface ListItemAttributesRequest {
  page?: number;
  pageSize?: number;
  sortBy?: ItemAttributeSortBy;
  sortOrder?: SortOrder;
  keyword?: string;
  isActive?: boolean;
}

export interface ListItemAttributesResponse {
  items: ItemAttributeDto[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface GetItemAttributeResponse {
  attribute: ItemAttributeDto;
}

export interface CreateItemAttributeRequest {
  attributeCode: string;
  attributeName: string;
  sortOrder?: number;
}

export interface CreateItemAttributeResponse {
  attribute: ItemAttributeDto;
}

export interface UpdateItemAttributeRequest {
  attributeName: string;
  sortOrder?: number;
  version: number;
}

export interface UpdateItemAttributeResponse {
  attribute: ItemAttributeDto;
}

export interface ActivateItemAttributeRequest {
  version: number;
}

export interface ActivateItemAttributeResponse {
  attribute: ItemAttributeDto;
}

export interface DeactivateItemAttributeRequest {
  version: number;
  force?: boolean;  // 使用中でも強制無効化
}

export interface DeactivateItemAttributeResponse {
  attribute: ItemAttributeDto;
  warning?: {
    code: 'ATTRIBUTE_IN_USE';
    message: string;
    usageCount: number;
  };
}

export interface SuggestItemAttributesRequest {
  keyword: string;
  limit?: number;  // default: 20, max: 20
}

export interface SuggestItemAttributesResponse {
  items: ItemAttributeDto[];
}

// === ItemAttributeValue DTOs ===
export interface ItemAttributeValueDto {
  id: string;
  attributeId: string;
  attributeCode: string;
  attributeName: string;
  valueCode: string;
  valueName: string;
  sortOrder: number;
  isActive: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
}

export interface ListItemAttributeValuesRequest {
  page?: number;
  pageSize?: number;
  sortBy?: ItemAttributeValueSortBy;
  sortOrder?: SortOrder;
  keyword?: string;
  isActive?: boolean;
}

export interface ListItemAttributeValuesResponse {
  items: ItemAttributeValueDto[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface GetItemAttributeValueResponse {
  value: ItemAttributeValueDto;
}

export interface CreateItemAttributeValueRequest {
  valueCode: string;
  valueName: string;
  sortOrder?: number;
}

export interface CreateItemAttributeValueResponse {
  value: ItemAttributeValueDto;
}

export interface UpdateItemAttributeValueRequest {
  valueName: string;
  sortOrder?: number;
  version: number;
}

export interface UpdateItemAttributeValueResponse {
  value: ItemAttributeValueDto;
}

export interface ActivateItemAttributeValueRequest {
  version: number;
}

export interface ActivateItemAttributeValueResponse {
  value: ItemAttributeValueDto;
}

export interface DeactivateItemAttributeValueRequest {
  version: number;
  force?: boolean;  // 使用中でも強制無効化
}

export interface DeactivateItemAttributeValueResponse {
  value: ItemAttributeValueDto;
  warning?: {
    code: 'VALUE_IN_USE';
    message: string;
    usageCount: number;
  };
}

export interface SuggestItemAttributeValuesRequest {
  attributeId?: string;  // 特定属性内に限定
  keyword: string;
  limit?: number;  // default: 20, max: 20
}

export interface SuggestItemAttributeValuesResponse {
  items: ItemAttributeValueDto[];
}
```

**API Contracts（packages/contracts/src/api/item-attribute）**

```typescript
// === Sort Options（BFFと同一） ===
export type ItemAttributeSortBy = 'attributeCode' | 'attributeName' | 'sortOrder' | 'isActive';
export type ItemAttributeValueSortBy = 'valueCode' | 'valueName' | 'sortOrder' | 'isActive';
export type SortOrder = 'asc' | 'desc';

// === ItemAttribute API DTOs ===
export interface ItemAttributeApiDto {
  id: string;
  attributeCode: string;
  attributeName: string;
  valueType: string;
  sortOrder: number;
  isActive: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
  createdByLoginAccountId: string | null;
  updatedByLoginAccountId: string | null;
}

export interface ListItemAttributesApiRequest {
  offset: number;
  limit: number;
  sortBy?: ItemAttributeSortBy;
  sortOrder?: SortOrder;
  keyword?: string;
  isActive?: boolean;
}

export interface ListItemAttributesApiResponse {
  items: ItemAttributeApiDto[];
  total: number;
}

export interface GetItemAttributeApiResponse {
  attribute: ItemAttributeApiDto;
}

export interface CreateItemAttributeApiRequest {
  attributeCode: string;
  attributeName: string;
  sortOrder?: number;
}

export interface CreateItemAttributeApiResponse {
  attribute: ItemAttributeApiDto;
}

export interface UpdateItemAttributeApiRequest {
  attributeName: string;
  sortOrder?: number;
  version: number;
}

export interface UpdateItemAttributeApiResponse {
  attribute: ItemAttributeApiDto;
}

// === ItemAttributeValue API DTOs ===
export interface ItemAttributeValueApiDto {
  id: string;
  itemAttributeId: string;
  valueCode: string;
  valueName: string;
  sortOrder: number;
  isActive: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
  createdByLoginAccountId: string | null;
  updatedByLoginAccountId: string | null;
}

export interface ListItemAttributeValuesApiRequest {
  offset: number;
  limit: number;
  sortBy?: ItemAttributeValueSortBy;
  sortOrder?: SortOrder;
  keyword?: string;
  isActive?: boolean;
}

export interface ListItemAttributeValuesApiResponse {
  items: ItemAttributeValueApiDto[];
  total: number;
}

export interface GetItemAttributeValueApiResponse {
  value: ItemAttributeValueApiDto;
}

export interface CreateItemAttributeValueApiRequest {
  valueCode: string;
  valueName: string;
  sortOrder?: number;
}

export interface CreateItemAttributeValueApiResponse {
  value: ItemAttributeValueApiDto;
}

export interface UpdateItemAttributeValueApiRequest {
  valueName: string;
  sortOrder?: number;
  version: number;
}

export interface UpdateItemAttributeValueApiResponse {
  value: ItemAttributeValueApiDto;
}

export interface SuggestItemAttributeValuesApiRequest {
  attributeId?: string;
  keyword: string;
  limit: number;
}

export interface SuggestItemAttributeValuesApiResponse {
  items: ItemAttributeValueApiDto[];
}
```

**Error Codes（packages/contracts/src/api/errors/item-attribute-error.ts）**

```typescript
export const ItemAttributeErrorCode = {
  ITEM_ATTRIBUTE_NOT_FOUND: 'ITEM_ATTRIBUTE_NOT_FOUND',
  ITEM_ATTRIBUTE_VALUE_NOT_FOUND: 'ITEM_ATTRIBUTE_VALUE_NOT_FOUND',
  ITEM_ATTRIBUTE_CODE_DUPLICATE: 'ITEM_ATTRIBUTE_CODE_DUPLICATE',
  VALUE_CODE_DUPLICATE: 'VALUE_CODE_DUPLICATE',
  INVALID_ATTRIBUTE_CODE_FORMAT: 'INVALID_ATTRIBUTE_CODE_FORMAT',
  INVALID_VALUE_CODE_FORMAT: 'INVALID_VALUE_CODE_FORMAT',
  CODE_CHANGE_NOT_ALLOWED: 'CODE_CHANGE_NOT_ALLOWED',
  ATTRIBUTE_IN_USE: 'ATTRIBUTE_IN_USE',
  VALUE_IN_USE: 'VALUE_IN_USE',
  CONCURRENT_UPDATE: 'CONCURRENT_UPDATE',
} as const;

export type ItemAttributeErrorCode = typeof ItemAttributeErrorCode[keyof typeof ItemAttributeErrorCode];

export const ItemAttributeErrorHttpStatus: Record<ItemAttributeErrorCode, number> = {
  ITEM_ATTRIBUTE_NOT_FOUND: 404,
  ITEM_ATTRIBUTE_VALUE_NOT_FOUND: 404,
  ITEM_ATTRIBUTE_CODE_DUPLICATE: 409,
  VALUE_CODE_DUPLICATE: 409,
  INVALID_ATTRIBUTE_CODE_FORMAT: 422,
  INVALID_VALUE_CODE_FORMAT: 422,
  CODE_CHANGE_NOT_ALLOWED: 422,
  ATTRIBUTE_IN_USE: 422,
  VALUE_IN_USE: 422,
  CONCURRENT_UPDATE: 409,
};

export const ItemAttributeErrorMessage: Record<ItemAttributeErrorCode, string> = {
  ITEM_ATTRIBUTE_NOT_FOUND: '指定された仕様属性が見つかりません',
  ITEM_ATTRIBUTE_VALUE_NOT_FOUND: '指定された属性値が見つかりません',
  ITEM_ATTRIBUTE_CODE_DUPLICATE: '仕様属性コードが既に使用されています',
  VALUE_CODE_DUPLICATE: '同一仕様属性内で属性値コードが重複しています',
  INVALID_ATTRIBUTE_CODE_FORMAT: '仕様属性コードは英数字大文字と-_のみ、1〜20文字で入力してください',
  INVALID_VALUE_CODE_FORMAT: '属性値コードは英数字大文字と-_のみ、1〜30文字で入力してください',
  CODE_CHANGE_NOT_ALLOWED: 'コードの変更は許可されていません',
  ATTRIBUTE_IN_USE: 'この仕様属性はSKU仕様で使用されています',
  VALUE_IN_USE: 'この属性値はSKU仕様で使用されています',
  CONCURRENT_UPDATE: '他のユーザーによって更新されています。最新データを取得してください',
};
```

---

## Data Model

### Prisma Schema

```prisma
model ItemAttribute {
  id                        String    @id @default(uuid())
  tenantId                  String    @map("tenant_id")
  itemAttributeCode         String    @map("item_attribute_code") @db.VarChar(20)
  itemAttributeName         String    @map("item_attribute_name") @db.VarChar(100)
  valueType                 String    @default("SELECT") @map("value_type") @db.VarChar(20)
  sortOrder                 Int       @default(0) @map("sort_order")
  isActive                  Boolean   @default(true) @map("is_active")
  version                   Int       @default(1)
  createdAt                 DateTime  @default(now()) @map("created_at")
  updatedAt                 DateTime  @updatedAt @map("updated_at")
  createdByLoginAccountId   String?   @map("created_by_login_account_id")
  updatedByLoginAccountId   String?   @map("updated_by_login_account_id")

  // Relations
  values                    ItemAttributeValue[]

  @@unique([tenantId, itemAttributeCode])
  @@index([tenantId])
  @@index([tenantId, itemAttributeCode])
  @@index([tenantId, isActive])
  @@index([tenantId, sortOrder])
  @@map("item_attributes")
}

model ItemAttributeValue {
  id                        String     @id @default(uuid())
  tenantId                  String     @map("tenant_id")
  itemAttributeId           String     @map("item_attribute_id")
  valueCode                 String     @map("value_code") @db.VarChar(30)
  valueName                 String     @map("value_name") @db.VarChar(100)
  sortOrder                 Int        @default(0) @map("sort_order")
  isActive                  Boolean    @default(true) @map("is_active")
  version                   Int        @default(1)
  createdAt                 DateTime   @default(now()) @map("created_at")
  updatedAt                 DateTime   @updatedAt @map("updated_at")
  createdByLoginAccountId   String?    @map("created_by_login_account_id")
  updatedByLoginAccountId   String?    @map("updated_by_login_account_id")

  // Relations
  itemAttribute             ItemAttribute @relation(fields: [itemAttributeId], references: [id])

  @@unique([tenantId, itemAttributeId, valueCode])
  @@index([tenantId])
  @@index([tenantId, itemAttributeId])
  @@index([tenantId, itemAttributeId, valueCode])
  @@index([tenantId, isActive])
  @@map("item_attribute_values")
}
```

**RLS Policy（PostgreSQL）**

```sql
-- item_attributes RLS
ALTER TABLE "item_attributes" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_item_attributes" ON "item_attributes"
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::text);

-- item_attribute_values RLS
ALTER TABLE "item_attribute_values" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_item_attribute_values" ON "item_attribute_values"
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
- サジェストUI制御（デバウンス含む）
- ビジネス判断は禁止

### BFFの責務

- UI入力の正規化（paging / sorting / filtering）
- Domain API DTO ⇄ UI DTO の変換
- valueCount（属性値件数）の算出・付与
- エラーの透過（Pass-through）
- ビジネスルールの正本は持たない

### Domain APIの責務

- ビジネスルールの正本（コード一意性、形式チェック、コード変更禁止、使用中チェック）
- 権限・状態遷移の最終判断
- 監査ログ・整合性保証
- 楽観ロックの実装
- value_type='SELECT' 固定の強制

### Repositoryの責務

- DBアクセス（tenant_id必須）
- RLS連携
- tenant_id double-guard
- SKU使用状況チェック（isUsedByVariants）

---

## Requirements Traceability

| Req | Summary | Components | Interfaces |
|-----|---------|------------|------------|
| 1.1 | 仕様属性一覧表示 | BFF: ListItemAttributes, API: ListItemAttributes | GET /attributes |
| 1.2 | キーワード検索（属性） | API: Service keyword filter | ListItemAttributesRequest.keyword |
| 1.3 | 有効/無効フィルタ | API: Service isActive filter | ListItemAttributesRequest.isActive |
| 1.4 | ソート（属性） | BFF: sortBy whitelist | ItemAttributeSortBy |
| 1.5 | ページネーション | BFF: page/pageSize normalization | ListItemAttributesResponse |
| 1.6 | 属性値件数表示 | BFF: valueCount calculation | ItemAttributeDto.valueCount |
| 2.1 | 仕様属性登録 | BFF: CreateItemAttribute, API: CreateItemAttribute | POST /attributes |
| 2.2 | 属性コード形式検証 | API: Service validation | INVALID_ATTRIBUTE_CODE_FORMAT |
| 2.3 | 属性コード重複検証 | API: Repository checkCodeDuplicate | ITEM_ATTRIBUTE_CODE_DUPLICATE |
| 2.4 | sort_order登録 | API: Service | CreateItemAttributeRequest.sortOrder |
| 2.5 | value_type固定 | API: Service | 'SELECT'固定 |
| 2.6 | 監査情報記録（作成） | API: Service audit | created_at, created_by |
| 3.1 | 仕様属性更新 | BFF: UpdateItemAttribute, API: UpdateItemAttribute | PUT /attributes/:id |
| 3.2 | 属性コード変更禁止 | API: Service validation | CODE_CHANGE_NOT_ALLOWED |
| 3.3 | 楽観ロック（属性） | API: Repository version check | CONCURRENT_UPDATE |
| 3.4 | 監査情報記録（更新） | API: Service audit | updated_at, updated_by |
| 4.1 | 仕様属性無効化 | BFF: DeactivateItemAttribute | PATCH /attributes/:id/deactivate |
| 4.2 | 仕様属性有効化 | BFF: ActivateItemAttribute | PATCH /attributes/:id/activate |
| 4.3 | 使用中警告（属性） | API: Repository isUsedByVariants | ATTRIBUTE_IN_USE |
| 4.4 | 物理削除禁止 | API: Service is_active update | - |
| 5.1 | 属性値一覧表示 | BFF: ListItemAttributeValues, API: ListItemAttributeValues | GET /attributes/:id/values |
| 5.2 | キーワード検索（値） | API: Service keyword filter | ListItemAttributeValuesRequest.keyword |
| 5.3 | 有効/無効フィルタ | API: Service isActive filter | ListItemAttributeValuesRequest.isActive |
| 5.4 | ページネーション | BFF: page/pageSize normalization | ListItemAttributeValuesResponse |
| 6.1 | 属性値登録 | BFF: CreateItemAttributeValue, API: CreateItemAttributeValue | POST /attributes/:id/values |
| 6.2 | 値コード形式検証 | API: Service validation | INVALID_VALUE_CODE_FORMAT |
| 6.3 | 値コード重複検証 | API: Repository checkCodeDuplicate | VALUE_CODE_DUPLICATE |
| 6.4 | sort_order登録 | API: Service | CreateItemAttributeValueRequest.sortOrder |
| 6.5 | 監査情報記録（作成） | API: Service audit | created_at, created_by |
| 7.1 | 属性値更新 | BFF: UpdateItemAttributeValue, API: UpdateItemAttributeValue | PUT /values/:id |
| 7.2 | 値コード変更禁止 | API: Service validation | CODE_CHANGE_NOT_ALLOWED |
| 7.3 | 楽観ロック（値） | API: Repository version check | CONCURRENT_UPDATE |
| 7.4 | 監査情報記録（更新） | API: Service audit | updated_at, updated_by |
| 8.1 | 属性値無効化 | BFF: DeactivateItemAttributeValue | PATCH /values/:id/deactivate |
| 8.2 | 属性値有効化 | BFF: ActivateItemAttributeValue | PATCH /values/:id/activate |
| 8.3 | 使用中警告（値） | API: Repository isUsedByVariants | VALUE_IN_USE |
| 8.4 | 物理削除禁止 | API: Service is_active update | - |
| 9.1 | 仕様属性サジェスト | BFF: SuggestItemAttributes, API: SuggestItemAttributes | GET /attributes/suggest |
| 9.2 | 最大20件制限 | BFF/API: limit clamp | SuggestItemAttributesRequest.limit |
| 9.3 | 無効除外 | API: Service isActive filter | - |
| 10.1 | 属性値サジェスト | BFF: SuggestItemAttributeValues, API: SuggestItemAttributeValues | GET /values/suggest |
| 10.2 | 属性指定サジェスト | API: Service attributeId filter | SuggestItemAttributeValuesRequest.attributeId |
| 10.3 | 最大20件制限 | BFF/API: limit clamp | SuggestItemAttributeValuesRequest.limit |
| 10.4 | 無効除外 | API: Service isActive filter | - |
| 11.1 | tenant_idフィルタ | Repository: all methods | WHERE tenant_id |
| 11.2 | RLS強制 | DB: RLS policy | tenant_isolation |
| 11.3 | 他テナントアクセス拒否 | API: NOT_FOUND返却 | 404 |
| 12.1 | 監査情報記録（作成） | API: Service | created_at, created_by |
| 12.2 | 監査情報記録（更新） | API: Service | updated_at, updated_by |
| 12.3 | 監査ログ内容 | API: Service audit log | user_id, tenant_id, operation |
| 13.1 | 読取権限チェック | API: Guard procure.item-attribute.read | 403 Forbidden |
| 13.2 | 管理権限チェック | API: Guard procure.item-attribute.manage | 403 Forbidden |
| 13.3 | 権限不足時エラー | API: Guard | 403 Forbidden |
| 13.4 | UI/API権限一致 | API: Guard | - |

---

## 非機能要件

### パフォーマンス

- 一覧取得はページネーションを必須とし、デフォルト50件、最大200件まで
- サジェストは最大20件
- インデックス: tenantId + itemAttributeCode, tenantId + itemAttributeId + valueCode, tenantId + isActive

### セキュリティ

- すべての操作はテナント単位で分離（RLS + Repository double-guard）
- 権限チェック: procure.item-attribute.read / procure.item-attribute.manage

### 監査

- 作成・更新・有効化・無効化操作は監査ログに記録

### 可用性

- 楽観ロックによる同時更新の競合制御

---

## 既存仕様との整合性確認

### エンティティ定義（06_品目関係.md）との差分

| 項目 | 既存仕様 | 本設計 | 差分理由 |
|------|---------|--------|---------|
| version カラム | 未定義 | 追加 | 楽観ロック用（他マスタと統一） |
| コード形式 | 未定義 | `^[A-Z0-9_-]{1,20}$` / `^[A-Z0-9_-]{1,30}$` | unit-master と同様のルール |
| エラーコード | 未定義 | 10種類定義 | CCSDD要件 |

### 品目マスタ（item-master）との関係

- 本マスタは品目マスタの前提マスタとして位置づけ
- 品目マスタでSKU作成時、本マスタの属性・属性値を参照
- item_variant_attributes が本マスタの属性値（item_attribute_values）を参照

---

（以上）
