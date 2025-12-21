# Design Review: 社員マスタ

**Review Date**: 2025-12-21T20:34:30.489Z  
**Reviewer**: AI Design Reviewer  
**Feature**: master-data/employee-master

---

## Summary

本設計仕様は、ProcurERPのアーキテクチャ原則と標準に準拠しており、実装に進む準備が整っている。BFF/API/Repositoryの責務分離が明確で、マルチテナント対応と楽観ロックが適切に設計されている。必須項目（Error Policy、Paging正規化、命名規則）がすべて記載されており、要件トレーサビリティも完備されている。軽微な改善点はあるが、実装を阻害する重大な問題は見当たらない。

---

## Critical Issues (≤3)

### Issue 1: キーワード検索の実装詳細が不明確

**Concern**: `ListEmployeesRequest`に`keyword`フィールドが定義されているが、検索対象フィールド（社員コード・氏名・カナ名）のマッチングロジック（部分一致・前方一致・後方一致）が明記されていない。

**Impact**: 実装時に検索ロジックの解釈が分かれ、一貫性のない動作や後方互換性の問題が発生する可能性がある。

**Suggestion**: Service Specificationの「主要ビジネスルール」セクションに、キーワード検索のルールを追加する。例：「keywordが指定された場合、社員コード・社員氏名・社員カナ名のいずれかに部分一致（LIKE '%keyword%'）する条件を追加する」。

**Traceability**: REQ-1.1（社員一覧表示機能）

**Evidence**: design.md "BFF Contracts" → `ListEmployeesRequest` (line 191), "Service Specification" → "主要ビジネスルール" (line 120-137)

---

### Issue 2: BFFエラー定義の不足

**Concern**: Error PolicyはPass-throughと明記されているが、`contracts/bff/errors`にBFF側のエラー定義が記載されていない。Pass-throughの場合でも、BFFが返すエラーの構造（status/code/message）を明示する必要がある。

**Impact**: UI側でエラーハンドリングの実装時に、エラー構造が不明確で型安全性が損なわれる可能性がある。

**Suggestion**: Contracts Summaryに「BFF Error Contracts」セクションを追加し、Pass-throughの場合でもDomain APIエラーをそのまま返すことを明記する。または、`contracts/bff/errors/employee-master-error.ts`の存在と構造を設計に記載する。

**Traceability**: REQ-1.5, REQ-2.5, REQ-2.8, REQ-3.6, REQ-3.9（エラーメッセージ表示）

**Evidence**: design.md "Error Handling" → "Error Policy" (line 79-95), "Contracts Summary" → "Error Codes" (line 301-307)

---

### Issue 3: 権限チェックの実装場所が不明確

**Concern**: Service Specificationに「権限チェック」が記載されているが、BFF層での権限チェックの有無が明記されていない。tech.mdでは「BFFはUX向上のために早期ブロックを行ってよい」とあるが、本設計ではBFFの責務に権限チェックが含まれていない。

**Impact**: 実装時にBFFとAPIの両方で権限チェックを行うべきか、APIのみでよいか判断が分かれる可能性がある。

**Suggestion**: BFF Specificationの「Authentication / Tenant Context」セクションに、権限チェックの方針を追加する。例：「BFFは早期ブロックのため権限チェックを実施するが、最終的な拒否（403）の正本はDomain APIが持つ。BFFでの権限不足は401または403を返すが、Domain APIでも必ず再チェックする」。

**Traceability**: REQ-2.9, REQ-3.10（テナント単位データ取得・更新）

**Evidence**: design.md "Service Specification" → "権限チェック" (line 148-150), "BFF Specification" → "Authentication / Tenant Context" (line 97-100)

---

## Design Strengths

1. **必須項目の完全性**: Error Policy、Paging正規化、命名規則（DTO/DB）、sortByの扱いなど、tech.mdで要求される必須項目がすべて明記されている。実装時に迷いが生じにくい設計となっている。

2. **責務分離の明確性**: UI/BFF/Domain API/Repositoryの責務が明確に分離されており、各レイヤーの役割が理解しやすい。特に、ビジネスルールの正本がDomain APIにあることが明記されており、実装時の判断基準が明確である。

---

## Final Assessment

### Decision: **GO**

### Rationale

本設計仕様は、ProcurERPのアーキテクチャ原則に準拠しており、実装に進む準備が整っている。必須項目がすべて記載され、要件トレーサビリティも完備されている。指摘した3つの改善点は、実装を阻害する重大な問題ではなく、実装フェーズで明確化できる軽微な事項である。マルチテナント対応、楽観ロック、エラーハンドリングなど、重要な設計要素が適切に設計されている。

### Next Steps

1. **設計の改善（推奨）**: 上記3つの改善点をdesign.mdに反映する。特に、キーワード検索のルールとBFFエラー定義は実装前に明確化することが望ましい。

2. **タスク分解へ進む**: 設計が承認されたら、以下のコマンドで実装タスクを生成する：
   ```
   /kiro/spec-tasks master-data/employee-master
   ```

3. **実装開始**: tasks.mdが生成されたら、Contracts実装から開始する（Contracts → DB → Domain API → BFF → UIの順序）。

---

## Interactive Discussion

### キーワード検索について

要件定義では「社員コード・氏名・カナ名の部分一致検索」と記載されていますが、設計では具体的なマッチングロジックが明記されていません。実装時に以下の選択肢があります：

- **部分一致（LIKE '%keyword%'）**: 最も柔軟だが、パフォーマンスに注意が必要
- **前方一致（LIKE 'keyword%'）**: インデックスを活用しやすい
- **全文検索（PostgreSQL Full-Text Search）**: 高度だが実装が複雑

推奨は部分一致ですが、大量データを想定する場合はインデックス戦略（GINインデックス等）も検討が必要です。設計に明記することで、実装時の判断が明確になります。

### BFFエラー定義について

Pass-throughの場合でも、BFFが返すエラーの構造を明示することで、UI側の型安全性が向上します。`contracts/bff/errors/employee-master-error.ts`を作成し、Domain APIエラーをそのまま再エクスポートする形でも構いません。設計に記載することで、実装時の迷いがなくなります。

### 権限チェックについて

tech.mdでは「BFFはUX向上のために早期ブロックを行ってよい」とありますが、本設計ではBFFの責務に権限チェックが含まれていません。実装方針として、BFFで早期チェックを行い、Domain APIで最終チェックを行う二重チェック方式を採用するか、Domain APIのみでチェックするかを明確にすることで、実装時の判断が明確になります。

---

（以上）




