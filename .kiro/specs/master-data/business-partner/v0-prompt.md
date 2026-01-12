# v0 Prompt: Business Partner Master (取引先系マスタ)

Use the ProcurERP Design System from: https://epm-registry-6xtkaywr0-tkoizumi-hira-tjps-projects.vercel.app

---

## Context

You are generating UI for ProcurERP (調達管理SaaS). The project uses SDD/CCSDD.
UI must follow boundary rules and must be easy to hand off to Cursor for implementation.

---

## Non-Negotiable Rules

* UI must call ONLY BFF endpoints (never call Domain API directly).
* UI must use ONLY `packages/contracts/src/bff` DTOs and errors.
* UI must NOT import or reference `packages/contracts/src/api`.
* Implement UI behavior, state, validation, and UX only. No business rules or domain authority in UI.
* Start with mock data (in the same shape as BFF DTOs). Later we will swap to real BFF calls.

---

## Feature

**Feature Name**: master-data/business-partner (取引先系マスタ)

**Description**: 取引先法人（Party）、仕入先拠点（SupplierSite）、支払先（Payee）の管理機能。取引先を起点として、配下の仕入先拠点・支払先をドリルダウンで管理する。

---

## Screens to build

### 1. 取引先一覧画面（Party List Screen）

**Purpose**: 取引先法人の一覧表示・検索・登録・編集

**Main Interactions**:
- テーブルで取引先を一覧表示（ページング、ソート、検索）
- 検索条件: キーワード（取引先コード・名称・名称カナ）、仕入先フラグ、得意先フラグ
- 「新規登録」ボタン → 取引先登録ダイアログ
- 行クリック → 取引先詳細ダイアログ（編集可能）
- 「仕入先」ボタン/リンク（各行に表示）→ 仕入先・支払先管理画面へ遷移（partyIdを渡す）

**Table Columns**:
- 取引先コード（party_code）
- 取引先名（party_name）
- 取引先名カナ（party_name_kana）
- 仕入先（is_supplier: boolean → 「○」「-」表示）
- 得意先（is_customer: boolean → 「○」「-」表示）
- 有効（is_active: boolean → 「有効」「無効」表示）
- 操作（編集ボタン、仕入先リンク）

**Pagination**:
- page (1-based), pageSize (default: 50, max: 200)
- totalPages 表示

**Sort**:
- sortBy: partyCode, partyName, partyNameKana, isSupplier, isCustomer, isActive
- sortOrder: asc, desc

### 2. 取引先詳細ダイアログ（Party Detail Dialog）

**Purpose**: 取引先の登録・編集

**Form Fields**:
- 取引先コード（party_code）: 10桁、自動正規化（trim・半角化・大文字統一）
- 取引先名（party_name）: 必須
- 取引先名カナ（party_name_kana）: 任意
- 有効（is_active）: boolean（デフォルト: true）
- 備考（remarks）: 任意、テキストエリア

**Validation**:
- party_code: 10桁必須、重複エラー（PARTY_CODE_DUPLICATE）
- party_name: 必須

**Error Handling**:
- PARTY_CODE_DUPLICATE: 「取引先コードが重複しています」
- INVALID_CODE_LENGTH: 「取引先コードは10桁で入力してください」
- CONCURRENT_UPDATE: 「他のユーザーによって更新されています。再度読み込んでください」

### 3. 仕入先・支払先管理画面（SupplierSite & Payee Management Screen）

**Purpose**: 選択した取引先配下の仕入先拠点・支払先を管理

**URL Parameters**:
- partyId: 選択した取引先のID

**Layout**:
- ページ上部: 選択した取引先の情報を表示（「取引先: ○○商事」等）
- タブ切り替え: [仕入先拠点] / [支払先]
- 各タブでテーブル表示（ページング、ソート、検索）

**Tab 1: 仕入先拠点一覧（SupplierSite List）**

**Table Columns**:
- 仕入先コード（supplier_code: party_code + "-" + supplier_sub_code、最大21文字）
- 仕入先名（supplier_name）
- 仕入先名カナ（supplier_name_kana）
- 郵便番号（postal_code）
- 住所（都道府県 + 市区町村 + 住所1）
- 電話（phone）
- 有効（is_active）
- 操作（編集ボタン）

**Actions**:
- 「新規登録」ボタン → 仕入先拠点登録ダイアログ
- 行クリック → 仕入先拠点詳細ダイアログ（編集可能）

