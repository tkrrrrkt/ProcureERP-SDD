/**
 * BFF Client Factory
 *
 * 環境変数に基づいてMock/Httpクライアントを切り替え
 */

import type { BffClient } from './BffClient';
import { MockBffClient } from './MockBffClient';
import { HttpBffClient } from './HttpBffClient';

/**
 * 環境変数に基づいてBffClientインスタンスを取得
 * NEXT_PUBLIC_USE_MOCK_BFF=true の場合はMockBffClientを使用
 */
export function getBffClient(): BffClient {
  const useMock = process.env.NEXT_PUBLIC_USE_MOCK_BFF === 'true';

  if (useMock) {
    return new MockBffClient();
  }

  return new HttpBffClient();
}

// シングルトンインスタンス
let clientInstance: BffClient | null = null;

/**
 * シングルトンBffClientインスタンスを取得
 * MockBffClientの場合は状態を保持するためシングルトンが有用
 */
export function getSharedBffClient(): BffClient {
  if (!clientInstance) {
    clientInstance = getBffClient();
  }
  return clientInstance;
}
