/**
 * Unit Master BFF Client Instance
 *
 * Phase 1: MockBffClient を使用（v0統制テスト）
 * Phase 2: HttpBffClient に切り替え（本実装）
 */

import { MockBffClient } from './MockBffClient';
// import { HttpBffClient } from './HttpBffClient';  // Phase 2

// Phase 1: Mock client
export const bffClient = new MockBffClient();

// Phase 2: HTTP client (本実装時にコメント解除)
// export const bffClient = new HttpBffClient();
