/**
 * Ship-To Code Normalization Utility
 *
 * 納入先コードの正規化
 * - trim（前後空白除去）
 * - 全角→半角変換
 * - 英字大文字化
 * - 10桁英数字パターン検証
 *
 * SSoT: .kiro/specs/master-data/ship-to/design.md
 */

import { HttpException, HttpStatus } from '@nestjs/common';
import {
  ShipToErrorCode,
  ShipToErrorHttpStatus,
  ShipToErrorMessage,
} from '@procure/contracts/api/errors/ship-to-error';
import { normalizeCode, validateCodePattern } from '../../../../common/utils/normalize-business-code';

export interface NormalizeShipToCodeResult {
  success: true;
  normalizedCode: string;
}

export interface NormalizeShipToCodeError {
  success: false;
  errorCode: ShipToErrorCode;
  errorMessage: string;
}

export type NormalizeShipToCodeOutcome =
  | NormalizeShipToCodeResult
  | NormalizeShipToCodeError;

/**
 * 納入先コード正規化（Result型）
 *
 * @param code 入力コード
 * @returns 正規化結果または検証エラー
 */
export function normalizeShipToCodeSafe(code: string): NormalizeShipToCodeOutcome {
  // 正規化: trim + 全角→半角 + 大文字化
  const normalizedCode = normalizeCode(code, 'alphanumeric');

  // 桁数チェック
  if (normalizedCode.length !== 10) {
    return {
      success: false,
      errorCode: ShipToErrorCode.INVALID_SHIP_TO_CODE_LENGTH,
      errorMessage: ShipToErrorMessage[ShipToErrorCode.INVALID_SHIP_TO_CODE_LENGTH],
    };
  }

  // 文字種チェック（英数字のみ）
  if (!/^[0-9A-Z]+$/.test(normalizedCode)) {
    return {
      success: false,
      errorCode: ShipToErrorCode.INVALID_SHIP_TO_CODE_CHARS,
      errorMessage: ShipToErrorMessage[ShipToErrorCode.INVALID_SHIP_TO_CODE_CHARS],
    };
  }

  // パターンチェック（10桁英数字）
  if (!validateCodePattern(normalizedCode, 'alphanumeric')) {
    return {
      success: false,
      errorCode: ShipToErrorCode.INVALID_SHIP_TO_CODE_FORMAT,
      errorMessage: ShipToErrorMessage[ShipToErrorCode.INVALID_SHIP_TO_CODE_FORMAT],
    };
  }

  return {
    success: true,
    normalizedCode,
  };
}

/**
 * 納入先コード正規化（例外スロー版）
 *
 * @param code 入力コード
 * @returns 正規化されたコード
 * @throws HttpException コードが不正な場合
 */
export function normalizeShipToCode(code: string): string {
  const result = normalizeShipToCodeSafe(code);

  if (!result.success) {
    throw new HttpException(
      {
        code: result.errorCode,
        message: result.errorMessage,
      },
      ShipToErrorHttpStatus[result.errorCode],
    );
  }

  return result.normalizedCode;
}

/**
 * メールアドレス形式検証
 *
 * @param email メールアドレス
 * @returns 検証結果
 */
export function validateEmailFormat(email: string | undefined | null): boolean {
  if (!email) {
    return true; // 任意項目のため、未入力はOK
  }

  // RFC 5322 simplified pattern
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

/**
 * メールアドレス検証（例外スロー版）
 *
 * @param email メールアドレス
 * @throws HttpException 形式が不正な場合
 */
export function validateEmail(email: string | undefined | null): void {
  if (!validateEmailFormat(email)) {
    throw new HttpException(
      {
        code: ShipToErrorCode.INVALID_EMAIL_FORMAT,
        message: ShipToErrorMessage[ShipToErrorCode.INVALID_EMAIL_FORMAT],
      },
      ShipToErrorHttpStatus[ShipToErrorCode.INVALID_EMAIL_FORMAT],
    );
  }
}
