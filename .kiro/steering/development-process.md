# development-process.md

## CCSDD × v0 × Cursor 開発プロセス定義書（完全版）

---

## 0. 本ドキュメントの位置づけ

本ドキュメントは、**業務系SaaS（EPM想定）を CCSDD（Contract-Centered Specification Driven Development）前提で、v0 と Cursor を組み合わせて破綻なく開発するための「開発プロセス憲法」**である。

* 本書は `.kiro/steering/` 配下に配置される**正本（SSoT）**である
* すべての Feature 開発・AI実装・レビューは本書に従う
* **仕様（Spec）が常に正**であり、実装は従属物とする
* 人・AI・ツールが混在しても構造と責務が崩れないことを最優先とする

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
Tasks（Gate + 手順）
  ↓
Scaffold（構造を先に固定）
  ↓
v0 UI生成（隔離）
  ↓
受入チェック（Structure Guard）
  ↓
移植（Migration）
  ↓
実装・拡張
```

* Contracts-first（UIより先に契約を確定）
* v0は「実装」ではなく「生成素材」として扱う

---

## 2. 全体STEPサマリ（IN / TOOL / OUT）

| STEP | 名称         | 主なIN        | 主なツール            | 主なOUT                 |
| ---- | ---------- | ----------- | ---------------- | --------------------- |
| 0    | プロジェクト憲法定義 | 事業構想・思想     | 手動 / AI          | steering/*.md         |
| 1    | 要求定義       | 業務要求        | Kiro             | requirements.md       |
| 2    | 設計         | 要求 / Domain | Kiro             | design.md / contracts |
| 3    | 構造固定       | design.md   | scripts          | Feature骨格             |
| 4    | UI生成       | design.md   | v0               | _v0_drop              |
| 5    | 受入検証       | v0出力        | structure-guards | Guard OK              |
| 6    | 移植         | v0出力        | v0-migrate       | feature/ui            |
| 7    | 実装         | tasks.md    | Cursor           | 実装コード                 |

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

### 成果物

* `.kiro/specs/<context>/<feature>/requirements.md`

---

## STEP2：設計（Design）

### 目的

* **UIより先に Contract と責務境界を確定する**

### 必須構成（design.md）

* Architecture Overview
* Architecture Responsibilities（Mandatory）

  * BFF Specification
  * Service Specification
  * Repository Specification
* Contracts Summary（BFF / API / Enum / Error）
* トランザクション境界
* 監査・RLS前提

### 成果物

* `.kiro/specs/<context>/<feature>/design.md`
* `packages/contracts/` 更新

---

## STEP3：構造固定（Scaffold）

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

## STEP4：UI生成（v0）

### 目的

* Contract準拠のUIを高速生成する

### ルール

* 出力先は必ず隔離

```
apps/web/_v0_drop/<context>/<feature>/
```

* Domain API 直呼び出し禁止
* business logic 禁止
* BFF 前提で生成

---

## STEP5：受入チェック（Structure Guard）

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
* v0_drop 内の違反検出

---

## STEP6：移植（Migration）

### 目的

* v0生成物を安全に本実装へ移植する

### 実行コマンド

```bash
npx tsx scripts/v0-migrate.ts <context> <feature>
```

* 上書きは `--force` 明示時のみ許可

---

## STEP7：実装（Implementation）

### 目的

* Spec と Tasks に従い実装する

### 原則

* 実装は `tasks.md` に従う
* Repository は tenant_id 必須
* UI は BFF Client 経由のみ

---

## 4. Tasks.md による実装制御（重要）

### 役割

* 実装開始の Gate
* v0 利用可否の判断基準
* Scaffold → v0 → Guard → Migrate の順序制御

### Design Completeness Gate

* design.md が未完成の場合、**一切実装不可**

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

* Spec が正、コードは従属
* 判断は ADR に残す
* AI は速くする道具であり、設計責任者ではない

---

（以上）
