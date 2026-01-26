"use client"

import { useState, Suspense } from "react"
import type { TaxRateDto } from "@/features/master-data/tax-rate/ui/types/bff-contracts"
import { TaxRateList } from "@/features/master-data/tax-rate/ui/components/TaxRateList"
import { TaxRateDialog } from "@/features/master-data/tax-rate/ui/components/TaxRateDialog"
import { Toaster } from "sonner"

function TaxRatePageContent() {
  const [selectedTaxRate, setSelectedTaxRate] = useState<TaxRateDto | undefined>()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleSelectTaxRate = (taxRate: TaxRateDto) => {
    setSelectedTaxRate(taxRate)
    setDialogOpen(true)
  }

  const handleCreateTaxRate = () => {
    setSelectedTaxRate(undefined)
    setDialogOpen(true)
  }

  const handleSuccess = () => {
    setRefreshKey((k) => k + 1)
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <Suspense fallback={<div>Loading...</div>}>
        <TaxRateList
          key={refreshKey}
          onSelectTaxRate={handleSelectTaxRate}
          onCreateTaxRate={handleCreateTaxRate}
        />
      </Suspense>
      <TaxRateDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        taxRate={selectedTaxRate}
        onSuccess={handleSuccess}
      />
      <Toaster />
    </div>
  )
}

export default function TaxRatePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TaxRatePageContent />
    </Suspense>
  )
}