**Tab 2: 支払先一覧（Payee List）**

**Table Columns**:
- 支払先コード（payee_code: party_code + "-" + payee_sub_code、最大21文字）
- 支払先名（payee_name）
- 支払先名カナ（payee_name_kana）
- 郵便番号（postal_code）
- 住所（都道府県 + 市区町村 + 住所1）
- 電話（phone）
- 支払方法（payment_method）
- 通貨（currency_code）
- 有効（is_active）
- 操作（編集ボタン）

**Actions**:
- 「新規登録」ボタン → 支払先登録ダイアログ
- 行クリック → 支払先詳細ダイアログ（編集可能）

### 4. 仕入先拠点登録ダイアログ（SupplierSite Create Dialog）

**Purpose**: 仕入先拠点の登録（支払先を3択で選択）

**Form Sections**:

**基本情報**:
- 仕入先コード（枝番）（supplier_sub_code）: 10桁、自動正規化
- 仕入先名（supplier_name）: 必須
- 仕入先名カナ（supplier_name_kana）: 任意
- 住所・連絡先:
  - 郵便番号（postal_code）
  - 都道府県（prefecture）
  - 市区町村（city）
  - 住所1（address_line1）
  - 住所2（address_line2）
  - 電話（phone）
  - FAX（fax）
  - メール（email）
  - 担当者名（contact_name）

**支払先設定（3択、ラジオボタン）**:

**○ 同一（デフォルト推奨）**:
- ラベル: 「仕入先と同じ住所・名称で支払先を自動生成」
- 選択時: 何も入力不要、バックエンドで自動生成（payeeId未指定）

**○ 既存の支払先を選択**:
- ラベル: 「既存の支払先を選択」
- 選択時: 「支払先を選択」ボタンを表示
- ボタンクリック → 支払先選択ダイアログ（同一party_idのPayeeのみ表示）
- 選択後、選択した支払先の情報（コード・名称）を表示

**○ 新規の支払先を同時登録**:
- ラベル: 「新規の支払先を同時登録」
- 選択時: 以下の入力欄が展開（アコーディオン形式）:
  - 支払先コード（枝番）（payee_sub_code）: 10桁、自動正規化
  - 支払先名（payee_name）: 必須
  - 支払先名カナ（payee_name_kana）: 任意
  - 住所・連絡先（仕入先と同じフォーム）
  - 支払方法（payment_method）: 任意
  - 通貨（currency_code）: 任意
  - 支払条件（payment_terms_text）: 任意、テキストエリア

**Validation**:
- supplier_sub_code: 10桁必須、重複エラー（SUPPLIER_CODE_DUPLICATE）
- supplier_name: 必須
- payee_sub_code（新規の場合）: 10桁必須

**Error Handling**:
- SUPPLIER_CODE_DUPLICATE: 「仕入先コードが重複しています」
- PAYEE_CODE_DUPLICATE: 「支払先コードが重複しています」
- INVALID_CODE_LENGTH: 「コードは10桁で入力してください」

### 5. 支払先選択ダイアログ（Payee Selection Dialog）

**Purpose**: 既存の支払先を選択（同一party_idのPayeeのみ表示）

**Table Columns**:
- 支払先コード（payee_code）
- 支払先名（payee_name）
- 郵便番号（postal_code）
- 住所（都道府県 + 市区町村 + 住所1）
- 選択ボタン

**Actions**:
- 「選択」ボタンクリック → 選択した支払先を親ダイアログに反映してダイアログを閉じる

### 6. 仕入先拠点詳細ダイアログ（SupplierSite Edit Dialog）

**Purpose**: 仕入先拠点の編集

**Form Fields**: 仕入先拠点登録ダイアログと同じ（基本情報のみ、支払先は変更不可）

**Note**: payee_idは初回作成時のみ設定可能、編集時は変更不可

### 7. 支払先詳細ダイアログ（Payee Detail Dialog）

**Purpose**: 支払先の登録・編集

**Form Fields**:
- 支払先コード（枝番）（payee_sub_code）: 10桁、自動正規化
- 支払先名（payee_name）: 必須
- 支払先名カナ（payee_name_kana）: 任意
- 住所・連絡先（SupplierSiteと同じフォーム）
- 支払方法（payment_method）: 任意
- 通貨（currency_code）: 任意
- 支払条件（payment_terms_text）: 任意、テキストエリア
- 有効（is_active）: boolean

