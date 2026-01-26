# Design Document: tax-rate（税率マスタ）

---

## Overview

本ドキュメントは、ProcureERP における **税率マスタ（TaxRate）** 機能の技術設計を定義する。

税率マスタは、消費税率を期間管理付きで保持するマスタである。税制改定（例：8%→10%）時は新規レコードを追加し、既存レコードの税率値は変更しない。これにより、過去伝票が参照する税率の整合性を保証する。

本機能のスコープには、税率マスタの CRUD 機能に加え、**税区分（TaxBusinessCategory）エンティティの定義およびシードデータ投入**を含む。税区分は画面を持たず、初期データとして投入される参照専用マスタである。

---

## Requirements Traceability

| Requirement | Summary | Components | Interfaces | Notes |
|-------------|---------|------------|------------|-------|
| 1.1–1.5 | 税率一覧表示 | TaxRateList (UI), TaxRateController (BFF/API), TaxRateRepository | ListTaxRates | ページネーション、ソート、検索 |
| 2.1–2.7 | 税率新規登録 | TaxRateDialog (UI), TaxRateService (API) | CreateTaxRate | バリデーション、重複チェック |
| 3.1–3.6 | 税率編集 | TaxRateDialog (UI), TaxRateService (API) | UpdateTaxRate | 税率値は編集不可 |
| 4.1–4.4 | 税率無効化 | TaxRateList (UI), TaxRateService (API) | DeactivateTaxRate | 論理削除のみ |
| 5.1–5.5 | 税区分シード | TaxBusinessCategory (Model), Seed Script | - | 画面なし |
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
- UI ↔ BFF: `packages/contracts/src/bff/tax-rate`
- BFF ↔ Domain API: `packages/contracts/src/api/tax-rate`
- Error: `packages/contracts/src/api/errors/tax-rate-error.ts`, `packages/contracts/src/bff/errors/tax-rate-error.ts`
- UI は `packages/contracts/src/api` を参照してはならない

---

## Architecture Responsibilities

### BFF Specification（apps/bff）

**Purpose**
- UI要件に最適化したAPI（Read Model / ViewModel）
- Domain APIのレスポンスを集約・変換（ビジネスルールの正本は持たない）

**BFF Endpoints（UIが叩く）**

| Method | Endpoint | Purpose | Request DTO | Response DTO | Notes |
|--------|----------|---------|-------------|--------------|-------|
| GET | `/api/bff/master-data/tax-rate` | 税率一覧取得 | ListTaxRatesRequest | ListTaxRatesResponse | 1.1–1.5 |
| GET | `/api/bff/master-data/tax-rate/:id` | 税率詳細取得 | - | GetTaxRateResponse | 3.1 |
| POST | `/api/bff/master-data/tax-rate` | 税率新規登録 | CreateTaxRateRequest | CreateTaxRateResponse | 2.1–2.7 |
| PUT | `/api/bff/master-data/tax-rate/:id` | 税率更新 | UpdateTaxRateRequest | UpdateTaxRateResponse | 3.1–3.6 |
| PATCH | `/api/bff/master-data/tax-rate/:id/deactivate` | 税率無効化 | DeactivateTaxRateRequest | DeactivateTaxRateResponse | 4.1–4.4 |
| PATCH | `/api/bff/master-data/tax-rate/:id/activate` | 税率有効化 | ActivateTaxRateRequest | ActivateTaxRateResponse | 4.4 |

**Naming Convention（必須）**
- DTO / Contracts: camelCase（例: `taxRateCode`, `ratePercent`）
- DB columns: snake_case（例: `tax_rate_code`, `rate_percent`）
- `sortBy` は **DTO側キー**を採用（例: `taxRateCode | ratePercent | validFrom`）

