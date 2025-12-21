# Implementation Plan

> CCSDD / SDD 前提：**contracts-first**（bff → api → shared）を最優先し、境界違反を guard で止める。  
> UI は最後。v0 は **Phase 1（統制テスト）→ Phase 2（本実装）** の二段階で扱う。

---

## 0. Design Completeness Gate（Blocking）

> Implementation MUST NOT start until all items below are checked.
> These checks are used to prevent "empty design sections" from being silently interpreted by implementers/AI.

- [ ] 0.1 Designの「BFF Specification（apps/bff）」が埋まっている
  - BFF endpoints（UIが叩く）が記載されている
  - Request/Response DTO（packages/contracts/src/bff）が列挙されている
  - **Paging/Sorting正規化（必須）が明記されている**
    - UI/BFF: page/pageSize、Domain API: offset/limit
    - defaults（例: page=1, pageSize=50）
    - clamp（例: pageSize≤200）
    - whitelist（sortBy許可リスト）
    - normalize（keyword trim、空→undefined）
    - transform（page→offset/limit）
  - 変換（api DTO → bff DTO）の方針が記載されている
  - エラー整形方針（**contracts/bff/errors** に準拠）が記載されている
  - tenant_id/user_id の取り回し（解決・伝搬ルール）が記載されている

- [ ] 0.2 Designの「Service Specification（Domain / apps/api）」が埋まっている
  - Usecase（Create/Update/Inactivate等）が列挙されている
  - 主要ビジネスルールの所在（Domainに置く／置かない）が記載されている
  - トランザクション境界が記載されている
  - 監査ログ記録ポイントが記載されている

- [ ] 0.3 Designの「Repository Specification（apps/api）」が埋まっている
  - 取得・更新メソッド一覧が記載されている（tenant_id必須）
  - where句二重ガードの方針（tenant_id常時指定）が記載されている
  - RLS前提（set_config前提）が記載されている

- [ ] 0.4 Designの「Contracts Summary（This Feature）」が埋まっている
  - packages/contracts/src/bff 側の追加・変更DTOが列挙されている
  - packages/contracts/src/api 側の追加・変更DTOが列挙されている
  - **Enum / Error の配置ルールが明記されている**
    - 原則 `packages/contracts/src/shared/**` に集約
    - 再定義禁止（feature配下に置かない）
  - 「UIは packages/contracts/src/api を参照しない」ルールが明記されている

- [ ] 0.5 Requirements Traceability（必要な場合）が更新されている
  - 主要Requirementが、BFF/API/Repo/Flows等の設計要素に紐づいている

- [ ] 0.6 v0生成物の受入・移植ルールが確認されている
  - v0生成物は必ず `apps/web/_v0_drop/<context>/<feature>/src` に一次格納されている
  - v0出力はそのまま `apps/web/src` に配置されていない
  - v0_drop 配下に **layout.tsx が存在しない**（AppShell以外の殻禁止）
  - UIは MockBffClient で動作確認されている（BFF未接続状態）
  - 移植時に以下を確認している
    - UIはBFFのみを呼び出している
    - `packages/contracts/src/api` をUIが参照していない
    - UIは `packages/contracts/src/bff` のみ参照している
    - 画面ロジックが Feature 配下に閉じている

- [ ] 0.7 Structure / Boundary Guard がパスしている
  - `npx tsx scripts/structure-guards.ts` が成功している
  - UI → Domain API の直接呼び出しが存在しない
  - UIでの直接 fetch() が存在しない（HttpBffClient 例外のみ）
  - BFFがDBへ直接アクセスしていない

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

## 2. Decisions（意思決定）

- [ ] 2.1 キーワード検索の実装方針を決定
  - 部分一致（LIKE '%keyword%'）を採用
  - 大文字・小文字を区別しない（Case-insensitive）
  - 対象フィールド: employeeCode OR employeeName OR employeeKanaName
  - パフォーマンス考慮: 必要に応じてGINインデックスを検討（後続タスク）
  - 注: design.mdに既に仕様が記載されているため、決定済み

