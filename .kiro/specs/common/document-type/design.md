# Design Document: common/document-type

---

**Purpose**: 伝票種類マスタ（DocumentType）と採番機能（NumberingRule / NumberCounter）の設計を定義し、実装の一貫性を保証する。

## Overview

本機能は ProcureERP における伝票（購買依頼/見積依頼/発注/入荷/仕入計上）の種類定義と採番管理を提供する。

**DocumentType**: システム固定の5種類（PR/RFQ/PO/GR/IR）をグローバル参照として提供。tenant_id を持たず、全テナントで共通利用される読み取り専用マスタ。

**NumberingRule**: テナントごとの採番ルール設定を管理。prefix、部門記号含有、期間種別、系列分割の設定をテナント管理者が変更可能。

**NumberCounter**: 採番カウンタをシステム内部で管理。初回採番時に遅延作成され、同一行更新による排他制御で番号の一意性を保証。

---

## Architecture

### Architecture Pattern & Boundary Map

**Pattern (fixed)**:
- UI（apps/web） → BFF（apps/bff） → Domain API（apps/api） → DB（PostgreSQL + RLS）
- UI直APIは禁止

**Contracts (SSoT)**:
- UI ↔ BFF: `packages/contracts/src/bff/document-type`
- BFF ↔ Domain API: `packages/contracts/src/api/document-type`
- Enum/Error: `packages/contracts/src/api/errors/document-type-error.ts`, `packages/contracts/src/bff/errors/document-type-error.ts`
- UI は `packages/contracts/src/api` を参照してはならない

**特殊考慮事項**:
- DocumentType は **グローバル参照**（tenant_id なし）のため、RLS は適用されない
- NumberingRule / NumberCounter は通常のテナントスコープ（RLS 有効）

---

## Architecture Responsibilities（Mandatory）

### BFF Specification（apps/bff）

**Purpose**
- 採番ルール設定画面に最適化したAPI
- DocumentType一覧の提供
- Domain APIのレスポンスを集約・変換（ビジネスルールの正本は持たない）

**BFF Endpoints（UIが叩く）**

| Method | Endpoint | Purpose | Request DTO (contracts/bff) | Response DTO (contracts/bff) | Notes |
| ------ | -------- | ------- | --------------------------- | ---------------------------- | ----- |
| GET | `/bff/document-types` | 伝票種類一覧取得 | - | `ListDocumentTypesResponse` | グローバル参照、キャッシュ可 |
| GET | `/bff/numbering-rules` | 採番ルール一覧取得 | `ListNumberingRulesRequest` | `ListNumberingRulesResponse` | テナントスコープ |
| GET | `/bff/numbering-rules/:id` | 採番ルール詳細取得 | - | `GetNumberingRuleResponse` | |
| PUT | `/bff/numbering-rules/:id` | 採番ルール更新 | `UpdateNumberingRuleRequest` | `UpdateNumberingRuleResponse` | 楽観ロック必須 |

**Naming Convention（必須）**
- DTO / Contracts: camelCase（例: `documentTypeKey`, `periodKind`, `sequenceScopeKind`）
- DB columns: snake_case（例: `document_type_key`, `period_kind`, `sequence_scope_kind`）
- `sortBy` は **DTO側キー**を採用する（例: `documentTypeKey | name`）
- DB列名（snake_case）を UI/BFF へ露出させない

**Paging / Sorting Normalization（必須・BFF責務）**
- DocumentType一覧: ページング不要（固定5件）
- NumberingRule一覧:
  - defaults: page=1, pageSize=50, sortBy=documentTypeKey, sortOrder=asc
  - clamp: pageSize <= 200
  - whitelist: sortBy は `documentTypeKey` のみ許可
  - normalize: keyword trim、空→undefined
  - transform: offset=(page-1)*pageSize, limit=pageSize
- Domain APIに渡すのは offset/limit（page/pageSizeは渡さない）
- BFFレスポンスには page/pageSize を含める

**Transformation Rules（api DTO → bff DTO）**
- DocumentType: フィールド変換なし（透過）
- NumberingRule:
  - `documentTypeKey` に対応する `documentTypeName` を追加（UI表示用）
  - `numberPreview` フィールドを追加（採番プレビュー生成）

