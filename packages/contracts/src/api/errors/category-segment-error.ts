/**
 * Error Codes: Category-Segment Master
 *
 * Domain API のエラーコード定義
 * SSoT: packages/contracts/src/api/errors/category-segment-error.ts
 */

export const CategorySegmentErrorCode = {
  // ==========================================================================
  // CategoryAxis Errors
  // ==========================================================================

  /** 指定されたカテゴリ軸が見つからない (404) */
  CATEGORY_AXIS_NOT_FOUND: 'CATEGORY_AXIS_NOT_FOUND',

  /** 軸コードが重複している (409) */
  AXIS_CODE_DUPLICATE: 'AXIS_CODE_DUPLICATE',

  /** ITEM以外で階層サポートが有効になっている (422) */
  HIERARCHY_NOT_SUPPORTED: 'HIERARCHY_NOT_SUPPORTED',

  /** 軸コードは変更不可 (422) */
  AXIS_CODE_IMMUTABLE: 'AXIS_CODE_IMMUTABLE',

  /** 対象エンティティ種別は変更不可 (422) */
  TARGET_ENTITY_KIND_IMMUTABLE: 'TARGET_ENTITY_KIND_IMMUTABLE',

  // ==========================================================================
  // Segment Errors
  // ==========================================================================

  /** 指定されたセグメントが見つからない (404) */
  SEGMENT_NOT_FOUND: 'SEGMENT_NOT_FOUND',

  /** セグメントコードが重複している (409) */
  SEGMENT_CODE_DUPLICATE: 'SEGMENT_CODE_DUPLICATE',

  /** セグメントコードは変更不可 (422) */
  SEGMENT_CODE_IMMUTABLE: 'SEGMENT_CODE_IMMUTABLE',

  /** 親セグメントが見つからない (404) */
  PARENT_SEGMENT_NOT_FOUND: 'PARENT_SEGMENT_NOT_FOUND',

  /** 親セグメントが別の軸に属している (422) */
  PARENT_SEGMENT_WRONG_AXIS: 'PARENT_SEGMENT_WRONG_AXIS',

  /** 循環参照が検出された (422) */
  CIRCULAR_REFERENCE: 'CIRCULAR_REFERENCE',

  /** 階層深度が最大を超えている (422) */
  HIERARCHY_DEPTH_EXCEEDED: 'HIERARCHY_DEPTH_EXCEEDED',

  /** 階層非対応の軸で親セグメントが指定された (422) */
  HIERARCHY_NOT_ALLOWED: 'HIERARCHY_NOT_ALLOWED',

  // ==========================================================================
  // SegmentAssignment Errors
  // ==========================================================================

  /** 指定されたセグメント割当が見つからない (404) */
  ASSIGNMENT_NOT_FOUND: 'ASSIGNMENT_NOT_FOUND',

  /** エンティティ種別が軸の対象と一致しない (422) */
  INVALID_ENTITY_KIND: 'INVALID_ENTITY_KIND',

  /** セグメントが指定された軸に属していない (422) */
  SEGMENT_NOT_IN_AXIS: 'SEGMENT_NOT_IN_AXIS',

  /** 参照先エンティティが見つからない (404) */
  ENTITY_NOT_FOUND: 'ENTITY_NOT_FOUND',

  // ==========================================================================
  // Common Errors
  // ==========================================================================

  /** コード長が不正 (422) */
  INVALID_CODE_LENGTH: 'INVALID_CODE_LENGTH',

  /** 必須フィールドが未入力 (422) */
  REQUIRED_FIELD_MISSING: 'REQUIRED_FIELD_MISSING',

  /** 楽観ロックによる競合 (409) */
  CONCURRENT_UPDATE: 'CONCURRENT_UPDATE',
} as const;

export type CategorySegmentErrorCode =
  (typeof CategorySegmentErrorCode)[keyof typeof CategorySegmentErrorCode];

/**
 * エラーコードに対応するHTTPステータスコード
 */
