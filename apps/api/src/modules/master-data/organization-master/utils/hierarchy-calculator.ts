import { Department } from '@prisma/client';

/**
 * 階層情報計算結果
 */
export interface HierarchyInfo {
  hierarchyLevel: number;
  hierarchyPath: string;
}

/**
 * 階層情報計算ユーティリティ
 *
 * 部門の hierarchy_level / hierarchy_path を計算
 */
export class HierarchyCalculator {
  /**
   * 単一部門の階層情報を計算
   *
   * @param departmentCode - 対象部門のコード
   * @param parentId - 親部門ID（nullならルート）
   * @param allDepartments - 同一バージョン内の全部門
   * @returns 階層レベルとパス
   */
  static calculate(
    departmentCode: string,
    parentId: string | null,
    allDepartments: Department[],
  ): HierarchyInfo {
    // ルート部門の場合
    if (parentId === null) {
      return {
        hierarchyLevel: 1,
        hierarchyPath: `/${departmentCode}`,
      };
    }

    // 親を辿ってパスを構築
    const pathParts: string[] = [];
    let level = 1;
    let currentParentId: string | null = parentId;

    while (currentParentId !== null) {
      const parent = allDepartments.find((d) => d.id === currentParentId);
      if (!parent) break;

      pathParts.unshift(parent.departmentCode);
      currentParentId = parent.parentId;
      level++;
    }

    // 自身のコードを追加
    pathParts.push(departmentCode);

    return {
      hierarchyLevel: level,
      hierarchyPath: '/' + pathParts.join('/'),
    };
  }

  /**
   * 子孫部門の階層情報を一括再計算
   *
   * @param parentDepartment - 親部門（移動後の状態）
   * @param allDepartments - 同一バージョン内の全部門
   * @returns 更新が必要な部門のID→階層情報マップ
   */
  static recalculateDescendants(
    parentDepartment: Department,
    allDepartments: Department[],
  ): Map<string, HierarchyInfo> {
    const updates = new Map<string, HierarchyInfo>();

    // 子部門を再帰的に探索
    const processChildren = (parentId: string, parentPath: string, parentLevel: number) => {
      const children = allDepartments.filter((d) => d.parentId === parentId);

      for (const child of children) {
        const childLevel = parentLevel + 1;
        const childPath = `${parentPath}/${child.departmentCode}`;

        updates.set(child.id, {
          hierarchyLevel: childLevel,
          hierarchyPath: childPath,
        });

        // 孫を処理
        processChildren(child.id, childPath, childLevel);
      }
    };

    processChildren(
      parentDepartment.id,
      parentDepartment.hierarchyPath ?? `/${parentDepartment.departmentCode}`,
      parentDepartment.hierarchyLevel,
    );

    return updates;
  }
}
