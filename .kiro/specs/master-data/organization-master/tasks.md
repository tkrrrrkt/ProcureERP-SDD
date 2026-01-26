# Implementation Tasks

## Feature: master-data/organization-master

---

## Task 1: Contracts（BFF/API）定義

### 1.1 API Contracts 定義
- [x] `packages/contracts/src/api/organization-master/index.ts` を作成
- [x] Version DTO（ApiCreateVersionRequest, ApiUpdateVersionRequest, ApiVersionResponse, ApiListVersionsResponse）を定義
- [x] Department DTO（ApiCreateDepartmentRequest, ApiUpdateDepartmentRequest, ApiMoveDepartmentRequest, ApiDepartmentResponse, ApiListDepartmentsResponse）を定義
- [x] `packages/contracts/src/api/errors/organization-master-error.ts` を作成（エラーコード定義）

**Requirement Coverage**: 2, 3, 4, 7, 8, 9, 10, 14, 17

### 1.2 BFF Contracts 定義
- [x] `packages/contracts/src/bff/organization-master/index.ts` を作成
- [x] Version DTO（BffVersionListRequest, BffCreateVersionRequest, BffCopyVersionRequest, BffUpdateVersionRequest, BffVersionSummary, BffVersionListResponse, BffVersionDetailResponse）を定義
- [x] Department DTO（BffDepartmentTreeRequest, BffCreateDepartmentRequest, BffUpdateDepartmentRequest, BffMoveDepartmentRequest, BffDepartmentTreeNode, BffDepartmentTreeResponse, BffDepartmentDetailResponse）を定義

**Requirement Coverage**: 1, 5, 6, 11, 17

### 1.3 Contracts Index エクスポート
- [x] `packages/contracts/src/api/errors/index.ts` に organization-master をエクスポート追加
- [x] `packages/contracts/src/bff/errors/index.ts` に organization-master をエクスポート追加

---

## Task 2: DB / Migration / RLS

### 2.1 Prisma Schema 定義
- [x] `packages/db/prisma/schema.prisma` に OrganizationVersion モデルを追加
- [x] `packages/db/prisma/schema.prisma` に Department モデルを追加
- [x] 複合ユニーク制約（tenant_id + version_code, tenant_id + version_id + department_code, tenant_id + stable_id）を設定
- [x] インデックス（tenant_id, effective_date, parent_id, stable_id）を設定

**Requirement Coverage**: 14

### 2.2 Migration 作成
- [x] `packages/db/prisma/migrations/20260118000000_add_organization_master/migration.sql` を手動作成
- [x] RLS ポリシー含む完全な DDL を記述

### 2.3 RLS Policy 設定
- [x] organization_versions に tenant_isolation ポリシーを設定
- [x] departments に tenant_isolation ポリシーを設定

**Requirement Coverage**: 13

---

## Task 3: Domain API（apps/api）実装

### 3.1 Repository 実装
- [ ] `apps/api/src/modules/master-data/organization-master/organization-version.repository.ts` を作成
- [ ] findMany, findById, findByCode, findEffectiveAsOf, create, update メソッドを実装
- [ ] `apps/api/src/modules/master-data/organization-master/department.repository.ts` を作成
- [ ] findByVersion, findById, findByCode, findByStableId, create, createMany, update メソッドを実装
- [ ] 全メソッドで tenant_id を必須引数として受け取る

**Requirement Coverage**: 13, 14, 15

### 3.2 Service 実装 - Version
- [ ] `apps/api/src/modules/master-data/organization-master/organization-version.service.ts` を作成
- [ ] create: バージョンコード重複チェック、有効期間整合性チェック、監査情報記録
- [ ] update: 同上
- [ ] findEffectiveAsOf: as-of 検索ロジック（複数該当時は effective_date DESC で最新を返す）

**Requirement Coverage**: 2, 4, 16

### 3.3 Service 実装 - Version Copy
- [ ] `apps/api/src/modules/master-data/organization-master/version-copy.service.ts` を作成
- [ ] copyVersion: 新バージョン作成 + 全部門コピー（単一トランザクション）
- [ ] stable_id 引継ぎ、parent_id 再マッピング、base_version_id 記録

**Requirement Coverage**: 3

### 3.4 Service 実装 - Department
- [ ] `apps/api/src/modules/master-data/organization-master/department.service.ts` を作成
- [ ] create: 部門コード重複チェック、stable_id 自動生成、hierarchy 計算
- [ ] update: 重複チェック、hierarchy 再計算
- [ ] move: 循環参照チェック、parent_id 更新、hierarchy 再計算
- [ ] deactivate: 既無効化チェック、is_active = false
- [ ] reactivate: 既有効チェック、is_active = true

**Requirement Coverage**: 6, 7, 9, 10, 12

### 3.5 Utility 実装
- [ ] `apps/api/src/modules/master-data/organization-master/circular-ref-checker.ts` を作成（DFS アルゴリズム）
- [ ] `apps/api/src/modules/master-data/organization-master/hierarchy-calculator.ts` を作成

**Requirement Coverage**: 12

