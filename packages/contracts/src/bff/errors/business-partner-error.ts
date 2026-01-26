/**
 * BFF Error Codes: Business Partner
 *
 * API エラーコードを Re-export（Pass-through方針）
 * BFFとAPIでエラーコードの完全一致を保証
 */

export {
  BusinessPartnerErrorCode,
  BusinessPartnerErrorHttpStatus,
  BusinessPartnerErrorMessage,
} from '../../api/errors/business-partner-error';
