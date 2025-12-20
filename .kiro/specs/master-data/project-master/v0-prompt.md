# v0 Prompt - プロジェクトマスタ (Project Master)

<!-- このプロンプトを v0.dev にコピー&貼り付けしてください -->

---

## Context

You are generating UI for an EPM SaaS. The project uses SDD/CCSDD.
UI must follow boundary rules and must be easy to hand off to Cursor for implementation.

---

## EPM Design System (MANDATORY - READ FIRST)

### 🎨 Design System Source of Truth

You MUST follow the EPM Design System defined in `.kiro/steering/epm-design-system.md` (973 lines).

**Key Design Principles:**
- **Modern, clean, minimalist** aesthetic
- **Accessibility-first** (WCAG 2.1 AA compliant)
- **Consistent spacing** (0.25rem/4px base unit)
- **Dark mode support** (automatic theme switching)

### Color Palette (MANDATORY)

**Primary - Deep Teal:**
```css
--primary-500: oklch(0.52 0.13 195); /* Main Deep Teal */
```

**Secondary - Royal Indigo:**
```css
--secondary-500: oklch(0.48 0.15 280); /* Main Royal Indigo */
```

**Semantic Colors:**
```css
--success: oklch(0.65 0.18 150);  /* Green for success states */
--warning: oklch(0.75 0.15 70);   /* Amber for warnings */
--error: oklch(0.6 0.22 25);      /* Red for errors */
--info: oklch(0.6 0.15 240);      /* Blue for info */
```

**Color Usage Rules:**
- ✅ Use CSS variables: `bg-primary`, `text-secondary`, `border-error`
- ✅ Use semantic tokens: `bg-background`, `text-foreground`, `border-input`
- ❌ NEVER use raw color literals: `bg-[#14b8a6]`, `text-[oklch(...)]`
- ❌ NEVER use arbitrary Tailwind colors: `bg-teal-500`, `text-indigo-600`

### Typography System

**Font Family:**
- Sans: `Geist`, `Geist Fallback` (default)
- Mono: `Geist Mono`, `Geist Mono Fallback` (code)

**Type Scale:**
```
Heading 1: text-4xl font-bold tracking-tight
Heading 2: text-3xl font-bold tracking-tight
Heading 3: text-2xl font-semibold tracking-tight
Heading 4: text-xl font-semibold
Body:      text-base leading-relaxed
Small:     text-sm leading-relaxed
Muted:     text-sm text-muted-foreground
```

### Spacing System

**Base Unit:** 0.25rem (4px)

**Common Spacing:**
```
gap-2    (8px)   - tight spacing
gap-4    (16px)  - default spacing
gap-6    (24px)  - section spacing
gap-8    (32px)  - major section spacing
gap-12   (48px)  - page section spacing
```

**Padding Scale:**
```
p-2   (8px)   - compact
p-4   (16px)  - default
p-6   (24px)  - comfortable
p-8   (32px)  - spacious
```

**DO NOT use arbitrary values:** `p-[16px]`, `gap-[20px]`

### Border Radius

```
rounded-sm   (0.125rem) - subtle corners
rounded-md   (0.375rem) - default
rounded-lg   (0.5rem)   - cards, panels
rounded-xl   (0.75rem)  - hero sections
```

### Available Components by Tier

**Tier 1 (Standard / MUST Prefer):**
- Button, Input, Textarea, Label, Checkbox, Switch, Radio Group, Select
- Card, Alert, Badge, Separator, Spinner, Skeleton
- Table, Pagination, Tabs, Dialog, Alert Dialog
- Toast/Toaster/Sonner, Popover, Tooltip
- Dropdown Menu, Scroll Area, Breadcrumb

**Tier 2 (Allowed / Use When Needed):**
- Calendar, Sheet, Drawer, Command, Sidebar, Progress
- Accordion, Collapsible, Navigation Menu, Menubar, Context Menu
- Resizable, Slider, Hover Card, Avatar, Input OTP
- **Chart** (for dashboards/reports with approved patterns)
- Button Group, Input Group, Field, Empty State, KBD, Item
- Form (react-hook-form integration)

**Tier 3 (Avoid by Default):**
- Carousel, Aspect Ratio