---

## 3. Contracts（bff → api → shared）

### 3.1 BFF Contracts

- [ ] 3.1.1 BFF DTO定義: ListEmployeesRequest / ListEmployeesResponse
  - `packages/contracts/src/bff/employee-master/index.ts` に定義
  - page, pageSize, sortBy, sortOrder, keyword を含む
  - _Requirements: 1.1_

- [ ] 3.1.2 BFF DTO定義: GetEmployeeResponse
  - `packages/contracts/src/bff/employee-master/index.ts` に定義
  - employee: EmployeeDto を含む
  - _Requirements: 2.1_

- [ ] 3.1.3 BFF DTO定義: CreateEmployeeRequest / CreateEmployeeResponse
  - `packages/contracts/src/bff/employee-master/index.ts` に定義
  - 全フィールド（employeeCode, employeeName, employeeKanaName, email, joinDate, retireDate, remarks, isActive）を含む
  - _Requirements: 3.1, 3.2, 3.7_

- [ ] 3.1.4 BFF DTO定義: UpdateEmployeeRequest / UpdateEmployeeResponse
  - `packages/contracts/src/bff/employee-master/index.ts` に定義
  - 全フィールド（上記 + version）を含む
  - _Requirements: 2.6_

- [ ] 3.1.5 BFF DTO定義: EmployeeDto
  - `packages/contracts/src/bff/employee-master/index.ts` に定義
  - id, employeeCode, employeeName, employeeKanaName, email, joinDate, retireDate, remarks, isActive, version, createdAt, updatedAt を含む
  - _Requirements: 1.2, 2.2_

### 3.2 API Contracts

- [ ] 3.2.1 API DTO定義: ListEmployeesApiRequest / ListEmployeesApiResponse
  - `packages/contracts/src/api/employee-master/index.ts` に定義
  - offset, limit, sortBy, sortOrder, keyword を含む
  - _Requirements: 1.1_

- [ ] 3.2.2 API DTO定義: GetEmployeeApiResponse
  - `packages/contracts/src/api/employee-master/index.ts` に定義
  - employee: EmployeeApiDto を含む
  - _Requirements: 2.1_

- [ ] 3.2.3 API DTO定義: CreateEmployeeApiRequest / CreateEmployeeApiResponse
  - `packages/contracts/src/api/employee-master/index.ts` に定義
  - 全フィールドを含む
  - _Requirements: 3.7_

- [ ] 3.2.4 API DTO定義: UpdateEmployeeApiRequest / UpdateEmployeeApiResponse
  - `packages/contracts/src/api/employee-master/index.ts` に定義
  - 全フィールド（version含む）を含む
  - _Requirements: 2.6_

- [ ] 3.2.5 API DTO定義: EmployeeApiDto
  - `packages/contracts/src/api/employee-master/index.ts` に定義
  - 全フィールドを含む
  - _Requirements: 1.2, 2.2_

### 3.3 Error Contracts

- [ ] 3.3.1 エラーコード定義: employee-master-error.ts
  - `packages/contracts/src/api/errors/employee-master-error.ts` に定義
  - EMPLOYEE_NOT_FOUND, EMPLOYEE_CODE_DUPLICATE, INVALID_EMAIL_FORMAT, INVALID_DATE_RANGE, CONCURRENT_UPDATE を含む
  - _Requirements: 2.8, 3.9, 4.5, 4.8, 4.12_

- [ ] 3.3.2 BFFエラー再エクスポート
  - `packages/contracts/src/bff/errors/employee-master-error.ts` にて API エラーを再エクスポート
  - BFFとAPIでエラーコードの完全一致を保証
  - _Requirements: 1.5, 2.5, 2.8, 3.6, 3.9_

- [ ] 3.3.3 エラーエクスポート追加
  - `packages/contracts/src/api/errors/index.ts` に employee-master-error を追加
  - _Requirements: 1.5, 2.5, 2.8, 3.6, 3.9_

