# Design Document: 納入先マスタ

**Purpose**: 納入先マスタの登録・照会・編集・無効化機能を実装するための設計仕様。UI要件に最適化したBFF APIと、ビジネスルールを保持するDomain APIの責務を明確化する。

## Overview

本機能は、ProcurERPにおける納入先マスタの登録・照会・編集を提供する。発注時に「実際にモノを届ける場所」を選択するための基盤マスタとして機能する。エンドユーザー／現場／工事場所等の直送先を含む。

納入先マスタは以下の機能を提供する：

- 納入先一覧表示（ページネーション・ソート・検索対応）
- 納入先詳細表示・編集
- 納入先新規登録・論理無効化（無効化/再有効化）
- 納入先コードの正規化（trim・半角変換・大文字変換）

マルチテナント対応として、すべての操作はテナント単位で分離され、RLS（Row Level Security）により保護される。マスタ系データのため、楽観ロック（version）を採用する。

**設計上の重要な変更点**:
- `customer_site_id` はNULL許容（独立実装、後からCustomerSiteと紐づけ可能）
- 納入先コード（`ship_to_code`）は10桁の独立コードとして管理（手入力）

## Architecture

### Architecture Pattern & Boundary Map

**Pattern (fixed)**:

- UI（apps/web） → BFF（apps/bff） → Domain API（apps/api） → DB（PostgreSQL + RLS）
- UI直APIは禁止

**Contracts (SSoT)**:

- UI ↔ BFF: `packages/contracts/src/bff/ship-to`
- BFF ↔ Domain API: `packages/contracts/src/api/ship-to`
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
| GET | `/api/bff/master-data/ship-to` | 納入先一覧取得 | `ListShipTosRequest` | `ListShipTosResponse` | ページネーション・ソート・検索対応 |
| GET | `/api/bff/master-data/ship-to/:id` | 納入先詳細取得 | - | `GetShipToResponse` | IDはUUID |
| POST | `/api/bff/master-data/ship-to` | 納入先新規登録 | `CreateShipToRequest` | `CreateShipToResponse` | テナントID自動設定 |
| PUT | `/api/bff/master-data/ship-to/:id` | 納入先更新 | `UpdateShipToRequest` | `UpdateShipToResponse` | 楽観ロック（version） |
| PATCH | `/api/bff/master-data/ship-to/:id/deactivate` | 納入先無効化 | `DeactivateShipToRequest` | `DeactivateShipToResponse` | is_active=false |
| PATCH | `/api/bff/master-data/ship-to/:id/activate` | 納入先再有効化 | `ActivateShipToRequest` | `ActivateShipToResponse` | is_active=true |

**Naming Convention（必須）**

- DTO / Contracts: camelCase（例: `shipToCode`, `shipToName`, `postalCode`）
- DB columns: snake_case（例: `ship_to_code`, `ship_to_name`, `postal_code`）
- `sortBy` は **DTO側キー**を採用する（例: `shipToCode | shipToName | isActive`）
- DB列名（snake_case）を UI/BFF へ露出させない

**Paging / Sorting Normalization（必須・BFF責務）**

- UI/BFF: page / pageSize（page-based）
- Domain API: offset / limit（DB-friendly）
- BFFは必ず以下を実施する（省略禁止）：
  - defaults: page=1, pageSize=20, sortBy=shipToCode, sortOrder=asc
  - clamp: pageSize <= 200
  - whitelist: sortBy は許可リストのみ
    - `shipToCode | shipToName | shipToNameKana | prefecture | isActive`
  - normalize: keyword trim、空→undefined
  - transform: offset=(page-1)*pageSize, limit=pageSize
- Domain APIに渡すのは offset/limit（page/pageSizeは渡さない）
- BFFレスポンスには page/pageSize を含める（UIへ返すのはBFF側の値）

**Transformation Rules（api DTO → bff DTO）**

- 方針：field rename/omit/default の有無
  - API DTOのフィールド名をそのままBFF DTOにマッピング（camelCase統一）
  - versionフィールドはBFFレスポンスに含める（楽観ロック用）
  - customerSiteId は nullable として扱う
- BFFレスポンスに page/pageSize を含める（UIに返すのはBFF値）

**Error Handling（contracts errorに準拠）**

**Error Policy（必須・未記載禁止）**

