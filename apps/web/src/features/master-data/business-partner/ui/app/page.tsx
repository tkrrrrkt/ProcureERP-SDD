"use client"

import { Suspense, useState } from "react"
import { PartyList } from "../components/PartyList"
import { PartyDialog } from "../components/PartyDialog"
import type { PartyDto } from "../types/bff-contracts"

function PartyListPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedParty, setSelectedParty] = useState<PartyDto | undefined>()
  const [refreshKey, setRefreshKey] = useState(0)

  const handleSelectParty = (party: PartyDto) => {
    setSelectedParty(party)
    setDialogOpen(true)
  }

  const handleCreateParty = () => {
    setSelectedParty(undefined)
    setDialogOpen(true)
  }

  const handleSuccess = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="p-8">
      <PartyList key={refreshKey} onSelectParty={handleSelectParty} onCreateParty={handleCreateParty} />
      <PartyDialog open={dialogOpen} onOpenChange={setDialogOpen} party={selectedParty} onSuccess={handleSuccess} />
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8">読み込み中...</div>}>
      <PartyListPage />
    </Suspense>
  )
}