---

## 4. DB / Migration / RLS

- [ ] 4.1 Prisma Schema: Employeeモデル定義
  - `packages/db/prisma/schema.prisma` に Employee モデルを追加
  - id, tenantId, employeeCode, employeeName, employeeKanaName, email, joinDate, retireDate, remarks, isActive, version, createdAt, updatedAt を含む
  - @@unique([tenantId, employeeCode]) を定義
  - @@index([tenantId, employeeCode]), @@index([tenantId, isActive]), @@index([tenantId, joinDate]) を定義
  - _Requirements: 1.3, 2.9, 3.10, 4.11_

- [ ] 4.2 Migration生成・実行
  - `npx prisma migrate dev --name add_employee_master` を実行
  - マイグレーションファイルが生成されていることを確認
  - _Requirements: 1.3, 2.9, 3.10_

- [ ] 4.3 RLS Policy実装
  - PostgreSQL RLS を有効化: `ALTER TABLE "Employee" ENABLE ROW LEVEL SECURITY;`
  - tenant_isolation ポリシーを作成: `CREATE POLICY "tenant_isolation" ON "Employee" FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::text);`
  - マイグレーションファイルにRLS設定を追加
  - _Requirements: 1.3, 2.9, 3.10_

---

## 5. Domain API（apps/api）

### 5.1 Repository

- [ ] 5.1.1 Repository: findMany実装
  - `apps/api/src/modules/master-data/employee-master/repository/employee.repository.ts` に実装
  - tenantId, offset, limit, sortBy, sortOrder, keyword を受け取る
  - tenant_id をWHERE句に必ず含める（double-guard）
  - キーワード検索: employeeCode OR employeeName OR employeeKanaName で部分一致（大文字小文字区別なし）
  - ソート: sortBy, sortOrder に基づいてソート
  - ページネーション: offset, limit を適用
  - 総件数も取得
  - _Requirements: 1.1, 1.3, 2.9_

- [ ] 5.1.2 Repository: findOne実装
  - `apps/api/src/modules/master-data/employee-master/repository/employee.repository.ts` に実装
  - tenantId, employeeId を受け取る
  - tenant_id をWHERE句に必ず含める（double-guard）
  - _Requirements: 2.1, 2.9_

- [ ] 5.1.3 Repository: create実装
  - `apps/api/src/modules/master-data/employee-master/repository/employee.repository.ts` に実装
  - tenantId, CreateEmployeeApiRequest を受け取る
  - tenant_id をINSERT値に含める
  - version を1で初期化
  - isActive をデフォルトtrueに設定
  - _Requirements: 3.7, 3.10, 4.10_

- [ ] 5.1.4 Repository: update実装
  - `apps/api/src/modules/master-data/employee-master/repository/employee.repository.ts` に実装
  - tenantId, employeeId, UpdateEmployeeApiRequest, version を受け取る
  - WHERE句に tenant_id と version を含める（楽観ロック）
  - 更新件数が0の場合は競合とみなす
  - version をインクリメント
  - _Requirements: 2.6_

- [ ] 5.1.5 Repository: checkEmployeeCodeDuplicate実装
  - `apps/api/src/modules/master-data/employee-master/repository/employee.repository.ts` に実装
  - tenantId, employeeCode, excludeEmployeeId（更新時用）を受け取る
  - 同一テナント内で社員コードの重複をチェック
  - _Requirements: 4.11, 4.12_

### 5.2 Service

- [ ] 5.2.1 Service: ListEmployees実装
  - `apps/api/src/modules/master-data/employee-master/service/employee.service.ts` に実装
  - tenantId, ListEmployeesApiRequest を受け取る
  - Repository.findMany を呼び出し
  - 権限チェック: procure.employee-master.read
  - _Requirements: 1.1, 1.3_

