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
  - 実行: `npx tsx scripts/scaffold-feature.ts master-data employee-master`
  - 目的: 正しい配置先を先に確定させる（v0混入防止）
  - 確認:
    - `apps/web/src/features/master-data/employee-master` が作成されている
    - `apps/bff/src/modules/master-data/employee-master` が作成されている
    - `apps/api/src/modules/master-data/employee-master` が作成されている
    - `apps/web/_v0_drop/master-data/employee-master` が作成されている

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
  - employeeCode変更不可（D-01）: 更新リクエストにemployeeCodeが含まれている場合は422エラー
  - ページング仕様（D-02）: page/pageSize（default: page=1, pageSize=50, max=200）
  - デフォルトソート（D-03）: employeeCode asc
  - organizationKey（D-04）: nullable、MVPではFK制約なし
  - 再有効化（OQ-04）: MVPに含める
  - Error Policy: Pass-through（Requirement 11）
  - _Requirements: FR-LIST-04, FR-LIST-10, FR-LIST-11_

---

## 4. Contracts（shared（共通のみ最小） → api → bff）

### 4.1 Shared Contracts（共通利用のみ最小限）

- [ ] 4.1.1 EmployeeMasterSortBy Enum定義（api/bffで共通利用が必要な場合のみ）
  - 場所: `packages/contracts/src/shared/enums/employee-master-sort-by.ts`（共通利用が必要な場合）
  - または: `packages/contracts/src/api/enums/employee-master-sort-by.ts` と `packages/contracts/src/bff/enums/employee-master-sort-by.ts` にそれぞれ配置（共通利用が不要な場合）
  - 定義: `EMPLOYEE_CODE = 'employeeCode'`, `EMPLOYEE_NAME = 'employeeName'`
  - 注意: api/bffで共通利用が必要な場合のみsharedに配置、そうでなければapi/bffにそれぞれ配置
  - _Requirements: FR-LIST-10_

### 4.2 API Contracts（BFF ↔ Domain API）

- [ ] 4.2.1 EmployeeMasterError定義（Domain API正本）
  - 場所: `packages/contracts/src/api/errors/employee-master-error.ts`
  - 定義:
    - `EMPLOYEE_NOT_FOUND` (404)
    - `EMPLOYEE_CODE_DUPLICATE` (409)
    - `EMPLOYEE_CODE_CANNOT_BE_CHANGED` (422)
    - `EMPLOYEE_ALREADY_INACTIVE` (409)
    - `EMPLOYEE_ALREADY_ACTIVE` (409)
    - `VALIDATION_ERROR` (422)
  - 注意: Domain API正本としてapi/errorsに配置。UI表示用が必要な場合はbff側で型を持つ
  - _Requirements: FR-LIST-11_

- [ ] 4.2.2 ListEmployeeMasterRequest (api)定義
  - 場所: `packages/contracts/src/api/dto/employee-master/list-employee-master-request.ts`
  - フィールド: offset, limit, sortBy ('employeeCode' | 'employeeName'), sortOrder, employeeCode?, employeeName?, includeInactive?
  - 注意: sortByはDTOキー（camelCase）を採用
  - _Requirements: FR-LIST-01, FR-LIST-10_

- [ ] 4.2.3 ListEmployeeMasterResponse (api)定義
  - 場所: `packages/contracts/src/api/dto/employee-master/list-employee-master-response.ts`
  - フィールド: items, totalCount
  - _Requirements: FR-LIST-01_

- [ ] 4.2.4 EmployeeMasterEntity定義
  - 場所: `packages/contracts/src/api/dto/employee-master/employee-master-entity.ts`
  - フィールド: id, tenantId, employeeCode, employeeName, organizationKey?, isActive, createdAt, updatedAt, createdBy, updatedBy
  - 注意: すべてcamelCaseで統一
  - _Requirements: FR-LIST-02_

- [ ] 4.2.5 CreateEmployeeMasterRequest (api)定義
  - 場所: `packages/contracts/src/api/dto/employee-master/create-employee-master-request.ts`
  - フィールド: employeeCode, employeeName, organizationKey?
  - _Requirements: FR-LIST-03_

- [ ] 4.2.6 UpdateEmployeeMasterRequest (api)定義
  - 場所: `packages/contracts/src/api/dto/employee-master/update-employee-master-request.ts`
  - フィールド: employeeName?, organizationKey?
  - 注意: employeeCodeは含めない（Requirement 4）
  - _Requirements: FR-LIST-04_

