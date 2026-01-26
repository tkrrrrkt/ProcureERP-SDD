# Design Document: tax-code（税コードマスタ）

---

## Overview

本ドキュメントは、ProcureERP における **税コードマスタ（TaxCode）** 機能の技術設計を定義する。

税コードは、税区分（TaxBusinessCategory）と税率（TaxRate）を関連付けた **税計算および伝票保持の正本キー** である。伝票明細は税コードを直接参照し、税額計算・会計処理・税申告集計の基点として使用する。

税コードは以下の3要素を組み合わせて構成される：
- 税区分（TaxBusinessCategory）：税務・会計上の分類
- 税率（TaxRate）：消費税率（期間管理付き）
- 内税/外税区分（TaxInOut）：INCLUSIVE（内税）/ EXCLUSIVE（外税）

登録後の税コード・税区分・税率・内税外税区分は変更不可とし、新規追加で対応する。これにより、過去伝票が参照する税コードの整合性を保証する。

---

## Requirements Traceability

| Requirement | Summary | Components | Interfaces | Notes |
|-------------|---------|------------|------------|-------|
| 1.1–1.5 | 税コード一覧表示 | TaxCodeList (UI), TaxCodeController (BFF/API), TaxCodeRepository | ListTaxCodes | ページネーション、ソート、検索 |
| 2.1–2.8 | 税コード新規登録 | TaxCodeDialog (UI), TaxCodeService (API) | CreateTaxCode | 税区分・税率ドロップダウン |
| 3.1–3.7 | 税コード編集 | TaxCodeDialog (UI), TaxCodeService (API) | UpdateTaxCode | 有効フラグのみ編集可 |
| 4.1–4.4 | 税コード無効化 | TaxCodeList (UI), TaxCodeService (API) | DeactivateTaxCode | 論理削除のみ |
| 5.1–5.4 | 税区分・税率参照API | TaxCodeService (API/BFF) | ListTaxBusinessCategories, ListTaxRatesForDropdown | ドロップダウン用 |
| 6.1–6.4 | マルチテナント・監査 | 全コンポーネント | - | RLS、監査カラム |
| 7.1–7.5 | 権限制御 | 全コンポーネント | - | RBAC |

---

## Architecture

### Architecture Pattern & Boundary Map

**Pattern (fixed)**:
```
UI（apps/web） → BFF（apps/bff） → Domain API（apps/api） → DB（PostgreSQL + RLS）
```
- UI直APIは禁止

**Contracts (SSoT)**:
- UI ↔ BFF: `packages/contracts/src/bff/tax-code`
- BFF ↔ Domain API: `packages/contracts/src/api/tax-code`
- Error: `packages/contracts/src/api/errors/tax-code-error.ts`, `packages/contracts/src/bff/errors/tax-code-error.ts`
- UI は `packages/contracts/src/api` を参照してはならない

---

## Architecture Responsibilities

### BFF Specification（apps/bff）

**Purpose**
- UI要件に最適化したAPI（Read Model / ViewModel）
- Domain APIのレスポンスを集約・変換（ビジネスルールの正本は持たない）
- 税区分・税率の参照一覧を提供（ドロップダウン用）

**BFF Endpoints（UIが叩く）**