- この Feature における BFF の Error Policy は以下とする：
  - 採用方針：**Option A: Pass-through**
  - 採用理由：
    - 納入先マスタは比較的シンプルなCRUD操作であり、Domain APIのエラーをそのままUIに伝えることで十分
    - UI側でエラーメッセージを適切に表示できる設計とする
    - BFF側での意味的な再分類は不要
    - employee-master / bank-master と同一方針で一貫性を保つ

**Option A: Pass-through（基本・推奨）**

- Domain APIのエラーを原則そのまま返す（status / code / message / details）
- BFF側での意味的な再分類・書き換えは禁止（ログ付与等の非機能は除く）
- UIは `contracts/bff/errors` に基づいて表示制御を行う

**In all cases**

- 最終拒否権限（403/404/409/422等）は Domain API が持つ

**Error Contract Definition**

- BFFは独自のエラーコードを定義せず、Domain APIのエラー定義 (`packages/contracts/src/api/errors/ship-to-error.ts`) を `packages/contracts/src/bff/errors/ship-to-error.ts` にて Re-export して使用する
- これにより、APIとBFFでエラーコード（`SHIP_TO_CODE_DUPLICATE` 等）の完全な一致を保証する

**Authentication / Tenant Context（tenant_id/user_id伝搬）**

- BFFは認証情報（Clerk）から `tenant_id` / `user_id` を解決する
- Domain API呼び出し時に、`tenant_id` / `user_id` をHTTPヘッダーまたはコンテキストに含めて伝搬する
- BFFは認証情報の解決に失敗した場合、401 Unauthorizedを返す

**Authorization Responsibility**

- BFF層ではAPI呼び出し前のブロッキング（権限チェック）は行わない
- 権限チェックの正本（SSoT）はDomain APIに集約し、BFFはDomain APIから返却された `403 Forbidden` を透過的にクライアントへ返す方針とする（二重管理防止のため）

---

### Service Specification（Domain / apps/api）

**Purpose**

- ビジネスルールの正本（BFF/UIは禁止）
- 権限・状態遷移の最終判断
- 監査ログ・整合性保証

**Usecases**

| Usecase | Method | Purpose | Input | Output | Transaction Boundary |
|---------|--------|---------|-------|--------|---------------------|
| ListShipTos | GET | 納入先一覧取得 | tenantId, offset, limit, sortBy, sortOrder, filters | ShipTo[], total | Read-only |
| GetShipTo | GET | 納入先詳細取得 | tenantId, shipToId | ShipTo | Read-only |
| CreateShipTo | POST | 納入先新規登録 | tenantId, CreateShipToDto | ShipTo | Single transaction |
| UpdateShipTo | PUT | 納入先更新 | tenantId, shipToId, UpdateShipToDto, version | ShipTo | Single transaction |
| DeactivateShipTo | PATCH | 納入先無効化 | tenantId, shipToId, version | ShipTo | Single transaction |
| ActivateShipTo | PATCH | 納入先再有効化 | tenantId, shipToId, version | ShipTo | Single transaction |

**主要ビジネスルール**

1. **納入先コードの一意性チェック**
   - 同一テナント内で納入先コードは一意でなければならない
   - 新規登録時：納入先コードの重複チェックを実行
   - 納入先コードは登録後の変更不可（更新APIでは納入先コードフィールドを受け付けない）
   - 重複時は `SHIP_TO_CODE_DUPLICATE` エラーを返す

2. **納入先コード形式チェック**
   - 納入先コードは10桁の英数字
   - 形式不正時は `INVALID_SHIP_TO_CODE_FORMAT` エラーを返す

3. **納入先コード正規化**
   - 入力されたコードに対して以下の正規化を適用：
     - 前後空白の除去（trim）
     - 全角→半角変換
     - 英字→大文字変換
   - 正規化はDomain API層（Service）で実施
   - **正規化フロー（Service層で保証）**:
     1. 入力値を正規化
     2. 正規化後の値で形式検証（10桁英数字）
     3. 検証成功後のみDBに保存（正規化前の値がDBに入ることを防止）
   - 正規化後の値をレスポンスに含めることで、UIに反映される値を明示する

4. **CustomerSite紐づけ（任意）**
   - `customerSiteId` はNULL許容
   - 更新時にCustomerSiteとの紐づけ・解除が可能
   - 紐づけ時、指定されたCustomerSiteが同一テナントに存在することを検証
   - 存在しない場合は `CUSTOMER_SITE_NOT_FOUND` エラーを返す
   - **実装上の注意（CustomerSite未実装時）**:
     - CustomerSiteテーブルが未実装の間は、`customerSiteId` への値設定を受け付けない（UIで入力不可とする）
     - API層では `customerSiteId` が指定された場合、CustomerSiteテーブルの存在確認を行い、テーブル未存在時は `CUSTOMER_SITE_NOT_AVAILABLE` エラーを返す
     - CustomerSite実装後に紐づけ機能を有効化する

