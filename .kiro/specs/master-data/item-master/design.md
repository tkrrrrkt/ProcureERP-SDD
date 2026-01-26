# Design Document: 品目マスタ

**Purpose**: 品目マスタの登録・照会・編集機能を実装するための設計仕様。UI要件に最適化したBFF APIと、ビジネスルールを保持するDomain APIの責務を明確化する。

## Overview

本機能は、ProcureERPにおける品目マスタの登録・照会・編集を提供する。品目は発注・仕入の基本単位であり、購買依頼や発注伝票において品目情報を参照・利用するための基盤マスタとして機能する。

品目マスタは以下の機能を提供する：

- 品目一覧表示（ページネーション・ソート・検索対応）
- 品目詳細表示
- 品目新規登録（基底SKU自動生成）
- 品目編集
- 品目無効化・有効化
- 品目サジェスト（オートコンプリート用）

品目登録時には、基底SKU（variant_code='00000'）が自動生成され、default_variant_idとして参照される。これにより、SKUを意識せずに品目単位での運用が可能となる。

マルチテナント対応として、すべての操作はテナント単位で分離され、RLS（Row Level Security）により保護される。マスタ系データのため、楽観ロック（version）を採用する。

---

## Architecture

### Architecture Pattern & Boundary Map

**Pattern (fixed)**:

- UI（apps/web） → BFF（apps/bff） → Domain API（apps/api） → DB（PostgreSQL + RLS）
- UI直APIは禁止

**Contracts (SSoT)**:

- UI ↔ BFF: `packages/contracts/src/bff/item-master`
- BFF ↔ Domain API: `packages/contracts/src/api/item-master`
- Enum/Error: `packages/contracts/src/api/errors/item-master-error.ts`（BFFからRe-export）
- UI は `packages/contracts/src/api` を参照してはならない

---

## Architecture Responsibilities（Mandatory）

### BFF Specification（apps/bff）

**Purpose**

- UI要件に最適化したAPI（Read Model / ViewModel）
- Domain APIのレスポンスを集約・変換（ビジネスルールの正本は持たない）

**BFF Endpoints（UIが叩く）**

| Method | Endpoint | Purpose | Request DTO (contracts/bff) | Response DTO (contracts/bff) | Notes |
|--------|----------|---------|------------------------------|-------------------------------|-------|
| GET | `/api/bff/master-data/items` | 品目一覧取得 | `ListItemsRequest` | `ListItemsResponse` | ページネーション・ソート対応 |
| GET | `/api/bff/master-data/items/suggest` | 品目サジェスト | `SuggestItemsRequest` | `SuggestItemsResponse` | 前方一致、最大20件 |
| GET | `/api/bff/master-data/items/:id` | 品目詳細取得 | - | `GetItemResponse` | IDはUUID |
| POST | `/api/bff/master-data/items` | 品目新規登録 | `CreateItemRequest` | `CreateItemResponse` | 基底SKU自動生成 |
| PUT | `/api/bff/master-data/items/:id` | 品目更新 | `UpdateItemRequest` | `UpdateItemResponse` | 楽観ロック（version） |
| PATCH | `/api/bff/master-data/items/:id/activate` | 品目有効化 | `ActivateItemRequest` | `ActivateItemResponse` | 楽観ロック |
| PATCH | `/api/bff/master-data/items/:id/deactivate` | 品目無効化 | `DeactivateItemRequest` | `DeactivateItemResponse` | 楽観ロック |

**Naming Convention（必須）**

- DTO / Contracts: camelCase（例: `itemCode`, `itemName`, `baseUomId`）
- DB columns: snake_case（例: `item_code`, `item_name`, `base_uom_id`）
- `sortBy` は **DTO側キー**を採用する（例: `itemCode | itemName | isActive`）
- DB列名（snake_case）を UI/BFF へ露出させない

**Paging / Sorting Normalization（必須・BFF責務）**

- UI/BFF: page / pageSize（page-based）
- Domain API: offset / limit（DB-friendly）
- BFFは必ず以下を実施する（省略禁止）：
  - defaults: page=1, pageSize=50, sortBy=itemCode, sortOrder=asc
  - clamp: pageSize <= 200
  - whitelist: sortBy は許可リストのみ（`itemCode | itemName | isActive`）
  - normalize: keyword trim、空→undefined
  - transform: offset=(page-1)*pageSize, limit=pageSize
