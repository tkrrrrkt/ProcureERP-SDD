# Implementation Plan

> CCSDD / SDD 前提：**contracts-first**（shared（共通のみ最小） → api → bff）を最優先し、境界違反を guard で止める。  
> UI は最後。v0 は **Phase 1（統制テスト）→ Phase 2（本実装）** の二段階で扱う。

---

## 0.0 Requirements Completeness Gate（Blocking）

> Implementation MUST NOT start until all items below are checked.

- [ ] 0.0.1 requirements.md に Decision / FR が存在すること
- [ ] 0.0.2 design/tasks が参照するID（D-01, FR-LIST-01等）が requirements.md に存在すること

---

## 0. Design Completeness Gate（Blocking）

> Implementation MUST NOT start until all items below are checked.
> These checks are used to prevent "empty design sections" from being silently interpreted by implementers/AI.

- [x] 0.1 Designの「BFF Specification（apps/bff）」が埋まっている
- [x] 0.2 Designの「Service Specification（Domain / apps/api）」が埋まっている
- [x] 0.3 Designの「Repository Specification（apps/api）」が埋まっている
- [x] 0.4 Designの「Contracts Summary（This Feature）」が埋まっている
- [x] 0.5 Requirements Traceability（必要な場合）が更新されている
- [ ] 0.6 v0生成物の受入・移植ルールが確認されている（実装時に確認）
- [ ] 0.7 Structure / Boundary Guard がパスしている（実装後に確認）

---

## 1. Scaffold / Structure Setup（最初に実施）

- [ ] 1.0 Feature骨格生成（Scaffold）
  - 実行: `npx tsx scripts/scaffold-feature.ts master-data project-master`
  - 目的: 正しい配置先を先に確定させる（v0混入防止）
  - 確認:
    - `apps/web/src/features/master-data/project-master` が作成されている
    - `apps/bff/src/modules/master-data/project-master` が作成されている
    - `apps/api/src/modules/master-data/project-master` が作成されている
    - `apps/web/_v0_drop/master-data/project-master` が作成されている

---

## 2. Work Breakdown Rules（タスク分解の規約）

- **Order（必須）**: Decisions → Contracts → DB → Domain API → BFF → UI
- **Contracts-first（必須）**:
  - 先に `packages/contracts/src/shared` を確定（共通利用するもののみ最小限、循環参照を避ける）
  - 次に `packages/contracts/src/api` を確定
  - 最後に `packages/contracts/src/bff` を確定
  - Enum / Error の配置ルール:
    - UI↔BFF: `packages/contracts/src/bff/(enums|errors)`
    - BFF↔API: `packages/contracts/src/api/(enums|errors)`
    - shared: 複数境界で共通利用するもののみ（最小限）
- **UI Two-Phase（推奨）**:
  - Phase 1: v0統制テスト（MockBffClientで動作、見た目完成は目的外）
  - Phase 2: 本実装（URL state / debounce / 実BFF接続 / E2E）

---

## 3. Decisions（意思決定）

- [ ] 3.1 実装方針の確認
  - projectCode変更不可（D-01）: 更新リクエストにprojectCodeが含まれている場合は422エラー
  - ページング仕様（D-02）: page/pageSize（default: page=1, pageSize=50, max=200）
  - デフォルトソート（D-03）: projectCode asc
  - departmentCode（D-04）: nullable、MVPではFK制約なし
  - responsibleEmployeeCode（D-05）: nullable、MVPではFK制約なし
  - プロジェクト実績From/To（D-06）: nullable（実績が確定していない場合はnull）
  - プロジェクト予算金額（D-07）: DECIMAL型を使用（精度保証）
  - 再有効化（OQ-01）: MVPに含める
  - 楽観ロック: version/ifMatchVersionによる競合防止
  - 検索条件の一致仕様: projectCodeは完全一致、projectName/projectShortName/projectKanaNameは部分一致（ILIKE）
  - Error Policy: Pass-through（Requirement 11）
  - _Requirements: FR-LIST-04, FR-LIST-10, FR-LIST-11_

---

## 4. Contracts（shared（共通のみ最小） → api → bff）

### 4.1 Shared Contracts（共通利用のみ最小限）

