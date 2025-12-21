# Structure Steering – 調達管理SaaS

本ドキュメントは、調達管理SaaSのディレクトリ構造・コンテキスト分割・命名規約・層構造を定義する。  
目的は「仕様（specs）・プロジェクト知識（steering）・実装コード（apps/packages）が常に対応関係を保ち、  
人間と AI の両方が迷わず拡張できる状態」をつくること。

**Document Status**: Active  
**Last Updated**: 2025-12-07

> **開発プロセス定義**: 詳細な開発工程（STEP 0-7）と各工程の詳細については、  
> `notes/開発プロセス定義.md` を参照してください。

---

## 1. Organization Philosophy

### 1.1 レイヤ構造

本プロジェクトは Spec Driven Development を前提とし、以下の 4 レイヤを明確に分離する。

1. **Steering Layer**（`.kiro/steering/`）  
   プロダクト全体のビジョン・アーキテクチャ・構造・標準・意思決定履歴。  
   → 「プロジェクトの憲法」

2. **Spec Layer**（`.kiro/specs/`）  
   機能ごとの仕様（requirements / design / tasks / UI プロンプト）。  
   → 「何を実現するか／どう実現するか」の Single Source of Truth（SSOT）

3. **Shared Layer**（`packages/`）  
   DTO・ドメイン共通型・共通 UI・設定など、複数アプリから参照される共有コード。

4. **Application Layer**（`apps/`）  
   Next.js（web）・NestJS（api）など、実際のアプリケーション実装。

**原則：**

- 新しい機能は **Steering → Spec → Shared → App** の順で考える。
- 実装コードは必ず `.kiro/specs` のいずれかの Feature に紐づく（孤立した機能を作らない）。

---

## 2. Business Contexts & Features

### 2.1 コンテキスト（Context）の定義

調達管理SaaSでは、ドメインを以下のコンテキストに分割する。

- **`core-platform`**  
  テナント・認証／認可・ユーザー・組織・ロール・権限・承認ルート・採番・カレンダー等、基盤的な機能。

- **`master-data`**  
  取引先・仕入先・支払先・納入先・支払条件・銀行口座・品目・品目Ver・仕様・仕入先品目・倉庫・税区分・勘定科目 等。

- **`procurement-flow`**  
  購買依頼（PR）・見積依頼（RFQ）・見積回答・発注（PO）・入荷・仕入・在庫受払などの調達プロセス。

- **`finance`**  
  請求書照合・支払処理・仕訳連携など財務／会計寄りの領域。

- **`integration`**（将来）  
  会計システム・ERP・EC サイト（MonotaRO, MISUMI 等）との外部連携。

### 2.2 Feature の粒度とマッピング

Feature は「ユーザーから見て意味のある単位」を基本とする。

**例：**

- `core-platform/user-auth`（ログイン・パスワードリセット・MFA）
- `core-platform/org-structure`（組織・社員・ロール）
- `master-data/supplier-master`
- `master-data/item-master`
- `master-data/payment-terms`
- `procurement-flow/purchase-request`
- `procurement-flow/quotation`
- `procurement-flow/purchase-order`
- `procurement-flow/goods-receipt`
- `procurement-flow/invoice-matching`（将来）
- `finance/payment-export`（将来）

**マッピング原則：**

1 Feature につき、以下を 1 セットとして対応させる：

- **Spec**: `.kiro/specs/<context>/<feature>/requirements.md` など
- **API**: `apps/api/src/modules/<context>/<feature>/...`
- **Web UI**: `apps/web/app/(dashboard)/<feature>/...`
- **DTO**: `packages/dto/src/<context>/<feature>.dto.ts` など

---

## 3. Steering Documents

**Location**: `.kiro/steering/`  
**Purpose**: プロダクト全体の知識・標準・意思決定の集約。

### 3.1 基本ファイル

- **`product.md`**  
  プロダクトビジョン・対象ユーザー・提供価値・MVP範囲。

- **`tech.md`**  
  技術スタック（Next 16 / React 19.2 / Tailwind v4 / shadcn/ui / NestJS / Prisma / Redis+BullMQ / PostgreSQL）、  
  セキュリティ・マルチテナント（tenant_id + RLS）・金額 Decimal・非同期処理・テスト戦略など。