5. **メールアドレス形式チェック**
   - メールアドレスは任意項目だが、入力された場合は有効な形式でなければならない
   - 形式不正時は `INVALID_EMAIL_FORMAT` エラーを返す

6. **楽観ロック**
   - 更新時はversionフィールドを使用した楽観ロックを実装
   - 取得時のversionと更新時のversionが一致しない場合は `CONCURRENT_UPDATE` エラーを返す

7. **キーワード検索仕様**
   - `keyword` パラメータが指定された場合、以下のフィールドに対して**部分一致（ILIKE %keyword%）**でフィルタリング
   - 対象: `shipToCode` OR `shipToName` OR `shipToNameKana`
   - 大文字・小文字は区別しない（Case-insensitive）

**トランザクション境界**

- CreateShipTo / UpdateShipTo / DeactivateShipTo / ActivateShipTo: 1トランザクション（操作 + 監査ログ）
- ListShipTos / GetShipTo: トランザクション不要（Read-only）

**監査ログ記録ポイント**

- CreateShipTo: 納入先データ作成時（user_id, tenant_id, ship_to_id, 作成内容）
- UpdateShipTo: 納入先データ更新時（user_id, tenant_id, ship_to_id, 変更前後の値）
- DeactivateShipTo / ActivateShipTo: 納入先の有効/無効切り替え時

**権限チェック**

- 納入先参照: `procure.ship-to.read`
- 納入先登録: `procure.ship-to.create`
- 納入先編集・無効化・再有効化: `procure.ship-to.update`
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
| findMany | 納入先一覧取得 | tenantId, offset, limit, sortBy, sortOrder, filters | ShipTo[], total | WHERE句 + RLS |
| findOne | 納入先詳細取得 | tenantId, shipToId | ShipTo \| null | WHERE句 + RLS |
| findByCode | 納入先コード検索 | tenantId, shipToCode | ShipTo \| null | WHERE句 + RLS |
| create | 納入先新規登録 | tenantId, CreateShipToDto | ShipTo | INSERT値 + RLS |
| update | 納入先更新 | tenantId, shipToId, UpdateShipToDto, version | ShipTo | WHERE句 + RLS |

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

**BFF Contracts（packages/contracts/src/bff/ship-to）**

```typescript
// =============================================================================
// Sort Options
// =============================================================================

export type ShipToSortBy = 'shipToCode' | 'shipToName' | 'shipToNameKana' | 'prefecture' | 'isActive';
export type SortOrder = 'asc' | 'desc';

// =============================================================================
// ShipToDto
// =============================================================================

export interface ShipToDto {
  id: string;
  shipToCode: string;
  shipToName: string;
  shipToNameKana: string | null;
  customerSiteId: string | null;
  postalCode: string | null;
  prefecture: string | null;
  city: string | null;
  address1: string | null;
  address2: string | null;
  phoneNumber: string | null;
  faxNumber: string | null;
  email: string | null;
  contactPerson: string | null;
  remarks: string | null;
  isActive: boolean;
  version: number;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  createdBy: string | null;
  updatedBy: string | null;
}

// =============================================================================
// List ShipTos
// =============================================================================

export interface ListShipTosRequest {
  page?: number; // 1-based, default: 1
  pageSize?: number; // default: 20, max: 200
  sortBy?: ShipToSortBy; // default: 'shipToCode'
  sortOrder?: SortOrder; // default: 'asc'
  keyword?: string; // partial match on shipToCode, shipToName, shipToNameKana
  isActive?: boolean; // filter by active status
}

export interface ListShipTosResponse {
  items: ShipToDto[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// =============================================================================
// Get ShipTo
// =============================================================================

export interface GetShipToResponse {
  shipTo: ShipToDto;
}

// =============================================================================
// Create ShipTo
// =============================================================================

export interface CreateShipToRequest {
  shipToCode: string; // 10-digit alphanumeric (required)
  shipToName: string; // required
  shipToNameKana?: string;
  customerSiteId?: string; // nullable, can link later
  postalCode?: string;
  prefecture?: string;
  city?: string;
  address1?: string;
  address2?: string;
  phoneNumber?: string;
  faxNumber?: string;
  email?: string;
  contactPerson?: string;
  remarks?: string;
  isActive?: boolean; // default: true
}

export interface CreateShipToResponse {
  shipTo: ShipToDto;
}

// =============================================================================
// Update ShipTo
// =============================================================================

export interface UpdateShipToRequest {
  // shipToCode is NOT updatable
  shipToName: string;
  shipToNameKana?: string;
  customerSiteId?: string | null; // can set, change, or clear
  postalCode?: string;
  prefecture?: string;
  city?: string;
  address1?: string;
  address2?: string;
  phoneNumber?: string;
  faxNumber?: string;
  email?: string;
  contactPerson?: string;
  remarks?: string;
  isActive: boolean;
  version: number; // optimistic lock
}

export interface UpdateShipToResponse {
  shipTo: ShipToDto;
}

// =============================================================================
// Deactivate / Activate ShipTo
// =============================================================================

export interface DeactivateShipToRequest {
  version: number;
}

export interface DeactivateShipToResponse {
  shipTo: ShipToDto;
}

export interface ActivateShipToRequest {
  version: number;
}

export interface ActivateShipToResponse {
  shipTo: ShipToDto;
}
```