**Component Import Rules:**
```typescript
// ✅ CORRECT - Use barrel export
import { Button, Table, Card, Dialog, Input, Badge, Alert } from '@/shared/ui'

// ❌ WRONG - Direct component imports
import { Button } from '@/shared/ui/components/button'
import Button from '../../../shared/ui/components/button'
```

### Dark Mode Support

All generated UI must support dark mode automatically:
```typescript
// Tailwind classes automatically adapt
<div className="bg-background text-foreground border-border">
  <Button className="bg-primary text-primary-foreground">
    Primary Action
  </Button>
</div>
```

**DO NOT manually implement dark mode variants.** Use semantic tokens and they will adapt automatically.

---

## Non-Negotiable Rules

* UI must call ONLY BFF endpoints (never call Domain API directly).
* UI must use ONLY `packages/contracts/src/bff` DTOs and errors.
* UI must NOT import or reference `packages/contracts/src/api`.
* Implement UI behavior, state, validation, and UX only. No business rules or domain authority in UI.
* Start with mock data (in the same shape as BFF DTOs). Later we will swap to real BFF calls.

---

## Feature

**プロジェクトマスタ (Project Master) - CRUD機能**

EPM SaaSにおけるプロジェクト情報の登録・管理機能。プロジェクトコード、プロジェクト正式名、プロジェクト略名、プロジェクトカナ名、部門コード、担当者コード、担当者名、プロジェクト予定期間From/To、プロジェクト実績From/To、プロジェクト予算金額を管理する。

---

## Screens to build

### 1. プロジェクトマスタ一覧画面 (Project List)
- **Purpose**: プロジェクト情報の一覧表示、検索、ページネーション
- **Main interactions**:
  - テーブル表示（プロジェクトコード、プロジェクト正式名、プロジェクト略名、部門コード、担当者コード、予定期間From/To、予算金額、ステータス）
  - 検索フィルタ（プロジェクトコード、プロジェクト正式名、プロジェクト略名、部門コード、担当者コード）
  - 有効/無効切り替えフィルタ
  - ページネーション（デフォルト50件、最大200件）
  - ソート（プロジェクトコード、プロジェクト正式名、プロジェクト略名、予定期間From、予算金額）
  - 新規登録ボタン → 作成ダイアログ表示
  - 行クリック → 詳細ダイアログ表示

### 2. プロジェクトマスタ作成ダイアログ (Create Dialog)
- **Purpose**: 新しいプロジェクト情報の登録
- **Main interactions**:
  - フォーム入力（プロジェクトコード、プロジェクト正式名、プロジェクト略名、プロジェクトカナ名、部門コード、担当者コード、担当者名、予定期間From/To、実績From/To、予算金額）
  - バリデーション（必須項目チェック、日付範囲チェック）
  - 作成ボタン → BFF POST リクエスト
  - キャンセルボタン
  - エラー表示（重複エラー、バリデーションエラー）

### 3. プロジェクトマスタ詳細・編集ダイアログ (Detail/Edit Dialog)
- **Purpose**: プロジェクト情報の詳細表示と編集
- **Main interactions**:
  - 詳細情報表示（全フィールド、version含む、作成日時、更新日時）
  - 編集モード切替
  - フォーム入力（プロジェクト正式名、プロジェクト略名、プロジェクトカナ名、部門コード、担当者コード、担当者名、予定期間From/To、実績From/To、予算金額）※プロジェクトコードは変更不可
  - 楽観ロック（ifMatchVersionをリクエストに含める）
  - 更新ボタン → BFF PATCH リクエスト
  - 無効化ボタン → BFF POST deactivate リクエスト
  - 再有効化ボタン → BFF POST reactivate リクエスト
  - キャンセルボタン
  - エラー表示（楽観ロック競合、バリデーションエラー）

---

## BFF Specification (from design.md)

### Endpoints (UI -> BFF)