- **`structure.md`**（本ファイル）  
  コンテキスト分割・ディレクトリ構造・命名規約・層構造・AI 利用パターン。

### 3.2 Standards / ADR

- **`standards/general.md`**  
  命名規約・API設計・テスト方針など横断標準。

- **`adr/ADR-*.md`**  
  1DBマルチテナント採用理由、スタック選定などの重要なアーキ決定（ADR）。

**方針：**

- Steering は「横串ルール」に限る。
- Feature 個別の要件・画面仕様・API 詳細は `.kiro/specs` 側で管理する。

---

## 4. Specifications（.kiro/specs）

### 4.1 ドメイン仕様

**Location**: `.kiro/specs/domain/`

**パターン：**

- `.kiro/specs/domain/<domain-name>.md`

**例：**

- `org.md` … 組織・社員・ロール・権限
- `supplier.md` … 取引先・仕入先・支払先・納入先
- `item.md` … 品目・品目Ver・仕様
- `procurement.md` … PR〜見積〜PO〜入荷〜仕入〜在庫
- `finance.md` … 請求・支払・仕訳連携

**主な内容：**

- 用語定義（Glossary）
- エンティティ／値オブジェクトの一覧
- 主なビジネスルール
- 状態遷移の概略（PRステータス、POステータス 等）

### 4.2 Feature 仕様

**Location**: `.kiro/specs/<context>/<feature>/`

**パターン：**

- `requirements.md`
- `design.md`
- `tasks.md`
- `ui-<screen>.md`（v0 用 UI プロンプト・必要に応じて）

**例：**

- `.kiro/specs/core-platform/user-auth/requirements.md`
- `.kiro/specs/master-data/supplier-master/design.md`
- `.kiro/specs/procurement-flow/purchase-request/ui-list.md`

**役割：**

- **`requirements.md`**
  - コンテキスト・スコープ
  - EARS 形式の機能要件
  - GIVEN/WHEN/THEN の受入条件
  - ビジネスルール概要

- **`design.md`**
  - アーキ概要（どの Module / DTO / テーブルを使うか）
  - API 設計（エンドポイント・Request/Response DTO）
  - データモデル（テーブル構造・主キー・外部キー）
  - 状態遷移・業務フロー（必要に応じて図）
  - 非機能要件・テスト戦略（Feature 固有分）

- **`tasks.md`**
  - 実装タスクの分解（タスクID・対応要件・依存関係・完了条件）
  - `/kiro:spec-tasks` でたたき台生成 → 人が整理

- **`ui-*.md`**
  - v0 向け UI プロンプト。1画面1ファイルを基本とし、  
    画面目的・使用する DTO 型・イベント・UI コンポーネント要件を記述する。

**原則：**

- `requirements.md` → `design.md` → `tasks.md` → `ui-*.md`（必要に応じて）の順で作る。
- コード変更だけ（spec 更新なし）は原則禁止。

### 4.3 ADR（機能レベル）

必要に応じて、Feature 単位の大きな判断は  
`.kiro/specs/<context>/<feature>/adr-*.md` に記録してよい。

---

## 5. Source Code – Monorepo Layout

### 5.1 リポジトリ全体

**ベース構造：**

- `apps/` … 実アプリ (web, api)
- `packages/` … 共有コード (dto, domain, ui, config など)
- `.kiro/` … steering / specs

**ディレクトリ構造例：**

```
my-procure-saas/
  .kiro/
    steering/
    specs/
  apps/
    web/        # Next.js (App Router)
    api/        # NestJS
  packages/
    dto/        # DTO共有
    domain/     # ドメインモデル・値オブジェクト
    ui/         # 共通UIコンポーネント
    config/     # 設定・パス共有
  .cursor/
    rules/
  package.json
  tsconfig.base.json
  README.md
```

### 5.2 Webアプリ（Next.js）

**Location**: `apps/web/`

**ページ構成（App Router）：**

- `apps/web/app/(auth)/...`  
  ログイン・パスワードリセットなど認証系ルート。

- `apps/web/app/(dashboard)/...`  
  業務画面ルート。レイアウトでサイドバー等を共有する。

**コンポーネント：**

- `apps/web/components/ui/`  
  shadcn/ui をベースにした共通 UI コンポーネント。

