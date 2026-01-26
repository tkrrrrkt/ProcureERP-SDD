'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { BankListPage } from './BankListPage';
import { BankDetailPage } from './BankDetailPage';
import { getSharedBffClient } from '../api/client';

// Get singleton BFF client instance
const bffClient = getSharedBffClient();

export function BankMasterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get selected bank from URL
  const selectedBankId = searchParams.get('bankId');

  // Handle bank selection from list
  const handleBankClick = (bankId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('bankId', bankId);
    router.push(`?${params.toString()}`);
  };

  // Handle back to list
  const handleBack = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('bankId');
    router.push(`?${params.toString()}`);
  };

  // Show detail page if a bank is selected
  if (selectedBankId) {
    return (
      <BankDetailPage
        bankId={selectedBankId}
        onBack={handleBack}
        bffClient={bffClient}
      />
    );
  }

  // Show list page by default
  return (
    <BankListPage
      onBankClick={handleBankClick}
      bffClient={bffClient}
    />
  );
}