| Method | Endpoint | Purpose | Request DTO | Response DTO |
| ------ | -------- | ------- | ----------- | ------------ |
| GET | `/api/bff/master-data/project-master` | 一覧検索 | `ListProjectMasterRequest` | `ListProjectMasterResponse` |
| GET | `/api/bff/master-data/project-master/:id` | 詳細取得 | - | `ProjectMasterDetailResponse` |
| POST | `/api/bff/master-data/project-master` | 作成 | `CreateProjectMasterRequest` | `ProjectMasterDetailResponse` |
| PATCH | `/api/bff/master-data/project-master/:id` | 更新 | `UpdateProjectMasterRequest` | `ProjectMasterDetailResponse` |
| POST | `/api/bff/master-data/project-master/:id/deactivate` | 無効化 | - | `ProjectMasterDetailResponse` |
| POST | `/api/bff/master-data/project-master/:id/reactivate` | 再有効化 | - | `ProjectMasterDetailResponse` |

---

## DTOs to use (contracts/bff)

### Request DTOs

**ListProjectMasterRequest:**
```typescript
{
  page?: number;              // default: 1
  pageSize?: number;          // default: 50, max: 200
  sortBy?: 'projectCode' | 'projectName' | 'projectShortName' | 'plannedPeriodFrom' | 'budgetAmount'; // default: 'projectCode'
  sortOrder?: 'asc' | 'desc'; // default: 'asc'
  projectCode?: string;       // 検索条件（完全一致）
  projectName?: string;       // 検索条件（部分一致）
  projectShortName?: string;  // 検索条件（部分一致）
  departmentCode?: string;    // 検索条件
  responsibleEmployeeCode?: string; // 検索条件
  includeInactive?: boolean; // default: false（有効なプロジェクトのみ表示）
}
```

**CreateProjectMasterRequest:**
```typescript
{
  projectCode: string;        // 必須、テナント内で一意
  projectName: string;        // 必須
  projectShortName?: string | null; // 任意
  projectKanaName?: string | null; // 任意
  departmentCode?: string | null; // 任意
  responsibleEmployeeCode?: string | null; // 任意
  responsibleEmployeeName?: string | null; // 任意
  plannedPeriodFrom: string;  // 必須、ISO 8601
  plannedPeriodTo: string;   // 必須、ISO 8601
  actualPeriodFrom?: string | null; // 任意、ISO 8601
  actualPeriodTo?: string | null; // 任意、ISO 8601
  budgetAmount: string;       // 必須、decimal string
}
```

**UpdateProjectMasterRequest:**
```typescript
{
  ifMatchVersion: number;     // 必須、楽観ロック用バージョン
  projectName?: string;       // 任意
  projectShortName?: string | null; // 任意
  projectKanaName?: string | null; // 任意
  departmentCode?: string | null; // 任意
  responsibleEmployeeCode?: string | null; // 任意
  responsibleEmployeeName?: string | null; // 任意
  plannedPeriodFrom?: string; // 任意、ISO 8601
  plannedPeriodTo?: string;  // 任意、ISO 8601
  actualPeriodFrom?: string | null; // 任意、ISO 8601
  actualPeriodTo?: string | null; // 任意、ISO 8601
  budgetAmount?: string;      // 任意、decimal string
  // ⚠️ projectCode は含めない（作成後に変更不可）
}
```

### Response DTOs

**ListProjectMasterResponse:**
```typescript
{
  items: ProjectMasterListItem[];
  page: number;
  pageSize: number;
  totalCount: number;
}
```

**ProjectMasterListItem:**
```typescript
{
  id: string;
  projectCode: string;
  projectName: string;
  projectShortName?: string | null;
  projectKanaName?: string | null;
  departmentCode?: string | null;
  responsibleEmployeeCode?: string | null;
  responsibleEmployeeName?: string | null;
  plannedPeriodFrom: string;  // ISO 8601
  plannedPeriodTo: string;    // ISO 8601
  budgetAmount: string;       // decimal string
  isActive: boolean;
}
```

**ProjectMasterDetailResponse:**
```typescript
{
  id: string;
  projectCode: string;
  projectName: string;
  projectShortName?: string | null;
  projectKanaName?: string | null;
  departmentCode?: string | null;
  responsibleEmployeeCode?: string | null;
  responsibleEmployeeName?: string | null;
  plannedPeriodFrom: string;  // ISO 8601
  plannedPeriodTo: string;   // ISO 8601
  actualPeriodFrom?: string | null; // ISO 8601
  actualPeriodTo?: string | null; // ISO 8601
  budgetAmount: string;       // decimal string
  version: number;            // 楽観ロック用バージョン
  isActive: boolean;
  createdAt: string;          // ISO 8601
  updatedAt: string;          // ISO 8601
  createdBy: string;
  updatedBy: string;
}
```

