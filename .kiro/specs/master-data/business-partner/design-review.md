# Design Review: master-data/business-partner

**Reviewed Date**: 2026-01-11
**Reviewer**: Claude Code (kiro:validate-design)
**Design Phase**: design-generated
**Requirements Approval**: ✅ Approved

---

## Design Review Summary

技術設計は全体的に要件を満たし、既存のemployee-masterパターンを適切に踏襲しています。5エンティティの複雑性に対して明確な責務分離（Service/Repository層）と堅牢なトランザクション設計が提案されています。ただし、いくつかの重要な実装詳細が不明確であり、実装時の判断ミスや整合性リスクが残ります。

---

## Critical Issues

### 🔴 Critical Issue 1: Payee自動生成の検索条件が不明確

**Concern**: design.mdでは「同一party_id + supplier_sub_codeのPayeeを検索」と記載されていますが（5.2.1節）、実際のPayeeテーブルにはsupplier_sub_code列が存在しません。Payeeはpayee_sub_codeを持ち、これとsupplier_sub_codeが一致することを前提としていますが、この対応関係の検証ロジックが明示されていません。

**Impact**: SupplierSite作成時に誤った既存Payeeを紐づける、または意図せず重複Payeeを作成するリスクがあります（Requirement 2.6-2.8違反）。

**Suggestion**: `PayeeService.findOrCreate()` の検索条件を明確化してください。具体的には：
```typescript
// design.md 5.2.1節に追記
async findOrCreate(params: {
  tenantId: string;
  partyId: string;
  payeeSubCode: string; // supplier_sub_codeと同一値で検索
  // ...
}): Promise<{ payeeId: string }> {
  // WHERE tenant_id = ? AND party_id = ? AND payee_sub_code = ?
  const existing = await this.payeeRepository.findByCompositeKey(
    tenantId, partyId, payeeSubCode
  );
  // ...
}
```

**Traceability**: Requirement 2.6-2.8, 13.1-13.4

**Evidence**: design.md 5.2.1節 (IPayeeService), design.md 8節 (Mermaid図 - Payee自動生成フロー)

---

### 🔴 Critical Issue 2: 派生フラグ更新の失敗時ロールバック戦略が未定義

**Concern**: SupplierSite/CustomerSite作成・削除時に `updateDerivedFlags()` を呼び出すことは明記されていますが（5.1.1節）、この更新が失敗した場合のトランザクション全体のロールバック方針が不明です。特に、Site削除時にフラグ更新が失敗した場合、Site削除だけが成功してフラグが不整合になる可能性があります。

**Impact**: is_supplier/is_customerフラグとSite存在の整合性が崩れ、Party一覧の絞り込みが正しく機能しなくなります（Requirement 7.1-7.6違反）。

**Suggestion**: トランザクション境界を明確化してください：
```typescript
// design.md 5.1.1節に追記
async delete(id: string, version: number, userId: string): Promise<void> {
  return this.prisma.$transaction(async (tx) => {
    const site = await this.supplierSiteRepository.findById(id, tx);
    await this.supplierSiteRepository.delete(id, version, userId, tx);
    // 派生フラグ更新も同一トランザクション内で実施
    await this.partyService.updateDerivedFlags(site.partyId, tx);
    // いずれかが失敗した場合、全体をロールバック
  });
}
```

**Traceability**: Requirement 7.1-7.6

**Evidence**: design.md 5.1.1節 (IPartyService.updateDerivedFlags), research.md Decision: 派生フラグ更新タイミング

---

### 🔴 Critical Issue 3: normalizeBusinessCodeのテナント設定取得方法が未定義

**Concern**: コード正規化ユーティリティ（7.5節）は `mode: 'numeric' | 'alphanumeric'` を引数で受け取る設計ですが、このモード値をどのように取得するか（テナント設定テーブル読み込み？環境変数？ハードコード？）が明記されていません。

**Impact**: 実装者がテナント設定を無視してハードコード（常に'alphanumeric'）する可能性があり、数字のみモードのテナントでコード入力に失敗します（Requirement 6.1-6.4違反）。

**Suggestion**: テナント設定の取得方法を明確化してください：
```typescript
// design.md 7.5節に追記
// Option A: TenantConfigServiceから取得（推奨）
const mode = await this.tenantConfigService.getCodeNormalizationMode(tenantId);
const normalized = normalizeBusinessCode(rawCode, mode);

// Option B: 環境変数（全テナント統一の場合のみ）
const mode = process.env.CODE_NORMALIZATION_MODE as 'numeric' | 'alphanumeric';
```

**Traceability**: Requirement 6.1-6.4

**Evidence**: design.md 7.5節 (normalizeBusinessCode), research.md Decision: コード正規化ユーティリティ配置

---

## Design Strengths

✅ **Contracts-first順序の徹底**: BFF契約（2節）→ API契約（10.1節）→ Prisma Schema（10.2節）の順序で定義され、tech.mdのContracts-first原則に完全準拠しています。型安全性が境界全体で保証されます。

✅ **既存パターンの一貫した踏襲**: employee-masterのBFF Paging正規化（page/pageSize → offset/limit）、エラーコード体系（ErrorCode + HttpStatus + Message）、楽観ロック（version）をすべて採用し、プロジェクト全体の学習コストを最小化しています。

---

## Final Assessment

**Decision**: ✅ **GO**（承認）

**Rationale**: 当初指摘した3つのCritical Issuesはすべてdesign.mdに詳細化され、実装判断の曖昧性が解消されました。
- **Issue 1（Payee検索条件）**: `payee_sub_code = supplier_sub_code` の検索条件を明記（design.md 5.2.1節）
- **Issue 2（トランザクション境界）**: Site作成・削除と派生フラグ更新を同一トランザクション内で完結させるコード例を追加（design.md 5.1.1節）
- **Issue 3（テナント設定）**: TenantConfigService経由でコード正規化モードを取得する方針を明記（design.md 7.5節）

設計は実装可能な状態になり、Contracts-first順序、既存パターン踏襲、マルチテナント分離の観点で高品質です。

**Next Steps**:

1. **タスク生成**: `/kiro:spec-tasks master-data/business-partner -y` でタスク生成に進んでください
2. **実装順序**: Contracts → DB/Migration → Domain API → BFF → UI の順で実装
3. **注意事項**: TenantConfigService の実装が前提となるため、テナント設定テーブルの準備を優先してください

---

## Resolution Summary

| Critical Issue | Status | Resolution |
|----------------|--------|------------|
| Issue 1: Payee検索条件不明確 | ✅ 解決 | design.md 5.2.1節に検索条件を明記（`WHERE tenant_id=? AND party_id=? AND payee_sub_code=?`） |
| Issue 2: トランザクション境界未定義 | ✅ 解決 | design.md 5.1.1節にトランザクション境界のコード例を追加 |
| Issue 3: テナント設定取得方法未定義 | ✅ 解決 | design.md 7.5節にTenantConfigService経由の取得方法を明記 |

すべてのCritical Issuesが解決され、設計は実装可能な状態になりました。