---

## BFF Specification (from design.md)

### Endpoints (UI -> BFF)

| Method | Endpoint | Purpose | Request DTO | Response DTO |
|--------|----------|---------|-------------|--------------|
| GET | /api/bff/master-data/business-partner/parties | Party一覧取得 | ListPartiesRequest | ListPartiesResponse |
| GET | /api/bff/master-data/business-partner/parties/:id | Party取得 | - | GetPartyResponse |
| POST | /api/bff/master-data/business-partner/parties | Party作成 | CreatePartyRequest | CreatePartyResponse |
| PUT | /api/bff/master-data/business-partner/parties/:id | Party更新 | UpdatePartyRequest | UpdatePartyResponse |
| GET | /api/bff/master-data/business-partner/supplier-sites | SupplierSite一覧取得 | ListSupplierSitesRequest | ListSupplierSitesResponse |
| GET | /api/bff/master-data/business-partner/supplier-sites/:id | SupplierSite取得 | - | GetSupplierSiteResponse |
| POST | /api/bff/master-data/business-partner/supplier-sites | SupplierSite作成 | CreateSupplierSiteRequest | CreateSupplierSiteResponse |
| PUT | /api/bff/master-data/business-partner/supplier-sites/:id | SupplierSite更新 | UpdateSupplierSiteRequest | UpdateSupplierSiteResponse |
| DELETE | /api/bff/master-data/business-partner/supplier-sites/:id | SupplierSite削除 | - | - |
| GET | /api/bff/master-data/business-partner/payees | Payee一覧取得 | ListPayeesRequest | ListPayeesResponse |
| GET | /api/bff/master-data/business-partner/payees/:id | Payee取得 | - | GetPayeeResponse |
| POST | /api/bff/master-data/business-partner/payees | Payee作成 | CreatePayeeRequest | CreatePayeeResponse |
| PUT | /api/bff/master-data/business-partner/payees/:id | Payee更新 | UpdatePayeeRequest | UpdatePayeeResponse |

### DTOs to use (contracts/bff)

**PartyDto**:
```typescript
{
  id: string;
  partyCode: string;
  partyName: string;
  partyNameKana: string | null;
  isSupplier: boolean;
  isCustomer: boolean;
  isActive: boolean;
  remarks: string | null;
  version: number;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  createdBy: string | null;
  updatedBy: string | null;
}
```

**SupplierSiteDto**:
```typescript
{
  id: string;
  partyId: string;
  supplierSubCode: string;
  supplierCode: string; // party_code + "-" + supplier_sub_code
  supplierName: string;
  supplierNameKana: string | null;
  payeeId: string;
  postalCode: string | null;
  prefecture: string | null;
  city: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  phone: string | null;
  fax: string | null;
  email: string | null;
  contactName: string | null;
  isActive: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
}
```

**PayeeDto**:
```typescript
{
  id: string;
  partyId: string;
  payeeSubCode: string;
  payeeCode: string; // party_code + "-" + payee_sub_code
  payeeName: string;
  payeeNameKana: string | null;
  postalCode: string | null;
  prefecture: string | null;
  city: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  phone: string | null;
  fax: string | null;
  email: string | null;
  contactName: string | null;
  paymentMethod: string | null;
  currencyCode: string | null;
  paymentTermsText: string | null;
  isActive: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
}
```

**ListPartiesRequest**:
```typescript
{
  page?: number; // 1-based, default: 1
  pageSize?: number; // default: 50, max: 200
  sortBy?: PartySortBy; // 'partyCode' | 'partyName' | 'partyNameKana' | 'isSupplier' | 'isCustomer' | 'isActive'
  sortOrder?: SortOrder; // 'asc' | 'desc'
  keyword?: string; // partial match on partyCode, partyName, partyNameKana
  isSupplier?: boolean;
  isCustomer?: boolean;
}
```

**ListPartiesResponse**:
```typescript
{
  items: PartyDto[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}
```

**CreatePartyRequest**:
```typescript
{
  partyCode: string;
  partyName: string;
  partyNameKana?: string;
  remarks?: string;
  isActive?: boolean; // default: true
}
```

