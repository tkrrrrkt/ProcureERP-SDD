"use client"

import { Suspense } from "react"
import { SupplierSitePayeeManagement } from "../../components/SupplierSitePayeeManagement"

function SupplierSitesPage() {
  return (
    <div className="p-8">
      <SupplierSitePayeeManagement />
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8">読み込み中...</div>}>
      <SupplierSitesPage />
    </Suspense>
  )
}