| Method | Endpoint | Purpose | Request DTO | Response DTO | Notes |
|--------|----------|---------|-------------|--------------|-------|
| GET | `/api/bff/master-data/tax-code` | 税コード一覧取得 | ListTaxCodesRequest | ListTaxCodesResponse | 1.1–1.5 |
| GET | `/api/bff/master-data/tax-code/:id` | 税コード詳細取得 | - | GetTaxCodeResponse | 3.1 |
| POST | `/api/bff/master-data/tax-code` | 税コード新規登録 | CreateTaxCodeRequest | CreateTaxCodeResponse | 2.1–2.8 |
| PUT | `/api/bff/master-data/tax-code/:id` | 税コード更新 | UpdateTaxCodeRequest | UpdateTaxCodeResponse | 3.1–3.7 |
| PATCH | `/api/bff/master-data/tax-code/:id/deactivate` | 税コード無効化 | DeactivateTaxCodeRequest | DeactivateTaxCodeResponse | 4.1–4.4 |
| PATCH | `/api/bff/master-data/tax-code/:id/activate` | 税コード有効化 | ActivateTaxCodeRequest | ActivateTaxCodeResponse | 4.4 |
| GET | `/api/bff/master-data/tax-code/tax-business-categories` | 税区分一覧（ドロップダウン用） | - | ListTaxBusinessCategoriesResponse | 5.1, 5.3 |
| GET | `/api/bff/master-data/tax-code/tax-rates` | 税率一覧（ドロップダウン用） | - | ListTaxRatesForDropdownResponse | 5.2, 5.4 |

**Naming Convention（必須）**
- DTO / Contracts: camelCase（例: `taxCode`, `taxBusinessCategoryId`, `taxRateId`）
- DB columns: snake_case（例: `tax_code`, `tax_business_category_id`, `tax_rate_id`）
- `sortBy` は **DTO側キー**を採用（例: `taxCode | taxBusinessCategoryName | ratePercent`）

**Paging / Sorting Normalization（必須・BFF責務）**
- UI/BFF: page / pageSize（page-based）
- Domain API: offset / limit（DB-friendly）
- BFFは必ず以下を実施:
  - defaults: page=1, pageSize=20, sortBy=taxCode, sortOrder=asc
  - clamp: pageSize <= 200
  - whitelist: sortBy は `taxCode | taxBusinessCategoryName | ratePercent | taxInOut | isActive` のみ
  - normalize: keyword trim、空→undefined
  - transform: offset=(page-1)*pageSize, limit=pageSize

**Transformation Rules（api DTO → bff DTO）**
- TaxCodeApiDto → TaxCodeDto: 1:1マッピング（フィールド名同一）
- TaxBusinessCategoryApiDto → TaxBusinessCategoryDto: 1:1マッピング
- TaxRateForDropdownApiDto → TaxRateForDropdownDto: 1:1マッピング

**Error Policy（必須）**
- 採用方針: **Option A: Pass-through**
- 採用理由: 標準CRUDマスタであり、Domain APIエラーをそのまま返却で十分

**Authentication / Tenant Context**
- BFFはClerk認証からuser_idを解決
- tenant_idはユーザーに紐づくテナントから解決
- Domain APIへはヘッダー（X-Tenant-ID, X-User-ID）で伝搬

---

### Service Specification（Domain / apps/api）

**TaxCodeService**

| Method | Purpose | Transaction | Audit | Notes |
|--------|---------|-------------|-------|-------|
| listTaxCodes | 一覧取得 | Read | - | フィルタ、ソート、ページング |
| getTaxCode | 詳細取得 | Read | - | - |
| createTaxCode | 新規登録 | Write | Yes | 重複チェック、FK検証 |
| updateTaxCode | 更新 | Write | Yes | 有効フラグのみ変更可 |
| deactivateTaxCode | 無効化 | Write | Yes | is_active = false |
| activateTaxCode | 有効化 | Write | Yes | is_active = true |
| listTaxBusinessCategories | 税区分一覧 | Read | - | ドロップダウン用 |
| listTaxRatesForDropdown | 税率一覧 | Read | - | ドロップダウン用 |

**ビジネスルール（Domain API責務）**
- 税コードの重複チェック（tenant_id + tax_code）
- 税区分ID・税率IDの存在チェック（FK検証）
- 税区分ID・税率ID・内税外税区分の編集禁止（更新時に変更を拒否）
- 楽観ロック（version）

---

### Repository Specification（apps/api）

**TaxCodeRepository**

