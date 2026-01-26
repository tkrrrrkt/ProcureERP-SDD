# Research Notes: common/document-type

## Discovery Summary

### Codebase Pattern Analysis

**Module Structure Pattern**
- Domain API: `apps/api/src/modules/<context>/<feature>/` with controller/service/repository subdirectories
- BFF: `apps/bff/src/modules/<context>/<feature>/` with controller/service/mappers/clients subdirectories
- Contracts: `packages/contracts/src/api/<feature>/` and `packages/contracts/src/bff/<feature>/`

**Naming Conventions**
- Controllers: `<Entity>Controller`, `<Entity>BffController`
- Services: `<Entity>Service`, `<Entity>BffService`
- Repositories: `<Entity>Repository`
- Mappers: `<Feature>Mapper`
- Modules: `<Feature>Module`, `<Feature>BffModule`

**Error Handling Pattern**
- Three-part definition: Error codes, HTTP status map, Messages
- Pattern from `bank-master-error.ts` applied to `document-type-error.ts`

### Global Reference Data Consideration

**Current State**: All existing modules are tenant-scoped (tenant_id required)

**DocumentType Exception**:
- First global reference entity in the codebase
- No tenant_id, no RLS policy
- Read-only (seed data only, no CRUD operations for create/delete)
- All tenants share the same fixed 5 document types

**Implementation Approach**:
- DocumentType table without tenant_id
- Repository queries without tenant_id filter
- Controller endpoints without x-tenant-id header requirement for DocumentType reads

### Enum Pattern Analysis

**Database Enums (Prisma)**:
- Defined as `enum` in schema.prisma
- Examples: `AccountCategory`, `AccountType`, `TargetEntityKind`

**TypeScript Enums (Contracts)**:
- Defined as union types with `as const`
- Examples: `BankSortBy`, `SortOrder`

**Applied to Document-Type**:
- `DocumentTypeKey`: `'PR' | 'RFQ' | 'PO' | 'GR' | 'IR'`
- `PeriodKind`: `'NONE' | 'YY' | 'YYMM'`
- `SequenceScopeKind`: `'COMPANY' | 'DEPARTMENT'`

### Concurrency Control Pattern

**Optimistic Locking**:
- `version` column with increment on update
- WHERE clause includes `version` for conflict detection
- Returns null/0 count when conflict occurs
- Service layer throws `CONCURRENT_UPDATE` error

**Applied to NumberingRule**:
- `version` field in DTO and database
- Update request requires current version
- Conflict returns 409 with `CONCURRENT_UPDATE` code

### Atomic Counter Pattern

**INSERT→ON CONFLICT Pattern**:
- PostgreSQL upsert with conflict handling
- `ON CONFLICT DO UPDATE SET next_seq_no = next_seq_no + 1`
- `RETURNING next_seq_no` for atomic read-after-write

**Applied to NumberCounter**:
- Lazy creation on first numbering request
- Single-row update for serialization
- COMPANY scope uses fixed UUID (`00000000-0000-0000-0000-000000000000`)

### Referenced Specifications

- `.kiro/specs/spec_doc/61_機能設計検討/01_仕様検討/08_伝票種類・採番.md`
- `.kiro/specs/spec_doc/61_機能設計検討/02_エンティティ定義/08_伝票種類・採番.md`

### Key Design Decisions

1. **DocumentType as Global Reference**: First non-tenant-scoped entity; requires special handling in repository layer
2. **NumberCounter Internal Service**: Not exposed via API; called internally by document creation services
3. **DocumentNoService**: Abstraction layer for number generation; combines rule lookup + counter increment + format generation
4. **UI Scope**: Only NumberingRule management UI; DocumentType is display-only in rule list
5. **Permission Scope**: Read/Update only for NumberingRule; DocumentType has no permission requirements (public reference)