---

## DTO import example (MANDATORY)

You MUST import DTO types from contracts/bff (do NOT redefine types in UI).

```typescript
import type {
  ListProjectMasterRequest,
  ListProjectMasterResponse,
  ProjectMasterListItem,
  ProjectMasterDetailResponse,
  CreateProjectMasterRequest,
  UpdateProjectMasterRequest,
} from '@contracts/bff/project-master';
```

---

## Error UI behavior

### Validation Errors (422)
- Show inline errors per field (red border + error message below input)
- Error messages:
  - `projectCode` empty: "プロジェクトコードを入力してください"
  - `projectName` empty: "プロジェクト正式名を入力してください"
  - `plannedPeriodFrom` empty: "プロジェクト予定期間Fromを入力してください"
  - `plannedPeriodTo` empty: "プロジェクト予定期間Toを入力してください"
  - `budgetAmount` empty: "プロジェクト予算金額を入力してください"
  - `plannedPeriodFrom > plannedPeriodTo`: "プロジェクト予定期間FromはToより前の日付を入力してください"
  - `actualPeriodFrom > actualPeriodTo`: "プロジェクト実績FromはToより前の日付を入力してください"
  - `actualPeriodFrom` specified but `actualPeriodTo` missing: "プロジェクト実績Fromが指定されている場合、実績Toも必須です"
  - `projectCode` cannot be changed: "プロジェクトコードは作成後に変更できません"

### Business Errors (409)
- Show alert panel at top of dialog:
  - `PROJECT_CODE_DUPLICATE`: "このプロジェクトコードは既に使用されています"
  - `PROJECT_ALREADY_INACTIVE`: "このプロジェクトは既に無効化されています"
  - `PROJECT_ALREADY_ACTIVE`: "このプロジェクトは既に有効化されています"
  - `STALE_UPDATE`: "データが更新されています。最新の情報を取得してから再度お試しください"（楽観ロック競合）

### Not Found Errors (404)
- Show alert panel: "プロジェクトが見つかりませんでした"

### Permission Errors (403)
- Show alert panel: "この操作を実行する権限がありません"

---

## UI Output Requirements

Generate Next.js (App Router) + TypeScript + Tailwind UI.
Include:

1. **page.tsx** (main page component)
   - ProjectListPage component
   - Integrate search, filters, pagination
   - Trigger create/detail dialogs

2. **components/ProjectList.tsx**
   - Table display using Tier 1 Table component
   - Search inputs (projectCode, projectName, projectShortName, departmentCode, responsibleEmployeeCode)
   - Filter toggle (includeInactive)
   - Pagination controls
   - Sort controls

3. **components/CreateProjectDialog.tsx**
   - Dialog with form (all fields including projectCode, projectName, plannedPeriodFrom/To, budgetAmount)
   - Date picker for period fields (ISO 8601 format)
   - Number input for budgetAmount (decimal string)
   - Validation (required fields, date range)
   - Error display
   - Submit to BFF POST endpoint

4. **components/ProjectDetailDialog.tsx**
   - Dialog with detail view + edit mode
   - Show all fields (projectCode is read-only)
   - Version display (楽観ロック用)
   - Date picker for period fields
   - Number input for budgetAmount
   - Update/Deactivate/Reactivate buttons
   - Error display (including optimistic lock conflict)
   - Submit to BFF PATCH/POST endpoints with ifMatchVersion

5. **api/BffClient.ts**
   - TypeScript interface for all BFF endpoints
   - Methods:
     - `list(params: ListProjectMasterRequest): Promise<ListProjectMasterResponse>`
     - `findById(id: string): Promise<ProjectMasterDetailResponse>`
     - `create(data: CreateProjectMasterRequest): Promise<ProjectMasterDetailResponse>`
     - `update(id: string, data: UpdateProjectMasterRequest): Promise<ProjectMasterDetailResponse>`
     - `deactivate(id: string): Promise<ProjectMasterDetailResponse>`
     - `reactivate(id: string): Promise<ProjectMasterDetailResponse>`