**CreateSupplierSiteRequest**:
```typescript
{
  partyId: string;
  supplierSubCode: string;
  supplierName: string;
  supplierNameKana?: string;
  payeeId?: string; // 未指定時は自動生成（「同一」選択時）
  payeeSubCode?: string; // 新規支払先同時登録時のみ
  payeeName?: string; // 新規支払先同時登録時のみ
  payeeNameKana?: string; // 新規支払先同時登録時のみ
  postalCode?: string;
  prefecture?: string;
  city?: string;
  addressLine1?: string;
  addressLine2?: string;
  phone?: string;
  fax?: string;
  email?: string;
  contactName?: string;
  // 新規支払先同時登録時の支払先固有フィールド
  paymentMethod?: string;
  currencyCode?: string;
  paymentTermsText?: string;
}
```

**Error Codes**:
```typescript
{
  PARTY_NOT_FOUND: 'PARTY_NOT_FOUND', // 404
  PARTY_CODE_DUPLICATE: 'PARTY_CODE_DUPLICATE', // 409
  SUPPLIER_SITE_NOT_FOUND: 'SUPPLIER_SITE_NOT_FOUND', // 404
  SUPPLIER_CODE_DUPLICATE: 'SUPPLIER_CODE_DUPLICATE', // 409
  PAYEE_NOT_FOUND: 'PAYEE_NOT_FOUND', // 404
  PAYEE_CODE_DUPLICATE: 'PAYEE_CODE_DUPLICATE', // 409
  INVALID_CODE_LENGTH: 'INVALID_CODE_LENGTH', // 422
  REQUIRED_FIELD_MISSING: 'REQUIRED_FIELD_MISSING', // 422
  CONCURRENT_UPDATE: 'CONCURRENT_UPDATE', // 409
}
```

### DTO import example (MANDATORY)

You MUST import DTO types from contracts/bff (do NOT redefine types in UI).

```typescript
import type {
  PartyDto,
  SupplierSiteDto,
  PayeeDto,
  ListPartiesRequest,
  ListPartiesResponse,
  CreatePartyRequest,
  CreatePartyResponse,
  UpdatePartyRequest,
  UpdatePartyResponse,
  ListSupplierSitesRequest,
  ListSupplierSitesResponse,
  CreateSupplierSiteRequest,
  CreateSupplierSiteResponse,
  UpdateSupplierSiteRequest,
  UpdateSupplierSiteResponse,
  ListPayeesRequest,
  ListPayeesResponse,
  CreatePayeeRequest,
  CreatePayeeResponse,
  UpdatePayeeRequest,
  UpdatePayeeResponse,
  PartySortBy,
  SortOrder,
} from "packages/contracts/src/bff/business-partner";
// or (if alias exists)
// import type { ... } from "@contracts/bff/business-partner";
```

### Error UI behavior

* Show validation errors inline per field
* Show API/business errors in a top alert panel
* Map error codes to user-friendly Japanese messages:
  - PARTY_CODE_DUPLICATE: 「取引先コードが重複しています」
  - SUPPLIER_CODE_DUPLICATE: 「仕入先コードが重複しています」
  - PAYEE_CODE_DUPLICATE: 「支払先コードが重複しています」
  - INVALID_CODE_LENGTH: 「コードは10桁で入力してください」
  - CONCURRENT_UPDATE: 「他のユーザーによって更新されています。再度読み込んでください」
  - REQUIRED_FIELD_MISSING: 「必須項目が入力されていません」

---

## UI Output Requirements

Generate Next.js (App Router) + TypeScript + Tailwind UI.
Include:

1. Routes/pages for the screens (**page.tsx only; see "No layout.tsx" rule below**)
2. A typed `BffClient` interface (methods correspond to endpoints above)
3. `MockBffClient` returning sample DTO-shaped data (realistic Japanese company names)
4. `HttpBffClient` with fetch wrappers (but keep it unused initially, easy to switch)
5. Data models in UI must be the DTO types from contracts/bff
6. Minimal but production-like UI (tables, forms, search, pagination)

---

## Mock Data Requirements

Provide mock data sets that:

* cover empty state, typical state, and error state
* use realistic values for Japanese procurement domain (company names, addresses, phone numbers)
* strictly match the BFF response DTO shape

**Example Mock Data**:

