/**
 * Business Code Normalization Utility
 *
 * コード正規化（取引先コード、仕入先枝番コード、支払先枝番コード等）
 * - trim（前後空白除去）
 * - 全角→半角変換
 * - 英字大文字化（英数字モード時）
 * - パターン検証（10桁）
 *
 * Entity Definition: .kiro/specs/spec_doc/61_機能設計検討/02_エンティティ定義/03_取引先系マスタ関係.md
 */

import { HttpException, HttpStatus } from '@nestjs/common';

export type CodeNormalizationMode = 'numeric' | 'alphanumeric';

export interface NormalizeBusinessCodeOptions {
  mode: CodeNormalizationMode;
  fieldName?: string; // エラーメッセージ用
}

export interface CodeValidationResult {
  valid: boolean;
  normalizedCode: string;
  errorCode?: string;
  errorMessage?: string;
}

/**
 * 全角→半角変換
 */
function toHalfWidth(str: string): string {
  return str
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => {
      return String.fromCharCode(s.charCodeAt(0) - 0xfee0);
    })
    .replace(/[\u3000]/g, ' '); // 全角スペース→半角
}

/**
 * コード正規化
 * - trim
 * - 全角→半角
 * - 英字大文字化（英数字モードのみ）
 */
export function normalizeCode(code: string, mode: CodeNormalizationMode): string {
  let normalized = code.trim();
  normalized = toHalfWidth(normalized);

  if (mode === 'alphanumeric') {
    normalized = normalized.toUpperCase();
  }

  return normalized;
}

/**
 * コードパターン検証
 */
export function validateCodePattern(
  code: string,
  mode: CodeNormalizationMode,
): boolean {
  if (mode === 'numeric') {
    return /^[0-9]{10}$/.test(code);
  }
  // alphanumeric
  return /^[0-9A-Z]{10}$/.test(code);
}

/**
 * ビジネスコード正規化（検証付き）
 *
 * @param code 入力コード
 * @param options 正規化オプション
 * @returns 正規化されたコード
 * @throws HttpException コードが不正な場合
 */
export function normalizeBusinessCode(
  code: string,
  options: NormalizeBusinessCodeOptions,
): string {
  const { mode, fieldName = 'コード' } = options;

  // 正規化
  const normalizedCode = normalizeCode(code, mode);

  // 桁数チェック
  if (normalizedCode.length !== 10) {
    throw new HttpException(
      {
        code: getInvalidLengthErrorCode(fieldName),
        message: `${fieldName}は10桁で入力してください`,
        field: fieldName,
      },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }

  // パターンチェック
  if (!validateCodePattern(normalizedCode, mode)) {
    const allowedChars = mode === 'numeric' ? '数字' : '英数字';
    throw new HttpException(
      {
        code: getInvalidFormatErrorCode(fieldName),
        message: `${fieldName}は${allowedChars}のみ使用できます`,
        field: fieldName,
      },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }

  return normalizedCode;
}

/**
 * フィールド名からエラーコードを生成（桁数エラー）
 */
function getInvalidLengthErrorCode(fieldName: string): string {
  const fieldMap: Record<string, string> = {
    '取引先コード': 'PARTY_CODE_INVALID_LENGTH',
    '仕入先枝番コード': 'SUPPLIER_SUB_CODE_INVALID_LENGTH',
    '支払先枝番コード': 'PAYEE_SUB_CODE_INVALID_LENGTH',
    '得意先枝番コード': 'CUSTOMER_SUB_CODE_INVALID_LENGTH',
    '納入先コード': 'SHIP_TO_CODE_INVALID_LENGTH',
  };
  return fieldMap[fieldName] || 'INVALID_CODE_LENGTH';
}

/**
 * フィールド名からエラーコードを生成（形式エラー）
 */
function getInvalidFormatErrorCode(fieldName: string): string {
  const fieldMap: Record<string, string> = {
    '取引先コード': 'PARTY_CODE_INVALID_FORMAT',
    '仕入先枝番コード': 'SUPPLIER_SUB_CODE_INVALID_FORMAT',
    '支払先枝番コード': 'PAYEE_SUB_CODE_INVALID_FORMAT',
    '得意先枝番コード': 'CUSTOMER_SUB_CODE_INVALID_FORMAT',
    '納入先コード': 'SHIP_TO_CODE_INVALID_FORMAT',
  };
  return fieldMap[fieldName] || 'INVALID_CODE_FORMAT';
}

/**
 * 表示用コード生成（parent_code + "-" + sub_code）
 *
 * @param parentCode 親コード（10桁）
 * @param subCode 枝番コード（10桁）
 * @returns 表示用コード（最大21文字）
 */
export function generateDisplayCode(parentCode: string, subCode: string): string {
  return `${parentCode}-${subCode}`;
}

// =============================================================================
// Category-Segment Code Normalization (Flexible Length)
// =============================================================================

export interface NormalizeCategoryCodeOptions {
  maxLength?: number; // default: 10
  fieldName?: string; // エラーメッセージ用
  errorCode?: string; // カスタムエラーコード
}

/**
 * カテゴリ・セグメントコード正規化（可変長対応）
 *
 * - trim（前後空白除去）
 * - 全角→半角変換
 * - 英字大文字化
 * - 最大長チェック（デフォルト10桁）
 * - 英数字パターン検証
 *
 * @param code 入力コード
 * @param options 正規化オプション
 * @returns 正規化されたコード
 * @throws HttpException コードが不正な場合
 */
export function normalizeCategoryCode(
  code: string,
  options: NormalizeCategoryCodeOptions = {},
): string {
  const { maxLength = 10, fieldName = 'コード', errorCode = 'INVALID_CODE_LENGTH' } = options;

  // 正規化（trim, 全角→半角, 大文字化）
  const normalizedCode = normalizeCode(code, 'alphanumeric');

  // 空チェック
  if (normalizedCode.length === 0) {
    throw new HttpException(
      {
        code: 'REQUIRED_FIELD_MISSING',
        message: `${fieldName}は必須です`,
        field: fieldName,
      },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }

  // 最大長チェック
  if (normalizedCode.length > maxLength) {
    throw new HttpException(
      {
        code: errorCode,
        message: `${fieldName}は${maxLength}文字以内で入力してください（現在: ${normalizedCode.length}文字）`,
        field: fieldName,
      },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }

  // 英数字パターンチェック
  if (!/^[0-9A-Z]+$/.test(normalizedCode)) {
    throw new HttpException(
      {
        code: errorCode,
        message: `${fieldName}は英数字のみ使用できます`,
        field: fieldName,
      },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }

  return normalizedCode;
}
