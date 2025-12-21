# v0 Prompt: Employee Master Management

## Context

You are generating UI for ProcurERP (調達管理SaaS - Procurement Management SaaS). The project uses SDD/CCSDD (Specification Driven Development / Contract-Centered Specification Driven Development).

This feature is the **Employee Master Management** functionality that provides employee registration, inquiry, and editing capabilities. It serves as a foundational master data for purchase requests and approval workflows.

UI must follow boundary rules and must be easy to hand off to Cursor for implementation.

---

## ProcurERP Design System (MANDATORY - READ FIRST)

### 🎨 Design System Source of Truth

You MUST follow the ProcurERP Design System defined in `.kiro/steering/procure-design-system.md` (973 lines).

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
import { Button, Table, Card, Dialog } from '@/shared/ui'

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

**employee-master**: Employee Master Management - Registration, inquiry, and editing of employee master data. This serves as foundational master data for purchase requests and approval workflows.

**Main Features:**
- Employee list display (with search, sort, pagination)
- Employee detail view and edit
- Employee new registration
- Employee data validation (employee code uniqueness, email format, date consistency)

---

## Screens to build

* **Employee List Page**: 
  - Purpose: Display list of employees with search, sort, and pagination
  - Main interactions: 
    - Search by keyword (employee code, name, kana name)
    - Sort by columns (clickable headers)
    - Pagination navigation
    - Click row to open edit dialog
    - Click "New" button to open create dialog
    - Display loading state, error state, empty state

* **Employee Create/Edit Dialog**:
  - Purpose: Create new employee or edit existing employee
  - Main interactions:
    - Form input with validation (required fields, email format, date consistency)
    - Inline validation error display (red border on error fields)
    - Save button (triggers create/update API call)
    - Cancel button (closes dialog)
    - Success toast notification on save
    - Error alert display on API errors

---

## BFF Specification (from design.md)

### Endpoints (UI -> BFF)

| Method | Endpoint | Purpose | Request DTO | Response DTO |
|--------|----------|---------|-------------|--------------|
| GET | `/api/bff/master-data/employee-master` | Get employee list with pagination, sort, search | `ListEmployeesRequest` | `ListEmployeesResponse` |
| GET | `/api/bff/master-data/employee-master/:id` | Get employee detail | - | `GetEmployeeResponse` |
| POST | `/api/bff/master-data/employee-master` | Create new employee | `CreateEmployeeRequest` | `CreateEmployeeResponse` |
| PUT | `/api/bff/master-data/employee-master/:id` | Update employee (with optimistic locking) | `UpdateEmployeeRequest` | `UpdateEmployeeResponse` |

### DTOs to use (contracts/bff)

**Request DTOs:**
- `ListEmployeesRequest`: page (1-based), pageSize, sortBy?, sortOrder?, keyword?
- `CreateEmployeeRequest`: employeeCode, employeeName, employeeKanaName, email?, joinDate, retireDate?, remarks?, isActive
- `UpdateEmployeeRequest`: employeeCode, employeeName, employeeKanaName, email?, joinDate, retireDate?, remarks?, isActive, version (for optimistic locking)

**Response DTOs:**
- `ListEmployeesResponse`: items (EmployeeDto[]), page, pageSize, total, totalPages
- `GetEmployeeResponse`: employee (EmployeeDto)
- `CreateEmployeeResponse`: employee (EmployeeDto)
- `UpdateEmployeeResponse`: employee (EmployeeDto)

**Error DTOs:**
- Errors are re-exported from `packages/contracts/src/api/errors/employee-master-error.ts`
- Error codes: `EMPLOYEE_NOT_FOUND` (404), `EMPLOYEE_CODE_DUPLICATE` (409), `INVALID_EMAIL_FORMAT` (422), `INVALID_DATE_RANGE` (422), `CONCURRENT_UPDATE` (409)

### DTO import example (MANDATORY)

You MUST import DTO types from contracts/bff (do NOT redefine types in UI).

```typescript
import type { 
  ListEmployeesRequest,
  ListEmployeesResponse,
  GetEmployeeResponse,
  CreateEmployeeRequest,
  CreateEmployeeResponse,
  UpdateEmployeeRequest,
  UpdateEmployeeResponse,
  EmployeeDto
} from "@contracts/bff/employee-master";
// or (if alias doesn't exist)
// import type { ... } from "packages/contracts/src/bff/employee-master";
```

### Error UI behavior

* Show validation errors inline per field (red border, error message below field)
* Show API/business errors in a top alert panel (Alert component with error code and message)
* Map error codes to user-friendly messages (no hard-coded domain logic)
* Display toast notification for success operations

---

## Data Structures (TypeScript Interfaces)

Based on design.md Contracts Summary, use these DTO structures:

```typescript
// EmployeeDto (from contracts/bff)
interface EmployeeDto {
  id: string;                    // UUID
  employeeCode: string;          // Required
  employeeName: string;          // Required
  employeeKanaName: string;      // Required
  email?: string;                // Optional
  joinDate: string;              // ISO 8601 date string, Required
  retireDate?: string | null;    // ISO 8601 date string, Optional
  remarks?: string | null;       // Optional
  isActive: boolean;             // Required, default: true
  version: number;               // Optimistic locking version
  createdAt: string;             // ISO 8601 date string
  updatedAt: string;             // ISO 8601 date string
}

// ListEmployeesRequest
interface ListEmployeesRequest {
  page: number;                  // 1-based
  pageSize: number;              // Default: 50, Max: 200
  sortBy?: 'employeeCode' | 'employeeName' | 'employeeKanaName' | 'email' | 'joinDate' | 'retireDate' | 'isActive';
  sortOrder?: 'asc' | 'desc';    // Default: 'asc'
  keyword?: string;              // Partial match search on employeeCode, employeeName, employeeKanaName
}

// ListEmployeesResponse
interface ListEmployeesResponse {
  items: EmployeeDto[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// CreateEmployeeRequest
interface CreateEmployeeRequest {
  employeeCode: string;          // Required
  employeeName: string;          // Required
  employeeKanaName: string;      // Required
  email?: string;                // Optional, but must be valid format if provided
  joinDate: string;              // ISO 8601, Required
  retireDate?: string;           // ISO 8601, Optional
  remarks?: string;               // Optional
  isActive: boolean;             // Required, default: true
}

// UpdateEmployeeRequest
interface UpdateEmployeeRequest {
  employeeCode: string;          // Required
  employeeName: string;          // Required
  employeeKanaName: string;      // Required
  email?: string;                // Optional, but must be valid format if provided
  joinDate: string;              // ISO 8601, Required
  retireDate?: string;           // ISO 8601, Optional
  remarks?: string;               // Optional
  isActive: boolean;             // Required
  version: number;              // Required, for optimistic locking
}
```

---

## Mock Data Requirements

Provide mock data sets that:

* cover empty state, typical state, and error state
* use realistic Japanese employee data (names, emails, dates)
* strictly match the BFF response DTO shape

### Sample Mock Data (7+ employees)

```typescript
const mockEmployees: EmployeeDto[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    employeeCode: "EMP001",
    employeeName: "山田太郎",
    employeeKanaName: "ヤマダタロウ",
    email: "yamada.taro@example.com",
    joinDate: "2020-04-01T00:00:00.000Z",
    retireDate: null,
    remarks: "購買部門リーダー",
    isActive: true,
    version: 1,
    createdAt: "2020-03-15T10:00:00.000Z",
    updatedAt: "2024-01-10T14:30:00.000Z"
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    employeeCode: "EMP002",
    employeeName: "佐藤花子",
    employeeKanaName: "サトウハナコ",
    email: "sato.hanako@example.com",
    joinDate: "2019-07-01T00:00:00.000Z",
    retireDate: null,
    remarks: null,
    isActive: true,
    version: 2,
    createdAt: "2019-06-15T10:00:00.000Z",
    updatedAt: "2024-02-20T09:15:00.000Z"
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    employeeCode: "EMP003",
    employeeName: "鈴木一郎",
    employeeKanaName: "スズキイチロウ",
    email: "suzuki.ichiro@example.com",
    joinDate: "2021-10-01T00:00:00.000Z",
    retireDate: null,
    remarks: "経理部門",
    isActive: true,
    version: 1,
    createdAt: "2021-09-15T10:00:00.000Z",
    updatedAt: "2021-09-15T10:00:00.000Z"
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440004",
    employeeCode: "EMP004",
    employeeName: "田中次郎",
    employeeKanaName: "タナカジロウ",
    email: null,
    joinDate: "2018-04-01T00:00:00.000Z",
    retireDate: "2023-12-31T00:00:00.000Z",
    remarks: "退職済み",
    isActive: false,
    version: 3,
    createdAt: "2018-03-15T10:00:00.000Z",
    updatedAt: "2023-12-31T16:00:00.000Z"
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440005",
    employeeCode: "EMP005",
    employeeName: "伊藤三郎",
    employeeKanaName: "イトウサブロウ",
    email: "ito.saburo@example.com",
    joinDate: "2022-01-10T00:00:00.000Z",
    retireDate: null,
    remarks: "新入社員",
    isActive: true,
    version: 1,
    createdAt: "2022-01-05T10:00:00.000Z",
    updatedAt: "2022-01-05T10:00:00.000Z"
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440006",
    employeeCode: "EMP006",
    employeeName: "渡辺四郎",
    employeeKanaName: "ワタナベシロウ",
    email: "watanabe.shiro@example.com",
    joinDate: "2023-06-01T00:00:00.000Z",
    retireDate: null,
    remarks: null,
    isActive: true,
    version: 1,
    createdAt: "2023-05-20T10:00:00.000Z",
    updatedAt: "2023-05-20T10:00:00.000Z"
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440007",
    employeeCode: "EMP007",
    employeeName: "中村五郎",
    employeeKanaName: "ナカムラゴロウ",
    email: "nakamura.goro@example.com",
    joinDate: "2020-09-15T00:00:00.000Z",
    retireDate: null,
    remarks: "調達部門マネージャー",
    isActive: true,
    version: 2,
    createdAt: "2020-09-01T10:00:00.000Z",
    updatedAt: "2024-03-01T11:20:00.000Z"
  }
];
```