**Paging / Sorting Normalization（必須・BFF責務）**
- UI/BFF: page / pageSize（page-based）
- Domain API: offset / limit（DB-friendly）
- BFFは必ず以下を実施:
  - defaults: page=1, pageSize=20, sortBy=taxRateCode, sortOrder=asc
  - clamp: pageSize <= 200
  - whitelist: sortBy は `taxRateCode | ratePercent | validFrom | isActive` のみ
  - normalize: keyword trim、空→undefined
  - transform: offset=(page-1)*pageSize, limit=pageSize

**Transformation Rules（api DTO → bff DTO）**
- TaxRateApiDto → TaxRateDto: 1:1マッピング（フィールド名同一）
- 追加フィールドなし

**Error Policy（必須）**
- 採用方針: **Option A: Pass-through**
- 採用理由: 標準CRUDマスタであり、Domain APIエラーをそのまま返却で十分

**Authentication / Tenant Context**
- BFFはClerk認証からuser_idを解決
- tenant_idはユーザーに紐づくテナントから解決
- Domain APIへはヘッダー（X-Tenant-ID, X-User-ID）で伝搬

---

### Service Specification（Domain / apps/api）

**TaxRateService**

| Method | Purpose | Transaction | Audit | Notes |
|--------|---------|-------------|-------|-------|
| listTaxRates | 一覧取得 | Read | - | フィルタ、ソート、ページング |
| getTaxRate | 詳細取得 | Read | - | - |
| createTaxRate | 新規登録 | Write | Yes | 重複チェック、バリデーション |
| updateTaxRate | 更新 | Write | Yes | 税率値変更不可 |
| deactivateTaxRate | 無効化 | Write | Yes | is_active = false |
| activateTaxRate | 有効化 | Write | Yes | is_active = true |

**ビジネスルール（Domain API責務）**
- 税率コードの重複チェック（tenant_id + tax_rate_code）
- 適用期間の妥当性チェック（valid_from <= valid_to）
- 税率値の編集禁止（更新時に rate_percent 変更を拒否）
- 楽観ロック（version）

---

### Repository Specification（apps/api）

**TaxRateRepository**

```typescript
interface TaxRateRepository {
  findMany(tenantId: string, params: FindManyParams): Promise<{ items: TaxRate[]; total: number }>;
  findById(tenantId: string, id: string): Promise<TaxRate | null>;
  findByCode(tenantId: string, taxRateCode: string): Promise<TaxRate | null>;
  create(tenantId: string, data: CreateTaxRateData): Promise<TaxRate>;
  update(tenantId: string, id: string, data: UpdateTaxRateData, version: number): Promise<TaxRate>;
}
```

- tenant_id 必須（全メソッド）
- where句二重ガード必須
- set_config 前提（RLS無効化禁止）

**TaxBusinessCategoryRepository**

```typescript
interface TaxBusinessCategoryRepository {
  findMany(tenantId: string): Promise<TaxBusinessCategory[]>;
  findByCode(tenantId: string, code: string): Promise<TaxBusinessCategory | null>;
}
```

---

### Notes: 税区分（TaxBusinessCategory）の参照契約について

税区分は本機能（tax-rate）ではシードデータ投入のみを行い、API/BFF契約は定義しない。
税区分の参照用契約（ListTaxBusinessCategories等）は、**tax-code機能のdesign.md**にて定義する。
これは、税コードマスタが税区分をドロップダウン等で選択する際に必要となるためである。

---

### Contracts Summary（This Feature）

**packages/contracts/src/api/tax-rate/index.ts**