- Domain APIに渡すのは offset/limit（page/pageSizeは渡さない）
- BFFレスポンスには page/pageSize を含める（UIへ返すのはBFF側の値）

**Transformation Rules（api DTO → bff DTO）**

- 方針：field rename/omit/default の有無
  - API DTOのフィールド名をそのままBFF DTOにマッピング（camelCase統一）
  - 日付フィールド（createdAt, updatedAt）はISO 8601文字列として扱う
  - versionフィールドはBFFレスポンスに含める（楽観ロック用）
  - baseUom / purchaseUom の単位情報（uomCode, uomName）を展開して返却
- BFFレスポンスに page/pageSize を含める（UIに返すのはBFF値）

**Error Handling（contracts errorに準拠）**

**Error Policy（必須・未記載禁止）**

- この Feature における BFF の Error Policy は以下とする：
  - 採用方針：**Option A: Pass-through**
  - 採用理由：
    - 品目マスタは比較的シンプルなCRUD操作であり、Domain APIのエラーをそのままUIに伝えることで十分
    - UI側でエラーメッセージを適切に表示できる設計とする
    - BFF側での意味的な再分類は不要

**Option A: Pass-through（基本・推奨）**

- Domain APIのエラーを原則そのまま返す（status / code / message / details）
- BFF側での意味的な再分類・書き換えは禁止（ログ付与等の非機能は除く）
- UIは `contracts/bff/errors` に基づいて表示制御を行う

**In all cases**

- 最終拒否権限（403/404/409/422等）は Domain API が持つ

**Error Contract Definition**

- BFFは独自のエラーコードを定義せず、Domain APIのエラー定義 (`packages/contracts/src/api/errors/item-master-error.ts`) を `packages/contracts/src/bff/errors/item-master-error.ts` にて Re-export して使用する。
- これにより、APIとBFFでエラーコード（`ITEM_CODE_ALREADY_EXISTS` 等）の完全な一致を保証する。

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

**Usecases**

| Usecase | Method | Purpose | Input | Output | Transaction Boundary |
|---------|--------|---------|-------|--------|----------------------|
| ListItems | GET | 品目一覧取得 | tenantId, offset, limit, sortBy, sortOrder, filters | Item[] | Read-only |
| SuggestItems | GET | 品目サジェスト | tenantId, keyword, limit | ItemSummary[] | Read-only |
| GetItem | GET | 品目詳細取得 | tenantId, itemId | Item | Read-only |
| CreateItem | POST | 品目新規登録 | tenantId, CreateItemDto | Item | Transaction（Item + ItemVariant + 監査ログ） |
| UpdateItem | PUT | 品目更新 | tenantId, itemId, UpdateItemDto, version | Item | Transaction（UPDATE + 監査ログ） |
| ActivateItem | PATCH | 品目有効化 | tenantId, itemId, version | Item | Transaction（UPDATE + 監査ログ） |
| DeactivateItem | PATCH | 品目無効化 | tenantId, itemId, version | Item | Transaction（UPDATE + 監査ログ） |

**主要ビジネスルール**

1. **品目コードの一意性チェック**
   - 同一テナント内で品目コードは一意でなければならない
   - 新規登録時：品目コードの重複チェックを実行
   - 重複時は `ITEM_CODE_ALREADY_EXISTS` エラーを返す

2. **品目コード形式チェック**
   - 品目コードは5桁の数字形式（00001〜99999）でなければならない
   - 形式不正時は `INVALID_ITEM_CODE_FORMAT` エラーを返す

3. **基底SKU自動生成**
   - 品目登録時に、基底SKU（variant_code='00000', variant_name='標準', variant_signature=''）を自動生成する
   - 生成された基底SKUのIDを default_variant_id に設定する
   - 品目と基底SKUの作成は同一トランザクションで保証する

4. **基本単位の存在チェック**
   - 指定された base_uom_id が存在しない場合、`BASE_UOM_NOT_FOUND` エラーを返す

5. **購買単位の単位グループ検証**
   - purchase_uom_id が指定された場合、base_uom_id と同一の uom_group に属することを検証
   - 異なる単位グループの場合、`PURCHASE_UOM_INVALID_GROUP` エラーを返す

6. **楽観ロック**
   - 更新時はversionフィールドを使用した楽観ロックを実装
   - 取得時のversionと更新時のversionが一致しない場合は `CONCURRENT_UPDATE` エラーを返す