6. **api/MockBffClient.ts**
   - Implements BffClient interface
   - Returns sample DTO-shaped data
   - Includes realistic EPM data (project codes like "PRJ001", names like "新規事業開発プロジェクト")
   - Simulates pagination, sorting, filtering
   - Simulates validation errors, duplicate errors, optimistic lock conflicts

7. **api/HttpBffClient.ts**
   - Implements BffClient interface
   - Uses fetch() to call BFF endpoints
   - Error handling (map HTTP status to UI errors)
   - Keep it unused initially (easy to switch from Mock to Http)

---

## Mock Data Requirements

Provide mock data sets that:

* Cover **empty state** (no projects)
* Cover **typical state** (10-20 projects)
* Cover **error state** (duplicate projectCode, validation errors, optimistic lock conflicts)
* Use realistic values for EPM domain:
  - Project codes: "PRJ001", "PRJ002", ...
  - Names: "新規事業開発プロジェクト", "既存事業拡大プロジェクト", "システム刷新プロジェクト", ...
  - Short names: "新規事業", "既存拡大", "システム刷新", ...
  - Kana names: "シンキジギョウカイハツプロジェクト", ...
  - Department codes: "SALES", "ENGINEERING", "FINANCE", null
  - Responsible employee codes: "EMP001", "EMP002", null
  - Responsible employee names: "田中 太郎", "佐藤 花子", null
  - Planned periods: ISO 8601 date strings (e.g., "2024-01-01T00:00:00Z", "2024-12-31T23:59:59Z")
  - Actual periods: ISO 8601 date strings or null
  - Budget amounts: decimal strings (e.g., "1000000.00", "5000000.50")
  - isActive: true/false
  - version: number (0, 1, 2, ...)
* Strictly match BFF response DTO shape
* Include pagination metadata (page, pageSize, totalCount)

---

## Authentication / Tenant

* UI only attaches auth token to BFF requests.
* UI must not handle tenant_id directly.
* BFF resolves tenant_id from auth context.

---

# 🔒 REQUIRED: Repository Constraints (DO NOT REMOVE)

## Source of Truth (SSoT)

You MUST follow these SSoT documents and files:

* `.kiro/steering/epm-design-system.md` (973 lines - complete design system spec)
* `apps/web/src/shared/ui/tokens/globals.css` (CSS variables and theme)
* `apps/web/src/shared/shell/AppShell.tsx` (layout wrapper)
* `apps/web/src/shared/navigation/menu.ts` (navigation structure)
* `apps/web/src/lib/utils.ts` (cn utility for className merging)

---

## Design System Compliance (CRITICAL)

### Tier Policy

**Tier 1 - Base Components (Standard / MUST Prefer)**
- Button, Input, Card, Table, Dialog, Tabs, Badge, Alert, Toast, Pagination, etc.
- **✅ Use these freely in all features**
- **❌ NEVER recreate these in feature folders**

**Tier 2 - Allowed Components (Use When Needed)**
- Calendar, Sheet, Drawer, Command, Sidebar, Progress, Accordion, etc.
- **⚠️ Use only when feature requirements justify it**
- **⚠️ If you need a Tier 2 component that doesn't exist:**
  - Add it to OUTPUT.md `Missing Shared Component / Pattern` section
  - DO NOT implement it in the feature folder

**Tier 3 - Avoid by Default**
- Carousel, Aspect Ratio
- **❌ Avoid unless there is a clear UX benefit and an approved pattern exists**

### Component Creation Rules

**✅ ALLOWED in feature folders:**
```typescript
// Feature-specific composites
components/ProjectSearchPanel.tsx
components/ProjectListTable.tsx
components/CreateProjectDialog.tsx
```

**❌ PROHIBITED in feature folders:**
```typescript
// Base UI components (use @/shared/ui instead)
components/button.tsx
components/input.tsx
components/table.tsx
components/dialog.tsx
components/card.tsx
```

### Missing Component Protocol

If you need a component that doesn't exist:

1. **Check if it's Tier 1** → Use from `@/shared/ui`
2. **Check if it's Tier 2** → Add to OUTPUT.md TODO
3. **If it's truly feature-specific** → Implement in feature folder