export const CategorySegmentErrorHttpStatus: Record<CategorySegmentErrorCode, number> = {
  // CategoryAxis
  [CategorySegmentErrorCode.CATEGORY_AXIS_NOT_FOUND]: 404,
  [CategorySegmentErrorCode.AXIS_CODE_DUPLICATE]: 409,
  [CategorySegmentErrorCode.HIERARCHY_NOT_SUPPORTED]: 422,
  [CategorySegmentErrorCode.AXIS_CODE_IMMUTABLE]: 422,
  [CategorySegmentErrorCode.TARGET_ENTITY_KIND_IMMUTABLE]: 422,

  // Segment
  [CategorySegmentErrorCode.SEGMENT_NOT_FOUND]: 404,
  [CategorySegmentErrorCode.SEGMENT_CODE_DUPLICATE]: 409,
  [CategorySegmentErrorCode.SEGMENT_CODE_IMMUTABLE]: 422,
  [CategorySegmentErrorCode.PARENT_SEGMENT_NOT_FOUND]: 404,
  [CategorySegmentErrorCode.PARENT_SEGMENT_WRONG_AXIS]: 422,
  [CategorySegmentErrorCode.CIRCULAR_REFERENCE]: 422,
  [CategorySegmentErrorCode.HIERARCHY_DEPTH_EXCEEDED]: 422,
  [CategorySegmentErrorCode.HIERARCHY_NOT_ALLOWED]: 422,

  // SegmentAssignment
  [CategorySegmentErrorCode.ASSIGNMENT_NOT_FOUND]: 404,
  [CategorySegmentErrorCode.INVALID_ENTITY_KIND]: 422,
  [CategorySegmentErrorCode.SEGMENT_NOT_IN_AXIS]: 422,
  [CategorySegmentErrorCode.ENTITY_NOT_FOUND]: 404,

  // Common
  [CategorySegmentErrorCode.INVALID_CODE_LENGTH]: 422,
  [CategorySegmentErrorCode.REQUIRED_FIELD_MISSING]: 422,
  [CategorySegmentErrorCode.CONCURRENT_UPDATE]: 409,
};

/**
 * エラーコードに対応するデフォルトメッセージ
 */
export const CategorySegmentErrorMessage: Record<CategorySegmentErrorCode, string> = {
  // CategoryAxis
  [CategorySegmentErrorCode.CATEGORY_AXIS_NOT_FOUND]: '指定されたカテゴリ軸が見つかりません',
  [CategorySegmentErrorCode.AXIS_CODE_DUPLICATE]: '軸コードが重複しています',
  [CategorySegmentErrorCode.HIERARCHY_NOT_SUPPORTED]:
    '階層サポートは品目カテゴリ（ITEM）の場合のみ有効にできます',
  [CategorySegmentErrorCode.AXIS_CODE_IMMUTABLE]: '軸コードは変更できません',
  [CategorySegmentErrorCode.TARGET_ENTITY_KIND_IMMUTABLE]: '対象エンティティ種別は変更できません',

  // Segment
  [CategorySegmentErrorCode.SEGMENT_NOT_FOUND]: '指定されたセグメントが見つかりません',
  [CategorySegmentErrorCode.SEGMENT_CODE_DUPLICATE]: 'セグメントコードが重複しています',
  [CategorySegmentErrorCode.SEGMENT_CODE_IMMUTABLE]: 'セグメントコードは変更できません',
  [CategorySegmentErrorCode.PARENT_SEGMENT_NOT_FOUND]: '親セグメントが見つかりません',
  [CategorySegmentErrorCode.PARENT_SEGMENT_WRONG_AXIS]:
    '親セグメントは同じカテゴリ軸に属している必要があります',
  [CategorySegmentErrorCode.CIRCULAR_REFERENCE]: '循環参照が検出されました',
  [CategorySegmentErrorCode.HIERARCHY_DEPTH_EXCEEDED]:
    '階層の深さが最大（5レベル）を超えています',
  [CategorySegmentErrorCode.HIERARCHY_NOT_ALLOWED]:
    'このカテゴリ軸は階層をサポートしていません',

  // SegmentAssignment
  [CategorySegmentErrorCode.ASSIGNMENT_NOT_FOUND]: '指定されたセグメント割当が見つかりません',
  [CategorySegmentErrorCode.INVALID_ENTITY_KIND]:
    'エンティティ種別がカテゴリ軸の対象と一致しません',
  [CategorySegmentErrorCode.SEGMENT_NOT_IN_AXIS]:
    'セグメントが指定されたカテゴリ軸に属していません',
  [CategorySegmentErrorCode.ENTITY_NOT_FOUND]: '参照先のエンティティが見つかりません',

  // Common
  [CategorySegmentErrorCode.INVALID_CODE_LENGTH]: 'コードは10文字以内の英数字で入力してください',
  [CategorySegmentErrorCode.REQUIRED_FIELD_MISSING]: '必須項目が入力されていません',
  [CategorySegmentErrorCode.CONCURRENT_UPDATE]:
    '他のユーザーによって更新されています。再度読み込んでください',
};
