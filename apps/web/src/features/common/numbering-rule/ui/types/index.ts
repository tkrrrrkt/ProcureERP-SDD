/**
 * 採番ルール設定 - 型定義
 *
 * NOTE: Phase 1 (UI-MOCK) のため、ローカル型定義を使用
 * Phase 2 (UI-BFF) 移行時に packages/contracts/src/bff/document-type から
 * Re-export する形式に変更する
 *
 * TODO: BFFコントラクト完成後、以下の形式に変更:
 * export type { ... } from '@contracts/bff/document-type';
 */

export type DocumentTypeKey = 'PR' | 'RFQ' | 'PO' | 'GR' | 'IR';
export type PeriodKind = 'NONE' | 'YY' | 'YYMM';
export type SequenceScopeKind = 'COMPANY' | 'DEPARTMENT';

export interface NumberingRuleBffDto {
  id: string;
  documentTypeKey: DocumentTypeKey;
  prefix: string;
  includeDepartmentSymbol: boolean;
  periodKind: PeriodKind;
  sequenceScopeKind: SequenceScopeKind;
  seqPadding: number;
  version: number;
  createdAt: string;
  updatedAt: string;
  documentTypeName: string;
  numberPreview: string;
}

export interface ListNumberingRulesRequest {
  page?: number;
  pageSize?: number;
  sortBy?: 'documentTypeKey';
  sortOrder?: 'asc' | 'desc';
}

export interface ListNumberingRulesResponse {
  rules: NumberingRuleBffDto[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface GetNumberingRuleResponse {
  rule: NumberingRuleBffDto;
}

export interface UpdateNumberingRuleRequest {
  prefix: string;
  includeDepartmentSymbol: boolean;
  periodKind: PeriodKind;
  sequenceScopeKind: SequenceScopeKind;
  version: number;
}

export interface UpdateNumberingRuleResponse {
  rule: NumberingRuleBffDto;
}

// Error Codes
export const DocumentTypeErrorCode = {
  NUMBERING_RULE_NOT_FOUND: 'NUMBERING_RULE_NOT_FOUND',
  INVALID_PREFIX_FORMAT: 'INVALID_PREFIX_FORMAT',
  CONCURRENT_UPDATE: 'CONCURRENT_UPDATE',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
} as const;

export type DocumentTypeErrorCodeType =
  (typeof DocumentTypeErrorCode)[keyof typeof DocumentTypeErrorCode];

export const DocumentTypeErrorMessage: Record<string, string> = {
  NUMBERING_RULE_NOT_FOUND: '指定された採番ルールが見つかりません',
  INVALID_PREFIX_FORMAT: 'prefixは英大文字1文字で指定してください',
  CONCURRENT_UPDATE: '他のユーザーによって更新されています',
  PERMISSION_DENIED: 'この操作を行う権限がありません',
};

// UI-specific types
export interface NumberingRuleFormData {
  prefix: string;
  includeDepartmentSymbol: boolean;
  periodKind: PeriodKind;
  sequenceScopeKind: SequenceScopeKind;
}

export interface BffError {
  code: string;
  message: string;
}
