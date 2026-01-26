/**
 * 採番ルール設定 - BFF Client Interface
 *
 * UI → BFF のエンドポイント呼び出しを抽象化
 */

import type {
  ListNumberingRulesRequest,
  ListNumberingRulesResponse,
  GetNumberingRuleResponse,
  UpdateNumberingRuleRequest,
  UpdateNumberingRuleResponse,
} from '../types';

export interface BffClient {
  /**
   * 採番ルール一覧取得
   * GET /bff/numbering-rules
   */
  listNumberingRules(
    request?: ListNumberingRulesRequest
  ): Promise<ListNumberingRulesResponse>;

  /**
   * 採番ルール詳細取得
   * GET /bff/numbering-rules/:id
   */
  getNumberingRule(id: string): Promise<GetNumberingRuleResponse>;

  /**
   * 採番ルール更新
   * PUT /bff/numbering-rules/:id
   */
  updateNumberingRule(
    id: string,
    request: UpdateNumberingRuleRequest
  ): Promise<UpdateNumberingRuleResponse>;
}