**API Contracts（packages/contracts/src/api/ship-to）**

```typescript
// =============================================================================
// List ShipTos (API)
// =============================================================================

export interface ListShipTosApiRequest {
  offset: number; // 0-based
  limit: number; // max: 200
  sortBy?: ShipToSortBy;
  sortOrder?: SortOrder;
  keyword?: string;
  isActive?: boolean;
}

export interface ListShipTosApiResponse {
  items: ShipToApiDto[];
  total: number;
}

// =============================================================================
// Create / Update / Get (API)
// =============================================================================

// CreateShipToApiRequest: BFF版と同一構造
// UpdateShipToApiRequest: BFF版と同一構造
// GetShipToApiResponse: { shipTo: ShipToApiDto }
// DeactivateShipToApiRequest / ActivateShipToApiRequest: { version: number }

// =============================================================================
// ShipToApiDto
// =============================================================================

export interface ShipToApiDto {
  id: string;
  shipToCode: string;
  shipToName: string;
  shipToNameKana: string | null;
  customerSiteId: string | null;
  postalCode: string | null;
  prefecture: string | null;
  city: string | null;
  address1: string | null;
  address2: string | null;
  phoneNumber: string | null;
  faxNumber: string | null;
  email: string | null;
  contactPerson: string | null;
  remarks: string | null;
  isActive: boolean;
  version: number;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  createdBy: string | null;
  updatedBy: string | null;
}
```

**BFF → API 変換ルール**:
- `page` / `pageSize` → `offset` = (page - 1) * pageSize, `limit` = pageSize
- レスポンス: API の `total` を使って BFF で `totalPages` = Math.ceil(total / pageSize) を算出

**Error Codes（packages/contracts/src/api/errors/ship-to-error.ts）**

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `SHIP_TO_NOT_FOUND` | 404 | 指定された納入先が見つからない |
| `SHIP_TO_CODE_DUPLICATE` | 409 | 納入先コードが重複している |
| `INVALID_SHIP_TO_CODE_FORMAT` | 422 | 納入先コードの形式が不正（10桁英数字でない） |
| `INVALID_SHIP_TO_CODE_LENGTH` | 422 | 納入先コードの桁数が不正 |
| `INVALID_SHIP_TO_CODE_CHARS` | 422 | 納入先コードに英数字以外の文字が含まれる |
| `INVALID_EMAIL_FORMAT` | 422 | メールアドレスの形式が不正 |
| `CUSTOMER_SITE_NOT_FOUND` | 404 | 指定された得意先拠点が見つからない |
| `CUSTOMER_SITE_NOT_AVAILABLE` | 422 | 得意先拠点機能が未実装（CustomerSite実装後に有効化） |
| `CONCURRENT_UPDATE` | 409 | 楽観ロックによる競合 |

---

## Data Model

### Prisma Schema

