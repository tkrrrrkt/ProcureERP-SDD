/**
 * Company Bank Account BFF Client Factory
 */

import type { CompanyBankAccountBffClient } from './BffClient';
import { HttpBffClient } from './HttpBffClient';
import { MockBffClient } from './MockBffClient';

let clientInstance: CompanyBankAccountBffClient | null = null;

/**
 * Get BFF Client based on environment
 */
export function getBffClient(): CompanyBankAccountBffClient {
  const useMock = process.env.NEXT_PUBLIC_USE_MOCK_BFF === 'true';

  if (useMock) {
    return new MockBffClient();
  }

  return new HttpBffClient();
}

/**
 * Get shared singleton BFF Client
 */
export function getSharedBffClient(): CompanyBankAccountBffClient {
  if (!clientInstance) {
    clientInstance = getBffClient();
  }
  return clientInstance;
}
