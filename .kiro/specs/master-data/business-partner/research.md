# Research & Design Decisions

---
**Purpose**: Capture discovery findings, architectural investigations, and rationale that inform the technical design.

---

## Summary
- **Feature**: `master-data/business-partner`
- **Discovery Scope**: Extension (following employee-master reference implementation)
- **Key Findings**:
  - 5つのエンティティ（Party, SupplierSite, Payee, CustomerSite, ShipTo）を管理する複雑なマスタ系機能
  - 既存の employee-master パターン（Contracts分離、BFF/API境界、ページング正規化）を踏襲可能
  - 派生フラグ（is_supplier/is_customer）とPayee自動生成ロジックがService層の中核となる

## Research Log

### Employee Master パターン分析

- **Context**: 既存実装パターンを理解し、Business Partner Masterへの適用可能性を検証
- **Sources Consulted**:
  - `packages/contracts/src/api/employee-master/index.ts`
  - `packages/contracts/src/bff/employee-master/index.ts`
  - `packages/contracts/src/api/errors/employee-master-error.ts`
- **Findings**:
  - DTO命名: すべて camelCase（`employeeCode`, `employeeName`）
  - BFF契約: page/pageSize（1-based）、totalPages含む
  - API契約: offset/limit（0-based）
  - エラー定義: ErrorCode定数 + HttpStatus + Message のマッピング
  - 楽観ロック: version フィールドを update request に含める
  - 監査列: createdBy/updatedBy（login_account_id）, createdAt/updatedAt
  - List操作: keyword（部分一致）, sortBy/sortOrder, pagination
- **Implications**:
  - Business Partner でも同一パターンを採用することで、実装者の学習コスト削減
  - BFF Paging 正規化（page/pageSize → offset/limit）は BFF Service の必須責務
  - エラーコード体系も同様の構造を採用（PartyErrorCode, SupplierSiteErrorCode 等）

### 取引先系マスタの複雑性分析

- **Context**: 5つのエンティティ間の関係と、特有のビジネスルール（Payee自動生成、派生フラグ管理）を理解
- **Sources Consulted**:
  - `.kiro/specs/spec_doc/61_機能設計検討/01_仕様検討/03_取引先系マスタ（Party SupplierSite Payee）.md`
  - `.kiro/specs/spec_doc/61_機能設計検討/02_エンティティ定義/03_取引先系マスタ関係.md`
  - `requirements.md`（Requirement 2, 7, 13）
- **Findings**:
  - **Payee自動生成**: SupplierSite作成時に payee_id 未指定の場合、同一 party_id + supplier_sub_code のPayeeを検索し、存在すれば紐づけ、なければ新規作成
  - **派生フラグ**: is_supplier/is_customer は Party に保持し、SupplierSite/CustomerSite 作成・削除時に Service層で明示的に更新
  - **コード正規化**: party_code / sub_code の入力時に trim・半角化・大文字統一（英数字モード）を適用
  - **表示コード生成**: supplier_code = party_code + "-" + supplier_sub_code（最大21文字）を DB に保存
  - **ShipTo独立コード**: ship_to_code は CustomerSite のコードを含まない独立した10桁コード
- **Implications**:
  - Payee自動生成ロジックは SupplierSiteService の create メソッド内でトランザクション処理が必要
  - 派生フラグ更新は Repository ではなく Service 層の責務として明確化
  - コード正規化は共通ユーティリティ（normalizeBusinessCode）として実装し、各Serviceで利用
  - 週次バッチによる派生フラグ整合性チェックは Phase 2（V2）で検討（MVP-1 ではService層制御のみ）

### Contracts 設計方針

- **Context**: 5エンティティ分の Contracts を効率的に定義する方法を検討
- **Alternatives Considered**:
  1. **Option A**: 1ファイルにすべてのエンティティを定義（`packages/contracts/src/api/business-partner/index.ts`）
  2. **Option B**: エンティティごとにファイル分割（`party.ts`, `supplier-site.ts`, `payee.ts`, `customer-site.ts`, `ship-to.ts`）
- **Selected Approach**: Option A（1ファイル統合）
- **Rationale**:
  - エンティティ間の関連が強い（Party → Sites → Payee）ため、同一ファイルで定義することで全体像を把握しやすい
  - employee-master も単一ファイルで定義されており、パターン踏襲
  - ファイル分割によるimport複雑化を回避
- **Trade-offs**:
  - 利点: 全体像の把握が容易、import がシンプル
  - 欠点: ファイルサイズが大きくなる（約500-600行想定）
- **Follow-up**: ファイルサイズが 1000行を超える場合は Phase 2 で分割を検討

### BFF Error Policy 選択

- **Context**: Business Partner Service における BFF Error Policy を選択
- **Alternatives Considered**:
  1. **Option A: Pass-through**（推奨）: Domain APIエラーを原則そのまま返す
  2. **Option B: Minimal shaping**: UI表示に必要な最小整形のみ許可
- **Selected Approach**: Option A（Pass-through）
- **Rationale**:
  - employee-master も Pass-through を採用しており、プロジェクト標準パターンに準拠
  - UIは `contracts/bff/errors` に基づいて表示制御を行うため、BFF側での意味的な再分類は不要
  - BFFが独自のビジネス判断を持つことを回避し、責務境界を明確化
- **Trade-offs**:
  - 利点: 責務境界が明確、BFF実装がシンプル
  - 欠点: UI側でエラーコード別の表示制御が必要