- [ ] 5.2.2 Service: GetEmployee実装
  - `apps/api/src/modules/master-data/employee-master/service/employee.service.ts` に実装
  - tenantId, employeeId を受け取る
  - Repository.findOne を呼び出し
  - 存在しない場合は EMPLOYEE_NOT_FOUND エラー
  - 権限チェック: procure.employee-master.read
  - _Requirements: 2.1, 2.9_

- [ ] 5.2.3 Service: CreateEmployee実装
  - `apps/api/src/modules/master-data/employee-master/service/employee.service.ts` に実装
  - tenantId, CreateEmployeeApiRequest を受け取る
  - バリデーション実行:
    - 必須項目チェック（employeeCode, employeeName, employeeKanaName, joinDate）
    - メールアドレス形式チェック（emailが指定されている場合）
    - 社員コード重複チェック（Repository.checkEmployeeCodeDuplicate）
    - 日付整合性チェック（retireDateがjoinDateより前でないこと）
  - バリデーションエラー時は適切なエラーコードを返す
  - Repository.create を呼び出し（トランザクション内）
  - 監査ログ記録（user_id, tenant_id, employee_id, 作成内容）
  - 権限チェック: procure.employee-master.create
  - _Requirements: 3.5, 3.7, 3.10, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10, 4.11, 4.12_

- [ ] 5.2.4 Service: UpdateEmployee実装
  - `apps/api/src/modules/master-data/employee-master/service/employee.service.ts` に実装
  - tenantId, employeeId, UpdateEmployeeApiRequest を受け取る
  - 既存データ取得（Repository.findOne）
  - 存在しない場合は EMPLOYEE_NOT_FOUND エラー
  - バリデーション実行:
    - 必須項目チェック
    - メールアドレス形式チェック
    - 社員コード変更がある場合のみ重複チェック
    - 日付整合性チェック
  - バリデーションエラー時は適切なエラーコードを返す
  - Repository.update を呼び出し（トランザクション内、楽観ロック）
  - 更新件数が0の場合は CONCURRENT_UPDATE エラー
  - 監査ログ記録（user_id, tenant_id, employee_id, 変更前後の値）
  - 権限チェック: procure.employee-master.update
  - _Requirements: 2.4, 2.6, 2.9, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.11, 4.12_

### 5.3 Controller

- [ ] 5.3.1 Controller: GET /api/master-data/employee-master実装
  - `apps/api/src/modules/master-data/employee-master/controller/employee.controller.ts` に実装
  - ListEmployeesApiRequest を受け取り、Service.ListEmployees を呼び出し
  - tenant_id を認証情報から解決
  - _Requirements: 1.1_

- [ ] 5.3.2 Controller: GET /api/master-data/employee-master/:id実装
  - `apps/api/src/modules/master-data/employee-master/controller/employee.controller.ts` に実装
  - employeeId を受け取り、Service.GetEmployee を呼び出し
  - tenant_id を認証情報から解決
  - _Requirements: 2.1_

- [ ] 5.3.3 Controller: POST /api/master-data/employee-master実装
  - `apps/api/src/modules/master-data/employee-master/controller/employee.controller.ts` に実装
  - CreateEmployeeApiRequest を受け取り、Service.CreateEmployee を呼び出し
  - tenant_id を認証情報から解決
  - _Requirements: 3.7_

- [ ] 5.3.4 Controller: PUT /api/master-data/employee-master/:id実装
  - `apps/api/src/modules/master-data/employee-master/controller/employee.controller.ts` に実装
  - employeeId, UpdateEmployeeApiRequest を受け取り、Service.UpdateEmployee を呼び出し
  - tenant_id を認証情報から解決
  - _Requirements: 2.6_

### 5.4 Module

- [ ] 5.4.1 Module: EmployeeModule定義
  - `apps/api/src/modules/master-data/employee-master/employee.module.ts` に定義
  - Controller, Service, Repository を登録
  - PrismaModule をインポート
  - _Requirements: 1.1, 2.1, 2.6, 3.7_