7. **変更不可フィールド**
   - 品目コード（itemCode）と基本単位（baseUomId）は登録後の変更を禁止
   - 変更を試みた場合は `IMMUTABLE_FIELD_MODIFICATION` エラーを返す

8. **キーワード検索仕様**
   - `keyword` パラメータが指定された場合、以下のフィールドに対して**部分一致（Partial Match / LIKE %keyword%）**でフィルタリングを行う
   - 対象フィールド: `itemCode` OR `itemName`
   - 大文字・小文字は区別しない（Case-insensitive）

9. **サジェスト検索仕様**
   - `keyword` パラメータに対して**前方一致（Prefix Match / LIKE keyword%）**で検索
   - 対象フィールド: `itemCode` OR `itemName`
   - 有効な品目（is_active=true）のみを対象
   - 最大20件を返却

**トランザクション境界**

- CreateItem: 1トランザクション（Item INSERT + ItemVariant INSERT + 監査ログ）
- UpdateItem: 1トランザクション（UPDATE + 監査ログ）
- ActivateItem / DeactivateItem: 1トランザクション（UPDATE + 監査ログ）
- ListItems / GetItem / SuggestItems: トランザクション不要（Read-only）

**監査ログ記録ポイント**

- CreateItem: 品目データ作成時（user_id, tenant_id, item_id, 作成内容）
- UpdateItem: 品目データ更新時（user_id, tenant_id, item_id, 変更前後の値）
- ActivateItem / DeactivateItem: 有効状態変更時（user_id, tenant_id, item_id, 変更内容）

**権限チェック**

- 参照操作（ListItems, GetItem, SuggestItems）には `procure.item.read` 権限が必要
- 登録操作（CreateItem）には `procure.item.create` 権限が必要
- 更新操作（UpdateItem, ActivateItem, DeactivateItem）には `procure.item.update` 権限が必要
- 権限不足時は 403 Forbidden を返す

---

### Repository Specification（apps/api）

**Purpose**

- DBアクセス（tenant_id必須）
- RLS連携
- tenant_id double-guard

**Repository Methods**

| Method | Purpose | Input | Output | tenant_id Guard |
|--------|---------|-------|--------|-----------------|
| findMany | 品目一覧取得 | tenantId, offset, limit, sortBy, sortOrder, filters | Item[] | WHERE句 + RLS |
| suggest | 品目サジェスト | tenantId, keyword, limit | ItemSummary[] | WHERE句 + RLS |
| findById | 品目詳細取得 | tenantId, itemId | Item \| null | WHERE句 + RLS |
| findByCode | 品目コード検索 | tenantId, itemCode | Item \| null | WHERE句 + RLS |
| create | 品目新規登録 | tenantId, CreateItemDto | Item | INSERT値 + RLS |
| update | 品目更新 | tenantId, itemId, UpdateItemDto, version | Item \| null | WHERE句 + RLS |

**ItemVariant Repository Methods**

| Method | Purpose | Input | Output | tenant_id Guard |
|--------|---------|-------|--------|-----------------|
| createBaseVariant | 基底SKU作成 | tenantId, itemId | ItemVariant | INSERT値 + RLS |

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

**BFF Contracts（packages/contracts/src/bff/item-master）**

```typescript
// Sort Options
export type ItemSortBy = 'itemCode' | 'itemName' | 'isActive';
export type SortOrder = 'asc' | 'desc';

// UomSummary（単位概要情報）
export interface UomSummaryDto {
  id: string;
  uomCode: string;
  uomName: string;
}

// ItemDto
export interface ItemDto {
  id: string;
  itemCode: string;
  itemName: string;
  itemShortName: string | null;
  baseUomId: string;
  baseUom: UomSummaryDto;
  purchaseUomId: string | null;
  purchaseUom: UomSummaryDto | null;
  defaultVariantId: string;
  notes: string | null;
  isActive: boolean;
  version: number;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  createdBy: string | null;
  updatedBy: string | null;
}

// List Items
export interface ListItemsRequest {
  page?: number; // 1-based, default: 1
  pageSize?: number; // default: 50, max: 200
  sortBy?: ItemSortBy; // default: 'itemCode'
  sortOrder?: SortOrder; // default: 'asc'
  keyword?: string; // partial match on itemCode, itemName
  isActive?: boolean; // filter by active status
}

export interface ListItemsResponse {
  items: ItemDto[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// Get Item
export interface GetItemResponse {
  item: ItemDto;
}

// Suggest Items
export interface SuggestItemsRequest {
  keyword: string; // prefix match
  limit?: number; // default: 20, max: 20
}

export interface SuggestItemsResponse {
  items: ItemSummaryDto[];
}

export interface ItemSummaryDto {
  id: string;
  itemCode: string;
  itemName: string;
  baseUom: UomSummaryDto;
}

// Create Item
export interface CreateItemRequest {
  itemCode: string; // 5桁数字
  itemName: string;
  itemShortName?: string;
  baseUomId: string;
  purchaseUomId?: string;
  notes?: string;
}

export interface CreateItemResponse {
  item: ItemDto;
}

// Update Item
export interface UpdateItemRequest {
  itemName: string;
  itemShortName?: string;
  purchaseUomId?: string | null;
  notes?: string | null;
  version: number; // 楽観ロック用
}

export interface UpdateItemResponse {
  item: ItemDto;
}

// Activate / Deactivate Item
export interface ActivateItemRequest {
  version: number;
}

export interface ActivateItemResponse {
  item: ItemDto;
}

export interface DeactivateItemRequest {
  version: number;
}

export interface DeactivateItemResponse {
  item: ItemDto;
}
```