```prisma
model ShipTo {
  id                String   @id @default(uuid())
  tenantId          String   @map("tenant_id")
  shipToCode        String   @map("ship_to_code") @db.VarChar(10)
  shipToName        String   @map("ship_to_name") @db.VarChar(100)
  shipToNameKana    String?  @map("ship_to_name_kana") @db.VarChar(200)
  customerSiteId    String?  @map("customer_site_id") // nullable, can link later
  postalCode        String?  @map("postal_code") @db.VarChar(10)
  prefecture        String?  @map("prefecture") @db.VarChar(20)
  city              String?  @map("city") @db.VarChar(50)
  address1          String?  @map("address_1") @db.VarChar(100)
  address2          String?  @map("address_2") @db.VarChar(100)
  phoneNumber       String?  @map("phone_number") @db.VarChar(20)
  faxNumber         String?  @map("fax_number") @db.VarChar(20)
  email             String?  @map("email") @db.VarChar(254)
  contactPerson     String?  @map("contact_person") @db.VarChar(50)
  remarks           String?  @map("remarks") @db.Text
  isActive          Boolean  @default(true) @map("is_active")
  version           Int      @default(1)
  createdAt         DateTime @default(now()) @map("created_at")
  updatedAt         DateTime @updatedAt @map("updated_at")
  createdBy         String?  @map("created_by_login_account_id")
  updatedBy         String?  @map("updated_by_login_account_id")

  // Relations (future: CustomerSite)
  // customerSite    CustomerSite? @relation(fields: [customerSiteId], references: [id])

  @@unique([tenantId, shipToCode])
  @@index([tenantId, shipToCode])
  @@index([tenantId, shipToName])
  @@index([tenantId, isActive])
  @@index([tenantId, customerSiteId])
  @@map("ship_tos")
}
```

**RLS Policy（PostgreSQL）**

