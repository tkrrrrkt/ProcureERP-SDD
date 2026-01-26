/**
 * BFF Error Contracts: Tax Code
 *
 * 税コードマスタ用エラーコード定義（Pass-through from API）
 * SSoT: packages/contracts/src/bff/errors/tax-code-error.ts
 */

// Re-export from API errors (Pass-through policy)
export {
  TAX_CODE_ERROR_CODES,
  TaxCodeErrorCode,
  TaxCodeErrorHttpStatus,
  TaxCodeErrorMessage,
} from '../../api/errors/tax-code-error';