### 4.3 BFF Contracts（UI ↔ BFF）

- [ ] 4.3.1 ListEmployeeMasterRequest定義
  - 場所: `packages/contracts/src/bff/dto/employee-master/list-employee-master-request.ts`
  - フィールド: page?, pageSize?, sortBy?, sortOrder?, employeeCode?, employeeName?, includeInactive?
  - _Requirements: FR-LIST-01, FR-LIST-10_

- [ ] 4.3.2 ListEmployeeMasterResponse定義
  - 場所: `packages/contracts/src/bff/dto/employee-master/list-employee-master-response.ts`
  - フィールド: items, page, pageSize, totalCount
  - _Requirements: FR-LIST-01_

- [ ] 4.3.3 EmployeeMasterListItem定義
  - 場所: `packages/contracts/src/bff/dto/employee-master/employee-master-list-item.ts`
  - フィールド: id, employeeCode, employeeName, organizationKey?, isActive
  - _Requirements: FR-LIST-01_

- [ ] 4.3.4 EmployeeMasterDetailResponse定義
  - 場所: `packages/contracts/src/bff/dto/employee-master/employee-master-detail-response.ts`
  - フィールド: id, employeeCode, employeeName, organizationKey?, isActive, createdAt, updatedAt, createdBy, updatedBy
  - _Requirements: FR-LIST-02_

- [ ] 4.3.5 CreateEmployeeMasterRequest定義
  - 場所: `packages/contracts/src/bff/dto/employee-master/create-employee-master-request.ts`
  - フィールド: employeeCode, employeeName, organizationKey?
  - _Requirements: FR-LIST-03_

- [ ] 4.3.6 UpdateEmployeeMasterRequest定義
  - 場所: `packages/contracts/src/bff/dto/employee-master/update-employee-master-request.ts`
  - フィールド: employeeName?, organizationKey?
  - 注意: employeeCodeは含めない（Requirement 4）
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
  - Employeeモデル定義:
    - id (String, @id, @default(uuid()))
    - tenant_id (String)
    - employee_code (String)
    - employee_name (String)
    - organization_key (String?, nullable)
    - is_active (Boolean, @default(true))
    - created_at (DateTime, @default(now()))
    - updated_at (DateTime, @updatedAt)
    - created_by (String)
    - updated_by (String)
    - @@unique([tenant_id, employee_code])
    - @@index([tenant_id, is_active])
    - @@index([tenant_id, employee_code])
  - _Requirements: FR-LIST-08_

- [ ] 5.2 Migration作成
  - 実行: `npx prisma migrate dev --name add_employee_master`
  - 確認: migrationファイルが生成されている
  - _Requirements: FR-LIST-08_

- [ ] 5.3 RLS Policy実装
  - 場所: `packages/db/prisma/migrations/xxx_add_employee_master/RLS.sql`（または別途RLS管理ファイル）
  - 内容: `tenant_id = current_setting('app.tenant_id')` を強制
  - RLS有効化: `ALTER TABLE employee ENABLE ROW LEVEL SECURITY;`
  - _Requirements: FR-LIST-08_

- [ ] 5.4 Prisma Client生成
  - 実行: `npx prisma generate`
  - 確認: Prisma Clientが更新されている
  - _Requirements: FR-LIST-08_

---

## 6. Domain API（apps/api）

### 6.1 Repository実装

- [ ] 6.1.1 EmployeeRepository作成
  - 場所: `apps/api/src/modules/master-data/employee-master/employee-master.repository.ts`
  - メソッド:
    - `findMany(tenantId, params)`: 一覧検索（offset, limit, sortBy, sortOrder, filters）
    - `findById(tenantId, id)`: ID検索
    - `findByEmployeeCode(tenantId, employeeCode)`: 社員コード検索
    - `create(tenantId, data)`: 作成
    - `update(tenantId, id, data)`: 更新
    - `updateStatus(tenantId, id, isActive)`: 状態更新
  - 実装要件:
    - すべてのメソッドでtenant_idを必須パラメータとして受け取る
    - すべてのクエリでwhere句に `tenant_id = ?` を追加（二重ガード）
    - sortByマッピング: DTOキー（camelCase）→ DB列名（snake_case）
      - `employeeCode` → `employee_code`
      - `employeeName` → `employee_name`
      - 未許可のsortByは422エラー
  - _Requirements: FR-LIST-08_

### 6.2 Service実装