- [ ] 4.1.1 ProjectMasterSortBy Enum定義（api/bffで共通利用が必要な場合のみ）
  - 場所: `packages/contracts/src/shared/enums/project-master-sort-by.ts`（共通利用が必要な場合）
  - または: `packages/contracts/src/api/enums/project-master-sort-by.ts` と `packages/contracts/src/bff/enums/project-master-sort-by.ts` にそれぞれ配置（共通利用が不要な場合）
  - 定義: `PROJECT_CODE = 'projectCode'`, `PROJECT_NAME = 'projectName'`, `PROJECT_SHORT_NAME = 'projectShortName'`, `PLANNED_PERIOD_FROM = 'plannedPeriodFrom'`, `BUDGET_AMOUNT = 'budgetAmount'`
  - 注意: api/bffで共通利用が必要な場合のみsharedに配置、そうでなければapi/bffにそれぞれ配置
  - _Requirements: FR-LIST-10_

### 4.2 API Contracts（BFF ↔ Domain API）

- [ ] 4.2.1 ProjectMasterError定義（Domain API正本）
  - 場所: `packages/contracts/src/api/errors/project-master-error.ts`
  - 定義:
    - `PROJECT_NOT_FOUND` (404)
    - `PROJECT_CODE_DUPLICATE` (409)
    - `PROJECT_CODE_CANNOT_BE_CHANGED` (422)
    - `PROJECT_ALREADY_INACTIVE` (409)
    - `PROJECT_ALREADY_ACTIVE` (409)
    - `STALE_UPDATE` (409) - 楽観ロック競合
    - `INVALID_DATE_RANGE` (422) - 予定期間From > To、または実績From > To
    - `ACTUAL_PERIOD_TO_REQUIRED` (422) - 実績Fromが指定されているが実績Toが未指定
    - `VALIDATION_ERROR` (422)
  - 注意: Domain API正本としてapi/errorsに配置。UI表示用が必要な場合はbff側で型を持つ
  - _Requirements: FR-LIST-11_

- [ ] 4.2.2 ListProjectMasterRequest (api)定義
  - 場所: `packages/contracts/src/api/dto/project-master/list-project-master-request.ts`
  - フィールド: offset, limit, sortBy ('projectCode' | 'projectName' | 'projectShortName' | 'plannedPeriodFrom' | 'budgetAmount'), sortOrder, projectCode?, projectName?, projectShortName?, departmentCode?, responsibleEmployeeCode?, includeInactive?
  - 注意: sortByはDTOキー（camelCase）を採用
  - _Requirements: FR-LIST-01, FR-LIST-10_

- [ ] 4.2.3 ListProjectMasterResponse (api)定義
  - 場所: `packages/contracts/src/api/dto/project-master/list-project-master-response.ts`
  - フィールド: items, totalCount
  - _Requirements: FR-LIST-01_

- [ ] 4.2.4 ProjectMasterEntity定義
  - 場所: `packages/contracts/src/api/dto/project-master/project-master-entity.ts`
  - フィールド: id, tenantId, projectCode, projectName, projectShortName?, projectKanaName?, departmentCode?, responsibleEmployeeCode?, responsibleEmployeeName?, plannedPeriodFrom (ISO 8601 string), plannedPeriodTo (ISO 8601 string), actualPeriodFrom? (ISO 8601 string), actualPeriodTo? (ISO 8601 string), budgetAmount (decimal string), version, isActive, createdAt (ISO 8601 string), updatedAt (ISO 8601 string), createdBy, updatedBy
  - 注意: すべてcamelCaseで統一、日付と金額はwire-format（ISO 8601 string、decimal string）
  - _Requirements: FR-LIST-02_

- [ ] 4.2.5 CreateProjectMasterRequest (api)定義
  - 場所: `packages/contracts/src/api/dto/project-master/create-project-master-request.ts`
  - フィールド: projectCode, projectName, projectShortName?, projectKanaName?, departmentCode?, responsibleEmployeeCode?, responsibleEmployeeName?, plannedPeriodFrom (ISO 8601 string), plannedPeriodTo (ISO 8601 string), actualPeriodFrom? (ISO 8601 string), actualPeriodTo? (ISO 8601 string), budgetAmount (decimal string)
  - 注意: 日付と金額はwire-format（ISO 8601 string、decimal string）
  - _Requirements: FR-LIST-03_

