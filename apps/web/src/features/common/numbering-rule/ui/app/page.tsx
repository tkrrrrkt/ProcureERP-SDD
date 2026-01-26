/**
 * 採番ルール設定ページ (App Router Entry)
 *
 * NOTE: layout.tsx は生成しません。
 * このページは既存の AppShell 内でレンダリングされます。
 */

import { NumberingRulePage } from '../NumberingRulePage';

// TODO: 実際の実装では認証・権限チェックを行う
// const session = await getServerSession();
// const canEdit = session?.user?.permissions?.includes('settings:edit');

export default function Page() {
  return <NumberingRulePage canEdit={true} />;
}
