import { Suspense } from 'react';
import { CompanyBankAccountMasterPage } from '@/features/master-data/company-bank-account';

function LoadingFallback() {
  return (
    <div className="container mx-auto p-6">
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-muted rounded w-1/3" />
        <div className="h-4 bg-muted rounded w-1/2" />
        <div className="h-64 bg-muted rounded" />
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CompanyBankAccountMasterPage />
    </Suspense>
  );
}
