# Design Review Report

**Feature**: project-master  
**Review Date**: 2025-12-20  
**Reviewer**: AI Design Reviewer  
**Status**: ✅ **GO**

---

## Design Review Summary

本設計ドキュメントは、Contracts-first原則に従い、BFF/API/Repositoryの責務分離が明確に定義されている。requirements.mdの全要件を網羅し、steeringファイル（tech.md, structure.md）との整合性も確保されている。楽観ロック、wire-format統一、検索条件仕様の明文化など、最新の設計改善も反映されている。命名規約（camelCase/snake_case）の一貫性が保たれ、Error Policyも明示的に選択されている。実装に進む準備が整っている。

---

## Design Completeness Gate（必須項目チェック）

### ✅ 0.1 BFF Specification（apps/bff）
- ✅ BFF endpoints（UIが叩く）が6つすべて記載されている
- ✅ Request/Response DTO（packages/contracts/src/bff）が列挙されている
- ✅ **Paging/Sorting正規化（必須）が明記されている**
  - ✅ UI/BFF: page/pageSize、Domain API: offset/limit
  - ✅ defaults（page=1, pageSize=50, sortBy=projectCode, sortOrder=asc）
  - ✅ clamp（pageSize≤200）
  - ✅ whitelist（sortBy許可リスト: projectCode, projectName, projectShortName, plannedPeriodFrom, budgetAmount）
  - ✅ normalize（keyword trim、空→undefined）
  - ✅ transform（page→offset/limit）
- ✅ 変換（api DTO → bff DTO）の方針が記載されている（camelCase統一のため変換は最小限）
- ✅ エラー整形方針（**contracts/bff/errors** に準拠）が記載されている（Pass-through）
- ✅ tenant_id/user_id の取り回し（解決・伝搬ルール）が記載されている

### ✅ 0.2 Service Specification（Domain / apps/api）
- ✅ Usecase（list/findById/create/update/deactivate/reactivate）が列挙されている
- ✅ 主要ビジネスルールの所在（Domainに置く）が記載されている
- ✅ トランザクション境界が記載されている（Single transaction）
- ✅ 監査ログ記録ポイントが記載されている（create/update/deactivate/reactivate）
- ✅ 楽観ロック（version/ifMatchVersion）がBusiness Rulesに追加されている

### ✅ 0.3 Repository Specification（apps/api）
- ✅ Repository methods（findMany/findById/findByProjectCode/create/update/updateStatus）が列挙されている
- ✅ Tenant Guard Rules（tenant_id必須、where句+RLS二重ガード）が記載されている
- ✅ SortBy Mapping（DTOキー→DB列名）が記載されている
- ✅ **検索条件の一致仕様（MVP）が明記されている**
  - ✅ projectCode: 完全一致（=）
  - ✅ projectName/projectShortName/projectKanaName: 部分一致（ILIKE）
  - ✅ normalize: trimのみ
- ✅ DB Schema（Prisma）が完全に定義されている（versionフィールド含む）
- ✅ RLS Policyが記載されている

### ✅ 0.4 Contracts Summary
- ✅ BFF DTO（UI ↔ BFF）が完全に定義されている
  - ✅ ListProjectMasterRequest/Response
  - ✅ ProjectMasterListItem
  - ✅ ProjectMasterDetailResponse（version含む）
  - ✅ CreateProjectMasterRequest
  - ✅ UpdateProjectMasterRequest（ifMatchVersion含む）
- ✅ API DTO（BFF ↔ Domain API）が完全に定義されている
  - ✅ wire-format統一（ISO 8601 string、decimal string）
  - ✅ ProjectMasterEntity（version含む）
  - ✅ CreateProjectMasterRequest（api）
  - ✅ UpdateProjectMasterRequest（api、ifMatchVersion含む）
- ✅ Enum定義（ProjectMasterSortBy）が記載されている
- ✅ Error定義（ProjectMasterError、STALE_UPDATE含む）が記載されている

### ✅ 0.5 Responsibility Clarification
- ✅ UI/BFF/Domain API/Repositoryの責務が明確に分離されている
- ✅ Domain APIの責務にwire-formatからのparseが明記されている

---

## Requirements Traceability

