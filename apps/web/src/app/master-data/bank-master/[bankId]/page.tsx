'use client';

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { BankDetailPage, getSharedBffClient } from '@/features/master-data/bank-master';

const bffClient = getSharedBffClient();

interface PageProps {
  params: Promise<{
    bankId: string;
  }>;
}

function BankDetailPageLoading() {
  return (
    <main className="container mx-auto p-6">
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-muted rounded w-32" />
        <div className="h-48 bg-muted rounded" />
        <div className="h-64 bg-muted rounded" />
      </div>
    </main>
  );
}

function BankDetailContent({ bankId }: { bankId: string }) {
  const router = useRouter();

  const handleBack = () => {
    router.push('/master-data/bank-master');
  };

  return <BankDetailPage bankId={bankId} onBack={handleBack} bffClient={bffClient} />;
}

export default function Page({ params }: PageProps) {
  const { bankId } = use(params);

  return (
    <Suspense fallback={<BankDetailPageLoading />}>
      <BankDetailContent bankId={bankId} />
    </Suspense>
  );
}
