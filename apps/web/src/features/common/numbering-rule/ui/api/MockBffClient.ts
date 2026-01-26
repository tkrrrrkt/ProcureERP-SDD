/**
 * 採番ルール設定 - Mock BFF Client
 *
 * 開発・テスト用のモッククライアント
 */

import type { BffClient } from './BffClient';
import type {
  ListNumberingRulesRequest,
  ListNumberingRulesResponse,
  GetNumberingRuleResponse,
  UpdateNumberingRuleRequest,
  UpdateNumberingRuleResponse,
  NumberingRuleBffDto,
  PeriodKind,
} from '../types';
import { DocumentTypeErrorCode } from '../types';

// Mock Data
const mockNumberingRules: NumberingRuleBffDto[] = [
  {
    id: 'rule-pr-001',
    documentTypeKey: 'PR',
    prefix: 'R',
    includeDepartmentSymbol: false,
    periodKind: 'YYMM',
    sequenceScopeKind: 'COMPANY',
    seqPadding: 8,
    version: 1,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    documentTypeName: '購買依頼',
    numberPreview: 'R260100000001',
  },
  {
    id: 'rule-rfq-001',
    documentTypeKey: 'RFQ',
    prefix: 'Q',
    includeDepartmentSymbol: false,
    periodKind: 'YYMM',
    sequenceScopeKind: 'COMPANY',
    seqPadding: 8,
    version: 1,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    documentTypeName: '見積依頼',
    numberPreview: 'Q260100000001',
  },
  {
    id: 'rule-po-001',
    documentTypeKey: 'PO',
    prefix: 'P',
    includeDepartmentSymbol: true,
    periodKind: 'YYMM',
    sequenceScopeKind: 'DEPARTMENT',
    seqPadding: 8,
    version: 1,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    documentTypeName: '発注',
    numberPreview: 'PA260100000001',
  },
  {
    id: 'rule-gr-001',
    documentTypeKey: 'GR',
    prefix: 'G',
    includeDepartmentSymbol: false,
    periodKind: 'YYMM',
    sequenceScopeKind: 'COMPANY',
    seqPadding: 8,
    version: 1,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    documentTypeName: '入荷',
    numberPreview: 'G260100000001',
  },
  {
    id: 'rule-ir-001',
    documentTypeKey: 'IR',
    prefix: 'I',
    includeDepartmentSymbol: true,
    periodKind: 'YYMM',
    sequenceScopeKind: 'DEPARTMENT',
    seqPadding: 8,
    version: 1,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    documentTypeName: '仕入計上',
    numberPreview: 'IA260100000001',
  },
];

// Simulated delay for realistic async behavior
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper to generate preview
function generatePreview(
  prefix: string,
  includeDeptSymbol: boolean,
  periodKind: PeriodKind
): string {
  let preview = prefix;
  if (includeDeptSymbol) preview += 'A'; // ダミー部門記号
  if (periodKind === 'YY') preview += '26';
  if (periodKind === 'YYMM') preview += '2601';
  preview += '00000001'; // 8桁ゼロ埋め
  return preview;
}

export class MockBffClient implements BffClient {
  private rules: NumberingRuleBffDto[] = [...mockNumberingRules];
  private simulateError: string | null = null;

  // For testing: simulate specific error
  setSimulateError(errorCode: string | null) {
    this.simulateError = errorCode;
  }

  async listNumberingRules(
    request?: ListNumberingRulesRequest
  ): Promise<ListNumberingRulesResponse> {
    await delay(300);

    if (this.simulateError === DocumentTypeErrorCode.PERMISSION_DENIED) {
      throw {
        code: DocumentTypeErrorCode.PERMISSION_DENIED,
        message: 'この操作を行う権限がありません',
      };
    }

    const page = request?.page ?? 1;
    const pageSize = request?.pageSize ?? 20;

    const sortedRules = [...this.rules];
    if (request?.sortBy === 'documentTypeKey') {
      sortedRules.sort((a, b) => {
        const order = request.sortOrder === 'desc' ? -1 : 1;
        return a.documentTypeKey.localeCompare(b.documentTypeKey) * order;
      });
    }

    return {
      rules: sortedRules,
      total: sortedRules.length,
      page,
      pageSize,
      totalPages: Math.ceil(sortedRules.length / pageSize),
    };
  }

  async getNumberingRule(id: string): Promise<GetNumberingRuleResponse> {
    await delay(200);

    if (this.simulateError === DocumentTypeErrorCode.NUMBERING_RULE_NOT_FOUND) {
      throw {
        code: DocumentTypeErrorCode.NUMBERING_RULE_NOT_FOUND,
        message: '指定された採番ルールが見つかりません',
      };
    }

    const rule = this.rules.find((r) => r.id === id);
    if (!rule) {
      throw {
        code: DocumentTypeErrorCode.NUMBERING_RULE_NOT_FOUND,
        message: '指定された採番ルールが見つかりません',
      };
    }

    return { rule };
  }

  async updateNumberingRule(
    id: string,
    request: UpdateNumberingRuleRequest
  ): Promise<UpdateNumberingRuleResponse> {
    await delay(400);

    if (this.simulateError === DocumentTypeErrorCode.CONCURRENT_UPDATE) {
      throw {
        code: DocumentTypeErrorCode.CONCURRENT_UPDATE,
        message: '他のユーザーによって更新されています',
      };
    }

    if (this.simulateError === DocumentTypeErrorCode.INVALID_PREFIX_FORMAT) {
      throw {
        code: DocumentTypeErrorCode.INVALID_PREFIX_FORMAT,
        message: 'prefixは英大文字1文字で指定してください',
      };
    }

    const ruleIndex = this.rules.findIndex((r) => r.id === id);
    if (ruleIndex === -1) {
      throw {
        code: DocumentTypeErrorCode.NUMBERING_RULE_NOT_FOUND,
        message: '指定された採番ルールが見つかりません',
      };
    }

    const existingRule = this.rules[ruleIndex];

    // Check optimistic lock
    if (existingRule.version !== request.version) {
      throw {
        code: DocumentTypeErrorCode.CONCURRENT_UPDATE,
        message: '他のユーザーによって更新されています',
      };
    }

    // Update rule
    const updatedRule: NumberingRuleBffDto = {
      ...existingRule,
      prefix: request.prefix,
      includeDepartmentSymbol: request.includeDepartmentSymbol,
      periodKind: request.periodKind,
      sequenceScopeKind: request.sequenceScopeKind,
      version: existingRule.version + 1,
      updatedAt: new Date().toISOString(),
      numberPreview: generatePreview(
        request.prefix,
        request.includeDepartmentSymbol,
        request.periodKind
      ),
    };

    this.rules[ruleIndex] = updatedRule;

    return { rule: updatedRule };
  }
}

// Singleton instance for use throughout the app
export const mockBffClient = new MockBffClient();