| Requirement | Design Coverage |
|------------|----------------------|
| Requirement 1: 一覧検索・表示 | BFF Endpoints (GET), Service Methods (list), Repository Methods (findMany), 検索条件の一致仕様 |
| Requirement 2: 詳細表示 | BFF Endpoints (GET :id), Service Methods (findById), Repository Methods (findById) |
| Requirement 3: 作成 | BFF Endpoints (POST), Service Methods (create), Repository Methods (create), Business Rules（日付範囲バリデーション、予算金額精度保証） |
| Requirement 4: 更新 | BFF Endpoints (PATCH), Service Methods (update), Repository Methods (update), Business Rules（projectCode変更不可、日付範囲バリデーション、楽観ロック） |
| Requirement 5: 無効化 | BFF Endpoints (POST :id/deactivate), Service Methods (deactivate), Repository Methods (updateStatus) |
| Requirement 6: 再有効化 | BFF Endpoints (POST :id/reactivate), Service Methods (reactivate), Repository Methods (updateStatus) |
| Requirement 7: 権限・認可制御 | Service Specification (Business Rules: 権限チェック) |
| Requirement 8: マルチテナント境界 | Repository Specification (Tenant Guard Rules, RLS Policy) |
| Requirement 9: 監査・トレーサビリティ | Service Specification (Transaction Boundary / Audit Points) |
| Requirement 10: BFF正規化 | BFF Specification (Paging / Sorting Normalization) |
| Requirement 11: Error Pass-through | BFF Specification (Error Policy: Pass-through) |
| Requirement 12: Contracts-first | Architecture Pattern & Boundary Map, Contracts Summary |
| Requirement 13: MVP外（承認） | Overview（承認機能はMVP外） |

---

## Architecture Alignment

### ✅ Existing Architecture Alignment
- UI → BFF → Domain API → DBのパターンに準拠
- Contracts-first原則に完全に従っている
- steeringファイル（tech.md, structure.md）のルールに整合
- wire-format統一により、API境界での型変換が明確化されている

### ✅ Design Consistency & Standards
- 命名規約が一貫している（DTO: camelCase, DB: snake_case）
- Error Policyが明示的に選択されている（Pass-through）
- ページング/ソート正規化の責務が明確
- 楽観ロックが適切に設計されている（version/ifMatchVersion）

### ✅ Extensibility & Maintainability
- 責務分離が明確で、将来の拡張が容易
- departmentCode/responsibleEmployeeCodeがnullableで、将来のFK制約追加に対応可能
- ビジネスルールがDomain APIに集約されている
- 検索条件の仕様が明文化され、MVP後の拡張が容易

### ✅ Type Safety & Interface Design
- すべてのDTOが型定義されている
- sortByがenum型（`'projectCode' | 'projectName' | ...`）で定義されている
- Error定義が明確（STALE_UPDATE含む）
- wire-format統一により、型安全性が向上

---

## Critical Issues

### ⚠️ **Issue 1**: BFF責務の記述と実装の整合性

**Concern**: BFF Specificationの「Transformation Rules」に「日付文字列（ISO 8601）⇄ Date型の変換」と記載されているが、API DTOがwire-format（ISO 8601 string）に統一されているため、BFFでのDate型変換は不要になっている。

**Impact**: 実装時に混乱を招く可能性がある。BFFは文字列のままDomain APIへ渡すべきだが、現在の記述ではDate型への変換が必要と誤解される可能性がある。

**Suggestion**: BFF Specificationの「Transformation Rules」を修正し、「API DTOはwire-format（ISO 8601 string、decimal string）のため、BFFでの型変換は不要。文字列のままDomain APIへ伝達する」旨を明記する。または、BFF責務から「日付文字列⇄Date型の変換」を削除する。

**Traceability**: Requirement 10（BFF正規化）、設計上の重要な決定事項（wire-format統一）

**Evidence**: design.md 69-73行目（Transformation Rules）、431-438行目（BFFの責務）

---

## Design Strengths

### 1. 楽観ロックの適切な設計
楽観ロック（version/ifMatchVersion）がBusiness Rules、Contracts Summary、Error定義に一貫して反映されている。同時更新の競合防止が適切に設計されている。

### 2. wire-format統一による型安全性の向上
API DTOをwire-format（ISO 8601 string、decimal string）に統一することで、JSONでの精度保証と型安全性が向上している。Domain APIでのparse責務も明確化されている。

### 3. 検索条件仕様の明文化
Repository Specificationに検索条件の一致仕様（完全一致/部分一致）が明記されており、実装時の解釈の揺れが防止される。

---

## Final Assessment

### Decision: ✅ **GO**

### Rationale
設計ドキュメントは完全で、requirements.mdの全要件を網羅し、steeringファイルとの整合性も確保されている。楽観ロック、wire-format統一、検索条件仕様の明文化など、最新の設計改善も適切に反映されている。Issue 1は軽微な記述の整合性の問題であり、実装に大きな影響を与えない。実装に進む準備が整っている。

### Next Steps
1. Issue 1の修正（BFF責務の記述をwire-format統一に合わせて更新）
2. 設計ドキュメントの承認（`spec.json`の`design.approved`を`true`に更新）
3. タスク生成フェーズへ進む：`/kiro/spec-tasks master-data/project-master`
4. 実装開始前にContracts定義を先に実装（Contracts-first原則に従う）

---

## Notes

- 設計ドキュメントは実装の指針として十分な詳細度を持っている
- Repository層でのsortByマッピング（DTOキー → DB列名）の実装詳細はtasks.mdで定義される
- 監査ログの実装詳細（フォーマット、保存先等）はtasks.mdで定義される
- 楽観ロックのversion更新ロジック（更新時にversionをインクリメント）は実装時に明示的に実装する必要がある