**API Contracts（packages/contracts/src/api/item-master）**

```typescript
// Sort Options
export type ItemSortBy = 'itemCode' | 'itemName' | 'isActive';
export type SortOrder = 'asc' | 'desc';

// ItemApiDto
export interface ItemApiDto {
  id: string;
  itemCode: string;
  itemName: string;
  itemShortName: string | null;
  baseUomId: string;
  purchaseUomId: string | null;
  defaultVariantId: string;
  notes: string | null;
  isActive: boolean;
  version: number;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  createdByLoginAccountId: string | null;
  updatedByLoginAccountId: string | null;
}

// List Items
export interface ListItemsApiRequest {
  offset: number; // 0-based
  limit: number;
  sortBy?: ItemSortBy;
  sortOrder?: SortOrder;
  keyword?: string;
  isActive?: boolean;
}

export interface ListItemsApiResponse {
  items: ItemApiDto[];
  total: number;
}

// Get Item
export interface GetItemApiResponse {
  item: ItemApiDto;
}

// Suggest Items
export interface SuggestItemsApiRequest {
  keyword: string;
  limit: number;
}

export interface SuggestItemsApiResponse {
  items: ItemSummaryApiDto[];
}

export interface ItemSummaryApiDto {
  id: string;
  itemCode: string;
  itemName: string;
  baseUomId: string;
}

// Create Item
export interface CreateItemApiRequest {
  itemCode: string;
  itemName: string;
  itemShortName?: string;
  baseUomId: string;
  purchaseUomId?: string;
  notes?: string;
}

export interface CreateItemApiResponse {
  item: ItemApiDto;
}

// Update Item
export interface UpdateItemApiRequest {
  itemName: string;
  itemShortName?: string;
  purchaseUomId?: string | null;
  notes?: string | null;
  version: number;
}

export interface UpdateItemApiResponse {
  item: ItemApiDto;
}

// Activate / Deactivate Item
export interface ActivateItemApiRequest {
  version: number;
}

export interface ActivateItemApiResponse {
  item: ItemApiDto;
}

export interface DeactivateItemApiRequest {
  version: number;
}

export interface DeactivateItemApiResponse {
  item: ItemApiDto;
}
```

**Error Codes（packages/contracts/src/api/errors/item-master-error.ts）**

