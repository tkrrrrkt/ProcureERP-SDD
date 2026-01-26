/**
 * BFF Error Codes: Item Attribute Master
 *
 * API エラーコードを Re-export（Pass-through方針）
 * BFFとAPIでエラーコードの完全一致を保証
 */

export {
  ItemAttributeErrorCode,
  ItemAttributeErrorHttpStatus,
  ItemAttributeErrorMessage,
} from '../../api/errors/item-attribute-error';