```typescript
// Party mock data
{
  id: "party-001",
  partyCode: "P000000001",
  partyName: "株式会社サンプル商事",
  partyNameKana: "カブシキガイシャサンプルショウジ",
  isSupplier: true,
  isCustomer: false,
  isActive: true,
  remarks: null,
  version: 1,
  createdAt: "2024-01-15T09:00:00Z",
  updatedAt: "2024-01-15T09:00:00Z",
  createdBy: "user-001",
  updatedBy: "user-001",
}

// SupplierSite mock data
{
  id: "supplier-site-001",
  partyId: "party-001",
  supplierSubCode: "0000000001",
  supplierCode: "P000000001-0000000001",
  supplierName: "株式会社サンプル商事 東京本社",
  supplierNameKana: "カブシキガイシャサンプルショウジ トウキョウホンシャ",
  payeeId: "payee-001",
  postalCode: "100-0001",
  prefecture: "東京都",
  city: "千代田区",
  addressLine1: "丸の内1-1-1",
  addressLine2: "サンプルビル3F",
  phone: "03-1234-5678",
  fax: "03-1234-5679",
  email: "tokyo@sample.co.jp",
  contactName: "山田太郎",
  isActive: true,
  version: 1,
  createdAt: "2024-01-15T10:00:00Z",
  updatedAt: "2024-01-15T10:00:00Z",
  createdBy: "user-001",
  updatedBy: "user-001",
}
```

---

## Authentication / Tenant

* UI only attaches auth token to BFF requests.
* UI must not handle tenant_id directly.

---

# 🔒 REQUIRED: Design System & Repository Constraints (DO NOT REMOVE)

## ProcurERP Design System Registry

You MUST use the ProcurERP Design System from the custom registry:

* Registry URL: https://epm-registry-6xtkaywr0-tkoizumi-hira-tjps-projects.vercel.app
* Theme: ProcurERP Theme - Deep Teal & Royal Indigo
* Primary Color: Deep Teal (oklch(0.52 0.13 195))
* Secondary Color: Royal Indigo (oklch(0.48 0.15 280))

---

## Design System Compliance

* Do NOT invent new base UI components (Button/Input/Table/Dialog/Tabs/etc).
* You MUST use Tier 1 components by default (from ProcurERP Registry).
* Do NOT create new "base UI" components under `apps/web/src/features/**`.

### Available Tier 1 Components (ProcurERP Registry)
* Button (primary=Deep Teal, secondary=Royal Indigo, destructive, outline, ghost, link)
* Table (with Header, Body, Row, Cell, Caption)
* Card (with Header, Title, Description, Content, Footer)
* Input (text, email, password, number, etc.)
* Dialog (with Trigger, Content, Header, Footer, Title, Description)
* Tabs (with List, Trigger, Content)
* Badge (default, secondary, destructive, outline)
* Alert (default, destructive with AlertTitle, AlertDescription)
* Separator (horizontal, vertical)
* Pagination (with Previous, Next, Item, Ellipsis)

### UI component import entrypoint (MANDATORY)
* UI components MUST be imported ONLY from: `@/shared/ui`
* Assume `@/shared/ui` is a barrel entry that re-exports shared UI components.
* If the barrel entry does NOT exist yet:
  * Do NOT create it inside feature folders.
  * Do NOT import directly from `apps/web/src/shared/ui/components/*`.
  * Instead, add a TODO under `Missing Shared Component / Pattern` in OUTPUT.md describing what barrel export is needed.

### Colors / spacing

* Do NOT hardcode colors (no `bg-[#...]`, no arbitrary color values).
* Use tokens / CSS variables / existing Tailwind semantic classes.
* Keep spacing and radius consistent:
  * use Tailwind scale (p-4, gap-4, rounded-lg, etc.)
  * avoid arbitrary values like `p-[16px]`.

---

## App Shell / Layout (MANDATORY)

* The screens must render inside the App Shell layout.
* Do NOT create a new sidebar/header layout inside the feature.
* Feature UI should be only the content area (cards/tables/forms/etc).

---

## v0 Isolation Output Path (MANDATORY)

* Write all generated code ONLY under:
  * `apps/web/_v0_drop/master-data/business-partner/src`
* Assume this `src/` folder will later be moved to:
  * `apps/web/src/features/master-data/business-partner/`
* Do NOT write to apps/web/src directly.
* Do NOT place source files outside the `src/` folder under `_v0_drop` (src-only).

---

## Prohibited Imports / Calls (MANDATORY)