### 3.6 Controller 実装
- [ ] `apps/api/src/modules/master-data/organization-master/organization-master.controller.ts` を作成
- [ ] Version エンドポイント（GET /versions, GET /versions/:id, POST /versions, POST /versions/:id/copy, PATCH /versions/:id, GET /versions/as-of）
- [ ] Department エンドポイント（GET /versions/:versionId/departments, GET /departments/:id, POST /versions/:versionId/departments, PATCH /departments/:id, POST /departments/:id/move, POST /departments/:id/deactivate, POST /departments/:id/reactivate）

**Requirement Coverage**: All

### 3.7 Module 登録
- [ ] `apps/api/src/modules/master-data/organization-master/organization-master.module.ts` を作成
- [ ] `apps/api/src/app.module.ts` に OrganizationMasterModule を登録

---

## Task 4: BFF（apps/bff）実装

### 4.1 Mapper 実装
- [ ] `apps/bff/src/modules/master-data/organization-master/mappers/organization-mapper.ts` を作成
- [ ] API DTO → BFF DTO 変換ロジック
- [ ] isCurrentlyEffective 計算、departmentCount 集計、parentDepartmentName 結合

**Requirement Coverage**: 1, 5, 6

### 4.2 TreeBuilder 実装
- [ ] `apps/bff/src/modules/master-data/organization-master/tree-builder.ts` を作成
- [ ] フラット配列 → ツリー構造変換
- [ ] フィルタ適用時の親ノード自動展開

**Requirement Coverage**: 5, 11

### 4.3 Service 実装
- [ ] `apps/bff/src/modules/master-data/organization-master/organization-master.service.ts` を作成
- [ ] Domain API クライアント呼び出し
- [ ] Filter 正規化（keyword trim、isActive デフォルト true）
- [ ] sortBy ホワイトリスト検証

**Requirement Coverage**: 1, 5, 11

### 4.4 Controller 実装
- [ ] `apps/bff/src/modules/master-data/organization-master/organization-master.controller.ts` を作成
- [ ] BFF エンドポイント（design.md の BFF Endpoints 参照）
- [ ] Error Pass-through 実装

**Requirement Coverage**: All

### 4.5 Module 登録
- [ ] `apps/bff/src/modules/master-data/organization-master/organization-master.module.ts` を作成
- [ ] `apps/bff/src/app.module.ts` に OrganizationMasterBffModule を登録

---

## Task 5: UI 実装（v0 Prompt 作成）

### 5.1 v0 Prompt 作成
- [ ] `apps/web/_v0_drop/master-data/organization-master/PROMPT.md` を作成
- [ ] 3ペイン構成（左: バージョン履歴カード、中央: 部門ツリー、右: 詳細パネル）の指示
- [ ] 右クリックコンテキストメニュー（子部門追加、編集、無効化、移動）の指示
- [ ] Design System（`.kiro/steering/procure-design-system.md`）準拠の指示

**Requirement Coverage**: 5, 6, 7, 8, 11

### 5.2 MockBffClient 作成
- [ ] `apps/web/_v0_drop/master-data/organization-master/src/api/mock-bff-client.ts` を作成
- [ ] サンプルデータ（組織バージョン、部門階層）を定義
- [ ] BFF Contracts に準拠したインターフェース

**Requirement Coverage**: All

---

## Task 6: テスト実装

### 6.1 Unit Test - Service
- [ ] VersionService テスト（重複チェック、有効期間チェック、as-of 検索）
- [ ] DepartmentService テスト（重複チェック、stable_id 生成、無効化/再有効化）
- [ ] VersionCopyService テスト（コピー作成、stable_id 引継ぎ、parent_id 再マッピング）

### 6.2 Unit Test - Utility
- [ ] CircularRefChecker テスト（直接循環、間接循環、深い循環、ルート移動）
- [ ] HierarchyCalculator テスト（レベル計算、パス生成）
- [ ] TreeBuilder テスト（ツリー変換、フィルタ適用）

### 6.3 Integration Test
- [ ] Repository + DB テスト（CRUD、RLS 確認）
- [ ] BFF → API 統合テスト

---

## Summary

| Task | Sub-tasks | Requirements Covered |
|------|-----------|---------------------|
| 1. Contracts | 3 | 1-14 |
| 2. DB/Migration | 3 | 13, 14 |
| 3. Domain API | 7 | All |
| 4. BFF | 5 | All |
| 5. UI (v0) | 2 | 5-8, 11 |
| 6. Tests | 3 | All |

**Total**: 23 sub-tasks

---

## Implementation Order (Recommended)

1. **Task 1**: Contracts（すべての実装の基盤）
2. **Task 2**: DB/Migration（データ層の確立）
3. **Task 3**: Domain API（ビジネスロジック正本）
4. **Task 4**: BFF（UI向けAPI）
5. **Task 5**: UI（v0 Prompt でプロトタイプ）
6. **Task 6**: Tests（品質保証）

---

## Notes

- Contracts-first 原則に従い、Task 1 を最優先で完了させる
- 各タスク完了後は `pnpm build` で型エラーがないことを確認
- Task 3, 4 は並行開発可能（Contracts 完了後）
- UI 実装は v0 Prompt 作成 → v0 生成 → 受入チェック → 移植の流れ
