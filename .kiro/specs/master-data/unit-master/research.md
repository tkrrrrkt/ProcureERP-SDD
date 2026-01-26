# Research & Design Decisions: 単位マスタ（Unit Master）

---

## Summary

- **Feature**: `unit-master`
- **Discovery Scope**: Simple Addition（既存マスタパターンの拡張）
- **Key Findings**:
  1. employee-master パターンを基にした標準CRUDマスタ構造を採用
  2. 循環参照（UomGroup ↔ Uom）は PostgreSQL DEFERRABLE 制約で解決
  3. 品目使用チェックは Repository レイヤーで実装

---

## Research Log

### 既存マスタパターンの分析

- **Context**: 単位マスタの設計にあたり、既存の employee-master パターンを参照
- **Sources Consulted**:
  - `.kiro/specs/master-data/employee-master/design.md`
  - `packages/contracts/src/bff/employee-master/index.ts`
  - `apps/api/src/modules/master-data/employee-master/`
- **Findings**:
  - BFF/API契約分離パターンが確立済み
  - page/pageSize（BFF）→ offset/limit（API）変換はBFF責務
  - Error Policyは Pass-through を標準採用
  - 楽観ロック（version）は全マスタで標準
- **Implications**: employee-master パターンを踏襲し、2エンティティ（UomGroup/Uom）に拡張

### 循環参照の解決方法

- **Context**: uom_groups.base_uom_id → uoms.id かつ uoms.uom_group_id → uom_groups.id の循環参照
- **Sources Consulted**:
  - PostgreSQL公式ドキュメント: DEFERRABLE Constraints
  - `.kiro/specs/spec_doc/61_機能設計検討/02_エンティティ定義/09_単位・単位グループ.md`
- **Findings**:
  - PostgreSQL の DEFERRABLE INITIALLY DEFERRED 制約を使用
  - トランザクション内で両エンティティのUUIDを事前確定
  - コミット時にFK整合性を検証
- **Implications**:
  - CreateUomGroup は単一トランザクション内で UomGroup + Uom を同時作成
  - Prisma の $transaction を使用

### 品目使用チェックの実装方針

- **Context**: Requirement 8.4 - 品目で使用中の単位は無効化禁止
- **Sources Consulted**:
  - `.kiro/specs/spec_doc/61_機能設計検討/02_エンティティ定義/09_単位・単位グループ.md` §3.1
- **Findings**:
  - items.base_uom_id と items.purchase_uom_id の2フィールドをチェック
  - MVP段階では伝票明細のチェックは不要（品目マスタのみ）
  - 単位マスタ側のRepositoryでチェックメソッドを提供
- **Implications**:
  - `UomRepository.isUsedByItems(tenantId, uomId)` を実装
  - 将来の伝票連携時に拡張可能な設計

---

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| employee-master拡張 | 既存パターンを2エンティティに拡張 | 一貫性、学習コスト低 | エンドポイント数増加 | **採用** |
| 単一エンドポイント | グループと単位を1つのAPIでまとめる | エンドポイント削減 | 複雑性増、責務混在 | 不採用 |
| ネストリソース | /groups/:id/uoms のようなネスト構造 | RESTful | BFF正規化が複雑化 | 検討継続（V2） |

---

## Design Decisions

### Decision: エンドポイント構造

- **Context**: 2エンティティ（UomGroup/Uom）のAPI設計
- **Alternatives Considered**:
  1. 完全分離（/groups, /uoms）
  2. ネスト（/groups/:id/uoms）
  3. 混合（/groups, /groups/:id/uoms, /uoms）
- **Selected Approach**: 完全分離方式
- **Rationale**:
  - BFFでの正規化が単純
  - 単位一覧は全グループ横断検索も必要（groupIdフィルタで対応）
  - employee-master パターンとの一貫性
- **Trade-offs**:
  - エンドポイント数は多くなる（13エンドポイント）
  - グループと単位の関連は groupId パラメータで明示
- **Follow-up**: V2でネスト構造への移行を検討可能

### Decision: 基準単位同時作成

- **Context**: 単位グループ作成時に基準単位を必須とする仕様
- **Alternatives Considered**:
  1. 基準単位を先に作成 → グループ作成（2ステップ）
  2. グループと基準単位を同時作成（1トランザクション）
  3. 基準単位を後から設定可能（nullable）
- **Selected Approach**: 同時作成（1トランザクション）
- **Rationale**:
  - エンティティ定義で base_uom_id は NOT NULL
  - UX観点で1画面で完結させたい
  - DEFERRABLE 制約で技術的に実現可能
- **Trade-offs**:
  - CreateUomGroupRequest が複雑化（baseUomCode, baseUomName を含む）
  - トランザクション管理が必要
- **Follow-up**: Prisma $transaction の動作検証

### Decision: isBaseUom フラグの算出責務

- **Context**: 単位が基準単位かどうかの表示
- **Alternatives Considered**:
  1. DBに is_base_uom カラムを持つ
  2. BFF で算出（groupの baseUomId と比較）
  3. APIで算出してレスポンスに含める
- **Selected Approach**: BFF で算出
- **Rationale**:
  - DB正規化を維持（冗長データ回避）
  - base_uom_id 変更時のデータ不整合リスク回避
  - BFF はグループ情報も取得可能な位置
- **Trade-offs**: BFFの処理が若干複雑化
- **Follow-up**: 一覧取得時のN+1問題に注意（JOINで解決）

---

## Risks & Mitigations

- **循環参照によるデータ不整合** — DEFERRABLE 制約と単一トランザクション管理で対応
- **品目使用チェックのパフォーマンス** — items テーブルに適切なインデックス（base_uom_id, purchase_uom_id）を設定
- **楽観ロック競合頻度** — マスタデータは更新頻度が低いため問題なし。UI側でリトライガイダンスを表示

---

## References

- [PostgreSQL DEFERRABLE Constraints](https://www.postgresql.org/docs/current/sql-set-constraints.html) — 循環参照の解決方法
- `.kiro/specs/spec_doc/61_機能設計検討/02_エンティティ定義/09_単位・単位グループ.md` — エンティティ定義の正本
- `.kiro/specs/master-data/employee-master/design.md` — 参考パターン
