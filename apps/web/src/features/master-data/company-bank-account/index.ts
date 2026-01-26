/**
 * Company Bank Account Feature
 *
 * 自社口座マスタ機能のエクスポート
 */

// Main component
export { CompanyBankAccountMasterPage } from './ui/CompanyBankAccountMasterPage';

// Sub-pages
export { CompanyBankAccountListPage } from './ui/CompanyBankAccountListPage';

// Reusable UI components
export { CompanyBankAccountList } from './ui/CompanyBankAccountList';
export { CompanyBankAccountSearchBar } from './ui/CompanyBankAccountSearchBar';
export { CompanyBankAccountFormDialog } from './ui/CompanyBankAccountFormDialog';

// API
export { HttpBffClient } from './api/HttpBffClient';
export { MockBffClient } from './api/MockBffClient';
export { getBffClient, getSharedBffClient } from './api/client';

// Types
export type {
  CompanyBankAccountBffClient,
  BffApiError,
  CompanyBankAccountDto,
  CompanyAccountCategory,
  CompanyAccountType,
  CompanyBankAccountSortBy,
  SortOrder,
  ListCompanyBankAccountsRequest,
  ListCompanyBankAccountsResponse,
  GetCompanyBankAccountResponse,
  CreateCompanyBankAccountRequest,
  CreateCompanyBankAccountResponse,
  UpdateCompanyBankAccountRequest,
  UpdateCompanyBankAccountResponse,
  DeactivateCompanyBankAccountRequest,
  DeactivateCompanyBankAccountResponse,
  ActivateCompanyBankAccountRequest,
  ActivateCompanyBankAccountResponse,
  SetDefaultCompanyBankAccountRequest,
  SetDefaultCompanyBankAccountResponse,
} from './api/BffClient';