- [ ] 4.2.6 UpdateProjectMasterRequest (api)定義
  - 場所: `packages/contracts/src/api/dto/project-master/update-project-master-request.ts`
  - フィールド: ifMatchVersion (必須), projectName?, projectShortName?, projectKanaName?, departmentCode?, responsibleEmployeeCode?, responsibleEmployeeName?, plannedPeriodFrom? (ISO 8601 string), plannedPeriodTo? (ISO 8601 string), actualPeriodFrom? (ISO 8601 string), actualPeriodTo? (ISO 8601 string), budgetAmount? (decimal string)
  - 注意: projectCodeは含めない（Requirement 4）、ifMatchVersionは必須（楽観ロック）、日付と金額はwire-format
  - _Requirements: FR-LIST-04_

### 4.3 BFF Contracts（UI ↔ BFF）

- [ ] 4.3.1 ListProjectMasterRequest定義
  - 場所: `packages/contracts/src/bff/dto/project-master/list-project-master-request.ts`
  - フィールド: page?, pageSize?, sortBy?, sortOrder?, projectCode?, projectName?, projectShortName?, departmentCode?, responsibleEmployeeCode?, includeInactive?
  - _Requirements: FR-LIST-01, FR-LIST-10_

- [ ] 4.3.2 ListProjectMasterResponse定義
  - 場所: `packages/contracts/src/bff/dto/project-master/list-project-master-response.ts`
  - フィールド: items, page, pageSize, totalCount
  - _Requirements: FR-LIST-01_

- [ ] 4.3.3 ProjectMasterListItem定義
  - 場所: `packages/contracts/src/bff/dto/project-master/project-master-list-item.ts`
  - フィールド: id, projectCode, projectName, projectShortName?, projectKanaName?, departmentCode?, responsibleEmployeeCode?, responsibleEmployeeName?, plannedPeriodFrom (ISO 8601 string), plannedPeriodTo (ISO 8601 string), budgetAmount (decimal string), isActive
  - 注意: 日付と金額はwire-format（ISO 8601 string、decimal string）
  - _Requirements: FR-LIST-01_

- [ ] 4.3.4 ProjectMasterDetailResponse定義
  - 場所: `packages/contracts/src/bff/dto/project-master/project-master-detail-response.ts`
  - フィールド: id, projectCode, projectName, projectShortName?, projectKanaName?, departmentCode?, responsibleEmployeeCode?, responsibleEmployeeName?, plannedPeriodFrom (ISO 8601 string), plannedPeriodTo (ISO 8601 string), actualPeriodFrom? (ISO 8601 string), actualPeriodTo? (ISO 8601 string), budgetAmount (decimal string), version, isActive, createdAt (ISO 8601 string), updatedAt (ISO 8601 string), createdBy, updatedBy
  - 注意: version含む（楽観ロック用）、日付と金額はwire-format
  - _Requirements: FR-LIST-02_

- [ ] 4.3.5 CreateProjectMasterRequest定義
  - 場所: `packages/contracts/src/bff/dto/project-master/create-project-master-request.ts`
  - フィールド: projectCode, projectName, projectShortName?, projectKanaName?, departmentCode?, responsibleEmployeeCode?, responsibleEmployeeName?, plannedPeriodFrom (ISO 8601 string), plannedPeriodTo (ISO 8601 string), actualPeriodFrom? (ISO 8601 string), actualPeriodTo? (ISO 8601 string), budgetAmount (decimal string)
  - 注意: 日付と金額はwire-format（ISO 8601 string、decimal string）
  - _Requirements: FR-LIST-03_

- [ ] 4.3.6 UpdateProjectMasterRequest定義
  - 場所: `packages/contracts/src/bff/dto/project-master/update-project-master-request.ts`
  - フィールド: ifMatchVersion (必須), projectName?, projectShortName?, projectKanaName?, departmentCode?, responsibleEmployeeCode?, responsibleEmployeeName?, plannedPeriodFrom? (ISO 8601 string), plannedPeriodTo? (ISO 8601 string), actualPeriodFrom? (ISO 8601 string), actualPeriodTo? (ISO 8601 string), budgetAmount? (decimal string)
  - 注意: projectCodeは含めない（Requirement 4）、ifMatchVersionは必須（楽観ロック）、日付と金額はwire-format
  - _Requirements: FR-LIST-04_