```typescript
// Sort Options
export type TaxRateSortBy = 'taxRateCode' | 'ratePercent' | 'validFrom' | 'isActive';
export type SortOrder = 'asc' | 'desc';

// TaxRateApiDto
export interface TaxRateApiDto {
  id: string;
  taxRateCode: string;
  ratePercent: string; // Decimal as string (e.g., "10.00")
  validFrom: string;   // ISO 8601 date
  validTo: string | null;
  isActive: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
}

// List
export interface ListTaxRatesApiRequest {
  offset: number;
  limit: number;
  sortBy?: TaxRateSortBy;
  sortOrder?: SortOrder;
  keyword?: string;
  isActive?: boolean;
}

export interface ListTaxRatesApiResponse {
  items: TaxRateApiDto[];
  total: number;
}

// Create
export interface CreateTaxRateApiRequest {
  taxRateCode: string;
  ratePercent: string; // Decimal as string
  validFrom: string;   // ISO 8601 date
  validTo?: string;
  isActive?: boolean;
}

export interface CreateTaxRateApiResponse {
  taxRate: TaxRateApiDto;
}

// Update (rate_percent is NOT updatable)
export interface UpdateTaxRateApiRequest {
  validFrom: string;
  validTo?: string;
  isActive: boolean;
  version: number;
}

export interface UpdateTaxRateApiResponse {
  taxRate: TaxRateApiDto;
}

// Deactivate / Activate
export interface DeactivateTaxRateApiRequest {
  version: number;
}

export interface DeactivateTaxRateApiResponse {
  taxRate: TaxRateApiDto;
}

export interface ActivateTaxRateApiRequest {
  version: number;
}

export interface ActivateTaxRateApiResponse {
  taxRate: TaxRateApiDto;
}
```

**packages/contracts/src/bff/tax-rate/index.ts**

```typescript
// Sort Options
export type TaxRateSortBy = 'taxRateCode' | 'ratePercent' | 'validFrom' | 'isActive';
export type SortOrder = 'asc' | 'desc';

// TaxRateDto
export interface TaxRateDto {
  id: string;
  taxRateCode: string;
  ratePercent: string;
  validFrom: string;
  validTo: string | null;
  isActive: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
}

// List
export interface ListTaxRatesRequest {
  page?: number;      // 1-based, default: 1
  pageSize?: number;  // default: 20, max: 200
  sortBy?: TaxRateSortBy;
  sortOrder?: SortOrder;
  keyword?: string;
  isActive?: boolean;
}

export interface ListTaxRatesResponse {
  items: TaxRateDto[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// Get
export interface GetTaxRateResponse {
  taxRate: TaxRateDto;
}

// Create
export interface CreateTaxRateRequest {
  taxRateCode: string;
  ratePercent: string;
  validFrom: string;
  validTo?: string;
  isActive?: boolean;
}

export interface CreateTaxRateResponse {
  taxRate: TaxRateDto;
}

// Update
export interface UpdateTaxRateRequest {
  validFrom: string;
  validTo?: string;
  isActive: boolean;
  version: number;
}

export interface UpdateTaxRateResponse {
  taxRate: TaxRateDto;
}

// Deactivate / Activate
export interface DeactivateTaxRateRequest {
  version: number;
}

export interface DeactivateTaxRateResponse {
  taxRate: TaxRateDto;
}

export interface ActivateTaxRateRequest {
  version: number;
}

export interface ActivateTaxRateResponse {
  taxRate: TaxRateDto;
}
```

**packages/contracts/src/api/errors/tax-rate-error.ts**

```typescript
export const TAX_RATE_ERROR_CODES = {
  TAX_RATE_NOT_FOUND: 'TAX_RATE_NOT_FOUND',
  TAX_RATE_CODE_DUPLICATE: 'TAX_RATE_CODE_DUPLICATE',
  INVALID_DATE_RANGE: 'INVALID_DATE_RANGE',
  VERSION_CONFLICT: 'VERSION_CONFLICT',
  RATE_PERCENT_NOT_EDITABLE: 'RATE_PERCENT_NOT_EDITABLE',
} as const;

export type TaxRateErrorCode = typeof TAX_RATE_ERROR_CODES[keyof typeof TAX_RATE_ERROR_CODES];
```

---

## Responsibility Clarification