### Imports / Contracts

* UI must NOT import from `packages/contracts/src/api`.
* UI must use `packages/contracts/src/bff` DTOs and errors only.
* Do NOT redefine DTO/Enum/Error types inside feature code (contracts are SSoT).

### Network Access

* UI must NOT call Domain API directly (no `/api/...` calls).
* UI must NOT create direct `fetch()` calls outside HttpBffClient wrapper.
* Direct `fetch()` is allowed ONLY inside:
  * `apps/web/_v0_drop/master-data/business-partner/src/api/HttpBffClient.ts`

### App Router / Shell

* Do NOT generate `layout.tsx` anywhere under the v0 output.
* Do NOT create a new sidebar/header/shell layout inside the feature.
* All screens MUST render inside the existing AppShell.

### Output Location

* Write ALL generated code ONLY under:
  * `apps/web/_v0_drop/master-data/business-partner/src`
* Do NOT write to `apps/web/src` directly.

---

## 🔻 REQUIRED OUTPUT ARTIFACT (MANDATORY)

You MUST create an `OUTPUT.md` file under:

* `apps/web/_v0_drop/master-data/business-partner/src/OUTPUT.md`

`OUTPUT.md` MUST include the following sections:

### 1) Generated files (tree)

* Provide a complete tree of everything you generated under the `src/` folder.

### 2) Key imports / dependency notes

* List important imports and where they come from:
  * `@/shared/ui` usage
  * `packages/contracts/src/bff` DTO imports
  * `BffClient` / `MockBffClient` / `HttpBffClient` relationships

### 3) Missing Shared Component / Pattern (TODO)

* A TODO list of any shared UI components/patterns you wanted but did not exist.
* Include suggested filenames and where they should live (shared/ui side).
* Do NOT implement them in the feature.

### 4) Migration notes (_v0_drop → features)

* Step-by-step migration plan:
  * what folder to move
  * what paths/imports will change
  * what should be refactored into shared/ui (if any)

### 5) Constraint compliance checklist

* Check all items explicitly:
  * [ ] Code written ONLY under `apps/web/_v0_drop/master-data/business-partner/src`
  * [ ] UI components imported ONLY from `@/shared/ui`
  * [ ] DTO types imported from `packages/contracts/src/bff` (no UI re-definition)
  * [ ] No imports from `packages/contracts/src/api`
  * [ ] No Domain API direct calls (/api/)
  * [ ] No direct fetch() outside `api/HttpBffClient.ts`
  * [ ] No layout.tsx generated
  * [ ] No base UI components created under features
  * [ ] No raw color literals (bg-[#...], etc.)
  * [ ] No new sidebar/header/shell created inside the feature

---

## Handoff to Cursor

* Keep code modular and easy to migrate into:
  * `apps/web/src/features/master-data/business-partner/`
* Add brief migration notes in OUTPUT.md (what to move, what to refactor into shared/ui).

---

## Special Instructions for Business Partner Feature

### 支払先3択UI実装の詳細

仕入先拠点登録ダイアログでの支払先設定は、以下のように実装してください：

1. **ラジオボタン3択**:
   - デフォルトは「同一」を選択済み
   - 選択に応じて表示内容を動的に変更

2. **「同一」選択時**:
   - 何も追加表示しない（最もシンプル）
   - バックエンドに送信時は `payeeId: undefined` とする

3. **「既存選択」選択時**:
   - 「支払先を選択」ボタンを表示
   - ボタンクリックで支払先選択ダイアログを開く
   - 選択後、選択した支払先の情報（コード・名称）を表示
   - バックエンドに送信時は選択した `payeeId` を送信

4. **「新規登録」選択時**:
   - 支払先の入力欄を展開表示（アコーディオン）
   - 必須フィールド: payeeSubCode, payeeName
   - 任意フィールド: payeeNameKana, 住所・連絡先, paymentMethod, currencyCode, paymentTermsText
   - バックエンドに送信時は `payeeId: undefined` + 支払先フィールドをすべて送信

### URL State Management

取引先一覧画面では、以下のパラメータをURLクエリで管理してください：

- page
- pageSize
- sortBy
- sortOrder
- keyword
- isSupplier
- isCustomer

### Debounce

keyword検索は300msのdebounceを適用してください。

### 日本語UI

すべてのラベル・メッセージ・プレースホルダーは日本語で表示してください。
