"use client"

import { Suspense, useState } from "react"
import { useRouter } from "next/navigation"
import { UomGroupList } from "../components/UomGroupList"
import { UomGroupDialog } from "../components/UomGroupDialog"
import type { UomGroupDto } from "../types/bff-contracts"

function UomGroupListPage() {
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<UomGroupDto | undefined>()
  const [refreshKey, setRefreshKey] = useState(0)

  const handleSelectGroup = (group: UomGroupDto) => {
    setSelectedGroup(group)
    setDialogOpen(true)
  }

  const handleCreateGroup = () => {
    setSelectedGroup(undefined)
    setDialogOpen(true)
  }

  const handleNavigateToUoms = (groupId: string) => {
    router.push(`/master-data/unit-master/uoms?groupId=${groupId}`)
  }

  const handleSuccess = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="p-8">
      <UomGroupList
        key={refreshKey}
        onSelectGroup={handleSelectGroup}
        onCreateGroup={handleCreateGroup}
        onNavigateToUoms={handleNavigateToUoms}
      />
      <UomGroupDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        group={selectedGroup}
        onSuccess={handleSuccess}
      />
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8">読み込み中...</div>}>
      <UomGroupListPage />
    </Suspense>
  )
}