- `apps/web/components/domain/`  
  調達ドメイン固有のコンポーネント  
  （例: SupplierSelect, ItemSelect, MoneyInput, StatusBadge）。

**その他：**

- `apps/web/lib/`  
  共通ユーティリティ・hooks など。

### 5.3 APIアプリ（NestJS）

**Location**: `apps/api/`

**モジュラーモノリス構成：**

- `apps/api/src/modules/<context>/<feature>/`
  - `<feature>.module.ts`
  - `<feature>.service.ts`
  - `<feature>.controller.ts`
  - `dto/`（API固有 DTO が必要な場合）

**例：**

- `apps/api/src/modules/master-data/supplier-master/`
- `apps/api/src/modules/procurement-flow/purchase-request/`

**コアモジュール：**

- `apps/api/src/core/`  
  認証・テナントコンテキスト・ロギングなど横断的関心事。

**インフラ系：**

- `apps/api/src/infrastructure/`  
  Prisma クライアントのラッパ・外部APIクライアントなど。

### 5.4 Shared Packages

**Location**: `packages/`

**例：**

- `packages/dto/src/procurement-flow/purchase-request.dto.ts`
- `packages/domain/src/money.ts`
- `packages/ui/src/components/data-table.tsx`
- `packages/config/src/env.ts`

**役割：**

- **`packages/dto`** … API DTO (Request/Response) を一元管理し、`apps/api` と `apps/web` から参照する。
- **`packages/domain`** … 金額・数量などの共通ドメインモデル・値オブジェクト。
- **`packages/ui`** … 共通 UI コンポーネント。
- **`packages/config`** … 環境設定・定数。

### 5.5 フェーズとスコープメモ（MVP想定）

- [P1] = Phase1 / MVP で最初に着手する範囲
- [P2] = Phase2 / MVP開発中〜直後に育てる範囲
- [F]  = Future / 将来構想（今は箱だけ or 未実装）

例）当面の対象：