**Error Policy（必須）**
- この Feature における BFF の Error Policy は以下とする：
  - 採用方針：**Option A: Pass-through（基本・推奨）**
  - 採用理由：採番ルール管理は CRUD 操作が中心であり、Domain API のエラーをそのまま UI に伝達することで十分。BFF での意味的再分類は不要。

**Authentication / Tenant Context（tenant_id/user_id伝搬）**
- DocumentType一覧: tenant_id 不要（グローバル参照）、認証のみ必須
- NumberingRule操作: tenant_id / user_id を HTTP ヘッダー（`x-tenant-id`, `x-user-id`）で Domain API に伝搬

---

### Service Specification（Domain / apps/api）

#### DocumentTypeService

**責務**
- 伝票種類マスタの参照提供
- ビジネスルールなし（固定マスタ）

**Operations**
| Method | Input | Output | Transaction | Notes |
| ------ | ----- | ------ | ----------- | ----- |
| `listDocumentTypes()` | - | `ListDocumentTypesApiResponse` | Read-only | グローバル参照、tenant_id 不要 |
| `getDocumentType(documentTypeKey)` | `string` | `GetDocumentTypeApiResponse` | Read-only | |

#### NumberingRuleService

**責務**
- テナント別採番ルールの CRUD
- prefix フォーマット検証（英大文字1文字）
- 楽観ロック競合検出
- 監査ログ記録

**Operations**
| Method | Input | Output | Transaction | Notes |
| ------ | ----- | ------ | ----------- | ----- |
| `listNumberingRules(tenantId, request)` | `ListNumberingRulesApiRequest` | `ListNumberingRulesApiResponse` | Read-only | |
| `getNumberingRule(tenantId, ruleId)` | `string` | `GetNumberingRuleApiResponse` | Read-only | |
| `updateNumberingRule(tenantId, userId, ruleId, request)` | `UpdateNumberingRuleApiRequest` | `UpdateNumberingRuleApiResponse` | Write | 楽観ロック必須 |
| `initializeRulesForTenant(tenantId, userId)` | - | `void` | Write | テナント初期セットアップ用 |

**Validation Rules**
- `prefix`: 英大文字1文字（`^[A-Z]$`）
- `periodKind`: `NONE` | `YY` | `YYMM`
- `sequenceScopeKind`: `COMPANY` | `DEPARTMENT`
- 同一テナント・同一伝票種類の重複禁止（UNIQUE制約）

**Audit Points**
- `updateNumberingRule`: 変更前後の値を監査ログに記録
  - 記録項目: tenantId, userId, ruleId, changedFields, oldValues, newValues, timestamp

#### NumberCounterService

**責務**
- 採番カウンタの管理（内部サービス、外部API非公開）
- 遅延作成（INSERT→ON CONFLICT）
- 同一行更新による排他制御

**Operations**
| Method | Input | Output | Transaction | Notes |
| ------ | ----- | ------ | ----------- | ----- |
| `getNextSequence(tenantId, documentTypeKey, sequenceScopeKind, scopeId)` | 複合キー | `number` | Write | 排他制御必須 |

**Concurrency Control**
- 同一系列（tenant × document_type_key × sequence_scope_kind × scope_id）への同時リクエストは DB 行ロックで排他
- UPDATE + RETURNING を使用してカウンタをアトミックに取得・更新

#### DocumentNoService

**責務**
- 伝票番号の生成（内部サービス）
- 採番ルール適用と番号フォーマット

**Operations**
| Method | Input | Output | Transaction | Notes |
| ------ | ----- | ------ | ----------- | ----- |
| `generateDocumentNo(tenantId, documentTypeKey, departmentStableId, documentDate)` | 生成パラメータ | `string` | Write | NumberCounterService を呼び出し |

**Number Format**
1. `prefix` (1文字)
2. `departmentSymbol` (include_department_symbol=true の場合のみ)
3. `period` (period_kind に応じて YY/YYMM/なし)
4. `seq` (8桁ゼロ埋め)

例: `PA260100000001` (prefix=P, dept=A, period=YYMM, seq=1)

---