### UIの責務
- 税率一覧のテーブル表示、ページネーション、ソート、フィルタ
- 新規登録・編集ダイアログの表示制御
- フォーム入力制御（税率コード・税率値の編集不可表示）
- 権限に基づくボタンの表示/非表示
- ビジネス判断は禁止

### BFFの責務
- page/pageSize → offset/limit 変換
- sortBy ホワイトリスト検証
- キーワードの正規化
- Domain API DTOからBFF DTOへの変換
- ビジネスルールの正本は持たない

### Domain APIの責務
- ビジネスルールの正本（重複チェック、日付範囲検証、税率値変更禁止）
- 権限・状態遷移の最終判断
- 監査ログ・整合性保証
- RLSによるテナント分離

---

## Data Models

### TaxRate（税率）

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

  @@unique([tenantId, taxRateCode])
  @@index([tenantId, taxRateCode])
  @@index([tenantId, isActive])
  @@index([tenantId, validFrom])
  @@map("tax_rates")
}
```

### TaxBusinessCategory（税区分）

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

  @@unique([tenantId, taxBusinessCategoryCode])
  @@index([tenantId, taxBusinessCategoryCode])
  @@index([tenantId, isActive])
  @@map("tax_business_categories")
}
```

### シードデータ（税区分）

| code | name | description |
|------|------|-------------|
| TAXABLE_SALES | 課税売上 | 消費税が課される売上取引 |
| TAXABLE_PURCHASE | 課税仕入 | 消費税が課される仕入取引 |
| COMMON_TAXABLE_PURCHASE | 共通課税仕入 | 課税売上・非課税売上に共通する仕入 |
| NON_TAXABLE | 非課税取引 | 消費税が課されない取引 |
| TAX_EXEMPT | 免税取引 | 輸出等の免税取引 |
| OUT_OF_SCOPE | 対象外取引 | 消費税の対象外となる取引 |

---

## UI Components

### TaxRatePage
- ルート: `/master-data/tax-rate`
- TaxRateList + TaxRateDialog を配置

### TaxRateList
- DataTable形式
- 列: 税率コード、税率（%）、適用開始日、適用終了日、有効フラグ
- 操作: 検索、ソート、ページネーション、行クリックで編集ダイアログ

### TaxRateDialog
- 新規登録/編集の切り替え
- 新規: 全フィールド入力可能
- 編集: 税率コード・税率値は読み取り専用

---

## Permission Mapping

| 権限 | UI操作 | API操作 |
|------|--------|---------|
| `procure.tax-rate.read` | 一覧表示、詳細表示 | GET endpoints |
| `procure.tax-rate.create` | 新規登録ボタン表示 | POST endpoint |
| `procure.tax-rate.update` | 編集・無効化・有効化ボタン表示 | PUT, PATCH endpoints |

---

## File Structure

```
packages/contracts/src/
├── api/tax-rate/index.ts
├── bff/tax-rate/index.ts
├── api/errors/tax-rate-error.ts
└── bff/errors/tax-rate-error.ts

apps/api/src/modules/master-data/tax-rate/
├── tax-rate.module.ts
├── controller/tax-rate.controller.ts
├── service/tax-rate.service.ts
├── repository/tax-rate.repository.ts
├── dto/
└── mappers/

apps/bff/src/modules/master-data/tax-rate/
├── tax-rate.module.ts
├── controller/tax-rate.controller.ts
├── service/tax-rate.service.ts
└── mappers/

apps/web/src/
├── app/master-data/tax-rate/page.tsx
└── features/master-data/tax-rate/
    ├── ui/
    │   ├── components/
    │   │   ├── TaxRateList.tsx
    │   │   └── TaxRateDialog.tsx
    │   ├── api/
    │   │   ├── BffClient.ts
    │   │   ├── HttpBffClient.ts
    │   │   └── MockBffClient.ts
    │   └── types/
    └── index.ts

packages/db/prisma/
├── schema.prisma (TaxRate, TaxBusinessCategory追加)
└── seed/tax-business-category.seed.ts
```