```typescript
interface TaxCodeRepository {
  findMany(tenantId: string, params: FindManyParams): Promise<{ items: TaxCodeWithRelations[]; total: number }>;
  findById(tenantId: string, id: string): Promise<TaxCodeWithRelations | null>;
  findByCode(tenantId: string, taxCode: string): Promise<TaxCode | null>;
  create(tenantId: string, data: CreateTaxCodeData): Promise<TaxCode>;
  update(tenantId: string, id: string, data: UpdateTaxCodeData, version: number): Promise<TaxCode>;
}

interface TaxCodeWithRelations extends TaxCode {
  taxBusinessCategory: TaxBusinessCategory;
  taxRate: TaxRate;
}
```

**TaxBusinessCategoryRepository**

```typescript
interface TaxBusinessCategoryRepository {
  findMany(tenantId: string): Promise<TaxBusinessCategory[]>;
  findById(tenantId: string, id: string): Promise<TaxBusinessCategory | null>;
}
```

**TaxRateRepository（既存を利用）**

```typescript
interface TaxRateRepository {
  findManyActive(tenantId: string): Promise<TaxRate[]>;
  findById(tenantId: string, id: string): Promise<TaxRate | null>;
}
```

- tenant_id 必須（全メソッド）
- where句二重ガード必須
- set_config 前提（RLS無効化禁止）

---

### Contracts Summary（This Feature）

**packages/contracts/src/api/tax-code/index.ts**

```typescript
// Enum
export const TaxInOut = {
  INCLUSIVE: 'INCLUSIVE',
  EXCLUSIVE: 'EXCLUSIVE',
} as const;
export type TaxInOut = typeof TaxInOut[keyof typeof TaxInOut];

// Sort Options
export type TaxCodeSortBy = 'taxCode' | 'taxBusinessCategoryName' | 'ratePercent' | 'taxInOut' | 'isActive';
export type SortOrder = 'asc' | 'desc';

// TaxCodeApiDto
export interface TaxCodeApiDto {
  id: string;
  taxCode: string;
  taxBusinessCategoryId: string;
  taxBusinessCategoryCode: string;
  taxBusinessCategoryName: string;
  taxRateId: string;
  taxRateCode: string;
  ratePercent: string; // Decimal as string (e.g., "10.00")
  taxInOut: TaxInOut;
  isActive: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
}

// TaxBusinessCategoryApiDto
export interface TaxBusinessCategoryApiDto {
  id: string;
  taxBusinessCategoryCode: string;
  taxBusinessCategoryName: string;
}

// TaxRateForDropdownApiDto
export interface TaxRateForDropdownApiDto {
  id: string;
  taxRateCode: string;
  ratePercent: string;
  validFrom: string;
  validTo: string | null;
}

// List
export interface ListTaxCodesApiRequest {
  offset: number;
  limit: number;
  sortBy?: TaxCodeSortBy;
  sortOrder?: SortOrder;
  keyword?: string;
  taxBusinessCategoryId?: string;
  isActive?: boolean;
}

export interface ListTaxCodesApiResponse {
  items: TaxCodeApiDto[];
  total: number;
}

// Create
export interface CreateTaxCodeApiRequest {
  taxCode: string;
  taxBusinessCategoryId: string;
  taxRateId: string;
  taxInOut: TaxInOut;
  isActive?: boolean;
}

export interface CreateTaxCodeApiResponse {
  taxCode: TaxCodeApiDto;
}

// Update (taxBusinessCategoryId, taxRateId, taxInOut are NOT updatable)
export interface UpdateTaxCodeApiRequest {
  isActive: boolean;
  version: number;
}

export interface UpdateTaxCodeApiResponse {
  taxCode: TaxCodeApiDto;
}

// Deactivate / Activate
export interface DeactivateTaxCodeApiRequest {
  version: number;
}

export interface DeactivateTaxCodeApiResponse {
  taxCode: TaxCodeApiDto;
}

export interface ActivateTaxCodeApiRequest {
  version: number;
}

export interface ActivateTaxCodeApiResponse {
  taxCode: TaxCodeApiDto;
}

// Tax Business Categories List
export interface ListTaxBusinessCategoriesApiResponse {
  items: TaxBusinessCategoryApiDto[];
}

// Tax Rates for Dropdown
export interface ListTaxRatesForDropdownApiResponse {
  items: TaxRateForDropdownApiDto[];
}
```

