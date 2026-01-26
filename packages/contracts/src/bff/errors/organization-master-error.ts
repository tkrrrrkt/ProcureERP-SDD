/**
 * BFF Error Codes: Organization Master
 *
 * API エラーコードを Re-export（Pass-through方針）
 * BFFとAPIでエラーコードの完全一致を保証
 */

export {
  OrganizationMasterErrorCode,
  OrganizationMasterErrorHttpStatus,
  OrganizationMasterErrorMessage,
} from '../../api/errors/organization-master-error';
