/**
 * バリデーションユーティリティ
 */

/**
 * prefixのバリデーション
 * - 英大文字1文字のみ許可
 */
export function validatePrefix(value: string): {
  isValid: boolean;
  error?: string;
} {
  if (!value) {
    return { isValid: false, error: 'prefixは必須です' };
  }

  if (value.length !== 1) {
    return { isValid: false, error: 'prefixは1文字で指定してください' };
  }

  if (!/^[A-Z]$/.test(value)) {
    return {
      isValid: false,
      error: 'prefixは英大文字1文字で指定してください',
    };
  }

  return { isValid: true };
}

/**
 * 入力値を英大文字に変換
 */
export function toUpperCasePrefix(value: string): string {
  return value
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .slice(0, 1);
}
