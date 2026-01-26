/**
 * 採番ルール設定 - HTTP BFF Client
 *
 * 実際のBFFエンドポイントを呼び出すクライアント
 * NOTE: fetch() 呼び出しはこのファイル内でのみ許可
 */

import type { BffClient } from './BffClient';
import type {
  ListNumberingRulesRequest,
  ListNumberingRulesResponse,
  GetNumberingRuleResponse,
  UpdateNumberingRuleRequest,
  UpdateNumberingRuleResponse,
  BffError,
} from '../types';

export class HttpBffClient implements BffClient {
  private baseUrl: string;
  private getAuthToken: () => Promise<string>;

  constructor(baseUrl: string, getAuthToken: () => Promise<string>) {
    this.baseUrl = baseUrl;
    this.getAuthToken = getAuthToken;
  }

  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    body?: unknown
  ): Promise<T> {
    const token = await this.getAuthToken();

    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error: BffError = await response.json();
      throw error;
    }

    return response.json();
  }

  async listNumberingRules(
    request?: ListNumberingRulesRequest
  ): Promise<ListNumberingRulesResponse> {
    const params = new URLSearchParams();
    if (request?.page) params.set('page', String(request.page));
    if (request?.pageSize) params.set('pageSize', String(request.pageSize));
    if (request?.sortBy) params.set('sortBy', request.sortBy);
    if (request?.sortOrder) params.set('sortOrder', request.sortOrder);

    const query = params.toString();
    const path = `/bff/numbering-rules${query ? `?${query}` : ''}`;

    return this.request<ListNumberingRulesResponse>('GET', path);
  }

  async getNumberingRule(id: string): Promise<GetNumberingRuleResponse> {
    return this.request<GetNumberingRuleResponse>(
      'GET',
      `/bff/numbering-rules/${id}`
    );
  }

  async updateNumberingRule(
    id: string,
    request: UpdateNumberingRuleRequest
  ): Promise<UpdateNumberingRuleResponse> {
    return this.request<UpdateNumberingRuleResponse>(
      'PUT',
      `/bff/numbering-rules/${id}`,
      request
    );
  }
}
