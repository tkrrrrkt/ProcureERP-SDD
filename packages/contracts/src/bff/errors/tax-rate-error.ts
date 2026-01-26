/**
 * BFF Error Contracts: Tax Rate
 *
 * 税率マスタ用エラーコード定義（API エラーを re-export）
 * SSoT: packages/contracts/src/bff/errors/tax-rate-error.ts
 */

// Re-export from API errors (Pass-through policy)
export {
  TAX_RATE_ERROR_CODES,
  type TaxRateErrorCode,
} from '../../api/errors/tax-rate-error';