### Repository Specification（apps/api）

#### DocumentTypeRepository

**特殊事項**: グローバル参照のため tenant_id フィルタなし

| Method | Query Pattern | Notes |
| ------ | ------------- | ----- |
| `findAll()` | `SELECT * FROM document_types WHERE is_active = true` | グローバル |
| `findByKey(documentTypeKey)` | `SELECT * FROM document_types WHERE document_type_key = $1 AND is_active = true` | グローバル |

#### NumberingRuleRepository

| Method | Query Pattern | Notes |
| ------ | ------------- | ----- |
| `findAll(tenantId, request)` | `WHERE tenant_id = $1 AND is_active = true` | tenant_id 必須 |
| `findOne(tenantId, ruleId)` | `WHERE tenant_id = $1 AND id = $2 AND is_active = true` | tenant_id 二重ガード |
| `findByDocumentTypeKey(tenantId, documentTypeKey)` | `WHERE tenant_id = $1 AND document_type_key = $2` | |
| `update(tenantId, ruleId, version, data)` | `UPDATE ... WHERE tenant_id = $1 AND id = $2 AND version = $3` | 楽観ロック |
| `create(tenantId, data)` | `INSERT INTO document_numbering_rules ...` | テナント初期セットアップ用 |

#### NumberCounterRepository

| Method | Query Pattern | Notes |
| ------ | ------------- | ----- |
| `getNextAndIncrement(tenantId, documentTypeKey, scopeKind, scopeId)` | `INSERT ... ON CONFLICT DO UPDATE SET next_seq_no = next_seq_no + 1 RETURNING next_seq_no` | アトミック操作 |

---

### Contracts Summary（This Feature）

#### API Contracts (`packages/contracts/src/api/document-type/index.ts`)

**Types & Enums**
```typescript
export type DocumentTypeKey = 'PR' | 'RFQ' | 'PO' | 'GR' | 'IR';
export type PeriodKind = 'NONE' | 'YY' | 'YYMM';
export type SequenceScopeKind = 'COMPANY' | 'DEPARTMENT';
```

**DTOs**
```typescript
// DocumentType
export interface DocumentTypeDto {
  id: string;
  documentTypeKey: DocumentTypeKey;
  name: string;
  description: string | null;
  wfEnabled: boolean;
}

export interface ListDocumentTypesApiResponse {
  documentTypes: DocumentTypeDto[];
}

// NumberingRule
export interface NumberingRuleDto {
  id: string;
  tenantId: string;
  documentTypeKey: DocumentTypeKey;
  prefix: string;
  includeDepartmentSymbol: boolean;
  periodKind: PeriodKind;
  sequenceScopeKind: SequenceScopeKind;
  seqPadding: number;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface ListNumberingRulesApiRequest {
  offset?: number;
  limit?: number;
  sortBy?: 'documentTypeKey';
  sortOrder?: 'asc' | 'desc';
}

export interface ListNumberingRulesApiResponse {
  rules: NumberingRuleDto[];
  total: number;
}

export interface UpdateNumberingRuleApiRequest {
  prefix: string;
  includeDepartmentSymbol: boolean;
  periodKind: PeriodKind;
  sequenceScopeKind: SequenceScopeKind;
  version: number;
}

export interface UpdateNumberingRuleApiResponse {
  rule: NumberingRuleDto;
}
```

#### BFF Contracts (`packages/contracts/src/bff/document-type/index.ts`)

**DTOs（API に追加フィールド）**
```typescript
export interface NumberingRuleBffDto extends Omit<NumberingRuleDto, 'tenantId'> {
  documentTypeName: string;  // 伝票種類名（UI表示用）
  numberPreview: string;     // 採番プレビュー（例: P260100000001）
}

export interface ListNumberingRulesResponse {
  rules: NumberingRuleBffDto[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
```

#### Error Contracts (`packages/contracts/src/api/errors/document-type-error.ts`)