---

## UI Components & Requirements

### List View (Employee List Page)

**Layout:**
- Use Shadcn UI `Card` component for main container
- Header section with page title "社員マスタ" (Employee Master)
- Top action bar (right-aligned):
  - Search input (keyword search) with placeholder "社員コード・氏名・カナ名で検索"
  - "新規登録" (New) button (primary style)

**Table:**
- Use Shadcn UI `Table` component
- Columns:
  - 社員コード (Employee Code) - sortable
  - 社員氏名 (Employee Name) - sortable
  - 社員カナ名 (Kana Name) - sortable
  - メールアドレス (Email)
  - 入社日 (Join Date) - sortable, format: YYYY-MM-DD
  - 退社日 (Retire Date) - sortable, format: YYYY-MM-DD or "-"
  - 有効フラグ (Active) - Badge component (Active/Inactive)
- Table header: Clickable for sorting (show sort indicator: ↑/↓)
- Table rows: Clickable to open edit dialog
- Row hover effect

**Pagination:**
- Use Shadcn UI `Pagination` component at bottom
- Display: "全 X 件中 Y-Z 件を表示" (Showing Y-Z of X items)
- Page size selector: 10, 50, 100, 200

**States:**
- **Loading**: Show Skeleton components for table rows
- **Empty**: Show empty state message "社員データがありません" (No employee data)
- **Error**: Show Alert component with error message at top

### Form View (Create/Edit Dialog)

**Dialog:**
- Use Shadcn UI `Dialog` component
- Title: "社員登録" (Create) or "社員編集" (Edit)
- Form layout: Use `react-hook-form` with `zod` validation

**Form Fields:**
- 社員コード (Employee Code) - Input, Required, maxLength validation
- 社員氏名 (Employee Name) - Input, Required, maxLength validation
- 社員カナ名 (Kana Name) - Input, Required, maxLength validation
- メールアドレス (Email) - Input type="email", Optional, email format validation
- 入社日 (Join Date) - Date picker or Input type="date", Required
- 退社日 (Retire Date) - Date picker or Input type="date", Optional
- 備考 (Remarks) - Textarea, Optional
- 有効フラグ (Active) - Switch component, Default: true

**Validation:**
- Required fields: Show red border and error message below field
- Email format: Validate if provided
- Date consistency: retireDate must be after joinDate (if both provided)
- Error messages in Japanese

**Actions:**
- "保存" (Save) button - Primary style, disabled during submission
- "キャンセル" (Cancel) button - Secondary/Outline style
- Show loading spinner on Save button during API call

**Success/Error Handling:**
- Success: Show toast notification "保存しました" (Saved successfully), close dialog, refresh list
- Error: Show Alert component in dialog with error message

---

## Interactive States

### Loading State
- Table: Show Skeleton components (5-6 rows)
- Form: Disable all inputs and buttons, show spinner on Save button

### Error State
- List page: Show Alert component at top with error message
- Form: Show Alert component in dialog, highlight error fields with red border

### Empty State
- List page: Show centered message "社員データがありません" with icon

### Success State
- Form: Show toast notification, close dialog, refresh list data

---

## UI Output Requirements

Generate Next.js (App Router) + TypeScript + Tailwind UI.

Include:

1. **Routes/pages for the screens** (`page.tsx` only; see "No layout.tsx" rule below)
2. **A typed `BffClient` interface** (methods correspond to endpoints above)
3. **`MockBffClient`** returning sample DTO-shaped data (use mock data above)
4. **`HttpBffClient`** with fetch wrappers (but keep it unused initially, easy to switch)
5. **Data models in UI** must be the DTO types from contracts/bff
6. **Minimal but production-like UI** (tables, forms, search, pagination)

---

## Authentication / Tenant

* UI only attaches auth token to BFF requests.
* UI must not handle tenant_id directly.

---

