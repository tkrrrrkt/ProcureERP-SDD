/**
 * 採番プレビュー生成ユーティリティ
 */

import type { PeriodKind } from '../types';

/**
 * 採番プレビューを生成する（UI表示用）
 *
 * @param prefix - 先頭文字（英大文字1文字）
 * @param includeDeptSymbol - 部門記号を含めるかどうか
 * @param periodKind - 期間種別
 * @returns プレビュー文字列
 */
export function generatePreview(
  prefix: string,
  includeDeptSymbol: boolean,
  periodKind: PeriodKind
): string {
  let preview = prefix;

  // 部門記号（ダミーとして'A'を使用）
  if (includeDeptSymbol) {
    preview += 'A';
  }

  // 期間種別に応じた年月表記
  if (periodKind === 'YY') {
    preview += '26'; // 2026年
  } else if (periodKind === 'YYMM') {
    preview += '2601'; // 2026年01月
  }
  // 'NONE'の場合は何も追加しない

  // 連番（8桁ゼロ埋め）
  preview += '00000001';

  return preview;
}

/**
 * 期間種別の表示ラベルを取得
 */
export function getPeriodKindLabel(periodKind: PeriodKind): string {
  switch (periodKind) {
    case 'NONE':
      return 'なし';
    case 'YY':
      return '年（YY）';
    case 'YYMM':
      return '年月（YYMM）';
    default:
      return periodKind;
  }
}

/**
 * 系列分割種別の表示ラベルを取得
 */
export function getSequenceScopeLabel(
  scopeKind: 'COMPANY' | 'DEPARTMENT'
): string {
  switch (scopeKind) {
    case 'COMPANY':
      return '全社連番';
    case 'DEPARTMENT':
      return '部門別連番';
    default:
      return scopeKind;
  }
}