- [ ] 4.3.7 Contracts export更新
  - `packages/contracts/src/shared/index.ts` に共通Enumをexport追加（共通利用が必要な場合のみ）
  - `packages/contracts/src/api/index.ts` にAPI DTO/Errorをexport追加
  - `packages/contracts/src/bff/index.ts` にBFF DTOをexport追加
  - _Requirements: FR-LIST-12_

---

## 5. DB / Migration / RLS

- [ ] 5.1 Prisma Schema定義
  - 場所: `packages/db/prisma/schema.prisma`
  - Projectモデル定義:
    - id (String, @id, @default(uuid()))
    - tenant_id (String)
    - project_code (String)
    - project_name (String)
    - project_short_name (String?, nullable)
    - project_kana_name (String?, nullable)
    - department_code (String?, nullable)
    - responsible_employee_code (String?, nullable)
    - responsible_employee_name (String?, nullable)
    - planned_period_from (DateTime)
    - planned_period_to (DateTime)
    - actual_period_from (DateTime?, nullable)
    - actual_period_to (DateTime?, nullable)
    - budget_amount (Decimal, @db.Decimal(19, 2))
    - version (Int, @default(0)) - 楽観ロック用
    - is_active (Boolean, @default(true))
    - created_at (DateTime, @default(now()))
    - updated_at (DateTime, @updatedAt)
    - created_by (String)
    - updated_by (String)
    - @@unique([tenant_id, project_code])
    - @@index([tenant_id, is_active])
    - @@index([tenant_id, project_code])
    - @@index([tenant_id, planned_period_from])
  - _Requirements: FR-LIST-08_

- [ ] 5.2 Migration作成
  - 実行: `npx prisma migrate dev --name add_project_master`
  - 確認: migrationファイルが生成されている
  - _Requirements: FR-LIST-08_

- [ ] 5.3 RLS Policy実装
  - 場所: `packages/db/prisma/migrations/xxx_add_project_master/RLS.sql`（または別途RLS管理ファイル）
  - 内容: `tenant_id = current_setting('app.tenant_id')` を強制
  - RLS有効化: `ALTER TABLE project ENABLE ROW LEVEL SECURITY;`
  - _Requirements: FR-LIST-08_

- [ ] 5.4 Prisma Client生成
  - 実行: `npx prisma generate`
  - 確認: Prisma Clientが更新されている
  - _Requirements: FR-LIST-08_

---

## 6. Domain API（apps/api）

### 6.1 Repository実装

- [ ] 6.1.1 ProjectMasterRepository作成
  - 場所: `apps/api/src/modules/master-data/project-master/project-master.repository.ts`
  - メソッド:
    - `findMany(tenantId, params)`: 一覧検索（offset, limit, sortBy, sortOrder, filters）
    - `findById(tenantId, id)`: ID検索
    - `findByProjectCode(tenantId, projectCode)`: プロジェクトコード検索
    - `create(tenantId, data)`: 作成
    - `update(tenantId, id, data)`: 更新
    - `updateStatus(tenantId, id, isActive)`: 状態更新
  - 実装要件:
    - すべてのメソッドでtenant_idを必須パラメータとして受け取る
    - すべてのクエリでwhere句に `tenant_id = ?` を追加（二重ガード）
    - sortByマッピング: DTOキー（camelCase）→ DB列名（snake_case）
      - `projectCode` → `project_code`
      - `projectName` → `project_name`
      - `projectShortName` → `project_short_name`
      - `plannedPeriodFrom` → `planned_period_from`
      - `budgetAmount` → `budget_amount`
      - 未許可のsortByは422エラー
    - 検索条件の一致仕様:
      - `projectCode`: 完全一致（=）
      - `projectName` / `projectShortName` / `projectKanaName`: 部分一致（ILIKE '%...%'）
      - normalize: trimのみ（全半角・カナ揺れ対応はMVP外）
    - 楽観ロック: 更新時にversionをチェックし、一致しない場合は409エラー
    - 更新時にversionをインクリメント
  - _Requirements: FR-LIST-08_

