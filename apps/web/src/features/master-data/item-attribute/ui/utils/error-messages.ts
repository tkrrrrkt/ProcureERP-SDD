import type { ItemAttributeBffErrorCode } from '../types/bff-contracts';

export function getErrorMessage(code: ItemAttributeBffErrorCode | string): string {
  switch (code) {
    case 'ITEM_ATTRIBUTE_NOT_FOUND':
      return '仕様属性が見つかりません';
    case 'ITEM_ATTRIBUTE_VALUE_NOT_FOUND':
      return '属性値が見つかりません';
    case 'ITEM_ATTRIBUTE_CODE_DUPLICATE':
      return '仕様属性コードが重複しています';
    case 'VALUE_CODE_DUPLICATE':
      return '属性値コードが重複しています';
    case 'CONCURRENT_UPDATE':
      return '他のユーザーによって更新されています。再度読み込んでください';
    case 'INVALID_ATTRIBUTE_CODE_FORMAT':
      return '仕様属性コードは英大文字・数字・ハイフン・アンダースコアで20文字以内で入力してください';
    case 'INVALID_VALUE_CODE_FORMAT':
      return '属性値コードは英大文字・数字・ハイフン・アンダースコアで30文字以内で入力してください';
    case 'CODE_CHANGE_NOT_ALLOWED':
      return 'コードの変更は許可されていません';
    case 'ATTRIBUTE_IN_USE':
      return 'この仕様属性はSKU仕様で使用されています';
    case 'VALUE_IN_USE':
      return 'この属性値はSKU仕様で使用されています';
    default:
      return 'エラーが発生しました';
  }
}
