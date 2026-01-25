# Research Log: employee-assignment

## Summary

### Discovery Scope
- **Feature Type**: Extension（既存の employee-master / organization-master への機能追加）
- **Discovery Level**: Light（既存パターンの踏襲が中心）

### Key Findings
1. **既存パターン踏襲**: employee-master の契約・サービス・リポジトリパターンをそのまま適用可能
2. **部門連携**: organization-master の `DepartmentApiDto.stableId` を使用して組織改編耐性を実現
3. **エラー定義**: 既存の `*ErrorCode` / `*ErrorHttpStatus` / `*ErrorMessage` パターンに従う

---

## Research Log

### Topic 1: 契約設計パターン

**Investigation**:
- `packages/contracts/src/api/employee-master/index.ts` を分析
- `packages/contracts/src/bff/employee-master/index.ts` を分析

**Findings**:
- API契約: offset/limit ベースのページング
- BFF契約: page/pageSize ベースのページング（BFFで変換）
- DTO命名: camelCase、日付は ISO 8601 文字列
- 楽観ロック: `version` フィールドで実現

**Implications**:
- employee-assignment も同様のパターンを採用
- 社員IDに紐づく一覧取得なのでページングは不要（件数が限定的）

---

### Topic 2: 期間重複チェックロジック

**Investigation**:
- 主務（primary）の同時期重複を防ぐ必要がある
- PostgreSQL の EXCLUDE 制約 vs アプリケーションロジック

**Findings**:
- EXCLUDE 制約は daterange 型で厳密な重複チェック可能
- ただし Prisma ORM との相性を考慮するとアプリケーション層でのチェックが現実的

**Decision**:
- Domain API の Service 層で重複チェックを実装
- 将来的に DB 制約を追加する可能性を残す

---

### Topic 3: 部門選択UI

**Investigation**:
- 組織版（organization_versions）と部門（departments）の関係を分析
- `stable_id` による版非依存の追跡を確認

**Findings**:
- 部門選択時は現在有効な組織版の部門一覧を使用
- 保存時は `departments.stable_id` を `employee_assignments.department_stable_id` に設定
- 表示時は `stable_id` から現在有効版の部門名を解決

**Decision**:
- BFF で部門名解決を行う（UI は stable_id を意識しない）
- organization-master の既存 API を活用

---

### Topic 4: UIアーキテクチャ

**Investigation**:
- 社員マスタ詳細画面（EmployeeFormDialog）の構造を分析

**Findings**:
- 現在は単一ダイアログでCRUD
- タブ構造への拡張が必要

**Decision**:
- EmployeeDetailDialog（新規）を作成し、タブ構造で基本情報と所属情報を分離
- 所属一覧・登録・編集は EmployeeAssignmentTab として実装

---

## Architecture Pattern Evaluation

### Option A: 独立モジュール
- `apps/api/src/modules/master-data/employee-assignment/` として独立
- 利点: 責務が明確、テスト単位が明確
- 欠点: employee-master との連携コードが必要

### Option B: employee-master への統合
- `apps/api/src/modules/master-data/employee-master/` に追加
- 利点: 既存コードの再利用
- 欠点: モジュールが肥大化

**Decision**: Option A（独立モジュール）を採用
- CCSDDの原則に従い、機能単位でモジュールを分離
- employee-master は社員の基本情報、employee-assignment は所属情報と責務を分離

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| 主務重複チェックのパフォーマンス | Medium | インデックス追加（tenant_id, employee_id, effective_date） |
| stable_id による部門名解決の複雑性 | Low | BFF で一括解決、キャッシュ検討 |
| 既存 employee-master UI の改修範囲 | Medium | 段階的な UI 拡張（まず一覧、次にタブ） |

---

## References

- [01_組織基盤エンティティ.md](.kiro/specs/entities/01_組織基盤エンティティ.md) - エンティティ定義
- [employee-master contracts](packages/contracts/src/api/employee-master/index.ts) - 既存パターン
- [organization-master contracts](packages/contracts/src/api/organization-master/index.ts) - 部門DTO定義