- [ ] 5.4.2 AppModule: EmployeeModule登録
  - `apps/api/src/app.module.ts` に EmployeeModule を追加
  - _Requirements: 1.1, 2.1, 2.6, 3.7_

---

## 6. BFF（apps/bff）

### 6.1 Domain API Client

- [ ] 6.1.1 Domain API Client実装
  - `apps/bff/src/modules/master-data/employee-master/clients/domain-api.client.ts` に実装
  - HTTPクライアントで Domain API を呼び出す
  - tenant_id, user_id をヘッダーに含めて伝搬
  - _Requirements: 1.1, 2.1, 2.6, 3.7_

### 6.2 Mapper

- [ ] 6.2.1 Mapper: API DTO → BFF DTO変換実装
  - `apps/bff/src/modules/master-data/employee-master/mappers/employee.mapper.ts` に実装
  - EmployeeApiDto → EmployeeDto 変換
  - ListEmployeesApiResponse → ListEmployeesResponse 変換（page/pageSize追加）
  - _Requirements: 1.1, 1.2, 2.1, 2.2_

- [ ] 6.2.2 Mapper: BFF DTO → API DTO変換実装
  - `apps/bff/src/modules/master-data/employee-master/mappers/employee.mapper.ts` に実装
  - CreateEmployeeRequest → CreateEmployeeApiRequest 変換
  - UpdateEmployeeRequest → UpdateEmployeeApiRequest 変換
  - _Requirements: 2.6, 3.7_

### 6.3 Service

- [ ] 6.3.1 BFF Service: ListEmployees実装
  - `apps/bff/src/modules/master-data/employee-master/service/employee.service.ts` に実装
  - ListEmployeesRequest を受け取り、正規化を実行:
    - defaults: page=1, pageSize=50, sortBy=employeeCode, sortOrder=asc
    - clamp: pageSize ≤ 200
    - whitelist: sortBy は許可リストのみ
    - normalize: keyword trim、空→undefined
    - transform: offset=(page-1)*pageSize, limit=pageSize
  - Domain API Client を呼び出し（offset/limitで）
  - Mapper で BFF DTO に変換（page/pageSizeを追加）
  - エラーは Pass-through（Option A）
  - _Requirements: 1.1, 1.5_

- [ ] 6.3.2 BFF Service: GetEmployee実装
  - `apps/bff/src/modules/master-data/employee-master/service/employee.service.ts` に実装
  - employeeId を受け取り、Domain API Client を呼び出し
  - Mapper で BFF DTO に変換
  - エラーは Pass-through
  - _Requirements: 2.1, 2.5_

- [ ] 6.3.3 BFF Service: CreateEmployee実装
  - `apps/bff/src/modules/master-data/employee-master/service/employee.service.ts` に実装
  - CreateEmployeeRequest を受け取り、Mapper で API DTO に変換
  - Domain API Client を呼び出し
  - Mapper で BFF DTO に変換
  - エラーは Pass-through
  - _Requirements: 3.7, 3.9_

- [ ] 6.3.4 BFF Service: UpdateEmployee実装
  - `apps/bff/src/modules/master-data/employee-master/service/employee.service.ts` に実装
  - employeeId, UpdateEmployeeRequest を受け取り、Mapper で API DTO に変換
  - Domain API Client を呼び出し
  - Mapper で BFF DTO に変換
  - エラーは Pass-through
  - _Requirements: 2.6, 2.8_

### 6.4 Controller

- [ ] 6.4.1 BFF Controller: GET /api/bff/master-data/employee-master実装
  - `apps/bff/src/modules/master-data/employee-master/controller/employee.controller.ts` に実装
  - ListEmployeesRequest を受け取り、Service.ListEmployees を呼び出し
  - tenant_id, user_id を認証情報（Clerk）から解決
  - 解決失敗時は 401 Unauthorized
  - _Requirements: 1.1_