```sql
-- RLS有効化
ALTER TABLE "ship_tos" ENABLE ROW LEVEL SECURITY;

-- ポリシー: テナント単位でアクセス制御
CREATE POLICY "tenant_isolation" ON "ship_tos"
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
- 検索のdebounce制御（300ms推奨）
- CustomerSite選択モーダルの表示制御（将来拡張）
- ビジネス判断は禁止

### BFFの責務

- UI入力の正規化（paging / sorting / filtering）
- Domain API DTO ⇄ UI DTO の変換
- エラーの透過（Pass-through）
- ビジネスルールの正本は持たない

### Domain APIの責務

- ビジネスルールの正本（コード一意性、形式チェック、コード正規化、メール形式）
- 権限・状態遷移の最終判断
- 監査ログ・整合性保証
- 楽観ロックの実装
- CustomerSite存在確認（紐づけ時）

### Repositoryの責務

- DBアクセス（tenant_id必須）
- RLS連携
- tenant_id double-guard

---

## Requirements Traceability

| Requirement ID | Requirement | Components | Interfaces |
|----------------|-------------|------------|------------|
| REQ-1.1 | 納入先一覧表示 | BFF: ListShipTos, API: ListShipTos | GET /api/bff/master-data/ship-to |
| REQ-1.2 | 一覧表示フィールド（コード・名・住所・連絡先・有効状態） | ShipToDto | ShipToDto |
| REQ-1.3 | 納入先コード・名称で検索（部分一致） | BFF: ListShipTos, API: ListShipTos | ListShipTosRequest.keyword |
| REQ-1.4 | 有効/無効フィルタ | BFF: ListShipTos, API: ListShipTos | ListShipTosRequest.isActive |
| REQ-1.5 | 納入先コード順デフォルトソート | BFF: normalize | sortBy=shipToCode, sortOrder=asc |
| REQ-2.1 | 納入先登録ダイアログ表示 | UI | - |
| REQ-2.2 | 入力項目（コード・名・カナ・得意先拠点・住所・連絡先・備考） | CreateShipToRequest | CreateShipToRequest |
| REQ-2.3 | 納入先コード形式検証（10桁英数字） | API: Validation | INVALID_SHIP_TO_CODE_FORMAT |
| REQ-2.4 | 納入先登録 | BFF: CreateShipTo, API: CreateShipTo | POST /api/bff/master-data/ship-to |
| REQ-2.5 | 納入先コード重複チェック | API: CreateShipTo | SHIP_TO_CODE_DUPLICATE |
| REQ-2.6 | 登録成功時メッセージ・ダイアログ閉じる | UI | - |
| REQ-3.1 | 編集ダイアログ表示 | UI | - |
| REQ-3.2 | 納入先コード以外編集可能 | UI, API: UpdateShipTo | shipToCode省略 |
| REQ-3.3 | CustomerSite紐づけ・変更 | API: UpdateShipTo | customerSiteId設定 |
| REQ-3.4 | CustomerSiteクリア | API: UpdateShipTo | customerSiteId=null |
| REQ-3.5 | 更新成功時メッセージ・一覧更新 | UI | - |
| REQ-3.6 | 楽観ロックエラー | API: UpdateShipTo | CONCURRENT_UPDATE |
| REQ-4.1 | 無効化確認ダイアログ | UI | - |
| REQ-4.2 | 無効化実行 | BFF: DeactivateShipTo, API: DeactivateShipTo | PATCH .../deactivate |
| REQ-4.3 | 無効納入先は発注選択候補に表示しない | BFF: ListShipTos | isActive=true filter |
| REQ-4.4 | 物理削除禁止（論理無効化のみ） | API: - | - |
| REQ-4.5 | 再有効化 | BFF: ActivateShipTo, API: ActivateShipTo | PATCH .../activate |
| REQ-5.1 | コード正規化（trim） | API: CreateShipTo | trim処理 |
| REQ-5.2 | コード正規化（全角→半角） | API: CreateShipTo | 半角変換 |
| REQ-5.3 | コード正規化（大文字変換） | API: CreateShipTo | 大文字変換 |
| REQ-5.4 | 正規化後桁数エラー | API: Validation | INVALID_SHIP_TO_CODE_LENGTH |
| REQ-5.5 | 正規化後文字種エラー | API: Validation | INVALID_SHIP_TO_CODE_CHARS |
| REQ-6.1 | クエリにtenant_id含める | Repository | WHERE tenantId |
| REQ-6.2 | RLSによるテナント境界強制 | Repository | RLS policy |
| REQ-6.3 | 操作者のtenant_idデータのみアクセス | API: AuthGuard | tenant_id検証 |
| REQ-7.1 | 新規登録時created_at, created_by記録 | API: CreateShipTo | createdAt, createdBy |
| REQ-7.2 | 更新時updated_at, updated_by記録 | API: UpdateShipTo | updatedAt, updatedBy |
| REQ-7.3 | 監査列は実質必須 | API | user_id伝搬 |
| REQ-8.1 | versionカラムで楽観ロック | Repository: update | version WHERE句 |
| REQ-8.2 | version値一致検証 | API: UpdateShipTo | version比較 |
| REQ-8.3 | version不一致時エラー | API: UpdateShipTo | CONCURRENT_UPDATE |

---

## 将来拡張（本実装では対象外）

以下は本実装のスコープ外とし、将来の拡張として検討する。

1. **CustomerSite紐づけ機能の有効化**
   - CustomerSiteマスタ実装後に、納入先と得意先拠点の紐づけ機能を有効化
   - 一括紐づけバッチ処理の実装

2. **使用中納入先の無効化警告**
   - 発注・入荷予定等で参照されている納入先を無効化する際の警告表示
   - bank-master の `BRANCH_IN_USE` と同様のパターン
   - 警告コード: `SHIP_TO_IN_USE`（処理は続行可能）

3. **納入先のインポート/エクスポート機能**
   - CSV/Excelによる一括登録・更新
   - 既存データのエクスポート

4. **地図連携**
   - 住所から位置情報（緯度・経度）の取得
   - 地図上での納入先表示

---

## 非機能要件

### パフォーマンス

- 一覧画面の初期表示: 2秒以内（P95）
- 検索・フィルタ結果の表示: 1秒以内（P95）
- 一覧取得はページネーションを必須とし、デフォルト20件、最大200件まで
- インデックス: tenantId + shipToCode, tenantId + shipToName, tenantId + isActive, tenantId + customerSiteId
- 検索のdebounce: 300ms（UI側）

**将来的な検索最適化（本実装では対象外）**:
- 部分一致検索（ILIKE）は `tenantId + shipToName` インデックスでは効果が限定的
- データ量増加時は `pg_trgm` 拡張による GIN/GiST インデックス導入を検討
- 検索頻度・データ量に応じて Elasticsearch 等の全文検索エンジン導入も選択肢

### セキュリティ

- すべての操作はテナント単位で分離（RLS + Repository double-guard）
- 権限チェック: procure.ship-to.read / create / update

### 監査

- 作成・更新・無効化・再有効化操作は監査ログに記録（user_id, tenant_id, ship_to_id, 変更内容）

### 可用性

- 楽観ロックによる同時更新の競合制御

### ユーザビリティ

- 一覧はページネーション対応（デフォルト20件/ページ）
- 検索はリアルタイム絞り込み（debounce 300ms）

---

（以上）
