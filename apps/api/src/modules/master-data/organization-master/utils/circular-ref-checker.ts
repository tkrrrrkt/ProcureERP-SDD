import { Department } from '@prisma/client';

/**
 * 循環参照チェッカー
 *
 * 部門階層における循環参照を検出するユーティリティ
 * DFS（深さ優先探索）アルゴリズムを使用
 */
export class CircularRefChecker {
  /**
   * 循環参照をチェック
   *
   * @param departmentId - 移動対象の部門ID
   * @param newParentId - 新しい親部門ID（nullならルート）
   * @param allDepartments - 同一バージョン内の全部門
   * @returns true = 循環参照あり（エラー）, false = 循環参照なし（OK）
   */
  static check(
    departmentId: string,
    newParentId: string | null,
    allDepartments: Department[],
  ): boolean {
    // ルートへの移動は常に安全
    if (newParentId === null) {
      return false;
    }

    // 自己参照
    if (departmentId === newParentId) {
      return true;
    }

    // DFS で親を辿って循環を検出
    const visited = new Set<string>();
    let current: string | null = newParentId;

    while (current !== null) {
      // 移動対象部門に到達 → 循環
      if (current === departmentId) {
        return true;
      }

      // 既に訪問済み → 既存の循環を検出
      if (visited.has(current)) {
        return true;
      }

      visited.add(current);

      // 親を辿る
      const parent = allDepartments.find((d) => d.id === current);
      current = parent?.parentId ?? null;
    }

    // 循環なし
    return false;
  }
}
