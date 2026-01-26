'use client';

import { CompanyBankAccountListPage } from './CompanyBankAccountListPage';

/**
 * Company Bank Account Master Page
 *
 * Root coordinator for the company bank account master feature.
 * Currently just renders the list page, but can be extended to handle
 * routing between list and detail views.
 */
export function CompanyBankAccountMasterPage() {
  return <CompanyBankAccountListPage />;
}
