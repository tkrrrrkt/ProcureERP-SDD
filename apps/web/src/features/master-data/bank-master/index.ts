/**
 * Bank Master Feature Module
 *
 * 銀行マスタ機能のエントリポイント
 */

// Main page component
export { BankMasterPage } from './ui/BankMasterPage';

// Sub-page components
export { BankListPage } from './ui/BankListPage';
export { BankDetailPage } from './ui/BankDetailPage';

// UI components
export { BankList } from './ui/BankList';
export { BankSearchBar } from './ui/BankSearchBar';
export { BankFormDialog } from './ui/BankFormDialog';
export { BranchList } from './ui/BranchList';
export { BranchFormDialog } from './ui/BranchFormDialog';

// API clients
export { HttpBffClient } from './api/HttpBffClient';
export { MockBffClient } from './api/MockBffClient';
export { getBffClient, getSharedBffClient } from './api/client';
export { BffApiError } from './api/BffClient';

// Types (re-exported from contracts)
export type {
  BffClient,
  BankDto,
  BranchDto,
  BankSortBy,
  BranchSortBy,
  SortOrder,
  WarningInfo,
  ListBanksRequest,
  ListBanksResponse,
  GetBankResponse,
  CreateBankRequest,
  CreateBankResponse,
  UpdateBankRequest,
  UpdateBankResponse,
  DeactivateBankRequest,
  DeactivateBankResponse,
  ActivateBankRequest,
  ActivateBankResponse,
  ListBranchesRequest,
  ListBranchesResponse,
  GetBranchResponse,
  CreateBranchRequest,
  CreateBranchResponse,
  UpdateBranchRequest,
  UpdateBranchResponse,
  DeactivateBranchRequest,
  DeactivateBranchResponse,
  ActivateBranchRequest,
  ActivateBranchResponse,
} from './api/BffClient';
