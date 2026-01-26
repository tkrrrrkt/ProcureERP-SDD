"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { UomList } from "../components/UomList"
import { UomDialog } from "../components/UomDialog"
import type { UomDto } from "../types/bff-contracts"

function UomListPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const groupId = searchParams.get("groupId") || undefined

  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedUom, setSelectedUom] = useState<UomDto | undefined>()
  const [refreshKey, setRefreshKey] = useState(0)

  const handleSelectUom = (uom: UomDto) => {
    setSelectedUom(uom)
    setDialogOpen(true)
  }

  const handleCreateUom = () => {
    setSelectedUom(undefined)
    setDialogOpen(true)
  }

  const handleBack = () => {
    router.push("/master-data/unit-master")
  }

  const handleSuccess = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="p-8">
      <UomList
        key={refreshKey}
        groupId={groupId}
        onSelectUom={handleSelectUom}
        onCreateUom={handleCreateUom}
        onBack={groupId ? handleBack : undefined}
      />
      <UomDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        uom={selectedUom}
        defaultGroupId={groupId}
        onSuccess={handleSuccess}
      />
    </div>
  )
}

export default function UomsPage() {
  return (
    <Suspense fallback={<div className="p-8">読み込み中...</div>}>
      <UomListPage />
    </Suspense>
  )
}
