"use client"

import { useState } from "react"
import type { ItemAttributeDto } from "../types/bff-contracts"
import { ItemAttributeList } from "../components/ItemAttributeList"
import { ItemAttributeDialog } from "../components/ItemAttributeDialog"

export function ItemAttributePage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create")
  const [selectedAttribute, setSelectedAttribute] = useState<ItemAttributeDto | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleCreateAttribute = () => {
    setSelectedAttribute(null)
    setDialogMode("create")
    setDialogOpen(true)
  }

  const handleSelectAttribute = (attribute: ItemAttributeDto) => {
    setSelectedAttribute(attribute)
    setDialogMode("edit")
    setDialogOpen(true)
  }

  const handleSaved = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <ItemAttributeList
        key={refreshKey}
        onCreateAttribute={handleCreateAttribute}
        onSelectAttribute={handleSelectAttribute}
      />

      <ItemAttributeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        attribute={selectedAttribute}
        mode={dialogMode}
        onSaved={handleSaved}
      />
    </div>
  )
}