- [P1] .kiro/specs/domain/glossary.md, procurement.md
- [P1] .kiro/specs/procurement-flow/purchase-request/*
- [P1] apps/api/src/modules/procurement-flow/purchase-request/*
- [P1] apps/web/app/(dashboard)/purchase-requests/*
- [P1] packages/dto/src/procurement-flow/purchase-request*.ts
- [P1] packages/domain/src/value-objects/Money.ts, Quantity.ts

- [P2] .kiro/specs/master-data/supplier-master/*
- [P2] apps/api/src/modules/master-data/supplier-master/*
- [P2] packages/ui/*
- [F]  finance/, integration/ 以下は構想のみ

---

## 6. 層構造（Clean Architecture のマッピング）

`tech.md` で定義した `domain / application / infra` の3層を、  
ディレクトリに以下のように対応させる。

### 6.1 Domain 層

- `packages/domain/src/...`
  - 値オブジェクト（Money, Quantity 等）
  - ドメインサービス（ステートレスなドメインロジック）

### 6.2 Application 層

- `apps/api/src/modules/<context>/<feature>/*.service.ts`  
  ユースケース実装・トランザクション制御

- `apps/web/app/(dashboard)/<feature>/page.tsx`  
  UI層（厳密な Clean Architecture では UI は別扱いだが、本プロジェクトでは Application の一部と見なす）

### 6.3 Infra 層

- `apps/api/src/infrastructure/*`  
  Prisma Repository / 外部APIクライアント

**Prisma スキーマ：**

- `apps/api/prisma/schema.prisma`

**マイグレーション：**

- `apps/api/prisma/migrations/...`

**原則として：**

- Domain 層は Application / Infra には依存しない。
- Application 層は Domain に依存するが、Infra には抽象経由で依存する。
- Infra 層は Domain / Application に依存しうる（実装詳細）。

---

## 7. Naming Conventions

詳細な命名規約は `steering/standards/general.md` を正とし、  
ここでは構造との関係のみを定める。

### 7.1 ディレクトリ・ファイル

- **Context / Feature 名**：`kebab-case`  
  例：`core-platform`, `master-data`, `procurement-flow`, `user-auth`, `supplier-master`

- **TypeScript / TSX**：
  - Reactコンポーネント：`PascalCase.tsx`（例：`PurchaseRequestListPage.tsx`）
  - NestJS クラス：`PascalCase.ts`（例：`PurchaseRequestService.ts`）
  - ユーティリティ：`kebab-case.ts`（例：`date-utils.ts`）

- **DB テーブル**：`snake_case` + 複数形  
  例：`purchase_requests`, `purchase_request_lines`, `suppliers`

### 7.2 型・クラス・関数

- エンティティ：`PascalCase`（`PurchaseRequest`, `Supplier`）
- 値オブジェクト：`PascalCase`（`Money`, `Quantity`）
- サービス：`PascalCase + Service`（`PurchaseRequestService`）
- 関数・変数：`camelCase`（`calculateTax`, `loadPurchaseRequests`）

### 7.3 Spec との対応命名

Feature ディレクトリ名は、spec / api / web / dto で揃える：

- `.kiro/specs/procurement-flow/purchase-request/...`
- `apps/api/src/modules/procurement-flow/purchase-request/...`
- `apps/web/app/(dashboard)/purchase-requests/...`
- `packages/dto/src/procurement-flow/purchase-request.dto.ts`

---

## 8. Path Aliases & Import Patterns

### 8.1 Path Aliases（例）

`tsconfig.base.json` で共通エイリアスを定義する想定：

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@api/*": ["apps/api/src/*"],
      "@web/*": ["apps/web/*"],
      "@shared/dto/*": ["packages/dto/src/*"],
      "@shared/domain/*": ["packages/domain/src/*"],
      "@shared/ui/*": ["packages/ui/src/*"],
      "@config/*": ["packages/config/src/*"]
    }
  }
}
```

### 8.2 Import パターン

**API（NestJS）側の例：**

```typescript
import { PurchaseRequestDto } from '@shared/dto/procurement-flow/purchase-request.dto';
import { Money } from '@shared/domain/money';
import { PurchaseRequestService } from './purchase-request.service';
```

**Web（Next.js）側の例：**

```typescript
import { PurchaseRequestDto } from '@shared/dto/procurement-flow/purchase-request.dto';
import { DataTable } from '@shared/ui/components/data-table';
import { apiClient } from '@web/lib/api-client';
```

**原則：**

- `../../../` のような相対パスは極力避け、エイリアスを利用する。
- DTO / Domain / UI など横断的に使われるものは `@shared/*` 経由で import する。

---

## 9. AI / SDD と構造の関係

### 9.1 Cursor / cc-sdd の利用前提

AI にコードを書かせるときは、必ず以下を Context に含める：

- `.kiro/steering/product.md`
- `.kiro/steering/tech.md`
- `.kiro/steering/structure.md`
- 対象 Feature の `.kiro/specs/<context>/<feature>/requirements.md` / `design.md`

`.cursor/rules` には、構造／禁止事項を明記する：

- 金額計算に `number` を使わない（必ず Decimal を利用する）。
- Prisma 生クエリを安易に書かない（Repository 経由とする）。
- 業務ロジックは `apps/api/src/modules/<context>/<feature>/` 配下に置く。
- UI は `apps/web/app/(dashboard)/<feature>/` 配下に揃え、他の場所に散らさない。

### 9.2 SDD フローと構造

新機能追加時の標準フロー：

1. `.kiro/specs/domain/*.md` に用語・ルールを追加／更新する。
2. `.kiro/specs/<context>/<feature>/requirements.md` を作成／更新する。
3. 同 `design.md`（API・テーブル・DTO・フロー）を作成する。
4. 同 `tasks.md` で作業分解する。
5. `packages/dto` / `packages/domain` に必要な型を追加する。
6. `apps/api` / `apps/web` に Module / Route / UI を実装する。
7. 実装と spec の差分があれば spec を更新して揃える。

この流れに構造を揃えることで、「仕様がコードを支配する」状態を維持する。

---

## 10. Document Patterns, Not File Trees

本ドキュメントは「完成したファイルツリー」を列挙するのではなく、  
**ディレクトリパターンと構造原則** を定義することを目的とする。

新しい Context / Feature / Package を追加する際は、本ドキュメントのパターンに倣い、  
`steering → specs → shared → app` の 4 レイヤ構造と命名規約を崩さないようにする。

新しいパターンが必要になった場合は、まずこの `structure.md` を更新し、  
AI と人間の両方が迷わないようにすること。