- [ ] 6.2.1 EmployeeMasterService作成
  - 場所: `apps/api/src/modules/master-data/employee-master/employee-master.service.ts`
  - メソッド:
    - `list(tenantId, params)`: 一覧検索（権限チェック: epm.employee-master.read）
    - `findById(tenantId, id)`: 詳細取得（権限チェック: epm.employee-master.read）
    - `create(tenantId, userId, dto)`: 作成（権限チェック: epm.employee-master.create）
    - `update(tenantId, userId, id, dto)`: 更新（権限チェック: epm.employee-master.update）
    - `deactivate(tenantId, userId, id)`: 無効化（権限チェック: epm.employee-master.update）
    - `reactivate(tenantId, userId, id)`: 再有効化（権限チェック: epm.employee-master.update）
  - ビジネスルール実装:
    - employeeCode変更不可チェック（更新時にemployeeCodeが含まれている場合は422エラー）
    - employeeCode一意性チェック（作成時・更新時に重複チェック、409エラー）
    - 有効/無効状態管理（無効化済みを再度無効化しようとした場合は409エラー、有効状態を再有効化しようとした場合は409エラー）
    - テナント境界チェック（他テナントのデータへのアクセスは404エラー）
  - 監査ログ記録:
    - create: tenant_id, user_id, 操作種別（create）, 対象社員ID, 作成日時
    - update: tenant_id, user_id, 操作種別（update）, 対象社員ID, 変更前後の値, 更新日時
    - deactivate: tenant_id, user_id, 操作種別（deactivate）, 対象社員ID, 無効化日時
    - reactivate: tenant_id, user_id, 操作種別（reactivate）, 対象社員ID, 再有効化日時
  - _Requirements: FR-LIST-03, FR-LIST-04, FR-LIST-05, FR-LIST-06, FR-LIST-07, FR-LIST-08, FR-LIST-09_

### 6.3 Controller実装

- [ ] 6.3.1 EmployeeMasterController作成
  - 場所: `apps/api/src/modules/master-data/employee-master/employee-master.controller.ts`
  - エンドポイント:
    - `GET /api/master-data/employee-master`: 一覧検索
    - `GET /api/master-data/employee-master/:id`: 詳細取得
    - `POST /api/master-data/employee-master`: 作成
    - `PATCH /api/master-data/employee-master/:id`: 更新
    - `POST /api/master-data/employee-master/:id/deactivate`: 無効化
    - `POST /api/master-data/employee-master/:id/reactivate`: 再有効化
  - 実装要件:
    - contracts/api DTOを使用
    - tenant_id/user_idを認証情報から解決
    - エラーハンドリング（packages/contracts/src/api/errorsを使用）
  - _Requirements: FR-LIST-01, FR-LIST-02, FR-LIST-03, FR-LIST-04, FR-LIST-05, FR-LIST-06_

### 6.4 Module登録

- [ ] 6.4.1 EmployeeMasterModule作成・登録
  - 場所: `apps/api/src/modules/master-data/employee-master/employee-master.module.ts`
  - Provider: EmployeeMasterService, EmployeeMasterRepository
  - Controller: EmployeeMasterController
  - 依存関係の注入設定
  - _Requirements: FR-LIST-12_

---

## 7. BFF（apps/bff）

### 7.1 Mapper実装

- [ ] 7.1.1 EmployeeMasterMapper作成
  - 場所: `apps/bff/src/modules/master-data/employee-master/mappers/employee-master.mapper.ts`
  - メソッド:
    - `toBffListResponse(apiResponse, page, pageSize)`: API DTO → BFF DTO変換
    - `toBffDetailResponse(apiEntity)`: API DTO → BFF DTO変換
    - `toApiListRequest(bffRequest)`: BFF DTO → API DTO変換（page/pageSize → offset/limit、sortBy正規化）
  - 実装要件:
    - page/pageSize → offset/limit変換: offset=(page-1)*pageSize, limit=pageSize
    - sortByはDTOキー（camelCase）のままDomain APIへ渡す
    - BFFレスポンスにpage/pageSize/totalCountを含める
  - _Requirements: FR-LIST-10_

### 7.2 Service実装

- [ ] 7.2.1 EmployeeMasterBffService作成
  - 場所: `apps/bff/src/modules/master-data/employee-master/employee-master-bff.service.ts`
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