**packages/contracts/src/bff/tax-code/index.ts**

```typescript
// Enum
export const TaxInOut = {
  INCLUSIVE: 'INCLUSIVE',
  EXCLUSIVE: 'EXCLUSIVE',
} as const;
export type TaxInOut = typeof TaxInOut[keyof typeof TaxInOut];

// Sort Options
export type TaxCodeSortBy = 'taxCode' | 'taxBusinessCategoryName' | 'ratePercent' | 'taxInOut' | 'isActive';
export type SortOrder = 'asc' | 'desc';

// TaxCodeDto
export interface TaxCodeDto {
  id: string;
  taxCode: string;
  taxBusinessCategoryId: string;
  taxBusinessCategoryCode: string;
  taxBusinessCategoryName: string;
  taxRateId: string;
  taxRateCode: string;
  ratePercent: string;
  taxInOut: TaxInOut;
  isActive: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
}

// TaxBusinessCategoryDto
export interface TaxBusinessCategoryDto {
  id: string;
  taxBusinessCategoryCode: string;
  taxBusinessCategoryName: string;
}

// TaxRateForDropdownDto
export interface TaxRateForDropdownDto {
  id: string;
  taxRateCode: string;
  ratePercent: string;
  validFrom: string;
  validTo: string | null;
}

// List
export interface ListTaxCodesRequest {
  page?: number;      // 1-based, default: 1
  pageSize?: number;  // default: 20, max: 200
  sortBy?: TaxCodeSortBy;
  sortOrder?: SortOrder;
  keyword?: string;
  taxBusinessCategoryId?: string;
  isActive?: boolean;
}

export interface ListTaxCodesResponse {
  items: TaxCodeDto[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// Get
export interface GetTaxCodeResponse {
  taxCode: TaxCodeDto;
}

// Create
export interface CreateTaxCodeRequest {
  taxCode: string;
  taxBusinessCategoryId: string;
  taxRateId: string;
  taxInOut: TaxInOut;
  isActive?: boolean;
}

export interface CreateTaxCodeResponse {
  taxCode: TaxCodeDto;
}

// Update
export interface UpdateTaxCodeRequest {
  isActive: boolean;
  version: number;
}

export interface UpdateTaxCodeResponse {
  taxCode: TaxCodeDto;
}

// Deactivate / Activate
export interface DeactivateTaxCodeRequest {
  version: number;
}

export interface DeactivateTaxCodeResponse {
  taxCode: TaxCodeDto;
}

export interface ActivateTaxCodeRequest {
  version: number;
}

export interface ActivateTaxCodeResponse {
  taxCode: TaxCodeDto;
}

// Tax Business Categories List
export interface ListTaxBusinessCategoriesResponse {
  items: TaxBusinessCategoryDto[];
}

// Tax Rates for Dropdown
export interface ListTaxRatesForDropdownResponse {
  items: TaxRateForDropdownDto[];
}
```

**packages/contracts/src/api/errors/tax-code-error.ts**