```typescript
export const ItemMasterErrorCode = {
  ITEM_NOT_FOUND: 'ITEM_NOT_FOUND',
  ITEM_CODE_ALREADY_EXISTS: 'ITEM_CODE_ALREADY_EXISTS',
  INVALID_ITEM_CODE_FORMAT: 'INVALID_ITEM_CODE_FORMAT',
  BASE_UOM_NOT_FOUND: 'BASE_UOM_NOT_FOUND',
  PURCHASE_UOM_NOT_FOUND: 'PURCHASE_UOM_NOT_FOUND',
  PURCHASE_UOM_INVALID_GROUP: 'PURCHASE_UOM_INVALID_GROUP',
  IMMUTABLE_FIELD_MODIFICATION: 'IMMUTABLE_FIELD_MODIFICATION',
  CONCURRENT_UPDATE: 'CONCURRENT_UPDATE',
} as const;

export const ItemMasterErrorMessage = {
  ITEM_NOT_FOUND: '品目が見つかりません',
  ITEM_CODE_ALREADY_EXISTS: '品目コードは既に使用されています',
  INVALID_ITEM_CODE_FORMAT: '品目コードは5桁の数字形式で入力してください',
  BASE_UOM_NOT_FOUND: '基本単位が見つかりません',
  PURCHASE_UOM_NOT_FOUND: '購買単位が見つかりません',
  PURCHASE_UOM_INVALID_GROUP: '購買単位は基本単位と同じ単位グループである必要があります',
  IMMUTABLE_FIELD_MODIFICATION: '品目コードと基本単位は変更できません',
  CONCURRENT_UPDATE: '他のユーザーによって更新されています。最新のデータを取得してください',
} as const;

export const ItemMasterErrorHttpStatus = {
  ITEM_NOT_FOUND: 404,
  ITEM_CODE_ALREADY_EXISTS: 409,
  INVALID_ITEM_CODE_FORMAT: 422,
  BASE_UOM_NOT_FOUND: 404,
  PURCHASE_UOM_NOT_FOUND: 404,
  PURCHASE_UOM_INVALID_GROUP: 422,
  IMMUTABLE_FIELD_MODIFICATION: 422,
  CONCURRENT_UPDATE: 409,
} as const;
```

---

## Data Model

### Prisma Schema

```prisma
model Item {
  id                       String        @id @default(uuid())
  tenantId                 String        @map("tenant_id")
  itemCode                 String        @map("item_code")
  itemName                 String        @map("item_name")
  itemShortName            String?       @map("item_short_name")
  baseUomId                String        @map("base_uom_id")
  purchaseUomId            String?       @map("purchase_uom_id")
  defaultVariantId         String        @map("default_variant_id")
  notes                    String?
  isActive                 Boolean       @default(true) @map("is_active")
  version                  Int           @default(1)
  createdAt                DateTime      @default(now()) @map("created_at")
  createdByLoginAccountId  String?       @map("created_by_login_account_id")
  updatedAt                DateTime      @updatedAt @map("updated_at")
  updatedByLoginAccountId  String?       @map("updated_by_login_account_id")

  // Relations
  baseUom        Uom          @relation("ItemBaseUom", fields: [tenantId, baseUomId], references: [tenantId, id])
  purchaseUom    Uom?         @relation("ItemPurchaseUom", fields: [tenantId, purchaseUomId], references: [tenantId, id])
  defaultVariant ItemVariant  @relation("ItemDefaultVariant", fields: [tenantId, defaultVariantId], references: [tenantId, id])
  variants       ItemVariant[] @relation("ItemVariants")

  @@unique([tenantId, itemCode])
  @@index([tenantId, itemCode])
  @@index([tenantId, isActive])
  @@map("items")
}

model ItemVariant {
  id                       String   @id @default(uuid())
  tenantId                 String   @map("tenant_id")
  itemId                   String   @map("item_id")
  variantCode              String   @map("variant_code")
  variantName              String   @map("variant_name")
  variantSignature         String   @map("variant_signature")
  isActive                 Boolean  @default(true) @map("is_active")
  createdAt                DateTime @default(now()) @map("created_at")
  createdByLoginAccountId  String?  @map("created_by_login_account_id")
  updatedAt                DateTime @updatedAt @map("updated_at")
  updatedByLoginAccountId  String?  @map("updated_by_login_account_id")

  // Relations
  item                    Item     @relation("ItemVariants", fields: [tenantId, itemId], references: [tenantId, id])
  defaultForItems         Item[]   @relation("ItemDefaultVariant")
  variantAttributes       ItemVariantAttribute[]

  @@unique([tenantId, itemId, variantCode])
  @@unique([tenantId, itemId, variantSignature])
  @@index([tenantId, itemId])
  @@map("item_variants")
}
```

**RLS Policy（PostgreSQL）**