- [ ] 6.4.2 BFF Controller: GET /api/bff/master-data/employee-master/:id実装
  - `apps/bff/src/modules/master-data/employee-master/controller/employee.controller.ts` に実装
  - employeeId を受け取り、Service.GetEmployee を呼び出し
  - tenant_id, user_id を認証情報から解決
  - _Requirements: 2.1_

- [ ] 6.4.3 BFF Controller: POST /api/bff/master-data/employee-master実装
  - `apps/bff/src/modules/master-data/employee-master/controller/employee.controller.ts` に実装
  - CreateEmployeeRequest を受け取り、Service.CreateEmployee を呼び出し
  - tenant_id, user_id を認証情報から解決
  - _Requirements: 3.7_

- [ ] 6.4.4 BFF Controller: PUT /api/bff/master-data/employee-master/:id実装
  - `apps/bff/src/modules/master-data/employee-master/controller/employee.controller.ts` に実装
  - employeeId, UpdateEmployeeRequest を受け取り、Service.UpdateEmployee を呼び出し
  - tenant_id, user_id を認証情報から解決
  - _Requirements: 2.6_

### 6.5 Module

- [ ] 6.5.1 BFF Module: EmployeeBffModule定義
  - `apps/bff/src/modules/master-data/employee-master/employee.module.ts` に定義
  - Controller, Service を登録
  - Domain API Client を登録
  - _Requirements: 1.1, 2.1, 2.6, 3.7_

- [ ] 6.5.2 BFF AppModule: EmployeeBffModule登録
  - `apps/bff/src/app.module.ts` に EmployeeBffModule を追加
  - _Requirements: 1.1, 2.1, 2.6, 3.7_

---

## 7. UI（apps/web）

### 7.1 Phase 1: v0統制テスト（隔離）

- [ ] 7.1.1 v0 Prompt作成
  - `.kiro/specs/master-data/employee-master/v0-prompt.md` を作成
  - design.md と contracts/bff を参照
  - BFF Specification を完全に記載
  - 禁止事項を明記（layout.tsx禁止、直接fetch禁止等）
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 3.1, 3.2_

- [ ] 7.1.2 v0 UI生成
  - v0.dev で v0-prompt.md の内容を使用してUI生成
  - 生成結果を確認
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 3.1, 3.2_

- [ ] 7.1.3 v0ファイル取得
  - `./scripts/v0-fetch.sh '<v0_url>' 'master-data/employee-master'` を実行
  - `apps/web/_v0_drop/master-data/employee-master/src/` に格納
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 3.1, 3.2_

- [ ] 7.1.4 Structure Guard実行
  - `npx tsx scripts/structure-guards.ts` を実行
  - 全GuardがPASSすることを確認
  - 違反がある場合は修正
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 3.1, 3.2_

- [ ] 7.1.5 MockBffClient動作確認
  - MockBffClient で画面が動作することを確認
  - 一覧表示、詳細表示、新規登録、編集の各画面が表示されることを確認
  - _Requirements: 1.1, 1.2, 1.4, 2.1, 2.2, 3.1, 3.2, 3.3_

### 7.2 Phase 2: 本実装（移植・統合）

- [ ] 7.2.1 v0生成物の移植
  - `npx tsx scripts/v0-migrate.ts master-data employee-master` を実行
  - `apps/web/src/features/master-data/employee-master/` に移植
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 3.1, 3.2_

- [ ] 7.2.2 importパス修正
  - `@/shared/ui` を使用するように修正
  - `@contracts/bff/employee-master` を使用するように修正
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 3.1, 3.2_

- [ ] 7.2.3 App Router登録
  - `apps/web/src/app/master-data/employee-master/page.tsx` を作成
  - EmployeeMasterPage をエクスポート
  - _Requirements: 1.1_

- [ ] 7.2.4 Navigation登録
  - `apps/web/src/shared/navigation/menu.ts` に employee-master メニュー項目を追加
  - path: `/master-data/employee-master`
  - _Requirements: 1.1_

