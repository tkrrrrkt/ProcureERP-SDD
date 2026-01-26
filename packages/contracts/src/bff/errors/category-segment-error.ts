/**
 * BFF Error Codes: Category-Segment Master
 *
 * API エラーコードを Re-export（Pass-through方針）
 * BFFとAPIでエラーコードの完全一致を保証
 */

export {
  CategorySegmentErrorCode,
  CategorySegmentErrorHttpStatus,
  CategorySegmentErrorMessage,
} from '../../api/errors/category-segment-error';