```sql
-- RLS有効化
ALTER TABLE "items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "item_variants" ENABLE ROW LEVEL SECURITY;

-- ポリシー: テナント単位でアクセス制御
CREATE POLICY "tenant_isolation" ON "items"
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::text);

CREATE POLICY "tenant_isolation" ON "item_variants"
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
- 単位サジェストの表示
- ビジネス判断は禁止

### BFFの責務

- UI入力の正規化（paging / sorting / filtering）
- Domain API DTO ⇄ UI DTO の変換
- 単位情報（baseUom, purchaseUom）の展開
- エラーの透過（Pass-through）
- ビジネスルールの正本は持たない

### Domain APIの責務

- ビジネスルールの正本（品目コード一意性、コード形式、単位グループ検証）
- 基底SKU自動生成
- 権限・状態遷移の最終判断
- 監査ログ・整合性保証
- 楽観ロックの実装

### Repositoryの責務

- DBアクセス（tenant_id必須）
- RLS連携
- tenant_id double-guard

---

## Requirements Traceability

| Requirement ID | Requirement | Components | Interfaces |
|----------------|-------------|------------|------------|
| 1.1 | 品目一覧ページネーション | BFF: ListItems, API: ListItems | GET /api/bff/master-data/items |
| 1.2 | キーワード検索 | Repository: findMany | keyword filter |
| 1.3 | ソート機能 | BFF: Paging/Sorting | sortBy, sortOrder params |
| 1.4 | 有効/無効フィルタ | Repository: findMany | isActive filter |
| 1.5 | デフォルト有効品目表示 | BFF: defaults | isActive=true default |
| 2.1 | 品目詳細取得 | BFF: GetItem, API: GetItem | GET /api/bff/master-data/items/:id |
| 2.2 | 品目未発見エラー | API: GetItem | ITEM_NOT_FOUND error |
| 2.3 | 単位情報展開 | BFF: Mapper | baseUom, purchaseUom |
| 3.1 | 品目新規登録 | BFF: CreateItem, API: CreateItem | POST /api/bff/master-data/items |
| 3.2 | 基底SKU自動生成 | API: CreateItem | variant_code='00000' |
| 3.3 | 品目コード重複エラー | API: CreateItem | ITEM_CODE_ALREADY_EXISTS |
| 3.4 | 基本単位存在チェック | API: CreateItem | BASE_UOM_NOT_FOUND |
| 3.5 | 購買単位グループ検証 | API: CreateItem | PURCHASE_UOM_INVALID_GROUP |
| 3.6 | 品目コード形式検証 | API: CreateItem | INVALID_ITEM_CODE_FORMAT |
| 3.7 | 監査情報自動設定 | API: CreateItem | createdAt, createdBy |
| 4.1 | 品目更新 | BFF: UpdateItem, API: UpdateItem | PUT /api/bff/master-data/items/:id |
| 4.2 | 楽観ロック | Repository: update | CONCURRENT_UPDATE |
| 4.3 | 購買単位変更時検証 | API: UpdateItem | PURCHASE_UOM_INVALID_GROUP |
| 4.4 | 変更不可フィールド制御 | API: UpdateItem | IMMUTABLE_FIELD_MODIFICATION |
| 4.5 | バージョンインクリメント | Repository: update | version++ |
| 5.1 | 品目無効化 | BFF: DeactivateItem, API: DeactivateItem | PATCH /:id/deactivate |
| 5.2 | 品目有効化 | BFF: ActivateItem, API: ActivateItem | PATCH /:id/activate |
| 5.3 | 無効化時楽観ロック | API: DeactivateItem | CONCURRENT_UPDATE |
| 5.4 | 品目コード再利用禁止 | Business Rule | Unique constraint |
| 6.1 | 品目サジェスト | BFF: SuggestItems, API: SuggestItems | GET /items/suggest |
| 6.2 | サジェスト結果内容 | API: SuggestItems | id, itemCode, itemName, baseUom |
| 6.3 | 有効品目のみ対象 | Repository: suggest | isActive=true filter |
| 7.1-7.3 | 権限制御 | API: All methods | procure.item.* permissions |
| 7.4 | 権限不足エラー | API: All methods | 403 Forbidden |
| 8.1 | tenant_id必須 | Repository: All methods | WHERE tenantId |
| 8.2 | RLSによる分離 | PostgreSQL | RLS Policy |
| 8.3 | 品目コードテナント単位一意 | Repository: create | UNIQUE(tenantId, itemCode) |

---

## 非機能要件

### パフォーマンス

- 一覧取得はページネーションを必須とし、デフォルト50件、最大200件まで
- サジェストは最大20件、500ms以内（P95）
- インデックス: tenantId + itemCode, tenantId + isActive

### セキュリティ

- すべての操作はテナント単位で分離（RLS + Repository double-guard）
- 権限チェック: procure.item.read / create / update

### 監査

- 作成・更新・無効化/有効化操作は監査ログに記録（user_id, tenant_id, item_id, 変更内容）

### 可用性

- 楽観ロックによる同時更新の競合制御
- 品目と基底SKUの同時作成はトランザクションで保証

（以上）
