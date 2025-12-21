<!-- Source of truth: .kiro/steering/v0-workflow.md -->

# v0 Prompt Template（<...> を埋めて v0 に貼る）

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

1. Routes/pages for the screens (**page.tsx only; see “No layout.tsx” rule below**)
2. A typed `BffClient` interface (methods correspond to endpoints above)
3. `MockBffClient` returning sample DTO-shaped data
4. `HttpBffClient` with fetch wrappers (but keep it unused initially, easy to switch)
5. Data models in UI must be the DTO types from contracts/bff
6. Minimal but production-like UI (tables, forms, search, pagination if needed)

---

## Mock Data Requirements

Provide mock data sets that:

* cover empty state, typical state, and error state
* use realistic values for procurement domain (purchase request, quotation, order, supplier, item)
* strictly match the BFF response DTO shape

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

Add this at the very beginning of your v0 prompt:
```
Use the ProcurERP Design System from: https://epm-registry-6xtkaywr0-tkoizumi-hira-tjps-projects.vercel.app
```

---

## Source of Truth (SSoT)

You MUST follow these SSoT documents and files:

* apps/web/src/shared/ui/README.md
* apps/web/src/shared/ui/tokens/globals.css
* apps/web/src/shared/shell/AppShell.tsx (and related providers)
* apps/web/src/shared/navigation/menu.ts

---

## Design System Compliance

* Do NOT invent new base UI components (Button/Input/Table/Dialog/Tabs/etc).
* You MUST use Tier policy defined in:

  * apps/web/src/shared/ui/README.md (Tier 1/2/3)
  * apps/web/src/shared/ui/components/*
* v0 MUST use Tier 1 components by default.
  Use Tier 2/3 ONLY when explicitly instructed in the prompt.
* Do NOT create new "base UI" components under `apps/web/src/features/**`
  (e.g., button.tsx, input.tsx, table.tsx, dialog.tsx, tabs.tsx, badge.tsx).

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
* Direct imports from `apps/web/src/shared/ui/components/*` are prohibited.
  If `@/shared/ui` barrel does not exist yet, add a TODO in OUTPUT.md (do NOT bypass via direct imports).

* UI components MUST be imported ONLY from:

  * `@/shared/ui`
* Assume `@/shared/ui` is a barrel entry that re-exports shared UI components.
* If the barrel entry does NOT exist yet:

  * Do NOT create it inside feature folders.
  * Do NOT import directly from `apps/web/src/shared/ui/components/*`.
  * Instead, add a TODO under `Missing Shared Component / Pattern` in OUTPUT.md describing what barrel export is needed.

### Missing Shared Component / Pattern policy

* If a needed component/pattern does not exist yet:

  * Do NOT implement it inside feature folders.
  * Instead, add a TODO list titled `Missing Shared Component / Pattern` in OUTPUT.md.

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

  * apps/web/_v0_drop/<context>/<feature>/src
* Assume this `src/` folder will later be moved to:

  * apps/web/src/features/<context>/<feature>/
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

* apps/web/_v0_drop/<context>/<feature>/src/OUTPUT.md

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

  * [ ] Code written ONLY under `apps/web/_v0_drop/<context>/<feature>/src`
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

  * apps/web/src/features/<context>/<feature>/
* Add brief migration notes in OUTPUT.md (what to move, what to refactor into shared/ui).
