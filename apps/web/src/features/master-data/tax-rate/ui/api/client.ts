import type { BffClient } from "./BffClient"
import { MockBffClient } from "./MockBffClient"
import { HttpBffClient } from "./HttpBffClient"

/**
 * BFF Client instance
 *
 * 環境変数に応じて Mock または HTTP クライアントを使用
 * - NEXT_PUBLIC_USE_MOCK_API=true の場合は MockBffClient
 * - それ以外は HttpBffClient
 */
const useMock = process.env.NEXT_PUBLIC_USE_MOCK_API === "true"

export const bffClient: BffClient = useMock
  ? new MockBffClient()
  : new HttpBffClient()
