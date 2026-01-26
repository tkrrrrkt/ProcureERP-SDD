# Research & Design Decisions: bank-master

---
**Purpose**: 銀行マスタ・支店マスタ機能の設計判断とリサーチ結果を記録する。

---

## Summary
- **Feature**: `bank-master`
- **Discovery Scope**: Simple Addition（CRUD/マスタ管理）
- **Key Findings**:
  - 既存の employee-master パターンを踏襲可能
  - 銀行・支店の親子関係（1:N）を考慮した設計が必要
  - インクリメンタル検索はクライアントサイドのdebounce + サーバーサイドの部分一致検索で実現

## Research Log

### 既存マスタパターンの調査
- **Context**: ProcurERPにおける既存のマスタ管理機能のパターンを確認
- **Sources Consulted**:
  - `.kiro/specs/master-data/employee-master/design.md`
  - `packages/contracts/src/bff/employee-master/index.ts`
  - `packages/contracts/src/api/employee-master/index.ts`
- **Findings**:
  - BFF: page/pageSize（1-based）→ API: offset/limit（0-based）の変換パターンが確立
  - 楽観ロック（version）による競合制御
  - Error Policy は Option A: Pass-through を採用
  - DTO命名はcamelCase、DB列名はsnake_case
  - 監査列（createdAt, updatedAt, createdBy, updatedBy）を含む
- **Implications**: 銀行マスタも同一パターンで実装可能

### 銀行・支店の親子関係
- **Context**: 銀行と支店の1:N関係をどう扱うか
- **Sources Consulted**:
  - `.kiro/specs/spec_doc/61_機能設計検討/02_エンティティ定義/04_共通・銀行・倉庫.md`
- **Findings**:
  - 支店は必ず銀行に紐づく（bank_id必須）
  - 支店一覧は銀行詳細画面内のタブとして表示
  - 銀行無効化時、紐づく支店への影響を警告表示
- **Implications**:
  - 支店一覧APIはbank_idをパスパラメータとして受け取る設計
  - 銀行無効化時の支店存在チェックをDomain APIで実装

### インクリメンタル検索の実装方針
- **Context**: カナ検索でリアルタイム絞り込みを実現する方法
- **Sources Consulted**: 一般的なWebアプリケーションパターン
- **Findings**:
  - クライアントサイド: debounce（300ms程度）でAPIコール頻度を抑制
  - サーバーサイド: ILIKE '%keyword%' による部分一致検索
  - 半角カナへの正規化はBFF層で実施
- **Implications**:
  - BFF層でkeywordのtrim・正規化を実施
  - API層は正規化済みのkeywordを受け取る前提

### 選択モーダルの設計
- **Context**: 支払先口座登録時の銀行・支店選択UIパターン
- **Sources Consulted**: 要件定義書（Requirement 9, 10）
- **Findings**:
  - 銀行選択モーダル → 支店選択モーダル の連続フロー
  - 有効な銀行・支店のみを候補として表示（is_active=true）
  - 銀行選択後、自動的に支店選択モーダルを表示
- **Implications**:
  - 選択モーダル用のAPIエンドポイントは一覧APIと共用（isActiveフィルタで絞り込み）
  - UIコンポーネントとして BankSelectModal / BranchSelectModal を定義

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| employee-master踏襲 | 既存のマスタ管理パターンをそのまま適用 | 一貫性、実績あり、学習コスト低 | 特になし | **採用** |
| 銀行・支店を別Feature | 銀行と支店を別々のFeatureとして管理 | 独立性 | 一体運用が前提なので分離メリット少 | 不採用 |

## Design Decisions

### Decision: 銀行・支店を同一Featureで管理
- **Context**: 銀行と支店は密接に関連しており、一体として管理される
- **Alternatives Considered**:
  1. 同一Feature（bank-master）で管理
  2. 別Feature（bank-master, bank-branch-master）に分離
- **Selected Approach**: 同一Featureで管理
- **Rationale**:
  - 支店は常に銀行に紐づき、単独での存在意義がない
  - UI上も銀行詳細画面内のタブとして支店を表示
  - 運用上も一体として扱われる
- **Trade-offs**: Feature内の複雑性は増すが、凝集度が高い設計となる
- **Follow-up**: なし

### Decision: Error Policy は Option A: Pass-through を採用
- **Context**: BFFにおけるエラーハンドリング方針
- **Alternatives Considered**:
  1. Option A: Pass-through（Domain APIエラーを透過）
  2. Option B: Minimal shaping（最小限の整形）
- **Selected Approach**: Option A: Pass-through
- **Rationale**:
  - 銀行マスタはシンプルなCRUD操作
  - Domain APIのエラーをそのままUIに伝えることで十分
  - employee-master と同一方針で一貫性を保つ
- **Trade-offs**: UIでのエラー表示制御が必要だが、BFFの複雑性を抑えられる
- **Follow-up**: なし

### Decision: 選択モーダル用APIは一覧APIと共用
- **Context**: 銀行・支店選択モーダル用のAPIをどう設計するか
- **Alternatives Considered**:
  1. 一覧APIと共用（isActiveフィルタで絞り込み）
  2. 選択モーダル専用APIを新設
- **Selected Approach**: 一覧APIと共用
- **Rationale**:
  - 一覧APIにisActiveフィルタを追加するだけで対応可能
  - 専用API新設は過剰な複雑性
  - 一覧と選択モーダルで同じデータを扱う
- **Trade-offs**: 一覧APIのレスポンスサイズが選択モーダルには過剰な場合があるが、許容範囲
- **Follow-up**: パフォーマンス問題が発生した場合は軽量APIを検討

## Risks & Mitigations
- **銀行・支店数が大量になった場合のパフォーマンス** — ページネーション必須、インデックス設計で対応
- **インクリメンタル検索のサーバー負荷** — クライアントサイドのdebounceで緩和
- **全銀協マスタ同期時のデータ移行** — 将来対応。現時点では手動登録のみ

## References
- [ProcurERP tech.md](.kiro/steering/tech.md) — 技術方針
- [ProcurERP structure.md](.kiro/steering/structure.md) — 構造・責務分離
- [employee-master design.md](.kiro/specs/master-data/employee-master/design.md) — 参照パターン
- [エンティティ定義 04_共通・銀行・倉庫.md](.kiro/specs/spec_doc/61_機能設計検討/02_エンティティ定義/04_共通・銀行・倉庫.md) — データモデル定義