### 6.2 Service実装

- [ ] 6.2.1 ProjectMasterService作成
  - 場所: `apps/api/src/modules/master-data/project-master/project-master.service.ts`
  - メソッド:
    - `list(tenantId, params)`: 一覧検索（権限チェック: epm.project-master.read）
    - `findById(tenantId, id)`: 詳細取得（権限チェック: epm.project-master.read）
    - `create(tenantId, userId, dto)`: 作成（権限チェック: epm.project-master.create）
    - `update(tenantId, userId, id, dto)`: 更新（権限チェック: epm.project-master.update）
    - `deactivate(tenantId, userId, id)`: 無効化（権限チェック: epm.project-master.update）
    - `reactivate(tenantId, userId, id)`: 再有効化（権限チェック: epm.project-master.update）
  - ビジネスルール実装:
    - projectCode変更不可チェック（更新時にprojectCodeが含まれている場合は422エラー）
    - projectCode一意性チェック（作成時・更新時に重複チェック、409エラー）
    - 日付範囲バリデーション:
      - プロジェクト予定期間From <= プロジェクト予定期間To（422エラー）
      - プロジェクト実績Fromが指定されている場合、プロジェクト実績Toも必須（422エラー）
      - プロジェクト実績From <= プロジェクト実績To（422エラー）
    - 予算金額精度保証（DECIMAL型での保存）
    - 有効/無効状態管理（無効化済みを再度無効化しようとした場合は409エラー、有効状態を再有効化しようとした場合は409エラー）
    - 楽観ロック（ifMatchVersionが現行versionと一致しない場合は409エラー（STALE_UPDATE））
    - テナント境界チェック（他テナントのデータへのアクセスは404エラー）
    - wire-format（ISO 8601 string、decimal string）からDomain内部型（Date、Decimal）へのparse
  - 監査ログ記録:
    - create: tenant_id, user_id, 操作種別（create）, 対象プロジェクトID, 作成日時
    - update: tenant_id, user_id, 操作種別（update）, 対象プロジェクトID, 変更前後の値（主要項目）, 更新日時
    - deactivate: tenant_id, user_id, 操作種別（deactivate）, 対象プロジェクトID, 無効化日時
    - reactivate: tenant_id, user_id, 操作種別（reactivate）, 対象プロジェクトID, 再有効化日時
  - _Requirements: FR-LIST-03, FR-LIST-04, FR-LIST-05, FR-LIST-06, FR-LIST-07, FR-LIST-08, FR-LIST-09_

### 6.3 Controller実装

- [ ] 6.3.1 ProjectMasterController作成
  - 場所: `apps/api/src/modules/master-data/project-master/project-master.controller.ts`
  - エンドポイント:
    - `GET /api/master-data/project-master`: 一覧検索
    - `GET /api/master-data/project-master/:id`: 詳細取得
    - `POST /api/master-data/project-master`: 作成
    - `PATCH /api/master-data/project-master/:id`: 更新
    - `POST /api/master-data/project-master/:id/deactivate`: 無効化
    - `POST /api/master-data/project-master/:id/reactivate`: 再有効化
  - 実装要件:
    - contracts/api DTOを使用
    - tenant_id/user_idを認証情報から解決
    - エラーハンドリング（packages/contracts/src/api/errorsを使用）
  - _Requirements: FR-LIST-01, FR-LIST-02, FR-LIST-03, FR-LIST-04, FR-LIST-05, FR-LIST-06_

### 6.4 Module登録

- [ ] 6.4.1 ProjectMasterModule作成・登録
  - 場所: `apps/api/src/modules/master-data/project-master/project-master.module.ts`
  - Provider: ProjectMasterService, ProjectMasterRepository
  - Controller: ProjectMasterController
  - 依存関係の注入設定
  - _Requirements: FR-LIST-12_

---

## 7. BFF（apps/bff）

### 7.1 Mapper実装

