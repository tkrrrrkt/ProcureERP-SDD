# development-process.md

## CCSDD × v0 × Cursor 開発プロセス定義書（完全版）

---

## 0. 本ドキュメントの位置づけ

本ドキュメントは、**業務系SaaS（ProcurERP）を CCSDD（Contract-Centered Specification Driven Development）前提で、v0 と Cursor を組み合わせて破綻なく開発するための「開発プロセス憲法」**である。

* 本書は `.kiro/steering/` 配下に配置される**正本（SSoT）**である
* すべての Feature 開発・AI実装・レビューは本書に従う
* **仕様（Spec）が常に正**であり、実装は従属物とする
* 人・AI・ツールが混在しても構造と責務が崩れないことを最優先とする

## 0.1 Principles（MUST）

本プロジェクトにおける開発順序・責務境界は、すべてのFeature・すべてのAI/実装者に対して拘束力を持つ。

### Core Ordering（Contracts-first）

- すべてのfeatureは **contracts（bff → api → shared）を先に確定**してから DB/実装に進む。
- tasks.md は必ず以下の順で並べる：
  1) Decisions
  2) Contracts（bff → api → shared）
  3) DB/Migration/RLS
  4) Domain API
  5) BFF
  6) UI（最後）

### v0 UI Generation（Two-Phase）

- Phase 1（統制テスト）：
  - 目的：境界/契約/Design System準拠の検証（見た目完成は目的外）
  - 出力先：`apps/web/_v0_drop/<context>/<feature>/src`
  - MockBffClientで動作確認（BFF未接続）
  - structure-guards を必ず通す
- Phase 2（本実装）：
  - v0出力を features に移植
  - HttpBffClient 実装・実BFF接続
  - URL state / debounce / E2E などを追加

---

## 1. 開発思想（合意済み原則）

### 1.1 基本思想

* **Spec（仕様）が Single Source of Truth（SSoT）**
* 実装は Spec に従属し、逆転を許さない
* AIは「判断主体」ではなく「開発を加速する道具」
* 壊れやすい部分（境界・構造・契約）は**コードとスクリプトで強制**する
* 壊れにくい部分（方針・思想・誘導）は**ルール文書で定義**する

### 1.2 採用する開発モデル（CCSDD）

```
Requirements
  ↓
Design（Architecture / Responsibilities / Contracts）
  ↓
Design Review（GO/NO-GO判定）
  ↓
Tasks（Gate + 手順）
  ↓
Contracts 実装
  ↓
Scaffold（構造を先に固定）
  ↓
v0 Prompt 作成
  ↓
v0 UI生成（隔離）
  ↓
受入チェック（Structure Guard）
  ↓
移植（Migration）
  ↓
Backend 実装（API / BFF）
  ↓
統合テスト
```

* Contracts-first（UIより先に契約を確定）
* v0は「実装」ではなく「生成素材」として扱う

---

## 2. 全体STEPサマリ（IN / TOOL / OUT）

