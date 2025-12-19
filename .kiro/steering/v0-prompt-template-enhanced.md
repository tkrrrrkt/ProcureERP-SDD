<!-- Source of truth: .kiro/steering/v0-workflow.md + epm-design-system.md -->

# v0 Prompt Template（<...> を埋めて v0 に貼る）

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

<feature-name>: <short description>

## Screens to build

* <screen-1>: purpose, main interactions
* <screen-2>: ...

---

## BFF Specification (from design.md)

### Endpoints (UI -> BFF)

| Method     | Endpoint | Purpose | Request DTO     | Response DTO     |
| ---------- | -------- | ------- | --------------- | ---------------- |
| <GET/POST> | </...>   | <...>   | <BffXxxRequest> | <BffXxxResponse> |

### DTOs to use (contracts/bff)

* Request: <...>
* Response: <...>
* Errors: <...>

### DTO import example (MANDATORY)

* You MUST import DTO types from contracts/bff (do NOT redefine types in UI).
* Example (adjust path to actual repo structure):

```ts
import type { EmployeeListResponse } from "packages/contracts/src/bff/<module>";
// or (if alias exists)
// import type { EmployeeListResponse } from "@contracts/bff/<module>";
```

### Error UI behavior

* Show validation errors inline per field
* Show API/business errors in a top alert panel
* Map error codes to user-friendly messages (no hard-coded domain logic)

---

## UI Output Requirements

Generate Next.js (App Router) + TypeScript + Tailwind UI.
Include:

1. Routes/pages for the screens (**page.tsx only; see "No layout.tsx" rule below**)
2. A typed `BffClient` interface (methods correspond to endpoints above)
3. `MockBffClient` returning sample DTO-shaped data
4. `HttpBffClient` with fetch wrappers (but keep it unused initially, easy to switch)
5. Data models in UI must be the DTO types from contracts/bff
6. Minimal but production-like UI (tables, forms, search, pagination if needed)

---

## Mock Data Requirements

Provide mock data sets that:

* cover empty state, typical state, and error state
* use realistic values for EPM domain (period, org, version, amounts)
* strictly match the BFF response DTO shape

---

## Authentication / Tenant

* UI only attaches auth token to BFF requests.
* UI must not handle tenant_id directly.

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
components/BudgetApprovalFlow.tsx
components/PeriodSelectionWizard.tsx
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
  * `apps/web/_v0_drop/<context>/<feature>/src`
* Assume this `src/` folder will later be moved to:
  * `apps/web/src/features/<context>/<feature>/`
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
  * `apps/web/_v0_drop/<context>/<feature>/src/api/HttpBffClient.ts`

### App Router / Shell

* Do NOT generate `layout.tsx` anywhere under the v0 output.
* Do NOT create a new sidebar/header/shell layout inside the feature.
* All screens MUST render inside the existing AppShell.

### Output Location

* Write ALL generated code ONLY under:
  * `apps/web/_v0_drop/<context>/<feature>/src`
* Do NOT write to `apps/web/src` directly.

---

## 🔻 REQUIRED OUTPUT ARTIFACT (MANDATORY)

You MUST create an `OUTPUT.md` file under:

* `apps/web/_v0_drop/<context>/<feature>/src/OUTPUT.md`

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
  * [ ] Code written ONLY under `apps/web/_v0_drop/<context>/<feature>/src`
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
  * `apps/web/src/features/<context>/<feature>/`
* Add brief migration notes in OUTPUT.md (what to move, what to refactor into shared/ui).
* Ensure all imports use path aliases (`@/`, `@contracts/`) for easy refactoring.

---

## 📋 Quick Checklist for v0 Execution

Before generating, ensure you have:

- [ ] Feature name and description filled in
- [ ] BFF endpoints table completed
- [ ] DTO import paths specified
- [ ] Mock data requirements understood
- [ ] Output path confirmed: `apps/web/_v0_drop/<context>/<feature>/src`

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

## Example: Complete v0 Prompt

```markdown
Use EPM Design System colors and components.
Primary: Deep Teal oklch(0.52 0.13 195)
Secondary: Royal Indigo oklch(0.48 0.15 280)

Feature: Employee Master CRUD

Screens:
- Employee List: table with search, filter, pagination
- Employee Create: dialog form
- Employee Edit: dialog form

BFF Endpoints:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | /api/bff/master-data/employees | EmployeeListRequest | EmployeeListResponse |
| POST | /api/bff/master-data/employees | EmployeeCreateRequest | EmployeeCreateResponse |
| PUT | /api/bff/master-data/employees/:id | EmployeeUpdateRequest | EmployeeUpdateResponse |

DTOs:
import type { EmployeeListResponse } from '@contracts/bff/master-data/employee'

Use Tier 1 components: Button, Table, Card, Input, Dialog, Badge
Output to: apps/web/_v0_drop/master-data/employee-master/src

Include OUTPUT.md with:
1. File tree
2. Import notes
3. Missing components TODO
4. Migration steps
5. Constraint checklist
```

---

**End of Template**