```typescript
export const DocumentTypeErrorCode = {
  DOCUMENT_TYPE_NOT_FOUND: 'DOCUMENT_TYPE_NOT_FOUND',
  NUMBERING_RULE_NOT_FOUND: 'NUMBERING_RULE_NOT_FOUND',
  INVALID_PREFIX_FORMAT: 'INVALID_PREFIX_FORMAT',
  CONCURRENT_UPDATE: 'CONCURRENT_UPDATE',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
} as const;

export type DocumentTypeErrorCode =
  (typeof DocumentTypeErrorCode)[keyof typeof DocumentTypeErrorCode];

export const DocumentTypeErrorHttpStatus: Record<DocumentTypeErrorCode, number> = {
  [DocumentTypeErrorCode.DOCUMENT_TYPE_NOT_FOUND]: 404,
  [DocumentTypeErrorCode.NUMBERING_RULE_NOT_FOUND]: 404,
  [DocumentTypeErrorCode.INVALID_PREFIX_FORMAT]: 422,
  [DocumentTypeErrorCode.CONCURRENT_UPDATE]: 409,
  [DocumentTypeErrorCode.PERMISSION_DENIED]: 403,
};

export const DocumentTypeErrorMessage: Record<DocumentTypeErrorCode, string> = {
  [DocumentTypeErrorCode.DOCUMENT_TYPE_NOT_FOUND]: '指定された伝票種類が見つかりません',
  [DocumentTypeErrorCode.NUMBERING_RULE_NOT_FOUND]: '指定された採番ルールが見つかりません',
  [DocumentTypeErrorCode.INVALID_PREFIX_FORMAT]: 'prefixは英大文字1文字で指定してください',
  [DocumentTypeErrorCode.CONCURRENT_UPDATE]: '他のユーザーによって更新されています',
  [DocumentTypeErrorCode.PERMISSION_DENIED]: 'この操作を行う権限がありません',
};
```

---

## Responsibility Clarification（Mandatory）

本Featureにおける責務境界を以下に明記する。
未記載の責務は実装してはならない。

### UIの責務
- 採番ルール一覧・詳細の表示
- 採番ルール編集フォーム（prefix入力制御、ドロップダウン選択）
- 採番プレビューの表示
- 楽観ロック競合時のエラー表示とリロード促し
- 権限に応じた編集ボタンの表示/非表示制御
- ビジネス判断は禁止

### BFFの責務
- UI入力の正規化（paging / sorting）
- Domain API DTO ⇄ UI DTO の変換
- `documentTypeName` と `numberPreview` の付加（Domain API からの情報を使用）
- ビジネスルールの正本は持たない

### Domain APIの責務
- ビジネスルールの正本
  - prefix フォーマット検証
  - 楽観ロック競合検出
- 権限チェック（`procure.numbering-rule.read`, `procure.numbering-rule.update`）
- 監査ログ記録
- 整合性保証

---

## Database Schema

### document_types（グローバル参照）

```sql
CREATE TABLE document_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_type_key TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  wf_enabled BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by_login_account_id UUID NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by_login_account_id UUID NOT NULL,

  CONSTRAINT uk_document_type_key UNIQUE (document_type_key),
  CONSTRAINT ck_document_type_key CHECK (document_type_key IN ('PR','RFQ','PO','GR','IR'))
);

-- Seed Data
INSERT INTO document_types (document_type_key, name, description, wf_enabled, created_by_login_account_id, updated_by_login_account_id) VALUES
  ('PR', '購買依頼', '購買依頼伝票', true, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000'),
  ('RFQ', '見積依頼', '見積依頼伝票', false, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000'),
  ('PO', '発注', '発注伝票', true, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000'),
  ('GR', '入荷', '入荷伝票', false, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000'),
  ('IR', '仕入計上', '仕入計上伝票', true, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000');
```

### document_numbering_rules（テナントスコープ）