- [ ] 7.3.1 EmployeeMasterBffController作成
  - 場所: `apps/bff/src/modules/master-data/employee-master/employee-master-bff.controller.ts`
  - エンドポイント:
    - `GET /api/bff/master-data/employee-master`: 一覧検索
    - `GET /api/bff/master-data/employee-master/:id`: 詳細取得
    - `POST /api/bff/master-data/employee-master`: 作成
    - `PATCH /api/bff/master-data/employee-master/:id`: 更新
    - `POST /api/bff/master-data/employee-master/:id/deactivate`: 無効化
    - `POST /api/bff/master-data/employee-master/:id/reactivate`: 再有効化
  - 実装要件:
    - contracts/bff DTOを使用
    - 認証情報からtenant_id/user_idを解決
    - ページング/ソートのデフォルト値設定（page=1, pageSize=50, sortBy=employeeCode, sortOrder=asc）
    - pageSize clamp（max=200）
    - sortBy whitelist（employeeCode, employeeName）
    - keyword trim、空→undefined
    - エラーのPass-through
  - _Requirements: FR-LIST-01, FR-LIST-02, FR-LIST-03, FR-LIST-04, FR-LIST-05, FR-LIST-06, FR-LIST-10, FR-LIST-11_

### 7.4 Module登録

- [ ] 7.4.1 EmployeeMasterBffModule作成・登録
  - 場所: `apps/bff/src/modules/master-data/employee-master/employee-master-bff.module.ts`
  - Provider: EmployeeMasterBffService, EmployeeMasterMapper
  - Controller: EmployeeMasterBffController
  - HTTP client設定（Domain API呼び出し用）
  - _Requirements: FR-LIST-12_

---

## 8. UI（apps/web）

### 8.1 API Adapter実装

- [ ] 8.1.1 BffClient型定義
  - 場所: `apps/web/src/features/master-data/employee-master/api/BffClient.ts`
  - メソッド定義:
    - `list(request): Promise<ListEmployeeMasterResponse>`
    - `findById(id): Promise<EmployeeMasterDetailResponse>`
    - `create(request): Promise<EmployeeMasterDetailResponse>`
    - `update(id, request): Promise<EmployeeMasterDetailResponse>`
    - `deactivate(id): Promise<EmployeeMasterDetailResponse>`
    - `reactivate(id): Promise<EmployeeMasterDetailResponse>`
  - contracts/bff DTOを使用
  - _Requirements: FR-LIST-12_

- [ ] 8.1.2 MockBffClient実装
  - 場所: `apps/web/src/features/master-data/employee-master/api/MockBffClient.ts`
  - モックデータで動作確認用
  - BffClientインターフェースを実装
  - _Requirements: FR-LIST-12_

- [ ] 8.1.3 HttpBffClient実装
  - 場所: `apps/web/src/features/master-data/employee-master/api/HttpBffClient.ts`
  - 実BFF呼び出し実装
  - fetch使用はここに限定
  - BffClientインターフェースを実装
  - _Requirements: FR-LIST-12_

### 8.2 Hooks実装（Server State）

- [ ] 8.2.1 useEmployeeMasterList作成
  - 場所: `apps/web/src/features/master-data/employee-master/hooks/use-employee-master-list.ts`
  - TanStack Query使用
  - ページング/ソート/検索対応
  - _Requirements: FR-LIST-01_

- [ ] 8.2.2 useEmployeeMasterDetail作成
  - 場所: `apps/web/src/features/master-data/employee-master/hooks/use-employee-master-detail.ts`
  - TanStack Query使用
  - _Requirements: FR-LIST-02_

- [ ] 8.2.3 useEmployeeMasterCreate作成
  - 場所: `apps/web/src/features/master-data/employee-master/hooks/use-employee-master-create.ts`
  - TanStack Query Mutation使用
  - _Requirements: FR-LIST-03_

- [ ] 8.2.4 useEmployeeMasterUpdate作成
  - 場所: `apps/web/src/features/master-data/employee-master/hooks/use-employee-master-update.ts`
  - TanStack Query Mutation使用
  - _Requirements: FR-LIST-04_

- [ ] 8.2.5 useEmployeeMasterDeactivate作成
  - 場所: `apps/web/src/features/master-data/employee-master/hooks/use-employee-master-deactivate.ts`
  - TanStack Query Mutation使用
  - _Requirements: FR-LIST-05_

- [ ] 8.2.6 useEmployeeMasterReactivate作成
  - 場所: `apps/web/src/features/master-data/employee-master/hooks/use-employee-master-reactivate.ts`
  - TanStack Query Mutation使用
  - _Requirements: FR-LIST-06_

### 8.3 Validators実装