- [ ] 7.2.5 HttpBffClient実装
  - `apps/web/src/features/master-data/employee-master/api/HttpBffClient.ts` に実装
  - BFFエンドポイントを呼び出す
  - エラーハンドリングを実装
  - _Requirements: 1.1, 2.1, 2.6, 3.7_

- [ ] 7.2.6 BffClient切替
  - `apps/web/src/features/master-data/employee-master/ui/page.tsx` で HttpBffClient を使用するように変更
  - MockBffClient から HttpBffClient へ切替
  - _Requirements: 1.1, 2.1, 2.6, 3.7_

- [ ] 7.2.7 一覧画面実装
  - 社員一覧を表示
  - ページネーションUI制御
  - ソートUI制御
  - キーワード検索UI
  - ローディング状態表示
  - エラーメッセージ表示
  - _Requirements: 1.1, 1.2, 1.4, 1.5_

- [ ] 7.2.8 詳細・編集画面実装
  - 社員詳細を表示
  - 編集フォーム実装
  - フィールド変更反映
  - バリデーションエラー表示（赤枠強調）
  - 保存ボタン実装
  - 更新成功時の一覧画面遷移
  - 更新失敗時のエラーメッセージ表示
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

- [ ] 7.2.9 新規登録画面実装
  - 新規登録画面表示
  - フィールド初期化（空状態）
  - 入力内容反映
  - バリデーションエラー表示
  - 保存ボタン実装
  - 登録成功時の一覧画面遷移・新規社員表示
  - 登録失敗時のエラーメッセージ表示
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9_

- [ ] 7.2.10 URL State実装（オプション）
  - ページネーション状態をURLに反映
  - ソート状態をURLに反映
  - キーワード検索状態をURLに反映
  - _Requirements: 1.1_

- [ ] 7.2.11 Debounce実装（オプション）
  - キーワード検索にdebounceを適用
  - _Requirements: 1.1_

---

## 8. 統合テスト

- [ ] 8.1 一覧表示テスト
  - 社員一覧が正しく表示される
  - ページネーションが動作する
  - ソートが動作する
  - キーワード検索が動作する
  - テナント単位でフィルタリングされている
  - ローディング状態が表示される
  - エラーメッセージが表示される
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 8.2 詳細・編集テスト
  - 社員詳細が正しく表示される
  - 編集フォームが動作する
  - バリデーションが動作する
  - 更新が成功する
  - 楽観ロックが動作する（競合時エラー）
  - 更新成功時に一覧画面に遷移する
  - エラーメッセージが表示される
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9_

- [ ] 8.3 新規登録テスト
  - 新規登録画面が表示される
  - フィールドが空で初期化される
  - バリデーションが動作する（必須項目、メール形式、日付整合性、社員コード重複）
  - 登録が成功する
  - 登録成功時に一覧画面に遷移し、新規社員が表示される
  - エラーメッセージが表示される
  - テナントIDが自動設定される
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10_

- [ ] 8.4 バリデーションテスト
  - 必須項目チェックが動作する
  - メールアドレス形式チェックが動作する
  - 日付整合性チェックが動作する
  - 社員コード重複チェックが動作する
  - エラーメッセージが適切に表示される
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.11, 4.12_

- [ ] 8.5 マルチテナントテスト
  - テナントAのデータがテナントBに表示されない
  - テナントAのデータをテナントBが更新できない
  - RLSが正しく動作している
  - _Requirements: 1.3, 2.9, 3.10_

- [ ] 8.6 楽観ロックテスト
  - 同時更新時に競合エラーが発生する
  - エラーメッセージが適切に表示される
  - 再取得後に更新が成功する
  - _Requirements: 2.6_

---

## 9. 完了確認

- [ ] 9.1 全タスク完了確認
  - tasks.md の全タスクが完了している
  - すべての要件が実装されている
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10, 4.11, 4.12_

- [ ] 9.2 spec.json更新
  - `phase: "tasks-generated"` を維持
  - `approvals.tasks.generated: true` を維持
  - 実装完了時は `ready_for_implementation: true` に更新