```typescript
export const TAX_CODE_ERROR_CODES = {
  TAX_CODE_NOT_FOUND: 'TAX_CODE_NOT_FOUND',
  TAX_CODE_DUPLICATE: 'TAX_CODE_DUPLICATE',
  TAX_BUSINESS_CATEGORY_NOT_FOUND: 'TAX_BUSINESS_CATEGORY_NOT_FOUND',
  TAX_RATE_NOT_FOUND: 'TAX_RATE_NOT_FOUND',
  VERSION_CONFLICT: 'VERSION_CONFLICT',
  IMMUTABLE_FIELD_UPDATE: 'IMMUTABLE_FIELD_UPDATE',
} as const;

export type TaxCodeErrorCode = typeof TAX_CODE_ERROR_CODES[keyof typeof TAX_CODE_ERROR_CODES];

export const TaxCodeErrorHttpStatus: Record<TaxCodeErrorCode, number> = {
  TAX_CODE_NOT_FOUND: 404,
  TAX_CODE_DUPLICATE: 409,
  TAX_BUSINESS_CATEGORY_NOT_FOUND: 400,
  TAX_RATE_NOT_FOUND: 400,
  VERSION_CONFLICT: 409,
  IMMUTABLE_FIELD_UPDATE: 400,
};

export const TaxCodeErrorMessage: Record<TaxCodeErrorCode, string> = {
  TAX_CODE_NOT_FOUND: '指定された税コードが見つかりません',
  TAX_CODE_DUPLICATE: '同じ税コードが既に存在します',
  TAX_BUSINESS_CATEGORY_NOT_FOUND: '指定された税区分が見つかりません',
  TAX_RATE_NOT_FOUND: '指定された税率が見つかりません',
  VERSION_CONFLICT: '他のユーザーによって更新されています。画面を更新してください',
  IMMUTABLE_FIELD_UPDATE: 'このフィールドは変更できません',
};
```

---

## Responsibility Clarification

### UIの責務
- 税コード一覧のテーブル表示、ページネーション、ソート、フィルタ
- 新規登録・編集ダイアログの表示制御
- 税区分・税率ドロップダウンの表示
- フォーム入力制御（税コード・税区分・税率・内税外税の編集不可表示）
- 権限に基づくボタンの表示/非表示
- ビジネス判断は禁止

### BFFの責務
- page/pageSize → offset/limit 変換
- sortBy ホワイトリスト検証
- キーワードの正規化
- Domain API DTOからBFF DTOへの変換
- 税区分・税率の参照一覧取得
- ビジネスルールの正本は持たない

### Domain APIの責務
- ビジネスルールの正本（重複チェック、FK検証、編集禁止フィールド）
- 権限・状態遷移の最終判断
- 監査ログ・整合性保証
- RLSによるテナント分離

---

## Data Models

### TaxCode（税コード）

```prisma
model TaxCode {
  id                           String    @id @default(uuid())
  tenantId                     String    @map("tenant_id")
  taxCode                      String    @map("tax_code")
  taxBusinessCategoryId        String    @map("tax_business_category_id")
  taxRateId                    String    @map("tax_rate_id")
  taxInOut                     String    @map("tax_in_out") // INCLUSIVE | EXCLUSIVE
  isActive                     Boolean   @default(true) @map("is_active")
  version                      Int       @default(1)
  createdAt                    DateTime  @default(now()) @map("created_at")
  updatedAt                    DateTime  @updatedAt @map("updated_at")
  createdByLoginAccountId      String?   @map("created_by_login_account_id")
  updatedByLoginAccountId      String?   @map("updated_by_login_account_id")

  taxBusinessCategory          TaxBusinessCategory @relation(fields: [taxBusinessCategoryId], references: [id])
  taxRate                      TaxRate             @relation(fields: [taxRateId], references: [id])

  @@unique([tenantId, taxCode])
  @@index([tenantId, taxCode])
  @@index([tenantId, isActive])
  @@index([tenantId, taxBusinessCategoryId])
  @@index([tenantId, taxRateId])
  @@map("tax_codes")
}
```

### TaxBusinessCategory（税区分） - 既存モデル

```prisma
model TaxBusinessCategory {
  id                           String    @id @default(uuid())
  tenantId                     String    @map("tenant_id")
  taxBusinessCategoryCode      String    @map("tax_business_category_code")
  taxBusinessCategoryName      String    @map("tax_business_category_name")
  description                  String?
  isActive                     Boolean   @default(true) @map("is_active")
  version                      Int       @default(1)
  createdAt                    DateTime  @default(now()) @map("created_at")
  updatedAt                    DateTime  @updatedAt @map("updated_at")
  createdByLoginAccountId      String?   @map("created_by_login_account_id")
  updatedByLoginAccountId      String?   @map("updated_by_login_account_id")

  taxCodes                     TaxCode[]

  @@unique([tenantId, taxBusinessCategoryCode])
  @@index([tenantId, taxBusinessCategoryCode])
  @@index([tenantId, isActive])
  @@map("tax_business_categories")
}
```

