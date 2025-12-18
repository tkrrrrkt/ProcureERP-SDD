<!-- Source of truth: .kiro/steering/v0-workflow.md -->
# v0 Prompt Template（<...> を埋めて v0 に貼る）

# Context
You are generating UI for an EPM SaaS. The project uses SDD/CCSDD.
UI must follow boundary rules and must be easy to hand off to Cursor for implementation.

# Non-Negotiable Rules
- UI must call ONLY BFF endpoints (never call Domain API directly).
- UI must use ONLY `packages/contracts/src/bff` DTOs and errors.
- UI must NOT import or reference `packages/contracts/src/api`.
- Implement UI behavior, state, validation, and UX only. No business rules or domain authority in UI.
- Start with mock data (in the same shape as BFF DTOs). Later we will swap to real BFF calls.

# Feature
<feature-name>: <short description>

# Screens to build
- <screen-1>: purpose, main interactions
- <screen-2>: ...

# BFF Specification (from design.md)
## Endpoints (UI -> BFF)
| Method | Endpoint | Purpose | Request DTO | Response DTO |
|---|---|---|---|---|
| <GET/POST> | </...> | <...> | <BffXxxRequest> | <BffXxxResponse> |

## DTOs to use (contracts/bff)
- Request: <...>
- Response: <...>
- Errors: <...>

## Error UI behavior
- Show validation errors inline per field
- Show API/business errors in a top alert panel
- Map error codes to user-friendly messages (no hard-coded domain logic)

# UI Output Requirements
Generate Next.js (App Router) + TypeScript + Tailwind UI.
Include:
1) Routes/pages for the screens
2) A typed BffClient interface (methods correspond to endpoints above)
3) MockBffClient returning sample DTO-shaped data
4) HttpBffClient with fetch wrappers (but keep it unused initially, easy to switch)
5) Data models in UI must be the DTO types from contracts/bff
6) Minimal but production-like UI (tables, forms, search, pagination if needed)

# Mock Data Requirements
Provide mock data sets that:
- cover empty state, typical state, and error state
- use realistic values for EPM domain (period, org, version, amounts)
- strictly match the BFF response DTO shape

# Authentication / Tenant
- UI only attaches auth token to BFF requests.
- UI must not handle tenant_id directly.

---

# 🔒 REQUIRED: Design System & Repository Constraints (DO NOT REMOVE)

## Source of Truth (SSoT)
You MUST follow these SSoT documents and files:
- apps/web/src/shared/ui/README.md
- apps/web/src/shared/ui/tokens/globals.css
- apps/web/src/shared/shell/AppShell.tsx (and related providers)
- apps/web/src/shared/navigation/menu.ts

## Design System Compliance
- Do NOT invent new base UI components (Button/Input/Table/Dialog/Tabs/etc).
- You MUST use Tier policy defined in:
  - apps/web/src/shared/ui/README.md (Tier 1/2/3)
  - apps/web/src/shared/ui/components/*
- v0 MUST use Tier 1 components by default.
  Use Tier 2/3 ONLY when explicitly instructed in the prompt.
- Do NOT create new “base UI” components under `apps/web/src/features/**`
  (e.g., button.tsx, input.tsx, table.tsx, dialog.tsx, tabs.tsx, badge.tsx).
- If a needed component/pattern does not exist yet:
  - Do NOT implement it inside feature folders.
  - Instead, add a TODO list titled `Missing Shared Component / Pattern` in OUTPUT.md.
- Do NOT hardcode colors (no `bg-[#...]`, no arbitrary color values).
  Use tokens / CSS variables / existing Tailwind semantic classes.
- Keep spacing and radius consistent:
  - use Tailwind scale (p-4, gap-4, rounded-lg, etc.)
  - avoid arbitrary values like `p-[16px]`.


## App Shell / Layout
- The screens must render inside the App Shell layout.
- Do NOT create a new sidebar/header layout inside the feature.
- Feature UI should be only the content area (cards/tables/forms/etc).

## v0 Isolation Output Path (MANDATORY)
- Write all generated code ONLY under:
  - apps/web/_v0_drop/<context>/<feature>/src
- Assume this `src/` folder will later be moved to:
  - apps/web/src/features/<context>/<feature>/
- Do NOT write to apps/web/src directly.

## Prohibited Imports / Calls
- UI must NOT call Domain API directly.
- UI must NOT import from `packages/contracts/src/api`.
- UI must NOT create direct `fetch()` calls outside HttpBffClient wrapper.
- Do NOT access DB directly (BFF only).

## Handoff to Cursor
- Keep code modular and easy to migrate into:
  - apps/web/src/features/<context>/<feature>/
- Add brief migration notes in OUTPUT.md (what to move, what to refactor into shared/ui).

---