- [ ] 7.1.1 ProjectMasterMapper作成
  - 場所: `apps/bff/src/modules/master-data/project-master/mappers/project-master.mapper.ts`
  - メソッド:
    - `toBffListResponse(apiResponse, page, pageSize)`: API DTO → BFF DTO変換
    - `toBffDetailResponse(apiEntity)`: API DTO → BFF DTO変換
    - `toApiListRequest(bffRequest)`: BFF DTO → API DTO変換（page/pageSize → offset/limit、sortBy正規化）
  - 実装要件:
    - page/pageSize → offset/limit変換: offset=(page-1)*pageSize, limit=pageSize
    - sortByはDTOキー（camelCase）のままDomain APIへ渡す
    - BFFレスポンスにpage/pageSize/totalCountを含める
    - wire-format（ISO 8601 string、decimal string）はそのまま伝達（型変換不要）
  - _Requirements: FR-LIST-10_

### 7.2 Service実装

- [ ] 7.2.1 ProjectMasterBffService作成
  - 場所: `apps/bff/src/modules/master-data/project-master/project-master-bff.service.ts`
  - メソッド:
    - `list(tenantId, userId, request)`: 一覧検索
    - `findById(tenantId, userId, id)`: 詳細取得
    - `create(tenantId, userId, request)`: 作成
    - `update(tenantId, userId, id, request)`: 更新
    - `deactivate(tenantId, userId, id)`: 無効化
    - `reactivate(tenantId, userId, id)`: 再有効化
  - 実装要件:
    - Domain API呼び出し（HTTP client経由）
    - ページング/ソート正規化（Mapper経由）
    - エラーのPass-through（意味的な変更禁止）
    - tenant_id/user_idをDomain APIへ伝搬
  - _Requirements: FR-LIST-10, FR-LIST-11_

### 7.3 Controller実装

- [ ] 7.3.1 ProjectMasterBffController作成
  - 場所: `apps/bff/src/modules/master-data/project-master/project-master-bff.controller.ts`
  - エンドポイント:
    - `GET /api/bff/master-data/project-master`: 一覧検索
    - `GET /api/bff/master-data/project-master/:id`: 詳細取得
    - `POST /api/bff/master-data/project-master`: 作成
    - `PATCH /api/bff/master-data/project-master/:id`: 更新
    - `POST /api/bff/master-data/project-master/:id/deactivate`: 無効化
    - `POST /api/bff/master-data/project-master/:id/reactivate`: 再有効化
  - 実装要件:
    - contracts/bff DTOを使用
    - 認証情報からtenant_id/user_idを解決
    - ページング/ソートのデフォルト値設定（page=1, pageSize=50, sortBy=projectCode, sortOrder=asc）
    - pageSize clamp（max=200）
    - sortBy whitelist（projectCode, projectName, projectShortName, plannedPeriodFrom, budgetAmount）
    - keyword trim、空→undefined
    - エラーのPass-through
  - _Requirements: FR-LIST-01, FR-LIST-02, FR-LIST-03, FR-LIST-04, FR-LIST-05, FR-LIST-06, FR-LIST-10, FR-LIST-11_

### 7.4 Module登録

- [ ] 7.4.1 ProjectMasterBffModule作成・登録
  - 場所: `apps/bff/src/modules/master-data/project-master/project-master-bff.module.ts`
  - Provider: ProjectMasterBffService, ProjectMasterMapper
  - Controller: ProjectMasterBffController
  - HTTP client設定（Domain API呼び出し用）
  - _Requirements: FR-LIST-12_

---

## 8. UI（apps/web）

### 8.1 API Adapter実装

- [ ] 8.1.1 BffClient型定義
  - 場所: `apps/web/src/features/master-data/project-master/api/BffClient.ts`
  - メソッド定義:
    - `list(request): Promise<ListProjectMasterResponse>`
    - `findById(id): Promise<ProjectMasterDetailResponse>`
    - `create(request): Promise<ProjectMasterDetailResponse>`
    - `update(id, request): Promise<ProjectMasterDetailResponse>`
    - `deactivate(id): Promise<ProjectMasterDetailResponse>`
    - `reactivate(id): Promise<ProjectMasterDetailResponse>`
  - contracts/bff DTOを使用
  - _Requirements: FR-LIST-12_