# 🔒 REQUIRED: Repository Constraints (DO NOT REMOVE)

## Source of Truth (SSoT)

You MUST follow these SSoT documents and files:

* `.kiro/steering/procure-design-system.md` (973 lines - complete design system spec)
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
- Full list: See `apps/web/src/shared/ui/README.md` Tier 1 section

**Tier 2 - Allowed Components (Use When Needed)**
- Calendar, Sheet, Drawer, Command, Sidebar, Progress, Accordion, etc.
- **Chart** (for dashboards/reports with approved patterns)
- **⚠️ Use only when feature requirements justify it**
- **⚠️ If you need a Tier 2 component that doesn't exist:**
  - Add it to OUTPUT.md `Missing Shared Component / Pattern` section
  - DO NOT implement it in the feature folder
- Full list: See `apps/web/src/shared/ui/README.md` Tier 2 section

**Tier 3 - Avoid by Default**
- Carousel, Aspect Ratio
- **❌ Avoid unless there is a clear UX benefit and an approved pattern exists**
- Full list: See `apps/web/src/shared/ui/README.md` Tier 3 section

### Component Creation Rules

**✅ ALLOWED in feature folders:**
```typescript
// Feature-specific composites
components/EmployeeSearchPanel.tsx
components/EmployeeFormDialog.tsx
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
    Submit
  </Button>
  <Alert className="border-warning bg-warning/10">
    <AlertTitle className="text-warning">Warning</AlertTitle>
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
apps/web/src/app/<context>/<feature>/page.tsx  (imports Feature component)
       ↓
apps/web/src/features/<context>/<feature>/page.tsx  (Feature component)
       ↓ (renders inside AppShell automatically)
```

---

## v0 Isolation Output Path (MANDATORY)

* Write all generated code ONLY under:
  * `apps/web/_v0_drop/master-data/employee-master/src`
* Assume this `src/` folder will later be moved to:
  * `apps/web/src/features/master-data/employee-master/`
* Do NOT write to `apps/web/src` directly.
* Do NOT place source files outside the `src/` folder under `_v0_drop` (src-only).

**Example Output Structure:**
```
apps/web/_v0_drop/master-data/employee-master/src/
├── OUTPUT.md
├── page.tsx
├── components/
│   ├── EmployeeList.tsx
│   ├── EmployeeCreateDialog.tsx
│   └── EmployeeEditDialog.tsx
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
  * `apps/web/_v0_drop/master-data/employee-master/src/api/HttpBffClient.ts`

### App Router / Shell

* Do NOT generate `layout.tsx` anywhere under the v0 output.
* Do NOT create a new sidebar/header/shell layout inside the feature.
* All screens MUST render inside the existing AppShell.

### Output Location

* Write ALL generated code ONLY under:
  * `apps/web/_v0_drop/master-data/employee-master/src`
* Do NOT write to `apps/web/src` directly.

---

## 🔻 REQUIRED OUTPUT ARTIFACT (MANDATORY)

You MUST create an `OUTPUT.md` file under:

* `apps/web/_v0_drop/master-data/employee-master/src/OUTPUT.md`

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
  - Based on: Tier 1 Table component

- [ ] @/shared/ui barrel export (apps/web/src/shared/ui/index.ts)
  - Export all Tier 1 components for easy importing
```

### 4) Migration notes (_v0_drop → features)

* Step-by-step migration plan:
  * what folder to move
  * what paths/imports will change
  * what should be refactored into shared/ui (if any)

### 5) Constraint compliance checklist

* Check all items explicitly:
  * [ ] Code written ONLY under `apps/web/_v0_drop/master-data/employee-master/src`
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
  * `apps/web/src/features/master-data/employee-master/`
* Add brief migration notes in OUTPUT.md (what to move, what to refactor into shared/ui).
* Ensure all imports use path aliases (`@/`, `@contracts/`) for easy refactoring.

---

## 📋 Quick Checklist for v0 Execution

Before generating, ensure you have:

- [x] Feature name and description filled in
- [x] BFF endpoints table completed
- [x] DTO import paths specified
- [x] Mock data requirements understood
- [x] Output path confirmed: `apps/web/_v0_drop/master-data/employee-master/src`

After generating, verify:

- [ ] OUTPUT.md created with all 5 sections
- [ ] No raw color literals (`bg-[#...]`)
- [ ] No layout.tsx created
- [ ] No base UI components recreated
- [ ] All components imported from `@/shared/ui`
- [ ] All DTOs imported from `@contracts/bff`
- [ ] BffClient interface matches endpoints
- [ ] MockBffClient provides realistic data
- [ ] Dark mode works automatically (semantic tokens only)
- [ ] Spacing uses Tailwind scale (no arbitrary values)

---

**End of Prompt**