- [ ] 8.3.1 CreateEmployeeMasterValidator作成
  - 場所: `apps/web/src/features/master-data/employee-master/validators/create-employee-master-validator.ts`
  - Zodスキーマ定義
  - employeeCode, employeeName必須
  - organizationKey optional
  - _Requirements: FR-LIST-03_

- [ ] 8.3.2 UpdateEmployeeMasterValidator作成
  - 場所: `apps/web/src/features/master-data/employee-master/validators/update-employee-master-validator.ts`
  - Zodスキーマ定義
  - employeeName, organizationKey optional
  - employeeCodeは含めない
  - _Requirements: FR-LIST-04_

### 8.4 UI実装（Phase 1: v0統制テスト）

- [ ] 8.4.1 v0 UI生成
  - 場所: `apps/web/_v0_drop/master-data/employee-master/src/`
  - v0でUI生成（一覧、詳細、作成、更新画面）
  - MockBffClientで動作確認
  - 見た目完成は目的外（境界/契約/Design System準拠の検証が目的）
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
  - `apps/web/_v0_drop/master-data/employee-master/src` → `apps/web/src/features/master-data/employee-master/ui`
  - HttpBffClient実装・実BFF接続
  - URL state / debounce / E2E等を追加
  - _Requirements: FR-LIST-01, FR-LIST-02, FR-LIST-03, FR-LIST-04_

- [ ] 8.5.2 一覧画面実装
  - 場所: `apps/web/src/features/master-data/employee-master/ui/employee-master-list.tsx`
  - ページング/ソート/検索UI
  - 無効化社員を含むオプション
  - _Requirements: FR-LIST-01_

- [ ] 8.5.3 詳細画面実装
  - 場所: `apps/web/src/features/master-data/employee-master/ui/employee-master-detail.tsx`
  - 社員詳細情報表示
  - _Requirements: FR-LIST-02_

- [ ] 8.5.4 作成画面実装
  - 場所: `apps/web/src/features/master-data/employee-master/ui/employee-master-create.tsx`
  - React Hook Form + Zod使用
  - _Requirements: FR-LIST-03_

- [ ] 8.5.5 更新画面実装
  - 場所: `apps/web/src/features/master-data/employee-master/ui/employee-master-update.tsx`
  - React Hook Form + Zod使用
  - employeeCodeは表示のみ（編集不可）
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
  - 場所: `apps/web/src/app/master-data/employee-master/`
  - Next.js App Router設定
  - _Requirements: FR-LIST-01, FR-LIST-02, FR-LIST-03, FR-LIST-04_

- [ ] 8.5.9 Navigation登録
  - 場所: `apps/web/src/shared/navigation/menu.ts`
  - 社員マスタメニュー項目を追加
  - 権限チェック（epm.employee-master.read）
  - _Requirements: FR-LIST-07_

---

## 9. Testing & Validation

- [ ] 9.1 Unit Tests（Domain API）
  - EmployeeMasterServiceテスト
  - EmployeeMasterRepositoryテスト
  - ビジネスルールテスト（employeeCode変更不可、一意性チェック等）
  - _Requirements: FR-LIST-03, FR-LIST-04_

- [ ] 9.2 Integration Tests（BFF）
  - EmployeeMasterBffServiceテスト
  - ページング/ソート正規化テスト
  - エラーPass-throughテスト
  - _Requirements: FR-LIST-10, FR-LIST-11_

- [ ] 9.3 E2E Tests（UI）
  - 一覧検索/詳細表示/作成/更新/無効化/再有効化のE2Eテスト
  - 権限チェックテスト
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

## 変更点要約（P0矛盾解消・重複削除）

- contracts-first順序を修正: `bff → api → shared` → `shared（共通のみ最小） → api → bff`
- Enum/Error配置ルールを境界別に明確化: UI↔BFFはbff、BFF↔APIはapi、共通利用のみshared（最小限）
- EmployeeMasterErrorをDomain API正本として `packages/contracts/src/api/errors/` に配置
- EmployeeMasterSortByをapi/bffで共通利用が必要な場合のみshared、そうでなければapi/bffにそれぞれ配置する方針に変更
- BFF Contractsの重複を解消: 4.2.1〜4.2.6の重複タスクを削除し、4.3.1〜4.3.6に統一
- Controllerのエラー参照を修正: shared/errors → packages/contracts/src/api/errors
- Requirements Completeness Gateを追加: requirements.mdのDecision/FR存在確認と参照ID整合性チェック