- [ ] 8.1.2 MockBffClient実装
  - 場所: `apps/web/src/features/master-data/project-master/api/MockBffClient.ts`
  - モックデータで動作確認用
  - BffClientインターフェースを実装
  - _Requirements: FR-LIST-12_

- [ ] 8.1.3 HttpBffClient実装
  - 場所: `apps/web/src/features/master-data/project-master/api/HttpBffClient.ts`
  - 実BFF呼び出し実装
  - fetch使用はここに限定
  - BffClientインターフェースを実装
  - _Requirements: FR-LIST-12_

### 8.2 Hooks実装（Server State）

- [ ] 8.2.1 useProjectMasterList作成
  - 場所: `apps/web/src/features/master-data/project-master/hooks/use-project-master-list.ts`
  - TanStack Query使用
  - ページング/ソート/検索対応
  - _Requirements: FR-LIST-01_

- [ ] 8.2.2 useProjectMasterDetail作成
  - 場所: `apps/web/src/features/master-data/project-master/hooks/use-project-master-detail.ts`
  - TanStack Query使用
  - _Requirements: FR-LIST-02_

- [ ] 8.2.3 useProjectMasterCreate作成
  - 場所: `apps/web/src/features/master-data/project-master/hooks/use-project-master-create.ts`
  - TanStack Query Mutation使用
  - _Requirements: FR-LIST-03_

- [ ] 8.2.4 useProjectMasterUpdate作成
  - 場所: `apps/web/src/features/master-data/project-master/hooks/use-project-master-update.ts`
  - TanStack Query Mutation使用
  - ifMatchVersionを含める（楽観ロック対応）
  - _Requirements: FR-LIST-04_

- [ ] 8.2.5 useProjectMasterDeactivate作成
  - 場所: `apps/web/src/features/master-data/project-master/hooks/use-project-master-deactivate.ts`
  - TanStack Query Mutation使用
  - _Requirements: FR-LIST-05_

- [ ] 8.2.6 useProjectMasterReactivate作成
  - 場所: `apps/web/src/features/master-data/project-master/hooks/use-project-master-reactivate.ts`
  - TanStack Query Mutation使用
  - _Requirements: FR-LIST-06_

### 8.3 Validators実装

- [ ] 8.3.1 CreateProjectMasterValidator作成
  - 場所: `apps/web/src/features/master-data/project-master/validators/create-project-master-validator.ts`
  - Zodスキーマ定義
  - projectCode, projectName, plannedPeriodFrom, plannedPeriodTo, budgetAmount必須
  - 日付範囲バリデーション（plannedPeriodFrom <= plannedPeriodTo）
  - actualPeriodFrom指定時はactualPeriodToも必須
  - actualPeriodFrom <= actualPeriodTo
  - _Requirements: FR-LIST-03_

- [ ] 8.3.2 UpdateProjectMasterValidator作成
  - 場所: `apps/web/src/features/master-data/project-master/validators/update-project-master-validator.ts`
  - Zodスキーマ定義
  - ifMatchVersion必須（楽観ロック）
  - projectName, plannedPeriodFrom, plannedPeriodTo, budgetAmount等はoptional
  - projectCodeは含めない
  - 日付範囲バリデーション
  - _Requirements: FR-LIST-04_

### 8.4 UI実装（Phase 1: v0統制テスト）

- [ ] 8.4.1 v0 UI生成
  - 場所: `apps/web/_v0_drop/master-data/project-master/src/`
  - v0でUI生成（一覧、詳細、作成、更新画面）
  - MockBffClientで動作確認
  - 見た目完成は目的外（境界/契約/Design System準拠の検証が目的）
  - 楽観ロック対応（version表示、ifMatchVersion送信）
  - 日付入力（ISO 8601形式）
  - 金額入力（decimal string形式）
  - _Requirements: FR-LIST-01, FR-LIST-02, FR-LIST-03, FR-LIST-04_

- [ ] 8.4.2 Structure Guard実行
  - 実行: `npx tsx scripts/structure-guards.ts`
  - 確認:
    - UIはBFFのみを呼び出している
    - `packages/contracts/src/api` をUIが参照していない
    - UIは `packages/contracts/src/bff` のみ参照している
    - 直接fetch()が存在しない（HttpBffClient例外のみ）
  - _Requirements: FR-LIST-12_