- **Follow-up**: エラーメッセージの日本語化は contracts 側で定義済み（EmployeeMasterErrorMessage 参照）

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| Single Service per Entity | Party/SupplierSite/Payee/CustomerSite/ShipTo ごとに独立した Service を作成 | 責務分離が明確、テスト容易性 | Service 間の依存管理が複雑化（例: SupplierSite が PayeeService を呼ぶ） | 採用（employee-master パターン踏襲） |
| Aggregated Service | BusinessPartnerService 内ですべてのエンティティを管理 | トランザクション境界が明確 | 単一Serviceが肥大化、テスト複雑度増加 | 不採用（責務分離原則違反） |

## Design Decisions

### Decision: Payee 自動生成のトランザクション境界

- **Context**: SupplierSite作成時に Payee を自動生成または既存を紐づける必要がある（Requirement 2.6-2.8）
- **Alternatives Considered**:
  1. SupplierSiteService 内で PayeeRepository を直接呼び出す
  2. SupplierSiteService が PayeeService を DI して呼び出す
  3. Domain Event（PayeeCreationRequested）を発行して非同期処理
- **Selected Approach**: Option 2（PayeeService を DI）
- **Rationale**:
  - Service間の依存は NestJS の DI で解決可能
  - トランザクション境界を SupplierSiteService が管理できる
  - 同期処理で完結し、UIレスポンスが即座に返る
- **Trade-offs**:
  - 利点: 実装がシンプル、トランザクション制御が容易
  - 欠点: Service 間の循環依存に注意が必要（SupplierSite ⇄ Payee は発生しない想定）
- **Follow-up**: PayeeService の create/findOrCreate メソッドを実装し、SupplierSiteService から呼び出す

### Decision: 派生フラグ（is_supplier/is_customer）の更新タイミング

- **Context**: Party の is_supplier/is_customer フラグを Site 作成・削除時に更新する必要がある（Requirement 7）
- **Alternatives Considered**:
  1. DB トリガーで自動更新
  2. Service 層で明示的に更新（トランザクション内）
  3. 週次バッチで定期的に再計算
- **Selected Approach**: Option 2（Service層で明示的更新）
- **Rationale**:
  - 仕様概要（9.3）で「アプリケーション層（Service層）で明示的に更新」と明記されている
  - トランザクション内で整合性を担保できる
  - DB トリガーは RLS 境界を越える可能性があり、マルチテナント安全性に懸念
- **Trade-offs**:
  - 利点: トランザクション境界が明確、tenant_id 境界を守りやすい
  - 欠点: 実装漏れのリスク（Site作成・削除すべての箇所で更新が必要）
- **Follow-up**: 週次バッチによる整合性チェックは V2 で検討（MVP-1 では Service 層制御のみ）

### Decision: コード正規化ユーティリティの配置

- **Context**: party_code / sub_code の正規化（trim・半角化・大文字統一）を複数の Service で利用する（Requirement 6）
- **Alternatives Considered**:
  1. 各 Service に同じロジックを実装
  2. 共通ユーティリティ（`normalizeBusinessCode`）を作成
  3. DTO バリデーション層（class-validator）で実装
- **Selected Approach**: Option 2（共通ユーティリティ）
- **Rationale**:
  - ロジックの重複を回避
  - テナント設定（数字のみ/英数字）を引数で受け取り、柔軟に対応
  - employee-master では正規化処理が存在しないため、新規実装が必要
- **Trade-offs**:
  - 利点: DRY原則、テスト容易性
  - 欠点: テナント設定の取得方法を決定する必要がある
- **Follow-up**: `apps/api/src/common/utils/normalize-business-code.ts` として実装

## Risks & Mitigations

- **Risk 1**: SupplierSite作成時のPayee自動生成トランザクションが失敗した場合、データ不整合が発生する
  - **Mitigation**: SupplierSiteService の create メソッド全体を1トランザクションで囲み、ロールバックを保証
- **Risk 2**: 派生フラグ（is_supplier/is_customer）の更新漏れにより、Party一覧の絞り込みが正しく機能しない
  - **Mitigation**: Service層で Site作成・削除時に必ず updateDerivedFlags を呼び出すパターンを徹底。E2Eテストで検証
- **Risk 3**: コード正規化ロジックの実装誤りにより、重複コードが作成される可能性
  - **Mitigation**: normalizeBusinessCode の単体テストを充実させる。UNIQUE制約でDB層でも保護

## References

- [Employee Master API Contracts](file:///c:/10_dev/ProcureERP-SDD/packages/contracts/src/api/employee-master/index.ts) - 既存パターンの参照実装
- [Employee Master BFF Contracts](file:///c:/10_dev/ProcureERP-SDD/packages/contracts/src/bff/employee-master/index.ts) - BFF契約のパターン
- [Employee Master Error Definition](file:///c:/10_dev/ProcureERP-SDD/packages/contracts/src/api/errors/employee-master-error.ts) - エラー定義のパターン
- [取引先系マスタ仕様概要](.kiro/specs/spec_doc/61_機能設計検討/01_仕様検討/03_取引先系マスタ（Party SupplierSite Payee）.md) - 凍結仕様
- [取引先系マスタエンティティ定義](.kiro/specs/spec_doc/61_機能設計検討/02_エンティティ定義/03_取引先系マスタ関係.md) - エンティティ詳細