**Example OUTPUT.md entry:**
```markdown
### Missing Shared Component / Pattern (TODO)

- [ ] DataTable wrapper (apps/web/src/shared/ui/components/data-table.tsx)
  - Wraps Table with sorting, pagination, loading states
  - Props: columns, data, onSort, onPageChange, isLoading
- [ ] SearchInput with debounce (apps/web/src/shared/ui/components/search-input.tsx)
  - Wraps Input with 300ms debounce
  - Props: onSearch, placeholder, defaultValue
```

---

## Colors / Spacing (CRITICAL)

### ✅ CORRECT Usage

```typescript
// Semantic tokens
<Card className="bg-card border-border">
  <Button className="bg-primary text-primary-foreground">
    作成
  </Button>
  <Alert className="border-warning bg-warning/10">
    <AlertTitle className="text-warning">警告</AlertTitle>
  </Alert>
</Card>

// Tailwind spacing scale
<div className="p-4 gap-4 rounded-lg">
  <div className="space-y-2">
    <Input className="h-9" />
  </div>
</div>
```

### ❌ PROHIBITED Usage

```typescript
// Raw color literals
<div className="bg-[#14b8a6] text-[oklch(0.52 0.13 195)]">

// Arbitrary Tailwind colors
<Button className="bg-teal-500 hover:bg-indigo-600">

// Arbitrary spacing values
<div className="p-[16px] gap-[20px] rounded-[12px]">
```

---

## App Shell / Layout (MANDATORY)

* The screens must render inside the App Shell layout.
* Do NOT create a new sidebar/header layout inside the feature.
* Feature UI should be only the content area (cards/tables/forms/etc).

**Correct Structure:**
```
apps/web/src/app/master-data/project-master/page.tsx  (imports Feature component)
       ↓
apps/web/src/features/master-data/project-master/page.tsx  (Feature component)
       ↓ (renders inside AppShell automatically)
```

---

## v0 Isolation Output Path (MANDATORY)

* Write all generated code ONLY under:
  * `apps/web/_v0_drop/master-data/project-master/src`
* Assume this `src/` folder will later be moved to:
  * `apps/web/src/features/master-data/project-master/`
* Do NOT write to `apps/web/src` directly.
* Do NOT place source files outside the `src/` folder under `_v0_drop` (src-only).

**Example Output Structure:**
```
apps/web/_v0_drop/master-data/project-master/src/
├── OUTPUT.md
├── page.tsx
├── components/
│   ├── ProjectList.tsx
│   ├── CreateProjectDialog.tsx
│   └── ProjectDetailDialog.tsx
├── api/
│   ├── BffClient.ts
│   ├── MockBffClient.ts
│   └── HttpBffClient.ts
└── types/
    └── index.ts (optional, prefer @contracts/bff)
```

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
  * `apps/web/_v0_drop/master-data/project-master/src/api/HttpBffClient.ts`

### App Router / Shell

* Do NOT generate `layout.tsx` anywhere under the v0 output.
* Do NOT create a new sidebar/header/shell layout inside the feature.
* All screens MUST render inside the existing AppShell.

### Output Location

* Write ALL generated code ONLY under:
  * `apps/web/_v0_drop/master-data/project-master/src`
* Do NOT write to `apps/web/src` directly.

---

## 🔻 REQUIRED OUTPUT ARTIFACT (MANDATORY)

You MUST create an `OUTPUT.md` file under:

* `apps/web/_v0_drop/master-data/project-master/src/OUTPUT.md`

`OUTPUT.md` MUST include the following sections:

### 1) Generated files (tree)

* Provide a complete tree of everything you generated under the `src/` folder.

### 2) Key imports / dependency notes

* List important imports and where they come from:
  * `@/shared/ui` usage (which Tier 1 components used)
  * `packages/contracts/src/bff` DTO imports
  * `BffClient` / `MockBffClient` / `HttpBffClient` relationships

### 3) Missing Shared Component / Pattern (TODO)

* A TODO list of any shared UI components/patterns you wanted but did not exist.
* Include suggested filenames and where they should live (shared/ui side).
* Include suggested props interface and purpose.
* Do NOT implement them in the feature.