### 8.5 UI実装（Phase 2: 本実装）

- [ ] 8.5.1 v0生成物の移植
  - `apps/web/_v0_drop/master-data/project-master/src` → `apps/web/src/features/master-data/project-master/ui`
  - HttpBffClient実装・実BFF接続
  - URL state / debounce / E2E等を追加
  - _Requirements: FR-LIST-01, FR-LIST-02, FR-LIST-03, FR-LIST-04_

- [ ] 8.5.2 一覧画面実装
  - 場所: `apps/web/src/features/master-data/project-master/ui/project-master-list.tsx`
  - ページング/ソート/検索UI
  - 無効化プロジェクトを含むオプション
  - _Requirements: FR-LIST-01_

- [ ] 8.5.3 詳細画面実装
  - 場所: `apps/web/src/features/master-data/project-master/ui/project-master-detail.tsx`
  - プロジェクト詳細情報表示
  - version表示（楽観ロック用）
  - _Requirements: FR-LIST-02_

- [ ] 8.5.4 作成画面実装
  - 場所: `apps/web/src/features/master-data/project-master/ui/project-master-create.tsx`
  - React Hook Form + Zod使用
  - 日付入力（ISO 8601形式）
  - 金額入力（decimal string形式）
  - _Requirements: FR-LIST-03_

- [ ] 8.5.5 更新画面実装
  - 場所: `apps/web/src/features/master-data/project-master/ui/project-master-update.tsx`
  - React Hook Form + Zod使用
  - projectCodeは表示のみ（編集不可）
  - version表示とifMatchVersion送信（楽観ロック対応）
  - 楽観ロック競合時のエラー表示
  - 日付入力（ISO 8601形式）
  - 金額入力（decimal string形式）
  - _Requirements: FR-LIST-04_

- [ ] 8.5.6 無効化/再有効化機能実装
  - 一覧画面または詳細画面に無効化/再有効化ボタンを追加
  - 確認ダイアログ表示
  - _Requirements: FR-LIST-05, FR-LIST-06_

- [ ] 8.5.7 権限チェック実装
  - UI制御とAPI制御を一致させる
  - 権限がない場合はボタン非表示等
  - _Requirements: FR-LIST-07_

- [ ] 8.5.8 ルーティング設定
  - 場所: `apps/web/src/app/master-data/project-master/`
  - Next.js App Router設定
  - _Requirements: FR-LIST-01, FR-LIST-02, FR-LIST-03, FR-LIST-04_

- [ ] 8.5.9 Navigation登録
  - 場所: `apps/web/src/shared/navigation/menu.ts`
  - プロジェクトマスタメニュー項目を追加
  - 権限チェック（epm.project-master.read）
  - _Requirements: FR-LIST-07_

---

## 9. Testing & Validation

- [ ] 9.1 Unit Tests（Domain API）
  - ProjectMasterServiceテスト
  - ProjectMasterRepositoryテスト
  - ビジネスルールテスト（projectCode変更不可、一意性チェック、日付範囲バリデーション、楽観ロック等）
  - _Requirements: FR-LIST-03, FR-LIST-04_

- [ ] 9.2 Integration Tests（BFF）
  - ProjectMasterBffServiceテスト
  - ページング/ソート正規化テスト
  - エラーPass-throughテスト
  - _Requirements: FR-LIST-10, FR-LIST-11_

- [ ] 9.3 E2E Tests（UI）
  - 一覧検索/詳細表示/作成/更新/無効化/再有効化のE2Eテスト
  - 権限チェックテスト
  - 楽観ロック競合テスト
  - _Requirements: FR-LIST-01, FR-LIST-02, FR-LIST-03, FR-LIST-04, FR-LIST-05, FR-LIST-06, FR-LIST-07_

---

## 10. Documentation & Cleanup

- [ ] 10.1 API Documentation更新
  - BFFエンドポイントのドキュメント
  - Domain APIエンドポイントのドキュメント
  - _Requirements: FR-LIST-12_

- [ ] 10.2 v0_dropクリーンアップ
  - v0生成物の不要ファイル削除
  - _Requirements: FR-LIST-12_

---
