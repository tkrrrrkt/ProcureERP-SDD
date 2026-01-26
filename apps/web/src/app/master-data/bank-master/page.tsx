import { Suspense } from 'react';
import { BankMasterPage } from '@/features/master-data/bank-master';

function BankMasterPageLoading() {
  return (
    <main className="container mx-auto p-6">
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-muted rounded w-48" />
        <div className="h-64 bg-muted rounded" />
      </div>
    </main>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<BankMasterPageLoading />}>
      <BankMasterPage />
    </Suspense>
  );
}
