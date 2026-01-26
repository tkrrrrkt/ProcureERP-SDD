/**
 * 採番ルール設定 - Feature exports
 */

// Main page component
export { NumberingRulePage } from './NumberingRulePage';

// Components
export { NumberingRuleDialog, NumberingRuleList } from './components';

// Hooks
export { useNumberingRules, useUpdateNumberingRule } from './hooks';

// API clients
export type { BffClient } from './api';
export { HttpBffClient, MockBffClient, mockBffClient } from './api';

// Types
export type {
  DocumentTypeKey,
  PeriodKind,
  SequenceScopeKind,
  NumberingRuleBffDto,
  ListNumberingRulesRequest,
  ListNumberingRulesResponse,
  GetNumberingRuleResponse,
  UpdateNumberingRuleRequest,
  UpdateNumberingRuleResponse,
  NumberingRuleFormData,
  BffError,
  DocumentTypeErrorCodeType,
} from './types';
export { DocumentTypeErrorCode, DocumentTypeErrorMessage } from './types';

// Utils
export {
  generatePreview,
  getPeriodKindLabel,
  getSequenceScopeLabel,
  validatePrefix,
  toUpperCasePrefix,
} from './utils';
