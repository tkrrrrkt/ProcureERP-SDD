# Research & Design Decisions: tax-rate

---

## Summary
- **Feature**: tax-rate（税率マスタ）
- **Discovery Scope**: Simple Addition（標準CRUDマスタ）
- **Key Findings**:
  - 既存マスタ（bank-master等）のパターンを踏襲可能
  - 税率は追加方式で管理（既存レコードの税率値は変更不可）
  - 税区分（TaxBusinessCategory）は初期シードデータとして同時実装

---

## Research Log

### 既存マスタパターンの調査
- **Context**: tax-rate の設計にあたり、既存マスタのパターンを確認
- **Sources Consulted**:
  - `packages/contracts/src/api/bank-master/index.ts`
  - `packages/contracts/src/bff/bank-master/index.ts`
  - `packages/db/prisma/schema.prisma`
- **Findings**:
  - API DTO: offset/limit ベース
  - BFF DTO: page/pageSize ベース
  - 楽観ロック: version カラムで実装
  - 監査カラム: createdAt, updatedAt, createdBy, updatedBy
  - tenant_id + RLS によるマルチテナント分離
- **Implications**: 同一パターンを税率マスタにも適用

### 税率の編集ポリシー
- **Context**: 税制改定時の運用方針
- **Sources Consulted**: `.kiro/specs/spec_doc/61_機能設計検討/01_仕様検討/05_消費税.md`
- **Findings**:
  - 税率改定時は新規レコードを追加
  - 既存レコードの rate_percent は変更不可
  - 過去伝票は当時の税率を参照し続ける
- **Implications**:
  - 税率コード・税率値は編集不可（読み取り専用）
  - 適用期間・有効フラグのみ編集可能

### 税区分シードデータ
- **Context**: 税区分は画面なし、初期データのみ
- **Sources Consulted**: `.kiro/specs/spec_doc/61_機能設計検討/02_エンティティ定義/05_消費税.md`
- **Findings**:
  - 6種類の税区分（課税売上、課税仕入、共通課税仕入、非課税、免税、対象外）
  - テナントごとにシードデータを投入
- **Implications**: マイグレーション＋シードスクリプトで対応

---

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| 標準CRUDパターン | 既存マスタと同一構成 | 一貫性、実装効率 | なし | 採用 |

---

## Design Decisions

### Decision: 税率値の編集不可
- **Context**: 税制改定対応と過去伝票の整合性
- **Alternatives Considered**:
  1. 税率値を編集可能にする → 過去伝票の整合性が壊れる
  2. 税率値を編集不可にし、新規追加で対応 → 採用
- **Selected Approach**: 税率コード・税率値は登録後に編集不可
- **Rationale**: 過去伝票が参照する税率が変わらないことを保証
- **Trade-offs**: 誤入力時は新規レコードを作成し直す必要あり

### Decision: 税区分の実装方式
- **Context**: 税区分は画面なし、参照専用
- **Alternatives Considered**:
  1. 別機能として分離 → オーバーヘッド
  2. tax-rate の一部として実装 → 採用
- **Selected Approach**: DBマイグレーション＋シードを tax-rate タスクに含める
- **Rationale**: 税コード機能が税区分を参照するため、先行して実装が必要

---

## Risks & Mitigations
- **Risk**: 税率の重複登録 → UNIQUE制約（tenant_id, tax_rate_code）で防止
- **Risk**: 適用期間の重複 → DB制約ではなくバリデーションで警告（同一税率%で期間重複は許可）

---

## References
- [消費税仕様概要](.kiro/specs/spec_doc/61_機能設計検討/01_仕様検討/05_消費税.md)
- [消費税エンティティ定義](.kiro/specs/spec_doc/61_機能設計検討/02_エンティティ定義/05_消費税.md)
- [bank-master contracts](packages/contracts/src/api/bank-master/index.ts) — 既存パターン参照