| STEP | 名称              | 主なIN                | 主なツール            | 主なOUT                       |
| ---- | ----------------- | --------------------- | -------------------- | ----------------------------- |
| 0    | プロジェクト憲法定義 | 事業構想・思想         | 手動 / AI            | steering/*.md                 |
| 1    | 要求定義           | 業務要求              | Kiro / Cursor        | requirements.md               |
| 2    | 設計              | requirements.md       | Kiro / Cursor        | design.md                     |
| 3    | 設計レビュー       | design.md             | Cursor / 人間        | design-review.md (GO/NO-GO)   |
| 4    | タスク分解         | design.md (GO判定済)  | Kiro / Cursor        | tasks.md                      |
| 5    | Contracts実装     | design.md             | Cursor               | packages/contracts/           |
| 6    | 構造固定           | design.md             | scaffold-feature.ts  | Feature骨格                   |
| 7    | v0 Prompt作成     | design.md, contracts  | Cursor               | v0-prompt.md                  |
| 8    | UI生成            | v0-prompt.md          | v0                   | _v0_drop/.../src              |
| 9    | v0ファイル取得     | v0 URL                | v0-fetch.sh          | _v0_drop/.../src              |
| 10   | 受入検証           | v0出力                | structure-guards.ts  | Guard PASS                    |
| 11   | 移植              | v0出力 (PASS済)       | v0-migrate.ts        | features/                     |
| 12   | Backend実装       | tasks.md, contracts   | Cursor               | apps/api, apps/bff            |
| 13   | 統合テスト         | 実装コード            | Cursor / 人間        | 動作確認完了                   |

---

## 3. STEP別 詳細定義

---

## STEP0：プロジェクト憲法定義（Steering）

### 目的

* 全 Feature 共通の**思想・構造・非交渉ルール**を確定する
* 人・AI・ツールが同一前提で動作できる状態を作る

### 正本ファイル（SSoT）

* `.kiro/steering/product.md`（プロダクト方針・ロードマップ）
* `.kiro/steering/tech.md`（技術憲法・非交渉ルール）
* `.kiro/steering/structure.md`（構造・責務分離ルール）
* `.kiro/steering/v0-workflow.md`（v0隔離・受入・移植ルール）
* `.kiro/steering/v0-prompt-template.md`（v0プロンプト雛形）
* `.kiro/steering/development-process.md`（本書）

### 完了条件（DoD）

* 上記ファイルが存在し、相互に矛盾がない
* Feature 開発時の参照先が明確

---

## STEP1：要求定義（Requirements）

### 目的

* 「何を実現するか」を曖昧さなく定義する

### ルール

* EARS / Given-When-Then 形式で記述
* UIや技術都合は書かない
* ビジネス要求に集中する
* 各要件に一意のID（1.1, 1.2, 2.1, 2.2...）を付与

### 成果物

* `.kiro/specs/<context>/<feature>/requirements.md`

### 参照テンプレート

* `.kiro/settings/templates/specs/requirements.md`

---

## STEP2：設計（Design）

### 目的

* **UIより先に Contract と責務境界を確定する**

### 必須構成（design.md）

* Architecture Overview
* Architecture Responsibilities（Mandatory）
  * BFF Specification（Endpoints, Paging正規化, Error Policy）
  * Service Specification（Transaction境界, 監査ポイント）
  * Repository Specification（tenant_id double-guard）
* Contracts Summary（BFF / API / Enum / Error）
* トランザクション境界
* 監査・RLS前提
* Requirements Traceability

### 必須記載事項（省略禁止）

* DTO 命名: camelCase
* DB カラム: snake_case
* sortBy: DTO キー名を使用
* Error Policy: Pass-through または Minimal shaping を選択
* Paging 正規化: BFF で page/pageSize → offset/limit 変換

### 成果物

* `.kiro/specs/<context>/<feature>/design.md`

### 参照テンプレート

* `.kiro/settings/templates/specs/design.md`

---

## STEP3：設計レビュー（Design Review）

### 目的

* 設計品質を確認し、実装可否（GO/NO-GO）を判断する

### レビュー観点

* 既存アーキテクチャとの整合性
* 設計の一貫性と標準準拠
* 拡張性と保守性
* 型安全性とインターフェース設計

### ルール

* Critical Issues は最大 3 件に絞る
* 各 Issue に Traceability（要件ID）と Evidence（design.md のセクション）を記載
* GO 判定の場合のみ次 STEP へ進む
* NO-GO の場合は STEP 2 へ戻り design.md を修正

### 成果物

* `.kiro/specs/<context>/<feature>/design-review.md`

### 参照ルール

* `.kiro/settings/rules/design-review.md`

---

## STEP4：タスク分解（Tasks）

### 目的

* 実装手順を明確化し、Gate を設定する

### ルール

* Design Review で GO 判定後のみ作成可
* 必ず Contracts-first 順序で記載：
  1) Design Completeness Gate
  2) Decisions
  3) Contracts（bff → api → shared）
  4) DB / Migration / RLS
  5) Domain API（apps/api）
  6) BFF（apps/bff）
  7) UI（apps/web）
* 各タスクに `_Requirements: X.X_` でトレーサビリティを記載
* 並列可能なタスクには `(P)` マーカーを付与

### 成果物

* `.kiro/specs/<context>/<feature>/tasks.md`

### 参照テンプレート

* `.kiro/settings/templates/specs/tasks.md`

---

## STEP5：Contracts 実装

### 目的

* UI/BFF/API 間の契約を先に確定する

### 実装順序（必須）

1. `packages/contracts/src/bff/<feature>/index.ts`（最初）
2. `packages/contracts/src/api/<feature>/index.ts`
3. `packages/contracts/src/api/errors/<feature>-error.ts`
4. `packages/contracts/src/api/errors/index.ts`（export 追加）

### ルール

* BFF DTO: page/pageSize（1-based）
* API DTO: offset/limit（0-based）
* Error Codes を定義

### 成果物

* `packages/contracts/src/bff/<feature>/index.ts`
* `packages/contracts/src/api/<feature>/index.ts`
* `packages/contracts/src/api/errors/<feature>-error.ts`

---

## STEP6：構造固定（Scaffold）

### 目的

* v0 や実装が迷い込む余地を排除する

### 実行コマンド

```bash
npx tsx scripts/scaffold-feature.ts <context> <feature>
```

### 作成される骨格

* `apps/web/src/features/<context>/<feature>/`
* `apps/bff/src/modules/<context>/<feature>/`
* `apps/api/src/modules/<context>/<feature>/`
* `apps/web/_v0_drop/<context>/<feature>/`

---

## STEP7：v0 Prompt 作成

### 目的

* v0 に渡すプロンプトを作成する

### 入力

* `.kiro/specs/<context>/<feature>/design.md`
* `packages/contracts/src/bff/<feature>/index.ts`
* `.kiro/steering/v0-prompt-template.md`

### ルール

* v0-prompt-template.md の `<...>` を埋める
* BFF Specification を完全に記載
* 禁止事項を明記：
  * layout.tsx 生成禁止
  * 生カラーリテラル禁止
  * 直接 fetch 禁止
  * 基盤 UI コンポーネント作成禁止

### 成果物

* `.kiro/specs/<context>/<feature>/v0-prompt.md`

---

## STEP8：UI生成（v0）

### 目的

* Contract準拠のUIを高速生成する

### ルール

* v0.dev で v0-prompt.md の内容を貼り付け
* 生成結果を確認し、必要に応じて修正を依頼
* 完成したら URL を控える

### 出力

* v0 生成コード（v0.dev 上）
* v0 Chat URL

---

## STEP9：v0 ファイル取得

### 目的

* v0 生成物をローカルの隔離ゾーンに取得する

### 実行コマンド

```bash
./scripts/v0-fetch.sh '<v0_url>' '<context>/<feature>'
```

### 出力先（隔離ゾーン）

```
apps/web/_v0_drop/<context>/<feature>/src/
├── components/
├── api/
│   ├── BffClient.ts
│   ├── MockBffClient.ts
│   └── HttpBffClient.ts
├── page.tsx
└── OUTPUT.md
```

### ルール

* `apps/web/src` には直接配置しない
* 必ず `_v0_drop/.../src/` に格納

---

## STEP10：受入チェック（Structure Guard）

### 目的

* ルール違反を人の注意に依存せず検出する

### 実行コマンド

```bash
npx tsx scripts/structure-guards.ts
```

### 主な検出内容

* UI → Domain API 直接呼び出し禁止
* UI direct fetch 禁止
* UI による `contracts/api` 参照禁止
* BFF の DB 直アクセス禁止
* layout.tsx 存在禁止
* 生カラーリテラル禁止
* v0_drop 内の違反検出

### ルール

* 全 Guard が PASS するまで次 STEP に進まない
* 違反発見時は手動修正後、再実行

---

## STEP11：移植（Migration）

### 目的

* v0生成物を安全に本実装へ移植する

### 実行コマンド

```bash
npx tsx scripts/v0-migrate.ts <context> <feature>
```

### 移植先

```
apps/web/src/features/<context>/<feature>/
```

### 移植後の修正（必須）

1. import パス修正（`@/shared/ui` を使用）
2. DTO import 修正（`@contracts/bff/<feature>` を使用）
3. App Router 登録（`apps/web/src/app/<context>/<feature>/page.tsx`）
4. Navigation 登録（`apps/web/src/shared/navigation/menu.ts`）

### ルール

* 上書きは `--force` 明示時のみ許可
* MockBffClient で画面が動作することを確認

---

## STEP12：Backend 実装（API / BFF）

### 目的

* Domain API と BFF を実装し、実データで動作させる

### 実装順序（必須）

1. Prisma Schema 更新
2. Migration 実行
3. Domain API Repository（tenant_id double-guard 必須）
4. Domain API Service
5. Domain API Controller
6. Domain API Module
7. BFF Mapper
8. BFF Domain API Client
9. BFF Service（page/pageSize → offset/limit 変換）
10. BFF Controller
11. BFF Module
12. UI で HttpBffClient に切替

### 成果物

* `apps/api/src/modules/<context>/<feature>/`
* `apps/bff/src/modules/<context>/<feature>/`
* `packages/db/prisma/schema.prisma`（更新）

---

## STEP13：統合テスト

### 目的

* 全レイヤーが正しく連携することを確認する

### 確認項目

* CRUD 全操作が動作する
* tenant_id によるフィルタが効いている
* エラーハンドリングが正しい
* ページネーションが動作する
* ソートが動作する

### 成果物

* tasks.md の全タスク完了

---

## 4. Tasks.md による実装制御（重要）

### 役割

* 実装開始の Gate
* v0 利用可否の判断基準
* Contracts → Scaffold → v0 → Guard → Migrate の順序制御

### Design Completeness Gate

* design.md が未完成の場合、**一切実装不可**
* design-review.md で GO 判定がない場合、**一切実装不可**

---

## 5. Cursor Rule の扱い（結論）

### 方針

* Cursor Rule には**最低限の境界ルールのみ**を記載
* 強制は scripts、誘導は rule

### Rule に含める内容

* UI → BFF ONLY
* `contracts/api` UI参照禁止
* v0隔離ルール
* direct fetch 禁止
* ファイル配置ルール

### 含めない内容

* 実装詳細
* ビジネスロジック
* タスク手順

---

## 6. 本プロセスで得られた成果

* CCSDD / SDD が実運用レベルで定義済み
* v0 を安全に使える仕組みが完成
* Cursor に依存しない再現性
* Feature を同一プロセスで量産可能

---

## 7. 最重要原則（再掲）

1. **Spec が正、コードは従属**
2. **Contracts-first**: UI より先に契約を確定
3. **v0 は隔離**: 直接 src に入れない
4. **境界を守る**: UI → BFF → API → DB
5. **tenant_id double-guard**: Repository + RLS
6. **判断は ADR に残す**
7. **AI は速くする道具であり、設計責任者ではない**

---

## 8. 関連ドキュメント

* **詳細な実践ガイド**: `doc/DEVELOPMENT_PROCESS_GUIDE.md`
  * 各 STEP の詳細手順
  * Cursor / Kiro への指示プロンプト集
  * コマンド一覧
  * ファイル配置早見表

---

（以上）