### TaxRate（税率） - 既存モデル（リレーション追加）

```prisma
model TaxRate {
  id                      String    @id @default(uuid())
  tenantId                String    @map("tenant_id")
  taxRateCode             String    @map("tax_rate_code")
  ratePercent             Decimal   @map("rate_percent") @db.Decimal(5, 2)
  validFrom               DateTime  @map("valid_from") @db.Date
  validTo                 DateTime? @map("valid_to") @db.Date
  isActive                Boolean   @default(true) @map("is_active")
  version                 Int       @default(1)
  createdAt               DateTime  @default(now()) @map("created_at")
  updatedAt               DateTime  @updatedAt @map("updated_at")
  createdByLoginAccountId String?   @map("created_by_login_account_id")
  updatedByLoginAccountId String?   @map("updated_by_login_account_id")

  taxCodes                TaxCode[]

  @@unique([tenantId, taxRateCode])
  @@index([tenantId, taxRateCode])
  @@index([tenantId, isActive])
  @@index([tenantId, validFrom])
  @@map("tax_rates")
}
```

---

## UI Components

### TaxCodePage
- ルート: `/master-data/tax-code`
- TaxCodeList + TaxCodeDialog を配置

### TaxCodeList
- DataTable形式
- 列: 税コード、税区分名、税率（%）、内税/外税、有効フラグ
- 操作: 検索、ソート、ページネーション、行クリックで編集ダイアログ
- フィルタ: 税コード検索、税区分フィルタ、有効フラグフィルタ

### TaxCodeDialog
- 新規登録/編集の切り替え
- 新規: 全フィールド入力可能
  - 税コード（テキスト入力）
  - 税区分（ドロップダウン選択）
  - 税率（ドロップダウン選択）
  - 内税/外税（ラジオボタン選択）
- 編集: 税コード・税区分・税率・内税外税は読み取り専用、有効フラグのみ編集可

---

## Permission Mapping

| 権限 | UI操作 | API操作 |
|------|--------|---------|
| `procure.tax-code.read` | 一覧表示、詳細表示 | GET endpoints |
| `procure.tax-code.create` | 新規登録ボタン表示 | POST endpoint |
| `procure.tax-code.update` | 編集・無効化・有効化ボタン表示 | PUT, PATCH endpoints |

---

## File Structure

```
packages/contracts/src/
├── api/tax-code/index.ts
├── bff/tax-code/index.ts
├── api/errors/tax-code-error.ts
└── bff/errors/tax-code-error.ts

apps/api/src/modules/master-data/tax-code/
├── tax-code.module.ts
├── controller/tax-code.controller.ts
├── service/tax-code.service.ts
├── repository/tax-code.repository.ts
├── dto/
└── mappers/

apps/bff/src/modules/master-data/tax-code/
├── tax-code.module.ts
├── controller/tax-code.controller.ts
├── service/tax-code.service.ts
├── clients/domain-api.client.ts
└── mappers/

apps/web/src/
├── app/master-data/tax-code/page.tsx
└── features/master-data/tax-code/
    ├── ui/
    │   ├── components/
    │   │   ├── TaxCodeList.tsx
    │   │   └── TaxCodeDialog.tsx
    │   ├── api/
    │   │   ├── BffClient.ts
    │   │   ├── HttpBffClient.ts
    │   │   └── MockBffClient.ts
    │   ├── hooks/
    │   ├── utils/
    │   └── types/
    └── index.ts

packages/db/prisma/
├── schema.prisma (TaxCode追加、TaxRate/TaxBusinessCategoryにリレーション追加)
└── migrations/YYYYMMDD_add_tax_code/migration.sql
```