```sql
CREATE TABLE document_numbering_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  document_type_key TEXT NOT NULL,
  prefix TEXT NOT NULL,
  include_department_symbol BOOLEAN NOT NULL DEFAULT false,
  period_kind TEXT NOT NULL DEFAULT 'YYMM',
  sequence_scope_kind TEXT NOT NULL DEFAULT 'COMPANY',
  seq_padding INTEGER NOT NULL DEFAULT 8,
  version INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by_login_account_id UUID NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by_login_account_id UUID NOT NULL,

  CONSTRAINT uk_tenant_document_type UNIQUE (tenant_id, document_type_key),
  CONSTRAINT ck_document_type_key CHECK (document_type_key IN ('PR','RFQ','PO','GR','IR')),
  CONSTRAINT ck_prefix CHECK (prefix ~ '^[A-Z]$'),
  CONSTRAINT ck_period_kind CHECK (period_kind IN ('NONE','YY','YYMM')),
  CONSTRAINT ck_sequence_scope_kind CHECK (sequence_scope_kind IN ('COMPANY','DEPARTMENT')),
  CONSTRAINT ck_seq_padding CHECK (seq_padding = 8)
);

-- RLS Policy
ALTER TABLE document_numbering_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON document_numbering_rules
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
```

### document_number_counters（テナントスコープ）

```sql
CREATE TABLE document_number_counters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  document_type_key TEXT NOT NULL,
  sequence_scope_kind TEXT NOT NULL,
  scope_id UUID NOT NULL,
  next_seq_no BIGINT NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by_login_account_id UUID NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by_login_account_id UUID NOT NULL,

  CONSTRAINT uk_counter_key UNIQUE (tenant_id, document_type_key, sequence_scope_kind, scope_id),
  CONSTRAINT ck_document_type_key CHECK (document_type_key IN ('PR','RFQ','PO','GR','IR')),
  CONSTRAINT ck_sequence_scope_kind CHECK (sequence_scope_kind IN ('COMPANY','DEPARTMENT')),
  CONSTRAINT ck_next_seq_no CHECK (next_seq_no >= 1)
);

-- RLS Policy
ALTER TABLE document_number_counters ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON document_number_counters
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

-- Atomic counter increment (used via ON CONFLICT)
-- scope_id for COMPANY scope: '00000000-0000-0000-0000-000000000000'
```

---

## Seed Data: Tenant Initial Setup

テナント作成時に以下の採番ルールを自動作成する：

| documentTypeKey | prefix | includeDepartmentSymbol | periodKind | sequenceScopeKind |
| --------------- | ------ | ----------------------- | ---------- | ----------------- |
| PR | R | false | YYMM | COMPANY |
| RFQ | Q | false | YYMM | COMPANY |
| PO | P | true | YYMM | DEPARTMENT |
| GR | G | false | YYMM | COMPANY |
| IR | I | true | YYMM | DEPARTMENT |

---

## File Structure

```
packages/contracts/src/
├── api/
│   ├── document-type/
│   │   └── index.ts              # API contracts
│   └── errors/
│       └── document-type-error.ts
└── bff/
    ├── document-type/
    │   └── index.ts              # BFF contracts
    └── errors/
        └── document-type-error.ts

apps/api/src/modules/common/document-type/
├── document-type.module.ts
├── controller/
│   ├── document-type.controller.ts
│   └── numbering-rule.controller.ts
├── service/
│   ├── document-type.service.ts
│   ├── numbering-rule.service.ts
│   ├── number-counter.service.ts
│   └── document-no.service.ts
└── repository/
    ├── document-type.repository.ts
    ├── numbering-rule.repository.ts
    └── number-counter.repository.ts

apps/bff/src/modules/common/document-type/
├── document-type.module.ts
├── controller/
│   ├── document-type.controller.ts
│   └── numbering-rule.controller.ts
├── service/
│   ├── document-type.service.ts
│   └── numbering-rule.service.ts
├── mappers/
│   └── document-type.mapper.ts
└── clients/
    └── domain-api.client.ts

apps/web/src/
├── app/common/numbering-rule/
│   └── page.tsx
└── features/common/numbering-rule/
    └── ui/
        ├── api/
        │   ├── BffClient.ts
        │   ├── HttpBffClient.ts
        │   └── MockBffClient.ts
        ├── components/
        │   ├── NumberingRuleList.tsx
        │   └── NumberingRuleDialog.tsx
        ├── hooks/
        │   └── useNumberingRule.ts
        └── types/
            └── bff-contracts.ts

packages/db/prisma/
├── schema.prisma              # Model definitions
└── migrations/
    └── YYYYMMDD_add_document_type/
        └── migration.sql
```