**Example:**
```markdown
### Missing Shared Component / Pattern (TODO)

- [ ] DataTable wrapper (apps/web/src/shared/ui/components/data-table.tsx)
  - Purpose: Reusable table with sorting, pagination, loading
  - Props: columns, data, onSort, onPageChange, isLoading, pageSize
- [ ] SearchInput with debounce (apps/web/src/shared/ui/components/search-input.tsx)
  - Purpose: Search input with 300ms debounce
  - Props: onSearch, placeholder, defaultValue
```

### 4) Migration notes (_v0_drop → features)

* Step-by-step migration plan:
  * what folder to move
  * what paths/imports will change
  * what should be refactored into shared/ui (if any)

### 5) Constraint compliance checklist

* Check all items explicitly:
  * [ ] Code written ONLY under `apps/web/_v0_drop/master-data/project-master/src`
  * [ ] UI components imported ONLY from `@/shared/ui`
  * [ ] DTO types imported from `packages/contracts/src/bff` (no UI re-definition)
  * [ ] No imports from `packages/contracts/src/api`
  * [ ] No Domain API direct calls (/api/)
  * [ ] No direct fetch() outside `api/HttpBffClient.ts`
  * [ ] No layout.tsx generated
  * [ ] No base UI components created under features
  * [ ] No raw color literals (bg-[#...], text-[oklch(...)], etc.)
  * [ ] No arbitrary Tailwind colors (bg-teal-500, etc.)
  * [ ] No new sidebar/header/shell created inside the feature
  * [ ] All spacing uses Tailwind scale (no arbitrary values like p-[16px])
  * [ ] Dark mode support via semantic tokens (no manual dark: variants)

---

## Handoff to Cursor

* Keep code modular and easy to migrate into:
  * `apps/web/src/features/master-data/project-master/`
* Add brief migration notes in OUTPUT.md (what to move, what to refactor into shared/ui).
* Ensure all imports use path aliases (`@/`, `@contracts/`) for easy refactoring.

---

## 📋 Quick Checklist for v0 Execution

Before generating, ensure you have:

- [ ] Feature name and description understood
- [ ] BFF endpoints table reviewed
- [ ] DTO import paths specified
- [ ] Mock data requirements understood
- [ ] Output path confirmed: `apps/web/_v0_drop/master-data/project-master/src`

After generating, verify:

- [ ] OUTPUT.md created with all 5 sections
- [ ] No raw color literals (`bg-[#...]`)
- [ ] No layout.tsx created
- [ ] No base UI components recreated
- [ ] All components imported from `@/shared/ui`
- [ ] All DTOs imported from `@contracts/bff`
- [ ] BffClient interface matches endpoints
- [ ] MockBffClient provides realistic data (Japanese project names, EPM codes, ISO 8601 dates, decimal strings)
- [ ] Dark mode works automatically (semantic tokens only)
- [ ] Spacing uses Tailwind scale (no arbitrary values)

---

## 🎯 Expected UI Components to Generate

### Use Tier 1 components from @/shared/ui:
- **Button** (作成、更新、無効化、再有効化、キャンセル)
- **Input** (プロジェクトコード、プロジェクト正式名、プロジェクト略名、部門コード、担当者コード検索)
- **Table** (プロジェクト一覧表示)
- **TableHeader, TableBody, TableRow, TableCell, TableHead** (テーブル構造)
- **Card** (フィルタパネル、空状態表示)
- **Dialog** (作成ダイアログ、詳細・編集ダイアログ)
- **Badge** (有効/無効ステータス表示)
- **Alert** (エラー表示、警告表示)
- **Pagination** (ページネーション)
- **Label** (フォームラベル)
- **Checkbox** (無効なプロジェクトを含めるフィルタ)

### Feature-specific composites (OK to create):
- **ProjectList** (テーブル + 検索 + フィルタ + ページネーション)
- **CreateProjectDialog** (作成フォーム、日付入力、金額入力)
- **ProjectDetailDialog** (詳細表示 + 編集フォーム、楽観ロック対応)

---

**End of Prompt**

<!--
このプロンプトを v0.dev に貼り付けて、"Generate" ボタンをクリックしてください。
生成後、以下のコマンドでローカルに取得します：

./scripts/v0-fetch.sh "https://v0.dev/chat/xxxxx" master-data/project-master
-->

